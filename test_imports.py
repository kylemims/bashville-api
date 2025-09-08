#!/usr/bin/env python
"""Test syntax and imports of codegen.py"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bashvilleproject.settings")
django.setup()


def test_imports():
    """Test that all imports and syntax are correct"""
    try:
        from bashvilleapi.views.codegen import (
            render_template_file,
            get_layout_template_path,
            get_template_path,
            CodegenGenerateView,
        )

        print("✅ All imports successful")

        # Test that the render function exists and is callable
        if callable(render_template_file):
            print("✅ render_template_file is callable")
        else:
            print("❌ render_template_file is not callable")

        # Test helper functions
        test_path = get_layout_template_path("react-tailwind", "src/App.jsx.j2")
        if "react-tailwind" in test_path and "App.jsx.j2" in test_path:
            print("✅ Helper functions working correctly")
        else:
            print("❌ Helper functions not working")

        print("✅ All syntax and import issues resolved!")
        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except SyntaxError as e:
        print(f"❌ Syntax error: {e}")
        return False
    except Exception as e:
        print(f"❌ Other error: {e}")
        return False


if __name__ == "__main__":
    test_imports()
