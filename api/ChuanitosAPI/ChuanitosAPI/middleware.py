from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class OnlineStatusMiddleware:
    """
        Middleware handling last_online field of the custom user model
        updates with every request from authenticated users
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Update last_online for authenticated users
        if request.user.is_authenticated:
            User.objects.filter(pk=request.user.pk).update(
                last_online=timezone.now()
            )

        response = self.get_response(request)
        return response


class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f"ALL REQUESTS: {request.method} {request.path}")

        if '/api/' in request.path:
            print(f"API Request: {request.method} {request.path}")
            print(f"Query: {request.GET}")

        response = self.get_response(request)

        if '/api/' in request.path:
            print(f"Response status: {response.status_code}")

        return response
