from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MasterViewSet, 
    CategoryViewSet, 
    DistrictViewSet, 
    ConfigAPIView
)

# 🏗️ Router Mimarisi
# Next.js buradan şu adreslere vuracak:
# 1. /api/masters/list/ -> Tüm aktif ustalar
# 2. /api/masters/list/<slug>/ -> Usta detay sayfası
# 3. /api/masters/categories/ -> Branş listesi
# 4. /api/masters/districts/ -> İlçe listesi
router = DefaultRouter()
router.register(r'list', MasterViewSet, basename='master')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'districts', DistrictViewSet, basename='district')

urlpatterns = [
    # 🚀 SaaS Başlangıç Verisi (Bootstrap Data)
    # Next.js sayfa yüklenirken ilk buraya vurup tüm listeleri tek seferde çekecek.
    path('config/', ConfigAPIView.as_view(), name='api-config'),
    
    # Router tarafından yönetilen yollar
    path('', include(router.urls)),
]