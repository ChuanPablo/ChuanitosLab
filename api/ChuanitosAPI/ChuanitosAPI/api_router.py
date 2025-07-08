from rest_framework_nested.routers import SimpleRouter, NestedSimpleRouter

from skills.views import SkillViewSet
from timeline_entries.views import TimelineEntryViewSet
from users.views import UserViewSet

# from other_app.views import OtherViewSet

# Top-level router
router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')

# Nested under users
user_router = NestedSimpleRouter(router, r'users', lookup='user')
user_router.register(r'timeline_entries', TimelineEntryViewSet, basename='user-timeline-entries')
user_router.register(r'skills', SkillViewSet, basename='user-skills')
# user_router.register(r'future_app', FutureAppViewSet, basename='user-future-app')

urlpatterns = router.urls + user_router.urls
