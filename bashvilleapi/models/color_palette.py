from django.db import models
from django.contrib.auth.models import User


class ColorPalette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    primary_hex = models.CharField(max_length=7)
    secondary_hex = models.CharField(max_length=7)
    accent_hex = models.CharField(max_length=7)
    background_hex = models.CharField(max_length=7)

    def __str__(self):
        return f"{self.name} by {self.user.username}"
