from django.db import models
from django.contrib.auth.models import User


class Command(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commands")
    label = models.CharField(max_length=100)
    command_text = models.TextField()
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order_index", "lablel"]
        unique_together = ("user", "label")

    def __str__(self):
        return f"{self.label} ({self.user.username})"
