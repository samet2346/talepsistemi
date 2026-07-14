from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    # Senin yapın: Tertemiz.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="İşlemi Yapan"
    )
    model_name = models.CharField(max_length=100, verbose_name="Tablo Adı")
    object_id = models.CharField(max_length=255, null=True, verbose_name="Kayıt ID")
    object_repr = models.CharField(max_length=255, verbose_name="Kayıt Özeti")
    action = models.CharField(max_length=20, verbose_name="Eylem")
    changes = models.JSONField(null=True, blank=True, verbose_name="Değişiklik Detayı")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP Adresi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="İşlem Tarihi")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Denetim Kaydı"
        verbose_name_plural = "Denetim Kayıtları"
        # 🚀 SİNYOR DOKUNUŞU: Veritabanı aramalarını hızlandırmak için indeks ekliyoruz
        indexes = [
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        # User None gelebilir (Sistem silmiştir veya anonimdir), o yüzden korumalı yazalım
        user_display = self.user.email if self.user else "Sistem/Anonim"
        return f"{self.created_at.strftime('%Y-%m-%d %H:%M')} - {user_display} - {self.model_name}"