from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q, Value, OuterRef, Exists
from django.db.models.functions import Concat
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from skills.models import Skill
from timeline_entries.models import TimelineEntry
from .models import CustomUser, EmailVerification
from .serializers import (
    UserSerializer,
    EmailSubmissionSerializer,
    CodeVerificationSerializer,
    UserRegistrationSerializer,
)


class EmailSubmissionView(APIView):

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
    #todo fix last_online date
    serializer_class = UserSerializer

    def apply_search_query(self, queryset):
        """
        Filters QuerySet by matching the given search query with first name, last name, username, skills and organisation
        """
        query = self.request.query_params.get('q')

        if not query:
            return queryset

        # create concatenated field to be able to filter it properly
        queryset = queryset.annotate(
            full_name=Concat('first_name', Value(' '), 'last_name')
        )

        return queryset.filter(
            Q(full_name__icontains=query) |
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Exists(Skill.objects.filter(user=OuterRef('pk'), name__icontains=query)) |  # use exist to avoid cartesian products
            Exists(TimelineEntry.objects.filter(user=OuterRef('pk'), organisation__icontains=query))  # use exist to avoid cartesian products
        )

    def apply_limit(self, queryset):
        """
        Slices QuerySet if there is a limit specified in the request
        """
        limit = self.request.query_params.get('l')

        if not limit or not limit.isdigit():
            return queryset

        return queryset.order_by('-date_created')[:int(limit)]

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        queryset = self.apply_search_query(queryset)
        queryset = self.apply_limit(queryset)

        if not queryset.query.is_sliced:
            return queryset.order_by('last_name')

        user_list = list(queryset)
        user_list.sort(key=lambda user: user.last_name, reverse=True)
        return user_list

    def get_queryset(self):
        queryset = CustomUser.objects.all()
        user = self.request.user
        user_is_superuser_or_staff = user.is_superuser or user.is_staff

        if not user_is_superuser_or_staff:
            queryset = queryset.filter(is_superuser=False, is_staff=False, is_active=True)

        return queryset

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Use auth/register/ for user registration. '},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def perform_update(self, serializer):
        """
        This custom perform method handles validation and authorisation involving request data
        Other custom update (in serializer) handles data transformations
        """
        user = self.request.user
        instance = serializer.instance
        validated_data = serializer.validated_data

        # Check if the user to be updated is the same user that sends the request
        # or if the user has staff privileges
        if user != instance and not user.is_staff:
            raise PermissionError('Only staff members can change other users.')

        # Check if field 'is_staff' is being changed
        # Only staff members are able to change 'staff' status
        if 'is_staff' in validated_data and not user.is_staff:
            raise PermissionError('Only staff members can change ''staff'' status')

        serializer.save()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
