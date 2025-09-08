# -*- coding: utf-8 -*-
# pylint: skip-file
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from bashvilleapi.views import (
    ColorPaletteViewSet,
    ProjectViewSet,
    CommandViewSet,
    RegisterView,
    LoginView,
)
from bashvilleapi.views.codegen import CodegenGenerateView

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"colorpalettes", ColorPaletteViewSet, basename="colorpalette")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"commands", CommandViewSet, basename="command")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
    path("auth/login/", LoginView.as_view(), name="api_login"),
    path("auth/register/", RegisterView.as_view(), name="api_register"),
    path("codegen/generate", CodegenGenerateView.as_view(), name="codegen_generate"),
    path("api/generated/", include("generated_app.urls")),
]
