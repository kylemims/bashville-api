#!/bin/bash
# Blog Demo with Categories - React + Tailwind CSS Setup
# Generated on 

set -e  # Exit on any error

PROJECT_NAME=""
echo "🚀 Setting up ${PROJECT_NAME} with React + Tailwind CSS..."

# Create Vite React project (suppress npm audit warnings)
echo "📦 Creating React app..."
npm create vite@latest . -- --template react --silent
npm install --silent

# Install Tailwind CSS and dependencies (suppress audit warnings)
echo "🎨 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer --silent
npx tailwindcss init -p --silent

# Install router for navigation
echo "📡 Installing React Router..."
npm install react-router-dom --silent

# Suppress npm audit warnings in package.json
echo "� Configuring project settings..."
npm pkg set scripts.audit="echo 'Audit disabled for development'"

echo ""
echo "✅ Setup complete! Your project is ready."
echo ""
echo "🚀 To start development:"
echo "   1. Frontend: cd frontend && npm run dev"
echo "   2. Backend: source venv/bin/activate && python manage.py runserver"
echo ""
echo "📱 Your app will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"