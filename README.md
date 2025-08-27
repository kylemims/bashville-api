# ⚡ Bashville API - The Layout Stash System

A Django REST API that generates complete, deployable web applications on demand. Choose your stack, pick your colors, and get a fully-functional React project with optional Django backend — all styled with your custom color palette and ready to deploy.

Built with Django REST Framework, Jinja2 templating, and a whole lot of creative engineering...and very little sleep 😱

---

## 🚀 What It Does

### For Developers Who Want To Move Fast
- **4 Project Types:** Static React + CSS/Tailwind, Full-Stack React + Django + CSS/Tailwind
- **Smart Code Generation:** Complete file structures with working React components
- **Color Palette Integration:** Your chosen colors automatically flow through CSS variables and Tailwind configs
- **Custom Command Sequences:** Chain bash commands for complex project setups
- **Instant Download:** Get a ZIP with everything you need to `npm install && npm run dev`

### The Magic Behind The Scenes
- **Jinja2 Template System:** Dynamic code generation with conditional logic
- **User Isolation:** Every user gets their own sandbox of projects and palettes
- **RESTful Design:** Clean API endpoints for projects, commands, and color palettes
- **Token Authentication:** Secure user sessions with DRF tokens

> **Philosophy:** Stop copying boilerplate. Generate it intelligently, customize it beautifully, ship it quickly.

---

## ⚙️ Tech Stack

- **Backend:** Django 4.2, Django REST Framework, SQLite (dev) / PostgreSQL (prod)
- **Templates:** Jinja2 for dynamic code generation
- **Authentication:** Token-based auth with custom login/register views
- **Frontend Templates:** React 18 + Vite, Tailwind CSS, Custom CSS frameworks
- **Tooling:** Pipenv, Django management commands, custom fixtures

---

## 🏗️ Project Architecture

```
bashville-api/
├── bashvilleapi/                 # Main Django app
│   ├── models/                   # Domain models (Project, Command, ColorPalette)
│   ├── views/                    # DRF ViewSets + custom auth
│   ├── serializers/              # API serialization with security patterns
│   ├── codegen/                  # Template engine + generation logic
│   │   └── templates/layouts/    # React project templates
│   ├── fixtures/                 # Test data for consistent development
│   └── management/commands/      # Custom Django commands
├── bashvilleproject/             # Django project config
├── generated_app/                # Example of generated output
└── docs/                         # Implementation guides for client-side
```

---

## 🌐 API Endpoints

### Core Resources
```
GET    /projects/              # List user's projects
POST   /projects/              # Create new project
GET    /projects/{id}/          # Get project details
PUT    /projects/{id}/          # Update project

GET    /colorpalettes/          # List available color palettes
GET    /commands/               # List user's command sequences
POST   /commands/               # Create custom command
```

### The Good Good
```
POST   /codegen/generate        # Generate complete project files
POST   /auth/login/             # Get user token
POST   /auth/register/          # Create account
```

### Generation Response
```json
{
  "project_id": 1,
  "project_type": "static-tailwind",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "import React from 'react';\n..."
    },
    {
      "path": "package.json", 
      "content": "{\n  \"name\": \"my-project\",\n..."
    }
  ],
  "setup_instructions": {
    "message": "Static React project generated!",
    "steps": ["npm install", "npm run dev"]
  }
}
```

---

## 💡 Quick Setup

### Development
```bash
# Clone and setup
git clone https://github.com/kylemims/bashville-api
cd bashville-api

# Install dependencies
pipenv install && pipenv shell

# Setup database with test data
./seed_database.sh

# Run the server
python manage.py runserver
```

### Test the API
```bash
# Create test user and get token
python manage.py create_test_user

# Test generation (replace with actual project ID)
curl -X POST http://localhost:8000/codegen/generate \
  -H "Authorization: Token 016bc9319e0fa29ff7a4c55ea0523014028c1be4" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1}'
```

---

## 🧪 Available Project Types

### Static Frontend
- **static-tailwind:** React + Vite + Tailwind CSS (utility-first)
- **static-css:** React + Vite + Custom CSS (full control)

### Full-Stack
- **fullstack-tailwind:** React frontend + Django REST backend + Tailwind
- **fullstack-css:** React frontend + Django REST backend + Custom CSS

Each generates 8+ files including:
- Complete React app with your color palette
- Package.json with proper dependencies
- Vite config optimized for development
- Setup script for one-command deployment
- (Full-stack: Django models, serializers, viewsets, URLs)

---

## 🎨 Color Palette Magic

Colors automatically flow through:
```css
:root {
  --color-primary: #your-primary;
  --color-secondary: #your-secondary;
  --color-accent: #your-accent;
  --color-background: #your-background;
}
```

And Tailwind configs:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-primary',
      secondary: '#your-secondary',
      // ...
    }
  }
}
```

---

## 🚀 Deployment Ready

### For Render/Railway/etc:
- PostgreSQL configuration included
- Environment-based settings
- Static file handling with WhiteNoise
- Production security headers
- CORS properly configured

### For the Generated Projects:
- Vite build optimization
- CSS minification
- Modern React patterns
- Mobile-responsive design

---

## 📁 What You Get

When you generate a project, you receive a complete, working application:

```
my-generated-project/
├── src/
│   ├── App.jsx           # Main component with your colors
│   ├── main.jsx          # React entry point
│   └── index.css         # Styled with your palette
├── index.html            # Vite HTML template
├── package.json          # Dependencies + scripts
├── vite.config.js        # Build configuration
├── tailwind.config.js    # (If Tailwind selected)
└── setup.sh              # One-command setup
```

Run `chmod +x setup.sh && ./setup.sh && npm run dev` and you're live.

---

## 🛠️ Advanced Features

### Custom Command Sequences
Chain multiple bash commands for complex setups:
```json
{
  "commands": [
    "python -m venv venv && source venv/bin/activate",
    "pip install django djangorestframework", 
    "django-admin startproject myproject ."
  ]
}
```

### Backend Configuration
For full-stack projects, define Django models:
```json
{
  "backend_config": {
    "app_label": "tasks",
    "models": [
      {
        "name": "Task",
        "fields": [
          {"name": "title", "type": "CharField", "max_length": 200},
          {"name": "completed", "type": "BooleanField", "default": false}
        ]
      }
    ]
  }
}
```

---

## 🧠 Design Philosophy

**Speed Over Perfection:** Generate working code, iterate from there  
**Batteries Included:** Color palettes, responsive design, modern tooling  
**User Isolation:** Your projects, your commands, your creative space  
**Real Output:** No toy examples — production-ready code

---

⸻

👨‍💻 **Built With Intention**

Crafted by Kyle Mims  
🧠 Nashville Software School · 2025  
⚡ Creating more time for creating

---

## 🤝 Contributing

This is a learning project, but if you see improvements:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR with clear description

---


## 📄 License

License TBD - This is a learning project, reach out if you want to use it commercially.