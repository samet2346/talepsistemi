from django.db import models
from django.utils.text import slugify

class City(models.Model):
    """Sistemin yayılacağı ana şehirler (İstanbul, Ankara vb.)"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Şehir"
        verbose_name_plural = "Şehirler"

    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.name.replace('ı', 'i'))
        super().save(*args, **kwargs)

    def __str__(self): return self.name

class District(models.Model):
    """
    İlçe Modeli - Gelişmiş Versiyon
    - Harita desteği için Lat/Lng eklendi.
    - SEO Meta verileri eklendi.
    """
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    
    # 🗺️ HARİTA DESTEĞİ (Frontend'de ustanın yerini haritada patlatmak için)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # 🔍 SEO & UX
    seo_title = models.CharField(max_length=200, blank=True, help_text="Google başlığı")
    seo_description = models.TextField(blank=True, help_text="Google açıklaması")
    icon = models.ImageField(upload_to='locations/icons/', null=True, blank=True)
    
    # 📈 İSTATİSTİK
    master_count = models.PositiveIntegerField(default=0, help_text="Bu bölgedeki usta sayısı")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('city', 'name')
        verbose_name = "İlçe"
        verbose_name_plural = "İlçeler"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.city.name}-{self.name}".replace('ı', 'i'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.city.name} - {self.name}"

