from django.urls import path
from .views import DistrictListView, CityListView

app_name = 'locations'

urlpatterns = [
    # 🏙️ Şehir Listesi -> GET /api/v1/locations/cities/
    path('cities/', CityListView.as_view(), name='city-list'),
    
    # 🏘️ İlçe Listesi -> GET /api/v1/locations/districts/?city=istanbul
    path('districts/', DistrictListView.as_view(), name='district-list'),

    # 🗺️ Root Endpoint -> GET /api/v1/locations/ 
    # (Geriye dönük uyumluluk veya genel hiyerarşi için aktif kalabilir)
    path('', DistrictListView.as_view(), name='district_list'),
]