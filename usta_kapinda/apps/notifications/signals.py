import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from jobs.models import JobOffer, Job
from .models import Notification

User = get_user_model()
logger = logging.getLogger(__name__)

# =====================================================================
# 1. SİNYAL: USTA TEKLİF VERİNCE MÜŞTERİYE BİLDİRİM GİTMEK (Mevcut Kodun)
# =====================================================================
@receiver(post_save, sender=JobOffer)
def handle_new_offer_notification(sender, instance, created, **kwargs):
    if created:
        try:
            Notification.objects.create(
                recipient=instance.job.owner,
                sender=instance.master.user,
                notification_type=Notification.NotificationType.OFFER,
                title="Yeni Teklif Alındı!",
                body=f"{instance.master.full_name} usta işiniz için {instance.price} TL teklif verdi.",
                data={
                    "job_id": instance.job.id,
                    "offer_id": instance.id,
                    "master_name": instance.master.full_name,
                    "action_url": f"/jobs/{instance.job.id}/offers"
                }
            )
            logger.info(f"Teklif bildirimi gönderildi: Offer ID {instance.id} -> Owner ID {instance.job.owner.id}")
        except Exception as e:
            logger.error(f"Teklif bildirimi gönderilirken hata oluştu: {str(e)}")


# =====================================================================
# 2. SİNYAL: MÜŞTERİ TALEP AÇINCA UYGUN USTALARA BİLDİRİM GİTMEK (YENİ)
# =====================================================================
@receiver(post_save, sender=Job)
def handle_new_job_notification(sender, instance, created, **kwargs):
    """
    Müşteri yeni bir iş (Job) açtığı an, o kategorideki 
    ve senin mülakatından geçmiş (is_active=True) tüm ustalara 
    PostgreSQL Array/JSON field yapısına uygun şekilde bildirim uçurur.
    """
    # 🚀 .lower() ile 'pending' / 'PENDING' uyuşmazlığını tamamen eziyoruz usta
    current_status = getattr(instance, 'status', 'pending').lower()
    
    if created and current_status == 'pending':
        try:
            # 🚀 Shell'de doğruladığımız o nokta atışı filtreleme kalıbı:
            matching_masters = User.objects.filter(
                is_provider=True,
                is_active=True,
                categories__contains=[instance.category.id]  # Liste içinde tam eşleşme arıyoruz
            ).exclude(id=instance.owner.id).distinct()

            # NotificationType içinde NEW_JOB varsa al, yoksa düz string kullan usta
            notification_type = getattr(Notification.NotificationType, 'NEW_JOB', 'NEW_JOB')
            notifications_to_create = []
            
            for master in matching_masters:
                notifications_to_create.append(
                    Notification(
                        recipient=master,
                        sender=instance.owner,
                        notification_type=notification_type,
                        title="Yakınında Yeni Bir İş Var! 🛠️",
                        # Kategorinin name alanını jilet gibi çekiyoruz:
                        body=f"'{instance.category.name}' kategorisinde yeni bir talep açıldı: {instance.title}",
                        data={
                            "job_id": instance.id,
                            "category_id": instance.category.id,
                            "action_url": f"/usta/ilanlar/{instance.id}"
                        },
                        is_read=False
                    )
                )
            
            # Toplu kayıt ile sunucuyu yormadan tek seferde veritabanına çakıyoruz
            if notifications_to_create:
                Notification.objects.bulk_create(notifications_to_create)
                logger.info(f"[BİLDİRİM BAŞARI] Yeni iş {len(notifications_to_create)} ustanın paneline fırlatıldı. Job ID: {instance.id}")
            else:
                logger.warning(f"[BİLDİRİM UYARI] İş açıldı (Job ID: {instance.id}) ama bu kategoriye uygun aktif usta bulunamadı.")

        except Exception as e:
            logger.error(f"[BİLDİRİM KARTAL HATASI] Dağıtım esnasında patladık: {str(e)}")