from rest_framework import serializers

from .models import CustomUser, EmailVerification


class EmailSubmissionSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('User with this email already exists')
        return value

    def create(self, validated_data):
        email = validated_data['email']
        code = EmailVerification.generate_code()
        return EmailVerification.objects.create(email=email, code=code)

    def update(self, instance, validated_data):
        # not used here but needed by abstract base class (Serializer)
        pass


class CodeVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        code = data.get('code')

        try:
            verification = EmailVerification.objects.filter(
                email=email,
                code=code,
                is_used=False
            ).latest('created_at')
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError('Invalid verification code')

        if verification.is_expired():
            raise serializers.ValidationError('Verification code has expired')

        data['verification'] = verification
        return data

    def create(self, validated_data):
        # not used here but required because of serializer base class
        pass

    def update(self, instance, validated_data):
        # not used here but required because of serializer base class
        pass


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError('Passwords don''t match')
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(email=validated_data.pop('email'), password=validated_data.pop('password'), **validated_data)
        user.is_email_verified = True
        user.save()
        return user


class AvatarField(serializers.Field):
    def to_representation(self, value):
        # Return URL for GET requests
        if value.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(value.avatar.url)
            return value.avatar.url
        return value.avatar_url

    def to_internal_value(self, data):
        # Handle URL input - just save the URL
        if isinstance(data, str) and data.startswith('http'):
            return {'avatar_url': data, 'avatar': None}

        # Handle regular file upload
        return {'avatar': data, 'avatar_url': ''}


class UserSerializer(serializers.ModelSerializer):
    avatar = AvatarField(source='*')

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'avatar',
            'linkedin_link',
            'github_link',
            'dockerhub_link',
            'contact_info',
            'additional_info',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_created',
            'date_updated',
            'last_online',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_superuser',
            'date_created',
            'date_updated',
            'last_online'
        ]

    def update(self, instance, validated_data):
        """
        This override of the update process, here in serializer handles manipulation after
        validation. The custom update in the viewset handles manipulations/validation involving request data
        """
        # Handle the custom avatar field data
        if 'avatar_url' in validated_data:
            instance.avatar_url = validated_data.pop('avatar_url')
            instance.avatar = None
        elif 'avatar' in validated_data:
            instance.avatar = validated_data.pop('avatar')
            instance.avatar_url = ''

        # Handle other fields normally
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
