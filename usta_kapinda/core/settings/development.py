"""
Django Development Settings — Usta Kapında
Yerel geliştirme ortamına özel veritabanı, hata ayıklama ve güvenlik istisnaları.
"""
import os
from .base import *

# 🛠️ Geliştirme modu aktif
DEBUG = True

# Yerel ağda mobil cihazlardan veya Next.js'ten test edebilmek için eklediğin IP adresini koruyoruz
ALLOWED_HOSTS = ['*']

# --- Veritabanı Konfigürasyonu (Local PostgreSQL) ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# --- CORS & CSRF Yerel Ağ İzinleri ---
# Credentials = True olduğu için '*' (asterisk) kullanamayız, delikanlı gibi tüm yerel kombinasyonları yazıyoruz

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.110:3000",  # Frontend Next.js portlu IP'si
    "http://localhost",            # Nginx portsuz localhost isteği
    "http://127.0.0.1",            # Nginx portsuz loopback isteği
    "http://192.168.1.110",        # Nginx portsuz yerel IP isteği
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.110:3000",
    "http://localhost",
    "http://127.0.0.1",
    "http://192.168.1.110",
]

# Geliştirme ortamında CORS engellerine takılmamak için DEBUG durumuna eşitleme kuralı
#CORS_ALLOW_ALL_ORIGINS = DEBUG

# --- E-Posta Yapılandırması (Geliştirme için Terminal) ---
# OTP veya şifre sıfırlama maillerini gerçek kutulara atmak yerine terminale basar
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# --- Firebase & Bildirim Dosya Kontrolü ---
# base.py içindeki BASE_DIR üzerinden dosya yolunu güvenle çözüyoruz
FIREBASE_KEY_PATH = os.path.join(BASE_DIR, 'config', 'numara.json')

if not os.path.exists(FIREBASE_KEY_PATH):
    print(f"⚠️ UYARI: Geliştirme ortamı için Firebase anahtar dosyası bulunamadı: {FIREBASE_KEY_PATH}")