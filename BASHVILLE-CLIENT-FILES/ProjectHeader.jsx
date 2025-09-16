import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { useState, useEffect } from "react";
import "./ProjectHeader.css";

export const ProjectHeader = ({ title, onBack, onGenerateSetup, onProjectDelete, onProjectUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleEditStart = () => {
    setEditTitle(title);
    setIsEditing(true);
    setError("");
  };
  useEffect(() => {
    if (!isEditing) setEditTitle(title);
  }, [title, isEditing]);

  const handleEditCancel = () => {
    setEditTitle(title);
    setIsEditing(false);
    setError("");
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    if (editTitle.trim() === title.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onProjectUpdate({ title: editTitle.trim() });
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update project name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  return (
    <div className="project-header">
      <div className="back-button-section">
        <ActionButton onClick={onBack} variant="bgsecondary" size="sm" aria-label="Back to Dashboard">
          <MaterialIcon icon="arrow_back" size={16} />
        </ActionButton>
      </div>

      <div className="header-main-row">
        <div className="project-title-section">
          {isEditing ? (
            <div className="project-title-edit">
              <input
                type="text"
                aria-label="Project name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`project-title-input ${error ? "error" : ""}`}
                placeholder="Enter project name"
                disabled={isUpdating}
                autoFocus
                maxLength={100}
              />
              <div className="title-edit-actions">
                <ActionButton
                  onClick={handleEditSave}
                  variant="primary"
                  size="sm"
                  disabled={isUpdating || !editTitle.trim()}
                  title="Save (Enter)">
                  {isUpdating ? (
                    <MaterialIcon icon="hourglass_empty" size={16} />
                  ) : (
                    <MaterialIcon icon="check" size={16} />
                  )}
                </ActionButton>
                <ActionButton
                  onClick={handleEditCancel}
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  title="Cancel (Esc)">
                  <MaterialIcon icon="close" size={16} />
                </ActionButton>
              </div>
              {error && <span className="title-edit-error">{error}</span>}
            </div>
          ) : (
            <h1 className="project-title">{title}</h1>
          )}
        </div>

        <div className="project-actions">
          <ActionButton
            onClick={onGenerateSetup}
            variant="accent"
            size="sm"
            aria-label="Generate Setup Script & README"
            disabled={isEditing}>
            <MaterialIcon icon="markdown" size={24} />
          </ActionButton>
          <ActionButton
            onClick={handleEditStart}
            variant="back"
            size="sm"
            title="Edit project name"
            aria-label="Edit project name"
            disabled={isEditing}>
            <MaterialIcon icon="edit_square" size={24} />
          </ActionButton>
          <ActionButton
            onClick={onProjectDelete}
            variant="back-secondary"
            size="sm"
            aria-label="Delete Project"
            disabled={isEditing}>
            <MaterialIcon icon="delete" size={24} />
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
