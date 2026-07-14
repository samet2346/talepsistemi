from django.apps import AppConfig

class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    
    # 🛡️ KRİTİK: sys.path ayarın sayesinde sadece 'jobs'
    name = 'jobs'
    verbose_name = 'İş ve Teklif Yönetimi'

    def ready(self):
        """
        🚀 Marketplace Motorunu Ateşle!
        Teklif skorlama ve 5 teklif sınırı kontrollerini yapan 
        sinyalleri burada sisteme bağlıyoruz.
        """
        import jobs.signals