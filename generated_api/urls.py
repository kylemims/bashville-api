# bashvilleapi/codegen/templates/django/urls.py.j2
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import BlogPostViewSet, CategoryViewSet
# No trailing slashes
router = DefaultRouter(trailing_slash=False)

router.register(r"blogposts", BlogPostViewSet, basename="blogposts")
router.register(r"categories", CategoryViewSet, basename="categories")

urlpatterns = [
    path("", include(router.urls)),
]