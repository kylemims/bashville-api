#!/usr/bin/env python
"""Test template rendering after fixes"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bashvilleproject.settings")
django.setup()

from bashvilleapi.views.codegen import render_template_file


def test_template_rendering():
    """Test that Jinja2 template rendering works correctly"""

    # Test template path
    template_path = os.path.join(
        "bashvilleapi",
        "codegen",
        "templates",
        "layouts",
        "react-tailwind",
        "src",
        "index.css.j2",
    )

    # Test context matching what the API provides
    context = {
        "palette": {
            "primary": "#fee394",
            "secondary": "#d46a6a",
            "accent": "#46cba7",
            "background": "#0c0806",
        },
        "color_palette": {
            "primary_hex": "#fee394",
            "secondary_hex": "#d46a6a",
            "accent_hex": "#46cba7",
            "background_hex": "#0c0806",
        },
    }

    # Test rendering
    result = render_template_file(template_path, context)

    if result.startswith("# Error"):
        print(f"❌ FAILED: {result}")
        return False

    # Check if colors were properly substituted
    if "#fee394" in result and "--color-primary: #fee394" in result:
        print("✅ SUCCESS: Template rendered correctly")
        print("✅ Colors properly substituted")
        return True
    else:
        print("❌ FAILED: Colors not properly substituted")
        print("First 200 chars:", result[:200])
        return False


if __name__ == "__main__":
    test_template_rendering()
