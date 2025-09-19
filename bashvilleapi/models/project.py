# -*- coding: utf-8 -*-
# pylint: skip-file
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta


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
    project_type = models.CharField(
        max_length=20, choices=PROJECT_TYPES, default="static-tailwind"
    )
    color_palette = models.ForeignKey(
        "ColorPalette",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    # Add m2m relationship for commands via ProjectCommand
    commands = models.ManyToManyField(
        "Command", through="ProjectCommand", blank=True, related_name="projects"
    )
    backend_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.user.username}"

    @property
    def note_count(self):
        """Get the total number of notes associated with this project."""
        return self.notes.count()

    @property
    def recent_notes_count(self):
        """Get the number of notes created in the last 7 days."""

        week_ago = timezone.now() - timedelta(days=7)
        return self.notes.filter(created_at__gte=week_ago).count()

    @property
    def pinned_notes_count(self):
        """Get the number of pinned notes for this project."""
        return self.notes.filter(is_pinned=True).count()

    @property
    def todo_notes_count(self):
        """Get the number of todo/reminder notes for this project."""
        return self.notes.filter(category__in=["todo", "reminder"]).count()

    @property
    def pending_todos_count(self):
        """Get the number of uncompleted todo/reminder notes."""
        return self.notes.filter(
            category__in=["todo", "reminder"], is_completed=False
        ).count()

    @property
    def code_snippets_count(self):
        """Get the number of code snippet notes for this project."""
        return self.notes.filter(is_code_snippet=True).count()

    def get_notes_by_category(self):
        """Get a breakdown of notes by category for this project."""

        return (
            self.notes.values("category").annotate(count=Count("id")).order_by("-count")
        )

    def get_recent_notes(self, limit=5):
        """Get the most recent notes for this project."""
        return self.notes.order_by("-created_at")[:limit]

    def get_pinned_notes(self):
        """Get all pinned notes for this project."""
        return self.notes.filter(is_pinned=True).order_by("-updated_at")

    def get_pending_todos(self):
        """Get all pending todo/reminder notes for this project."""
        return self.notes.filter(
            category__in=["todo", "reminder"], is_completed=False
        ).order_by("-created_at")
