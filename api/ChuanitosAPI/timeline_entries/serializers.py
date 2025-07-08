from rest_framework import serializers

from ChuanitosAPI.utils import validate_documentation
from .models import TimelineEntry


class TimelineEntrySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    documentation = serializers.FileField(validators=[validate_documentation])

    class Meta:
        model = TimelineEntry
        fields = [
            'id',
            'user_id',
            'title',
            'organisation',
            'location',
            'timeline_entry_type',
            'description',
            'start_date',
            'end_date',
            'documentation',
            'visibility',
        ]

    def validate(self, data):
        user = data.get('user') or self.context['request'].user
        timeline_entry_type = data.get('timeline_entry_type')

        # For PATCH requests, get existing values if not provided in data
        if self.instance:
            start = data.get('start_date', self.instance.start_date)
            end = data.get('end_date', self.instance.end_date)
        else:
            # For POST requests, start_date is required
            start = data['start_date']
            end = data.get('end_date')

        # Skip overlap check if end_date is None (ongoing entry)
        if end is None:
            return data

        # Validate that end_date is after start_date
        if end <= start:
            raise serializers.ValidationError("End date must be after start date.")

        # Exclude current instance if updating
        queryset = TimelineEntry.objects.for_user(user)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        # Check overlap with entries that have end dates
        overlapping_with_end = queryset.filter(
            end_date__isnull=False,
            start_date__lt=end,
            end_date__gt=start,
            timeline_entry_type=timeline_entry_type,
        ).exists()

        # Check overlap with ongoing entries (no end date)
        overlapping_ongoing = queryset.filter(
            end_date__isnull=True,
            start_date__lt=end,
            timeline_entry_type=timeline_entry_type,
        ).exists()

        if overlapping_with_end or overlapping_ongoing:
            raise serializers.ValidationError("This entry overlaps with an existing timeline entry.")

        return super().validate(data)