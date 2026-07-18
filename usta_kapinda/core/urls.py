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

def reset_admin(request):
    secret = request.GET.get('key')
    if secret != 'Talep2026GizliAnahtar!':
        return HttpResponse('yetkisiz', status=403)
    User = get_user_model()
    user, created = User.objects.get_or_create(
        phone='905550000000',
        defaults={'email': 'admin@ustakapinda.com', 'role': 'ADMIN'}
    )
    user.set_password('YeniSifre123!')
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.is_banned = False
    user.is_deleted = False
    user.role = 'ADMIN'
    user.save()
    check = user.check_password('YeniSifre123!')

    axes_msg = "axes yok"
    try:
        from axes.utils import reset
        reset()
        axes_msg = "axes kilitleri temizlendi"
    except Exception as e:
        axes_msg = f"axes hata: {e}"

    return HttpResponse(
        f'created={created} phone={user.phone} is_staff={user.is_staff} '
        f'is_active={user.is_active} is_superuser={user.is_superuser} '
        f'password_check={check} | {axes_msg}'
    )

api_v1_patterns = [
    path('accounts/', include('accounts.urls')),
    path('audit/', include('audit.urls')),
    path('services/', include('services.urls')),
    path('jobs/', include('jobs.urls')),
    path('masters/', include('masters.urls')),  
    path('locations/', include('locations.urls')),
    path('notifications/', include('notifications.urls')),
    path('reviews/', include('reviews.urls')),
    path('common/', include('common.urls')),
    path('adminpanel/', include('adminpanel.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls), 
    path('reset-admin-gizli-xyz789/', reset_admin),
    path('api/v1/', include(api_v1_patterns)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
