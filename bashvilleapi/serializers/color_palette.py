# -*- coding: utf-8 -*-
# pylint: skip-file
from rest_framework import serializers
from bashvilleapi.models.color_palette import ColorPalette


class ColorPaletteSerializer(serializers.ModelSerializer):
    # Advanced styling preferences with validation
    style_preferences = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = ColorPalette
        fields = [
            "id",
            "name",
            "primary_hex",
            "secondary_hex",
            "accent_hex",
            "background_hex",
            "ui_hex",
            "style_preferences",
        ]
        extra_kwargs = {
            "style_preferences": {"required": False},
        }

    def validate_style_preferences(self, value):
        """Validate style preferences structure"""
        if value is None:
            return {}

        # Ensure it's a dictionary
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Style preferences must be a valid JSON object"
            )

        # Define valid style preference keys and their types
        valid_preferences = {
            "hero_style": ["gradient", "solid"],
            "hero_gradient_direction": str,
            "hero_custom_bg": (str, type(None)),
            "layout_style": ["modern", "classic", "minimal"],
            "border_radius": ["none", "small", "medium", "large", "full"],
            "shadows": bool,
            "animations": bool,
            "css_framework": ["tailwind", "css", "scss"],
            "semantic_colors": bool,
            "accessibility_mode": ["strict", "auto", "relaxed"],
            "component_overrides": dict,
        }

        # Validate each preference
        for key, val in value.items():
            if key not in valid_preferences:
                continue  # Allow unknown keys for future extensibility

            expected_type = valid_preferences[key]

            if isinstance(expected_type, list):
                # Enum validation
                if val not in expected_type:
                    raise serializers.ValidationError(
                        f"Invalid value '{val}' for {key}. Must be one of: {expected_type}"
                    )
            elif isinstance(expected_type, tuple):
                # Multiple type validation (e.g., str or None)
                if not any(isinstance(val, t) for t in expected_type):
                    type_names = " or ".join(t.__name__ for t in expected_type)
                    raise serializers.ValidationError(
                        f"Invalid type for {key}. Must be {type_names}"
                    )
            elif expected_type == dict:
                # Component overrides validation
                if key == "component_overrides" and isinstance(val, dict):
                    valid_components = ["hero_buttons", "navbar", "cards", "footer"]
                    for component, overrides in val.items():
                        if component not in valid_components:
                            continue  # Allow unknown components
                        if not isinstance(overrides, dict):
                            raise serializers.ValidationError(
                                f"Component overrides for {component} must be an object"
                            )
                        # Validate color hex values
                        for color_key, color_value in overrides.items():
                            if color_value is not None and not isinstance(
                                color_value, str
                            ):
                                raise serializers.ValidationError(
                                    f"Color override {component}.{color_key} must be a hex string or null"
                                )
                            if color_value and (
                                not color_value.startswith("#") or len(color_value) != 7
                            ):
                                raise serializers.ValidationError(
                                    f"Color override {component}.{color_key} must be a valid hex color"
                                )
            elif not isinstance(val, expected_type):
                # Type validation
                raise serializers.ValidationError(
                    f"Invalid type for {key}. Expected {expected_type.__name__}"
                )

        return value

    def to_representation(self, instance):
        """Include computed style preferences in the response"""
        data = super().to_representation(instance)
        # Add the computed style preferences with defaults
        data["computed_style_preferences"] = instance.get_style_preferences()
        return data
