#!/bin/bash
# Demo Project - Auto-generated setup script
# Generated on 2025-08-19

# Description: Live demo build

# Color Variables from "Bash Stash" palette
export PRIMARY_COLOR="#1f2937"
export SECONDARY_COLOR="#3b82f6"
export ACCENT_COLOR="#f59e0b"
export BACKGROUND_COLOR="#0b0f1a"

# Project Commands
echo "🚀 Setting up Demo Project..."

# Write .gitignore
echo "Step 1: Write .gitignore"
cat > .gitignore <<'EOF'
__pycache__/
*.pyc
*.sqlite3
.env
node_modules/
dist/
.vscode/
.DS_Store
EOF

# Init Git
echo "Step 2: Init Git"
git init && git add . && git commit -m "init"

# Run Server (auto-port)
echo "Step 3: Run Server (auto-port)"
PORT=
for p in 8000 8001 8002; do
  if ! lsof -i :$p >/dev/null 2>&1; then PORT=$p; break; fi
done
if [ -z "$PORT" ]; then echo "❌ No free port (8000–8002)"; exit 1; fi
echo "🌐 Starting on http://127.0.0.1:$PORT"
pipenv run python manage.py runserver 127.0.0.1:$PORT

echo "✅ Demo Project setup complete!"
