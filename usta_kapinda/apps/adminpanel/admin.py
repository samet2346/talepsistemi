from django.contrib import admin
from .models import SiteSettings

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'commission_rate', 'maintenance_mode', 'updated_at']
    
    def has_add_permission(self, request):
        # Singleton yapısı: Sadece 1 tane ayar olabilir
        return not SiteSettings.objects.exists()