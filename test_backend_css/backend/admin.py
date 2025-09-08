# bashvilleapi/codegen/templates/django/admin.py.j2
from django.contrib import admin
from .models import BlogPost, Category
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'content', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['title', 'content', ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """Show user context in admin."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            # Non-superusers only see their own data
            return qs.filter(user=request.user)
        return qs
    
    def save_model(self, request, obj, form, change):
        """Auto-assign user for new objects."""
        if not change:  # Only for new objects
            obj.user = request.user
        super().save_model(request, obj, form, change)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['name', 'description', ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        """Show user context in admin."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            # Non-superusers only see their own data
            return qs.filter(user=request.user)
        return qs
    
    def save_model(self, request, obj, form, change):
        """Auto-assign user for new objects."""
        if not change:  # Only for new objects
            obj.user = request.user
        super().save_model(request, obj, form, change)

