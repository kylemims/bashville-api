from datetime import timedelta
from collections import Counter
import re

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone

from ..models import Note, Project
from ..serializers import (
    NoteSerializer,
    NoteListSerializer,
    NoteStatsSerializer,
    QuickNoteSerializer,
)


class NoteViewSet(viewsets.ModelViewSet):
    """
    Comprehensive ViewSet for Note management with advanced features.

    Features:
    - Full CRUD operations
    - Advanced search and filtering
    - Quick note creation
    - Bulk operations
    - Statistics and analytics
    - Project-specific filtering
    - Category-based organization
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content", "custom_tags"]
    ordering_fields = ["created_at", "updated_at", "title", "category"]
    ordering = ["-is_pinned", "-updated_at"]

    def get_queryset(self):
        """Get notes for the authenticated user with optimized queries."""
        queryset = (
            Note.objects.filter(user=self.request.user)
            .select_related("project")
            .prefetch_related("project__user")
        )

        # Apply filters from query parameters
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        project_id = self.request.query_params.get("project")
        if project_id:
            try:
                queryset = queryset.filter(project_id=int(project_id))
            except (ValueError, TypeError):
                pass

        is_pinned = self.request.query_params.get("pinned")
        if is_pinned is not None:
            queryset = queryset.filter(is_pinned=is_pinned.lower() == "true")

        is_completed = self.request.query_params.get("completed")
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == "true")

        is_code = self.request.query_params.get("code")
        if is_code is not None:
            queryset = queryset.filter(is_code_snippet=is_code.lower() == "true")

        # Tag filtering
        tags = self.request.query_params.get("tags")
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            for tag in tag_list:
                queryset = queryset.filter(custom_tags__contains=tag)

        # Date filtering
        since = self.request.query_params.get("since")
        if since:
            try:
                days = int(since)
                since_date = timezone.now() - timedelta(days=days)
                queryset = queryset.filter(created_at__gte=since_date)
            except (ValueError, TypeError):
                pass

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return NoteListSerializer
        elif self.action == "quick_create":
            return QuickNoteSerializer
        return NoteSerializer

    def create(self, request, *args, **kwargs):
        """Create a new note with enhanced feedback."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Return full note data with auto-detected fields
        response_serializer = NoteSerializer(note, context={"request": request})

        return Response(
            {
                "note": response_serializer.data,
                "message": f"Note created successfully! Auto-detected as: {note.get_category_display()}",
                "auto_detected": {
                    "category": note.category,
                    "is_code": note.is_code_snippet,
                    "title_generated": not request.data.get("title"),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        """Update note with change tracking."""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Track changes
        old_category = instance.category
        old_pinned = instance.is_pinned

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Build change summary
        changes = []
        if old_category != note.category:
            changes.append(f"Category changed to {note.get_category_display()}")
        if old_pinned != note.is_pinned:
            changes.append("Pinned status toggled")

        return Response(
            {
                "note": serializer.data,
                "message": "Note updated successfully!",
                "changes": changes,
            }
        )

    @action(detail=False, methods=["post"])
    def quick_create(self, request):
        """Ultra-fast note creation for immediate capture."""
        serializer = QuickNoteSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Return minimal response for speed
        return Response(
            {
                "id": note.id,
                "title": note.title or note.auto_generate_title(),
                "category": note.category,
                "message": "Quick note saved!",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def search(self, request):
        """Advanced search with multiple criteria."""
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({"results": [], "message": "No search query provided"})

        # Parse search query for special syntax
        project_search = None
        category_search = None
        tag_search = []
        text_query = query

        # Extract special search patterns
        if "project:" in query:
            parts = query.split("project:")
            if len(parts) > 1:
                project_part = parts[1].split()[0]
                project_search = project_part
                text_query = query.replace(f"project:{project_part}", "").strip()

        if "category:" in query:
            parts = query.split("category:")
            if len(parts) > 1:
                category_part = parts[1].split()[0]
                category_search = category_part
                text_query = query.replace(f"category:{category_part}", "").strip()

        if "tag:" in query:
            tag_matches = re.findall(r"tag:(\w+)", query)
            tag_search = tag_matches
            for tag in tag_matches:
                text_query = text_query.replace(f"tag:{tag}", "").strip()

        # Build search queryset
        queryset = self.get_queryset()

        if project_search:
            queryset = queryset.filter(
                Q(project__title__icontains=project_search)
                | Q(project__id=project_search if project_search.isdigit() else 0)
            )

        if category_search:
            queryset = queryset.filter(category__icontains=category_search)

        if tag_search:
            for tag in tag_search:
                queryset = queryset.filter(custom_tags__contains=tag)

        if text_query:
            queryset = queryset.filter(
                Q(title__icontains=text_query)
                | Q(content__icontains=text_query)
                | Q(search_vector__icontains=text_query)
            )

        # Limit results and serialize
        results = queryset[:50]  # Limit for performance
        serializer = NoteListSerializer(
            results, many=True, context={"request": request}
        )

        return Response(
            {
                "results": serializer.data,
                "count": len(results),
                "query": query,
                "parsed_search": {
                    "text": text_query,
                    "project": project_search,
                    "category": category_search,
                    "tags": tag_search,
                },
            }
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get comprehensive note statistics."""
        queryset = self.get_queryset()

        # Basic counts
        total_notes = queryset.count()
        pinned_count = queryset.filter(is_pinned=True).count()
        recent_count = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        code_snippets = queryset.filter(is_code_snippet=True).count()

        # Category breakdown
        category_stats = (
            queryset.values("category").annotate(count=Count("id")).order_by("-count")
        )
        notes_by_category = {item["category"]: item["count"] for item in category_stats}

        # Project breakdown
        project_stats = (
            queryset.filter(project__isnull=False)
            .values("project__title")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        notes_by_project = {
            item["project__title"]: item["count"] for item in project_stats
        }

        # Task completion statistics
        todo_notes = queryset.filter(category__in=["todo", "reminder"])
        completed_todos = todo_notes.filter(is_completed=True).count()
        pending_todos = todo_notes.filter(is_completed=False).count()

        # Popular tags
        all_tags = []
        for note in queryset.filter(custom_tags__isnull=False):
            all_tags.extend(note.custom_tags)
        popular_tags = [
            {"tag": tag, "count": count}
            for tag, count in Counter(all_tags).most_common(10)
        ]

        stats_data = {
            "total_notes": total_notes,
            "notes_by_category": notes_by_category,
            "notes_by_project": notes_by_project,
            "pinned_count": pinned_count,
            "recent_count": recent_count,
            "completed_todos": completed_todos,
            "pending_todos": pending_todos,
            "code_snippets": code_snippets,
            "popular_tags": popular_tags,
        }

        serializer = NoteStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def toggle_pin(self, request, pk=None):
        """Toggle the pinned status of a note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        new_status = note.toggle_pin()

        return Response(
            {
                "id": note.id,
                "is_pinned": new_status,
                "message": f'Note {"pinned" if new_status else "unpinned"} successfully!',
            }
        )

    @action(detail=True, methods=["post"])
    def toggle_completion(self, request, pk=None):
        """Toggle completion status for any note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()

        new_status = note.toggle_completion()

        return Response(
            {
                "id": note.id,
                "is_completed": new_status,
                "message": f'Note marked as {"completed" if new_status else "pending"}!',
            }
        )

    @action(detail=True, methods=["post"])
    def add_tag(self, request, pk=None):
        """Add a custom tag to a note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        tag = request.data.get("tag", "").strip()

        if not tag:
            return Response(
                {"error": "Tag cannot be empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        note.add_tag(tag)

        return Response(
            {
                "id": note.id,
                "custom_tags": note.custom_tags,
                "message": f'Tag "{tag}" added successfully!',
            }
        )

    @action(detail=True, methods=["post"])
    def remove_tag(self, request, pk=None):
        """Remove a custom tag from a note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        tag = request.data.get("tag", "").strip()

        if not tag:
            return Response(
                {"error": "Tag cannot be empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        note.remove_tag(tag)

        return Response(
            {
                "id": note.id,
                "custom_tags": note.custom_tags,
                "message": f'Tag "{tag}" removed successfully!',
            }
        )

    @action(detail=False, methods=["post"])
    def bulk_actions(self, request):
        """Perform bulk actions on multiple notes."""
        note_ids = request.data.get("note_ids", [])
        action_type = request.data.get("action")

        if not note_ids or not action_type:
            return Response(
                {"error": "note_ids and action are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.get_queryset().filter(id__in=note_ids)
        count = queryset.count()

        if action_type == "delete":
            queryset.delete()
            message = f"{count} notes deleted successfully"

        elif action_type == "pin":
            queryset.update(is_pinned=True)
            message = f"{count} notes pinned successfully"

        elif action_type == "unpin":
            queryset.update(is_pinned=False)
            message = f"{count} notes unpinned successfully"

        elif action_type == "complete":
            todo_count = queryset.filter(category__in=["todo", "reminder"]).update(
                is_completed=True
            )
            message = f"{todo_count} todo notes marked as completed"

        elif action_type == "set_category":
            new_category = request.data.get("category")
            if new_category in dict(Note.CATEGORY_CHOICES):
                queryset.update(category=new_category)
                message = f"{count} notes updated to category: {new_category}"
            else:
                return Response(
                    {"error": "Invalid category"}, status=status.HTTP_400_BAD_REQUEST
                )

        else:
            return Response(
                {"error": "Invalid action type"}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"message": message, "affected_count": count})

    @action(detail=False, methods=["get"])
    def recent(self, request):
        """Get recent notes (last 7 days)."""
        recent_notes = self.get_queryset().filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        )[:20]

        serializer = NoteListSerializer(
            recent_notes, many=True, context={"request": request}
        )

        return Response({"notes": serializer.data, "count": len(recent_notes)})

    @action(detail=False, methods=["get"])
    def by_project(self, request, project_id=None):
        """Get notes filtered by project."""
        project_id = request.query_params.get("project_id") or project_id

        if not project_id:
            return Response(
                {"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id, user=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND
            )

        notes = self.get_queryset().filter(project=project)
        serializer = NoteListSerializer(notes, many=True, context={"request": request})

        return Response(
            {
                "project": {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                },
                "notes": serializer.data,
                "count": len(notes),
            }
        )
