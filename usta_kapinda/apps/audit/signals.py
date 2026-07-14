import json
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import AuditLog
from .middleware import get_current_user, get_current_ip
@receiver(pre_save)
def audit_pre_save(sender, instance, **kwargs):
    """Güncelleme öncesi eski veriyi yakalar"""
    if sender == AuditLog or not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
        instance._old_values = model_to_dict(old_instance)
    except sender.DoesNotExist:
        instance._old_values = {}

@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):
    if sender == AuditLog:
        return

    action = 'CREATE' if created else 'UPDATE'
    changes = {}

    if not created and hasattr(instance, '_old_values'):
        new_values = model_to_dict(instance)
        # Sadece değişen alanları JSON'a yaz (Senior veritabanını şişirmez)
        for field, value in new_values.items():
            old_val = instance._old_values.get(field)
            if old_val != value:
                # JSON serializable kontrolü (basit versiyon)
                changes[field] = {'old': str(old_val), 'new': str(value)}

    if action == 'CREATE' or changes:
        AuditLog.objects.create(
            user=get_current_user(),
            model_name=sender.__name__,
            object_id=str(instance.pk),
            object_repr=str(instance)[:255],
            action=action,
            changes=changes,
            ip_address=get_current_ip()
        )