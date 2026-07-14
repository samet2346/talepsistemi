from prometheus_client import Counter, Histogram, Gauge, Summary

# 🚀 İş Hacmi Metrikleri
JOBS_CREATED_TOTAL = Counter(
    'jobs_created_total', 
    'Toplam oluşturulan iş', 
    ['category_slug', 'strategy']  # ✅ strategy eklendi (NORMAL/SHADOW)
)

OFFERS_RECEIVED_TOTAL = Counter(
    'offers_received_total', 
    'Toplam gelen teklif', 
    ['wave', 'status']  # ✅ status eklendi (accepted/rejected)
)

JOBS_COMPLETED_TOTAL = Counter(
    'jobs_completed_total', 
    'Toplam tamamlanan iş', 
    ['category_slug']
)

JOBS_CANCELLED_TOTAL = Counter(
    'jobs_cancelled_total', 
    'Toplam iptal edilen iş', 
    ['reason']  # customer_cancelled / system_error / timeout
)

# ⏱️ Hız Metrikleri
TIME_TO_FIRST_OFFER = Histogram(
    'job_first_offer_seconds', 
    'İlk teklife kadar geçen süre',
    buckets=[30, 60, 300, 600, 1800, 3600, 7200]  # ✅ 2 saat eklendi
)

OFFER_RESPONSE_TIME = Histogram(
    'offer_response_time_seconds',
    'Usta cevap süresi (teklif verme hızı)',
    buckets=[10, 30, 60, 300, 600, 1800]
)

JOB_COMPLETION_TIME = Histogram(
    'job_completion_time_hours',
    'İşin tamamlanma süresi (saat)',
    buckets=[1, 6, 12, 24, 48, 72, 168]  # 1 saat - 7 gün
)

# 🎯 Skor Metrikleri
OFFER_SCORE_DISTRIBUTION = Histogram(
    'offer_score_values', 
    'Teklif skor dağılımı', 
    buckets=[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
)

MASTER_SCORE_DISTRIBUTION = Histogram(
    'master_score_values',
    'Usta performans skor dağılımı',
    buckets=[0, 20, 40, 60, 80, 100]
)

# 🌡️ Anlık Durum (Gauges)
ACTIVE_JOBS_GAUGE = Gauge(
    'active_jobs_count', 
    'Sistemdeki aktif iş sayısı',
    ['status']  # pending / offer_received / matched
)

ONLINE_MASTERS_GAUGE = Gauge(
    'online_masters_count', 
    'WebSocket\'e bağlı usta sayısı'
)

ONLINE_CUSTOMERS_GAUGE = Gauge(
    'online_customers_count',
    'WebSocket\'e bağlı müşteri sayısı'
)

PENDING_OFFERS_GAUGE = Gauge(
    'pending_offers_count',
    'Cevaplanmayı bekleyen teklif sayısı'
)

# 💰 Finansal Metrikler
TOTAL_BUDGET_IN_FLIGHT = Gauge(
    'total_budget_in_flight',
    'Aktif işlerdeki toplam bütçe (TL)'
)

AVG_JOB_BUDGET = Summary(
    'avg_job_budget',
    'Ortalama iş bütçesi'
)

# 🚨 Hata Metrikleri
BROADCAST_FAILURES = Counter(
    'broadcast_failures_total',
    'Broadcast hataları',
    ['wave', 'reason']
)

SCORING_FAILURES = Counter(
    'scoring_failures_total',
    'Skorlama hataları',
    ['component']  # offer_score / master_score
)

# 🌍 Coğrafi Metrikler
JOBS_BY_CITY = Counter(
    'jobs_by_city_total',
    'Şehir bazlı iş dağılımı',
    ['city']
)

MASTERS_BY_CITY = Gauge(
    'masters_by_city',
    'Şehir bazlı usta sayısı',
    ['city']
)