from rest_framework import serializers
from ..models import Note


class NoteSerializer(serializers.ModelSerializer):
    """
    Block-based note serializer with smart field handling.

    Key changes from legacy version:
    - Primary content field is now 'blocks' (JSONField)
    - 'content' is read-only computed property for backward compatibility
    - Removed content validation since it's computed from blocks
    - Added blocks validation for structure integrity
    """

    # Read-only computed fields
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_description = serializers.CharField(
        source="project.description", read_only=True
    )
    user_username = serializers.CharField(source="user.username", read_only=True)
    age_in_days = serializers.IntegerField(read_only=True)
    is_recent = serializers.BooleanField(read_only=True)
    formatted_content = serializers.CharField(read_only=True)

    # Backward compatibility - content computed from blocks
    content = serializers.CharField(read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "blocks",
            "content",
            "category",
            "category_display",
            "priority_level",
            "custom_tags",
            "is_pinned",
            "is_code_snippet",
            "is_completed",
            "is_important",
            "is_archived",
            "order",
            "project",
            "project_title",
            "project_description",
            "user_username",
            "created_at",
            "updated_at",
            "age_in_days",
            "is_recent",
            "formatted_content",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "user_username",
            "project_title",
            "project_description",
            "category_display",
            "age_in_days",
            "is_recent",
            "formatted_content",
            "content",
            "is_code_snippet",
        ]

    def validate_blocks(self, value):
        """Validate blocks structure and content."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Blocks must be a list.")

        if len(value) > 50:  # Reasonable limit
            raise serializers.ValidationError(
                "Cannot have more than 50 blocks per note."
            )

        # Validate each block structure
        for i, block in enumerate(value):
            if not isinstance(block, dict):
                raise serializers.ValidationError(f"Block {i + 1} must be an object.")

            # Required fields
            if "type" not in block:
                raise serializers.ValidationError(
                    f"Block {i + 1} is missing 'type' field."
                )

            if "id" not in block:
                raise serializers.ValidationError(
                    f"Block {i + 1} is missing 'id' field."
                )

            block_type = block.get("type")

            # Validate block type
            if block_type not in ["text", "checklist", "code"]:
                raise serializers.ValidationError(
                    f"Block {i + 1} has invalid type '{block_type}'. Must be 'text', 'checklist', or 'code'."
                )

            # Type-specific validation
            if block_type == "text":
                if "content" not in block:
                    raise serializers.ValidationError(
                        f"Text block {i + 1} is missing 'content' field."
                    )
                if not isinstance(block["content"], str):
                    raise serializers.ValidationError(
                        f"Text block {i + 1} content must be a string."
                    )

            elif block_type == "checklist":
                if "items" not in block:
                    raise serializers.ValidationError(
                        f"Checklist block {i + 1} is missing 'items' field."
                    )
                if not isinstance(block["items"], list):
                    raise serializers.ValidationError(
                        f"Checklist block {i + 1} items must be a list."
                    )

                # Validate checklist items
                for j, item in enumerate(block["items"]):
                    if not isinstance(item, dict):
                        raise serializers.ValidationError(
                            f"Checklist block {i + 1}, item {j + 1} must be an object."
                        )
                    if "text" not in item or "completed" not in item:
                        raise serializers.ValidationError(
                            f"Checklist block {i + 1}, item {j + 1} must have 'text' and 'completed' fields."
                        )

            elif block_type == "code":
                if "content" not in block:
                    raise serializers.ValidationError(
                        f"Code block {i + 1} is missing 'content' field."
                    )
                if not isinstance(block["content"], str):
                    raise serializers.ValidationError(
                        f"Code block {i + 1} content must be a string."
                    )

        return value

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
        blocks = attrs.get("blocks", [])
        title = attrs.get("title", "")

        # Must have either title or non-empty blocks
        has_content = bool(title.strip()) if title else False
        has_blocks = bool(blocks) and any(
            self._block_has_content(block) for block in blocks
        )

        if not has_content and not has_blocks:
            raise serializers.ValidationError(
                "Note must have either a title or content blocks."
            )

        return attrs

    def _block_has_content(self, block):
        """Check if a block has meaningful content."""
        block_type = block.get("type", "")

        if block_type == "text":
            return bool(block.get("content", "").strip())
        elif block_type == "checklist":
            items = block.get("items", [])
            return len(items) > 0 and any(
                item.get("text", "").strip() for item in items
            )
        elif block_type == "code":
            return bool(block.get("content", "").strip())

        return False

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
        old_blocks = instance.blocks
        old_category = instance.category

        # Update the instance
        instance = super().update(instance, validated_data)

        # If blocks changed significantly and category wasn't manually set, re-categorize
        new_blocks = validated_data.get("blocks", old_blocks)
        if new_blocks != old_blocks and old_category == instance.auto_detect_category():
            # Blocks changed and category wasn't manually overridden
            instance.category = instance.auto_detect_category()
            instance.save(update_fields=["category"])

        return instance

    def to_representation(self, instance):
        """Customize the serialized representation."""
        data = super().to_representation(instance)

        # Add content preview for long content
        full_content = data.get("content", "")
        if full_content and len(full_content) > 200:
            data["content_preview"] = full_content[:197] + "..."
        else:
            data["content_preview"] = full_content

        # Add block count for quick reference
        blocks = data.get("blocks", [])
        data["block_count"] = len(blocks)

        # Add note statistics
        data["stats"] = {
            "character_count": len(full_content) if full_content else 0,
            "word_count": len(full_content.split()) if full_content else 0,
            "block_count": len(blocks),
        }

        # Add quick actions info
        data["actions"] = {
            "can_pin": True,
            "can_complete": data["category"] in ["todo", "reminder"],
            "can_copy_code": data["is_code_snippet"],
        }

        return data


class NoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for note lists."""

    project_title = serializers.CharField(source="project.title", read_only=True)
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    age_in_days = serializers.IntegerField(read_only=True)
    content = serializers.CharField(read_only=True)  # For preview

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "blocks",
            "content",
            "category",
            "category_display",
            "priority_level",
            "is_pinned",
            "is_code_snippet",
            "is_completed",
            "is_important",
            "is_archived",
            "project",
            "project_title",
            "created_at",
            "updated_at",
            "age_in_days",
            "custom_tags",
        ]


