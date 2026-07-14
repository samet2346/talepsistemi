from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

# 🛡️ Modüler Importlar
from .models import SiteSettings
from .serializers import CategorySerializer, DistrictSerializer
from services.models import Category
from locations.models import District

class ConfigAPIView(APIView):
    """
    🚀 Next.js Başlangıç Verisi (Bootstrap Data)
    Kategoriler, İlçeler ve Site Ayarlarını tek bir pakette döner.
    """
    permission_classes = [permissions.AllowAny]

    # ⚡ PERFORMANCE: 15 dakika boyunca veritabanına gitmeden RAM'den (Redis/Cache) döner.
    @method_decorator(cache_page(60 * 15))
    @extend_schema(
        summary="Sistem Başlangıç Ayarları",
        description="Next.js ana sayfa ve filtreleme için gerekli tüm sabit verileri döner.",
        responses={200: inline_serializer(
            name='ConfigResponse',
            fields={
                'categories': CategorySerializer(many=True),
                'districts': DistrictSerializer(many=True),
                'settings': serializers.DictField()
            }
        )}
    )
    def get(self, request):
        # 🔍 Sorgu Optimizasyonu: Sadece aktif olanları çekiyoruz
        categories = Category.objects.filter(is_active=True).order_by('name')
        districts = District.objects.filter(is_active=True).order_by('name')
        settings = SiteSettings.objects.first()
        
        return Response({
            'categories': CategorySerializer(categories, many=True).data,
            'districts': DistrictSerializer(districts, many=True).data,
            'settings': {
                'site_name': settings.site_name if settings else "Usta Kapında",
                'maintenance': settings.maintenance_mode if settings else False,
                'email': settings.support_email if settings else "destek@ustakapinda.com",
                'support_phone': "0850 000 00 00" # Örnek sabit veri
            }
        })