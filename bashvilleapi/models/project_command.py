from django.db import models
from .project import Project
from .command import Command


class ProjectCommand(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    command = models.ForeignKey(Command, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "command")

    def __str__(self):
        return f"Command '{self.command.label}' in Project '{self.project.title}'"
