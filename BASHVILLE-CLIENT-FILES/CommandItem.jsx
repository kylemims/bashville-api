import { useState } from "react";
import "./CommandItem.css";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";

export const CommandItem = ({ command, isEditing, onEdit, onSave, onCancel, onDelete, disabled }) => {
  const [formData, setFormData] = useState({
    label: command.label,
    command_text: command.command_text,
  });

  const handleSave = () => {
    if (formData.label.trim() && formData.command_text.trim()) {
      onSave(formData);
    }
  };

  if (isEditing) {
    return (
      <div className="command-item editing">
        <div className="command-edit-form">
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="edit-input"
            placeholder="Command label"
            disabled={disabled}
          />
          <input
            type="text"
            value={formData.command_text}
            onChange={(e) => setFormData({ ...formData, command_text: e.target.value })}
            className="edit-input"
            placeholder="Command text"
            disabled={disabled}
          />
          <div className="edit-actions">
            <ActionButton onClick={handleSave} variant="primary" size="sm" disabled={disabled}>
              <MaterialIcon
                icon="check_circle"
                size={22}
                color="var(--color-secondary)"
                className="hover-primary"
              />
            </ActionButton>
            <ActionButton onClick={onCancel} variant="secondary" size="sm" disabled={disabled}>
              <MaterialIcon icon="cancel" size={22} color="var(--color-primary)" className="hover-primary" />
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="command-item">
      <div className="command-content">
        <div className="command-label">{command.label}</div>
        <div className="command-text">{command.command_text}</div>
      </div>
      <div className="command-actions">
        <ActionButton onClick={onEdit} variant="edit" size="xs" disabled={disabled}>
          <MaterialIcon icon="edit" size={20} color="var(--muted)" className="hover-primary" />
        </ActionButton>
        <ActionButton onClick={onDelete} variant="delete" size="xs" disabled={disabled}>
          <MaterialIcon icon="delete" size={20} color="var(--color-secondary)" className="hover-primary" />
        </ActionButton>
      </div>
    </div>
  );
};
