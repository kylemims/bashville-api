# bashvilleapi/codegen/templates/django/models.py.j2
from django.db import models
from django.contrib.auth.models import User


class BlogPost(models.Model):
    """Generated BlogPost model following Bashville security patterns."""
    
    # 🔐 User ownership (critical for Bashville security)
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="blogposts"
    )
    
    # Entity-specific fields
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)

    # Relationships
    categories = models.ManyToManyField(
        "Category", 
        related_name="posts", 
        blank=True
    )
    
    # Timestamps (following Bashville pattern)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{getattr(self, 'title', self.pk)} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']

class Category(models.Model):
    """Generated Category model following Bashville security patterns."""
    
    # 🔐 User ownership (critical for Bashville security)
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="categories"
    )
    
    # Entity-specific fields
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Relationships
    
    # Timestamps (following Bashville pattern)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{getattr(self, 'name', self.pk)} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']

