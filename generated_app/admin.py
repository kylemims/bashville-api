from django.contrib import admin
from .models import Author, Book


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "email")
    search_fields = ("first_name", "last_name", "email")


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "published", "author")
    list_filter = ("published",)
    search_fields = ("title", "author__last_name")
