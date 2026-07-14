import logging
from datetime import timedelta
from django.db.models import Count, Avg, F, Q, ExpressionWrapper, DurationField, FloatField
from django.db.models.functions import Coalesce, Cast
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from .models import Job, JobOffer
from masters.models import MasterProfile

logger = logging.getLogger("analytics_audit")

class AnalyticsService:
    """
    🏗️ SOVEREIGN ANALYTICS SERVICE
    Features: Atomic Scoring, Liquidity Health Monitoring, Duration-Aware Metrics.
    """

    @staticmethod
    def calculate_master_performance_score(master_id):
        """
        🎯 USTA PERFORMANS SKORLAMA (V5 - Production Sealed)
        Role: Response time, Completion rate, and Quality metrics with cache invalidation.
        """
        cache_key = f"master_score_{master_id}"
        cached_score = cache.get(cache_key)
        if cached_score: 
            return cached_score

        # 1. ATOMIC ANNOTATION (PostgreSQL Compatible)
        master_qs = MasterProfile.objects.filter(id=master_id).annotate(
            total_jobs=Count('assigned_jobs'),
            completed_count=Count('assigned_jobs', filter=Q(assigned_jobs__status='completed')),
            cancelled_count=Count('assigned_jobs', filter=Q(assigned_jobs__status='cancelled')),
            avg_resp_time=Avg(
                ExpressionWrapper(
                    F('job_offers__created_at') - F('job_offers__job__created_at'),
                    output_field=DurationField()
                )
            )
        )

        try:
            master = master_qs.get()
            if master.total_jobs == 0: 
                return 50.0

            # 2. METRIC NORMALIZATION
            comp_rate = (master.completed_count / master.total_jobs) * 100
            can_penalty = (master.cancelled_count / master.total_jobs) * 100
            rating_score = (master.rating or 0.0) * 20.0
            
            # ✅ Yanıt Hızı (48 saat default - hiç teklif vermemiş usta için)
            if master.avg_resp_time:
                resp_seconds = master.avg_resp_time.total_seconds()
            else:
                resp_seconds = getattr(settings, 'DEFAULT_RESPONSE_TIME', 172800)  # 48 saat
            
            # Saatte 4 puan düşer (30dk:98p, 24s:4p, 48s:0p)
            resp_score = max(0, 100 - (resp_seconds / 3600 * 4))

            # 3. FINAL WEIGHTED FORMULA
            score = (comp_rate * 0.3) + (rating_score * 0.3) + (resp_score * 0.2) - (can_penalty * 0.2)
            final_score = round(max(0, min(100, score)), 2)

            cache.set(cache_key, final_score, 3600)
            return final_score

        except MasterProfile.DoesNotExist:
            return 0.0

    @staticmethod
    def get_market_liquidity(category_id, district_id=None):
        """
        💧 MARKET LİKİDİTE VE SAĞLIK ANALİZİ (V2)
        """
        last_24h = timezone.now() - timedelta(hours=24)
        jobs = Job.objects.filter(category_id=category_id, created_at__gte=last_24h)
        if district_id: 
            jobs = jobs.filter(district_id=district_id)

        stats = jobs.annotate(
            offer_count=Count('offers')
        ).aggregate(
            total=Count('id'),
            avg_offers=Coalesce(Avg('offer_count'), 0.0),
            no_offer_count=Count('id', filter=Q(offers__isnull=True))
        )

        if stats['total'] == 0:
            return {
                "status": "INACTIVE", 
                "liquidity_score": 0,
                "recommendation": "NO_DATA"
            }

        # ✅ Magic Numbers -> Settings
        no_offer_rate = (stats['no_offer_count'] / stats['total']) * 100
        offer_weight = getattr(settings, 'LIQUIDITY_OFFER_WEIGHT', 20)
        no_offer_penalty = getattr(settings, 'LIQUIDITY_NO_OFFER_PENALTY', 0.5)
        
        l_score = min(100, (stats['avg_offers'] * offer_weight) - (no_offer_rate * no_offer_penalty))
        
        status = "HIGH" if l_score > 75 else "MEDIUM" if l_score > 40 else "LOW"
        
        return {
            "total_jobs_24h": stats['total'],
            "avg_offers": round(stats['avg_offers'], 1),
            "no_offer_rate": round(no_offer_rate, 2),
            "liquidity_score": int(l_score),
            "health_status": status,
            "recommendation": "EXPAND_RADIUS" if status == "LOW" else "NORMAL"
        }


# 🎯 SIGNAL FOR CACHE INVALIDATION
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Job

@receiver(post_save, sender=Job)
def invalidate_master_score_cache(sender, instance, **kwargs):
    """
    Usta yeni iş tamamlayınca cache'i sil
    """
    if instance.assigned_master_id:
        cache.delete(f"master_score_{instance.assigned_master_id}")