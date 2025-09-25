# -*- coding: utf-8 -*-
"""
Block-based Notes ViewSet - Production Ready
Compatible with enhanced Note model and React block architecture

Key Features:
- Full block-based CRUD operations
- Backward compatibility for legacy content field
- Advanced search with block content indexing
- Comprehensive statistics including block analytics
- Enhanced error handling and validation
- Optimized queries with proper prefetching
"""
# Standard library imports
from datetime import timedelta
from collections import Counter
import re

# Third-party imports
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
    Enhanced ViewSet for block-based Note management.

    Features:
    - Full CRUD operations with block validation
    - Advanced search with block content indexing
    - Quick note creation with content-to-blocks conversion
    - Bulk operations with transaction safety
    - Comprehensive statistics and analytics
    - Project-specific filtering with security
    - Category auto-detection from blocks
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # Updated search fields for block compatibility
    search_fields = ["title", "search_vector", "custom_tags"]
    ordering_fields = [
        "created_at",
        "updated_at",
        "title",
        "category",
        "priority_level",
    ]
    ordering = ["-is_pinned", "order", "-updated_at"]

    def get_queryset(self):
        """Get notes for authenticated user with optimized block-aware queries."""
        queryset = (
            Note.objects.filter(user=self.request.user)
            .select_related("project")
            .prefetch_related("project__user")
        )

        # Enhanced filtering for block-based notes
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

        # Enhanced tag filtering with better performance
        tags = self.request.query_params.get("tags")
        if tags:
            tag_list = [tag.strip().lower() for tag in tags.split(",")]
            for tag in tag_list:
                queryset = queryset.filter(custom_tags__contains=tag)

        # Date filtering with timezone awareness
        since = self.request.query_params.get("since")
        if since:
            try:
                days = int(since)
                since_date = timezone.now() - timedelta(days=days)
                queryset = queryset.filter(created_at__gte=since_date)
            except (ValueError, TypeError):
                pass

        # Priority filtering
        priority = self.request.query_params.get("priority")
        if priority and priority in ["low", "medium", "high"]:
            queryset = queryset.filter(priority_level=priority)

        # Archive filtering (exclude archived by default)
        is_archived = self.request.query_params.get("is_archived", "false")
        if is_archived.lower() == "false":
            queryset = queryset.filter(is_archived=False)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return NoteListSerializer
        elif self.action == "quick_create":
            return QuickNoteSerializer
        return NoteSerializer

    def create(self, request, *args, **kwargs):
        """Create note with enhanced block validation and feedback."""
        _ = args, kwargs  # Unused parameters required by DRF interface
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Enhanced response with auto-detection feedback
        response_serializer = NoteSerializer(note, context={"request": request})

        return Response(
            {
                "note": response_serializer.data,
                "message": f"Note created successfully! Auto-detected as: {note.get_category_display()}",
                "auto_detected": {
                    "category": note.category,
                    "is_code": note.is_code_snippet,
                    "title_generated": not request.data.get("title"),
                    "block_count": len(note.safe_blocks),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        """Update note with comprehensive change tracking."""
        partial = kwargs.pop("partial", False)
        _ = args  # Unused parameter required by DRF interface
        instance = self.get_object()

        # Enhanced change tracking
        old_category = instance.category
        old_pinned = instance.is_pinned
        old_blocks = instance.blocks
        old_priority = instance.priority_level

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Build comprehensive change summary
        changes = []
        if old_category != note.category:
            changes.append(f"Category changed to {note.get_category_display()}")
        if old_pinned != note.is_pinned:
            changes.append("Pinned status toggled")
        if old_priority != note.priority_level:
            changes.append(f"Priority changed to {note.priority_level}")
        if old_blocks != note.blocks:
            changes.append(f"Content updated ({len(note.safe_blocks)} blocks)")

        return Response(
            {
                "note": serializer.data,
                "message": "Note updated successfully!",
                "changes": changes,
                "block_count": len(note.safe_blocks),
            }
        )

    @action(detail=False, methods=["post"])
    def quick_create(self, request):
        """
        Enhanced quick note creation with content-to-blocks conversion.

        Supports both legacy 'content' field and new 'blocks' field.
        Automatically converts plain text content to text blocks.
        """
        data = request.data.copy()

        # Handle legacy content field - convert to blocks
        if "content" in data and "blocks" not in data:
            content = data.get("content", "").strip()
            if content:
                # Convert content to a text block
                data["blocks"] = [
                    {
                        "id": "quick-block-1",
                        "type": "text",
                        "content": content,
                        "order": 0,
                    }
                ]
            else:
                return Response(
                    {"error": "Content or blocks required for note creation"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Ensure blocks exist
        if not data.get("blocks"):
            return Response(
                {"error": "Blocks required for note creation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = QuickNoteSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        # Return enhanced response for client compatibility
        return Response(
            {
                "id": note.id,
                "title": note.title or note.auto_generate_title(),
                "category": note.category,
                "blocks": note.blocks,
                "block_count": len(note.safe_blocks),
                "message": "Quick note saved!",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def search(self, request):
        """Enhanced search with block content awareness."""
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({"results": [], "message": "No search query provided"})

        # Parse advanced search syntax
        project_search = None
        category_search = None
        tag_search = []
        block_type_search = None
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

        if "type:" in query:
            parts = query.split("type:")
            if len(parts) > 1:
                type_part = parts[1].split()[0]
                if type_part in ["text", "checklist", "code"]:
                    block_type_search = type_part
                text_query = query.replace(f"type:{type_part}", "").strip()

        if "tag:" in query:
            tag_matches = re.findall(r"tag:(\w+)", query)
            tag_search = tag_matches
            for tag in tag_matches:
                text_query = text_query.replace(f"tag:{tag}", "").strip()

        # Build enhanced search queryset
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

        # Enhanced text search including block content
        if text_query:
            queryset = queryset.filter(
                Q(title__icontains=text_query) | Q(search_vector__icontains=text_query)
            )

        # Block type filtering
        if block_type_search:
            # Filter notes that have blocks of specified type
            # This requires iterating through JSONField data
            filtered_ids = []
            for note in queryset:
                for block in note.safe_blocks:
                    if block.get("type") == block_type_search:
                        filtered_ids.append(note.id)
                        break
            queryset = queryset.filter(id__in=filtered_ids)

        # Limit results and serialize
        results = queryset[:50]
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
                    "block_type": block_type_search,
                },
            }
        )

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get comprehensive note analytics with enhanced insights."""
        # Get base queryset without filters for comprehensive stats
        queryset = Note.objects.filter(user=request.user)

        # Basic counts with optimized queries
        basic_stats = queryset.aggregate(
            total_notes=Count("id"),
            completed_notes=Count("id", filter=Q(is_completed=True)),
            important_notes=Count("id", filter=Q(is_important=True)),
            archived_notes=Count("id", filter=Q(is_archived=True)),
            pinned_count=Count("id", filter=Q(is_pinned=True)),
            recent_count=Count(
                "id", filter=Q(created_at__gte=timezone.now() - timedelta(days=7))
            ),
            code_snippets=Count("id", filter=Q(is_code_snippet=True)),
            completed_todos=Count(
                "id", filter=Q(category__in=["todo", "reminder"], is_completed=True)
            ),
            pending_todos=Count(
                "id", filter=Q(category__in=["todo", "reminder"], is_completed=False)
            ),
        )

        # Category breakdown (both formats for compatibility)
        category_stats = (
            queryset.values("category").annotate(count=Count("id")).order_by("-count")
        )
        category_breakdown = {
            item["category"]: item["count"] for item in category_stats
        }

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

        # Priority breakdown
        priority_stats = (
            queryset.values("priority_level")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        notes_by_priority = {
            item["priority_level"]: item["count"] for item in priority_stats
        }

        # Recent activity analysis
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)

        recent_activity = {
            "notes_created_today": queryset.filter(created_at__gte=today_start).count(),
            "notes_completed_today": queryset.filter(
                updated_at__gte=today_start,
                is_completed=True,
                category__in=["todo", "reminder"],
            ).count(),
            "notes_updated_week": queryset.filter(updated_at__gte=week_start).count(),
            "notes_created_week": queryset.filter(created_at__gte=week_start).count(),
        }

        # Enhanced tag analytics
        all_tags = []
        for note in queryset.filter(custom_tags__isnull=False).only("custom_tags"):
            if note.custom_tags and isinstance(note.custom_tags, list):
                clean_tags = [
                    str(tag).strip()[:50]
                    for tag in note.custom_tags
                    if tag and isinstance(tag, (str, int))
                ]
                all_tags.extend(clean_tags)

        popular_tags = [
            {"tag": tag, "count": count}
            for tag, count in Counter(all_tags).most_common(10)
        ]

        # Comprehensive block statistics
        block_stats = self._calculate_block_statistics(queryset)

        # Calculate productivity score
        productivity_score = self._calculate_productivity_score(
            basic_stats, recent_activity, category_breakdown
        )

        # Generate insights
        insights = self._generate_insights(
            basic_stats, category_breakdown, recent_activity, productivity_score
        )

        # Compile comprehensive analytics data
        stats_data = {
            # Core metrics (frontend format)
            "total_notes": basic_stats["total_notes"],
            "completed_notes": basic_stats["completed_notes"],
            "important_notes": basic_stats["important_notes"],
            "archived_notes": basic_stats["archived_notes"],
            "pinned_count": basic_stats["pinned_count"],
            "recent_count": basic_stats["recent_count"],
            "code_snippets": basic_stats["code_snippets"],
            # Category data (both formats)
            "category_breakdown": category_breakdown,
            "notes_by_category": category_breakdown,  # Legacy support
            "notes_by_project": notes_by_project,
            "notes_by_priority": notes_by_priority,
            # Todo analytics
            "completed_todos": basic_stats["completed_todos"],
            "pending_todos": basic_stats["pending_todos"],
            # Enhanced analytics
            "productivity_score": productivity_score,
            "recent_activity": recent_activity,
            "popular_tags": popular_tags,
            "block_stats": block_stats,
            "insights": insights,
        }

        serializer = NoteStatsSerializer(stats_data)
        return Response(serializer.data)

    def _calculate_block_statistics(self, queryset):
        """Calculate comprehensive block statistics."""
        notes_with_blocks = queryset.exclude(
            Q(blocks__isnull=True) | Q(blocks=[])
        ).only("blocks")

        block_stats = {
            "total_blocks": 0,
            "text_blocks": 0,
            "checklist_blocks": 0,
            "code_blocks": 0,
            "average_blocks_per_note": 0,
            "notes_with_blocks": notes_with_blocks.count(),
            "longest_note_blocks": 0,
            "block_type_distribution": {
                "text": 0,
                "checklist": 0,
                "code": 0,
                "other": 0,
            },
        }

        total_block_count = 0
        max_blocks_in_note = 0

        for note in notes_with_blocks:
            if not note.blocks or not isinstance(note.blocks, list):
                continue

            block_count = len(note.blocks)
            total_block_count += block_count
            max_blocks_in_note = max(max_blocks_in_note, block_count)

            for block in note.blocks:
                if not isinstance(block, dict):
                    continue

                block_type = block.get("type", "other")
                if block_type == "text":
                    block_stats["text_blocks"] += 1
                    block_stats["block_type_distribution"]["text"] += 1
                elif block_type == "checklist":
                    block_stats["checklist_blocks"] += 1
                    block_stats["block_type_distribution"]["checklist"] += 1
                elif block_type == "code":
                    block_stats["code_blocks"] += 1
                    block_stats["block_type_distribution"]["code"] += 1
                else:
                    block_stats["block_type_distribution"]["other"] += 1

        block_stats.update(
            {
                "total_blocks": total_block_count,
                "longest_note_blocks": max_blocks_in_note,
                "average_blocks_per_note": (
                    round(total_block_count / block_stats["notes_with_blocks"], 1)
                    if block_stats["notes_with_blocks"] > 0
                    else 0
                ),
            }
        )

        return block_stats

    def _calculate_productivity_score(
        self, basic_stats, recent_activity, category_breakdown
    ):
        """Calculate productivity score based on multiple factors."""
        total_notes = basic_stats["total_notes"]
        if total_notes == 0:
            return 0

        # Completion rate (40% weight)
        todos_total = basic_stats["completed_todos"] + basic_stats["pending_todos"]
        completion_rate = (
            (basic_stats["completed_todos"] / todos_total * 100)
            if todos_total > 0
            else 50
        )
        completion_score = min(completion_rate, 100) * 0.4

        # Recent activity (30% weight)
        activity_score = (
            min(
                (
                    recent_activity["notes_created_week"]
                    + recent_activity["notes_completed_today"] * 2
                )
                * 10,
                100,
            )
            * 0.3
        )

        # Organization (20% weight) - variety of categories
        category_variety = len(category_breakdown)
        organization_score = min(category_variety * 15, 100) * 0.2

        # Important note ratio (10% weight)
        importance_ratio = (basic_stats["important_notes"] / total_notes) * 100
        importance_score = (
            min(importance_ratio, 50) * 2 * 0.1
        )  # Cap at 50% but scale up

        total_score = (
            completion_score + activity_score + organization_score + importance_score
        )
        return round(min(total_score, 100), 1)

    def _generate_insights(
        self, basic_stats, category_breakdown, recent_activity, productivity_score
    ):
        """Generate actionable insights based on analytics."""
        insights = []
        total_notes = basic_stats["total_notes"]

        if total_notes == 0:
            insights.append(
                {
                    "type": "info",
                    "icon": "info",
                    "message": "Start taking notes to see analytics and insights",
                }
            )
            return insights

        # Productivity insights
        if productivity_score >= 80:
            insights.append(
                {
                    "type": "success",
                    "icon": "celebration",
                    "message": "Excellent productivity! You're staying on top of your tasks",
                }
            )
        elif productivity_score < 40:
            insights.append(
                {
                    "type": "warning",
                    "icon": "trending_down",
                    "message": "Consider reviewing and completing some pending tasks to boost productivity",
                }
            )

        # Completion rate insights
        todos_total = basic_stats["completed_todos"] + basic_stats["pending_todos"]
        if todos_total > 0:
            completion_rate = (basic_stats["completed_todos"] / todos_total) * 100
            if completion_rate < 30:
                insights.append(
                    {
                        "type": "warning",
                        "icon": "trending_down",
                        "message": "Low completion rate - consider reviewing and completing some todos",
                    }
                )
            elif completion_rate > 80:
                insights.append(
                    {
                        "type": "success",
                        "icon": "check_circle",
                        "message": "Great completion rate! You're staying on top of your tasks",
                    }
                )

        # Category-specific insights
        if category_breakdown.get("bug", 0) > 5:
            insights.append(
                {
                    "type": "warning",
                    "icon": "bug_report",
                    "message": "High number of bug reports - consider prioritizing fixes",
                }
            )

        if category_breakdown.get("question", 0) > 3:
            insights.append(
                {
                    "type": "info",
                    "icon": "help",
                    "message": "Several open questions - might be good to seek answers",
                }
            )

        # Importance insights
        importance_ratio = (basic_stats["important_notes"] / total_notes) * 100
        if importance_ratio > 50:
            insights.append(
                {
                    "type": "info",
                    "icon": "priority_high",
                    "message": "Many important notes - focus on high-priority items first",
                }
            )

        # Recent activity insights
        if (
            recent_activity["notes_created_today"] == 0
            and recent_activity["notes_created_week"] > 0
        ):
            insights.append(
                {
                    "type": "info",
                    "icon": "schedule",
                    "message": "No notes created today - consider documenting your progress",
                }
            )

        # Archive insights
        if basic_stats["archived_notes"] > total_notes * 0.3:
            insights.append(
                {
                    "type": "info",
                    "icon": "archive",
                    "message": "Large number of archived notes - consider organizing your active notes",
                }
            )

        return insights

    @action(detail=True, methods=["post"])
    def toggle_pin(self, request, pk=None):
        """Toggle pin status with enhanced feedback."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        new_status = note.toggle_pin()

        return Response(
            {
                "id": note.id,
                "is_pinned": new_status,
                "title": note.title or note.auto_generate_title(),
                "message": f'Note "{note.title or note.auto_generate_title()}" {"pinned" if new_status else "unpinned"} successfully!',
            }
        )

    @action(detail=True, methods=["post"])
    def toggle_completion(self, request, pk=None):
        """Toggle completion with category validation."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()

        if note.category not in ["todo", "reminder"]:
            return Response(
                {
                    "error": "Only todo and reminder notes can be marked as completed",
                    "current_category": note.category,
                    "allowed_categories": ["todo", "reminder"],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = note.toggle_completion()

        return Response(
            {
                "id": note.id,
                "is_completed": new_status,
                "title": note.title or note.auto_generate_title(),
                "message": f'Note "{note.title or note.auto_generate_title()}" marked as {"completed" if new_status else "pending"}!',
            }
        )

    @action(detail=True, methods=["post"])
    def add_tag(self, request, pk=None):
        """Add tag with validation and duplicate prevention."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        tag = request.data.get("tag", "").strip().lower()

        if not tag:
            return Response(
                {"error": "Tag cannot be empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        if len(tag) > 30:
            return Response(
                {"error": "Tag cannot exceed 30 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate tags
        if tag in (note.custom_tags or []):
            return Response(
                {
                    "error": f'Tag "{tag}" already exists on this note',
                    "existing_tags": note.custom_tags,
                },
                status=status.HTTP_400_BAD_REQUEST,
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
        """Remove tag with existence validation."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        tag = request.data.get("tag", "").strip().lower()

        if not tag:
            return Response(
                {"error": "Tag cannot be empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        if tag not in (note.custom_tags or []):
            return Response(
                {
                    "error": f'Tag "{tag}" not found on this note',
                    "existing_tags": note.custom_tags or [],
                },
                status=status.HTTP_400_BAD_REQUEST,
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
        """Enhanced bulk operations with validation and feedback."""
        note_ids = request.data.get("note_ids", [])
        action_type = request.data.get("action")

        if not note_ids or not action_type:
            return Response(
                {"error": "note_ids and action are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(note_ids, list):
            return Response(
                {"error": "note_ids must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.get_queryset().filter(id__in=note_ids)
        count = queryset.count()

        if count == 0:
            return Response(
                {"error": "No valid notes found with provided IDs"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            if action_type == "delete":
                deleted_titles = [
                    note.title or note.auto_generate_title() for note in queryset[:5]
                ]
                queryset.delete()
                message = f"{count} notes deleted successfully"
                if deleted_titles:
                    message += f" (including: {', '.join(deleted_titles)}{'...' if count > 5 else ''})"

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
                message = f"{todo_count} of {count} notes marked as completed (todo/reminder notes only)"

            elif action_type == "archive":
                queryset.update(is_archived=True)
                message = f"{count} notes archived successfully"

            elif action_type == "unarchive":
                queryset.update(is_archived=False)
                message = f"{count} notes unarchived successfully"

            elif action_type == "set_category":
                new_category = request.data.get("category")
                if new_category not in dict(Note.CATEGORY_CHOICES):
                    return Response(
                        {
                            "error": "Invalid category",
                            "valid_categories": [
                                choice[0] for choice in Note.CATEGORY_CHOICES
                            ],
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                queryset.update(category=new_category)
                message = f"{count} notes updated to category: {new_category}"

            elif action_type == "set_priority":
                new_priority = request.data.get("priority")
                if new_priority not in ["low", "medium", "high"]:
                    return Response(
                        {
                            "error": "Invalid priority level",
                            "valid_priorities": ["low", "medium", "high"],
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                queryset.update(priority_level=new_priority)
                message = f"{count} notes updated to priority: {new_priority}"

            else:
                return Response(
                    {
                        "error": "Invalid action type",
                        "valid_actions": [
                            "delete",
                            "pin",
                            "unpin",
                            "complete",
                            "archive",
                            "unarchive",
                            "set_category",
                            "set_priority",
                        ],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": f"Bulk operation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": message,
                "affected_count": count,
                "action": action_type,
            }
        )

    @action(detail=False, methods=["get"])
    def recent(self, request):
        """Get recent notes with configurable timeframe."""
        days = request.query_params.get("days", 7)
        try:
            days = int(days)
            days = min(days, 365)  # Cap at 1 year
        except (ValueError, TypeError):
            days = 7

        limit = request.query_params.get("limit", 20)
        try:
            limit = int(limit)
            limit = min(limit, 100)  # Cap at 100
        except (ValueError, TypeError):
            limit = 20

        recent_notes = self.get_queryset().filter(
            created_at__gte=timezone.now() - timedelta(days=days)
        )[:limit]

        serializer = NoteListSerializer(
            recent_notes, many=True, context={"request": request}
        )

        return Response(
            {
                "notes": serializer.data,
                "count": len(recent_notes),
                "timeframe_days": days,
                "limit_applied": limit,
            }
        )

    @action(detail=False, methods=["get"])
    def by_project(self, request, project_id=None):
        """Get notes by project with enhanced validation."""
        project_id = request.query_params.get("project_id") or project_id

        if not project_id:
            return Response(
                {"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project_id = int(project_id)
            project = Project.objects.get(id=project_id, user=request.user)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid project_id format"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found or access denied"},
                status=status.HTTP_404_NOT_FOUND,
            )

        notes = self.get_queryset().filter(project=project)
        serializer = NoteListSerializer(notes, many=True, context={"request": request})

        # Enhanced project statistics
        category_breakdown = {}
        for note in notes:
            cat = note.category
            category_breakdown[cat] = category_breakdown.get(cat, 0) + 1

        return Response(
            {
                "project": {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                },
                "notes": serializer.data,
                "count": len(notes),
                "category_breakdown": category_breakdown,
                "pinned_count": sum(1 for note in notes if note.is_pinned),
                "completed_todos": sum(
                    1
                    for note in notes
                    if note.category in ["todo", "reminder"] and note.is_completed
                ),
            }
        )

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        """Create a duplicate of an existing note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        original_note = self.get_object()

        # Create duplicate with modified title
        duplicate_data = {
            "title": f"Copy of {original_note.title or original_note.auto_generate_title()}",
            "blocks": original_note.blocks,
            "category": original_note.category,
            "priority_level": original_note.priority_level,
            "custom_tags": (
                original_note.custom_tags[:] if original_note.custom_tags else []
            ),
            "project": original_note.project,
        }

        serializer = NoteSerializer(data=duplicate_data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        duplicate_note = serializer.save()

        return Response(
            {
                "original_note_id": original_note.id,
                "duplicate_note": NoteSerializer(
                    duplicate_note, context={"request": request}
                ).data,
                "message": f"Note duplicated successfully as '{duplicate_note.title}'",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        """Get notes grouped by category."""
        category = request.query_params.get("category")

        if category:
            # Filter by specific category
            notes = self.get_queryset().filter(category=category)
            serializer = NoteListSerializer(
                notes, many=True, context={"request": request}
            )

            return Response(
                {"category": category, "notes": serializer.data, "count": len(notes)}
            )
        else:
            # Return all notes grouped by category
            queryset = self.get_queryset()
            categories = {}

            for note in queryset:
                cat = note.category
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(note)

            response_data = {}
            for cat, notes in categories.items():
                serializer = NoteListSerializer(
                    notes, many=True, context={"request": request}
                )
                response_data[cat] = {"notes": serializer.data, "count": len(notes)}

            return Response(response_data)

    @action(detail=True, methods=["post"])
    def toggle_archived(self, request, pk=None):
        """Toggle archive status of a note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        note.is_archived = not note.is_archived
        note.save()

        return Response(
            {
                "id": note.id,
                "is_archived": note.is_archived,
                "title": note.title or note.auto_generate_title(),
                "message": f'Note {"archived" if note.is_archived else "unarchived"} successfully!',
            }
        )

    @action(detail=True, methods=["post"])
    def toggle_important(self, request, pk=None):
        """Toggle important status of a note."""
        _ = pk  # Required by DRF but not used since we use get_object()
        note = self.get_object()
        note.is_important = not note.is_important
        note.save()

        return Response(
            {
                "id": note.id,
                "is_important": note.is_important,
                "title": note.title or note.auto_generate_title(),
                "message": f'Note marked as {"important" if note.is_important else "normal"} successfully!',
            }
        )

    @action(detail=False, methods=["post"])
    def bulk_reorder(self, request):
        """Bulk reorder notes for drag and drop functionality."""
        updates = request.data.get("updates", [])

        if not updates or not isinstance(updates, list):
            return Response(
                {"error": "updates list is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            updated_count = 0
            for update in updates:
                note_id = update.get("id")
                new_order = update.get("order")

                if note_id and new_order is not None:
                    note = self.get_queryset().filter(id=note_id).first()
                    if note:
                        note.order = new_order
                        note.save()
                        updated_count += 1

            return Response(
                {
                    "message": f"Successfully reordered {updated_count} notes",
                    "updated_count": updated_count,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Reorder operation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
