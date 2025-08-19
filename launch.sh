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

# Init Git
echo "Step 1: Init Git"
git init && git add . && git commit -m "init"

# Run Server
echo "Step 2: Run Server"
pipenv run python manage.py runserver

echo "✅ Demo Project setup complete!"
