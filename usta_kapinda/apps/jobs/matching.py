import logging
import random
from django.db.models import F, Q, ExpressionWrapper, FloatField, Count, Avg
from django.db.models.functions import Log, Coalesce
from django.contrib.gis.db.models.functions import Distance
from django.core.cache import cache
from django.conf import settings

from masters.models import MasterProfile

logger = logging.getLogger("matching_audit")

class MatchingEngine:
    """
    🏗️ ULTIMATE MATCHING ENGINE (Production Sealed)
    Features: Optimized Query (Single Fetch), Random Injection, Adaptive Expansion, 
    and PostGIS-safe Filtering.
    """

    @classmethod
    def generate_wave_plan(cls, job):
        # 1. DYNAMIC CONFIGS (Category-Specific)
        scores = getattr(settings, 'MATCHING_SCORE_WEIGHTS', {
            'rating': 10.0, 'log_completed': 15.0, 'active_bid_penalty': 12.0,
            'distance_penalty': 8.0, 'premium_boost': 12.0
        })
        config = cls._get_category_config(job.category_id)

        # 2. CORE GEOSPATIAL FILTERING (Safe PostGIS Annotation)
        # Not: F() ifadesini lte içinde kullanmak riskli olduğu için annotate sonrası filter yapıyoruz.
        base_masters = MasterProfile.objects.annotate(
            dist_m=Distance('location', job.location)
        ).filter(
            category=job.category,
            is_active=True,
            user__is_active=True,
            # Master'ın servis yarıçapı kontrolü (PostgreSQL & PostGIS optimized)
            dist_m__lte=F('service_radius_km') * 1000 
        ).exclude(
            Q(user=job.owner) | Q(blacklisted_by=job.owner)
        )

        # 3. RANKING & WORKLOAD ANALYSIS
        scored_masters = base_masters.annotate(
            active_bids=Coalesce(Count('job_offers', filter=Q(
                job_offers__job__status__in=['pending', 'offer_received']
            )), 0),
            match_score=ExpressionWrapper(
                (F('rating') * scores['rating']) + 
                (Log(10, F('completed_jobs_count') + 1) * scores['log_completed']) - 
                (F('active_bids') * scores['active_bid_penalty']) - 
                ((F('dist_m') / 1000) * scores['distance_penalty']) +
                (models.Case(models.When(is_plus=True, then=scores['premium_boost']), default=0)),
                output_field=FloatField()
            )
        ).filter(match_score__gte=config['min_score_threshold']).order_by('-match_score')

        # 🚀 PERFORMANCE FIX: Tek sorgu ile Wave 1 + Wave 2 havuzunu çek
        total_limit = config['wave_1_limit'] + config['wave_2_limit']
        master_pool = list(scored_masters[:total_limit].values_list('id', flat=True))
        
        # 4. RANDOMIZED BOOTSTRAPPING (Adaletli Dağıtım)
        # Yeni ve yüksek potansiyelli ustaları bul
        new_masters = list(base_masters.filter(
            completed_jobs_count__lt=10, 
            rating__gte=4.0
        )[:5].values_list('id', flat=True))

        # Wave Ayrımı
        wave_1_ids = master_pool[:config['wave_1_limit']]
        wave_2_ids = master_pool[config['wave_1_limit']:]

        # ✅ NEW MASTER INJECTION: Başa değil, rastgele bir pozisyona yerleştir (Organik görünüm)
        if new_masters:
            random.shuffle(new_masters)
            for m_id in new_masters[:2]:
                if m_id not in wave_1_ids and m_id not in wave_2_ids:
                    # Wave 1'de rastgele bir index seç
                    pos = random.randint(0, len(wave_1_ids)) if wave_1_ids else 0
                    wave_1_ids.insert(pos, m_id)

        # 5. ADAPTIVE EXPANSION
        expansion_needed = len(wave_1_ids) < config['min_liquidity']
        
        return {
            "wave_1": [str(uid) for uid in wave_1_ids],
            "wave_2": [str(uid) for uid in wave_2_ids],
            "expansion_required": expansion_needed,
            "suggested_radius": cls._calculate_expansion(job.category.default_radius, job.is_rural),
            "meta": {
                "filtered_pool_size": len(master_pool),
                "avg_score": scored_masters.aggregate(Avg('match_score'))['match_score__avg'] or 0
            }
        }

    @staticmethod
    def _get_category_config(category_id):
        cache_key = f"match_cfg_{category_id}"
        cfg = cache.get(cache_key)
        if not cfg:
            # 💡 Sinyör Not: Burada Category modelinden bu değerleri çekmek en iyisi
            # category = Category.objects.get(id=category_id)
            cfg = {
                'wave_1_limit': 12, 'wave_2_limit': 24,
                'min_score_threshold': 10.0, 'min_liquidity': 4
            }
            cache.set(cache_key, cfg, 600)
        return cfg

    @staticmethod
    def _calculate_expansion(current_km, is_rural):
        """🌍 Coğrafi Genişleme (Şehir/Kırsal Duyarlı)"""
        multiplier = 2.0 if is_rural else 1.5
        return min(current_km * multiplier, 100)