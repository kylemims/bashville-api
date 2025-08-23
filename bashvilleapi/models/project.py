from django.db import models
from django.contrib.auth.models import User


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
