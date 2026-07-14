from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts' # sys.path ayarımız sayesinde direkt 'accounts' diyebiliyoruz
    verbose_name = 'Kimlik ve Yetkilendirme'

    def ready(self):
        """
        🚀 SENIOR DOKUNUŞ: 
        Sinyalleri buraya bağlıyoruz. Yarın öbür gün bir kullanıcı 
        oluştuğunda tetiklenecek işlemler (hoş geldin maili vb.) 
        buradaki import sayesinde çalışacak.
        """
        import accounts.signals # Henüz oluşturmadık ama altyapı hazır.