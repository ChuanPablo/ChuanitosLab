from rest_framework import serializers

from ChuanitosAPI.utils import validate_documentation
from .models import Skill


class SkillSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    documentation = serializers.FileField(validators=[validate_documentation])

    class Meta:
        model = Skill
        fields = [
            'id',
            'user_id',
            'name',
            'category',
            'category_display',
            'level',
            'level_display',
            'description',
            'years_of_experience',
            'documentation',
            'visibility',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_name(self, value):
        """Ensure skill name is not empty and properly formatted"""
        if not value.strip():
            raise serializers.ValidationError("Skill name cannot be empty.")
        return value.strip().title()

    def validate_years_of_experience(self, value):
        """Validate years of experience is reasonable"""
        if value is not None and value > 50:
            raise serializers.ValidationError("Years of experience cannot exceed 50 years.")
        return value

    def validate(self, data):
        """Custom validation for the entire skill object"""
        user = data.get('user') or self.context['request'].user
        name = data.get('name', '').strip().title()

        # Check for duplicate skill names for the same user (excluding current instance)
        queryset = Skill.objects.filter(user=user, name__iexact=name)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError({
                'name': f"You already have a skill named '{name}'. Skill names must be unique."
            })

        return super().validate(data)
