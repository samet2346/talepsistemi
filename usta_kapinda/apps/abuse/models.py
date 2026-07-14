from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class DeviceFingerprint(models.Model):
    """📱 CİHAZ DNA BANKASI"""
    device_hash = models.CharField(max_length=64, unique=True, db_index=True)
    user_agent = models.TextField()
    platform = models.CharField(max_length=50, blank=True, null=True)
    is_suspicious = models.BooleanField(default=False)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cihaz Parmak İzi"
        verbose_name_plural = "Cihaz Parmak İzleri"

    def __str__(self):
        return f"Device {self.device_hash[:12]}"


class DeviceUserSession(models.Model):
    """🔗 CİHAZ-KULLANICI EŞLEŞMESİ"""
    device = models.ForeignKey(DeviceFingerprint, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_sessions')
    ip_address = models.GenericIPAddressField()
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('device', 'user')
        verbose_name = "Cihaz Oturumu"
        verbose_name_plural = "Cihaz Oturumları"


class VelocityLog(models.Model):
    """⚡ HIZ KONTROL RADARI"""
    ip_address = models.GenericIPAddressField(db_index=True)
    device_hash = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    endpoint = models.CharField(max_length=255)
    request_count = models.IntegerField(default=1)
    window_start = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True, null=True, blank=True)

    class Meta:
        verbose_name = "Hız Logu"
        verbose_name_plural = "Hız Logları"


class SpamScore(models.Model):
    """📊 KULLANICI SİCİL DOSYASI"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='spam_score')
    score = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    reasons = models.JSONField(default=list)
    last_updated = models.DateTimeField(auto_now=True)

    @property
    def risk_level(self):
        if self.score >= 80: return "HIGH"
        if self.score >= 50: return "MEDIUM"
        return "LOW"

    class Meta:
        verbose_name = "Spam Skoru"
        verbose_name_plural = "Spam Skorları"


class ShadowBanList(models.Model):
    """🔨 İNFAZ LİSTESİ (Gölge Yasaklılar)"""
    TARGET_TYPES = [
        ('user', 'User'),
        ('ip', 'IP Address'),
        ('device', 'Device Hash'),
    ]
    target_type = models.CharField(max_length=10, choices=TARGET_TYPES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    target_ip = models.GenericIPAddressField(null=True, blank=True)
    target_device = models.CharField(max_length=64, null=True, blank=True)
    
    reason = models.TextField()
    severity = models.IntegerField(default=1)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Gölge Yasak"
        verbose_name_plural = "Gölge Yasaklar"

    @classmethod
    def active(cls):
        return cls.objects.filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=timezone.now())
        )


class AbuseReport(models.Model):
    """📝 İHBAR TUTANAKLARI"""
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_sent')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    job = models.ForeignKey('jobs.Job', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Kötüye Kullanım Raporu"
        verbose_name_plural = "Kötüye Kullanım Raporları"


class IPBlacklist(models.Model):
    """🚫 KARA LİSTE (Hard Block)"""
    ip_address = models.GenericIPAddressField(unique=True)
    reason = models.TextField()
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "IP Kara Liste"
        verbose_name_plural = "IP Kara Liste"


class UserLoginHistory(models.Model):
    """🔐 GİRİŞ GEÇMİŞİ (Sinyaller için lazım)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Giriş Geçmişi"
        verbose_name_plural = "Giriş Geçmişleri"