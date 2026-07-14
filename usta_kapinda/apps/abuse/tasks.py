import logging
from celery import shared_task
from celery.schedules import crontab
from django.utils import timezone
from django.db.models import Count
from .models import VelocityLog, IPBlacklist, ShadowBanList, DeviceFingerprint, DeviceUserSession

logger = logging.getLogger("abuse_tasks")

@shared_task(name="apps.abuse.tasks.cleanup_security_logs")
def cleanup_security_logs():
    """
    🧹 GECE SÜPÜRGESİ (V2)
    Role: Süresi dolmuş tüm güvenlik kayıtlarını ve atıl oturumları temizler.
    """
    now = timezone.now()
    
    # ⚠️ FIX 2: VelocityLog temizliği
    deleted_velocity, _ = VelocityLog.objects.filter(expires_at__lt=now).delete()
    
    # ⚠️ FIX 3: Süreli banların temizliği
    deleted_ips, _ = IPBlacklist.objects.filter(expires_at__lt=now).delete()
    deleted_shadows, _ = ShadowBanList.objects.filter(expires_at__lt=now).delete()

    # 30 günlük atıl oturum temizliği
    old_limit = now - timezone.timedelta(days=30)
    deleted_sessions, _ = DeviceUserSession.objects.filter(last_seen__lt=old_limit).delete()

    stats = {
        "velocity": deleted_velocity,
        "ips": deleted_ips,
        "shadows": deleted_shadows,
        "sessions": deleted_sessions
    }
    
    logger.info(f"SECURITY_CLEANUP_COMPLETE: {stats}")
    # ⚠️ FIX 5: String yerine analiz edilebilir dict dönüyoruz
    return {"status": "success", "data": stats}

@shared_task(name="apps.abuse.tasks.analyze_suspicious_patterns")
def analyze_suspicious_patterns():
    """
    🕵️ DERİN ANALİZ (V2 - ⚠️ FIX 1 & 6)
    Role: Çoklu hesap kullanan cihazları tespit eder ve fişler.
    """
    # ⚠️ FIX 6: Aynı cihazda 5+ farklı kullanıcı varsa o cihaz artık şüphelidir
    suspicious_devices = DeviceFingerprint.objects.annotate(
        user_count=Count('sessions')
    ).filter(user_count__gte=5, is_suspicious=False)

    found_count = suspicious_devices.count()
    
    for device in suspicious_devices:
        device.is_suspicious = True
        device.save(update_fields=['is_suspicious'])
        logger.warning(
            f"SUSPICIOUS_DEVICE_DETECTED: Hash: {device.device_hash} | "
            f"Users: {device.user_count} | Action: Marked as suspicious"
        )

    return {
        "status": "analysis_complete",
        "suspicious_devices_flagged": found_count
    }