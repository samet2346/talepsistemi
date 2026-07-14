from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

# Senior Dokunuşu: Router kullanarak hem liste hem detay hem de custom action'ları (tree, popular vb.)
# tek bir hat üzerinden (api/services/) yönetiyoruz.
router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='category')

urlpatterns = [
    # Router tarafından oluşturulan tüm URL'leri (GET, POST, ACTION) buraya dahil et
    path('', include(router.urls)),
]