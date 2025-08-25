# API Reference for Layout Stash System

## Base URL
`http://localhost:8000` (development)

## Authentication
All endpoints require authentication via Token header:
```
Authorization: Token <user_token>
```

## Project Endpoints

### GET /projects/
**Purpose**: List all projects for authenticated user
**Response**:
```json
[
  {
    "id": 1,
    "title": "My React App",
    "description": "A sample project",
    "project_type": "static-tailwind",
    "color_palette": 2,
    "color_palette_preview": {
      "id": 2,
      "name": "Ocean Blue",
      "primary_hex": "#3b82f6",
      "secondary_hex": "#1e40af",
      "accent_hex": "#06b6d4",
      "background_hex": "#f8fafc"
    },
    "backend_config": {},
    "command_ids": [],
    "commands_preview": [],
    "created_at": "2025-08-23T10:00:00Z"
  }
]
```

### POST /projects/
**Purpose**: Create new project
**Request Body**:
```json
{
  "title": "My New Project",
  "description": "Project description",
  "project_type": "fullstack-tailwind",
  "color_palette": 1,
  "backend_config": {
    "app_label": "my_app",
    "models": [
      {
        "name": "BlogPost",
        "fields": [
          {"name": "title", "type": "CharField", "max_length": 200},
          {"name": "content", "type": "TextField"},
          {"name": "published", "type": "BooleanField", "default": false}
        ]
      }
    ],
    "options": {
      "timestamps": true
    }
  }
}
```

### PUT /projects/{id}/
**Purpose**: Update existing project
**Request Body**: Same as POST (partial updates supported)

### DELETE /projects/{id}/
**Purpose**: Delete project

## Code Generation Endpoint

### POST /codegen/generate
**Purpose**: Generate complete project files
**Request Body**:
```json
{
  "project_id": 1
}
```

**Response**:
```json
{
  "project_id": 1,
  "project_name": "mynewproject",
  "project_type": "static-tailwind",
  "app_label": "my_app",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-[#f8fafc]\">\n      <header className=\"bg-[#3b82f6] text-white p-6\">\n        <h1 className=\"text-3xl font-bold\">My New Project</h1>\n      </header>\n      <main className=\"container mx-auto p-6\">\n        <p className=\"text-[#1e40af]\">Welcome to your generated project!</p>\n      </main>\n    </div>\n  );\n}\n\nexport default App;"
    },
    {
      "path": "src/index.css",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --color-primary: #3b82f6;\n  --color-secondary: #1e40af;\n  --color-accent: #06b6d4;\n  --color-background: #f8fafc;\n}"
    },
    {
      "path": "src/main.jsx",
      "content": "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)"
    },
    {
      "path": "index.html",
      "content": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>My New Project</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>"
    },
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"mynewproject\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.2.15\",\n    \"@types/react-dom\": \"^18.2.7\",\n    \"@vitejs/plugin-react\": \"^4.0.3\",\n    \"autoprefixer\": \"^10.4.14\",\n    \"postcss\": \"^8.4.27\",\n    \"tailwindcss\": \"^3.3.3\",\n    \"vite\": \"^4.4.5\"\n  }\n}"
    },
    {
      "path": "vite.config.js",
      "content": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})"
    },
    {
      "path": "tailwind.config.js",
      "content": "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [\n    \"./index.html\",\n    \"./src/**/*.{js,ts,jsx,tsx}\",\n  ],\n  theme: {\n    extend: {\n      colors: {\n        primary: '#3b82f6',\n        secondary: '#1e40af',\n        accent: '#06b6d4',\n        background: '#f8fafc'\n      }\n    },\n  },\n  plugins: [],\n}"
    },
    {
      "path": "setup.sh",
      "content": "#!/bin/bash\n\n# Auto-generated setup script for mynewproject\n# Project Type: static-tailwind\n# Generated: 2025-08-25\n\necho \"🚀 Setting up mynewproject (Static React + Tailwind)...\"\n\n# Install dependencies\necho \"📦 Installing dependencies...\"\nnpm install\n\necho \"✅ Setup complete!\"\necho \"\"\necho \"🎯 To start development:\"\necho \"   npm run dev\"\necho \"\"\necho \"🏗️  To build for production:\"\necho \"   npm run build\"\necho \"\"\necho \"📁 Project structure:\"\necho \"   src/App.jsx     - Main React component\"\necho \"   src/index.css   - Tailwind CSS with color variables\"\necho \"   tailwind.config.js - Tailwind configuration with your colors\"\n"
    }
  ],
  "setup_instructions": {
    "message": "Static React project generated! Ready for frontend development.",
    "steps": [
      "chmod +x setup.sh",
      "./setup.sh",
      "npm run dev"
    ]
  }
}
```

## Color Palette Endpoints

### GET /colorpalettes/
**Purpose**: List all color palettes for authenticated user
**Response**:
```json
[
  {
    "id": 1,
    "name": "Ocean Blue",
    "primary_hex": "#3b82f6",
    "secondary_hex": "#1e40af",
    "accent_hex": "#06b6d4",
    "background_hex": "#f8fafc",
    "created_at": "2025-08-23T10:00:00Z"
  }
]
```

## Commands Endpoints

### GET /commands/
**Purpose**: List all bash commands for authenticated user
**Response**:
```json
[
  {
    "id": 1,
    "label": "Install Dependencies",
    "command_text": "npm install",
    "order_index": 1,
    "created_at": "2025-08-23T10:00:00Z"
  }
]
```

## Project Types

### Available Types
1. **static-tailwind**: Static React + Tailwind CSS
2. **static-css**: Static React + Custom CSS  
3. **fullstack-tailwind**: Full-Stack (React + Django) + Tailwind
4. **fullstack-css**: Full-Stack (React + Django) + Custom CSS

### Generated File Structure by Type

#### static-tailwind / static-css
```
├── src/
│   ├── App.jsx
│   └── index.css
├── package.json
├── tailwind.config.js (tailwind only)
└── setup.sh
```

#### fullstack-tailwind / fullstack-css
```
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js (tailwind only)
├── {project_name}backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── {app_label}/
│   ├── models.py
│   ├── serializers.py
│   ├── viewsets.py
│   ├── urls.py
│   ├── admin.py
│   └── apps.py
├── manage.py
├── requirements.txt
├── .env
├── templates/
│   └── base.html
└── setup.sh
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Project not found."
}
```

```json
{
  "error": "project_id is required."
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Integration Notes

### Color Variable Usage
Generated CSS includes CSS variables for easy theming:
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #1e40af;
  --color-accent: #06b6d4;
  --color-background: #f8fafc;
}
```

### Tailwind Integration
Tailwind config includes custom colors matching the palette:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#06b6d4',
      background: '#f8fafc'
    }
  }
}
```

### Setup Script Features
- Automatic dependency installation
- Environment setup for full-stack projects
- Git initialization
- Development server startup instructions
- Clear project structure documentation
