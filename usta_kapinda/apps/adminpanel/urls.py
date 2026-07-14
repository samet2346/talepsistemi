from django.urls import path
from .views import DashboardStatsView, SiteSettingsView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='admin-dashboard'),
    path('settings/', SiteSettingsView.as_view(), name='admin-settings'),
]