import os
import uuid
import logging
import resend
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings

logger = logging.getLogger(__name__)

# --- 📧 RESEND MAİL ARAÇLARI ---
def send_resend_email(subject, to_email, html_content):
    """
    Resend SDK kullanarak HTML e-posta gönderir.
    ADIM 2 doğrulama kodlarını bu fonksiyonla ateşleyeceğiz.
    """
    resend.api_key = getattr(settings, "RESEND_API_KEY", None)
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "onboarding@resend.dev")

    if not resend.api_key:
        logger.error("❌ Resend API Key bulunamadı! Settings dosyasını kontrol et.")
        return None

    try:
        params = {
            "from": f"Usta Kapında <{from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        email = resend.Emails.send(params)
        logger.info(f"✅ E-posta başarıyla gönderildi: {to_email}")
        return email
    except Exception as e:
        logger.error(f"❌ Resend Hatası: {str(e)}")
        return None

# --- 📸 RESİM ARAÇLARI (Mevcut mantık korundu) ---
def upload_to_uuid(instance, filename):
    """Dosya isimlerini UUID ile maskeler, çakışmayı önler."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join(instance.__class__.__name__.lower(), filename)

def compress_image(image_field):
    """Resmi optimize eder, sunucuda yer açar (75% kalite)."""
    if not image_field:
        return None
    try:
        img = Image.open(image_field)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        img.thumbnail((1200, 1200))
        output = BytesIO()
        img.save(output, format='JPEG', quality=75)
        output.seek(0)
        return ContentFile(output.read(), name=os.path.basename(image_field.name))
    except Exception as e:
        logger.error(f"Resim sıkıştırma hatası: {e}")
        return image_field