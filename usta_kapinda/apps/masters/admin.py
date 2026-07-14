from django.contrib import admin
# Modeller kodun başka yerlerinde veya geçiş süreçlerinde (migration vb.) 
# sorun çıkarmasın diye import halinde kalabilir, ancak admin kaydı kapatılmıştır.
from .models import MasterProfile, MasterWorkImage

# DEPRECATED: P2P mimarisinde MasterProfile kaldırıldı.
# Usta profilleri artık User modeli üzerinden yönetilir.
# admin.site.register(MasterProfile, MasterProfileAdmin)
# admin.site.register(MasterWorkImage)


# 🖼️ Portfolyoyu detay sayfasında inline görmek için
class MasterWorkImageInline(admin.TabularInline):
    model = MasterWorkImage
    extra = 1 
    fields = ('image', 'caption')


# @admin.register(MasterProfile)
class MasterProfileAdmin(admin.ModelAdmin):
    """
    🏗️ PROD: Usta Yönetim ve Performans Takip Paneli
    """
    # 🚀 Sinyör Dokunuşu: business_name ve completion_score eklendi
    list_display = (
        'business_name', 
        'get_phone',
        'category', 
        'district', 
        'rating', 
        'completion_score_display', # Baraj puanı vitrinde
        'is_active', 
        'is_verified', 
        'created_at'
    )
    
    list_editable = ('is_active', 'is_verified')
    # Filtreler tekil alanlara göre güncellendi
    list_filter = ('is_active', 'is_verified', 'category', 'district')
    search_fields = ('business_name', 'bio', 'user__phone', 'user__full_name')
    
    # Detay sayfasını yeni model yapısına göre dizelim
    fieldsets = (
        ('Kimlik Bilgileri', {
            'fields': ('user', 'business_name', 'slug')
        }),
        ('Görsel & Tanıtım', {
            'fields': ('profile_photo', 'bio')
        }),
        ('Hizmet Tanımı', {
            'fields': (('category', 'district'), 'experience_year')
        }),
        ('Marketplace Durumu', {
            'fields': (('is_active', 'is_verified'), 'sort_order'),
            'description': 'Ustanın görünürlüğü ve onay durumu.'
        }),
        ('Performans ve Baraj', {
            'fields': (('rating', 'total_jobs', 'completed_jobs'), 'completion_score_display'),
            'description': 'Ustanın teklif verebilmesi için baraj puanı en az 60 olmalıdır.'
        }),
    )

    readonly_fields = ('completion_score_display', 'slug')
    inlines = [MasterWorkImageInline]
    list_select_related = ('user', 'category', 'district')

    # Telefon numarasını User modelinden çekelim
    def get_phone(self, obj):
        return obj.user.phone
    get_phone.short_description = "Telefon"

    # Baraj puanını admin için renklendirelim (Opsiyonel görsel dokunuş)
    def completion_score_display(self, obj):
        score = obj.completion_score
        color = "green" if score >= 60 else "red"
        from django.utils.html import format_html
        return format_html('<b style="color: {};">%{}</b>', color, score)
    completion_score_display.short_description = "Profil Doluluğu"


# Portfolyo resimlerine hızlıca bakmak için
# @admin.register(MasterWorkImage)
class MasterWorkImageAdmin(admin.ModelAdmin):
    list_display = ('master', 'caption', 'image')
    list_filter = ('master',)

# 🚀 NOT: Category ve District adminleri zaten Services ve Locations 
# uygulamalarında kayıtlı olduğu için burada tekrar etmeye gerek yok.