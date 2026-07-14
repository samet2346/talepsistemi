import logging
import json
from django.db import transaction, models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from .models import Job, JobOffer, JobStatusLog, Profile

logger = logging.getLogger("jobs_audit")

class JobService:
    """
    🏭 SOVEREIGN JOB SERVICE - FINAL PRODUCTION VERSION
    """

    # --- CENTRALIZED STATE MACHINE ---
    ALLOWED_TRANSITIONS = {
        Job.Status.PENDING: [Job.Status.OFFER_RECEIVED, Job.Status.CANCELLED, 'system_error'],
        Job.Status.OFFER_RECEIVED: [Job.Status.MATCHED, Job.Status.CANCELLED, 'system_error'],
        Job.Status.MATCHED: [Job.Status.ON_WAY, Job.Status.CANCELLED, 'system_error'],
        Job.Status.ON_WAY: [Job.Status.COMPLETED, Job.Status.CANCELLED, 'system_error'],
        'shadow_review': [Job.Status.PENDING, Job.Status.CANCELLED, 'system_error'],
        'system_error': [] 
    }

    @staticmethod
    @transaction.atomic
    def create_initial_record(user, data: dict, risk_score: int, strategy: str) -> Job:
        expiry_hours = getattr(settings, 'JOB_EXPIRY_HOURS', 24)
        initial_status = Job.Status.PENDING if strategy != 'SHADOW_PUBLISH' else 'shadow_review'

        job = Job.objects.create(
            owner=user,
            category=data['category'],
            district=data['district'],
            title=data['title'],
            description=data['description'],
            budget_min=data.get('budget_min'),
            budget_max=data.get('budget_max'),
            status=initial_status,
            risk_score=risk_score,
            publish_strategy=strategy,
            expires_at=timezone.now() + timezone.timedelta(hours=expiry_hours)
        )

        # ✅ FIX: Profile referansı ve Atomic Increment
        Profile.objects.filter(user=user).update(total_job_count=models.F('total_job_count') + 1)
        
        JobService._log_status_change(job, 'NONE', initial_status, user, "Initial Creation")
        return job

    @staticmethod
    @transaction.atomic
    def accept_offer(job_id, offer_id, user):
        job = Job.objects.select_for_update().get(id=job_id)
        
        if job.owner_id != user.pk:
            raise ValidationError("Bu işlem için yetkiniz yok.")
        if job.status not in [Job.Status.PENDING, Job.Status.OFFER_RECEIVED]:
            raise ValidationError(f"İş durumu uygun değil: {job.status}")

        # ✅ FIX: Deadlock riskini azaltmak için offer'da select_for_update kaldırıldı
        # Zira zaten Job lock'lı ve bu offer bu job'a ait.
        try:
            target_offer = job.offers.get(id=offer_id)
        except JobOffer.DoesNotExist:
            raise ValidationError("Teklif bulunamadı.")

        old_status = job.status
        target_offer.is_accepted = True
        target_offer.save(update_fields=['is_accepted'])

        # ✅ FIX: Bulk update yerine tekil save (Sinyalleri/Bildirimleri tetiklemek için)
        # Eğer çok fazla teklif (100+) varsa burası Celery task'e devredilmeli.
        rejected_offers = job.offers.exclude(id=offer_id)
        for off in rejected_offers:
            off.is_accepted = False
            off.save(update_fields=['is_accepted']) # Sinyal tetiklenir: "Teklifiniz reddedildi"

        job.assigned_master = target_offer.master
        job.status = Job.Status.MATCHED
        job.save(update_fields=['assigned_master', 'status', 'updated_at'])

        # ✅ MASTER STATISTICS: İş atandığında sayaç artar
        target_offer.master.__class__.objects.filter(id=target_offer.master.id).update(
            total_jobs_assigned=models.F('total_jobs_assigned') + 1
        )

        JobService._log_status_change(job, old_status, job.status, user, f"Offer {offer_id} accepted.")
        JobService._invalidate_job_caches(job)
        return job

    @staticmethod
    @transaction.atomic
    def update_job_status(job_id, new_status, user, reason=None):
        job = Job.objects.select_for_update().get(id=job_id)
        old_status = job.status

        # 1. Transition Validation
        if new_status not in JobService.ALLOWED_TRANSITIONS.get(old_status, []):
            if new_status == 'system_error' and not (user.is_staff or user.is_system): # is_system kurgusu
                 raise ValidationError("Kritik hata statüsü manuel verilemez.")
            elif new_status != 'system_error':
                raise ValidationError(f"Geçersiz geçiş: {old_status} -> {new_status}")

        # 2. Role-Based Access Control
        is_owner = job.owner_id == user.pk
        is_master = job.assigned_master and job.assigned_master.user == user
        is_staff = user.is_staff

        # ✅ FIX: Shadow review sadece admin/staff tarafından onaylanabilir
        if old_status == 'shadow_review' and not is_staff:
            raise ValidationError("Shadow review onayı sadece moderatör tarafından yapılabilir.")

        if new_status == Job.Status.CANCELLED and not is_owner:
            raise ValidationError("Sadece müşteri iptal edebilir.")
            
        # ✅ FIX: Completed kontrolü (Sadece usta veya zorunlu hallerde admin)
        if new_status == Job.Status.COMPLETED and not (is_master or is_staff):
            raise ValidationError("İşi sadece usta tamamlayabilir.")

        # 3. Update logic
        job.status = new_status
        update_fields = ['status', 'updated_at']

        if new_status == Job.Status.COMPLETED:
            job.completed_at = timezone.now()
            update_fields.append('completed_at')
            # Atomik istatistik güncelleme
            job.assigned_master.__class__.objects.filter(id=job.assigned_master.id).update(
                completed_jobs_count=models.F('completed_jobs_count') + 1
            )
        
        job.save(update_fields=update_fields)
        JobService._log_status_change(job, old_status, new_status, user, reason)
        JobService._invalidate_job_caches(job)
        return job

    @staticmethod
    def _invalidate_job_caches(job):
        """✅ FIX: Cache Invalidation (Placeholder - Cache Service'e bağlanmalı)"""
        from django.core.cache import cache
        cache.delete(f"job_detail_{job.id}")
        cache.delete(f"user_active_jobs_{job.owner_id}")

    @staticmethod
    def _log_status_change(job, from_s, to_s, user, reason):
        JobStatusLog.objects.create(
            job=job, from_status=from_s, to_status=to_s, 
            reason=reason, triggered_by=user
        )
        logger.info(json.dumps({
            "job": str(job.id), "from": str(from_s), "to": str(to_s), 
            "user": str(user.id), "ts": timezone.now().isoformat()
        }))