import hashlib
import re
import logging
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger("abuse_utils")

# 🤬 FIX 1: Modül seviyesinde sabit tanımlama (Performans için)
# Gerçek hayatta bu liste veritabanından veya Redis'ten çekilmeli
BAD_WORDS_PATTERN = re.compile(r'\b(argo1|küfür2|hakaret3)\b', re.IGNORECASE)

# 📱 FIX 2: Türkiye Formatına Uygun Telefon Regex (False Positive Önleyici)
# 05xx, 5xx, +905xx gibi formatları yakalar
PHONE_PATTERN = re.compile(r'(\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}')

class AbuseUtils:
    """
    🛠️ HARDENED ABUSE UTILITIES
    Role: Precision Analysis & Intelligence Gathering.
    """

    @staticmethod
    def get_client_ip(request):
        """Proxy/Cloudflare arkasındaki gerçek IP'yi cımbızla çeker."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def generate_device_hash(request):
        """
        🆔 FIX 3: Deep Fingerprinting
        Sadece UA değil, platform ve frontend'den gelen teknik detaylarla mühürler.
        """
        ua = request.META.get('HTTP_USER_AGENT', 'unknown')
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'unknown')
        enc = request.META.get('HTTP_ACCEPT_ENCODING', 'unknown')
        plat = request.headers.get('Sec-Ch-Ua-Platform', 'unknown')
        
        # Frontend'den gelecek özel headerlar (Next.js tarafında set edeceğiz)
        res = request.headers.get('X-Screen-Resolution', 'unknown')
        tz = request.headers.get('X-Timezone', 'unknown')

        dna_chain = f"{ua}|{lang}|{enc}|{plat}|{res}|{tz}"
        return hashlib.sha256(dna_chain.encode()).hexdigest()

    @staticmethod
    def is_suspicious_ip(ip):
        """
        🌐 FIX 4: VPN/Tor/Proxy Radar
        IP'nin şüpheli olup olmadığını (Cache üzerinden) kontrol eder.
        """
        is_bad = cache.get(f"bad_ip_{ip}")
        if is_bad:
            return True
        # Buraya yarın bir gün IP-API veya IPIP gibi servisler entegre edilebilir
        return False

    @staticmethod
    def analyze_content(text):
        """
        🕵️ FIX 5: Zenginleştirilmiş Skorlama
        Küfür, telefon, URL ve anormal karakter yoğunluğu ölçer.
        """
        if not text: return 0, []
        
        score = 0
        reasons = []

        # 1. Küfür Kontrolü
        if BAD_WORDS_PATTERN.search(text):
            score += 50
            reasons.append("Profanity detected")

        # 2. Telefon Sızdırma (Türkiye Formatı)
        if PHONE_PATTERN.search(text):
            score += 40
            reasons.append("Phone number leaking")

        # 3. Bağırma (Aşırı Büyük Harf)
        if len(text) > 10 and text.isupper():
            score += 20
            reasons.append("Excessive caps usage")

        # 4. Link Paylaşımı (Spam/Dolandırıcılık)
        if re.search(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text):
            score += 60
            reasons.append("External link detection")

        return score, reasons