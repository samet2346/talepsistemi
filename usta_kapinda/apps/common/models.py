from django.db import models

class SiteSettings(models.Model):
    """🏠 Singleton: Veritabanında sadece 1 satır olabilir."""
    site_name = models.CharField(max_length=100, default="Usta Kapında")
    maintenance_mode = models.BooleanField(default=False, verbose_name="Bakım Modu")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    support_email = models.EmailField(default="destek@ustakapinda.com")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Ayarı"
        verbose_name_plural = "Site Ayarları"

    def save(self, *args, **kwargs):
        if not self.pk and SiteSettings.objects.exists():
            return
        super().save(*args, **kwargs)

    def __str__(self):
        return self.site_name