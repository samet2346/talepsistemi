from django.apps import AppConfig

class AbuseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # ⚠️ BURASI: settings.py içindeki gibi sadece 'abuse' olmalı
    name = 'abuse' 
    verbose_name = 'Güvenlik ve İstihbarat'

    def ready(self):
        # Sinyalleri çekerken döngüsel import (circular) hatası almamak için 
        # burayı migrasyon bitene kadar yorumda tutabiliriz veya böyle bırakabiliriz
        try:
            import abuse.signals
        except ImportError:
            pass