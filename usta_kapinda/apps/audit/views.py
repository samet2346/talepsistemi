from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    📜 DENETİM KAYITLARI (SENIOR)
    - Sadece Adminler erişebilir.
    - Sadece Okuma (Read-Only) yetkisi vardır.
    """
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    
    # Arama ve Filtreleme
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['model_name', 'action', 'user']
    search_fields = ['object_repr', 'ip_address', 'user__email']
    ordering_fields = ['created_at']