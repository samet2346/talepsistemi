from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    VerifyEmailView,
    CustomTokenObtainPairView,
    MeView,
    ProviderProfileView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    # 📝 Kayıt ve Doğrulama Akışı
    # 1. Adım: Kullanıcı bilgilerini gönderir ve Resend üzerinden OTP maili tetiklenir.
    path('register/', RegisterView.as_view(), name='register'),
    
    # 2. Adım: Mail ile gelen 6 haneli kodu doğrulayıp hesabı aktif eder.
    path('verify/', VerifyEmailView.as_view(), name='verify'),
    
    # 🔑 Kimlik Doğrulama ve Oturum
    # Giriş: JWT Token (Access/Refresh) çiftini döner.
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    
    # Yenileme: Access token süresi dolunca yeni bir tane sağlar.
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 🚪 Çıkış: Mevcut refresh token'ı blacklist'e alır.
    path('logout/', LogoutView.as_view(), name='logout'),

    # 👤 Kullanıcı İşlemleri
    # Kullanıcının kendi profilini yönettiği kapı (GET/PUT/PATCH/DELETE).
    path('me/', MeView.as_view(), name='me'),
    path('me/provider-profile/', ProviderProfileView.as_view(), name='provider-profile'),
    #kullanıcının kendi şifresini sıfırladığı ve şifre belirlediği kapı
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]