from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user', 'model_name', 'action', 'object_repr', 'ip_address']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['object_repr', 'user__email', 'model_name', 'object_id']
    readonly_fields = [f.name for f in AuditLog._meta.fields] # Tüm alanlar salt okunur

    def has_add_permission(self, request): return False
    def has_delete_permission(self, request, obj=None): return False
    def has_change_permission(self, request, obj=None): return False

    # Senior dokunuşu: Değişiklikleri JSON formatında güzelce göster
    def get_readonly_fields(self, request, obj=None):
        return self.readonly_fields