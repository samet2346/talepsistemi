from rest_framework import serializers
from .models import AbuseReport, SpamScore

class AbuseReportSerializer(serializers.ModelSerializer):
    """
    🚩 ŞİKAYET SERİALIZER'I
    Role: Kullanıcının diğer kullanıcıları veya ilanları raporlamasını sağlar.
    """
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_user_username = serializers.CharField(source='reported_user.username', read_only=True)

    class Meta:
        model = AbuseReport
        fields = [
            'id', 'reporter', 'reporter_username',
            'reported_user', 'reported_user_username',
            'job', 'reason', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at']

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user == attrs.get('reported_user'):
            raise serializers.ValidationError("Kendinizi şikayet edemezsiniz.")
        return attrs

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class UserSpamScoreSerializer(serializers.ModelSerializer):
    """
    📊 SİCİL ÖZETİ SERİALIZER'I
    Role: Kullanıcının kendi risk durumunu görmesini sağlar.
    """
    class Meta:
        model = SpamScore
        fields = ['score', 'risk_level', 'reasons', 'last_updated']
        read_only_fields = fields


class AdminSpamScoreSerializer(serializers.ModelSerializer):
    """
    🔧 ADMIN PANELİ İÇİN DETAYLI SERIALIZER
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = SpamScore
        fields = ['id', 'username', 'email', 'score', 'risk_level', 'reasons', 'last_updated']
        read_only_fields = fields