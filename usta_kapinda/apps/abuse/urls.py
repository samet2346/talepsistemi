from django.urls import path
from . import views

app_name = 'abuse'

urlpatterns = [
    # 🚨 Şikayet Oluşturma
    path('report/', views.AbuseReportCreateView.as_view(), name='report_create'),
    
    # 📋 Şikayet Listesi (Admin)
    path('reports/', views.AbuseReportListView.as_view(), name='report_list'),

    # 🆔 Cihaz Senkronizasyonu
    path('fingerprint/sync/', views.FingerprintSyncView.as_view(), name='fingerprint_sync'),

    # 🔍 Kendi Sicilini Sorgula (Senin views.py'daki ismin bu)
    path('my-score/', views.MySecurityProfileView.as_view(), name='my_score'),

    # 📊 Tüm Siciller (Admin)
    path('all-scores/', views.AllSpamScoresView.as_view(), name='all_scores'),
]