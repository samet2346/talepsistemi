from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'reviewee',
        'reviewer',
        'rating_quality',
        'rating_speed',
        'rating_price_loyalty',
        'display_avg_rating',
        'created_at',
    ]
    list_filter = ['rating_quality', 'rating_speed', 'created_at']
    search_fields = ['reviewee__full_name', 'reviewer__full_name', 'comment']
    fieldsets = (
        ('Genel Bilgiler', {'fields': ('job', 'reviewer', 'reviewee')}),
        ('Puanlama Detayları', {
            'fields': ('rating_quality', 'rating_speed', 'rating_price_loyalty'),
        }),
        ('İçerik', {'fields': ('comment', 'image')}),
        ('Yanıt', {'fields': ('master_reply', 'replied_at')}),
        ('Zaman Bilgisi', {'fields': ('created_at',)}),
    )
    readonly_fields = ['job', 'reviewer', 'reviewee', 'created_at', 'replied_at']

    def display_avg_rating(self, obj):
        return f'{obj.avg_rating} ⭐'

    display_avg_rating.short_description = 'Genel Ortalama'
