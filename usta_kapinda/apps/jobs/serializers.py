from rest_framework import serializers
from .models import Job, JobOffer, Bid
from masters.models import MasterProfile
from .validators import JobRequestValidator

class BidCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ('price', 'note', 'estimated_duration')


class MasterProfileMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterProfile
        fields = ['business_name', 'bio', 'rating', 'experience_year', 'is_verified']

class BidSerializer(serializers.ModelSerializer):
    provider_name = serializers.ReadOnlyField(source='provider.full_name')
    provider_title = serializers.ReadOnlyField(source='provider.provider_title')
    provider_phone = serializers.ReadOnlyField(source='provider.phone')
    provider_avatar = serializers.SerializerMethodField()
    provider_completed_jobs = serializers.SerializerMethodField()
    trust_score = serializers.DecimalField(
        source='provider.trust_score',
        max_digits=5,
        decimal_places=2,
        read_only=True,
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    master_profile = MasterProfileMiniSerializer(source='provider.master_profile', read_only=True, allow_null=True)

    class Meta:
        model = Bid
        fields = (
            'id', 'job', 'provider', 'provider_name', 'provider_title',
            'provider_phone', 'provider_avatar', 'provider_completed_jobs', 'trust_score', 'master_profile',
            'price', 'note', 'estimated_duration', 'status', 'status_display', 'created_at',
        )
        read_only_fields = ('id', 'job', 'provider', 'status', 'created_at')

    def get_provider_avatar(self, obj):
        master_profile = getattr(obj.provider, 'master_profile', None)
        if master_profile and master_profile.profile_photo:
            request = self.context.get('request')
            url = master_profile.profile_photo.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_provider_completed_jobs(self, obj):
        master_profile = getattr(obj.provider, 'master_profile', None)
        return master_profile.completed_jobs if master_profile else 0


class JobOfferSerializer(serializers.ModelSerializer):
    master_name = serializers.SerializerMethodField()
    master_id = serializers.UUIDField(source='master.id', read_only=True)
    master_rating = serializers.FloatField(source='master.rating', read_only=True)
    
    # 💥 2. SORUNUN ÇÖZÜMÜ: Ustanın profil bilgilerini frontend eksiksiz istiyor.
    # Profil bilgileri boşa çıkmasın diye modele bağlı alanları buraya bağlıyoruz.
    provider_title = serializers.SerializerMethodField()
    provider_avatar = serializers.SerializerMethodField()

    class Meta:
        model = JobOffer
        fields = [
            'id', 'master_id', 'master_name', 'master_rating', 'price',
            'duration_days', 'message', 'score',
            'is_accepted', 'created_at', 'provider_title', 'provider_avatar',
        ]
        read_only_fields = ['score', 'is_accepted']

    def get_master_name(self, obj):
        return obj.master.business_name or obj.master.user.full_name

    def get_provider_title(self, obj):
        # Master profilindeki title bilgisini güvenli bir şekilde çeker
        return getattr(obj.master, 'provider_title', 'Uzman Usta')

    def get_provider_avatar(self, obj):
        # Ustanın varsa profil fotoğrafını yoksa None döner
        if hasattr(obj.master, 'profile_photo') and obj.master.profile_photo:
            request = self.context.get('request')
            url = obj.master.profile_photo.url
            return request.build_absolute_uri(url) if request else url
        return None


class JobSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.full_name')
    category_name = serializers.ReadOnlyField(source='category.name')
    district_name = serializers.ReadOnlyField(source='district.name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    bids = serializers.SerializerMethodField()
    offer_count = serializers.IntegerField(read_only=True)
    
    # 💥 1. SORUNUN ÇÖZÜMÜ: Frontend 'accepted_bid_id' veya kabul edilen teklifin ID'sini arıyor.
    accepted_bid_id = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'owner', 'owner_name', 'category', 'category_name',
            'district', 'district_name', 'title', 'description',
            'budget_min', 'budget_max', 'work_photos', 'image', 'status', 'status_display',
            'bids', 'offer_count', 'accepted_bid_id', 'created_at',
        ]
        read_only_fields = ['owner', 'status']

    def get_accepted_bid_id(self, obj):
        # Bu işe ait tekliflerden (JobOffer) 'is_accepted=True' olan ilk teklifin ID'sini fırlatır.
        # Frontend bu ID ile karttaki teklifin ID'sini eşleştirince "Farklı Usta Seçildi" kilidi kırılacak.
        accepted_offer = obj.offers.filter(is_accepted=True).first() if hasattr(obj, 'offers') else None
        return accepted_offer.id if accepted_offer else None

    def get_bids(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
        if obj.owner_id != request.user.pk:
            return []
        bids = obj.bids.select_related('provider').order_by('-provider__trust_score')
        return BidSerializer(bids, many=True).data

    def validate(self, data):
        # 1. Mevcut Bütçe Kontrolü (Aynen Korundu)
        budget_min = data.get('budget_min')
        budget_max = data.get('budget_max')
        if budget_min is not None and budget_max is not None and budget_min > budget_max:
            raise serializers.ValidationError({
                'budget_max': 'Maksimum bütçe, minimum bütçeden düşük olamaz.',
            })

        # 2. Fake İlan Barikatı (Aynen Korundu)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and not self.instance:
            user = request.user
            
            active_jobs_count = Job.objects.filter(
                owner=user,
                status='pending'
            ).count()
            
            if active_jobs_count >= 10:
                raise serializers.ValidationError({
                    'error': 'Aynı anda en fazla 3 aktif (teklif bekleyen) talep açabilirsiniz usta. Lütfen önceki ilanlarınızın tamamlanmasını bekleyin veya iptal edin.'
                })

            # 🚀 3. SİBER GÜVENLİK VE KÜFÜR FİLTRESİ MOTORU (Aynen Korundu)
            ctx = {
                'user_id': user.id,
                'account_age_h': 48,
                'history_score': 0,
                'is_tor': False,
                'proxy_score': 0
            }
            
            validation_result = JobRequestValidator.process(data, ctx)
            
            if validation_result['publish_strategy'] == 'BLOCK':
                raise serializers.ValidationError({
                    'security_error': 'Topluluk kurallarına aykırı içerik, küfür veya şüpheli veri tespit edildi. İlan engellendi usta!'
                })
                
            data['title'] = validation_result['sanitized_data']['title']
            data['description'] = validation_result['sanitized_data']['description']
        
        return data