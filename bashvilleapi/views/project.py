from rest_framework import viewsets, permissions
from bashvilleapi.models import Project
from bashvilleapi.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Only return projects that belong to the logged-in user
        return Project.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the project
        serializer.save(user=self.request.user)
