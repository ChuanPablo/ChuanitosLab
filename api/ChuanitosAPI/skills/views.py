# Create your views here.
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from users.utils import user_is_admin, get_user_by_id
from .models import Skill
from .serializers import SkillSerializer

User = get_user_model()


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        viewer = self.request.user
        target_user = get_object_or_404(User, pk=user_id)
        return Skill.objects.for_viewer(viewer, target_user)

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

    @action(detail=False, methods=['get'])
    def by_category(self, request, user_pk=None):
        """Get skills grouped by category"""
        queryset = self.get_queryset()

        # Group skills by category
        categories = {}
        for skill in queryset:
            category = skill.get_category_display()
            if category not in categories:
                categories[category] = []
            categories[category].append(SkillSerializer(skill, context={'request': request}).data)

        return Response(categories)

    @action(detail=False, methods=['get'])
    def statistics(self, request, user_pk=None):
        """Get skill statistics for the user"""
        user_id = int(self.kwargs['user_pk'])

        # Only allow users to see their own statistics
        if user_id != request.user.id:
            raise PermissionDenied("You can only view your own skill statistics")

        queryset = Skill.objects.for_user(request.user)

        stats = {
            'total_skills': queryset.count(),
            'by_category': {},
            'by_level': {},
            'average_experience': 0,
        }

        # Calculate statistics
        total_experience = 0
        experience_count = 0

        for skill in queryset:
            # Category stats
            category = skill.get_category_display()
            stats['by_category'][category] = stats['by_category'].get(category, 0) + 1

            # Level stats
            level = skill.get_level_display()
            stats['by_level'][level] = stats['by_level'].get(level, 0) + 1

            # Experience stats
            if skill.years_of_experience:
                total_experience += skill.years_of_experience
                experience_count += 1

        if experience_count > 0:
            stats['average_experience'] = round(total_experience / experience_count, 1)

        return Response(stats)