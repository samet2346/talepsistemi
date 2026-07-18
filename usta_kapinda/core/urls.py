# project/urls.py (veya ana urls.py dosyan)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularRedocView, 
    SpectacularSwaggerView
)

# 🔑 GEÇİCİ - Admin şifre sıfırlama (işin bitince silinecek)
def reset_admin(request):
    secret = request.GET.get('key')
    if secret != 'Talep2026GizliAnahtar!':
        return HttpResponse('yetkisiz', status=403)
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com'}
    )
    user.set_password('YeniSifre123!')
    user.is_superuser = True
    user.is_staff = True
    user.save()
    return HttpResponse(f'Sifre sifirlandi. created={created} username={user.username}')

# API Rotalarını bir listede toplayıp temiz bir yapı kuruyoruz
api_v1_patterns = [
# 🛡️ Kimlik, Takip ve Güvenlik
    path('accounts/', include('accounts.urls')),
    path('audit/', include('audit.urls')),
#path('abuse/', include('abuse.urls')),

# 🛠️ Hizmet ve İş Motoru
    path('services/', include('services.urls')),
    path('jobs/', include('jobs.urls')),
    path('masters/', include('masters.urls')),  
# 📍 Yardımcı Modüller
    path('locations/', include('locations.urls')),
    path('notifications/', include('notifications.urls')),
    path('reviews/', include('reviews.urls')),
    path('common/', include('common.urls')),
    path('adminpanel/', include('adminpanel.urls')),
]

urlpatterns = [
# 🏛️ Yönetim Paneli
    path('admin/', admin.site.urls), 

# 🔑 GEÇİCİ - şifre sıfırlama endpoint'i
    path('reset-admin-gizli-xyz789/', reset_admin),

# 🚀 API v1 (Tüm modüller burada toplandı)
    path('api/v1/', include(api_v1_patterns)),
# 📝 Dokümantasyon (Swagger/Redoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# 🖼️ Statik ve Medya Dosyaları
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
