import django_filters
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class ProviderFilter(django_filters.FilterSet):
    """P2P usta vitrini — User (is_provider=True) filtreleri."""

    def __init__(self, data=None, *args, **kwargs):
        if data is not None:
            data = data.copy()
            if 'category__slug' in data and 'category' not in data:
                data['category'] = data['category__slug']
            if 'district__slug' in data and 'district' not in data:
                data['district'] = data['district__slug']
        super().__init__(data, *args, **kwargs)

    min_rating = django_filters.NumberFilter(field_name='trust_score', lookup_expr='gte')
    max_rating = django_filters.NumberFilter(field_name='trust_score', lookup_expr='lte')

    category = django_filters.CharFilter(method='filter_category')
    district = django_filters.CharFilter(method='filter_district')

    search = django_filters.CharFilter(method='filter_search')

    is_verified = django_filters.BooleanFilter(field_name='is_face_verified')
    is_active = django_filters.BooleanFilter(field_name='is_active')

    class Meta:
        model = User
        fields = ['category', 'district', 'min_rating', 'max_rating', 'is_verified', 'is_active']

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(categories__icontains=value)

    def filter_district(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(locations_served__icontains=value)

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            models.Q(provider_title__icontains=value)
            | models.Q(full_name__icontains=value)
            | models.Q(bio__icontains=value)
        )
