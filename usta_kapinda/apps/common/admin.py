from django.contrib import admin
from .models import SiteSettings

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'maintenance_mode', 'updated_at')
    
    def has_add_permission(self, request):
        # Eğer bir ayar varsa, ikincisinin eklenmesini engeller (Singleton)
        return not SiteSettings.objects.exists()