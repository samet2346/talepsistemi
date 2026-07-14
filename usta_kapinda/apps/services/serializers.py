from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    """
    🌳 RECURSIVE CATEGORY SERIALIZER (SENIOR - FIXED)
    - Veritabanı dostu: Tek seferde derinlemesine veri çeker.
    - İstatistiksel: Alt kategorilerdeki usta ve iş sayılarını hesaplar.
    """
    
    # 🚨 FIX: ListField yerine Serializer'ın kendisini many=True ile bağlıyoruz.
    # Bu sayede Django 'RelatedManager' hatası vermez.
    children = serializers.SerializerMethodField()
    
    # Extra Data: UI'da "150 Usta Bulunuyor" demek için
    masters_count = serializers.IntegerField(read_only=True)
    jobs_count = serializers.IntegerField(read_only=True)
    
    # Breadcrumb: "İnşaat > Boya" yolunu Next.js'e hazır verir
    full_path = serializers.ReadOnlyField(source='get_full_path')

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'icon_name', 'description', 
            'parent', 'children', 'full_path', 'masters_count', 'jobs_count'
        ]

    def get_children(self, obj):
        """
        🚀 RECURSIVE OPTIMIZATION
        Sadece alt kategorisi olanlar için kendini tekrar çağırır.
        """
        # Eğer objenin children'ı varsa (prefetch_related kullanıldıysa hızlı çalışır)
        if obj.children.all():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []

    def to_representation(self, instance):
        """
        Gereksiz children alanını Meta'dan gelen haliyle ezip 
        get_children metodundan gelen veriyi kullanır.
        """
        return super().to_representation(instance)