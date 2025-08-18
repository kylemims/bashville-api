# Bashville API - AI Agent Instructions

## Project Overview
**Bashville** is a Django REST API backend for a full-stack website builder/CRUD generator. It manages user projects, commands (bash scripts), and color palettes for generating deployable web applications.

## Project Structure
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
│   │   ├── color_palette.py # UI color schemes
│   │   └── project_command.py # M2M through table
│   ├── views/               # DRF ViewSets (split by domain)
│   │   ├── __init__.py      # Exports all ViewSets
│   │   ├── project.py       # ProjectViewSet with user filtering
│   │   ├── command.py       # CommandViewSet
│   │   ├── color_palette.py # ColorPaletteViewSet
│   │   └── auth.py          # Custom Login/Register views
│   ├── serializers/         # DRF serializers with security patterns
│   │   ├── __init__.py
│   │   ├── project.py       # Complex serializer with dual fields
│   │   ├── command.py
│   │   └── color_palette.py
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
├── .github/                 # GitHub configuration
│   └── copilot-instructions.md
├── seed_database.sh         # Complete DB reset script
├── debug_auth.py           # User/project relationship analysis
├── test_auth.py            # Authentication endpoint testing
├── bashvilleERD.dbml       # Database schema documentation
├── Pipfile                 # Python dependencies (pipenv)
├── manage.py               # Django management script
└── db.sqlite3              # SQLite database (auto-generated)
```

## Architecture & Data Flow

### Core Models Relationships
- **User** → owns multiple Projects, Commands, ColorPalettes
- **Project** → belongs to User, optionally has ColorPalette, linked to multiple Commands via ProjectCommand junction table
- **Command** → bash script snippets owned by User, reusable across Projects
- **ProjectCommand** → M2M through table linking Projects and Commands

### Key Pattern: User Isolation
**CRITICAL**: Every model filters by `user=request.user` in ViewSets. Never create endpoints that expose cross-user data.

```python
# Always use this pattern in ViewSets
def get_queryset(self):
    return ModelName.objects.filter(user=self.request.user)
```

## Authentication & Security

### Token-Based Auth
- Uses Django REST Framework Token Authentication
- Custom `LoginView` and `RegisterView` in `bashvilleapi/views/auth.py` return user details + token
- **Never hardcode tokens in environment variables** - tokens are user-specific, not system-wide

### Serializer Security Pattern
```python
def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    req = self.context.get("request")
    if req and req.user and req.user.is_authenticated:
        self.fields["related_field"].queryset = RelatedModel.objects.filter(user=req.user)
```

## Development Workflows

### Database Management
```bash
# Complete reset with test data
./seed_database.sh

# Manual migration workflow
python manage.py makemigrations bashvilleapi
python manage.py migrate
```

### Environment Setup
```bash
# Use pipenv for dependency management
pipenv install
pipenv shell

# Run server
python manage.py runserver
```

### Debugging Tools
- `debug_auth.py` - Script to analyze user/project relationships
- `test_auth.py` - Authentication endpoint testing
- Built-in fixtures in `bashvilleapi/fixtures/` for consistent test data

## Serializer Patterns

### Dual Field Pattern (Write vs Read)
```python
# ProjectSerializer example
command_ids = serializers.ListField(write_only=True)  # Accept IDs for updates
commands_preview = serializers.SerializerMethodField(read_only=True)  # Return full objects
```

### Partial Update Support
```python
# Required for PUT requests with partial data
extra_kwargs = {
    "title": {"required": False},
    "description": {"required": False},
}
```

## API Conventions

### URL Patterns
- No trailing slashes: `trailing_slash=False` in DefaultRouter
- RESTful endpoints: `/projects/`, `/commands/`, `/colorpalettes/`
- Custom auth: `/auth/login/`, `/auth/register/`

### CORS Configuration
Configured for React development servers on ports 3000 and 5173.

## File Organization

### Models
- Split into separate files in `bashvilleapi/models/`
- Imported via `__init__.py` for clean imports

### Views
- ViewSets in separate files by domain
- Custom APIViews for auth in `views/auth.py`

### Serializers
- One file per model with complex validation logic
- Security validation in `validate_*` methods

## Testing & Data

### Fixtures Strategy
Load in order: `color_palettes` → `commands` → `projects` → `project_commands`

### Test User
Default: `testuser` / `testpass123` (created by management command)

## Frontend Integration Notes
- Designed for React frontend on localhost:3000
- Returns user details + token on login/register for proper state management
- All responses include user-specific data only

## Key Commands
```bash
# Complete environment setup
pipenv install && pipenv shell

# Reset database with test data
./seed_database.sh

# Debug user relationships
python debug_auth.py

# Check Django configuration
python manage.py check
```
