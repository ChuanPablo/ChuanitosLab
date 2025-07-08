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


class UserSerializer(serializers.ModelSerializer):
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
            'is_staff',
            'is_superuser',
            'date_created',
            'date_updated',
            'is_active',
            'last_online'
        ]
