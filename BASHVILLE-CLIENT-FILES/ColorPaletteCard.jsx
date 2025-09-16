import { useState } from "react";
import { ActionButton } from "../common/ActionButton.jsx";
import { ColorEditor } from "./ColorEditor.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./ColorPaletteCard.css";

export const ColorPaletteCard = ({
  palette,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onQuickColorEdit,
  disabled,
}) => {
  const [editingColor, setEditingColor] = useState(null);

  const colorFields = [
    { key: "primary_hex", name: "Primary", value: palette.primary_hex },
    { key: "secondary_hex", name: "Secondary", value: palette.secondary_hex },
    { key: "accent_hex", name: "Accent", value: palette.accent_hex },
    { key: "background_hex", name: "Background", value: palette.background_hex },
  ];

  const handleQuickColorSave = async (colorKey, newHexValue) => {
    if (onQuickColorEdit) {
      try {
        await onQuickColorEdit(palette.id, { [colorKey]: newHexValue });
        setEditingColor(null);
      } catch (error) {
        console.error("Failed to update color:", error);
      }
    }
  };

  return (
    <div className={`color-palette-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="palette-header">
        <h3 className="palette-name">{palette.name}</h3>
        {isSelected && (
          <div className="selection-indicator">
            <MaterialIcon icon="check_circle" size={16} />
            <span>Current Palette</span>
          </div>
        )}
        <div className="palette-actions">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            variant="edit"
            size="xs"
            disabled={disabled}
            aria-label={`Edit ${palette.name}`}>
            <span className="material-symbols-outlined available-edit">edit_square</span>{" "}
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            variant="delete"
            size="xs"
            disabled={disabled}
            aria-label={`Delete ${palette.name}`}>
            <span className="material-symbols-outlined available-delete">delete</span>{" "}
          </ActionButton>
        </div>
      </div>

      <div className="color-banner">
        {colorFields.map((color) => (
          <div
            key={color.key}
            className="color-segment"
            style={{ backgroundColor: color.value }}
            title={`${color.name}: ${color.value}`}
          />
        ))}
      </div>

      <div className="color-details">
        {colorFields.map((color) => (
          <div key={color.key} className="color-detail-item">
            {editingColor === color.key ? (
              <ColorEditor
                colorName={color.name}
                colorValue={color.value}
                onSave={(newHex) => handleQuickColorSave(color.key, newHex)}
                onCancel={() => setEditingColor(null)}
                disabled={disabled}
              />
            ) : (
              <div
                className="color-info"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingColor(color.key);
                }}>
                <div className="color-info-header">
                  <div className="color-dot" style={{ backgroundColor: color.value }} />
                  <span className="color-name">{color.name}</span>
                </div>
                <div className="color-hex">{color.value}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
