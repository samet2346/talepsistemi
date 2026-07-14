from django.apps import AppConfig

class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reviews'
    verbose_name = 'Değerlendirmeler ve Puanlar'

    def ready(self):
        """
        🧠 SİNYAL UYANDIRMA:
        Dükkan açıldığında puan hesaplama motorunu devreye al.
        """
        import reviews.signals