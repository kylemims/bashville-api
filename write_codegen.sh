# write_codegen.sh
#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-14}"
TOKEN="${TOKEN:?export TOKEN=... first}"
APP_LABEL="generated_app"  # keep in sync with backend_config.app_label

# 1) Ensure app dir exists
mkdir -p "./${APP_LABEL}"
: > "./${APP_LABEL}/__init__.py"

# 2) Minimal apps.py
cat > "./${APP_LABEL}/apps.py" <<'PY'
from django.apps import AppConfig

class GeneratedAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "generated_app"
PY

# 3) Fetch code from API
TMP_JSON="$(mktemp)"
curl -s -X POST http://127.0.0.1:8000/codegen/generate \
  -H "Authorization: Token ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\": ${PROJECT_ID}}" > "$TMP_JSON"

# 4) Write files to disk with jq
jq -r '.files["models.py"]'      "$TMP_JSON" > "./${APP_LABEL}/models.py"
jq -r '.files["serializers.py"]' "$TMP_JSON" > "./${APP_LABEL}/serializers.py"
jq -r '.files["viewsets.py"]'    "$TMP_JSON" > "./${APP_LABEL}/viewsets.py"
jq -r '.files["urls.py"]'        "$TMP_JSON" > "./${APP_LABEL}/urls.py"

echo "✅ Wrote generated files into ${APP_LABEL}/"