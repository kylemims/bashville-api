from rest_framework import serializers
from bashvilleapi.models import Project, ColorPalette, Command


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model, including color palette details."""

    # Color palette fields
    color_palette = serializers.PrimaryKeyRelatedField(
        queryset=ColorPalette.objects.none(),  # Populated in __init__ for security
        allow_null=True,
        required=False,
    )
    color_palette_preview = serializers.SerializerMethodField(
        read_only=True,
    )

    # Command Fields (User Story #2 - Save custom commands)
    command_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    commands_preview = serializers.SerializerMethodField(
        read_only=True,
    )

    class Meta:
        model = Project
        fields = (
            "id",
            "title",
            "description",
            "color_palette",
            "color_palette_preview",
            "command_ids",
            "commands_preview",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
        # Add this to make title not required for partial updates
        extra_kwargs = {
            "title": {"required": False},
            "description": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        """
        Initialize serializer and set up security constraints.

        Ensures users can only:
        - Assign their own color palettes to projects
        - Assign their own commands to projects
        """
        super().__init__(*args, **kwargs)
        # Limit palettes to the caller's own
        req = self.context.get("request")
        if req and req.user and req.user.is_authenticated:
            self.fields["color_palette"].queryset = ColorPalette.objects.filter(
                user=req.user
            )

    def get_color_palette_preview(self, obj):
        """
        Return full color palette data for frontend display.

        User Story #3 (Custom Color Variables)
        """
        palette = obj.color_palette
        if not palette:
            return None

        return {
            "id": palette.id,
            "name": palette.name,
            "primary_hex": palette.primary_hex,
            "secondary_hex": palette.secondary_hex,
            "accent_hex": palette.accent_hex,
            "background_hex": palette.background_hex,
        }

    def get_commands_preview(self, obj):
        """
        Return list of commands (command stash) for frontend display.

        User Story #2 (Save custom commands) AND
        User Story #4 (Command Stash + Script Generator)
        """
        return [
            {
                "id": command.id,
                "label": command.label,
                "command_text": command.command_text,
                "order_index": command.order_index,
            }
            for command in obj.commands.all().order_by("order_index", "label")
        ]

    def validate_command_ids(self, value):
        """
        Validate that command IDs belong to the user.
        """
        if not value:
            return value

        user = self.context["request"].user
        # check that all command IDs belong to the user
        user_commands = Command.objects.filter(
            user=user,
            id__in=value,
        )

        if user_commands.count() != len(value):
            raise serializers.ValidationError("Some commands don't belong to you.")

        # Check for duplicates in the list
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate command IDs are not allowed.")

        return value

    def create(self, validated_data):
        """
        Create a new project with automatic user assignment.
        - Command attachment via many-to-many relationship
        """
        command_ids = validated_data.pop("command_ids", [])

        # (security)
        validated_data["user"] = self.context["request"].user

        # Create the project
        project = super().create(validated_data)

        # Attach commands if provided
        if command_ids:
            commands = Command.objects.filter(
                user=self.context["request"].user, id__in=command_ids
            )
            project.commands.set(commands)

        return project

    def update(self, instance, validated_data):
        command_ids = validated_data.pop("command_ids", None)

        # Remove user from validated_data to prevent overwriting
        validated_data.pop("user", None)

        # Update basic fields if any provided
        for field, value in validated_data.items():
            setattr(instance, field, value)

        if validated_data:  # Only save if there are fields to update
            instance.save()

        # Update commands if command_ids were provided
        if command_ids is not None:  # Allow empty list to clear commands
            if command_ids:
                commands = Command.objects.filter(
                    user=self.context["request"].user, id__in=command_ids
                )
                instance.commands.set(commands)
            else:
                # Empty list means clear all commands
                instance.commands.clear()

        return instance
