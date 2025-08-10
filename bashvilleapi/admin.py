from django.contrib import admin
from bashvilleapi.models import ColorPalette, Project


@admin.register(ColorPalette)
class ColorPaletteAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "primary_hex",
        "secondary_hex",
        "accent_hex",
        "background_hex",
    )
    search_fields = ("name", "user__username")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "color_palette", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "user__username")
