// Enhanced ColorPaletteForm.jsx with Live Preview
// Replace your existing ColorPaletteForm.jsx with this enhanced version

import { useState, useEffect } from "react";
import { FormField } from "../common/FormField.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import "./ColorPaletteForm.css";
import "./ColorPaletteCard.css";
import "./ColorEditor.css";

const DEFAULT_COLORS = {
  name: "",
  primary_hex: "#fee394",
  secondary_hex: "#d46a6a",
  accent_hex: "#46cba7",
  background_hex: "#0c0806",
  ui_hex: "#ffffff", // NEW: Add UI color
};

// Live Preview Component
const LivePreview = ({ colors }) => {
  useEffect(() => {
    // Update CSS custom properties for live preview
    const root = document.documentElement;
    root.style.setProperty("--preview-primary", colors.primary_hex);
    root.style.setProperty("--preview-secondary", colors.secondary_hex);
    root.style.setProperty("--preview-accent", colors.accent_hex);
    root.style.setProperty("--preview-background", colors.background_hex);
    root.style.setProperty("--preview-ui", colors.ui_hex);
  }, [colors]);

  return (
    <div className="live-preview-container">
      <h4>Live Preview</h4>
      <div className="color-preview-container" id="colorPreview">
        {/* Navigation Bar */}
        <div className="color-preview-navbar">
          <div className="color-preview-logo">Your App</div>
          <div className="color-preview-nav-links">
            <a href="#" className="color-preview-nav-link">
              Home
            </a>
            <a href="#" className="color-preview-nav-link">
              About
            </a>
            <a href="#" className="color-preview-nav-link">
              Contact
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="color-preview-content">
          {/* Hero Section */}
          <div className="color-preview-hero">
            <h2>Welcome to Your App</h2>
            <p>Your custom color palette in action</p>
            <div className="color-preview-buttons">
              <button className="color-preview-btn btn-primary">Primary</button>
              <button className="color-preview-btn btn-secondary">Secondary</button>
              <button className="color-preview-btn btn-accent">Accent</button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="color-preview-cards">
            <div className="color-preview-card">
              <h4>Navigation & Cards</h4>
              <p>UI elements use your custom color</p>
            </div>
            <div className="color-preview-card">
              <h4>Forms & Modals</h4>
              <p>Clean, consistent styling</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="color-preview-footer">Generated with Bash Stash</div>
      </div>
    </div>
  );
};

export const ColorPaletteForm = ({ palette, onSubmit, onCancel, disabled, isEditing = false }) => {
  const [formData, setFormData] = useState(palette || DEFAULT_COLORS);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  const colorFields = [
    {
      name: "primary_hex",
      label: "Primary",
      placeholder: "#fee394",
      description: "Main brand color for buttons and highlights",
    },
    {
      name: "secondary_hex",
      label: "Secondary",
      placeholder: "#d46a6a",
      description: "Secondary accent and gradients",
    },
    {
      name: "accent_hex",
      label: "Accent",
      placeholder: "#46cba7",
      description: "Call-to-action and emphasis",
    },
    {
      name: "background_hex",
      label: "Background",
      placeholder: "#0c0806",
      description: "Page background color",
    },
    { name: "ui_hex", label: "UI Elements", placeholder: "#ffffff", description: "Cards, navigation, forms" }, // NEW
  ];

  return (
    <div className="palette-form-container">
      <h3>{isEditing ? "Edit Color Palette" : "Create New Color Palette"}</h3>

      <div className="palette-form-with-preview">
        <form onSubmit={handleSubmit} className="palette-form">
          <FormField
            label="Palette Name"
            type="text"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            placeholder="Dark Theme Magic"
            required
            disabled={disabled}
            autoFocus={!isEditing}
          />

          <div className="color-fields-grid">
            {colorFields.map((field) => (
              <div key={field.name} className="color-field">
                <div className="color-field-header">
                  <FormField
                    label={field.label}
                    type="color"
                    value={formData[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    disabled={disabled}
                  />
                  <FormField
                    type="text"
                    value={formData[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    className="hex-input"
                  />
                </div>
                <p className="color-field-description">{field.description}</p>
              </div>
            ))}
          </div>

          <div className="palette-preview-live">
            <h4>Color Swatches</h4>
            <div className="color-swatch-row">
              {colorFields.map((field) => (
                <div key={field.name} className="color-swatch-item">
                  <div
                    className={`color-swatch ${field.name.replace("_hex", "")}`}
                    style={{ backgroundColor: formData[field.name] }}
                    title={`${field.label}: ${formData[field.name]}`}
                  />
                  <span className="color-swatch-label">{field.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <ActionButton type="submit" variant="primary" disabled={disabled || !formData.name.trim()}>
              {isEditing ? "Update Palette" : "Create Palette"}
            </ActionButton>
            <ActionButton type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
              Cancel
            </ActionButton>
          </div>
        </form>

        {/* Live Preview */}
        <LivePreview colors={formData} />
      </div>
    </div>
  );
};
