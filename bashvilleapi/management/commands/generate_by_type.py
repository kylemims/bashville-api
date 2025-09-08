import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from jinja2 import Environment, FileSystemLoader, select_autoescape


class Command(BaseCommand):
    help = "Generate projects by type: static-tailwind, static-css, backend-tailwind, backend-css"

    def add_arguments(self, parser):
        parser.add_argument("--ctx", required=True, help="Path to JSON context file")
        parser.add_argument(
            "--project-type",
            required=True,
            choices=[
                "static-tailwind",
                "static-css",
                "backend-tailwind",
                "backend-css",
            ],
            help="Type of project to generate",
        )
        parser.add_argument(
            "--output", default="generated_project", help="Output directory name"
        )

    def handle(self, *args, **opts):
        # Load context
        ctx_path = Path(opts["ctx"])
        if not ctx_path.exists():
            raise CommandError(f"Context file not found: {ctx_path}")
        ctx = json.loads(ctx_path.read_text("utf-8"))

        # Add default palette if not provided
        if "palette" not in ctx:
            ctx["palette"] = {
                "primary": "#fee394",
                "secondary": "#d46a6a",
                "accent": "#46cba7",
                "background": "#0c0806",
            }

        # Add color_palette context for layout templates (matches client-side API)
        if "palette" in ctx:
            ctx["color_palette"] = {
                "primary_hex": ctx["palette"]["primary"],
                "secondary_hex": ctx["palette"]["secondary"],
                "accent_hex": ctx["palette"]["accent"],
                "background_hex": ctx["palette"]["background"],
            }

        # Add primary_entity for API generation
        if "entities" in ctx and ctx["entities"]:
            ctx["primary_entity"] = ctx["entities"][0]

        # Add API base URL
        ctx["api_base"] = "http://localhost:8000/api"

        # Generate project_name from project_title if not provided
        if "project_name" not in ctx and "project_title" in ctx:
            ctx["project_name"] = (
                ctx["project_title"].lower().replace(" ", "-").replace("_", "-")
            )

        # Add project_description if not provided
        if "project_description" not in ctx:
            ctx["project_description"] = (
                f"Generated {ctx.get('project_title', 'Project')} App"
            )

        project_type = opts["project_type"]
        output_dir = Path(opts["output"])

        # Set project type in context
        ctx["project_type"] = project_type

        self.stdout.write(f"🚀 Generating {project_type} project...")

        # Template setup
        base = Path(__file__).resolve().parents[3] / "bashvilleapi" / "codegen"
        tdir = base / "templates"
        if not tdir.exists():
            raise CommandError(f"Templates not found: {tdir}")

        env = Environment(
            loader=FileSystemLoader(str(tdir)),
            autoescape=select_autoescape(enabled_extensions=("html", "j2")),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        def render_write(template_path: str, output_path: str, base_dir: Path):
            """Render template and write to output file."""
            template = env.get_template(template_path)
            content = template.render(**ctx)
            full_path = base_dir / output_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")
            self.stdout.write(self.style.SUCCESS(f"✅ {output_path}"))

        # Determine what to generate
        generate_backend = project_type.startswith("backend-")
        use_tailwind = project_type.endswith("-tailwind")
        layout = "react-tailwind" if use_tailwind else "react-css"

        # Create output directory
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate backend if needed
        if generate_backend:
            self.stdout.write("🐍 Generating Django backend...")
            backend_dir = output_dir / "backend"
            ctx["app_name"] = "backend"

            render_write("django/models.py.j2", "models.py", backend_dir)
            render_write("django/serializers.py.j2", "serializers.py", backend_dir)
            render_write("django/viewsets.py.j2", "viewsets.py", backend_dir)
            render_write("django/urls.py.j2", "urls.py", backend_dir)
            render_write("django/admin.py.j2", "admin.py", backend_dir)
            render_write("django/apps.py.j2", "apps.py", backend_dir)

            # Create __init__.py
            (backend_dir / "__init__.py").write_text("", encoding="utf-8")
            self.stdout.write(self.style.SUCCESS("✅ __init__.py"))

            # Migrations directory
            migrations_dir = backend_dir / "migrations"
            migrations_dir.mkdir(exist_ok=True)
            (migrations_dir / "__init__.py").write_text("", encoding="utf-8")

        # Generate frontend
        self.stdout.write(f"🎨 Generating React frontend ({layout})...")
        frontend_dir = output_dir / "frontend"

        # Core React files
        render_write(f"layouts/{layout}/index.html.j2", "index.html", frontend_dir)
        render_write(f"layouts/{layout}/package.json.j2", "package.json", frontend_dir)
        render_write(
            f"layouts/{layout}/vite.config.js.j2", "vite.config.js", frontend_dir
        )
        render_write(f"layouts/{layout}/src/App.jsx.j2", "src/App.jsx", frontend_dir)
        render_write(
            f"layouts/{layout}/src/index.css.j2", "src/index.css", frontend_dir
        )
        render_write(f"layouts/{layout}/src/main.jsx.j2", "src/main.jsx", frontend_dir)

        # Tailwind configuration
        if use_tailwind:
            render_write(
                "react/tailwind.config.js.j2", "tailwind.config.js", frontend_dir
            )
            render_write(
                "react/postcss.config.js.j2", "postcss.config.js", frontend_dir
            )

        # Configuration files
        render_write("react/.npmrc.j2", ".npmrc", frontend_dir)

        # API integration for backend projects
        if generate_backend:
            render_write("react/src/api.js.j2", "src/api.js", frontend_dir)
            render_write(
                "react/src/components/CrudTable.jsx.j2",
                "src/components/CrudTable.jsx",
                frontend_dir,
            )

        # Setup script
        if generate_backend:
            render_write("layouts/fullstack-setup.sh.j2", "setup.sh", output_dir)
        else:
            render_write(f"layouts/{layout}/setup.sh.j2", "setup.sh", frontend_dir)

        # Project-specific files
        if generate_backend:
            # Django manage.py
            manage_content = '''#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
'''
            (output_dir / "manage.py").write_text(manage_content, encoding="utf-8")
            self.stdout.write(self.style.SUCCESS("✅ manage.py"))

            # Requirements.txt
            requirements = """Django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
"""
            (output_dir / "requirements.txt").write_text(requirements, encoding="utf-8")
            self.stdout.write(self.style.SUCCESS("✅ requirements.txt"))

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 {project_type} project generated successfully!\n")
        )

        # Instructions
        if generate_backend:
            self.stdout.write("🚀 To start your full-stack project:")
            self.stdout.write("   1. chmod +x setup.sh && ./setup.sh")
            self.stdout.write("   2. cd frontend && npm run dev")
            self.stdout.write(
                "   3. source venv/bin/activate && python manage.py runserver"
            )
        else:
            self.stdout.write("🚀 To start your static project:")
            self.stdout.write("   1. cd frontend")
            self.stdout.write("   2. chmod +x setup.sh && ./setup.sh")
            self.stdout.write("   3. npm run dev")

        self.stdout.write(f"\n📁 Project created in: {output_dir.absolute()}")
