from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from bashvilleapi.models.color_palette import ColorPalette
from bashvilleapi.serializers.color_palette import ColorPaletteSerializer


class ColorPaletteViewSet(ModelViewSet):
    queryset = ColorPalette.objects.all()
    serializer_class = ColorPaletteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return color palettes that belong to the logged-in user
        return ColorPalette.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the color palette
        serializer.save(user=self.request.user)
