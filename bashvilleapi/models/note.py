import re
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from .project import Project


class Note(models.Model):
    """
    Developer notes with smart categorization and project context.

    Features:
    - Auto-categorization based on content analysis
    - Project linking for context-aware organization
    - Pin functionality for important notes
    - Code snippet detection and formatting
    - Full-text search capabilities
    """

    # Category choices with smart auto-detection
    CATEGORY_CHOICES = [
        ("note", "General Note"),
        ("bug", "Bug Report"),
        ("todo", "Task/Todo"),
        ("wishlist", "Feature Idea"),
        ("code", "Code Snippet"),
        ("reminder", "Reminder"),
        ("question", "Question"),
    ]

    # Core fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
        help_text="Optional project association for context",
    )

    # Content fields
    title = models.CharField(
        max_length=200, blank=True, help_text="Auto-generated from content if empty"
    )
    content = models.TextField(help_text="The main note content")

    # Organization fields
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="note",
        help_text="Auto-detected based on content, can be manually overridden",
    )
    custom_tags = models.JSONField(
        default=list,
        blank=True,
        help_text="User-defined tags for additional organization",
    )
    priority_level = models.CharField(
        max_length=10,
        choices=[
            ("low", "Low Priority"),
            ("medium", "Medium Priority"),
            ("high", "High Priority"),
        ],
        default="medium",
        help_text="Priority level for organization and visual indicators",
    )

    # Status fields
    is_pinned = models.BooleanField(
        default=False, help_text="Pinned notes appear at the top of lists"
    )
    is_code_snippet = models.BooleanField(
        default=False, help_text="Auto-detected or manually marked as code"
    )
    is_completed = models.BooleanField(
        default=False, help_text="For todo-type notes, mark as completed"
    )
    order = models.PositiveIntegerField(
        default=0, help_text="Order for drag and drop sorting within category"
    )
    is_important = models.BooleanField(
        default=False, help_text="Mark note as important"
    )
    is_archived = models.BooleanField(default=False, help_text="Archive note")
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Search optimization
    search_vector = models.TextField(
        blank=True, help_text="Computed search field for full-text search"
    )

    class Meta:
        ordering = ["-is_pinned", "order", "-updated_at"]
        indexes = [
            models.Index(fields=["user", "project"]),
            models.Index(fields=["user", "category"]),
            models.Index(fields=["user", "is_pinned"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["user", "order"]),
        ]

    def __str__(self):
        title = self.title or self.auto_generate_title()
        project_title = f" ({self.project.title})" if self.project else ""
        return f"{title}{project_title}"

    def save(self, *args, **kwargs):
        """Enhanced save with auto-categorization and title generation."""
        # Auto-generate title if empty
        if not self.title:
            self.title = self.auto_generate_title()

        # Auto-detect category if still default
        if self.category == "note":
            self.category = self.auto_detect_category()

        # Auto-detect code snippets
        if not self.is_code_snippet:
            self.is_code_snippet = self.detect_code_content()

        # Update search vector
        self.update_search_vector()

        super().save(*args, **kwargs)

    def auto_generate_title(self):
        """Generate a smart title from content."""
        if not self.content:
            return "Empty Note"

        # Take first line or first sentence, limit to 50 chars
        first_line = self.content.split("\n")[0].strip()
        if not first_line:
            first_line = self.content.strip()

        # Remove markdown and code formatting
        clean_line = re.sub(r"[`*#\-\[\]]+", "", first_line)
        clean_line = clean_line.strip()

        if len(clean_line) > 50:
            return clean_line[:47] + "..."

        return clean_line or "Note"

    def auto_detect_category(self):
        """Smart category detection based on content analysis."""
        if not self.content:
            return "note"

        content_lower = self.content.lower()

        # Bug detection
        bug_keywords = [
            "bug",
            "error",
            "broken",
            "fix",
            "issue",
            "problem",
            "crash",
            "exception",
            "traceback",
            "failed",
            "failing",
        ]
        if any(keyword in content_lower for keyword in bug_keywords):
            return "bug"

        # Task and todo detection
        todo_patterns = [
            r"\[ \]",  # Markdown checkbox
            r"- \[ \]",  # List checkbox
            r"\btodo\b",
            r"\btask\b",
            r"\bremember to\b",
            r"\bneed to\b",
            r"\bshould\b.*\bdo\b",
        ]
        if any(re.search(pattern, content_lower) for pattern in todo_patterns):
            return "todo"

        # Wishlist/Feature detection
        wishlist_keywords = [
            "idea",
            "feature",
            "maybe",
            "could",
            "should add",
            "nice to have",
            "enhancement",
            "improvement",
            "wish",
        ]
        if any(keyword in content_lower for keyword in wishlist_keywords):
            return "wishlist"

        # Question detection
        question_indicators = [
            "?",
            "how to",
            "why does",
            "what is",
            "where can",
            "question",
            "confused",
            "understand",
            "explain",
        ]
        if any(indicator in content_lower for indicator in question_indicators):
            return "question"

        # Reminder detection
        reminder_keywords = [
            "reminder",
            "remember",
            "don't forget",
            "note to self",
            "important",
            "deadline",
            "meeting",
            "call",
        ]
        if any(keyword in content_lower for keyword in reminder_keywords):
            return "reminder"

        # Code detection (if not already detected by is_code_snippet)
        if self.detect_code_content():
            return "code"

        return "note"

    def detect_code_content(self):
        """Detect if content contains code snippets."""
        if not self.content or not isinstance(self.content, str):
            return False

        content = self.content.lower()

        # Code block markers
        if "```" in str(self.content) or "`" in str(self.content):
            return True

        # Common code patterns
        code_patterns = [
            r"\bfunction\s*\(",
            r"\bconst\s+\w+\s*=",
            r"\blet\s+\w+\s*=",
            r"\bvar\s+\w+\s*=",
            r"\bimport\s+",
            r"\bfrom\s+\w+\s+import",
            r"\bdef\s+\w+\s*\(",
            r"\bclass\s+\w+",
            r"^\s*#\s*\w+",  # Comments
            r"{\s*\n.*:\s*.*\n.*}",  # Object literals
            r"<\w+.*>.*</\w+>",  # HTML/JSX
        ]

        for pattern in code_patterns:
            if re.search(pattern, self.content, re.MULTILINE):
                return True

        # High ratio of special characters
        special_chars = sum(1 for char in content if char in "{}()[];=<>.,")
        if len(content) > 0 and special_chars / len(content) > 0.1:
            return True

        return False

    def update_search_vector(self):
        """Update search vector for full-text search."""
        search_content = []

        # Include title and content
        if self.title:
            search_content.append(self.title)
        if self.content:
            search_content.append(self.content)

        # Include category
        search_content.append(self.get_category_display())

        # Include project title if available
        if self.project:
            search_content.append(self.project.title)
            if self.project.description:
                search_content.append(self.project.description)

        # Include custom tags
        if self.custom_tags:
            search_content.extend(self.custom_tags)

        self.search_vector = " ".join(search_content).lower()

    def add_tag(self, tag):
        """Add a custom tag to the note."""
        if not self.custom_tags:
            self.custom_tags = []

        tag = tag.strip().lower()
        if tag and tag not in self.custom_tags:
            self.custom_tags.append(tag)
            self.save()

    def remove_tag(self, tag):
        """Remove a custom tag from the note."""
        if self.custom_tags and tag in self.custom_tags:
            self.custom_tags.remove(tag)
            self.save()

    def toggle_pin(self):
        """Toggle the pinned status of the note."""
        self.is_pinned = not self.is_pinned
        self.save()
        return self.is_pinned

    def toggle_completion(self):
        """Toggle completion status for todo-type notes."""
        self.is_completed = not self.is_completed
        self.save()
        return self.is_completed

    @property
    def age_in_days(self):
        """Get the age of the note in days."""
        return (timezone.now().date() - self.created_at.date()).days

    @property
    def is_recent(self):
        """Check if note was created in the last 7 days."""
        return self.age_in_days <= 7

    @property
    def formatted_content(self):
        """Get content with basic markdown formatting applied."""
        if not self.is_code_snippet:
            return self.content

        # Wrap in code block if not already
        if not self.content.startswith("```"):
            return f"```\n{self.content}\n```"

        return self.content

    @classmethod
    def search(
        cls, user, query=None, project=None, category=None, tags=None, pinned_only=False
    ):
        """Advanced search method for notes."""
        queryset = cls.objects.filter(user=user)

        if project:
            queryset = queryset.filter(project=project)

        if category:
            queryset = queryset.filter(category=category)

        if pinned_only:
            queryset = queryset.filter(is_pinned=True)

        if tags:
            for tag in tags:
                queryset = queryset.filter(custom_tags__contains=tag)

        if query:
            # Simple text search across multiple fields
            queryset = queryset.filter(search_vector__icontains=query.lower())

        return queryset.distinct()
