from rest_framework import serializers
from bashvilleapi.models.color_palette import ColorPalette


class ColorPaletteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorPalette
        fields = [
            "id",
            "name",
            "primary_hex",
            "secondary_hex",
            "accent_hex",
            "background_hex",
        ]
