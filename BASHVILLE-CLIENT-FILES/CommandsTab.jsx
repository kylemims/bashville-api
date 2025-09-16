import { useState } from "react";
import { createCommand, updateCommand, deleteCommand } from "../../services/commandService.js";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import { CommandItem } from "./CommandItem.jsx";
import { NewCommandForm } from "./NewCommandForm.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./CommandsTab.css";

export const CommandsTab = ({
  project,
  availableCommands,
  onSave,
  onCommandsUpdate,
  showNewCommandForm,
  onNewCommandFormChange,
}) => {
  console.log(
    "  - availableCommands types:",
    availableCommands?.map((cmd) => ({ id: cmd.id, type: typeof cmd.id }))
  );

  const [selectedCommands, setSelectedCommands] = useState(project.commands_preview?.map((c) => c.id) || []);
  const [editingCommand, setEditingCommand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const projectCommands = project.commands_preview || [];

  const handleToggleCommand = async (commandId) => {
    const numericCommandId = typeof commandId === "string" ? parseInt(commandId) : commandId;

    const newSelected = selectedCommands.includes(numericCommandId)
      ? selectedCommands.filter((id) => id !== numericCommandId)
      : [...selectedCommands, numericCommandId];

    setSelectedCommands(newSelected);

    try {
      const updateData = { command_ids: newSelected };

      await onSave(updateData);
      setError("");
    } catch (err) {
      console.error("❌ FAILED:", err);
      setError(`Failed to update commands: ${err.message}`);
      setSelectedCommands(selectedCommands);
    }
  };
  const handleCreateCommand = async (commandData) => {
    try {
      setLoading(true);
      setError("");
      const newCommand = await createCommand(commandData);
      const updatedCommands = [...availableCommands, newCommand];
      onCommandsUpdate(updatedCommands);
      onNewCommandFormChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommand = async (commandId, commandData) => {
    try {
      setLoading(true);
      setError("");
      const updatedCommand = await updateCommand(commandId, commandData);
      const updatedCommands = availableCommands.map((cmd) => (cmd.id === commandId ? updatedCommand : cmd));
      onCommandsUpdate(updatedCommands);
      setEditingCommand(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromProject = async (commandId) => {
    try {
      setLoading(true);
      setError("");

      const newSelected = selectedCommands.filter((id) => id !== commandId);
      setSelectedCommands(newSelected);

      const updateData = { command_ids: newSelected };
      await onSave(updateData);

      setError("");
    } catch (err) {
      console.error("❌ Failed to remove command from project:", err);
      setError(`Failed to remove command from project: ${err.message}`);
      setSelectedCommands(selectedCommands);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromStash = async (commandId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this command from your stash? This cannot be undone."
      )
    )
      return;

    try {
      setLoading(true);
      setError("");
      await deleteCommand(commandId);
      const updatedCommands = availableCommands.filter((cmd) => cmd.id !== commandId);
      onCommandsUpdate(updatedCommands);

      if (selectedCommands.includes(commandId)) {
        const newSelected = selectedCommands.filter((id) => id !== commandId);
        setSelectedCommands(newSelected);
        await onSave({ command_ids: newSelected });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commands-tab">
      <div className="section-project">
        <div className="section-header">
          <h3 className="section-title">Project Commands</h3>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        {showNewCommandForm && (
          <NewCommandForm
            onSave={handleCreateCommand}
            onCancel={() => onNewCommandFormChange(false)}
            disabled={loading}
          />
        )}
        <div className="command-list">
          {projectCommands.length > 0 ? (
            projectCommands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                isEditing={editingCommand === command.id}
                onEdit={() => setEditingCommand(command.id)}
                onSave={(data) => handleUpdateCommand(command.id, data)}
                onCancel={() => setEditingCommand(null)}
                onDelete={() => handleRemoveFromProject(command.id)}
                disabled={loading}
              />
            ))
          ) : (
            <p className="empty-message">No commands in this project yet.</p>
          )}
        </div>
      </div>

      <div className="section-stash">
        <div className="command-header-row">
          <h3 className="section-title-available">Command Stash</h3>
          <div className="command-gradient-line"></div>
          <ActionButton
            variant="add-field"
            size="xs"
            onClick={() => onNewCommandFormChange(true)}
            // className="section-action-button"
            title="Add Model">
            <MaterialIcon icon="add" size={26} color="var(--muted)" />
          </ActionButton>
        </div>
        <div className="available-commands-grid">
          {availableCommands.length > 0 ? (
            availableCommands.map((command) => (
              <div key={command.id} className="available-command-wrapper">
                {editingCommand === command.id ? (
                  // ✅ Show CommandItem in edit mode
                  <CommandItem
                    command={command}
                    isEditing={true}
                    onEdit={() => setEditingCommand(command.id)}
                    onSave={(data) => handleUpdateCommand(command.id, data)}
                    onCancel={() => setEditingCommand(null)}
                    onDelete={() => handleDeleteFromStash(command.id)}
                    disabled={loading}
                  />
                ) : (
                  <div
                    className={`command-card-available ${
                      selectedCommands.includes(command.id) ? "selected" : ""
                    }`}
                    onClick={() => handleToggleCommand(command.id)}
                    role="button"
                    tabIndex={0}>
                    <div className="command-card-content">
                      <h4>{command.label}</h4>
                      <code>{command.command_text}</code>
                    </div>
                    <div className="command-card-actions">
                      <ActionButton
                        variant="edit"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCommand(command.id);
                        }}
                        disabled={loading}
                        aria-label={`Edit ${command.label}`}>
                        <span className="material-symbols-outlined available-edit text-lg">edit</span>{" "}
                      </ActionButton>
                      <ActionButton
                        variant="delete"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFromStash(command.id);
                        }}
                        disabled={loading}
                        aria-label={`Delete ${command.label}`}>
                        <span className="material-symbols-outlined available-delete text-lg">delete</span>{" "}
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-message">No commands available. Create your first command above!</p>
          )}
        </div>
      </div>
    </div>
  );
};
