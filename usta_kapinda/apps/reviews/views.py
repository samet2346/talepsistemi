from rest_framework import viewsets, decorators, permissions, status
from rest_framework.response import Response
from django.utils import timezone

from jobs.models import Job, Bid
from .models import Review
from .serializers import ReviewSerializer, ReviewReplySerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('reviewer', 'reviewee', 'job')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        reviewee_id = self.request.query_params.get('reviewee_id')
        if reviewee_id:
            queryset = queryset.filter(reviewee_id=reviewee_id)
        return queryset

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        if not job_id:
            return Response({'detail': 'job alanı zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return Response({'detail': 'İş bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        if job.status != Job.Status.COMPLETED:
            return Response(
                {'detail': 'İş tamamlanmadan yorum yapılamaz'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Review.objects.filter(job=job, reviewer=request.user).exists():
            return Response(
                {'detail': 'Bu iş için zaten yorum yaptınız'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if job.owner_id != request.user.pk:
            return Response(
                {'detail': 'Sadece iş sahibi yorum yapabilir.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        accepted_bid = (
            job.bids.filter(status=Bid.StatusChoices.ACCEPTED)
            .select_related('provider')
            .first()
        )
        if not accepted_bid:
            return Response(
                {'detail': 'Bu iş için kabul edilmiş bir teklif bulunamadı.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(
            reviewer=request.user,
            reviewee=accepted_bid.provider,
        )
        review.reviewee.update_trust_score()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.reviewer_id != request.user.pk:
            return Response(
                {'detail': 'Sadece kendi yorumunuzu düzenleyebilirsiniz.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    @decorators.action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        review = self.get_object()

        if review.reviewee_id != request.user.pk:
            return Response(
                {'detail': 'Bu yoruma sadece ilgili hizmet sağlayıcı yanıt verebilir.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ReviewReplySerializer(review, data=request.data)
        if serializer.is_valid():
            serializer.save(replied_at=timezone.now())
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
