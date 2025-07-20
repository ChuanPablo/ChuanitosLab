# Create your views here.
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny

from .models import TimelineEntry
from .serializers import TimelineEntrySerializer

User = get_user_model()


class TimelineEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimelineEntrySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        viewer = self.request.user
        target_user = get_object_or_404(User, pk=user_id)
        return TimelineEntry.objects.for_viewer(viewer, target_user)

    def perform_create(self, serializer):
        user_id = int(self.kwargs['user_pk'])
        request_user_id = self.request.user.id

        if user_id != request_user_id:
            raise PermissionDenied("You can only create entries for yourself")

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.user_id != self.request.user.id:
            raise PermissionDenied("You can only update your own entries")

        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own entries")

        instance.delete()

