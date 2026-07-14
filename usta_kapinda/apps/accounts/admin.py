from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from .models import User
from masters.models import MasterProfile 

# 🛠️ 1. MASTER PROFILE INLINE
class MasterProfileInline(admin.StackedInline):
    model = MasterProfile
    can_delete = False
    verbose_name_plural = 'Usta Profili Detayları (Masters Uygulaması)'
    fk_name = 'user'
    extra = 0

# 2. YENİ KULLANICI FORMU
class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(label='Parola', widget=forms.PasswordInput)
    
    class Meta:
        model = User
        fields = ('phone', 'email', 'full_name', 'role', 'is_staff', 'is_active')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

# 3. ANA ADMIN SINIFI
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = forms.ModelForm 
    
    inlines = (MasterProfileInline,) 
    actions = ['approve_users_action', 'reject_users_action']

    # 📋 Liste Ekranı
    list_display = ('phone', 'full_name', 'role', 'get_category', 'get_district', 'is_approved', 'is_email_verified')
    list_filter = ('role', 'is_approved', 'is_email_verified', 'is_staff')
    search_fields = ('phone', 'email', 'full_name')
    ordering = ('-date_joined',)

    # ➕ Yeni Ekleme Ekranı
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'full_name', 'email', 'password', 'role', 'is_staff', 'is_active'),
        }),
    )

    # 📝 Düzenleme Ekranı (Hatasız ve Temiz Yapı)
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Kişisel Bilgiler', {'fields': ('full_name', 'email', 'first_name', 'last_name')}),
        ('Marketplace Durumu', {'fields': ('role', 'is_approved', 'is_active')}),
        ('Güvenlik/Doğrulama', {'fields': ('is_email_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Önemli Tarihler', {'fields': ('last_login', 'date_joined')}),
    )

    # 🛡️ Uzmanlık Bilgilerini Profil Üzerinden Çeken Metodlar
    def get_category(self, obj):
        try:
            # Sinyör dokunuşu: master_profile var mı kontrol et
            if hasattr(obj, 'master_profile') and obj.master_profile.category:
                return obj.master_profile.category.name
            return "-"
        except Exception:
            return "-"
    get_category.short_description = 'Kategori'

    def get_district(self, obj):
        try:
            if hasattr(obj, 'master_profile') and obj.master_profile.district:
                return obj.master_profile.district.name
            return "-"
        except Exception:
            return "-"
    get_district.short_description = 'İlçe'

    @admin.action(description='Seçili kullanıcıları ONAYLA')
    def approve_users_action(self, request, queryset):
        # Toplu update yerine save() tetikliyoruz ki sinyaller çalışsın
        for user in queryset:
            user.is_approved = True
            user.save()
        self.message_user(request, "Seçili kullanıcılar onaylandı.")

    @admin.action(description='Seçili kullanıcıların ONAYINI KALDIR')
    def reject_users_action(self, request, queryset):
        for user in queryset:
            user.is_approved = False
            user.save()
        self.message_user(request, "Onaylar kaldırıldı.")