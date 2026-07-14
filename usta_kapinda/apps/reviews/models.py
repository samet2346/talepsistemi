from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from jobs.models import Job


class Review(models.Model):
    """P2P değerlendirme: iş sahibi (reviewer) → hizmet sağlayıcı (reviewee)."""

    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='given_reviews',
        on_delete=models.CASCADE,
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_reviews',
        on_delete=models.CASCADE,
    )

    rating_quality = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Hizmet Kalitesi',
    )
    rating_speed = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Zamanlama/Hız',
    )
    rating_price_loyalty = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Fiyat Sadakati',
    )

    comment = models.TextField(max_length=1000, verbose_name='Yorum')
    image = models.ImageField(
        upload_to='reviews/evidence/',
        null=True,
        blank=True,
        verbose_name='İş Sonucu Fotoğrafı',
    )

    master_reply = models.TextField(
        max_length=1000,
        null=True,
        blank=True,
        verbose_name='Hizmet Sağlayıcı Yanıtı',
    )
    replied_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def avg_rating(self):
        return round(
            (self.rating_quality + self.rating_speed + self.rating_price_loyalty) / 3,
            2,
        )

    @property
    def average_rating(self):
        return self.avg_rating

    class Meta:
        verbose_name = 'Değerlendirme'
        verbose_name_plural = 'Değerlendirmeler'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reviewee} - {self.avg_rating} ⭐'
