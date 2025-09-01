from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()


class LastOnlineJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result:
            user, validated_token = result
            # Update last_online when user is authenticated via JWT
            User.objects.filter(pk=user.pk).update(last_online=timezone.now())
        return result
