# Notes Feature Implementation Guide for Django Backend

## 🎯 Project Overview

This document provides comprehensive implementation guidance for adding a **Notes** feature to the Bash Stash project. The feature allows developers to capture, organize, and manage project notes with smart auto-categorization and powerful search capabilities.

## 📋 Feature Requirements Summary

### Core User Stories
1. **Quick Jot**: One-click "New Note" button for instant text capture (no modal popups)
2. **Smart Categories**: Auto-detect bugs, todos, wishlist items, code snippets, questions, and reminders
3. **Project Context**: Associate notes with specific projects for organized development workflows
4. **Pin/Favorite**: Star important notes to keep them at the top of lists
5. **Advanced Search**: Real-time filtering by text, tags, categories, and projects
6. **Code Snippets**: Automatic code detection with monospace formatting
7. **Auto-timestamps**: Created/updated dates for all notes

### Advanced Features
- **Bulk Operations**: Delete, pin, categorize multiple notes
- **Custom Tags**: User-defined tags for additional organization
- **Statistics Dashboard**: Analytics on note usage and patterns
- **Cross-project Integration**: Note counts in project views

## 🏗️ Database Schema Changes

### New Model: `Note`

```python
class Note(models.Model):
    # Core fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    title = models.CharField(max_length=200, blank=True)  # Auto-generated if empty
    content = models.TextField()  # Main note content
    
    # Organization fields
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='note')
    custom_tags = models.JSONField(default=list, blank=True)
    
    # Status fields
    is_pinned = models.BooleanField(default=False)
    is_code_snippet = models.BooleanField(default=False)  # Auto-detected
    is_completed = models.BooleanField(default=False)  # For todos
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    search_vector = models.TextField(blank=True)  # For full-text search
    
    # Optimized indexes for performance
    class Meta:
        ordering = ['-is_pinned', '-updated_at']
        indexes = [
            models.Index(fields=['user', 'project']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'is_pinned']),
            models.Index(fields=['created_at']),
        ]
```

### Category Choices
```python
CATEGORY_CHOICES = [
    ('note', 'General Note'),
    ('bug', 'Bug Report'),
    ('todo', 'Task/Todo'),
    ('wishlist', 'Feature Idea'),
    ('code', 'Code Snippet'),
    ('reminder', 'Reminder'),
    ('question', 'Question'),
]
```

## 🧠 Smart Auto-Categorization Logic

The system analyzes note content to automatically assign categories:

### Bug Detection
- Keywords: 'bug', 'error', 'broken', 'fix', 'issue', 'problem', 'crash', 'exception', 'traceback', 'failed', 'failing'

### Todo Detection
- Patterns: `[ ]`, `- [ ]`, 'todo', 'task', 'remember to', 'need to', 'should do'

### Wishlist Detection
- Keywords: 'idea', 'feature', 'maybe', 'could', 'should add', 'nice to have', 'enhancement', 'improvement', 'wish'

