from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from bashvilleapi.models import Command
from bashvilleapi.serializers import CommandSerializer


class CommandViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommandSerializer

    def get_queryset(self):
        # Only return commands that belong to the logged-in user
        return Command.objects.filter(user=self.request.user).order_by(
            "order_index", "label"
        )

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the command
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """
        Custom action to reorder commands.
        Expects a list of command IDs in the request data.
        """
        command_ids = request.data.get("command_ids", [])

        if not command_ids:
            return Response(
                {"error": "command_ids list is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify all commands belong to the user
        user_commands = Command.objects.filter(user=request.user, id__in=command_ids)

        if user_commands.count() != len(command_ids):
            return Response(
                {"error": "Some commands don't exist or don't belong to the user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update order_index for each command
        for index, command_id in enumerate(command_ids):
            Command.objects.filter(id=command_id).update(order_index=index)

        return Response(
            {"detail": "Commands reordered successfully."}, status=status.HTTP_200_OK
        )
