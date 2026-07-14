from django.apps import AppConfig

class AuditConfig(AppConfig):
    name = 'audit'
    verbose_name = 'Denetim Sistemi'

    def ready(self):
        #import audit.signals # Sinyalleri uyandır
        pass