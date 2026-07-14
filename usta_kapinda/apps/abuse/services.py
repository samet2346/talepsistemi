import logging
from django.utils import timezone
from django.db import transaction, models
from .models import (
    SpamScore, ShadowBanList, VelocityLog, IPBlacklist, 
    DeviceFingerprint, DeviceUserSession
)
from .utils import AbuseUtils

logger = logging.getLogger("abuse_services")

class AbuseService:
    """
    ⚖️ ULTIMATE ABUSE ENGINE (V4)
    Role: Akıllı Skorlama, Çok Katmanlı Hız Kontrolü ve Dinamik İnfaz.
    """

    @classmethod
    @transaction.atomic
    def process_user_action(cls, request, content=None):
        """🚀 ANA MOTOR: Davranış analizi ve skorlama."""
        user = request.user
        ip = AbuseUtils.get_client_ip(request)
        device_hash = AbuseUtils.generate_device_hash(request)

        # Hız ve Oturum Güncellemeleri
        cls.track_velocity(request, ip, device_hash)
        cls.record_session(request, ip, device_hash)

        if not user.is_authenticated:
            return cls.check_anonymous_risk(ip, device_hash)

        # 1. İçerik Analizi & ⚠️ FIX 1: Yumuşatılmış Skor Artışı
        score_increment, reasons = AbuseUtils.analyze_content(content)
        spam_score_obj, _ = SpamScore.objects.get_or_create(user=user)
        
        if score_increment > 0:
            # Aynı hatayı tekrar ediyorsa cezayı yarıya indir (Islah payı)
            if any(r in spam_score_obj.reasons for r in reasons):
                score_increment //= 2
            
            spam_score_obj.score = min(spam_score_obj.score + score_increment, 100)
            spam_score_obj.reasons = list(set(spam_score_obj.reasons + reasons))
            spam_score_obj.save()

        # 2. İnfaz (80 puan üstü Shadow Ban)
        if spam_score_obj.score >= 80 and not cls.is_user_banned(user):
            cls.apply_enforcement('user', user, f"Sürekli ihlal: {spam_score_obj.score}")

        return spam_score_obj.risk_level

    @classmethod
    def track_velocity(cls, request, ip, device_hash):
        """⚡ FIX 2: Çok Katmanlı Hız Kontrolü."""
        now = timezone.now()
        
        # 1 Dakikalık Sert Limit (Brute-force / Bot)
        v_min, _ = VelocityLog.objects.get_or_create(
            ip_address=ip, endpoint=request.path,
            window_start__gt=now - timezone.timedelta(minutes=1),
            defaults={'device_hash': device_hash}
        )
        VelocityLog.objects.filter(pk=v_min.pk).update(request_count=models.F('request_count') + 1)
        
        if v_min.request_count >= 100:
            cls.apply_enforcement('ip', ip, "DDoS / Rate Limit (1min)", hard_block=True)

        # 1 Saatlik Yumuşak Limit (Veri Madenciliği / Kazıma)
        v_hour, _ = VelocityLog.objects.get_or_create(
            ip_address=ip, endpoint="global_hour_limit",
            window_start__gt=now - timezone.timedelta(hours=1),
            defaults={'device_hash': device_hash}
        )
        VelocityLog.objects.filter(pk=v_hour.pk).update(request_count=models.F('request_count') + 1)

        if v_hour.request_count >= 500:
            cls.apply_enforcement('ip', ip, "Aggressive Scraping (1hour)")

    @classmethod
    def record_session(cls, request, ip, device_hash):
        """🔗 FIX 4: Device Last Seen Güncelleme."""
        device, created = DeviceFingerprint.objects.get_or_create(
            device_hash=device_hash,
            defaults={'user_agent': request.META.get('HTTP_USER_AGENT', '')}
        )
        if not created:
            device.last_seen = timezone.now()
            device.save(update_fields=['last_seen'])

        if request.user.is_authenticated:
            DeviceUserSession.objects.update_or_create(
                device=device, user=request.user,
                defaults={'ip_address': ip, 'last_seen': timezone.now()}
            )

    @staticmethod
    def apply_enforcement(target_type, target_val, reason, hard_block=False):
        """🎯 FIX 3 & 5: IPBlacklist ve Severity Entegrasyonu."""
        expires = timezone.now() + timezone.timedelta(days=7)
        severity = 5 if target_type == 'user' else 3

        # Shadow Ban Kaydı
        ShadowBanList.objects.update_or_create(
            target_type=target_type,
            user=target_val if target_type == 'user' else None,
            target_ip=target_val if target_type == 'ip' else None,
            target_device=target_val if target_type == 'device' else None,
            defaults={'reason': reason, 'expires_at': expires, 'severity': severity}
        )

        # ⚠️ FIX 3: Kritik durumlarda IPBlacklist'e de mühürle
        if hard_block and target_type == 'ip':
            IPBlacklist.objects.get_or_create(
                ip_address=target_val,
                defaults={'reason': reason, 'expires_at': expires}
            )

    @classmethod
    def check_anonymous_risk(cls, ip, device_hash):
        """🛑 Kapıdaki kontrol."""
        if IPBlacklist.objects.filter(ip_address=ip, expires_at__gt=timezone.now()).exists():
            return "BLOCK"
        
        if ShadowBanList.active().filter(models.Q(target_ip=ip) | models.Q(target_device=device_hash)).exists():
            return "SHADOW"
            
        return "PASS"