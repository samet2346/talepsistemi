from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    # 'user' yerine şemadaki 'recipient' alanını koyduk usta:
    list_display = ('id', 'recipient', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('recipient__username', 'recipient__email', 'title', 'description')
    ordering = ('-created_at',)