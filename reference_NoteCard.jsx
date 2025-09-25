import { useState } from "react";
import { updateNote } from "../../services/noteService";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { FormField } from "../common/FormField.jsx";
import { PriorityPill } from "../common/PriorityPill.jsx";
import { NoteContent } from "../common/NoteContent.jsx";
import "../common/FormField.css";
import "./NoteCard.css";

export const NoteCard = ({
  note,
  onUpdate,
  onDelete,
  onToggleCompletion,
  onToggleArchived,
  onToggleImportant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: note.title || "",
    content: note.content || "",
    category: note.category || "note",
    priority_level: note.priority_level || "medium",
    custom_tags: Array.isArray(note.custom_tags) ? note.custom_tags.join(", ") : "",
    is_important: note.is_important || false,
    project: note.project || null,
  });

  // Category display configurations
  const categoryConfig = {
    bug: { icon: "bug_report", color: "var(--color-secondary)", label: "Bug" },
    todo: { icon: "task_alt", color: "var(--color-accent)", label: "Todo" },
    wishlist: { icon: "star", color: "var(--color-primary)", label: "Wishlist" },
    code: { icon: "code", color: "var(--muted)", label: "Code" },
    question: { icon: "help", color: "var(--color-accent)", label: "Question" },
    reminder: { icon: "schedule", color: "var(--color-primary)", label: "Reminder" },
    note: { icon: "note", color: "var(--text)", label: "Note" },
    other: { icon: "note", color: "var(--text)", label: "Note" },
  };

  const config = categoryConfig[note.category] || categoryConfig.other;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      const updateData = {
        ...formData,
        custom_tags: formData.custom_tags
          ? formData.custom_tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      console.log("📝 Updating note with data:", updateData);
      const updatedNote = await updateNote(note.id, updateData);
      console.log("📝 Received updated note:", updatedNote);

      onUpdate(updatedNote);
      setIsEditing(false);
      console.log("✅ Note updated successfully");
    } catch (err) {
      console.error("❌ Failed to update note:", err);
      setError(`Failed to update note: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: note.title || "",
      content: note.content || "",
      category: note.category || "note",
      priority_level: note.priority_level || "medium",
      custom_tags: Array.isArray(note.custom_tags) ? note.custom_tags.join(", ") : "",
      is_important: note.is_important || false,
      project: note.project || null,
    });
    setIsEditing(false);
    setError("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="note-edit-form">
          <FormField
            label="Title (Optional)"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            placeholder="Enter a title for this note..."
            disabled={loading}
          />

          <FormField
            label="Content"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            type="textarea"
            placeholder="Write your note content..."
            rows={6}
            required
            disabled={loading}
          />

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                disabled={loading}>
                <option value="other">General Note</option>
                <option value="todo">Todo</option>
                <option value="bug">Bug</option>
                <option value="wishlist">Wishlist</option>
                <option value="code">Code Snippet</option>
                <option value="question">Question</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority_level}
                onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                className="input"
                disabled={loading}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="importance-toggle">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  disabled={loading}
                />
                <span>Mark as Important</span>
              </label>
            </div>
          </div>

          <FormField
            label="Tags"
            value={formData.custom_tags}
            onChange={(value) => setFormData({ ...formData, custom_tags: value })}
            placeholder="Enter tags separated by commas (e.g., frontend, api, urgent)"
            disabled={loading}
          />

          {error && <div className="error-message">{error}</div>}

          <div className="edit-actions">
            <ActionButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={loading || !(formData.content || "").trim()}>
              <MaterialIcon icon="check_circle" size={18} />
              Save
            </ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={handleCancel} disabled={loading}>
              <MaterialIcon icon="cancel" size={18} />
              Cancel
            </ActionButton>
          </div>
        </div>
      );
    }

    return (
      <div className="note-content">
        {/* Note Header */}
        <div className="note-header">
          <div className="note-meta">
            <div className="category-badge" style={{ color: config.color }}>
              <MaterialIcon icon={config.icon} size={16} />
              <span>{config.label}</span>
            </div>

            {/* Priority Pill */}
            <PriorityPill priority_level={note.priority_level || "medium"} size="xs" />

            <div className="note-indicators">
              {note.is_important && (
                <MaterialIcon
                  icon="priority_high"
                  size={16}
                  color="var(--color-secondary)"
                  title="Important"
                />
              )}
              {note.is_completed && (
                <MaterialIcon icon="check_circle" size={16} color="var(--color-accent)" title="Completed" />
              )}
              {note.is_archived && (
                <MaterialIcon icon="archive" size={16} color="var(--muted)" title="Archived" />
              )}
            </div>
          </div>

          <div className="note-timestamp">{formatDate(note.updated_at)}</div>
        </div>

        {/* Note Title */}
        {note.title && <h4 className="note-title">{note.title}</h4>}

        {/* Note Content */}
        <div className="note-text">
          <NoteContent
            content={note.content}
            onContentUpdate={async (newContent) => {
              try {
                const updatedNote = await updateNote(note.id, {
                  ...note,
                  content: newContent,
                });
                onUpdate(updatedNote);
                console.log("✅ Checkbox updated successfully");
              } catch (err) {
                console.error("❌ Failed to update checkbox:", err);
              }
            }}
            isExpanded={isExpanded}
            maxLength={150}
          />

          {note.content && note.content.length > 150 && (
            <button className="expand-toggle" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Tags */}
        {note.custom_tags && note.custom_tags.length > 0 && (
          <div className="note-tags">
            {note.custom_tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Project Link */}
        {note.project && note.project_title && (
          <div className="note-project">
            <MaterialIcon icon="folder" size={14} />
            <span>{note.project_title}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`note-card ${note.is_completed ? "completed" : ""} ${note.is_archived ? "archived" : ""}`}>
      {renderContent()}

      {/* Actions Bar */}
      {!isEditing && (
        <div className="note-actions">
          <div className="primary-actions">
            <ActionButton
              variant="secondary"
              size="xs"
              onClick={onToggleCompletion}
              title={note.is_completed ? "Mark as incomplete" : "Mark as completed"}>
              <MaterialIcon
                icon={note.is_completed ? "radio_button_checked" : "radio_button_unchecked"}
                size={16}
              />
            </ActionButton>

            <ActionButton
              variant="secondary"
              size="xs"
              onClick={onToggleImportant}
              title={note.is_important ? "Remove importance" : "Mark as important"}>
              <MaterialIcon
                icon={note.is_important ? "star" : "star_border"}
                size={16}
                color={note.is_important ? "var(--color-secondary)" : undefined}
              />
            </ActionButton>

            <ActionButton variant="edit" size="xs" onClick={() => setIsEditing(true)} title="Edit note">
              <MaterialIcon icon="edit" size={16} />
            </ActionButton>
          </div>

          <div className="secondary-actions">
            <ActionButton
              variant="secondary"
              size="xs"
              onClick={onToggleArchived}
              title={note.is_archived ? "Unarchive" : "Archive"}>
              <MaterialIcon icon={note.is_archived ? "unarchive" : "archive"} size={16} />
            </ActionButton>

            <ActionButton variant="delete" size="xs" onClick={onDelete} title="Delete note">
              <MaterialIcon icon="delete" size={16} />
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
