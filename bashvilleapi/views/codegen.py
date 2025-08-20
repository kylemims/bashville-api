# bashvilleapi/views/codegen.py
from typing import Dict, List
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from bashvilleapi.models import Project

# ---- tiny helpers -----------------------------------------------------------

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

    if not name or not ftype:
        return ""

    # Simple primitives
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
        opts: List[str] = []
        # carry through known kwargs if present
        for k in ("max_length", "null", "blank", "unique", "default"):
            if k in field:
                v = field[k]
                # strings need quotes, others as-is
                if isinstance(v, str):
                    opts.append(f'{k}="{v}"')
                else:
                    opts.append(f"{k}={v}")
        kwargs = (", " + ", ".join(opts)) if opts else ""
        return f"    {name} = models.{ftype}({kwargs})"

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

    # nice __str__
    lines.append("")
    lines.append("    def __str__(self):")
    lines.append(f'        return f"{mname}({{self.pk}})"')
    return "\n".join(lines)


def render_models_py(cfg: Dict) -> str:
    """Generate a minimal models.py from backend_config."""
    app_label = cfg.get("app_label", "generated_app")
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
        files = {
            "models.py": render_models_py(cfg),
            "serializers.py": render_serializers_py(cfg),
            "viewsets.py": render_viewsets_py(cfg),
            "urls.py": render_urls_py(cfg),
            # You can add admin.py, __init__.py, etc. later
        }
        return Response(
            {
                "project_id": project.id,
                "app_label": cfg.get("app_label", "generated_app"),
                "files": files,
            }
        )
