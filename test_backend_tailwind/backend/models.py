# bashvilleapi/codegen/templates/django/models.py.j2
from django.db import models
from django.contrib.auth.models import User


class BlogPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blogposts")

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    categories = models.ManyToManyField(
        "Category",
        related_name="posts",
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{getattr(self, 'title', self.pk)} by {self.user.username}"

    class Meta:
        app_label = 'backend'
        ordering = ['-created_at']
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{getattr(self, 'name', self.pk)} by {self.user.username}"

    class Meta:
        app_label = 'backend'
        ordering = ['-created_at']
