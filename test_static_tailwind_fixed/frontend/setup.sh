#!/bin/bash
# Blog Demo with Categories - React + Tailwind Setup
# Generated on 

set -e  # Exit on any error

PROJECT_NAME=""
echo "🚀 Setting up ${PROJECT_NAME} with React + Tailwind..."

# Create Vite React project
npm create vite@latest . -- --template react
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install react-router-dom

echo "📦 Dependencies installed successfully"