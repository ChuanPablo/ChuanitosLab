# Create your views here.
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser, EmailVerification
from .serializers import (
    UserSerializer,
    EmailSubmissionSerializer,
    CodeVerificationSerializer,
    UserRegistrationSerializer,
)


class EmailSubmissionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            verification = serializer.save()

            # Send email
            subject = 'Email Verification Code'
            message = f'Your verification code is: {verification.code}\n\nThis code will expire in 10 minutes!'

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [verification.email],
                    fail_silently=False,
                )
                return Response({
                    'message': 'Verification code sent to your email.',
                    'email': verification.email
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': 'Failed to send email. Please try again'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CodeVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CodeVerificationSerializer(data=request.data)

        if serializer.is_valid():
            verification = serializer.validated_data['verification']
            verification.is_used = True
            verification.save()

            return Response({
                'message': 'Email verified successfully. You can now complete registration',
                'email': verification.email
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        # Check if email is verified manually:
        if not EmailVerification.objects.filter(
            email=email,
            is_used=True,
        ).exists():
            return Response({
                'error': 'Email not verified. Please verify your email first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully.',
                'user_id': user.id,
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
