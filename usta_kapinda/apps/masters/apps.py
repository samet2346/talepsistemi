from django.apps import AppConfig

class MastersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # 🛡️ KRİTİK: Name, klasör yapısıyla tam eşleşmeli
    name = 'masters' 
   
    def ready(self):
        """
        🏗️ FAZ 7: Slug/Skor Otomasyonu
        Sistem ayağa kalktığında sinyalleri (signals) bağla.
        """
        try:
            import masters.signals
        except ImportError:
            # Sinyal dosyası henüz yoksa sistemin çökmesini engelle
            pass