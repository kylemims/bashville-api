import re
from typing import List, Dict, Any, Optional
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from .project import Project


class Note(models.Model):
    """
    Block-based developer notes with smart categorization and project context.

    Uses a blocks JSONField to store flexible content types:
    - Text blocks for general content
    - Checklist blocks for tasks
    - Code blocks for snippets
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

    # Content fields - BLOCKS ARE NOW PRIMARY
    title = models.CharField(
        max_length=200, blank=True, help_text="Auto-generated from content if empty"
    )
    blocks = models.JSONField(
        default=list, help_text="Content blocks (text, checklist, code, etc.)"
    )

    # Organization fields
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="note",
        help_text="Auto-detected based on content",
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

    def __str__(self) -> str:
        title = self.title or self.auto_generate_title()
        project_title = f" ({self.project.title})" if self.project else ""
        return f"{title}{project_title}"

    @property
    def safe_blocks(self) -> List[Dict[str, Any]]:
        """Return blocks as a safe list, handling None/invalid cases."""
        if not hasattr(self, "blocks") or not self.blocks:
            return []

        # Ensure blocks is iterable
        try:
            blocks = self.blocks if isinstance(self.blocks, list) else []
            return [block for block in blocks if isinstance(block, dict)]
        except (TypeError, AttributeError):
            return []

    def save(self, *args, **kwargs) -> None:
        """Enhanced save with auto-processing."""
        # Auto-generate title if empty
        if not self.title:
            self.title = self.auto_generate_title()

        # Auto-detect category if still default
        if self.category == "note":
            self.category = self.auto_detect_category()

        # Auto-detect code snippets
        self.is_code_snippet = self.detect_code_content()

        # Update search vector
        self.update_search_vector()

        super().save(*args, **kwargs)

    @property
    def content(self) -> str:
        """
        Backward compatibility property - converts blocks to text format.
        This allows old code that expects note.content to still work.
        """
        safe_blocks = self.safe_blocks
        if not safe_blocks:
            return ""

        content_parts = []
        for block in safe_blocks:
            block_type = block.get("type", "")

            if block_type == "text":
                content = block.get("content", "")
                if content and content.strip():
                    content_parts.append(content)

            elif block_type == "checklist":
                items = block.get("items", [])
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, dict):
                            status = "[x]" if item.get("completed", False) else "[ ]"
                            text = item.get("text", "")
                            if text and text.strip():
                                content_parts.append(f"- {status} {text}")

            elif block_type == "code":
                language = block.get("language", "")
                code_content = block.get("content", "")
                if code_content and code_content.strip():
                    content_parts.append(f"```{language}\n{code_content}\n```")

        return "\n\n".join(content_parts)

    def auto_generate_title(self) -> str:
        """Generate a smart title from the first block."""
        safe_blocks = self.safe_blocks
        if not safe_blocks:
            return "Empty Note"

        first_block = safe_blocks[0]
        block_type = first_block.get("type", "")

        title_generators = {
            "text": self._generate_text_title,
            "checklist": self._generate_checklist_title,
            "code": self._generate_code_title,
        }

        generator = title_generators.get(block_type)
        if generator:
            return generator(first_block)

        return "Note"

    def _generate_text_title(self, block: Dict[str, Any]) -> str:
        """Generate title from text block."""
        content = block.get("content", "")
        if not content.strip():
            return "Text Note"

        # Take first line, clean it up
        first_line = content.split("\n")[0].strip()
        clean_line = re.sub(r"[`*#\-\[\]]+", "", first_line).strip()

        if len(clean_line) > 50:
            return clean_line[:47] + "..."
        return clean_line if clean_line else "Text Note"

    def _generate_checklist_title(self, block: Dict[str, Any]) -> str:
        """Generate title from checklist block."""
        items = block.get("items", [])
        item_count = len(items)

        if item_count == 0:
            return "Empty Checklist"
        if item_count == 1:
            first_item_text = items[0].get("text", "")[:30] if items[0] else ""
            return f"Checklist: {first_item_text}"

        return f"Checklist with {item_count} items"

    def _generate_code_title(self, block: Dict[str, Any]) -> str:
        """Generate title from code block."""
        language = block.get("language", "code")
        return f"{language.title()} Code Block"

    def auto_detect_category(self) -> str:
        """Smart category detection based on block content."""
        combined_content = self._get_combined_content().lower()

        if not combined_content:
            return "note"

        # Define classification rules in order of priority
        classifiers = [
            (self._is_bug_content, "bug"),
            (self._is_todo_content, "todo"),
            (self._is_code_content, "code"),
            (self._is_question_content, "question"),
            (self._is_wishlist_content, "wishlist"),
            (self._is_reminder_content, "reminder"),
        ]

        for classifier_func, note_type in classifiers:
            if classifier_func(combined_content):
                return note_type

        return "note"

    def _get_combined_content(self) -> str:
        """Extract text content from all blocks safely."""
        if not self.blocks or not isinstance(self.blocks, list):
            return ""
        return self.content.lower()

    def _is_bug_content(self, content: str) -> bool:
        """Check if content indicates a bug or error."""
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
        return any(keyword in content for keyword in bug_keywords)

    def _is_todo_content(self, content: str) -> bool:
        """Check if content indicates a todo or task."""
        # Check for markdown checkboxes first
        if "[ ]" in content or "- [ ]" in content:
            return True

        todo_keywords = ["todo", "task", "need to", "should do", "remember to"]
        return any(keyword in content for keyword in todo_keywords)

    def _is_code_content(self, content: str) -> bool:
        """Check if content contains code blocks."""
        # Note: content parameter is part of the consistent interface
        # but we check the blocks structure directly for code detection
        _ = content  # Suppress unused argument warning

        safe_blocks = self.safe_blocks
        return any(block.get("type") == "code" for block in safe_blocks)

    def _is_question_content(self, content: str) -> bool:
        """Check if content is question-related."""
        if "?" in content:
            return True

        question_keywords = ["question", "how to", "why does", "what is", "help"]
        return any(keyword in content for keyword in question_keywords)

    def _is_wishlist_content(self, content: str) -> bool:
        """Check if content is a feature idea or wishlist item."""
        wishlist_keywords = ["idea", "feature", "maybe", "could add", "enhancement"]
        return any(keyword in content for keyword in wishlist_keywords)

    def _is_reminder_content(self, content: str) -> bool:
        """Check if content is a reminder."""
        reminder_keywords = ["reminder", "remember", "don't forget", "deadline"]
        return any(keyword in content for keyword in reminder_keywords)

    def detect_code_content(self) -> bool:
        """Check if note contains code blocks."""
        safe_blocks = self.safe_blocks
        return any(block.get("type") == "code" for block in safe_blocks)

    def update_search_vector(self) -> None:
        """Update search vector for full-text search."""
        search_content = []

        # Include title
        if self.title:
            search_content.append(self.title)

        # Include all block content
        content_text = self.content
        if content_text:
            search_content.append(content_text)

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

    # Utility methods remain the same
    def add_tag(self, tag: str) -> None:
        """Add a custom tag to the note."""
        if not self.custom_tags:
            self.custom_tags = []

        tag = tag.strip().lower()
        if tag and tag not in self.custom_tags:
            self.custom_tags.append(tag)
            self.save()

    def remove_tag(self, tag: str) -> None:
        """Remove a custom tag from the note."""
        if self.custom_tags and tag in self.custom_tags:
            self.custom_tags.remove(tag)
            self.save()

    def toggle_pin(self) -> bool:
        """Toggle the pinned status of the note."""
        self.is_pinned = not self.is_pinned
        self.save()
        return self.is_pinned

    def toggle_completion(self) -> bool:
        """Toggle completion status for todo-type notes."""
        self.is_completed = not self.is_completed
        self.save()
        return self.is_completed

    @property
    def age_in_days(self) -> int:
        """Get the age of the note in days."""
        return (timezone.now().date() - self.created_at.date()).days

    @property
    def is_recent(self) -> bool:
        """Check if note was created in the last 7 days."""
        return self.age_in_days <= 7

    @property
    def formatted_content(self) -> str:
        """Get content with basic markdown formatting applied."""
        return self.content  # Since content property already handles formatting

    @classmethod
    def search(
        cls,
        user: User,
        query: Optional[str] = None,
        project: Optional[Project] = None,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        pinned_only: bool = False,
    ):
        """Advanced search method for notes with improved type safety."""
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
