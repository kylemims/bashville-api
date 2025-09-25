import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NoteCard } from "../tabs/NoteCard.jsx";
import { MaterialIcon } from "./MaterialIcon.jsx";
import "./SortableNoteCard.css";

export const SortableNoteCard = ({ 
  note, 
  isDragging, 
  onUpdate, 
  onDelete,
  onToggleCompletion,
  onToggleArchived,
  onToggleImportant 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`sortable-note-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <MaterialIcon icon="drag_indicator" size={20} color="var(--muted)" />
      </div>
      
      <div className="note-card-content">
        <NoteCard
          note={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onToggleArchived={onToggleArchived}
          onToggleImportant={onToggleImportant}
        />
      </div>
    </div>
  );
};