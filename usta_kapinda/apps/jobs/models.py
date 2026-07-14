import os
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from masters.models import MasterProfile, master_file_path
from services.models import Category
from locations.models import District
from common.validators import validate_image_size, validate_image_extension


class Job(models.Model):
    """🏗️ SaaS Core: İş/Talep Yönetimi (State Machine Ready)"""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Teklif Bekliyor'
        OFFER_RECEIVED = 'offer_received', 'Teklif Geldi'
        MATCHED = 'matched', 'Usta Seçildi'
        ON_WAY = 'on_way', 'Usta Yolda'
        COMPLETED = 'completed', 'Tamamlandı'
        CANCELLED = 'cancelled', 'İptal Edildi'
        EXPIRED = 'expired', 'Süresi Doldu'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_jobs',
        null=True,
        blank=True,
    )

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='jobs')
    district = models.ForeignKey(District, on_delete=models.PROTECT, related_name='jobs')
    title = models.CharField(max_length=200, verbose_name="İş Başlığı")
    description = models.TextField(max_length=1000, verbose_name="İş Açıklaması")

    budget_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Minimum Bütçe",
    )
    budget_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Maksimum Bütçe",
    )

    work_photos = models.JSONField(default=list, blank=True, verbose_name="İş Fotoğrafları")

    image = models.ImageField(
        upload_to=master_file_path,
        null=True,
        blank=True,
        validators=[validate_image_size, validate_image_extension],
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    assigned_master = models.ForeignKey(
        MasterProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks',
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "İş Talebi"
        verbose_name_plural = "İş Talepleri"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def clean(self):
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min > self.budget_max:
                raise ValidationError("Minimum bütçe, maksimum bütçeden büyük olamaz.")

    def user_can_bid(self, user):
        """View katmanında: owner kendi ilanına teklif veremez."""
        return self.owner_id != user.pk

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.image and hasattr(self.image, 'file'):
            try:
                self.image = MasterProfile().compress_image(self.image)
            except Exception:
                pass

        if self.status == self.Status.COMPLETED and not self.completed_at:
            self.completed_at = now()
        elif self.status == self.Status.CANCELLED and not self.cancelled_at:
            self.cancelled_at = now()

        super().save(*args, **kwargs)

    @property
    def offer_count(self):
        return self.bids.count()

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class Bid(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Beklemede'
        ACCEPTED = 'ACCEPTED', 'Kabul Edildi'
        REJECTED = 'REJECTED', 'Reddedildi'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_bids',
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField()
    estimated_duration = models.CharField(max_length=100, null=True, blank=True)
    estimated_duration = models.CharField(max_length=100, null=True, blank=True)
    revision_count = models.PositiveSmallIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'provider')
        verbose_name = 'Teklif'
        verbose_name_plural = 'Teklifler'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.provider} -> {self.job.title} ({self.price} TL)"


class JobOffer(models.Model):
    """💰 Ustanın Teklifi ve Akıllı Skorlama"""

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='offers')
    master = models.ForeignKey(MasterProfile, on_delete=models.CASCADE, related_name='job_offers')

    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Teklif Fiyatı")
    duration_days = models.PositiveIntegerField(default=1, verbose_name="Süre (Gün)")
    message = models.TextField(max_length=500, verbose_name="Usta Mesajı")

    score = models.FloatField(default=0.0, db_index=True)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "İş Teklifi"
        verbose_name_plural = "İş Teklifleri"
        unique_together = ('job', 'master')
        ordering = ['-score', 'price']

    def calculate_score(self):
        rating_val = self.master.rating if self.master.rating else 5.0
        rating_weight = rating_val * 20
        price_penalty = float(self.price) / 1000
        return round(rating_weight - price_penalty, 2)

    def save(self, *args, **kwargs):
        self.score = self.calculate_score()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.master.business_name or self.master.user.full_name} -> {self.price} TL"
