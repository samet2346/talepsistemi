from rest_framework import viewsets, decorators, status
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        


        

        

        return Notification.objects.filter(recipient=self.request.user, is_deleted=False)

    @decorators.action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Navbar'daki kırmızı baloncuğun verisi burdan gelir"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @decorators.action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @decorators.action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': 'Tüm bildirimler okundu.'}, status=status.HTTP_200_OK)