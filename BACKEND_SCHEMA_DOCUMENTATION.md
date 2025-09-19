# Bashville API - Complete Backend Schema & Configuration Documentation

**Generated:** September 18, 2025  
**Purpose:** Comprehensive backend documentation for client-side LLM integration

---

## Table of Contents

1. [Project Architecture Overview](#project-architecture-overview)
2. [Django Project Structure](#django-project-structure)
3. [Core Database Models](#core-database-models)
4. [REST API Endpoints](#rest-api-endpoints)
5. [Code Generation System](#code-generation-system)
6. [Project Types & Templates](#project-types--templates)
7. [Authentication & Security](#authentication--security)
8. [Configuration Files](#configuration-files)
9. [Database Fixtures & Test Data](#database-fixtures--test-data)

---

## Project Architecture Overview

Bashville is a Django REST API backend for a full-stack website builder/CRUD generator. It manages user projects, commands (bash scripts), and color palettes for generating deployable web applications.

### Key Features
- **4 Project Types**: Static React + Tailwind/CSS, Full-Stack React + Django + Tailwind/CSS
- **Color Palette System**: Advanced styling with component overrides and preferences
- **Command Management**: Reusable bash script snippets for project setup
- **Code Generation**: Template-based generation of complete project structures
- **User Isolation**: All data strictly filtered by authenticated user

---

## Django Project Structure

```
bashville-api/
├── bashvilleproject/          # Django project configuration
│   ├── __init__.py
│   ├── settings.py           # Main settings (CORS, REST framework, SQLite)
│   ├── urls.py              # Root URL patterns with DRF router
│   ├── wsgi.py
│   └── asgi.py
├── bashvilleapi/             # Main Django app
│   ├── models/              # Domain models (split by entity)
│   │   ├── __init__.py      # Imports all models
│   │   ├── project.py       # Project model with M2M commands
│   │   ├── command.py       # Bash script commands
│   │   ├── color_palette.py # UI color schemes with advanced styling
│   │   └── project_command.py # M2M through table
│   ├── views/               # DRF ViewSets (split by domain)
│   │   ├── __init__.py      # Exports all ViewSets
│   │   ├── project.py       # ProjectViewSet with user filtering
│   │   ├── command.py       # CommandViewSet
│   │   ├── color_palette.py # ColorPaletteViewSet
│   │   ├── auth.py          # Custom Login/Register views
│   │   └── codegen.py       # Code generation endpoint
│   ├── serializers/         # DRF serializers with security patterns
│   │   ├── __init__.py
│   │   ├── project.py       # Complex serializer with dual fields
│   │   ├── command.py
│   │   └── color_palette.py # Advanced styling validation
│   ├── codegen/             # Code generation templates
│   │   └── templates/
│   │       ├── react/       # React frontend templates
│   │       ├── django/      # Django backend templates
│   │       └── layouts/     # Complete project layouts
│   │           ├── react-tailwind/
│   │           ├── react-css/
│   │           └── fullstack-setup.sh.j2
│   ├── fixtures/            # Test data (load in order)
│   │   ├── color_palettes.json
│   │   ├── commands.json
│   │   ├── projects.json
│   │   └── project_commands.json
│   ├── management/          # Custom Django commands
│   │   └── commands/
│   │       └── create_test_user.py
│   ├── migrations/          # Auto-generated (delete to reset)
│   ├── admin.py            # Django admin registration
│   ├── apps.py
│   └── tests.py
└── manage.py               # Django management script
```

---

## Core Database Models

### 1. User Model
**Source:** Django's built-in `django.contrib.auth.models.User`  
**Relationships:** One-to-many with Project, Command, ColorPalette

### 2. Project Model
**File:** `bashvilleapi/models/project.py`

```python
class Project(models.Model):
    PROJECT_TYPES = [
        ("static-tailwind", "Static React + Tailwind"),
        ("static-css", "Static React + Custom CSS"),
        ("fullstack-tailwind", "Full-Stack (React + Django) + Tailwind"),
        ("fullstack-css", "Full-Stack (React + Django) + Custom CSS"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default="static-tailwind")
    color_palette = models.ForeignKey("ColorPalette", on_delete=models.SET_NULL, null=True, blank=True)
    commands = models.ManyToManyField("Command", through="ProjectCommand", blank=True)
    backend_config = models.JSONField(default=dict, blank=True)  # Stores models, options
    created_at = models.DateTimeField(auto_now_add=True)
```

**Key Fields:**
- `project_type`: Determines template generation strategy
- `backend_config`: JSON field storing database models and generation options
- `color_palette`: Optional FK to ColorPalette for styling
- `commands`: M2M relationship to reusable bash commands

### 3. ColorPalette Model
**File:** `bashvilleapi/models/color_palette.py`

```python
class ColorPalette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    primary_hex = models.CharField(max_length=7)      # Main brand color
    secondary_hex = models.CharField(max_length=7)    # Secondary brand color
    accent_hex = models.CharField(max_length=7)       # Call-to-action color
    background_hex = models.CharField(max_length=7)   # Page background
    ui_hex = models.CharField(max_length=7, default="#ffffff")  # Navbar/cards

    # Advanced styling preferences - JSON field for flexibility
    style_preferences = models.JSONField(default=dict)
```

**Advanced Style Preferences Structure:**
```python
{
    # Hero section styling
    "hero_style": "gradient",  # "gradient" or "solid"
    "hero_gradient_direction": "135deg",
    "hero_custom_bg": None,
    
    # Component-specific color overrides
    "component_overrides": {
        "hero_buttons": {"primary": "#custom", "secondary": "#custom"},
        "navbar": {"background": "#custom", "text": "#custom"},
        "cards": {"background": "#custom", "border": "#custom"},
        "footer": {"background": "#custom", "text": "#custom"}
    },
    
    # Layout and styling
    "layout_style": "modern",  # "modern", "classic", "minimal"
    "border_radius": "medium",  # "none", "small", "medium", "large", "full"
    "shadows": True,
    "animations": True,
    
    # Developer options
    "css_framework": "tailwind",  # "tailwind", "css", "scss"
    "semantic_colors": True,
    "accessibility_mode": "auto"  # "strict", "auto", "relaxed"
}
```

### 4. Command Model
**File:** `bashvilleapi/models/command.py`

```python
class Command(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commands")
    label = models.CharField(max_length=100)          # Human-readable name
    command_text = models.TextField()                 # Bash command content
    order_index = models.IntegerField(default=0)      # Execution order
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["order_index", "label"]
        unique_together = ("user", "label")
```

### 5. ProjectCommand Model (Through Table)
**File:** `bashvilleapi/models/project_command.py`

```python
class ProjectCommand(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    command = models.ForeignKey(Command, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("project", "command")
```

---

## REST API Endpoints

### Base Configuration
- **Authentication:** Token-based (`rest_framework.authtoken`)
- **Permissions:** `IsAuthenticated` required for all endpoints
- **CORS:** Configured for localhost:3000, localhost:5173
- **Router:** DefaultRouter with `trailing_slash=False`

### Endpoint Structure

#### 1. Authentication Endpoints
```
POST /auth/login/     # Custom login returning user + token
POST /auth/register/  # Custom registration returning user + token
```

#### 2. Core Resource Endpoints
```
GET|POST /projects/              # List/Create projects (user-filtered)
GET|PUT|PATCH|DELETE /projects/{id}/  # CRUD operations on specific project

GET|POST /commands/              # List/Create commands (user-filtered)
GET|PUT|PATCH|DELETE /commands/{id}/  # CRUD operations on specific command

GET|POST /colorpalettes/         # List/Create color palettes (user-filtered)
GET|PUT|PATCH|DELETE /colorpalettes/{id}/  # CRUD operations on specific palette
```

#### 3. Code Generation Endpoint
```
POST /codegen/generate  # Generate complete project files
```

### ProjectSerializer Details

**Write-Only Fields:**
- `command_ids`: List of command IDs to associate with project

**Read-Only Fields:**
- `color_palette_preview`: Full palette object with hex colors
- `commands_preview`: Array of associated commands with details

**Backend Config Validation:**
```python
{
    "models": [
        {
            "name": "BlogPost",
            "fields": [
                {"name": "title", "type": "CharField", "max_length": 200},
                {"name": "content", "type": "TextField"},
                {"name": "author", "type": "ForeignKey", "to": "User", "on_delete": "CASCADE"}
            ]
        }
    ],
    "options": {
        "timestamps": True  # Auto-add created_at/updated_at
    }
}
```

### ColorPaletteSerializer Details

**Validation Features:**
- Hex color validation for all color fields
- Style preferences structure validation
- Component override validation with proper color format checking
- Enum validation for layout options

**Response Enhancement:**
- Includes `computed_style_preferences` with defaults merged

---

## Code Generation System

### Core Logic
**File:** `bashvilleapi/views/codegen.py`

The code generation system supports 4 distinct project types:

1. **static-tailwind**: React + Vite + Tailwind CSS
2. **static-css**: React + Vite + Custom CSS
3. **fullstack-tailwind**: React frontend + Django backend + Tailwind
4. **fullstack-css**: React frontend + Django backend + Custom CSS

### Template Structure

#### Frontend Templates (`layouts/react-tailwind/` and `layouts/react-css/`)
```
src/
├── App.jsx.j2              # Main App component with routing
├── main.jsx.j2             # React entry point
├── index.css.j2            # Global styles (Tailwind or custom)
├── components/
│   ├── Navigation.jsx.j2   # Navigation bar component
│   ├── Footer.jsx.j2       # Footer component
│   └── UI.jsx.j2          # Reusable UI components
├── pages/
│   ├── Home.jsx.j2         # Home page
│   ├── About.jsx.j2        # About page
│   └── Contact.jsx.j2      # Contact page
├── index.html.j2           # HTML template
├── vite.config.js.j2       # Vite configuration
├── package.json.j2         # NPM dependencies
├── postcss.config.js.j2    # PostCSS configuration
└── tailwind.config.js.j2   # Tailwind config (tailwind projects only)
```

#### Backend Templates (`templates/django/`)
```
models.py.j2                # Generated Django models
serializers.py.j2           # DRF serializers
viewsets.py.j2              # DRF ViewSets
urls.py.j2                  # URL routing
apps.py.j2                  # App configuration
admin.py.j2                 # Django admin
settings.py.j2              # Django settings
project_urls.py.j2          # Project-level URLs
templates/base.html.j2      # Base HTML template
```

### Template Context

All templates receive a comprehensive context object:

```python
{
    "project": project_instance,
    "project_title": "My Project",
    "project_name": "myproject",  # Slugified
    "project_type": "fullstack-tailwind",
    "app_label": "generated_app",
    "models": [/* backend_config.models */],
    "timestamps": True,
    "color_palette": {
        "id": 1,
        "name": "Ocean Theme",
        "primary_hex": "#3b82f6",
        "secondary_hex": "#1e40af",
        "accent_hex": "#06b6d4",
        "background_hex": "#f8fafc",
        "ui_hex": "#ffffff"
    },
    "palette": {  # Compatibility alias
        "primary": "#3b82f6",
        "secondary": "#1e40af",
        "accent": "#06b6d4",
        "background": "#f8fafc",
        "ui": "#ffffff"
    },
    "backend_config": {/* full config */},
    "generation_date": "2025-09-18"
}
```

### Generated File Structure

#### Static Projects
```
project-name/
├── src/                    # React source
├── index.html             # Entry HTML
├── package.json           # Dependencies
├── vite.config.js         # Build configuration
├── tailwind.config.js     # Tailwind (if applicable)
├── postcss.config.js      # CSS processing
└── setup.sh              # Installation script
```

#### Full-Stack Projects
```
project-name/
├── frontend/              # React application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── projectnamebackend/    # Django project
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── generated_app/         # Django app
│   ├── models.py          # User-defined models
│   ├── serializers.py     # DRF serializers
│   ├── viewsets.py        # API endpoints
│   ├── urls.py            # App URLs
│   └── admin.py           # Admin interface
├── templates/             # Django templates
├── manage.py              # Django management
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── setup.sh              # Full setup script
```

---

## Project Types & Templates

### 1. Static React + Tailwind (`static-tailwind`)

**Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "tailwindcss": "^3.2.0",
  "autoprefixer": "^10.4.13",
  "postcss": "^8.4.21",
  "vite": "^4.1.0"
}
```

**Key Features:**
- Vite build system
- Tailwind CSS utility classes
- Responsive design patterns
- Color palette integration via CSS custom properties

### 2. Static React + CSS (`static-css`)

**Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "vite": "^4.1.0"
}
```

**Key Features:**
- Custom CSS modules
- CSS custom properties for theming
- Responsive grid layouts
- Component-scoped styling

### 3. Full-Stack React + Django + Tailwind (`fullstack-tailwind`)

**Frontend:** Same as static-tailwind  
**Backend:**
```
django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
python-decouple>=3.8
```

**Integration Features:**
- CORS configured for frontend communication
- Token authentication
- RESTful API endpoints for generated models
- Automated admin interface

### 4. Full-Stack React + Django + CSS (`fullstack-css`)

**Frontend:** Same as static-css  
**Backend:** Same as fullstack-tailwind

**Styling Approach:**
- CSS custom properties for consistent theming
- Component-based CSS organization
- Responsive design without utility framework

---

## Authentication & Security

### Token Authentication
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

### User Isolation Pattern
**Critical Security Feature:** Every endpoint filters data by `request.user`

```python
# All ViewSets follow this pattern
def get_queryset(self):
    return ModelName.objects.filter(user=self.request.user)
```

### Custom Auth Views
**File:** `bashvilleapi/views/auth.py`

Both login and registration return:
```json
{
    "token": "generated_token_string",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "",
        "last_name": ""
    }
}
```

### CORS Configuration
```python
CORS_ORIGIN_WHITELIST = (
    "http://localhost:3000",    # React development
    "http://127.0.0.1:3000",
    "http://localhost:5173",    # Vite development
    "http://127.0.0.1:5173",
)
```

---

## Configuration Files

### Django Settings (`bashvilleproject/settings.py`)

**Key Configurations:**
```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "bashvilleapi",
    "generated_app.apps.GeneratedAppConfig",  # Auto-generated apps
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

### URL Configuration (`bashvilleproject/urls.py`)

```python
router = routers.DefaultRouter(trailing_slash=False)
router.register(r"colorpalettes", ColorPaletteViewSet, basename="colorpalette")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"commands", CommandViewSet, basename="command")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
    path("auth/login/", LoginView.as_view(), name="api_login"),
    path("auth/register/", RegisterView.as_view(), name="api_register"),
    path("codegen/generate", CodegenGenerateView.as_view(), name="codegen_generate"),
    path("api/generated/", include("generated_app.urls")),  # Generated model APIs
]
```

---

## Database Fixtures & Test Data

### Loading Order
1. `color_palettes.json` - Base color schemes
2. `commands.json` - Common bash commands
3. `projects.json` - Sample projects
4. `project_commands.json` - Project-command associations

### Sample Data Structure

#### Color Palettes
```json
[
    {
        "model": "bashvilleapi.colorpalette",
        "pk": 1,
        "fields": {
            "user": 1,
            "name": "Ocean Blue",
            "primary_hex": "#3b82f6",
            "secondary_hex": "#1e40af",
            "accent_hex": "#06b6d4",
            "background_hex": "#f8fafc",
            "ui_hex": "#ffffff",
            "style_preferences": {
                "hero_style": "gradient",
                "border_radius": "medium",
                "shadows": true,
                "animations": true
            }
        }
    }
]
```

#### Commands
```json
[
    {
        "model": "bashvilleapi.command",
        "pk": 1,
        "fields": {
            "user": 1,
            "label": "Install Dependencies",
            "command_text": "npm install",
            "order_index": 1
        }
    }
]
```

#### Projects
```json
[
    {
        "model": "bashvilleapi.project",
        "pk": 1,
        "fields": {
            "user": 1,
            "title": "My Portfolio Site",
            "description": "Personal portfolio with blog",
            "project_type": "fullstack-tailwind",
            "color_palette": 1,
            "backend_config": {
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
                "options": {"timestamps": true}
            }
        }
    }
]
```

### Test User Creation
**Management Command:** `bashvilleapi/management/commands/create_test_user.py`

Creates default user: `testuser` / `testpass123`

---

## Key Integration Points for Client-Side LLM

### 1. Project Creation Workflow
1. User creates/selects ColorPalette with style preferences
2. User creates/selects Commands for setup steps
3. User creates Project with:
   - `project_type` (determines template selection)
   - `backend_config` (for full-stack projects)
   - `color_palette` reference
   - `command_ids` for setup automation

### 2. Code Generation Flow
1. POST to `/codegen/generate` with `project_id`
2. Backend renders templates with project context
3. Returns complete file structure as JSON
4. Client downloads/displays generated code

### 3. Color System Integration
- ColorPalette provides base colors + advanced styling
- Templates use CSS custom properties for theming
- Component overrides allow fine-grained control
- Style preferences affect layout/animations

### 4. Backend Config Schema
For full-stack projects, `backend_config` defines Django models:
```python
{
    "models": [
        {
            "name": "ModelName",
            "fields": [
                {"name": "field_name", "type": "FieldType", "options": "value"}
            ]
        }
    ],
    "options": {"timestamps": True}
}
```

**Supported Field Types:**
- `CharField`, `TextField`, `IntegerField`, `FloatField`, `BooleanField`
- `DateField`, `DateTimeField`, `EmailField`
- `ForeignKey`, `ManyToManyField`, `OneToOneField`

---

## Summary

This backend provides a complete foundation for a website builder platform with:

- **Flexible Project Types**: 4 distinct templates covering static and full-stack scenarios
- **Advanced Styling**: Color palettes with component overrides and layout preferences  
- **Code Generation**: Template-based generation of complete project structures
- **User Security**: Strict user isolation across all data and endpoints
- **Extensible Design**: JSON fields for flexible configuration and future enhancements

The system is designed to scale and adapt to new project types and styling options while maintaining data integrity and user security.

---

**Documentation Complete - Ready for Client-Side LLM Integration**