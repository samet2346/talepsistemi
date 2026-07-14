import uuid
import re
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.timezone import now

class UserManager(BaseUserManager):
    def _normalize_phone(self, phone):
        """Merkezi telefon temizleme: Sadece rakamlar ve Türkiye ülke kodu kontrolü."""
        if not phone: return None
        clean_phone = re.sub(r'\D', '', str(phone))
        # 0532... -> 90532... dönüşümü (Sinyör Dokunuşu)
        if len(clean_phone) == 10 and clean_phone.startswith('5'):
            clean_phone = "90" + clean_phone
        elif len(clean_phone) == 11 and clean_phone.startswith('0'):
            clean_phone = "90" + clean_phone[1:]
        return clean_phone

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Telefon numarası zorunludur.")
        
        phone = self._normalize_phone(phone)
        email = extra_fields.get('email')
        if email:
            extra_fields['email'] = self.normalize_email(email).lower()

        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_email_verified', True)
        
        if not extra_fields.get('email'):
            extra_fields['email'] = f"admin_{phone}@ustakapinda.com"
            
        return self.create_user(phone, password, **extra_fields)

class User(AbstractUser, PermissionsMixin):
    # 🛡️ Kimlik ve Güvenlik
    username = None  
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    phone = models.CharField(max_length=20, unique=True, db_index=True, verbose_name="Telefon")
    email = models.EmailField(unique=True, null=True, blank=True, db_index=True, verbose_name="E-posta")
    full_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Ad Soyad")
    
    ROLE_CHOICES = (
    ('ADMIN', 'Yönetici'),
    ('MASTER', 'Usta'),
    ('USER', 'Müşteri'),
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='USER',      # ← varsayılan olarak müşteri
        db_index=True,
        verbose_name="Rol",
    )
# --- P2P USTA ALANLARI ---
    is_provider = models.BooleanField(default=False, verbose_name="Hizmet Sağlayıcı mı?")
    provider_title = models.CharField(max_length=100, null=True, blank=True, verbose_name="Usta Başlığı")
    bio = models.TextField(null=True, blank=True, verbose_name="Hakkımda")
    avatar_url = models.ImageField(upload_to='avatars/', null=True, blank=True)
    certificate_url = models.FileField(upload_to='certificates/', null=True, blank=True, verbose_name="Usta Belgesi")
    work_photos = models.JSONField(default=list, blank=True, verbose_name="İş Fotoğrafları")
    trust_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Güven Skoru")
    is_face_verified = models.BooleanField(default=False, verbose_name="Yüz Doğrulandı mı?")
    weekly_bid_count = models.IntegerField(default=0, verbose_name="Haftalık Teklif Sayısı")
    weekly_bid_reset_at = models.DateTimeField(null=True, blank=True)
    categories = models.JSONField(null=True, blank=True, verbose_name="Uzmanlık Kategorileri")
    locations_served = models.JSONField(null=True, blank=True, verbose_name="Hizmet Bölgeleri")

    # ✅ Durum Bilgileri
    is_approved = models.BooleanField(default=False, db_index=True, verbose_name="Onaylı mı?")
    is_email_verified = models.BooleanField(default=False, db_index=True, verbose_name="E-posta Doğrulandı")
    is_banned = models.BooleanField(default=False, db_index=True, verbose_name="Yasaklı mı?")
    
    # 🔥 Doğrulama & Teknik
    verification_code = models.CharField(max_length=6, blank=True, null=True) 
    verification_code_created_at = models.DateTimeField(null=True, blank=True)
    
    # 🗑️ Soft Delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []
    objects = UserManager()

    # save() ve Meta metotlarını olduğu gibi bırak.

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['phone', 'role', 'is_banned', 'is_deleted']),
        ]

    def save(self, *args, **kwargs):
        if not self.full_name and (self.first_name or self.last_name):
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        elif self.full_name and not self.first_name:
            parts = self.full_name.split(' ', 1)
            self.first_name = parts[0]
            self.last_name = parts[1] if len(parts) > 1 else ""
        super().save(*args, **kwargs)

    def update_trust_score(self):
        from jobs.utils import calculate_trust_score
        self.trust_score = calculate_trust_score(self)
        self.save(update_fields=['trust_score'])

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = now()
        self.is_active = False
        self.save()

    def __str__(self):
        return f"{self.full_name or 'İsimsiz'} ({self.phone})"