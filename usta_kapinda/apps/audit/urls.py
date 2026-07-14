from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet

# Sinyör Dokunuşu: Router otomatik olarak /api/v1/audit/ rotasını oluşturur
router = DefaultRouter()
router.register(r'', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
]