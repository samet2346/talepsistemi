import uuid

from django.contrib.auth import get_user_model
from django.http import Http404
from django.utils.text import slugify
from rest_framework import viewsets, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer

from services.models import Category
from locations.models import District
from masters.serializers import MasterListSerializer, MasterDetailSerializer, get_provider_slug
from masters.filters import ProviderFilter
from services.serializers import CategorySerializer
from locations.serializers import DistrictSerializer

User = get_user_model()


class MasterViewSet(viewsets.ReadOnlyModelViewSet):
    """P2P usta vitrini — User tablosundan (is_provider=True)."""

    queryset = (
        User.objects.filter(
            is_provider=True,
            is_active=True,
            is_banned=False,
            is_deleted=False,
        )
        .order_by('-trust_score')
    )
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'
    lookup_value_regex = r'[\w.-]+'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProviderFilter
    search_fields = ['provider_title', 'bio', 'full_name']
    ordering_fields = ['trust_score', 'date_joined']
    ordering = ['-trust_score']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MasterDetailSerializer
        return MasterListSerializer

    def get_object(self):
        lookup = self.kwargs[self.lookup_field]
        queryset = self.filter_queryset(self.get_queryset())

        try:
            uuid.UUID(str(lookup))
            return queryset.get(pk=lookup)
        except (ValueError, User.DoesNotExist):
            pass

        for provider in queryset:
            if get_provider_slug(provider) == lookup:
                return provider
            if slugify(provider.phone or '') == lookup:
                return provider

        raise Http404


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.filter(is_active=True)
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]


class ConfigAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        responses={
            200: inline_serializer(
                name='ConfigResponse',
                fields={
                    'districts': DistrictSerializer(many=True),
                    'categories': CategorySerializer(many=True),
                },
            ),
        },
    )
    def get(self, request):
        districts = District.objects.filter(is_active=True)
        categories = Category.objects.filter(is_active=True)
        return Response({
            'districts': DistrictSerializer(districts, many=True).data,
            'categories': CategorySerializer(categories, many=True).data,
        })
