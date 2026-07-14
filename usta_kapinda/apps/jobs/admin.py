from django.contrib import admin
from django.utils.html import format_html
from .models import Job, JobOffer

class JobOfferInline(admin.TabularInline):
    """İş detay sayfasında verilen teklifleri skora göre dizerek gösterir."""
    model = JobOffer
    extra = 0
    # 🚀 Sinyör Dokunuşu: Skor ve Teslim Süresi eklendi
    readonly_fields = ['master', 'price', 'duration_days', 'score', 'is_accepted', 'created_at']
    ordering = ['-score'] # En iyi teklif en üstte
    can_delete = False

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    # 🚀 Sinyör Dokunuşu: Atanan usta ve teklif sayısını listeye ekledik
    list_display = ['title', 'owner', 'category', 'district', 'status_colored', 'assigned_master', 'offer_count', 'created_at']
    list_filter = ['status', 'category', 'district', 'created_at']
    search_fields = ['title', 'description', 'owner__phone', 'owner__full_name']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'cancelled_at']
    inlines = [JobOfferInline]
    
    # 🎨 Renkli Statü Etiketleri (Admin paneli canlansın)
    def status_colored(self, obj):
        colors = {
            'pending': '#f39c12',  # Turuncu
            'matched': '#3498db',  # Mavi
            'on_way': '#9b59b6',   # Mor
            'completed': '#27ae60', # Yeşil
            'cancelled': '#e74c3c', # Kırmızı
        }
        return format_html(
            '<b style="color: {};">{}</b>',
            colors.get(obj.status, '#000'),
            obj.get_status_display()
        )
    status_colored.short_description = "İş Durumu"

@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    # 🚀 Sinyör Dokunuşu: Skor ve fiyatı yan yana getirdik
    list_display = ['job', 'get_master_name', 'price', 'score', 'is_accepted', 'created_at']
    list_filter = ['is_accepted', 'created_at']
    search_fields = ['master__business_name', 'master__user__full_name', 'job__title']
    readonly_fields = ['score']

    def get_master_name(self, obj):
        return obj.master.business_name or obj.master.user.full_name
    get_master_name.short_description = "Usta/Dükkan Adı"