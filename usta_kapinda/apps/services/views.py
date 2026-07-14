from rest_framework import viewsets, decorators, status
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    🏗️ HİZMET KATALOĞU MOTORU
    - N+1 problemini çözmek için select_related/prefetch_related kullanır.
    - Dinamik arama ve derinlik kontrolü sağlar.
    """
    serializer_class = CategorySerializer
    # Sinyor Dokunuşu 1: Veritabanını yormamak için 'children'ları tek seferde prefetch yapıyoruz
    queryset = Category.objects.filter(is_active=True).prefetch_related('children')

    def get_queryset(self):
        """
        🔍 GELİŞMİŞ FİLTRELEME
        ?top_level=true  -> Sadece ana kategorileri getirir (Ağaç yapısı için)
        ?search=boya     -> İsme göre filtreler
        """
        queryset = self.queryset
        top_level = self.request.query_params.get('top_level')
        search_query = self.request.query_params.get('search')

        if top_level == 'true':
            queryset = queryset.filter(parent=None)
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
            
        return queryset.order_by('order', 'name')

    @decorators.action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        """
        📂 /api/services/{id}/subcategories/ 
        Belirli bir kategorinin sadece alt kategorilerini döndürür.
        """
        category = self.get_object()
        subcategories = category.children.filter(is_active=True)
        serializer = self.get_serializer(subcategories, many=True)
        return Response(serializer.data)

    @decorators.action(detail=False, methods=['get'])
    def popular(self, request):
        """
        🔥 POPÜLER KATEGORİLER
        En çok iş ilanı açılan veya en çok ustanın olduğu kategorileri hesaplar.
        (Şimdilik basitçe sıralamaya göre dönüyoruz, ilerde Job sayısına bağlarız)
        """
        popular_cats = self.queryset.filter(parent__isnull=False)[:8]
        serializer = self.get_serializer(popular_cats, many=True)
        return Response(serializer.data)

    @decorators.action(detail=False, methods=['get'])
    def tree(self, request):
        """
        🌳 FULL TREE STRUCTURE
        Next.js'teki Mega Menu veya Kategori listesi için tüm hiyerarşiyi döner.
        """
        roots = self.queryset.filter(parent=None)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)