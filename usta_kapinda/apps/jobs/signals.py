import logging
import math
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction, models
from django.core.cache import cache
from prometheus_client import Counter, Histogram

from .models import JobOffer

logger = logging.getLogger("scoring_audit")

# 📊 MONITORING (Granular Metrics - 0'dan başlayan bucketlar)
OFFER_SCORE_DISTRIBUTION = Histogram(
    'offer_score_values', 
    'Teklif skor dağılımı', 
    buckets=[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] # ✅ 0 eklendi
)

@receiver(post_save, sender=JobOffer)
def calculate_offer_score_receiver(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(lambda: ScoringService.process_single_offer(instance.id))

class ScoringService:
    @staticmethod
    def process_single_offer(offer_id):
        try:
            offer = JobOffer.objects.select_related('job', 'master').get(id=offer_id)
            job = offer.job
            
            # ✅ Job-Based Denominator Caching (Performance)
            cache_key = f"score_denom_{job.id}"
            denom = cache.get(cache_key)
            if not denom:
                max_b = float(job.budget_max or 0)
                min_b = float(job.budget_min or 0)
                denom = max_b - (min_b * 0.6) + 1.0
                cache.set(cache_key, denom, 3600)

            price = float(offer.price)
            max_b = float(job.budget_max or 0)
            min_b = float(job.budget_min or 0)
            days = float(offer.duration_days)
            score = 0.0

            # --- A) %40 FİYAT PUANLAMA (Clamped & Efficient) ---
            if price > max_b:
                score += 5.0 # Bütçe dışı çok düşük puan
            elif price < min_b * 0.6:
                score += 5.0 # Şüpheli ucuzluk cezası
            else:
                efficiency = (max_b - price) / denom
                score += 40.0 * min(1.0, max(0.2, efficiency))

            # --- B) %30 SÜRE PUANLAMA (Linear Decay) ---
            # 1 gün: 30p, 10 gün: 7.5p (Lineer azalma)
            linear_days_score = 30.0 - ((days - 1) * 2.5)
            score += max(5.0, min(30.0, linear_days_score))

            # --- C) %15 EARLY BIRD (Count-Based) ---
            # İlk 3 teklife bonus (biraz düşürüldü: 20 → 15)
            offer_count = JobOffer.objects.filter(job_id=job.id).count()
            if offer_count <= 3:
                score += 15.0  # ✅ 20 yerine 15 (daha dengeli)
                JobOffer.objects.filter(id=offer_id).update(is_early_bird=True)

            # --- D) %15 REPUTATION ---
            master_rating = float(offer.master.rating or 0.0)
            score += (master_rating * 3.0)  # ✅ 2.0 yerine 3.0 (max 15 puan)

            # 2. FINAL ATOMIC UPDATE
            final_score = round(min(100.0, score), 2)
            JobOffer.objects.filter(id=offer_id).update(score=final_score)
            
            OFFER_SCORE_DISTRIBUTION.observe(final_score)
            logger.info(f"Final Scoring: {offer_id} | Score: {final_score} | Job: {job.id}")

        except Exception as e:
            logger.error(f"Scoring Engine Critical Failure: {str(e)}")