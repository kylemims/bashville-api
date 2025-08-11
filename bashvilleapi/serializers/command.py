from rest_framework import serializers
from bashvilleapi.models.command import Command


class CommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Command
        fields = [
            "id",
            "label",
            "command_text",
            "order_index",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_label(self, value):
        """
        Ensure the command label is unique for the user.
        """
        user = self.context["request"].user
        if self.instance:
            existing = Command.objects.filter(user=user, label=value).exclude(
                pk=self.instance.pk
            )
        else:
            existing = Command.objects.filter(user=user, label=value)

        if existing.exists():
            raise serializers.ValidationError(
                "A command with this label already exists."
            )
        return value

    def validate_command_text(self, value):
        """
        Ensure the command text is not empty.
        """
        if not value.strip():
            raise serializers.ValidationError("Command text cannot be empty.")
        return value.strip()
