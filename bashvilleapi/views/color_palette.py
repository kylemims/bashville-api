from rest_framework import viewsets, permissions
from bashvilleapi.models import ColorPalette
from bashvilleapi.serializers import ColorPaletteSerializer


class ColorPaletteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ColorPaletteSerializer

    def get_queryset(self):
        # Only return color palettes that belong to the logged-in user
        return ColorPalette.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the color palette
        serializer.save(user=self.request.user)
