from rest_framework import viewsets, permissions
from bashvilleapi.models import Command
from bashvilleapi.serializers import CommandSerializer


class CommandViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommandSerializer

    def get_queryset(self):
        # Only return commands that belong to the logged-in user
        return Command.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the command
        serializer.save(user=self.request.user)