### Code Detection
- Patterns: Code blocks (```), function definitions, import statements, variable declarations
- High ratio of special characters: `{}()[];=<>.,`

### Question Detection
- Indicators: '?', 'how to', 'why does', 'what is', 'where can', 'question', 'confused', 'understand', 'explain'

### Reminder Detection
- Keywords: 'reminder', 'remember', "don't forget", 'note to self', 'important', 'deadline', 'meeting', 'call'

## 📁 File Structure Implementation

### 1. Model Implementation
**File**: `bashvilleapi/models/note.py`

**Key Methods**:
- `auto_generate_title()`: Creates smart titles from content
- `auto_detect_category()`: Analyzes content for category assignment
- `detect_code_content()`: Identifies code snippets
- `update_search_vector()`: Builds searchable text index
- `toggle_pin()`, `toggle_completion()`: Quick actions
- `add_tag()`, `remove_tag()`: Tag management
- `search()`: Class method for advanced searching

**Update**: `bashvilleapi/models/__init__.py`
```python
from .note import Note
```

### 2. Serializer Implementation
**File**: `bashvilleapi/serializers/note.py`

**Multiple Serializers**:
- `NoteSerializer`: Full CRUD with validation and computed fields
- `NoteListSerializer`: Lightweight for list views
- `QuickNoteSerializer`: Ultra-fast creation
- `NoteStatsSerializer`: Analytics and statistics

**Key Features**:
- Smart validation for content, tags, and relationships
- Auto-categorization on create/update
- Enhanced representation with previews and stats
- Cross-field validation and user context handling

**Update**: `bashvilleapi/serializers/__init__.py`
```python
from .note import NoteSerializer, NoteListSerializer, NoteStatsSerializer, QuickNoteSerializer
```

### 3. ViewSet Implementation
**File**: `bashvilleapi/views/note.py`

**Comprehensive ViewSet Features**:
- Full CRUD operations with enhanced feedback
- Advanced search with special syntax (`project:api`, `tag:bug`, `category:todo`)
- Smart filtering by category, project, pinned status, tags, date ranges
- Quick actions: toggle pin, completion, add/remove tags
- Bulk operations: delete, pin, categorize multiple notes
- Statistics endpoint with comprehensive analytics
- Project-specific note filtering

**Custom Actions**:
- `@action(detail=False, methods=['post']) quick_create`
- `@action(detail=False, methods=['get']) search`
- `@action(detail=False, methods=['get']) stats`
- `@action(detail=True, methods=['post']) toggle_pin`
- `@action(detail=True, methods=['post']) toggle_completion`
- `@action(detail=True, methods=['post']) add_tag`
- `@action(detail=True, methods=['post']) remove_tag`
- `@action(detail=False, methods=['post']) bulk_actions`
- `@action(detail=False, methods=['get']) recent`
- `@action(detail=False, methods=['get']) by_project`

**Update**: `bashvilleapi/views/__init__.py`
```python
from .note import NoteViewSet
```

### 4. URL Configuration
**File**: `bashvilleproject/urls.py`

**Add to imports**:
```python
from bashvilleapi.views import (
    # ... existing imports
    NoteViewSet,
)
```

**Add to router**:
```python
router.register(r"notes", NoteViewSet, basename="note")
```

### 5. Cross-Model Integration
**File**: `bashvilleapi/models/project.py`

**Add Properties**:
```python
@property
def note_count(self):
    return self.notes.count()

@property
def recent_notes_count(self):
    from django.utils import timezone
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    return self.notes.filter(created_at__gte=week_ago).count()

@property
def pending_todos_count(self):
    return self.notes.filter(
        category__in=['todo', 'reminder'], 
        is_completed=False
    ).count()

def get_recent_notes(self, limit=5):
    return self.notes.order_by('-created_at')[:limit]
```

**File**: `bashvilleapi/serializers/project.py`

**Add Fields**:
```python
# Note-related fields
note_count = serializers.IntegerField(source='note_count', read_only=True)
recent_notes_count = serializers.IntegerField(source='recent_notes_count', read_only=True)
pending_todos_count = serializers.IntegerField(source='pending_todos_count', read_only=True)
notes_preview = serializers.SerializerMethodField(read_only=True)

# Add to Meta.fields:
"note_count",
"recent_notes_count", 
"pending_todos_count",
"notes_preview",

# Add method:
def get_notes_preview(self, obj):
    recent_notes = obj.get_recent_notes(limit=3)
    return [
        {
            "id": note.id,
            "title": note.title or note.auto_generate_title(),
            "category": note.category,
            "is_pinned": note.is_pinned,
            "is_completed": note.is_completed,
            "created_at": note.created_at,
        }
        for note in recent_notes
    ]
```

## 🚀 API Endpoints

### Core CRUD
- `GET /api/notes/` - List notes with filtering
- `POST /api/notes/` - Create new note
- `GET /api/notes/{id}/` - Get specific note
- `PUT /api/notes/{id}/` - Update note
- `DELETE /api/notes/{id}/` - Delete note

### Smart Features
- `POST /api/notes/quick_create/` - Ultra-fast note creation
- `GET /api/notes/search/?q=bug` - Advanced search
- `GET /api/notes/stats/` - Analytics dashboard
- `GET /api/notes/recent/` - Recent notes (7 days)

### Note Actions
- `POST /api/notes/{id}/toggle_pin/` - Pin/unpin note
- `POST /api/notes/{id}/toggle_completion/` - Mark todo complete
- `POST /api/notes/{id}/add_tag/` - Add custom tag
- `POST /api/notes/{id}/remove_tag/` - Remove tag

### Bulk Operations
- `POST /api/notes/bulk_actions/` - Bulk delete, pin, categorize

### Project Integration
- `GET /api/notes/by_project/?project_id=1` - Notes for specific project

## 🔍 Advanced Search Syntax

Users can use special syntax for powerful searches:

```bash
GET /api/notes/search/?q=project:api bug         # Bugs in API project
GET /api/notes/search/?q=tag:urgent             # Notes tagged "urgent"
GET /api/notes/search/?q=category:todo jwt      # Todo notes about JWT
GET /api/notes/search/?q=project:frontend tag:css # CSS notes in frontend project
```

## 📊 Filtering Options

```bash
GET /api/notes/?category=bug                     # Only bug notes
GET /api/notes/?project=1                        # Notes for project 1
GET /api/notes/?pinned=true                      # Only pinned notes
GET /api/notes/?completed=false                  # Uncompleted todos
GET /api/notes/?tags=urgent,frontend             # Multiple tags
GET /api/notes/?since=7                          # Last 7 days
GET /api/notes/?code=true                        # Only code snippets
```

## 🗄️ Migration Steps

1. **Generate Migration**:
   ```bash
   python manage.py makemigrations bashvilleapi
   ```

2. **Review Migration**:
   ```bash
   python manage.py showmigrations
   ```

3. **Apply Migration**:
   ```bash
   python manage.py migrate
   ```

## ⚠️ Known Issues & Troubleshooting

### Import Linting Issues
The template files may show linting errors for Django imports. These are expected since the files are templates. In your Django project, ensure:

1. **Django is properly installed**: `pip install django djangorestframework`
2. **Apps are registered** in `INSTALLED_APPS`:
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'rest_framework',
       'bashvilleapi',
   ]
   ```

3. **Check Python path**: Ensure your Django project structure is correct

### Common Import Fixes
If you see import errors, verify these imports work in your Django environment:
```python
from django.db import models
from django.contrib.auth.models import User
from rest_framework import viewsets, serializers
```

### Performance Considerations
- **Database indexes** are included for optimal query performance
- **Select_related/prefetch_related** used in viewsets for efficiency
- **Search results limited** to 50 items for performance
- **Bulk operations** implemented for large-scale changes

## 🎯 Testing Endpoints

After implementation, test with:

```bash
# Create a note
curl -X POST http://localhost:8000/api/notes/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Fix the login bug in authentication module"}'

# Quick create
curl -X POST http://localhost:8000/api/notes/quick_create/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "TODO: Add unit tests for user registration"}'

# Search
curl "http://localhost:8000/api/notes/search/?q=bug" \
  -H "Authorization: Token YOUR_TOKEN"

# Get statistics
curl "http://localhost:8000/api/notes/stats/" \
  -H "Authorization: Token YOUR_TOKEN"
```

## 📈 Expected Auto-Categorization Results

Test the smart categorization:

```bash
"Fixed the login bug" → category: "bug"
"TODO: Add user authentication" → category: "todo"
"Maybe we should add dark mode" → category: "wishlist"
"function getUserData() { return user; }" → category: "code"
"How does JWT authentication work?" → category: "question"
"Meeting with client tomorrow" → category: "reminder"
```

## 🔧 Integration with Frontend

Once backend is implemented, the frontend Notes tab will connect to these endpoints for:

1. **Lightning-fast note creation** with auto-categorization feedback
2. **Real-time search** with advanced filtering
3. **Project-aware note management** 
4. **Rich analytics dashboard**
5. **Seamless bulk operations**

This implementation provides a comprehensive, developer-focused note-taking system that integrates seamlessly with the existing Bash Stash architecture.