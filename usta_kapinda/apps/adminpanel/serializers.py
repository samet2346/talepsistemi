from rest_framework import serializers
from .models import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

class AdminDashboardSerializer(serializers.Serializer):
    overview = serializers.JSONField()
    recent_activity = serializers.JSONField()
    performance = serializers.JSONField()