// gen.js — turn your /projects JSON into launch.sh
// Usage: curl .../projects | node gen.js > launch.sh && chmod +x launch.sh

function generateBashScript(project) {
  const commands = project.commands_preview || [];
  const palette = project.color_palette_preview;

  let script = `#!/bin/bash
# ${project.title} - Auto-generated setup script
# Generated on ${new Date().toISOString().split("T")[0]}

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

# Generate styles/colors.css with CSS variables
mkdir -p styles
cat > styles/colors.css <<'CSS'
:root {
  --primary-color: ${palette.primary_hex};
  --secondary-color: ${palette.secondary_hex};
  --accent-color: ${palette.accent_hex};
  --background-color: ${palette.background_hex};
  
  /* Additional derived colors for better theming */
  --text-color: color-mix(in oklab, var(--background-color) 10%, #000);
  --surface-color: color-mix(in oklab, var(--background-color) 85%, #fff);
  --border-color: color-mix(in oklab, var(--background-color) 60%, #fff);
}
CSS

`;
  }

  if (commands.length > 0) {
    script += `# Project Commands
echo "🚀 Setting up ${project.title}..."

# Auto-detect and configure frontend CSS loading
if [[ -f "public/index.html" ]]; then
  echo "📱 Configuring React (CRA) color palette loading..."
  # Add CSS link to React CRA public/index.html if not already present
  if ! grep -q "/styles/colors.css" public/index.html; then
    sed -i.bak 's|</head>|    <link rel="stylesheet" href="/styles/colors.css" />\\n  </head>|' public/index.html
    echo "✅ Added color palette link to public/index.html"
  fi
elif [[ -f "index.html" ]]; then
  echo "⚡ Configuring Vite + React color palette loading..."
  # Add CSS link to Vite index.html if not already present
  if ! grep -q "/styles/colors.css" index.html; then
    sed -i.bak 's|</head>|    <link rel="stylesheet" href="/styles/colors.css" />\\n  </head>|' index.html
    echo "✅ Added color palette link to index.html"
  fi
elif [[ -f "manage.py" ]]; then
  echo "🐍 Configuring Django color palette loading..."
  PROJECT_NAME=$(basename "$PWD")
  
  # Configure Django static files for colors.css
  if ! grep -q "STATICFILES_DIRS" \${PROJECT_NAME}project/settings.py; then
    printf "\\nSTATICFILES_DIRS = [BASE_DIR / 'styles']\\n" >> \${PROJECT_NAME}project/settings.py
    echo "✅ Added STATICFILES_DIRS to settings.py"
  fi
  
  # Create Django demo template with color palette
  mkdir -p templates
  cat > templates/base.html <<'HTML'
{% load static %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${project.title} Demo</title>
    <link rel="stylesheet" href="{% static 'colors.css' %}">
    <style>
      body { background: var(--background-color); color: var(--primary-color); font-family: system-ui; margin: 0; padding: 2rem; }
      .container { max-width: 800px; margin: 0 auto; }
      .cta { background: var(--accent-color); color: white; padding: 12px 16px; border-radius: 8px; border: none; font-weight: 600; text-decoration: none; display: inline-block; margin: 1rem 0; }
      .cta:hover { opacity: 0.9; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🎨 ${project.title} - Palette Demo Ready!</h1>
      <p>Your color palette is loaded and working. Background uses <code>var(--background-color)</code>, text uses <code>var(--primary-color)</code>.</p>
      <a href="#" class="cta">This button uses accent color</a>
      <p>Ready for development! All CSS variables are available.</p>
    </div>
  </body>
</html>
HTML
  
  # Point root URL to the demo template
  python3 - <<'PY'
import re, pathlib
project_name = "${project.title.toLowerCase().replace(/[^a-z0-9]/g, "")}"
p = pathlib.Path(f"{project_name}project/urls.py")
if p.exists():
    s = p.read_text()
    if "TemplateView" not in s:
        s = re.sub(r"from django.urls import.*", "from django.urls import path\\nfrom django.views.generic import TemplateView", s)
        s = re.sub(r"urlpatterns\\s*=\\s*\\[[\\s\\S]*?\\]", 
                   "urlpatterns = [\\n    path('', TemplateView.as_view(template_name='base.html')),\\n]", s, count=1)
        p.write_text(s)
        print("✅ Updated URLs to show color demo")
PY
  
  echo "✅ Django color palette demo configured"
else
  echo "ℹ️  Manual setup: Add <link rel=\\"stylesheet\\" href=\\"/styles/colors.css\\" /> to your HTML <head>"
fi

`;
    commands.forEach((cmd, index) => {
      script += `# ${cmd.label}
echo "Step ${index + 1}: ${cmd.label}"
${cmd.command_text}

`;
    });
    script += `echo "✅ ${project.title} setup complete!"
`;
  } else {
    script += `echo "🚀 ${project.title} - No commands configured yet"
`;
  }

  return script;
}

// Read JSON (either an array of projects or a single project) from stdin
const chunks = [];
process.stdin.on("data", (d) => chunks.push(d));
process.stdin.on("end", () => {
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    console.error("No JSON received on stdin.");
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }
  const project = Array.isArray(data) ? data[0] : data;
  if (!project) {
    console.error("No project found in JSON.");
    process.exit(1);
  }
  process.stdout.write(generateBashScript(project));
});
