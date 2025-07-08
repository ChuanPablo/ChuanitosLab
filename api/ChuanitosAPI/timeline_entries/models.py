# Create your models here.
from django.conf import settings
from django.db import models

from ChuanitosAPI.utils import get_user_pdf_path


class TimelineEntryQuerySet(models.QuerySet):
    def for_viewer(self, viewer, target_user):
        queryset = self.filter(user=target_user)

        if viewer != target_user:
            queryset = queryset.filter(visibility=TimelineEntry.VISIBILITY_PUBLIC)

        return queryset.order_by('-start_date')

    def for_user(self, user):
        return self.filter(user=user).order_by('-start_date')


class TimelineEntry(models.Model):
    # Constants
    VISIBILITY_PUBLIC = 'public'
    VISIBILITY_PRIVATE = 'private'

    TIMELINE_ENTRY_TYPE_CHOICES = [
        ('job', 'Job'),
        ('edu', 'Education'),
    ]

    VISIBILITY_CHOICES = [
        (VISIBILITY_PUBLIC, 'Public'),
        (VISIBILITY_PRIVATE, 'Private'),
    ]

    # Fields
    title = models.CharField(max_length=255)
    organisation = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    timeline_entry_type = models.CharField(max_length=20, choices=TIMELINE_ENTRY_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    documentation = models.FileField(upload_to=get_user_pdf_path, blank=True, null=True, help_text='Upload documentation or certificate for this timeline entry')
    description = models.TextField(blank=True, null=True)

    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default=VISIBILITY_PUBLIC
    )

    # Foreign Keys
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='timeline_entries'
    )

    objects = TimelineEntryQuerySet.as_manager()

    class Meta:
        indexes = [
            models.Index(fields=['user'])
        ]

    def __str__(self):
        return f"{self.title} at {self.organisation}"

