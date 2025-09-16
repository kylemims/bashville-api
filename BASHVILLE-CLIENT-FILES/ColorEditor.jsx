import { useState } from "react";
import { ActionButton } from "../common/ActionButton.jsx";
import { validateHex } from "../../utils/validateHex.js";
import { FormField } from "../common/FormField.jsx";
import "./ColorEditor.css";
import "./ColorPaletteForm.css";
import "./ColorPaletteCard.css";

export const ColorEditor = ({ colorName, colorValue, onSave, onCancel, disabled = false }) => {
  const [hexValue, setHexValue] = useState(colorValue);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!validateHex(hexValue)) {
      setError("Please enter a valid hex color (e.g., #FF5733)");
      return;
    }
    setError("");
    onSave(hexValue.toUpperCase());
  };

  const handleHexChange = (value) => {
    let formattedValue = value;
    if (!formattedValue.startsWith("#")) {
      value = "#" + value;
    }
    setHexValue(value);
    setError("");
  };

  return (
    <div className="color-editor">
      <div className="color-editor-preview">
        <div
          className="color-swatch"
          style={{ backgroundColor: validateHex(hexValue) ? hexValue : "#cccccc" }}
        />
        <span className="color-name">{colorName}</span>
      </div>
      <div className="color-editor-input">
        {/* <input
          type="text"
          value={hexValue}
          onChange={handleInputChange}
          className={`hex-input ${error ? "error" : ""}`}
          placeholder="#FFFFFF"
          maxLength={7}
          disabled={disabled}
        /> */}
        <div className="color-field">
          <FormField
            type="color"
            value={hexValue}
            onChange={(value) => handleHexChange(value)}
            disabled={disabled}
            aria-label={`${colorName} color picker`}
          />
          <FormField
            type="text"
            value={hexValue}
            onChange={(value) => handleHexChange(value)}
            placeholder="#FFFFFF"
            disabled={disabled}
            className={`hex-input ${error ? "error" : ""}`}
            maxLength={7}
          />
        </div>
        {error && <span className="error-message">{error}</span>}
      </div>
      <div className="color-editor-actions">
        <ActionButton onClick={handleSave} variant="primary" size="sm" disabled={disabled}>
          ✓
        </ActionButton>
        <ActionButton onClick={onCancel} variant="secondary" size="sm" disabled={disabled}>
          ✕
        </ActionButton>
      </div>
    </div>
  );
};
