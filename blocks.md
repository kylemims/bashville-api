# Backend Changes for Block-Based Notes

## 1. Update Note Model (bashvilleapi/models/note.py)

Replace the content field with a blocks field:

```python
# Replace this line:
content = models.TextField(help_text="The main note content")

# With this:
blocks = models.JSONField(
    default=list,
    help_text="Content blocks (text, checklist, code, etc.)"
)

# Also add a helper property for backward compatibility:
@property
def content(self):
    """Backward compatibility - return combined block content"""
    if not self.blocks:
        return ""
    
    content_parts = []
    for block in self.blocks:
        if block['type'] == 'text':
            content_parts.append(block['content'])
        elif block['type'] == 'checklist':
            for item in block['items']:
                status = '[x]' if item['completed'] else '[ ]'
                content_parts.append(f"- {status} {item['text']}")
        elif block['type'] == 'code':
            content_parts.append(f"```{block.get('language', '')}\n{block['content']}\n```")
    
    return '\n\n'.join(content_parts)
```

## 2. Update Serializer (bashvilleapi/serializers/note.py)

Replace 'content' with 'blocks' in fields list:

```python
fields = [
    "id",
    "title", 
    "blocks",  # Changed from "content"
    "category",
    "category_display",
    "priority_level",
    # ... rest of fields
]
```

## 3. Block Data Structure

The blocks array will contain objects like:

```json
[
  {
    "id": "block-1",
    "type": "text", 
    "content": "General text content here...",
    "order": 0
  },
  {
    "id": "block-2",
    "type": "checklist",
    "items": [
      {"id": "item-1", "text": "First task", "completed": false},
      {"id": "item-2", "text": "Done task", "completed": true}
    ],
    "order": 1
  },
  {
    "id": "block-3", 
    "type": "code",
    "language": "javascript",
    "content": "function hello() {\n  console.log('world');\n}",
    "order": 2
  }
]
```

## 4. Migration

```python
# Create migration: 0008_note_blocks.py
from django.db import migrations, models

def migrate_content_to_blocks(apps, schema_editor):
    Note = apps.get_model('bashvilleapi', 'Note')
    for note in Note.objects.all():
        if note.content and not note.blocks:
            # Convert existing content to a single text block
            note.blocks = [{
                "id": "block-1",
                "type": "text",
                "content": note.content,
                "order": 0
            }]
            note.save()

class Migration(migrations.Migration):
    dependencies = [
        ('bashvilleapi', '0007_note_priority_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='note',
            name='blocks',
            field=models.JSONField(default=list, help_text='Content blocks'),
        ),
        migrations.RunPython(migrate_content_to_blocks),
    ]
```

## 5. After Migration

Once you run the migration, you can remove the old content field in a follow-up migration if desired.