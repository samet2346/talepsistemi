from django.contrib import admin
from .models import District, City

# Temizleme: Eğer daha önce kayıt edildiyse unregister et (Hata almamak için)
if admin.site.is_registered(City):
    admin.site.unregister(City)
if admin.site.is_registered(District):
    admin.site.unregister(District)

class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}

class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'is_active', 'master_count')
    list_filter = ('is_active', 'city')
    search_fields = ('name',)
    list_select_related = ('city',)
    readonly_fields = ('master_count',)

# Mühürleme
admin.site.register(City, CityAdmin)
admin.site.register(District, DistrictAdmin)