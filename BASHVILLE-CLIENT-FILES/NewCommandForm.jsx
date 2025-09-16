import { useState } from "react";
import { ActionButton } from "../common/ActionButton.jsx";
import { FormField } from "../common/FormField.jsx";
import "./NewCommandForm.css";

export const NewCommandForm = ({ onSave, onCancel, disabled }) => {
  const [formData, setFormData] = useState({
    label: "",
    command_text: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.label.trim() && formData.command_text.trim()) {
      onSave(formData);
      setFormData({ label: "", command_text: "" });
    }
  };

  const isFormValid = formData.label.trim() && formData.command_text.trim();

  return (
    <div className="new-command-form">
      <h3>Add New Command</h3>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Command Label"
          type="text"
          value={formData.label}
          onChange={(value) => setFormData({ ...formData, label: value })}
          placeholder="e.g., 'Install Dependencies'"
          required
          disabled={disabled}
          autoFocus
        />

        <FormField
          label="Command Text"
          type="text"
          value={formData.command_text}
          onChange={(value) => setFormData({ ...formData, command_text: value })}
          placeholder="e.g., 'npm install'"
          required
          disabled={disabled}
        />

        <div className="form-actions">
          <ActionButton type="submit" variant="primary" disabled={disabled || !isFormValid}>
            Add Command
          </ActionButton>
          <ActionButton type="button" onClick={onCancel} variant="secondary" disabled={disabled}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </div>
  );
};
