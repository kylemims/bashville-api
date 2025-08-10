from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from bashvilleapi.views import ColorPaletteViewSet, ProjectViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"colorpalettes", ColorPaletteViewSet, basename="colorpalette")
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
]
