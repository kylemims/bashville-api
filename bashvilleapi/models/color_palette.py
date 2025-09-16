# -*- coding: utf-8 -*-
# pylint: skip-file
from django.db import models
from django.contrib.auth.models import User
import json


class ColorPalette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    primary_hex = models.CharField(max_length=7)
    secondary_hex = models.CharField(max_length=7)
    accent_hex = models.CharField(max_length=7)
    background_hex = models.CharField(max_length=7)
    ui_hex = models.CharField(
        max_length=7, default="#ffffff"
    )  # New field for navbar/cards

    # Advanced styling preferences - JSON field for flexibility
    style_preferences = models.JSONField(
        default=dict,
        help_text="Advanced styling options: gradients, component overrides, layout preferences",
    )

    def __str__(self):
        return f"{self.name} by {self.user.username}"

    def get_style_preferences(self):
        """Get style preferences with sensible defaults"""
        defaults = {
            # Hero section styling
            "hero_style": "gradient",  # "gradient" or "solid"
            "hero_gradient_direction": "135deg",  # CSS gradient direction
            "hero_custom_bg": None,  # Override hero background entirely
            # Component-specific color overrides
            "component_overrides": {
                "hero_buttons": {
                    "primary": None,  # Override primary button in hero
                    "secondary": None,  # Override secondary button in hero
                    "accent": None,  # Override accent button in hero
                },
                "navbar": {
                    "background": None,  # Override navbar background
                    "text": None,  # Override navbar text color
                },
                "cards": {
                    "background": None,  # Override card backgrounds
                    "border": None,  # Override card borders
                },
                "footer": {
                    "background": None,  # Override footer background
                    "text": None,  # Override footer text
                },
            },
            # Layout and spacing preferences
            "layout_style": "modern",  # "modern", "classic", "minimal"
            "border_radius": "medium",  # "none", "small", "medium", "large", "full"
            "shadows": True,  # Enable/disable shadow effects
            "animations": True,  # Enable/disable hover animations
            # Developer-friendly options
            "css_framework": "tailwind",  # "tailwind", "css", "scss"
            "semantic_colors": True,  # Use semantic CSS custom properties
            "accessibility_mode": "auto",  # "strict", "auto", "relaxed"
        }

        # Merge user preferences with defaults
        user_prefs = self.style_preferences or {}
        merged = defaults.copy()

        # Deep merge component overrides
        if "component_overrides" in user_prefs:
            for component, overrides in user_prefs["component_overrides"].items():
                if component in merged["component_overrides"]:
                    merged["component_overrides"][component].update(overrides)
                else:
                    merged["component_overrides"][component] = overrides

        # Merge other preferences
        for key, value in user_prefs.items():
            if key != "component_overrides":
                merged[key] = value

        return merged

    def update_style_preference(self, key, value):
        """Update a single style preference"""
        if not self.style_preferences:
            self.style_preferences = {}
        self.style_preferences[key] = value

    def set_component_override(self, component, property_name, color_hex):
        """Set a component-specific color override"""
        if not self.style_preferences:
            self.style_preferences = {}
        if "component_overrides" not in self.style_preferences:
            self.style_preferences["component_overrides"] = {}
        if component not in self.style_preferences["component_overrides"]:
            self.style_preferences["component_overrides"][component] = {}

        self.style_preferences["component_overrides"][component][
            property_name
        ] = color_hex
