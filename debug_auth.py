#!/usr/bin/env python
"""
Debug script to test authentication and user filtering
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bashvilleproject.settings")
django.setup()

from django.contrib.auth.models import User
from bashvilleapi.models import Project
from rest_framework.authtoken.models import Token


def debug_users_and_projects():
    """Check all users and their projects"""
    print("=== USERS AND PROJECTS DEBUG ===")
    print()

    users = User.objects.all()
    print(f"Total users: {users.count()}")

    for user in users:
        print(f"\n👤 User: {user.username} (ID: {user.id})")

        # Get user's token
        try:
            token = Token.objects.get(user=user)
            print(f"   🔑 Token: {token.key[:20]}...")
        except Token.DoesNotExist:
            print("   ❌ No token found")

        # Get user's projects
        user_projects = Project.objects.filter(user=user)
        print(f"   📁 Projects: {user_projects.count()}")

        for project in user_projects:
            print(f"      - {project.title} (ID: {project.id})")

    # Show total projects
    total_projects = Project.objects.all()
    print(f"\n📊 Total projects in database: {total_projects.count()}")

    print("\n=== PROJECT OWNERS ===")
    for project in total_projects:
        print(f"Project: {project.title} -> Owner: {project.user.username}")


def test_api_filtering():
    """Test that API filtering works correctly"""
    print("\n=== API FILTERING TEST ===")

    users = User.objects.all()[:2]  # Test first 2 users

    for user in users:
        print(f"\n🧪 Testing user: {user.username}")

        # Simulate API call filtering
        filtered_projects = Project.objects.filter(user=user)
        print(f"   Projects returned: {filtered_projects.count()}")

        for project in filtered_projects:
            print(f"      - {project.title}")


if __name__ == "__main__":
    debug_users_and_projects()
    test_api_filtering()
