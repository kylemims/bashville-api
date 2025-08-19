# bashvilleapi/management/commands/generate_fullstack.py
import json
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from jinja2 import Environment, FileSystemLoader, select_autoescape


class Command(BaseCommand):
    help = "Render Django + React scaffolds from Jinja templates."

    def add_arguments(self, parser):
        parser.add_argument("--ctx", required=True, help="Path to JSON context file")
        parser.add_argument(
            "--out-api", default="generated_api", help="Target Django app dir"
        )
        parser.add_argument(
            "--out-client", default="generated_client", help="Target React dir"
        )

    def handle(self, *args, **opts):
        # 🔧 FIX: Use underscores (Django converts hyphens automatically)
        base = Path(__file__).resolve().parents[3] / "bashvilleapi" / "codegen"
        tdir = base / "templates"

        if not tdir.exists():
            raise CommandError(f"Templates not found: {tdir}")

        # Load context JSON
        ctx_path = Path(opts["ctx"])
        if not ctx_path.exists():
            raise CommandError(f"Context file not found: {ctx_path}")

        ctx = json.loads(ctx_path.read_text("utf-8"))

        # Setup Jinja2 environment
        env = Environment(
            loader=FileSystemLoader(str(tdir)),
            autoescape=select_autoescape(enabled_extensions=("html", "j2")),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # 🔧 FIX: Use underscores for accessing options
        api_dir = Path(opts["out_api"])  # Changed from opts["out-api"]
        api_dir.mkdir(parents=True, exist_ok=True)

        def render_write(template_rel, out_rel):
            """Render template and write to output file."""
            try:
                tpl = env.get_template(template_rel)
                out = tpl.render(**ctx)
                (api_dir / out_rel).write_text(out, encoding="utf-8")
                self.stdout.write(f"✅ Generated: {out_rel}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed to generate {out_rel}: {e}")
                )

        # Generate Django files
        self.stdout.write(self.style.SUCCESS("🚀 Generating Django files..."))
        render_write("django/models.py.j2", "models.py")
        render_write("django/serializers.py.j2", "serializers.py")
        render_write("django/viewsets.py.j2", "viewsets.py")
        render_write("django/urls.py.j2", "urls.py")

        # Generate seed script
        seed_tmp = api_dir / "_seed_tmp.py"
        try:
            # 🚀 Let's create a simple seed template for now
            seed_content = f"""
# Generated seed script for {ctx.get('project_title', 'Generated Project')}
from django.contrib.auth.models import User

# TODO: Add seed data for generated models
print("🌱 Seed script placeholder created")
"""
            seed_tmp.write_text(seed_content, encoding="utf-8")
            self.stdout.write("✅ Generated: _seed_tmp.py")
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Failed to generate seed script: {e}")
            )

        # Success message
        self.stdout.write(
            self.style.SUCCESS(
                f"\n🎉 Code generation complete!\n"
                f"📁 Output directory: {api_dir.absolute()}\n"
                f"🌱 Seed script: {seed_tmp.absolute()}\n"
                f"\nNext steps:\n"
                f"1. Review generated files\n"
                f"2. Run migrations: python manage.py makemigrations\n"
                f"3. Apply migrations: python manage.py migrate\n"
                f"4. Load seed data: python manage.py shell < {seed_tmp}"
            )
        )

        # Generate React files if requested
        if opts.get("include_react", True):
            self.stdout.write(self.style.SUCCESS("🚀 Generating React frontend..."))
            react_dir = Path(opts["out_client"])
            react_dir.mkdir(parents=True, exist_ok=True)

            # Create src directory structure
            (react_dir / "src" / "components").mkdir(parents=True, exist_ok=True)
            (react_dir / "public").mkdir(parents=True, exist_ok=True)

            # Generate React files
            react_templates = [
                ("react/src/App.jsx.j2", "src/App.jsx"),
                ("react/src/api.js.j2", "src/api.js"),
                ("react/src/styles.css.j2", "src/styles.css"),
                (
                    "react/src/components/CrudTable.jsx.j2",
                    "src/components/CrudTable.jsx",
                ),
                ("react/src/components/Navbar.jsx.j2", "src/components/Navbar.jsx"),
                ("react/src/components/Hero.jsx.j2", "src/components/Hero.jsx"),
                ("react/public/index.html.j2", "public/index.html"),
            ]

            for template_path, output_path in react_templates:
                try:
                    template = env.get_template(template_path)
                    content = template.render(**ctx)
                    (react_dir / output_path).write_text(content, encoding="utf-8")
                    self.stdout.write(f"✅ Generated: {output_path}")
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ Failed to generate {output_path}: {e}")
                    )
