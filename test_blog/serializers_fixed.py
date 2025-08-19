# bashvilleapi/codegen/templates/django/serializers.py.j2
from rest_framework import serializers
from .models import BlogPost, Category


class BlogPostSerializer(serializers.ModelSerializer):
    """Generated serializer for BlogPost following Bashville patterns."""

    # Bashville dual field pattern for M2M relationships
    categories_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    categories_preview = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = BlogPost
        fields = (
            "id",
            "title",
            "content",
            "categories_ids",
            "categories_preview",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
        extra_kwargs = {
            # Bashville pattern: Support partial updates
            "title": {"required": False},
            "content": {"required": False},
        }

    def get_categories_preview(self, obj):
        """Return related Category objects for display."""
        return [{"id": item.id, "name": str(item)} for item in obj.categories.all()]

    def validate_categories_ids(self, value):
        """🔐 Bashville security: Ensure objects belong to user."""
        if not value:
            return value
        user = self.context["request"].user
        from .models import Category

        user_items = Category.objects.filter(user=user, id__in=value)
        if user_items.count() != len(value):
            raise serializers.ValidationError(f"Some categories don't belong to you.")
        return value

    def create(self, validated_data):
        """Handle M2M relationships during creation."""
        categories_ids = validated_data.pop("categories_ids", [])
        # Bashville pattern: Auto-assign user
        validated_data["user"] = self.context["request"].user
        instance = super().create(validated_data)

        if categories_ids:
            from .models import Category

            categories_objects = Category.objects.filter(
                user=self.context["request"].user, id__in=categories_ids
            )
            instance.categories.set(categories_objects)
        return instance

    def update(self, instance, validated_data):
        """Handle M2M relationships during updates."""
        categories_ids = validated_data.pop("categories_ids", None)
        instance = super().update(instance, validated_data)

        if categories_ids is not None:
            from .models import Category

            categories_objects = Category.objects.filter(
                user=self.context["request"].user, id__in=categories_ids
            )
            instance.categories.set(categories_objects)
        return instance


class CategorySerializer(serializers.ModelSerializer):
    """Generated serializer for Category following Bashville patterns."""

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "description",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
        extra_kwargs = {
            # Bashville pattern: Support partial updates
            "name": {"required": False},
            "description": {"required": False},
        }
