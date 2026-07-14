import logging
from functools import wraps
from django.http import JsonResponse
from .services import AbuseService

logger = logging.getLogger("abuse_decorators")

def sensitive_action_check(content_field=None):
    """
    🎯 ADVANCED SENSITIVE ACTION CHECKER (V2)
    Role: Kritik işlemlerde içerik analizi, risk skorlaması ve sessiz infaz.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # ⚠️ FIX 1: DRF ve Normal Django View Uyumluluğu
            data = getattr(request, 'data', {}) or request.POST

            # 1. 🕵️ Shadow Ban Sessiz İnfaz (⚠️ FIX 6: Log Eklendi)
            if getattr(request, 'shadow_active', False):
                logger.info(f"SHADOW_INTERCEPT: {request.user} tried to {view_func.__name__}")
                # ⚠️ FIX 2: Müşteriye yalan söyle, ama loglarda gerçeği tut
                return JsonResponse({
                    "status": "success", 
                    "message": "İşleminiz başarıyla alındı.",
                    "meta": {"trace_id": "sh_active"} # Debug için sessiz bayrak
                }, status=200)

            # 2. 📝 İçerik Analizi (⚠️ FIX 3: Tüm veri gönderim metodları eklendi)
            content = None
            if content_field and request.method in ['POST', 'PUT', 'PATCH']:
                content = data.get(content_field)

            # 3. ⚖️ Karar Mekanizması
            risk_level = AbuseService.process_user_action(request, content=content)

            # 4. 🔥 İnfaz (⚠️ FIX 4 & 6: Risk Seviyesi ve Loglama)
            if risk_level == "HIGH":
                logger.warning(
                    f"HIGH_RISK_BLOCK: {request.user or 'Anon'} | "
                    f"View: {view_func.__name__} | Content: {content[:50] if content else 'None'}"
                )
                return JsonResponse({
                    "error": "İşleminiz güvenlik protokolü nedeniyle reddedildi.",
                    "code": "SECURITY_THRESHOLD_EXCEEDED"
                }, status=403)

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator