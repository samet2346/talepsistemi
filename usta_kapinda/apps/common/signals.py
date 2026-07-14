from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import SiteSettings

@receiver(post_migrate)
def create_default_settings(sender, **kwargs):
    if sender.name == 'common' and not SiteSettings.objects.exists():
        SiteSettings.objects.create(site_name="Usta Kapında")