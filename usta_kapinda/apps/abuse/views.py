from rest_framework import generics, views, response, status, permissions
from .models import AbuseReport, SpamScore
from .serializers import AbuseReportSerializer, UserSpamScoreSerializer, AdminSpamScoreSerializer
from .services import AbuseService
from .utils import AbuseUtils

class AbuseReportCreateView(generics.CreateAPIView):
    """
    🚨 ŞİKAYET MERKEZİ
    Usta veya Müşteri bir olumsuzluk gördüğünde burayı tetikler.
    """
    queryset = AbuseReport.objects.all()
    serializer_class = AbuseReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class AbuseReportListView(generics.ListAPIView):
    """
    📋 TÜM ŞİKAYETLER (Sadece Admin)
    """
    queryset = AbuseReport.objects.all().order_by('-created_at')
    serializer_class = AbuseReportSerializer
    permission_classes = [permissions.IsAdminUser]


class FingerprintSyncView(views.APIView):
    """
    🆔 CİHAZ SENKRONİZASYONU
    Frontend her açılışta cihaz DNA'sını buraya bildirir.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ip = AbuseUtils.get_client_ip(request)
        device_hash = request.headers.get('X-Device-Hash') or AbuseUtils.generate_device_hash(request)
        
        AbuseService.record_session(request, ip, device_hash)
        AbuseService.track_velocity(request, ip, device_hash, endpoint='fingerprint_sync')
        
        return response.Response(
            {
                "status": "device_synced", 
                "fingerprint": device_hash,
                "message": "Bu fingerprint'i sonraki request'lerinizde X-Device-Hash header'ında gönderin."
            }, 
            status=status.HTTP_200_OK
        )


class MySecurityProfileView(generics.RetrieveAPIView):
    """
    🕵️ GÜVENLİK PROFİLİM
    Kullanıcı dürüstlük puanını ve risk seviyesini buradan görür.
    """
    serializer_class = UserSpamScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        score_obj, _ = SpamScore.objects.get_or_create(user=self.request.user)
        return score_obj


class AllSpamScoresView(generics.ListAPIView):
    """
    📊 TÜM SİCİLLER (Sadece Admin)
    """
    queryset = SpamScore.objects.all().order_by('-score')
    serializer_class = AdminSpamScoreSerializer
    permission_classes = [permissions.IsAdminUser]