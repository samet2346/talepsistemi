import logging
from django.http import JsonResponse
from django.conf import settings
from .services import AbuseService
from .utils import AbuseUtils

logger = logging.getLogger("abuse_middleware")

class AbuseControlMiddleware:
    """
    👮 THE SMART BOUNCER (V2)
    Role: Yüksek hassasiyetli erişim kontrolü ve şeffaf gölge izleme.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # ⚠️ FIX 4: Settings üzerinden esnek muafiyet listesi
        self.exempt_urls = getattr(settings, 'ABUSE_EXEMPT_URLS', [
            '/admin/', '/metrics/', '/static/', '/media/', '/favicon.ico'
        ])

    def __call__(self, request):
        # 1. Muafiyet Kontrolü
        if any(request.path.startswith(url) for url in self.exempt_urls):
            return self.get_response(request)

        # 2. İstihbarat Toplama (⚠️ FIX 1: Header yoksa manuel üret)
        ip = AbuseUtils.get_client_ip(request)
        device_hash = request.headers.get('X-Device-Hash') or AbuseUtils.generate_device_hash(request)

        # 3. Kapı Kontrolü
        gate_status = AbuseService.check_request_gate(request)

        # --- A) HARD BLOCK (⚠️ FIX 5: 429 Too Many Requests) ---
        if gate_status == "BLOCK":
            logger.warning(f"BLOCK: Enforcement triggered for IP {ip}")
            return JsonResponse(
                {
                    "error": "Too many requests or security breach.",
                    "code": "LIMIT_EXCEEDED"
                }, 
                status=429
            )

        # --- B) SHADOW BAN (⚠️ FIX 3: Global Shadow Bayrağı) ---
        # Anonim de olsa, login de olsa bu request 'kirli' olarak işaretlenir
        request.shadow_active = False
        if gate_status == "SHADOW":
            request.shadow_active = True
            logger.info(f"SHADOW: Silent enforcement for {request.user if request.user.is_authenticated else ip}")

        # 4. Radar Kaydı (⚠️ FIX 2: Parametreler sadeleşti)
        AbuseService.track_velocity(request, ip, device_hash)

        response = self.get_response(request)
        
        # 5. Debug & Trace (⚠️ FIX 6: Sadece Geliştirme/Shadow modunda header ekle)
        if getattr(request, 'shadow_active', False):
            response['X-Shadow-Mode'] = 'active'
            
        return response