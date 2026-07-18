"""
Django Production Settings — Usta Kapında
Canlı ortam (Production) için katı güvenlik kuralları, performans optimizasyonları
ve çevre değişkenlerine bağlı dinamik konfigürasyonlar.
"""
import os
from .base import *

# 🛑 Canlı ortamda DEBUG kesinlikle KAPALI olmalıdır!
DEBUG = False

# Canlı ortam domain adları .env üzerinden virgülle ayrılarak çekilir
# Örn: ALLOWED_HOSTS=ustakapinda.com,api.ustakapinda.com
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# --- Veritabanı Konfigürasyonu (Prod PostgreSQL) ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# --- CORS & CSRF Canlı Ortam Güvenliği ---
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_ALL_ORIGINS = False  # Canlıda kapıları kapatıyoruz, sadece beyaz listedekiler girebilir

# --- Gerçek E-Posta Yapılandırması (SMTP / Resend Backend) ---
# Canlıda maillerin konsola düşmesi yerine gerçek SMTP üzerinden gitmesini sağlıyoruz
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'

# --- Üretim Ortamı Gerçek Önbellek (Redis Cache) ---
# Lokasyon sorguları ve usta listeleri için canlıda Redis devreye girer
# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         ...
#     }
# }

# --- Siber Güvenlik Duvarı (Sinyör Önlemleri) ---
# Tarayıcıların XSS açıklarını yakalayan mekanizmasını zorunlu kılar
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Projenin iframe içinde açılmasını engelleyerek Clickjacking saldırılarını önler
X_FRAME_OPTIONS = 'DENY'

# SSL/TLS Kuralları (Nginx + SSL kurulduğunda aktifleştirilmelidir)
# Eğer canlıda HTTPS kullanıyorsan aşağıdaki satırların başındaki yorumu kaldır:
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 31536000 # 1 Yıl
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# --- Firebase Prod Konfigürasyonu ---
FIREBASE_KEY_PATH = os.getenv('FIREBASE_KEY_PATH', os.path.join(BASE_DIR, 'config', 'numara.json'))