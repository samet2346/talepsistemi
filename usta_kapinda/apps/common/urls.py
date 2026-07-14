from django.urls import path
from .views import ConfigAPIView

urlpatterns = [
    path('config/', ConfigAPIView.as_view(), name='app-config'),
]