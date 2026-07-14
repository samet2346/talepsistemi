# common/permissions.py
from rest_framework import permissions

class IsMaster(permissions.BasePermission):
    """Sadece 'MASTER' rolüne sahip kullanıcılar erişebilir."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'MASTER')

class IsUser(permissions.BasePermission):
    """Sadece 'USER' (Müşteri) rolüne sahip kullanıcılar erişebilir."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'USER')

class IsAdminUser(permissions.BasePermission):
    """Admin veya ADMIN rolüne sahip olanlar."""
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.role == 'ADMIN'))