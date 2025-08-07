import os

from rest_framework import serializers


def get_user_media_path(instance, filename):
    """ Generate upload path for users avatars """
    return f'avatars/users_{instance.id}/{filename}'


def get_user_pdf_path(instance, filename):
    """ Generate upload path for users pdfs """
    return f'pdfs/users_{instance.id}/{filename}'


def validate_documentation(value):
    if value:
        extension = os.path.splitext(value.name)[1].lower()

        if extension != '.pdf':
            raise serializers.ValidationError("File must have .pdf extension.")

        # File size (10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")

        # MIME type from browser
        if value.content_type != 'application/pdf':
            raise serializers.ValidationError("Invalid content type.")
