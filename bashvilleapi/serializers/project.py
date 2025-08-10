# bashvilleapi/serializers/project.py
from rest_framework import serializers
from bashvilleapi.models import Project, ColorPalette


class ProjectSerializer(serializers.ModelSerializer):
    # Write: pass palette id (or null). Read: also return a tiny preview.
    color_palette = serializers.PrimaryKeyRelatedField(
        queryset=ColorPalette.objects.none(),  # filled in __init__
        allow_null=True,
        required=False,
    )
    color_palette_preview = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "description",
            "color_palette",
            "color_palette_preview",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit palettes to the caller’s own
        req = self.context.get("request")
        if req and req.user and req.user.is_authenticated:
            self.fields["color_palette"].queryset = ColorPalette.objects.filter(
                user=req.user
            )

    def get_color_palette_preview(self, obj):
        p = obj.color_palette
        if not p:
            return None
        return {
            "id": p.id,
            "name": p.name,
            "primary_hex": p.primary_hex,
            "secondary_hex": p.secondary_hex,
            "accent_hex": p.accent_hex,
            "background_hex": p.background_hex,
        }

    def create(self, validated_data):
        # Always attach to the request user
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent user reassignment
        validated_data.pop("user", None)
        return super().update(instance, validated_data)
