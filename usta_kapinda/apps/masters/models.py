import os
import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.files import File
from PIL import Image
from io import BytesIO

# 🛡️ Dış Modüller
from services.models import Category
from locations.models import District
from common.validators import validate_image_size, validate_image_extension

def master_file_path(instance, filename):
    """🛠️ UUID Filename Generation - Klasörleme mantığı"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    if isinstance(instance, MasterProfile):
        return os.path.join('masters/profiles/', filename)
    return os.path.join('masters/portfolio/', filename)

class MasterProfile(models.Model):
    """🏗️ MASTER MODÜLÜ (SaaS Core)"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='master_profile'
    )
    # business_name: Ustanın dükkan adı veya profesyonel ünvanı
    business_name = models.CharField(max_length=150, verbose_name="İşletme/Dükkan Adı", null=True, blank=True)
    slug = models.SlugField(unique=True, db_index=True, max_length=200, blank=True)
    
    # 🖼️ Profile Photo + Validators
    profile_photo = models.ImageField(
        upload_to=master_file_path, 
        null=True, 
        blank=True,
        validators=[validate_image_size, validate_image_extension]
    )
    
    bio = models.TextField(max_length=500, verbose_name="Kısa Tanıtım", null=True, blank=True)
    
    # 🛠️ Branş ve Bölge (Planındaki FK yapısı: Tekli seçim, mermi gibi hızlı)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='masters', null=True)
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='masters', null=True)

    experience_year = models.PositiveIntegerField(default=0, verbose_name="Deneyim Yılı")
    rating = models.FloatField(
        default=5.0, 
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]
    )
    
    # İstatistikler
    total_jobs = models.PositiveIntegerField(default=0)
    completed_jobs = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🔥 %60 PROFİL BARAJI MOTORU
    @property
    def completion_score(self):
        """Profil doluluk oranını hesaplar (Her biri %20)"""
        score = 0
        if self.business_name: score += 20
        if self.profile_photo: score += 20
        if self.bio and len(self.bio) > 30: score += 20
        if self.category: score += 20
        if self.district: score += 20
        return score

    @property
    def can_bid(self):
        """Usta teklif verebilir mi? (%60 Barajı)"""
        return self.completion_score >= 60

    @property
    def success_rate(self):
        if self.total_jobs == 0: return 100.0
        return round((self.completed_jobs / self.total_jobs) * 100, 2)

    class Meta:
        verbose_name = "Usta Profili"
        verbose_name_plural = "Usta Profilleri"
        ordering = ['sort_order', '-rating', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['category', 'district']), # 🚀 Arama performansı için
        ]

    def __str__(self):
        return f"{self.business_name or self.user.full_name} ({self.rating})"

    def compress_image(self, image_field):
        """Pillow: Sıkıştırma Motoru"""
        img = Image.open(image_field)
        if img.mode in ("RGBA", "P"): img = img.convert("RGB")
        img.thumbnail((1200, 1200), Image.LANCZOS)
        output_handle = BytesIO()
        img.save(output_handle, format='JPEG', quality=75)
        output_handle.seek(0)
        return File(output_handle, name=os.path.basename(image_field.name))

    def save(self, *args, **kwargs):
        # 1. Resim Sıkıştırma
        if self.profile_photo and hasattr(self.profile_photo, 'file'):
             try: self.profile_photo = self.compress_image(self.profile_photo)
             except: pass

        # 2. Business Name boşsa User'dan çek
        if not self.business_name and self.user.full_name:
            self.business_name = self.user.full_name

        # 3. Slug Otomasyonu
        if not self.slug:
            self.slug = self._generate_unique_slug()
        
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        target_name = self.business_name or self.user.full_name or "usta"
        base_slug = slugify(target_name)
        slug = base_slug
        num = 1
        while MasterProfile.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{num}'
            num += 1
        return slug

class MasterWorkImage(models.Model):
    """Ustanın Portfolyo Galerisi"""
    master = models.ForeignKey(MasterProfile, on_delete=models.CASCADE, related_name='portfolio')
    image = models.ImageField(upload_to=master_file_path, validators=[validate_image_size, validate_image_extension])
    caption = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if self.image and hasattr(self.image, 'file'):
            try: self.image = self.master.compress_image(self.image)
            except: pass
        super().save(*args, **kwargs)