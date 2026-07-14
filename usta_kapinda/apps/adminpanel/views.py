from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .services import DashboardService
from .models import SiteSettings
from .serializers import SiteSettingsSerializer, AdminDashboardSerializer

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        stats = DashboardService.get_stats()
        serializer = AdminDashboardSerializer(stats)
        return Response(serializer.data)

class SiteSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        settings = SiteSettings.objects.first()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = SiteSettings.objects.first()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)