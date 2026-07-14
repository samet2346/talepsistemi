from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    timesince = serializers.SerializerMethodField()
    # 🚀 data alanının saf JSON/Dict olduğunu DRF'e açıkça dikte ediyoruz
    data = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'body', 
            'data', 'is_read', 'created_at', 'timesince'
        ]
        # read_only_fields'ı elle yazalım ki data alanı serileştirilirken kilitlenmesın
        read_only_fields = [
            'id', 'notification_type', 'title', 'body', 
            'is_read', 'created_at', 'timesince'
        ]

    def get_timesince(self, obj):
        from django.utils.timesince import timesince
        from django.utils import timezone
        
        if not obj.created_at:
            return ""
        # Sadece ilk kelimeyi alarak "1 gün, 14 saat" yerine "1 gün" gibi temiz çıktı verebilirsin usta (İsteğe bağlı)
        return timesince(obj.created_at, timezone.now()).split(',')[0]