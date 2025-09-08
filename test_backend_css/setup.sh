#!/bin/bash
# Blog Demo with Categories - Full-Stack Setup Script
# Generated on 

set -e  # Exit on any error

PROJECT_NAME=""
echo "🚀 Setting up ${PROJECT_NAME} Full-Stack Application..."
echo ""

# Function to suppress npm output
run_npm() {
    npm "$@" --silent --no-audit --no-fund 2>/dev/null
}

# Frontend Setup
echo "📦 Setting up Frontend (React + Tailwind)..."
cd frontend

# Check if package.json exists, if not create Vite project
if [ ! -f "package.json" ]; then
    echo "   Creating React app with Vite..."
    run_npm create vite@latest . -- --template react
fi

echo "   Installing dependencies..."
run_npm install

echo "   Adding Tailwind CSS..."
run_npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p >/dev/null 2>&1

echo "   Adding React Router..."
run_npm install react-router-dom

# Backend Setup
cd ..
echo ""
echo "🐍 Setting up Backend (Django)..."

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "   Installing Python dependencies..."
source venv/bin/activate
pip install --quiet django djangorestframework django-cors-headers

# Run Django setup
echo "   Setting up Django database..."
python manage.py makemigrations --verbosity=0 >/dev/null 2>&1 || true
python manage.py migrate --verbosity=0 >/dev/null 2>&1

# Create superuser if it doesn't exist
echo "   Creating admin user (admin/admin123)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
" >/dev/null 2>&1 || true

echo ""
echo "✅ Setup Complete! Your full-stack application is ready."
echo ""
echo "🚀 To start development:"
echo ""
echo "   Terminal 1 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "   Terminal 2 - Backend:"
echo "   source venv/bin/activate && python manage.py runserver"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin (admin/admin123)"
echo ""
echo "🎉 Happy coding!"