from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import MasterProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_master_profile(sender, instance, created, **kwargs):
    """
    Kullanici MASTER rolu ile olusturuldugunda otomatik olarak
    bos bir MasterProfile kaydi acar.
    """
    if instance.role == 'MASTER' and not hasattr(instance, 'master_profile'):
        MasterProfile.objects.get_or_create(
            user=instance,
            defaults={'slug': f'usta-{instance.id}'}
        )