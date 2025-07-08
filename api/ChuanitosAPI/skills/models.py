# Create your models here.
from django.conf import settings
from django.db import models

from ChuanitosAPI.utils import get_user_pdf_path


class SkillQuerySet(models.QuerySet):
    def for_viewer(self, viewer, target_user):
        queryset = self.filter(user=target_user)

        if viewer != target_user:
            queryset = queryset.filter(visibility=Skill.VISIBILITY_PUBLIC)

        return queryset.order_by('category', 'name')

    def for_user(self, user):
        return self.filter(user=user).order_by('category', 'name')


class Skill(models.Model):
    # Constants
    VISIBILITY_PUBLIC = 'public'
    VISIBILITY_PRIVATE = 'private'

    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    SKILL_CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('language', 'Language'),
        ('soft', 'Soft Skills'),
        ('creative', 'Creative'),
        ('other', 'Other'),
    ]

    VISIBILITY_CHOICES = [
        (VISIBILITY_PUBLIC, 'Public'),
        (VISIBILITY_PRIVATE, 'Private'),
    ]

    # Fields
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORY_CHOICES, default='technical')
    level = models.CharField(max_length=15, choices=SKILL_LEVEL_CHOICES, default='intermediate')
    description = models.TextField(blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(null=True, blank=True)
    documentation = models.FileField(
        upload_to=get_user_pdf_path,
        blank=True,
        null=True,
        help_text='Upload documentation or certificate for this timeline entry'
    )

    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default=VISIBILITY_PUBLIC
    )

    # Foreign Keys
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='skills'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SkillQuerySet.as_manager()

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['category']),
        ]
        unique_together = ['user', 'name']  # Prevent duplicate skills for same user

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"