from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'model_name', 'object_id', 'object_repr', 'action', 'changes', 'ip_address', 'created_at']