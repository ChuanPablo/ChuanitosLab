# Create your views here.
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from users.utils import user_is_admin, get_user_by_id
from .models import TimelineEntry
from .serializers import TimelineEntrySerializer

User = get_user_model()


class TimelineEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimelineEntrySerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        viewer = self.request.user
        target_user = get_object_or_404(User, pk=user_id)
        return TimelineEntry.objects.for_viewer(viewer, target_user)

    def perform_create(self, serializer):
        user_id = int(self.kwargs['user_pk'])
        request_user = self.request.user

        if user_id != request_user.id and not user_is_admin(request_user):
            raise PermissionDenied("You can only create entries for yourself")

        serializer.save(user=get_user_by_id(user_id))

    def perform_update(self, serializer):
        instance = self.get_object()
        request_user = self.request.user

        if instance.user_id != request_user.id and not user_is_admin(request_user):
            raise PermissionDenied("You can only update your own entries")

        serializer.save(user=get_user_by_id(instance.user_id))

    def perform_destroy(self, instance):
        request_user = self.request.user

        if instance.user_id != request_user.id and not user_is_admin(request_user):
            raise PermissionDenied("You can only delete your own entries")

        instance.delete()


