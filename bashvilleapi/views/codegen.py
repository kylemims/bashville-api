# bashvilleapi/views/codegen.py
from typing import Dict, Any, List
from datetime import datetime
from django.utils.text import slugify
from django.template import Template, Context
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from bashvilleapi.models import Project
import os

# ---- tiny helpers -----------------------------------------------------------


def render_template_file(template_path: str, context: Dict) -> str:
    """Render a Jinja2 template file with the given context."""
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            template_content = f.read()

        # Use Django's template system since we're in Django
        template = Template(template_content)
        django_context = Context(context)
        return template.render(django_context)
    except Exception as e:
        return f"# Error rendering template: {e}"


def get_layout_template_path(layout_type: str, filename: str) -> str:
    """Get the full path to a layout template file."""
    base_path = os.path.join(
        os.path.dirname(__file__), "..", "codegen", "templates", "layouts"
    )
    return os.path.join(base_path, layout_type, filename)


def get_template_path(filename: str) -> str:
    """Get the full path to a Django template file."""
    base_path = os.path.join(
        os.path.dirname(__file__), "..", "codegen", "templates", "django"
    )
    return os.path.join(base_path, filename)


ON_DELETE_MAP = {
    "CASCADE": "models.CASCADE",
    "PROTECT": "models.PROTECT",
    "SET_NULL": "models.SET_NULL",
    "SET_DEFAULT": "models.SET_DEFAULT",
    "DO_NOTHING": "models.DO_NOTHING",
}


def _field_line(field: Dict) -> str:
    """Render a single Django model field line from a backend_config field dict."""
    ftype = field.get("type")
    name = field.get("name")

    if ftype == "CharField" and "max_length" not in field:
        field["max_length"] = 255

    if not name or not ftype:
        return ""

    if ftype in {
        "CharField",
        "TextField",
        "IntegerField",
        "FloatField",
        "BooleanField",
        "DateField",
        "DateTimeField",
        "EmailField",
    }:
        if ftype == "CharField" and "max_length" not in field:
            field["max_length"] = 255

        opts: List[str] = []
        for k in ("max_length", "null", "blank", "unique", "default"):
            if k in field:
                v = field[k]
                opts.append(f'{k}="{v}"' if isinstance(v, str) else f"{k}={v}")

        kwargs = ", ".join(opts)
        return (
            f"    {name} = models.{ftype}({kwargs})"
            if kwargs
            else f"    {name} = models.{ftype}()"
        )

    # ForeignKey / ManyToMany / OneToOne
    if ftype in {"ForeignKey", "OneToOneField", "ManyToManyField"}:
        to = field.get("to")
        if not to:
            return ""
        opts: List[str] = []
        rn = field.get("related_name")
        if rn:
            opts.append(f'related_name="{rn}"')

        if ftype != "ManyToManyField":
            od = ON_DELETE_MAP.get(field.get("on_delete", "CASCADE"), "models.CASCADE")
            opts.insert(0, f"on_delete={od}")

        for k in ("null", "blank", "unique"):
            if k in field:
                opts.append(f"{k}={field[k]}")

        kwargs = (", " + ", ".join(opts)) if opts else ""
        return f'    {name} = models.{ftype}("{to}"{kwargs})'

    # Fallback comment to avoid breaking generation
    return f"    # TODO: unsupported field type {ftype!r} for {name!r}"


def _model_class(model: Dict, timestamps: bool) -> str:
    mname = model.get("name")
    fields = model.get("fields", [])
    if not mname:
        return ""

    lines = [f"class {mname}(models.Model):"]
    if not fields and not timestamps:
        lines.append("    pass")
    else:
        for f in fields:
            line = _field_line(f)
            if line:
                lines.append(line)
        if timestamps:
            lines.append("    created_at = models.DateTimeField(auto_now_add=True)")
            lines.append("    updated_at = models.DateTimeField(auto_now=True)")

    lines.append("")
    lines.append("    def __str__(self):")
    lines.append(f'        return f"{mname}({{self.pk}})"')
    return "\n".join(lines)


