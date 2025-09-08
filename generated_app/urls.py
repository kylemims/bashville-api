# Auto-generated urls wiring
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import AuthorViewSet, BookViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"authors", AuthorViewSet, basename="author")
router.register(r"books", BookViewSet, basename="book")

urlpatterns = [
    path("", include(router.urls)),
]
