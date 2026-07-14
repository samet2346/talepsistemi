from django.db import models
from django.conf import settings

class Notification(models.Model):
    # Enum-like choices for better control
    class NotificationType(models.TextChoices):
        OFFER = 'OFFER', 'Yeni Teklif'
        JOB_STATUS = 'JOB_STATUS', 'İş Durumu Güncellemesi'
        REVIEW = 'REVIEW', 'Değerlendirme'
        SYSTEM = 'SYSTEM', 'Sistem Mesajı'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    
    # Senior Dokunuş: Başlık ve Mesajı hardcode yapmıyoruz, 
    # Frontend'in parse edebileceği ham veriyi (JSON) saklıyoruz.
    title = models.CharField(max_length=255)
    body = models.TextField()
    
    # Metadata: Bildirime tıklandığında hangi ID'ye gidecek? { "job_id": 5, "offer_id": 12 }
    data = models.JSONField(default=dict, blank=True)
    
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False) # Soft delete
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.recipient.full_name} - {self.title}"