from rest_framework.permissions import BasePermission


class IsEmailVerifiedUser(BasePermission):
    """
    Allows access only to users with a verified email.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_email_verified)