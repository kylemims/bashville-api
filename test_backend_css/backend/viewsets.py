# bashvilleapi/codegen/templates/django/viewsets.py.j2
from rest_framework import viewsets, permissions
from .models import BlogPost, Category
from .serializers import BlogPostSerializer, CategorySerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    """Generated ViewSet for BlogPost following Bashville security patterns."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BlogPostSerializer

    def get_queryset(self):
        """🔐 Bashville pattern: User isolation - users only see their own data."""
        return BlogPost.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """🔐 Bashville pattern: Auto-assign current user to new objects."""
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    """Generated ViewSet for Category following Bashville security patterns."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CategorySerializer

    def get_queryset(self):
        """🔐 Bashville pattern: User isolation - users only see their own data."""
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """🔐 Bashville pattern: Auto-assign current user to new objects."""
        serializer.save(user=self.request.user)

