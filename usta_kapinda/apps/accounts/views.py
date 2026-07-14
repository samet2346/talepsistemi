from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from django.utils import timezone
import os

# Resend ve Mail Fonksiyonu (Daha önce konuştuğumuz utils içindeki fonksiyonu kullanıyoruz)
from common.utils import send_resend_email # utils.py içine eklediğin fonksiyon
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ProviderProfileSerializer,
    CustomTokenSerializer,
)

User = get_user_model()

class RegisterView(APIView):
    """
    ADIM 1: Kullanıcıyı oluştur, 6 haneli kod üret ve Resend ile mail at.
    """
    # 🛡️ KÖKTEN ÇÖZÜM: 
    # Global izinleri (settings.py) bu endpoint için tamamen eziyoruz.
    permission_classes = [permissions.AllowAny] 
    authentication_classes = [] # 👈 JWT veya Session kontrolünü pas geç, kapıyı aç!
    
    serializer_class = RegisterSerializer

    @extend_schema(responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Serializer.save() zaten 6 haneli kodu üretiyor ve User nesnesini dönüyor
            user = serializer.save() 
            
            # 📧 RESEND İLE MAİL GÖNDERİMİ
            html_content = f"""
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #10b981;">Usta Kapında'ya Hoş Geldin!</h1>
                    <p>Kaydınızı tamamlamak için doğrulama kodunuz:</p>
                    <h2 style="background: #f3f4f6; padding: 10px; display: inline-block; letter-spacing: 5px;">{user.verification_code}</h2>
                    <p style="font-size: 12px; color: #666;">Bu kod 15 dakika geçerlidir.</p>
                </div>
            """
            
            email_sent = send_resend_email(
                subject="Hesap Doğrulama Kodu",
                to_email=user.email,
                html_content=html_content
            )

            if email_sent:
                return Response({
                    "status": "success",
                    "message": "Kayıt oluşturuldu. Doğrulama kodu e-postanıza gönderildi.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)
            else:
                # E-posta gitmese bile kullanıcıyı oluşturduğumuz için 201 dönüyoruz
                return Response({
                    "status": "warning",
                    "message": "Kayıt yapıldı ancak e-posta gönderilemedi. Lütfen destekle iletişime geçin.",
                    "user_id": str(user.id) # UUID olduğu için stringe çevirdik
                }, status=status.HTTP_201_CREATED)
        
        # Validasyon hatalarını (telefon kayıtlı vb.) Next.js'e fırlatır
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    ADIM 2: Kullanıcının mailine gelen kodu doğrula ve hesabı aktif et.
    """
    permission_classes = [permissions.AllowAny]
    # 🛡️ SINYÖR DOKUNUŞU: Burayı unutmuşsun, 401'in sebebi bu!
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"error": "Email ve kod zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email.lower(), verification_code=code)
            
            # Zaman aşımı kontrolü (15 dk)
            time_diff = timezone.now() - user.verification_code_created_at
            if time_diff.total_seconds() > 900: # 900 saniye = 15 dk
                return Response({"error": "Kodun süresi dolmuş."}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ DOĞRULAMA BAŞARILI
            user.is_active = True
            user.is_email_verified = True # Bu alanı modele eklemiştik
            user.verification_code = None # Kodu temizle (tek kullanımlık)
            user.save()

            # Otomatik Login yaptır (Token üret)
            refresh = RefreshToken.for_user(user)

            return Response({
                "status": "success",
                "message": "Hesabınız başarıyla doğrulandı.",
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "Geçersiz email veya doğrulama kodu."}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """JWT Giriş Kapısı."""
    serializer_class = CustomTokenSerializer

    def post(self, request, *args, **kwargs):
        # 🔥 TELEFONUN GÖNDERDİĞİ BOMBA VERİYİ BURADA YAKALIYORUZ USTA
        print("\n" + "🔥" * 25)
        print("GELEN LOGIN İSTEĞİ (BODY):", request.data)
        print("GELEN HEADERS:", request.headers)
        print("🔥" * 25 + "\n")
        
        # Orijinal login işlemini çalıştır ama hata verirse yakala
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            # Burası serializer validasyondan geçemeyip 400 fırlatınca tetiklenir
            print("\n" + "❌" * 25)
            print("LOGIN SERIAlIZER VALİDASYON HATASI:")
            print("HATA DETAYI:", str(e))
            if hasattr(e, 'detail'):
                print("DETAYLI DICTIONARY:", e.detail)
            print("❌" * 25 + "\n")
            raise e


class MeView(generics.RetrieveUpdateDestroyAPIView):
    """Kullanıcı Profil Yönetimi."""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if getattr(self, "swagger_fake_view", False):
            return None
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserUpdateSerializer
        return UserSerializer

    def _respond_with_profile(self, user):
        return Response(UserSerializer(user).data)

    @extend_schema(responses={200: UserSerializer})
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self._respond_with_profile(user)

    @extend_schema(responses={200: UserSerializer})
    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserUpdateSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return self._respond_with_profile(user)

    @extend_schema(responses={200: dict}) # Swagger dökümantasyonu için
    def destroy(self, request, *args, **kwargs):
        """
        Kullanıcı hesabını soft-delete yaparak pasife çeker.
        """
        user = self.get_object()
        
        # Modelde is_deleted alanı var mı kontrol et, yoksa sadece is_active=False yap
        if hasattr(user, 'is_deleted'):
            user.is_active = False
            user.is_deleted = True
            user.save(update_fields=['is_active', 'is_deleted'])
        else:
            user.is_active = False
            user.save(update_fields=['is_active'])
            
        return Response(
            {"message": "Hesabınız başarıyla silindi."},
            status=status.HTTP_200_OK # 204 yerine mesaj döneceğimiz için 200 veya 202 daha uygundur
        )

class ProviderProfileView(generics.GenericAPIView):
    """
    Hizmet sağlayıcı profil aktivasyonu ve güncellemesi.
    PATCH ile is_provider=True yapılır ve profil alanları güncellenir.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProviderProfileSerializer

    def get_object(self):
        if getattr(self, "swagger_fake_view", False):
            return None
        return self.request.user

    @extend_schema(
        request=ProviderProfileSerializer,
        responses={200: UserSerializer},
    )
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user.refresh_from_db()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Güvenli Çıkış."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=None, responses={205: None})
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Çıkış başarılı."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Geçersiz token."}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """
    Kullanıcı e-postasını girer, biz ona sıfırlama linki göndeririz.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "E-posta adresi gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email.lower())
            
            # 🔐 Güvenli UID ve Token Üretimi
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Next.js tarafındaki şifre belirleme sayfanın linki
            reset_url = f"http://localhost:3000/auth/reset-password/{uid}/{token}/"

            html_content = f"""
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Şifre Sıfırlama Talebi</h2>
                    <p>Usta Kapında hesabınızın şifresini sıfırlamak için aşağıdaki butona tıklayın:</p>
                    <a href="{reset_url}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Şifremi Sıfırla</a>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Bu bağlantı güvenliğiniz için tek kullanımlıktır. Eğer bu talebi siz yapmadıysanız lütfen bu maili silin.</p>
                </div>
            """

            email_sent = send_resend_email(
                subject="Şifre Sıfırlama Yardımı",
                to_email=user.email,
                html_content=html_content
            )

            if email_sent:
                return Response({"message": "Şifre sıfırlama bağlantısı e-postanıza gönderildi."}, status=status.HTTP_200_OK)
            return Response({"error": "E-posta gönderimi başarısız oldu."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except User.DoesNotExist:
            # Güvenlik gereği "kullanıcı yok" demiyoruz, saldırganların e-posta taramasını engelliyoruz
            return Response({"message": "E-posta adresiniz kayıtlıysa bir bağlantı gönderilecektir."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    UID ve Token'ı kontrol eder, yeni şifreyi kaydeder.
    """
    permission_classes = [permissions.AllowAny]
    # 🛡️ BU SATIRI EKLE: Yoksa 401 Unauthorized almaya devam edersin.
    authentication_classes = []
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Eksik bilgi gönderildi."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # UID'yi çözerek kullanıcıyı bulalım
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            # Token geçerli mi kontrol et (Zaman aşımı veya tek kullanım kontrolü)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"status": "success", "message": "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Geçersiz veya süresi dolmuş bağlantı."}, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Geçersiz işlem."}, status=status.HTTP_400_BAD_REQUEST)