def render_models_py(cfg: Dict[str, Any]) -> str:
    options = cfg.get("options", {})
    timestamps = bool(options.get("timestamps", True))
    models_cfg = cfg.get("models", [])

    header = [
        "# Auto-generated from backend_config",
        "from django.db import models",
        "",
    ]
    bodies = [_model_class(m, timestamps) for m in models_cfg]
    body = "\n\n\n".join([b for b in bodies if b])

    return "\n".join(header + [body, ""])


def render_serializers_py(cfg: Dict) -> str:
    models_cfg = cfg.get("models", [])
    lines = [
        "# Auto-generated (basic) serializers",
        "from rest_framework import serializers",
        "from .models import *",
        "",
    ]
    for m in models_cfg:
        name = m.get("name")
        if not name:
            continue
        lines += [
            f"class {name}Serializer(serializers.ModelSerializer):",
            "    class Meta:",
            f"        model = {name}",
            "        fields = '__all__'",
            "",
        ]
    return "\n".join(lines)


def render_viewsets_py(cfg: Dict) -> str:
    models_cfg = cfg.get("models", [])
    lines = [
        "# Auto-generated (basic) viewsets",
        "from rest_framework import viewsets, permissions",
        "from .models import *",
        "from .serializers import *",
        "",
    ]
    for m in models_cfg:
        name = m.get("name")
        if not name:
            continue
        lines += [
            f"class {name}ViewSet(viewsets.ModelViewSet):",
            f"    queryset = {name}.objects.all()",
            f"    serializer_class = {name}Serializer",
            "    permission_classes = [permissions.IsAuthenticated]",
            "",
        ]
    return "\n".join(lines)


def render_urls_py(cfg: Dict) -> str:
    models_cfg = cfg.get("models", [])
    lines = [
        "# Auto-generated urls wiring",
        "from django.urls import path, include",
        "from rest_framework.routers import DefaultRouter",
        "from .viewsets import *",
        "",
        "router = DefaultRouter(trailing_slash=False)",
    ]
    for m in models_cfg:
        name = m.get("name")
        if not name:
            continue
        base = slugify(name).replace("-", "")
        lines.append(f'router.register(r"{base}s", {name}ViewSet, basename="{base}")')
    lines += [
        "",
        "urlpatterns = [",
        "    path('', include(router.urls)),",
        "]",
        "",
    ]
    return "\n".join(lines)


# ---- API view ---------------------------------------------------------------


class CodegenGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        project_id = request.data.get("project_id")
        if not project_id:
            return Response(
                {"error": "project_id is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id, user=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        cfg = project.backend_config or {}
        app_label = cfg.get("app_label", "generated_app")
        project_name = slugify(project.title).replace("-", "")

        # Template context for all files
        template_context = {
            "project": project,
            "project_title": project.title,
            "project_name": project_name,
            "project_type": project.project_type,
            "app_label": app_label,
            "models": cfg.get("models", []),
            "timestamps": cfg.get("options", {}).get("timestamps", True),
            "color_palette": project.color_palette_preview,
            "backend_config": cfg,
            "generation_date": datetime.now().strftime("%Y-%m-%d"),
        }

        # Determine if this is a frontend-only or full-stack project
        is_fullstack = project.project_type.startswith("fullstack")
        is_tailwind = "tailwind" in project.project_type

        files = {}

        # ===== FRONTEND FILES =====
        if is_fullstack:
            frontend_prefix = "frontend/"
        else:
            frontend_prefix = ""

        # Add layout-specific files based on project type
        layout_folder = "react-tailwind" if is_tailwind else "react-css"

        try:
            # Core frontend files
            files[f"{frontend_prefix}src/App.jsx"] = render_template_file(
                get_layout_template_path(layout_folder, "src/App.jsx.j2"),
                template_context,
            )
            files[f"{frontend_prefix}src/index.css"] = render_template_file(
                get_layout_template_path(layout_folder, "src/index.css.j2"),
                template_context,
            )

            if is_tailwind:
                files[f"{frontend_prefix}tailwind.config.js"] = render_template_file(
                    get_layout_template_path(layout_folder, "tailwind.config.js.j2"),
                    template_context,
                )

            # Package.json for frontend
            files[f"{frontend_prefix}package.json"] = (
                render_template_file(
                    get_layout_template_path(layout_folder, "package.json.j2"),
                    template_context,
                )
                if os.path.exists(
                    get_layout_template_path(layout_folder, "package.json.j2")
                )
                else '{\n  "name": "'
                + project_name
                + '",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module"\n}'
            )

        except Exception as e:
            files["_frontend_error"] = f"Frontend template error: {e}"

        # ===== BACKEND FILES (for full-stack projects) =====
        if is_fullstack:
            try:
                # Generate core Django app files
                files.update(
                    {
                        f"{app_label}/models.py": render_models_py(cfg),
                        f"{app_label}/serializers.py": render_serializers_py(cfg),
                        f"{app_label}/viewsets.py": render_viewsets_py(cfg),
                        f"{app_label}/urls.py": render_urls_py(cfg),
                        f"{app_label}/__init__.py": "",
                        f"{app_label}/apps.py": render_template_file(
                            get_template_path("apps.py.j2"), template_context
                        ),
                        f"{app_label}/admin.py": render_template_file(
                            get_template_path("admin.py.j2"), template_context
                        ),
                        # Django project files
                        f"{project_name}backend/__init__.py": "",
                        f"{project_name}backend/settings.py": render_template_file(
                            get_template_path("settings.py.j2"), template_context
                        ),
                        f"{project_name}backend/urls.py": render_template_file(
                            get_template_path("project_urls.py.j2"), template_context
                        ),
                        f"{project_name}backend/wsgi.py": f"""import os\nfrom django.core.wsgi import get_wsgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', '{project_name}backend.settings')\napplication = get_wsgi_application()""",
                        f"{project_name}backend/asgi.py": f"""import os\nfrom django.core.asgi import get_asgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', '{project_name}backend.settings')\napplication = get_asgi_application()""",
                        "manage.py": f"""#!/usr/bin/env python\nimport os\nimport sys\n\nif __name__ == '__main__':\n    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '{project_name}backend.settings')\n    try:\n        from django.core.management import execute_from_command_line\n    except ImportError as exc:\n        raise ImportError(\n            "Couldn't import Django. Are you sure it's installed and "\n            "available on your PYTHONPATH environment variable? Did you "\n            "forget to activate a virtual environment?"\n        ) from exc\n    execute_from_command_line(sys.argv)""",
                        "requirements.txt": "django>=4.2.0\ndjangorestframework>=3.14.0\ndjango-cors-headers>=4.0.0\npython-decouple>=3.8",
                        ".env": f"DEBUG=True\nSECRET_KEY=your-secret-key-change-in-production-{project_name}\nDATABASE_URL=sqlite:///db.sqlite3",
                        "templates/base.html": render_template_file(
                            get_template_path("templates/base.html.j2"),
                            template_context,
                        ),
                    }
                )
            except Exception as e:
                files["_backend_error"] = f"Backend template error: {e}"

        # ===== MASTER SETUP SCRIPT =====
        try:
            master_setup_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "codegen",
                "templates",
                "layouts",
                "master-setup.sh.j2",
            )
            files["setup.sh"] = render_template_file(
                master_setup_path, template_context
            )
        except Exception as e:
            files["setup.sh"] = (
                f"#!/bin/bash\n# Setup script generation error: {e}\necho 'Please check your project configuration'"
            )

        # ===== SETUP INSTRUCTIONS =====
        if is_fullstack:
            setup_message = (
                "Complete full-stack project generated! Frontend + Backend ready."
            )
            setup_steps = [
                "chmod +x setup.sh",
                "./setup.sh",
                "Frontend: cd frontend && npm run dev",
                "Backend: source venv/bin/activate && python manage.py runserver",
            ]
        else:
            setup_message = (
                "Static React project generated! Ready for frontend development."
            )
            setup_steps = ["chmod +x setup.sh", "./setup.sh", "npm run dev"]

        return Response(
            {
                "project_id": project.id,
                "project_name": project_name,
                "project_type": project.project_type,
                "app_label": app_label,
                "files": files,
                "setup_instructions": {
                    "message": setup_message,
                    "steps": setup_steps,
                },
            }
        )
