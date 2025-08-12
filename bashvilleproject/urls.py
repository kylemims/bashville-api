from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token
from bashvilleapi.views import (
    ColorPaletteViewSet,
    ProjectViewSet,
    CommandViewSet,
    RegisterView,
)

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"colorpalettes", ColorPaletteViewSet, basename="colorpalette")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"commands", CommandViewSet, basename="command")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
    path("auth/login/", obtain_auth_token, name="api_login"),
    path("auth/register/", RegisterView.as_view(), name="api_register"),
]
