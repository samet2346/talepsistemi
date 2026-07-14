from django.db import models

class SiteSettings(models.Model):
    """🏠 Dükkanın Genel Ayarları"""
    site_name = models.CharField(max_length=100, default="Usta Kapında")
    maintenance_mode = models.BooleanField(default=False)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="Yüzde olarak komisyon oranı")
    support_email = models.EmailField(default="destek@ustakapinda.com")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Ayarı"
        verbose_name_plural = "Site Ayarları"

    def __str__(self):
        return f"{self.site_name} Ayarları"

    def save(self, *args, **kwargs):
        # Sadece tek bir ayar satırı olmasını garanti ediyoruz (Singleton)
        if not self.pk and SiteSettings.objects.exists():
            return
        super().save(*args, **kwargs)