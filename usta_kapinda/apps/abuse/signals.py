import logging
from django.db.models.signals import post_save
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .services import AbuseService
from .utils import AbuseUtils  # ⚠️ EKLENDİ
from .models import UserLoginHistory, SpamScore

User = get_user_model()
logger = logging.getLogger("abuse_signals")

@receiver(post_save, sender=User)
def create_user_spam_score(sender, instance, created, **kwargs):
    if created:
        SpamScore.objects.get_or_create(user=instance)
        logger.info(f"SIGNAL: Initial SpamScore created for user {instance.username}")

@receiver(user_logged_in)
def track_login_success(sender, request, user, **kwargs):
    ip = AbuseUtils.get_client_ip(request)
    device_hash = AbuseUtils.generate_device_hash(request)
    
    AbuseService.record_session(request, ip, device_hash)
    
    UserLoginHistory.objects.create(
        user=user,
        ip_address=ip,
        success=True
    )
    logger.info(f"SIGNAL: Login success tracked for {user.username}")

@receiver(user_login_failed)
def track_login_failure(sender, credentials, request, **kwargs):
    ip = AbuseUtils.get_client_ip(request)
    device_hash = AbuseUtils.generate_device_hash(request)
    username = credentials.get('username', 'unknown')
    
    UserLoginHistory.objects.create(
        user=None,
        ip_address=ip,
        success=False
    )
    
    AbuseService.track_velocity(request, ip, device_hash)
    logger.warning(f"SIGNAL: Login failure for '{username}' from IP {ip}")