from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = "Create a test user for development purposes"

    def handle(self, *args, **kwargs):
        # Create or get the test user
        user, created = User.objects.get_or_create(
            username="testuser",
            defaults={
                "email": "test@example.com",
                "first_name": "Test",
                "last_name": "User",
                "is_active": True,
                "is_staff": False,
                "is_superuser": False,
            },
        )

        # Create the user if it does not exist
        if created:
            user.set_password("testpass123")
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f"User {user.username} created successfully.")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"User {user.username} already exists.")
            )

        # Create or retrieve the token for the user
        token, token_created = Token.objects.get_or_create(user=user)
        if token_created:
            self.stdout.write(self.style.SUCCESS(f"Created auth token: {token.key}"))
        else:
            self.stdout.write(self.style.WARNING(f"Token already exists: {token.key}."))
