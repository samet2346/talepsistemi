from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.contrib.auth import get_user_model

from .models import Job, Bid
from .serializers import JobSerializer, BidSerializer, BidCreateSerializer

User = get_user_model()


class JobViewSet(viewsets.ModelViewSet):
    """
    İş ve teklif yönetimi (P2P).
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
            if getattr(self, 'swagger_fake_view', False):
                return Job.objects.none()
            
            user = self.request.user
            base_query = Job.objects.select_related(
                'owner', 'category', 'district', 'assigned_master'
            ).prefetch_related('bids__provider')

            if user.is_provider:
                user_categories = getattr(user, 'categories', None)
                
                # 🚀 İSTİSNAYI ÇÖZEN KRİTİK FİLTRE HAFİSİ:
                # 1. Havuzda sadece bekleyen (PENDING) veya teklif alan (OFFER_RECEIVED) işler görünecek.
                # 2. VEYA iş kapansa bile (MATCHED/COMPLETED) eğer bu işe atanan usta BİZİMSE (assigned_master) o iş görünecek!
                provider_filter = (
                    Q(status=Job.Status.PENDING) | 
                    Q(status=Job.Status.OFFER_RECEIVED) |
                    Q(assigned_master__user=user)  # Ustanın kendi üstüne aldığı/tamamladığı işler istisnası
                )
                
                if user_categories:
                    has_items = user_categories.exists() if hasattr(user_categories, 'exists') else len(user_categories) > 0
                    
                    if has_items:
                        categories_list = user_categories.all() if hasattr(user_categories, 'all') else user_categories
                        
                        return base_query.filter(
                            provider_filter,
                            category__in=categories_list
                        ).exclude(owner=user).distinct()
                
                # Kategorisi yoksa ama açık ilanlar veya kendi aldığı işler havuzu
                return base_query.filter(provider_filter).exclude(owner=user).distinct()

            # Müşteriyse kendi açtığı her şeyi (aktif/pasif/biten) görmeye devam etsin
            return base_query.filter(owner=user)

            # Müşteriyse sadece kendi açtığı ilanları görür
            return base_query.filter(owner=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        job = serializer.save(owner=self.request.user)

        from notifications.models import Notification

        matching_providers = User.objects.filter(
            is_provider=True,
            is_active=True,
        ).exclude(id=self.request.user.id)

        notifications_to_create = []
        for provider in matching_providers:
            provider_categories = provider.categories or []
            category_ids = [c.get('id') for c in provider_categories if isinstance(c, dict)]

            if job.category_id in category_ids:
                notifications_to_create.append(
                    Notification(
                        recipient=provider,
                        sender=self.request.user,
                        notification_type=Notification.NotificationType.JOB_STATUS,
                        title="Yeni İş İlanı",
                        body=f"{job.category.name} kategorisinde yeni bir iş açıldı: {job.title}",
                    )
                )

        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)
    @extend_schema(
        summary='İşe teklif ver',
        request=BidCreateSerializer,
        responses={201: BidSerializer},
    )
    @decorators.action(detail=True, methods=['post'], url_path='give-offer')
    def give_offer(self, request, pk=None):
        job = self.get_object()
        user = request.user

        if job.owner_id == user.pk:
            return Response(
                {'detail': 'Kendi ilanınıza teklif veremezsiniz'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_provider:
            return Response(
                {'detail': 'Önce usta profilinizi tamamlayın'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Kategori kontrolü
        categories_manager = getattr(user, 'categories', None)
        if categories_manager is not None:
            try:
                if hasattr(categories_manager, 'exists') and categories_manager.exists():
                    if not categories_manager.filter(id=job.category_id).exists():
                        return Response(
                            {'detail': f'Bu iş ilanı sizin uzmanlık alanınız ({job.category.category_name}) ile uyuşmuyor!'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
            except AttributeError:
                pass

        # Haftalık limit sıfırlama mantığı (Sıfırlama süresi dolduysa hakkı yeniler)
        now = timezone.now()
        if user.weekly_bid_reset_at is None or (now - user.weekly_bid_reset_at).days >= 7:
            user.weekly_bid_count = 0
            user.weekly_bid_reset_at = now
            user.save(update_fields=['weekly_bid_count', 'weekly_bid_reset_at'])

        if job.status not in [Job.Status.PENDING, Job.Status.OFFER_RECEIVED]:
            return Response(
                {'detail': 'Bu iş tekliflere kapalıdır.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 🚀 1. ADIM: MEVCUT TEKLİF VAR MI KONTROLÜ (REVİZE DURUMU)
        existing_bid = Bid.objects.filter(job=job, provider=user).first()

        # 🚀 2. ADIM: HAFTALIK MAKSİMUM 10 FARKLI İŞ KONTROLÜ
        # Usta ilk defa teklif veriyorsa ve 10 limitine ulaştıysa durdur
        if not existing_bid and user.weekly_bid_count >= 10:
            return Response(
                {"error": "Haftalık maksimum 10 farklı işe teklif verme limitiniz doldu usta.", "code": "weekly_limit_exceeded"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # 🚀 3. ADIM: MAKSİMUM 3 REVİZE LİMİTİ KONTROLÜ
        # Modelde 'revision_count' yoksa getattr 0 döner, varsa mevcut değeri okur
        if existing_bid:
            current_revisions = getattr(existing_bid, 'revision_count', 0)
            if current_revisions >= 3:
                return Response(
                    {"error": "Bu iş için maksimum 3 revize (güncelleme) sınırına ulaştınız usta.", "code": "revision_limit_exceeded"},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        serializer = BidCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            if existing_bid:
                bid = serializer.update(existing_bid, serializer.validated_data)
                bid.revision_count = getattr(bid, 'revision_count', 0) + 1
                bid.save(update_fields=['revision_count', 'updated_at'])
            else:
                bid = serializer.save(job=job, provider=user)
                bid.revision_count = 0
                bid.save(update_fields=['revision_count'])
                
                job.status = Job.Status.OFFER_RECEIVED
                job.save(update_fields=['status', 'updated_at'])
            
                user.weekly_bid_count += 1
                user.save(update_fields=['weekly_bid_count'])

        from notifications.models import Notification
        Notification.objects.create(
            recipient=job.owner,
            sender=user,
            notification_type=Notification.NotificationType.OFFER,
            title="Yeni Teklif Var!" if not existing_bid else "Teklif Güncellendi",
            body=f"{user.provider_title or user.full_name} talebinize teklif verdi: {bid.price} TL",
        )

        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary='İlan tekliflerini listele', responses={200: BidSerializer(many=True)})
    @decorators.action(detail=True, methods=['get'], url_path='bids')
    def list_bids(self, request, pk=None):
        job = self.get_object()
        user = request.user

        # Ustaysa doğrudan boş liste dönüyoruz, diğer teklif verenleri asla göremiyor
        if job.owner_id != user.pk and user.is_provider:
            return Response([])

        # İş sahibi değilse ve usta da değilse engelle
        if job.owner_id != user.pk:
            return Response(
                {'detail': 'Sadece iş sahibi teklifleri görüntüleyebilir.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Müşteriyse teklifleri listele
        bids = job.bids.select_related('provider', 'provider__master_profile').order_by('-provider__trust_score')
        return Response(BidSerializer(bids, many=True).data)

    @extend_schema(summary='Teklifi kabul et')
    @decorators.action(detail=True, methods=['post'], url_path='accept-offer/(?P<offer_id>[^/.]+)')
    def accept_offer(self, request, pk=None, offer_id=None):
        job = self.get_object()

        if job.owner_id != request.user.pk:
            return Response(
                {'detail': 'Sadece iş sahibi teklif kabul edebilir.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if job.status not in [Job.Status.PENDING, Job.Status.OFFER_RECEIVED]:
           return Response(
                {'detail': 'Bu iş zaten bir ustaya atanmış veya kapanmış.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bid = job.bids.select_related('provider', 'provider__master_profile').get(id=offer_id)
        except Bid.DoesNotExist:
            return Response({'detail': 'Teklif bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(bid.provider, 'master_profile'):
            return Response(
                {'detail': 'Bu kullanıcının usta profili tanımlı değil, teklif kabul edilemiyor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            bid.status = Bid.StatusChoices.ACCEPTED
            bid.save(update_fields=['status'])

            job.bids.exclude(id=bid.id).update(status=Bid.StatusChoices.REJECTED)

            job.status = Job.Status.MATCHED
            job.assigned_master = bid.provider.master_profile
            job.save(update_fields=['status', 'updated_at', 'assigned_master'])

            # 🚀 Geriye dönük veya iç içe nesne patlamalarını önlemek için kesin User instance tespiti
            target_recipient = bid.provider
            if hasattr(bid.provider, 'user') and bid.provider.user:
                target_recipient = bid.provider.user

            # Proje standardına uygun import (Düz notifications)
            from notifications.models import Notification
            Notification.objects.create(
                recipient=target_recipient,
                notification_type=Notification.NotificationType.JOB_STATUS,
                title="Teklifiniz Kabul Edildi! 🎉",
                body=f"'{job.title}' işi için verdiğiniz teklif iş sahibi tarafından kabul edildi. Süreç başladı.",
                data={"job_id": job.id, "bid_id": bid.id},
                is_read=False
            )

        provider = bid.provider
        provider_name = provider.provider_title or provider.full_name or 'Usta'
        return Response({
            'status': f'{provider_name} seçildi. İş süreci başladı.',
            'job_id': job.id,
            'bid_id': bid.id,
            'provider_phone': provider.phone,
            'provider_name': provider_name,
        })

    @extend_schema(summary='İşi tamamla')
    @decorators.action(detail=True, methods=['post'], url_path='complete-job')
    def complete_job(self, request, pk=None):
        job = self.get_object()

        is_provider_assigned = job.assigned_master_id == request.user.pk
        is_owner = job.owner_id == request.user.pk

        if not (is_owner or is_provider_assigned):
            return Response(
                {'detail': 'Bu işlemi yapmaya yetkiniz yok.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if job.status not in [Job.Status.MATCHED, Job.Status.ON_WAY]:
            return Response(
                {'detail': 'Henüz eşleşmemiş veya iptal edilmiş bir işi tamamlayamazsınız.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job.status = Job.Status.COMPLETED
        job.save(update_fields=['status', 'updated_at'])

        if job.assigned_master:
            provider = job.assigned_master
            provider.total_jobs += 1
            provider.completed_jobs += 1
            provider.save(update_fields=['total_jobs', 'completed_jobs'])

        return Response({'status': 'İş başarıyla tamamlandı.'})

    @extend_schema(summary='Ustanın verdiği teklifleri listele', responses={200: BidSerializer(many=True)})
    @decorators.action(detail=False, methods=['get'], url_path='my-bids')
    def my_bids(self, request):
        # 🚀 USTA OLMAYAN MÜŞTERİYİ KAYDA TEŞVİK EDEN ÖZEL BAKIŞ
        if not request.user.is_provider:
            return Response({
                "is_provider": False,
                "message": "Henüz usta profiliniz bulunmuyor! Usta olarak teklif vermek ve para kazanmak için hemen usta kaydınızı tamamlayın usta.",
                "code": "not_a_provider",
                "bids": []
            }, status=status.HTTP_200_OK) # 🎯 200 OK dönüyoruz ki frontend rahatça okuyup yönlendirsin.

        bids = Bid.objects.filter(
            provider=request.user
        ).select_related('job', 'job__owner').order_by('-created_at')

        return Response(BidSerializer(bids, many=True).data)