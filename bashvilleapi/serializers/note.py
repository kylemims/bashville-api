from rest_framework import serializers
from ..models import Note


class NoteSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Note model with smart field handling.

    Features:
    - Auto-categorization on creation/update
    - Smart title generation
    - Project relationship handling
    - Custom tag management
    - Read-only computed fields
    - Validation for content and relationships
    """

    # Read-only computed fields
    auto_generated_title = serializers.CharField(
        source="auto_generate_title", read_only=True
    )
    auto_detected_category = serializers.CharField(
        source="auto_detect_category", read_only=True
    )
    is_code_detected = serializers.BooleanField(
        source="detect_code_content", read_only=True
    )
    formatted_content = serializers.CharField(read_only=True)
    age_in_days = serializers.IntegerField(read_only=True)
    is_recent = serializers.BooleanField(read_only=True)

    # Project relationship with nested data
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_description = serializers.CharField(
        source="project.description", read_only=True
    )

    # User relationship (read-only, set from request)
    user_username = serializers.CharField(source="user.username", read_only=True)

    # Category display name
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_display",
            "custom_tags",
            "is_pinned",
            "is_code_snippet",
            "is_completed",
            "order",
            "project",
            "project_title",
            "project_description",
            "user_username",
            "created_at",
            "updated_at",
            "auto_generated_title",
            "auto_detected_category",
            "is_code_detected",
            "formatted_content",
            "age_in_days",
            "is_recent",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "search_vector",
            "user_username",
            "project_title",
            "project_description",
            "category_display",
            "auto_generated_title",
            "auto_detected_category",
            "is_code_detected",
            "formatted_content",
            "age_in_days",
            "is_recent",
        ]

    def validate_content(self, value):
        """Validate note content."""
        if not value or not value.strip():
            raise serializers.ValidationError("Note content cannot be empty.")

        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Note content must be at least 3 characters long."
            )

        if len(value) > 10000:
            raise serializers.ValidationError(
                "Note content cannot exceed 10,000 characters."
            )

        return value.strip()

    def validate_title(self, value):
        """Validate note title."""
        if value and len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")

        return value.strip() if value else value

    def validate_custom_tags(self, value):
        """Validate custom tags."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Custom tags must be a list.")

        if len(value) > 10:
            raise serializers.ValidationError("Cannot have more than 10 custom tags.")

        validated_tags = []
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("All tags must be strings.")

            clean_tag = tag.strip().lower()
            if not clean_tag:
                continue

            if len(clean_tag) > 30:
                raise serializers.ValidationError(
                    "Individual tags cannot exceed 30 characters."
                )

            if clean_tag not in validated_tags:
                validated_tags.append(clean_tag)

        return validated_tags

    def validate_project(self, value):
        """Validate project relationship."""
        if value:
            # Ensure user has access to the project
            request = self.context.get("request")
            if request and hasattr(request, "user"):
                if value.user != request.user:
                    raise serializers.ValidationError(
                        "You can only associate notes with your own projects."
                    )

        return value

    def validate(self, attrs):
        """Cross-field validation."""
        # If no title provided and content exists, auto-generate will handle it
        content = attrs.get("content", "")
        title = attrs.get("title", "")

        # If both title and content are empty, that's an error
        if not title and not content:
            raise serializers.ValidationError(
                "Either title or content must be provided."
            )

        return attrs

    def create(self, validated_data):
        """Create note with user assignment."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user
        else:
            raise serializers.ValidationError(
                "User context required for note creation."
            )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update note with smart field handling."""
        # Store old values for comparison
        old_content = instance.content
        old_category = instance.category

        # Update the instance
        instance = super().update(instance, validated_data)

        # If content changed significantly, allow re-categorization
        new_content = validated_data.get("content", old_content)
        if (
            new_content != old_content
            and old_category == instance.auto_detect_category()
        ):
            # Content changed and category wasn't manually overridden
            instance.category = instance.auto_detect_category()
            instance.save()

        return instance

    def to_representation(self, instance):
        """Customize the serialized representation."""
        data = super().to_representation(instance)

        # Add preview for long content
        if data["content"] and len(data["content"]) > 200:
            data["content_preview"] = data["content"][:197] + "..."
        else:
            data["content_preview"] = data["content"]

        # Add note statistics
        data["stats"] = {
            "character_count": len(data["content"]) if data["content"] else 0,
            "word_count": len(data["content"].split()) if data["content"] else 0,
            "line_count": len(data["content"].split("\n")) if data["content"] else 0,
        }

        # Add quick actions info
        data["actions"] = {
            "can_pin": True,
            "can_complete": data["category"] in ["todo", "reminder"],
            "can_copy_code": data["is_code_snippet"],
        }

        return data


class NoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for note lists with full content."""

    project_title = serializers.CharField(source="project.title", read_only=True)
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    age_in_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_display",
            "is_pinned",
            "is_code_snippet",
            "is_completed",
            "project",
            "project_title",
            "created_at",
            "updated_at",
            "age_in_days",
            "custom_tags",
        ]


class NoteStatsSerializer(serializers.Serializer):
    """Serializer for note statistics and analytics."""

    total_notes = serializers.IntegerField()
    notes_by_category = serializers.DictField()
    notes_by_project = serializers.DictField()
    pinned_count = serializers.IntegerField()
    recent_count = serializers.IntegerField()
    completed_todos = serializers.IntegerField()
    pending_todos = serializers.IntegerField()
    code_snippets = serializers.IntegerField()
    popular_tags = serializers.ListField()


class QuickNoteSerializer(serializers.ModelSerializer):
    """Ultra-minimal serializer for quick note creation."""

    class Meta:
        model = Note
        fields = ["content", "project"]

    def validate_content(self, value):
        """Quick validation for content."""
        if not value or not value.strip():
            raise serializers.ValidationError("Content required.")
        return value.strip()

    def create(self, validated_data):
        """Quick create with minimal processing."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user

        return super().create(validated_data)
