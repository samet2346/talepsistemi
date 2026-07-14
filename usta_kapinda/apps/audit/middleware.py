import threading

# Thread-safe storage: Her isteği kendi kulvarında tutar
_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

def get_current_ip():
    return getattr(_thread_locals, 'ip', None)

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.user = request.user if request.user.is_authenticated else None
        _thread_locals.ip = self.get_client_ip(request)
        
        response = self.get_response(request)
        
        # İşlem bitince temizle (Memory leak olmasın)
        if hasattr(_thread_locals, 'user'): del _thread_locals.user
        if hasattr(_thread_locals, 'ip'): del _thread_locals.ip
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')