from django.utils.text import slugify
from rest_framework import serializers
from django.contrib.auth import get_user_model
from reviews.models import Review
from reviews.serializers import ReviewSerializer

User = get_user_model()


def get_provider_slug(user):
    if user.provider_title:
        slug = slugify(user.provider_title)
        if slug:
            return slug
    return str(user.pk)


def _first_json_entry(items, key='slug'):
    if not items or not isinstance(items, list):
        return None
    entry = items[0]
    if isinstance(entry, dict):
        return entry
    return None


class MasterListSerializer(serializers.ModelSerializer):
    """Vitrin kartı — User (is_provider=True)."""

    slug = serializers.SerializerMethodField()
    business_name = serializers.CharField(source='provider_title', read_only=True)
    profile_photo = serializers.ImageField(source='avatar_url', read_only=True)
    rating = serializers.DecimalField(
        source='trust_score',
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )
    is_verified = serializers.BooleanField(source='is_face_verified', read_only=True)
    category = serializers.SerializerMethodField()
    district = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'business_name',
            'slug',
            'profile_photo',
            'full_name',
            'rating',
            'trust_score',
            'work_photos',
            'categories',
            'locations_served',
            'category',
            'district',
            'is_active',
            'is_verified',
            'is_provider',
        ]
        read_only_fields = fields

    def get_slug(self, obj):
        return get_provider_slug(obj)

    def get_category(self, obj):
        entry = _first_json_entry(obj.categories)
        return entry

    def get_district(self, obj):
        entry = _first_json_entry(obj.locations_served)
        return entry


class MasterDetailSerializer(serializers.ModelSerializer):
    """Usta profil detayı — User (is_provider=True)."""

    slug = serializers.SerializerMethodField()
    business_name = serializers.CharField(source='provider_title', read_only=True)
    profile_photo = serializers.ImageField(source='avatar_url', read_only=True)
    user_full_name = serializers.CharField(source='full_name', read_only=True)
    phone_number = serializers.CharField(source='phone', read_only=True)
    rating = serializers.DecimalField(
        source='trust_score',
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )
    is_verified = serializers.BooleanField(source='is_face_verified', read_only=True)
    category = serializers.SerializerMethodField()
    district = serializers.SerializerMethodField()
    portfolio = serializers.JSONField(source='work_photos', read_only=True)
    completion_score = serializers.SerializerMethodField()
    can_bid = serializers.SerializerMethodField()
    success_rate = serializers.SerializerMethodField()
    average_review_rating = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    yorumSayisi = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'business_name',
            'user_full_name',
            'slug',
            'profile_photo',
            'bio',
            'rating',
            'trust_score',
            'work_photos',
            'categories',
            'locations_served',
            'category',
            'district',
            'completion_score',
            'can_bid',
            'success_rate',
            'average_review_rating',
            'reviews',
            'yorumSayisi',
            'portfolio',
            'phone_number',
            'is_active',
            'is_verified',
            'is_provider',
            'date_joined',
        ]
        read_only_fields = fields

    def get_reviews(self, obj):
        qs = Review.objects.filter(reviewee=obj).select_related('reviewer').order_by('-created_at')
        return ReviewSerializer(qs, many=True, context=self.context).data

    def get_yorumSayisi(self, obj):
        return Review.objects.filter(reviewee=obj).count()

    def get_slug(self, obj):
        return get_provider_slug(obj)

    def get_category(self, obj):
        return _first_json_entry(obj.categories)

    def get_district(self, obj):
        return _first_json_entry(obj.locations_served)

    def get_completion_score(self, obj):
        return int(float(obj.trust_score or 0))

    def get_can_bid(self, obj):
        return float(obj.trust_score or 0) >= 60

    def get_success_rate(self, obj):
        return float(obj.trust_score or 0)

    def get_average_review_rating(self, obj):
        qs = Review.objects.filter(reviewee=obj)
        if not qs.exists():
            return None
        total = sum(r.avg_rating for r in qs)
        return round(total / qs.count(), 1)