class QuickNoteSerializer(serializers.ModelSerializer):
    """Simplified serializer for quick note creation with blocks."""

    class Meta:
        model = Note
        fields = ["blocks", "title", "project", "category"]

    def validate_blocks(self, value):
        """Quick validation for blocks."""
        if not value:
            raise serializers.ValidationError("Blocks required for note creation.")

        # Just ensure it's a list - detailed validation happens in main serializer
        if not isinstance(value, list):
            raise serializers.ValidationError("Blocks must be a list.")

        return value

    def create(self, validated_data):
        """Quick create with user assignment."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user

        return super().create(validated_data)


class NoteStatsSerializer(serializers.Serializer):
    """Enhanced serializer for comprehensive note analytics."""

    # Core metrics
    total_notes = serializers.IntegerField()
    completed_notes = serializers.IntegerField()
    important_notes = serializers.IntegerField()
    archived_notes = serializers.IntegerField()
    pinned_count = serializers.IntegerField()
    recent_count = serializers.IntegerField()
    code_snippets = serializers.IntegerField()

    # Category and priority breakdowns
    category_breakdown = serializers.DictField()
    notes_by_category = serializers.DictField()  # Legacy support
    notes_by_project = serializers.DictField()
    notes_by_priority = serializers.DictField()

    # Todo analytics
    completed_todos = serializers.IntegerField()
    pending_todos = serializers.IntegerField()

    # Enhanced analytics
    productivity_score = serializers.FloatField()
    recent_activity = serializers.DictField()
    popular_tags = serializers.ListField()
    block_stats = serializers.DictField()

    # Performance insights
    insights = serializers.ListField()
