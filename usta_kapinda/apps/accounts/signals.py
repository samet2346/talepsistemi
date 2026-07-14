import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=User)
def log_new_user(sender, instance, created, **kwargs):
    if created:
        logger.info("Yeni kullanıcı oluşturuldu: id=%s phone=%s", instance.id, instance.phone)
