from rest_framework import serializers
from .models import District, City

class CitySerializer(serializers.ModelSerializer):
    """Şehirleri listeleyen temel serializer."""
    class Meta:
        model = City
        fields = ['id', 'name', 'slug']

class DistrictSerializer(serializers.ModelSerializer):
    """İlçeleri, bağlı olduğu şehrin temel bilgisiyle birlikte sunar."""
    city = CitySerializer(read_only=True)

    class Meta:
        model = District
        fields = ['id', 'name', 'slug', 'city', 'master_count']

