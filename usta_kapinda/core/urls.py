# project/urls.py (veya ana urls.py dosyan)

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularRedocView, 
    SpectacularSwaggerView
)

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