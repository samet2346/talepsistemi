from django.contrib import admin
from django.utils import timezone
from .models import (
    DeviceFingerprint, DeviceUserSession, VelocityLog, 
    ShadowBanList, SpamScore, IPBlacklist, UserLoginHistory, AbuseReport
)

@admin.register(DeviceFingerprint)
class DeviceFingerprintAdmin(admin.ModelAdmin):
    list_display = ('device_hash', 'last_seen', 'is_suspicious', 'platform')
    list_filter = ('is_suspicious', 'platform')
    search_fields = ('device_hash', 'user_agent')
    # first_seen burada var, sorun yok
    readonly_fields = ('device_hash', 'user_agent', 'first_seen')

@admin.register(DeviceUserSession)
class DeviceUserSessionAdmin(admin.ModelAdmin):
    list_display = ('device', 'user', 'ip_address', 'last_seen')
    list_filter = ('last_seen',)
    search_fields = ('user__username', 'ip_address')
    # FIX: first_seen bu modelde yok, last_seen readonly yapıldı
    readonly_fields = ('last_seen',)

@admin.register(VelocityLog)
class VelocityLogAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'device_hash', 'endpoint', 'request_count', 'window_start')
    list_filter = ('endpoint',)
    search_fields = ('ip_address', 'device_hash')
    readonly_fields = ('ip_address', 'device_hash', 'endpoint', 'request_count', 'window_start', 'expires_at')

@admin.register(ShadowBanList)
class ShadowBanListAdmin(admin.ModelAdmin):
    # FIX: is_active yerine check_active (aşağıdaki metod) eklendi
    list_display = ('target_type', 'get_target', 'severity', 'expires_at', 'check_active')
    list_filter = ('target_type', 'severity', 'expires_at')
    search_fields = ('target_ip', 'target_device', 'user__username')
    readonly_fields = ('created_at',)

    def get_target(self, obj):
        return obj.user or obj.target_ip or obj.target_device
    get_target.short_description = "Hedef"

    # FIX: Sanal bir 'is_active' kolonu oluşturuyoruz
    def check_active(self, obj):
        if obj.expires_at is None: return True
        return obj.expires_at > timezone.now()
    check_active.boolean = True
    check_active.short_description = "Aktif mi?"

@admin.register(SpamScore)
class SpamScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'risk_level', 'last_updated')
    list_filter = ('score',)
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('last_updated',)

@admin.register(IPBlacklist)
class IPBlacklistAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'reason', 'expires_at', 'created_at')
    list_filter = ('expires_at',)
    search_fields = ('ip_address', 'reason')
    readonly_fields = ('created_at',)

@admin.register(UserLoginHistory)
class UserLoginHistoryAdmin(admin.ModelAdmin):
    # FIX: login_time yerine modeldeki gerçek isim olan created_at kullanıldı
    list_display = ('user', 'ip_address', 'created_at', 'success')
    list_filter = ('success', 'created_at')
    search_fields = ('user__username', 'ip_address')
    readonly_fields = ('created_at',)

@admin.register(AbuseReport)
class AbuseReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reported_user', 'reason', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'reason')
    search_fields = ('reporter__username', 'reported_user__username', 'description')
    readonly_fields = ('created_at',)