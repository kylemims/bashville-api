# Auto-generated from backend_config
from django.db import models

class Author(models.Model):
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Author({self.pk})"


class Book(models.Model):
    title = models.CharField(max_length=200)
    published = models.DateField(null=True, blank=True)
    author = models.ForeignKey("Author", on_delete=models.CASCADE, related_name="books")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Book({self.pk})"

