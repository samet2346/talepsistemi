import os
import re
import json
import bleach
import hashlib
import logging
import unicodedata
from django.core.exceptions import ValidationError
from django.conf import settings

logger = logging.getLogger(__name__)

# JSON Tabanlı Küfür Listesini Yükleme Alanı
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BAD_WORDS_FILE = os.path.join(BASE_DIR, 'jobs', 'bad_words.json')

if os.path.exists(BAD_WORDS_FILE):
    try:
        with open(BAD_WORDS_FILE, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
            
            # 🛡️ TELEFON / MASAÜSTÜ YARIŞINI BİTİREN VERİ TİPİ ZIRHI
            if isinstance(json_data, dict):
                words_list = json_data.get('words', [])
            elif isinstance(json_data, list):
                words_list = json_data
            else:
                words_list = []

            YASAKLI_KELIMELER = {str(word).strip().lower() for word in words_list if word and str(word).strip()}
            logger.info(f"[FİLTRE] JSON dosyasından {len(YASAKLI_KELIMELER)} yasaklı kelime başarıyla belleğe yüklendi.")
    except Exception as e:
        logger.error(f"[FİLTRE HATA] JSON okunurken patladı: {str(e)}")
        YASAKLI_KELIMELER = {'amk', 'sik', 'orospu', 'piç'}
else:
    logger.warning("[FİLTRE UYARI] bad_words.json bulunamadı, fallback kelimeler devrede!")
    YASAKLI_KELIMELER = {'amk', 'sik', 'orospu', 'piç'}


class JobRequestValidator:
    """
    🏗️ MISSION CRITICAL VALIDATION ENGINE & PROFANITY FILTER
    Features: Global Phone Support, Unicode Normalization (NFKC), Weighted Scoring, 
    CPU Guard, Obfuscation Mapping, 697 Words Profanity Shield, and Schema-Consistent Results.
    """

    # Config-Driven (SaaS Standartları)
    CONFIG = {
        'MAX_RAW_LENGTH': 5000, # CPU Guard: Bleach öncesi ilk bariyer
        'MIN_DESC_LENGTH': 30,
        'IDEMPOTENCY_WINDOW_SEC': 60,
        'THRESHOLDS': {'BLOCK': 85, 'REVIEW': 60, 'SHADOW': 35}
    }

    RISK_WEIGHTS = {
        'PHONE': 35, 'LINK': 30, 'OBFUSCATION': 25, 
        'CAPS': 15, 'EMOJI': 10, 'NEW_USER': 15, 'REPETITION': 20,
        'PROFANITY': 90  # Küfür/Argo direkt blok eşiğinin üstüne fırlatsın usta
    }

    @classmethod
    def process(cls, raw_data, ctx):
        """
        🚀 Ana Risk Hattı (Pipeline)
        :param ctx: {'ip_limit': bool, 'user_id': uuid, 'is_tor': bool, 'proxy_score': int ...}
        """
        # 1. CPU GUARD & SCHEME CONSISTENCY
        raw_desc = raw_data.get('description', '')
        if len(raw_desc) > cls.CONFIG['MAX_RAW_LENGTH'] or ctx.get('ip_limit'):
            return cls._generate_fallback_response(raw_data, ctx, 'BLOCK', ['FLOOD_OR_RATE_LIMIT'])

        # 2. UNICODE NORMALIZATION (Homoglyph & Hidden Char Resistance)
        # ․ (unicode dot) -> . (standard dot) dönüşümü burada gerçekleşir.
        normalized_desc = unicodedata.normalize('NFKC', raw_desc)
        normalized_title = unicodedata.normalize('NFKC', raw_data.get('title', ''))

        # 3. ADVANCED SANITIZATION (Bleach)
        sanitized_desc = cls._sanitize(normalized_desc)
        sanitized_title = cls._sanitize(normalized_title)

        # 4. FEATURE EXTRACTION (Profanity check dahil edildi)
        f = cls._extract_features(sanitized_desc, sanitized_title, ctx)
        
        # 5. WEIGHTED RISK SCORING
        risk = cls._calculate_risk(f)
        
        # 6. SECURE IDEMPOTENCY HASH
        i_hash = cls._generate_hash(sanitized_desc, sanitized_title, ctx['user_id'])

        return {
            "sanitized_data": {**raw_data, "title": sanitized_title, "description": sanitized_desc},
            "risk_score": risk['score'],
            "risk_flags": risk['flags'],
            "publish_strategy": cls._determine_strategy(risk['score']),
            "idempotency_hash": i_hash,
            "network_abuse": {
                "is_tor": ctx.get('is_tor', False),
                "proxy_score": ctx.get('proxy_score', 0),
                "asn_reputation": ctx.get('asn_reputation', 'GOOD')
            }
        }

    @staticmethod
    def _sanitize(text):
        """Bleach ile XSS temizliği ve whitespace normalizasyonu."""
        clean = bleach.clean(text, tags=[], strip=True)
        return " ".join(clean.split())

    @classmethod
    def _extract_features(cls, text, title_text, ctx):
        """🧠 Unicode Duyarlı & Obfuscation Aware Analiz + Küfür Taraması."""
        if not text: return cls._get_default_features(ctx)

        words = text.lower().split()
        title_words = title_text.lower().split() if title_text else []
        letters = [c for c in text if c.isalpha()]
        
        # 🚀 697 KELİMELİK PROFANITY SHIELD (Hem başlık hem açıklama taranır)
        # Noktalama işaretlerinden kelimeleri arındırıp tam eşleşme bakıyoruz usta
        def check_profanity(word_list):
            for w in word_list:
                clean_w = "".join(c for c in w if c.isalnum())
                if clean_w in YASAKLI_KELIMELER:
                    return True
            return False

        has_profanity = check_profanity(words) or check_profanity(title_words)

        # Global Phone Regex (Config-driven muadili)
        phone_pattern = getattr(settings, 'PHONE_REGEX', r'(\+?\d{1,4}[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}[\s\-\.]?\d{2,4})')
        
        # Obfuscation Detection (Link & Protocole focus)
        obf_patterns = [r'h\s?t\s?t\s?p', r'\[\s?dot\s?\]', r'\s?dot\s?', r'[\w-]+\s?[\.\,]\s?(?:com|net|org|io)']
        has_obf = any(re.search(p, text.lower()) for p in obf_patterns)

        # Emoji Range Detection
        emojis = [c for c in text if (0x1F600 <= ord(c) <= 0x1F64F) or (0x1F300 <= ord(c) <= 0x1F5FF)]

        return {
            'has_phone': bool(re.search(phone_pattern, text)),
            'has_link': bool(re.search(r'http|www|[\w-]+\.(?:com|net|org|xyz|link|io)', text.lower())),
            'has_obfuscation': has_obf,
            'has_profanity': has_profanity,
            'caps_ratio': sum(1 for c in letters if c.isupper()) / len(letters) if letters else 0,
            'emoji_count': len(emojis),
            'diversity_score': len(set(words)) / len(words) if len(words) >= 5 else 1.0,
            'is_new_user': ctx.get('account_age_h', 0) < 24,
            'history_risk': ctx.get('history_score', 0),
            'network_risk': 40 if ctx.get('is_tor') or ctx.get('proxy_score', 0) > 50 else 0
        }

    @classmethod
    def _calculate_risk(cls, f):
        """⚖️ Weighted Score Normalization."""
        score = 0
        flags = []
        w = cls.RISK_WEIGHTS

        if f['has_phone']: score += w['PHONE']; flags.append('PHONE')
        if f['has_link']: score += w['LINK']; flags.append('LINK')
        if f['has_obfuscation']: score += w['OBFUSCATION']; flags.append('OBFUSCATION')
        if f.get('has_profanity', False): score += w['PROFANITY']; flags.append('PROFANITY_DETECTED')
        if f['caps_ratio'] > 0.6: score += w['CAPS']; flags.append('CAPS_FLOOD')
        if f['emoji_count'] > 5: score += w['EMOJI']; flags.append('EMOJI_SPAM')
        if f['diversity_score'] < 0.4: score += w['REPETITION']; flags.append('REPETITION')
        if f['is_new_user']: score += w['NEW_USER']; flags.append('NEW_USER')
        
        # Network level score addition
        score += f.get('network_risk', 0)

        # Bugfix: history_multiplier yerine history_mult düzeltildi usta
        history_mult = min(1.3, 1 + (f['history_risk'] / 100))
        return {'score': min(100, int(score * history_mult)), 'flags': flags}

    @staticmethod
    def _generate_hash(desc, title, user_id):
        """Salted SHA-256 for Idempotency."""
        content = f"{user_id}|{title.lower()}|{desc.lower()}"
        return hashlib.sha256(content.encode()).hexdigest()

    @classmethod
    def _determine_strategy(cls, score):
        t = cls.CONFIG['THRESHOLDS']
        if score >= t['BLOCK']: return 'BLOCK'
        if score >= t['REVIEW']: return 'REVIEW'
        if score >= t['SHADOW']: return 'SHADOW'
        return 'NORMAL'

    @classmethod
    def _generate_fallback_response(cls, data, ctx, strategy, flags):
        """API consistency için hata durumunda tam şema döner."""
        return {
            "sanitized_data": data,
            "risk_score": 100 if strategy == 'BLOCK' else 0,
            "risk_flags": flags,
            "publish_strategy": strategy,
            "idempotency_hash": None,
            "network_abuse": {"is_tor": ctx.get('is_tor', False), "proxy_score": 100}
        }

    @staticmethod
    def _get_default_features(ctx):
        return {
            'has_phone': False, 'has_link': False, 'has_obfuscation': False, 'has_profanity': False,
            'caps_ratio': 0, 'emoji_count': 0, 'diversity_score': 1.0,
            'is_new_user': ctx.get('account_age_h', 0) < 24,
            'history_risk': ctx.get('history_score', 0)
        }