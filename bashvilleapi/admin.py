from django.contrib import admin
from bashvilleapi.models import ColorPalette, Project, Command, ProjectCommand


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
    list_filter = ("user",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "color_palette", "created_at")
    list_filter = ("created_at", "user")
    search_fields = ("title", "user__username")
    filter_horizontal = ("commands",)  # Spicy UI feature to manage commands in projects


@admin.register(Command)
class CommandAdmin(admin.ModelAdmin):
    list_display = ("label", "user", "order_index", "created_at")
    list_filter = ("user", "created_at")
    search_fields = ("label", "command_text", "user__username")
    ordering = ("user", "order_index", "label")

    fieldsets = (
        (None, {"fields": ("user", "label", "command_text")}),
        ("Organization", {"fields": ("order_index",), "classes": ("collapse",)}),
    )


@admin.register(ProjectCommand)
class ProjectCommandAdmin(admin.ModelAdmin):
    list_display = ("project", "command", "created_at")
    list_filter = ("created_at", "project_user")
    search_fields = ("project__title", "command__label")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(project__user=request.user)
        return qs
