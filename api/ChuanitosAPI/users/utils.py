from .models import CustomUser


def get_user_by_id(user_id):
    return CustomUser.objects.get(pk=user_id)


def user_is_admin(user):
    if not user or not isinstance(user, CustomUser):
        return False

    return user.is_staff or user.is_superuser
