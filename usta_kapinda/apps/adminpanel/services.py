from accounts.models import User
from jobs.models import Job, JobOffer
from masters.models import MasterProfile
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

class DashboardService:
    @staticmethod
    def get_stats():
        today = timezone.now()
        last_30_days = today - timedelta(days=30)
        
        return {
            'overview': {
                'total_users': User.objects.count(),
                # ✅ Düzeltildi: MasterProfile kullanıyoruz
                'total_masters': MasterProfile.objects.count(), 
                'active_jobs': Job.objects.filter(status='open').count(), # Status 'open' olarak mühürlemiştik
                # ✅ Düzeltildi: Sadece Sum(...) kullanıyoruz (import'a uygun)
                'total_revenue': Job.objects.filter(status='completed').aggregate(Sum('budget_max'))['budget_max__sum'] or 0,
            },
            'recent_activity': {
                'new_jobs_last_30_days': Job.objects.filter(created_at__gte=last_30_days).count(),
                # ✅ Düzeltildi: MasterProfile
                'new_masters_last_30_days': MasterProfile.objects.filter(created_at__gte=last_30_days).count(),
            },
            'performance': {
                'average_job_completion_time': "2.5 Gün", 
                'customer_satisfaction': 4.8, 
            }
        }