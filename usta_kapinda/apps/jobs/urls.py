from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import JobViewSet

@api_view(['GET'])
def jobs_root(request):
    """
    Jobs uygulamasının kök dizin haritası.
    """
    return Response({
        "requests": "/api/v1/jobs/requests/",
    })

# Router ismimizi tanımlıyoruz
router = DefaultRouter()
router.register(r'requests', JobViewSet, basename='job-request')

urlpatterns = [
    # 📌 Root Endpoint: Router'ın varsayılan görünümünü ezerek temiz harita döner.
    path('', jobs_root, name='jobs-root'),
    
    # api/v1/jobs/requests/ -> Tüm iş işlemleri burada
    path('', include(router.urls)),
]