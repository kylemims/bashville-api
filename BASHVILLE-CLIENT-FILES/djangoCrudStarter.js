export const DJANGO_STARTER_COMMANDS = [
  {
    label: "Init Git",
    command_text: `git init && git add . && git commit -m "Initial commit"`,
  },
  {
    label: "Run Server (auto-port)",
    command_text: `PORT=
for p in 8000 8001 8002; do
  if ! lsof -i :$p >/dev/null 2>&1; then PORT=$p; break; fi
done
if [ -z "$PORT" ]; then echo "❌ No free port (8000–8002)"; exit 1; fi
echo "🌐 Starting on http://127.0.0.1:$PORT"
pipenv run python manage.py runserver 127.0.0.1:$PORT`,
  },
];
