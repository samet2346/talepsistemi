from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.utils.crypto import get_random_string
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field, extend_schema_serializer
import re

User = get_user_model()

_PROVIDER_FIELDS = (
    'categories',
    'locations_served',
    'work_photos',
)


@extend_schema_serializer(component_name='User')
class UserSerializer(serializers.ModelSerializer):
    """PROD: Profil bilgilerini sunarken kullanılır."""

    class Meta:
        model = User
        fields = (
            'id', 'phone', 'email', 'role', 'full_name', 'first_name', 'last_name',
            'is_email_verified', 'is_approved', 'date_joined',
            'is_provider', 'provider_title', 'bio', 'avatar_url', 'certificate_url',
            'trust_score', 'is_face_verified',
            'categories', 'locations_served', 'work_photos',
        )
        # 🚀 certificate_url alanını read_only yapmıyoruz ki frontend'den gelen veri güncellenebilsin!
        read_only_fields = (
            'id', 'phone', 'role', 'is_email_verified', 'is_approved', 'date_joined',
            'is_provider', 'provider_title', 'bio', 'avatar_url',
            'trust_score', 'is_face_verified',
            'categories', 'locations_served', 'work_photos',
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # 🚀 EĞER usta profili aktifse (is_provider=True) belgenin çıktıya kesin dahil olduğundan emin oluyoruz.
        # Eğer aşağıda siliniyorsa korumaya alıyoruz:
        if not instance.is_provider:
            # Dosyanın yukarısında tanımlı olan listedeki alanları uçurur
            for field in _PROVIDER_FIELDS:
                data.pop(field, None)
            data.pop('certificate_url', None) # Usta değilse belgeyi de uçur
            
        return data


@extend_schema_serializer(component_name='UserRequest')
class UserUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/v1/accounts/me/ — temel profil güncellemesi."""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'full_name', 'email')
        extra_kwargs = {
            'email': {'required': False},
        }

    def validate_email(self, value):
        if not value:
            return value
        value = value.lower()
        qs = User.objects.filter(email=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kullanımda.")
        return value


@extend_schema_serializer(component_name='RegisterRequest')
class RegisterSerializer(serializers.ModelSerializer):
    """PROD: Kayıt esnasında Email OTP üretimi ve validasyonları yapar."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'phone', 'email', 'password', 'password_confirm',
            'first_name', 'last_name',
        )

    def validate_phone(self, value):
        clean_phone = re.sub(r'\D', '', str(value))
        if len(clean_phone) == 10 and clean_phone.startswith('5'):
            clean_phone = "90" + clean_phone
        elif len(clean_phone) == 11 and clean_phone.startswith('0'):
            clean_phone = "90" + clean_phone[1:]

        if User.objects.filter(phone=clean_phone).exists():
            raise serializers.ValidationError("Bu telefon numarası zaten kayıtlı.")
        return clean_phone

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email OTP için e-posta adresi zorunludur.")
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kullanımda.")
        return value.lower()

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password": "Şifreler birbiriyle eşleşmiyor."})
        return data

    def create(self, validated_data):
            validated_data.pop('password_confirm', None)
            code = get_random_string(length=6, allowed_chars='0123456789')

            role = self.initial_data.get('role', 'USER')
            if role not in ('USER', 'MASTER'):
                role = 'USER'

            user = User.objects.create_user(
                verification_code=code,
                verification_code_created_at=timezone.now(),
                is_active=False,
                role=role,
                is_provider=(role == 'MASTER'),
                **validated_data,
            )
            return user

@extend_schema_serializer(component_name='ProviderProfileRequest')
class ProviderProfileSerializer(serializers.ModelSerializer):
    """PATCH /api/v1/accounts/me/provider-profile/ — hizmet sağlayıcı profili."""

    class Meta:
        model = User
        fields = (
            'provider_title', 'bio', 'avatar_url', 'certificate_url', 'work_photos',
            'categories', 'locations_served',
        )
        extra_kwargs = {
            'provider_title': {'required': False},
            'bio': {'required': False},
            'avatar_url': {'required': False},
            'certificate_url': {'required': False},  # 🚀 KAPIDAN İÇERİ GİRİŞ İZNİ VERİLDİ
            'work_photos': {'required': False},
            'categories': {'required': False},
            'locations_served': {'required': False},
        }

    def validate_work_photos(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("İş fotoğrafları liste formatında olmalıdır.")
        return value

    def validate_categories(self, value):
        if value is None:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError("Kategoriler liste formatında olmalıdır.")
        if len(value) < 1:
            raise serializers.ValidationError("En az bir kategori seçilmelidir.")
        return value

    def validate_locations_served(self, value):
        if value is None:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError("Hizmet bölgeleri liste formatında olmalıdır.")
        if len(value) < 1:
            raise serializers.ValidationError("En az bir hizmet bölgesi seçilmelidir.")
        return value

    def validate(self, data):
        instance = self.instance
        categories = data.get('categories', getattr(instance, 'categories', None))
        locations_served = data.get('locations_served', getattr(instance, 'locations_served', None))

        errors = {}
        if not categories or len(categories) < 1:
            errors['categories'] = "En az bir kategori seçilmelidir."
        if not locations_served or len(locations_served) < 1:
            errors['locations_served'] = "En az bir hizmet bölgesi seçilmelidir."
        if errors:
            raise serializers.ValidationError(errors)
        return data

    def update(self, instance, validated_data):
        validated_data['is_provider'] = True
        return super().update(instance, validated_data)

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        raw_phone = str(attrs.get("phone", "")) or str(attrs.get(self.username_field, ""))
        phone_input = re.sub(r'\D', '', raw_phone)
        if len(phone_input) == 10 and phone_input.startswith('5'):
            phone_input = "90" + phone_input
        elif len(phone_input) == 11 and phone_input.startswith('0'):
            phone_input = "90" + phone_input[1:]
            
        # 🛡️ BÜTÜN ANAHTARLARI TEMİZLENMİŞ NUMARAYA EŞİTLE usta
        attrs[self.username_field] = phone_input
        if "phone" in attrs:
            attrs["phone"] = phone_input

        try:
            data = super().validate(attrs)
        except Exception:
            # Gerçek sebebi ayırt et: şifre mi yanlış, hesap mı pasif?
            user_check = User.objects.filter(phone=phone_input).first()
            if user_check and not user_check.is_active:
                raise serializers.ValidationError({
                    "error": "Hesabınız pasif durumda. Lütfen destek ile iletişime geçin.",
                    "code": "account_inactive",
                })
            raise serializers.ValidationError({
                "error": "Telefon numarası veya şifre hatalı.",
                "code": "invalid_credentials",
            })

        if not self.user.is_email_verified:
            raise serializers.ValidationError({
                "error": "E-posta adresi doğrulanmadı.",
                "code": "email_not_verified",
            })

        data['user'] = UserSerializer(self.user).data
        if self.user.role:
            data['role'] = self.user.role
        return data