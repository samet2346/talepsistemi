from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    """
    🏗️ HİZMET MOTORU (SENIOR)
    - Recursive (self-referencing) yapı ile sonsuz alt kategori desteği.
    """
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name="Üst Kategori"
    )
    name = models.CharField(max_length=100, unique=True, verbose_name="Kategori Adı")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    
    # Senior Dokunuş: Frontend'de Lucide-react ikonlarını dinamik basmak için
    icon_name = models.CharField(
        max_length=50, 
        null=True, 
        blank=True, 
        help_text="Örn: 'hammer', 'paint-bucket', 'zap'",
        verbose_name="İkon Adı"
    )
    
    description = models.TextField(blank=True, verbose_name="Kategori Açıklaması")
    is_active = models.BooleanField(default=True, verbose_name="Aktif mi?")
    order = models.PositiveIntegerField(default=0, verbose_name="Sıralama")

    class Meta:
        app_label = 'services'
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            # Sinyor tip: slugify her zaman yetmez, manuel temizlik iyidir
            self.slug = slugify(self.name.replace('ı', 'i').replace('İ', 'i'))
        super().save(*args, **kwargs)

    @property
    def get_full_path(self):
        """Next.js Breadcrumb'ları için tam yol döner"""
        if self.parent:
            return f"{self.parent.get_full_path} > {self.name}"
        return self.name

    def __str__(self):
        return self.get_full_path