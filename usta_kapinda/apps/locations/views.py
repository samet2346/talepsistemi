from rest_framework import generics, permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import City, District
from .serializers import CitySerializer, DistrictSerializer

class CityListView(generics.ListAPIView):
    """
    GET /api/v1/locations/cities/
    - Tüm şehirleri isim sırasına göre listeler.
    - Lokasyon verisi sık değişmediği için 1 saat cache'lenir.
    """
    queryset = City.objects.all().order_by('name')
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 60)) # 1 saatlik cache
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class DistrictListView(generics.ListAPIView):
    """
    GET /api/v1/locations/districts/
    GET /api/v1/locations/districts/?city=istanbul
    - Tüm aktif ilçeleri şehir ilişkisiyle (select_related) birlikte optimize getirir.
    - 1 saat Redis Cache koruması vardır.
    """
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # select_related('city') ile N+1 query problemini kökten çözüyoruz
        queryset = District.objects.filter(is_active=True).select_related('city').order_by('name')
        
        # Next.js'ten gelen filtreleme parametresi (Slug veya ID kontrolü için)
        city_param = self.request.query_params.get('city')
        if city_param:
            if city_param.isdigit():
                queryset = queryset.filter(city_id=city_param)
            else:
                queryset = queryset.filter(city__slug=city_param.lower())
                
        return queryset

    @method_decorator(cache_page(60 * 60)) # 1 saatlik cache
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)