from django.db.models import Avg


def calculate_trust_score(user):
    from reviews.models import Review
    from jobs.models import Job, Bid

    # 1. Review Rating (%40)
    reviews = Review.objects.filter(reviewee=user)
    if reviews.exists():
        agg = reviews.aggregate(
            q=Avg('rating_quality'),
            s=Avg('rating_speed'),
            p=Avg('rating_price_loyalty'),
        )
        avg_rating = (agg['q'] + agg['s'] + agg['p']) / 3
        rating_score = (avg_rating / 5) * 40
    else:
        rating_score = 18  # Yeni usta başlangıç bonusu

    # 2. Job Completion Rate (%30)
    accepted_bids = Bid.objects.filter(provider=user, status='ACCEPTED').count()
    completed_jobs = Job.objects.filter(
        bids__provider=user,
        bids__status='ACCEPTED',
        status='completed',
    ).distinct().count()
    if accepted_bids > 0:
        completion_rate = (completed_jobs / accepted_bids) * 30
    else:
        completion_rate = 15  # Yeni usta bonusu

    # 3. Badge Bonus (%15)
    badge_bonus = 15 if user.is_face_verified else 0
    if user.avatar_url and user.bio and user.provider_title:
        badge_bonus = min(badge_bonus + 5, 15)

    # 4. Response Speed (%15) — Şimdilik sabit, V2'de gerçek hesaplama
    response_score = 10

    total = rating_score + completion_rate + badge_bonus + response_score
    return round(min(total, 100), 2)
