from rest_framework import viewsets, permissions
from rest_framework.response import Response
from bashvilleapi.models import Project
from bashvilleapi.serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
