import random
import string
from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

from ChuanitosAPI.utils import get_user_media_path


class CustomUserManager(BaseUserManager):
    """ Custom user manager handling the custom user model (CustomUser) """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address must be set!')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True or extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusers must have is_staff=True and is_superuser=True!')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """ Custom user class. Extends AbstractBaseUser """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30)
    first_name = models.CharField(max_length=30, verbose_name='First Name', blank=True, null=True)
    last_name = models.CharField(max_length=30, verbose_name='Last Name', blank=True, null=True)
    avatar = models.ImageField(upload_to=get_user_media_path, blank=True, null=True, help_text="Upload a profile picture")
    linkedin_link = models.CharField(max_length=100, verbose_name='Link to LinkedIn profile', blank=True, null=True)
    github_link = models.CharField(max_length=100, verbose_name='Link to github profile', blank=True, null=True)
    dockerhub_link = models.CharField(max_length=100, verbose_name='Link to docker hub profile', blank=True, null=True)
    contact_info = models.TextField(max_length=5000, verbose_name='Contact Info', blank=True, null=True)
    additional_info = models.TextField(max_length=5000, verbose_name='Contact Info', blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_online = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def get_avatar_url(self):
        """ Returns the URL pointing to the users profile picture """
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        return ''

    def is_online(self):
        """ Check if user is currently online (active within the last 5mins) """
        return timezone.now() - self.last_online < timedelta(minutes=5)

    def update_last_online(self):
        """ Update the last_online timestamp """
        self.last_online = timezone.now()
        self.save(update_fields=['last_online'])


class EmailVerification(models.Model):
    """
    Model representing user registration
    Flow: User enters email. Then receives code on said email to verify it and unlock full user registration
    """
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)

    @classmethod
    def generate_code(cls):
        return ''.join(random.choices(string.digits, k=6))

    def __str__(self):
        return f"{self.email} - {self.code}"
