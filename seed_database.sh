#!/bin/bash

echo "🗑️  Cleaning database..."
rm -f db.sqlite3
rm -rf ./bashvilleapi/migrations

echo "🔄 Running migrations..."
python3 manage.py migrate
python3 manage.py makemigrations bashvilleapi
python3 manage.py migrate bashvilleapi

echo "👤 Creating test user..."
python3 manage.py create_test_user

echo "📊 Loading seed data..."
python3 manage.py loaddata color_palettes
python3 manage.py loaddata commands  
python3 manage.py loaddata projects
python3 manage.py loaddata project_commands

echo "✅ Database seeded successfully!"
echo "Test user credentials: testuser / testpass123"