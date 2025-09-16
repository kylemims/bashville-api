import { getBackendConfig } from "./backendConfig";

export const generateBashScript = (project) => {
  const commands = project.commands_preview || [];
  const palette = project.color_palette_preview;
  const backend = getBackendConfig(project.id);

  let script = `#!/bin/bash
# ${project.title} - Auto-generated setup script
# Generated on ${new Date().toISOString().split("T")[0]}
#
# How to run:
#   chmod +x setup.sh
#   ./setup.sh
#
# Notes:
# - Safe-by-default: we only create files if they don't exist.
# - You can edit this file before running if you want.

set -euo pipefail

# --- helpers ---------------------------------------------------------------
confirm() {
  # Usage: confirm "Message"; returns 0 for yes, 1 for no
  read -r -p "$1 [y/N] " ans || true
  case "\${ans}" in
    [yY][eE][sS]|[yY]) return 0 ;;
    *) return 1 ;;
  esac
}

# --- .gitignore (mix of Python/Node/editor) -------------------------------
echo "==> Ensuring a useful .gitignore is present…"
if [ ! -f ".gitignore" ]; then
  # Prefer GitHub template for Python; then add a few extras
  if command -v curl >/dev/null 2>&1; then
    curl -Ls 'https://raw.githubusercontent.com/github/gitignore/master/Python.gitignore' > .gitignore || true
  fi
  # Append extras; duplicates are fine
  cat >> .gitignore <<'EOF_GI'
db.sqlite3
.env
node_modules/
dist/
.vscode/
.DS_Store
__pycache__/
*.pyc
EOF_GI
  echo "✓ wrote .gitignore"
else
  echo "• .gitignore already exists; leaving it untouched."
fi

`;

  if (project.description) {
    script += `# Description: ${project.description}\n\n`;
  }

  if (palette) {
    script += `# Color Variables from "${palette.name}" palette
export PRIMARY_COLOR="${palette.primary_hex}"
export SECONDARY_COLOR="${palette.secondary_hex}"
export ACCENT_COLOR="${palette.accent_hex}"
export BACKGROUND_COLOR="${palette.background_hex}"

# Also write CSS variables for your app
mkdir -p styles
cat > styles/colors.css <<'CSSVARS'
:root {
  --primary-color: ${palette.primary_hex};
  --secondary-color: ${palette.secondary_hex};
  --accent-color: ${palette.accent_hex};
  --background-color: ${palette.background_hex};
}
CSSVARS

`;
  }

  if (backend && (backend.models?.length || backend.relationships?.length)) {
    script += `# Backend Schema (preview)
# This mirrors your Backend tab selections for reference.
cat > backend_schema.json <<'JSON'
${JSON.stringify(backend, null, 2)}
JSON

`;
  }

  if (commands.length > 0) {
    script += `# Project Commands
echo "🚀 Setting up ${project.title}..."

`;
    commands.forEach((cmd, index) => {
      const label = (cmd.label || `Step ${index + 1}`).replace(/\n/g, " ");
      script += `# ${label}
echo "Step ${index + 1}: ${label}"
${cmd.command_text}

`;
    });
    script += `echo "✅ ${project.title} setup complete!"
`;
  } else {
    script += `echo "ℹ️  ${project.title}: no project commands were configured yet."
`;
  }

  return script;
};
