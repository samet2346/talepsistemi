from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Category

# 🚨 SİNYÖR ÖNLEMİ: Eğer Category zaten kayıtlıysa kaydı sil ki çakışma olmasın
if admin.site.is_registered(Category):
    admin.site.unregister(Category)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['get_name_with_level', 'parent_link', 'display_icon', 'order', 'is_active', 'subcategory_count']
    list_display_links = ['get_name_with_level']
    list_filter = ['is_active', ('parent', admin.RelatedOnlyFieldListFilter)]
    search_fields = ['name', 'description']
    list_editable = ['order', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['parent']

    def subcategory_count(self, obj):
        return obj.children.count()
    subcategory_count.short_description = "Alt Kat. Sayısı"

    def get_name_with_level(self, obj):
        level = 0
        p = obj.parent
        while p:
            level += 1
            p = p.parent
        indent = '&nbsp;' * (level * 8)
        dash = '↳ ' if level > 0 else ''
        return format_html(f'{indent}{dash}{obj.name}')
    get_name_with_level.short_description = "Kategori Yapısı"

    def display_icon(self, obj):
        if obj.icon_name:
            return format_html(f'<code style="color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">{obj.icon_name}</code>')
        return "-"
    display_icon.short_description = "İkon"

    def parent_link(self, obj):
        if obj.parent:
            url = reverse('admin:services_category_change', args=[obj.parent.id])
            return format_html(f'<a href="{url}">{obj.parent.name}</a>')
        return "-"
    parent_link.short_description = "Üst Kategori"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent').prefetch_related('children')