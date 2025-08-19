# bashvilleapi/management/commands/generate_fullstack.py
import json, shutil, subprocess
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from jinja2 import Environment, FileSystemLoader, select_autoescape


class Command(BaseCommand):
    help = "Render Django + React scaffolds from Jinja templates."

    def add_arguments(self, parser):
        parser.add_argument("--ctx", required=True, help="Path to JSON context file")
        parser.add_argument("--out-api", dest="out_api", default="generated_api")
        parser.add_argument(
            "--out-client", dest="out_client", default="generated_client"
        )
        parser.add_argument(
            "--include-react", dest="include_react", action="store_true", default=True
        )
        parser.add_argument(
            "--no-include-react", dest="include_react", action="store_false"
        )

    def handle(self, *args, **opts):
        base = Path(__file__).resolve().parents[3] / "bashvilleapi" / "codegen"
        tdir = base / "templates"
        if not tdir.exists():
            raise CommandError(f"Templates not found: {tdir}")

        ctx_path = Path(opts["ctx"])
        if not ctx_path.exists():
            raise CommandError(f"Context file not found: {ctx_path}")
        ctx = json.loads(ctx_path.read_text("utf-8"))

        env = Environment(
            loader=FileSystemLoader(str(tdir)),
            autoescape=select_autoescape(enabled_extensions=("html", "j2")),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        api_dir = Path(opts["out_api"])
        api_dir.mkdir(parents=True, exist_ok=True)

        def render_write(trel, orel, out_base=api_dir):
            tpl = env.get_template(trel)
            (out_base / orel).parent.mkdir(parents=True, exist_ok=True)
            (out_base / orel).write_text(tpl.render(**ctx), encoding="utf-8")
            self.stdout.write(self.style.SUCCESS(f"✅ {orel}"))

        # Django files
        self.stdout.write("🚀 Generating Django files…")
        render_write("django/models.py.j2", "models.py")
        render_write("django/serializers.py.j2", "serializers.py")
        render_write("django/viewsets.py.j2", "viewsets.py")
        render_write("django/urls.py.j2", "urls.py")

        # Seed placeholder (you can render from j2 if you want)
        (api_dir / "_seed_tmp.py").write_text(
            f'print("🌱 Seed script placeholder for {ctx.get("project_title","Generated Project")}")\n',
            encoding="utf-8",
        )

        # React
        if opts["include_react"]:
            client_dir = Path(opts["out_client"])
            client_dir.mkdir(parents=True, exist_ok=True)

            # If Vite app not initialized yet, create it (fast in demos)
            if not (client_dir / "index.html").exists():
                subprocess.run(
                    [
                        "npm",
                        "create",
                        "vite@latest",
                        str(client_dir),
                        "--",
                        "--template",
                        "react",
                    ],
                    check=True,
                )

            # Write files (align names with your templates)
            render_write("react/index.html.j2", "index.html", out_base=client_dir)
            render_write("react/src/App.jsx.j2", "src/App.jsx", out_base=client_dir)
            render_write("react/src/api.js.j2", "src/api.js", out_base=client_dir)
            render_write(
                "react/src/styles.css.j2", "src/styles.css", out_base=client_dir
            )
            render_write(
                "react/src/components/CrudTable.jsx.j2",
                "src/components/CrudTable.jsx",
                out_base=client_dir,
            )
            render_write(
                "react/src/components/Navbar.jsx.j2",
                "src/components/Navbar.jsx",
                out_base=client_dir,
            )
            render_write(
                "react/src/components/Hero.jsx.j2",
                "src/components/Hero.jsx",
                out_base=client_dir,
            )

            # Copy your logo into Vite public (so you can reference /assets/images/…)
            logo_src = Path(
                "/workspace/bashville-client/public/assets/images/box-logo.svg"
            )
            public_assets = client_dir / "public" / "assets" / "images"
            public_assets.mkdir(parents=True, exist_ok=True)
            if logo_src.exists():
                shutil.copy2(logo_src, public_assets / "box-logo.svg")
                self.stdout.write(
                    "🖼  Copied logo to client/public/assets/images/box-logo.svg"
                )
