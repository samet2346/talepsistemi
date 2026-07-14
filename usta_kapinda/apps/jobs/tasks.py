import logging
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from django.db import transaction, models
from django.utils import timezone
from django.core.cache import cache

from .models import Job, MasterNotificationLog
from apps.notifications.services import PushNotificationService 

logger = logging.getLogger("broadcast_orchestrator")

class BroadcastHelper:
    """🛠️ BROADCAST YARDIMCI ARAÇLARI"""
    
    @staticmethod
    def get_retry_countdown(retries):
        """
        🔄 FIX 1: Static metod düzeltildi.
        Exponential Backoff: 60s, 120s, 240s, 480s...
        """
        return 60 * (2 ** retries)

    @staticmethod
    def check_and_incr_rate_limit(master_id, limit=20):
        """
        🛡️ FIX 2 & 3: Cache Key & Expire Kontrolü.
        Sliding window yerine basit 24 saatlik kilit.
        """
        key = f"rate_limit:notify:{master_id}"
        # get_or_set yerine daha performanslı olan setnx mantığı:
        count = cache.get(key)
        if count is None:
            cache.set(key, 1, 86400) # İlk girişte 24 saatlik ömür
            return True
        
        if count < limit:
            cache.incr(key)
            return True
        return False

    @staticmethod
    def handle_dead_letter(task_name, exc, args):
        """💀 DEAD LETTER QUEUE (DLQ) & ALERT"""
        logger.critical(
            f"DLQ_ALERT: Task {task_name} failed. | Error: {exc} | Args: {args}"
        )

@shared_task(
    bind=True, 
    queue='broadcast_priority', 
    max_retries=5,
    name="apps.jobs.tasks.broadcast_job_orchestrator"
)
def broadcast_job_orchestrator(self, job_id, wave_plan):
    try:
        job = Job.objects.select_related('category').get(id=job_id)
        
        if job.status not in ['pending', 'offer_received']:
            return {"status": "skipped", "reason": "job_completed"}

        # 🌊 WAVE 1: VIP
        wave_1_ids = wave_plan.get('wave_1', [])
        if wave_1_ids:
            dispatch_notifications.delay(job_id, wave_1_ids, wave_no=1)

        # 🌊 WAVE 2: Planlama
        wave_2_ids = wave_plan.get('wave_2', [])
        if wave_2_ids:
            interval = 300 if getattr(job.category, 'is_urgent', False) else 900
            dispatch_notifications.apply_async(
                args=[job_id, wave_2_ids, 2], 
                countdown=interval
            )

        # 🌍 SAFE EXPANSION
        if wave_plan.get('expansion_required') and not job.metadata.get('expanded'):
            trigger_expansion_wave.apply_async(
                args=[job_id, wave_plan.get('suggested_radius', 10)], 
                countdown=interval * 2
            )

    except Exception as exc:
        countdown = BroadcastHelper.get_retry_countdown(self.request.retries)
        try:
            raise self.retry(exc=exc, countdown=countdown)
        except MaxRetriesExceededError:
            BroadcastHelper.handle_dead_letter(self.name, exc, [job_id])

@shared_task(
    bind=True,
    queue='realtime_notifications',
    max_retries=3,
    name="apps.jobs.tasks.dispatch_notifications"
)
def dispatch_notifications(self, job_id, master_ids, wave_no):
    """
    ⚡ REAL-TIME DISPATCHER
    """
    try:
        # 🛡️ FIX 2 & 3: Rate Limit Uygulandı
        valid_ids = [
            m_id for m_id in master_ids 
            if BroadcastHelper.check_and_incr_rate_limit(m_id)
        ]
        
        if not valid_ids: return {"status": "filtered_all"}

        # 📝 AUDIT LOG (Bulk)
        with transaction.atomic():
            logs = [
                MasterNotificationLog(job_id=job_id, master_id=m_id, wave_no=wave_no) 
                for m_id in valid_ids
            ]
            MasterNotificationLog.objects.bulk_create(logs)

        # 🚀 OUTBOUND: Push Service (⚠️ FIX 4: Aktif import kullanıldı)
        PushNotificationService.send_bulk_push(
            master_ids=valid_ids,
            title="Yeni İş Fırsatı!",
            body="Hemen teklif ver."
        )

    except Exception as exc:
        countdown = BroadcastHelper.get_retry_countdown(self.request.retries)
        raise self.retry(exc=exc, countdown=countdown)

@shared_task(queue='broadcast_low_priority')
def trigger_expansion_wave(job_id, new_radius):
    """🌍 GENİŞLEME: Metadata ile döngü kırıcı."""
    job = Job.objects.get(id=job_id)
    if job.metadata.get('expanded'): return
    
    with transaction.atomic():
        job.metadata['expanded'] = True
        job.save(update_fields=['metadata'])
        
        from .orchestrators import JobCreationOrchestrator
        JobCreationOrchestrator.recalculate_with_radius(job_id, new_radius)