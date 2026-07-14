from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_full_name = serializers.ReadOnlyField(source='reviewer.full_name')
    reviewee_full_name = serializers.ReadOnlyField(source='reviewee.full_name')
    avg_rating = serializers.ReadOnlyField()

    class Meta:
        model = Review
        fields = [
            'id', 'job', 'reviewer_full_name', 'reviewee_full_name',
            'rating_quality', 'rating_speed', 'rating_price_loyalty',
            'avg_rating', 'comment', 'image', 'master_reply',
            'replied_at', 'created_at',
        ]
        read_only_fields = ['reviewer', 'reviewee', 'avg_rating', 'master_reply', 'replied_at']

    def validate(self, data):
        ratings = [
            data.get('rating_quality'),
            data.get('rating_speed'),
            data.get('rating_price_loyalty'),
        ]
        if any(r is not None and (r < 1 or r > 5) for r in ratings):
            raise serializers.ValidationError('Puanlar 1 ile 5 arasında olmalıdır.')
        return data


class ReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['master_reply']
