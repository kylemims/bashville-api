# bashvilleapi/codegen/templates/django/models.py.j2
from django.db import models
from django.contrib.auth.models import User


class BlogPost(models.Model):
    """Generated model for BlogPost."""
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="blogposts"
    )
    
    # Entity fields
    title = models.CharField(max_length=200)
    content = models.TextField(, blank=True)

    # Relationships
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{getattr(self, 'title', self.pk)} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']

