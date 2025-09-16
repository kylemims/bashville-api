import { useState } from "react";
import {
  createColorPalette,
  updateColorPalette,
  deleteColorPalette,
} from "../../services/colorPaletteService";
import { ColorPaletteForm } from "./ColorPaletteForm";
import { ColorPaletteCard } from "./ColorPaletteCard";
import { ErrorMessage } from "../common/ErrorMessage";
import { HoverTooltip } from "../common/HoverTooltip.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";

export const ColorsTab = ({
  project,
  availablePalettes,
  onSave,
  onPalettesUpdate,
  showNewPaletteForm,
  onNewPaletteFormChange,
}) => {
  const [selectedPaletteId, setSelectedPaletteId] = useState(project.color_palette?.id || null);
  const [editingPalette, setEditingPalette] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentPalette = project.color_palette_preview;

  const handleQuickColorEdit = async (paletteId, colorUpdate) => {
    try {
      setLoading(true);
      const palette = availablePalettes.find((p) => p.id === paletteId);
      const updatedPaletteData = { ...palette, ...colorUpdate };

      const updatedPalette = await updateColorPalette(paletteId, updatedPaletteData);
      const updatedPalettes = availablePalettes.map((palette) =>
        palette.id === paletteId ? updatedPalette : palette
      );

      onPalettesUpdate(updatedPalettes);

      // If this is the current project's palette, refresh the project
      if (project.color_palette?.id === paletteId) {
        // The project data will be refreshed automatically by the parent component
      }
    } catch (err) {
      setError(`Failed to update color: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPalette = async (paletteId) => {
    try {
      setSelectedPaletteId(paletteId);
      await onSave({ color_palette: paletteId });
    } catch (err) {
      setError(`Failed to update color palette: ${err.message}`);
    }
  };

  const handleCreatePalette = async (paletteData) => {
    try {
      setLoading(true);
      const newPalette = await createColorPalette(paletteData);
      const updatedPalettes = [...availablePalettes, newPalette];
      onPalettesUpdate(updatedPalettes);
      onNewPaletteFormChange(false);
      await handleSelectPalette(newPalette.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePalette = async (paletteId, paletteData) => {
    try {
      setLoading(true);
      const updatedPalette = await updateColorPalette(paletteId, paletteData);
      const updatedPalettes = availablePalettes.map((palette) =>
        palette.id === paletteId ? updatedPalette : palette
      );
      onPalettesUpdate(updatedPalettes);
      setEditingPalette(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePalette = async (paletteId) => {
    if (!window.confirm("Are you sure you want to delete this color palette?")) return;

    try {
      setLoading(true);
      await deleteColorPalette(paletteId);
      const updatedPalettes = availablePalettes.filter((palette) => palette.id !== paletteId);
      onPalettesUpdate(updatedPalettes);

      if (selectedPaletteId === paletteId) {
        setSelectedPaletteId(null);
        await onSave({ color_palette: null });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="colors-tab">
      <div className="section">
        <div className="command-header-row">
          <h3 className="section-title-available">Project Colors</h3>
          <div className="command-gradient-line"></div>
        </div>

        <ErrorMessage message={error} />

        {currentPalette && (
          <div className="current-palette">
            <ColorPaletteCard
              palette={currentPalette}
              isSelected={true}
              onEdit={() => setEditingPalette(currentPalette.id)}
              onDelete={() => handleDeletePalette(currentPalette.id)}
              onQuickColorEdit={handleQuickColorEdit}
              disabled={loading}
            />
          </div>
        )}

        {showNewPaletteForm && (
          <ColorPaletteForm
            onSubmit={handleCreatePalette}
            onCancel={() => onNewPaletteFormChange(false)}
            disabled={loading}
          />
        )}

        {editingPalette && (
          <ColorPaletteForm
            palette={availablePalettes.find((p) => p.id === editingPalette)}
            onSubmit={(data) => handleUpdatePalette(editingPalette, data)}
            onCancel={() => setEditingPalette(null)}
            disabled={loading}
            isEditing
          />
        )}
      </div>

      <div className="section">
        <div className="command-header-row">
          <h3 className="section-title-available">Available Palettes</h3>
          <div className="command-gradient-line"></div>

          <HoverTooltip
            tooltipContent="Add New Palette"
            onClick={() => onNewPaletteFormChange(true)}
            className="add-palette-tooltip">
            <ActionButton variant="add-field" size="xs" onClick={() => onNewPaletteFormChange(true)}>
              <MaterialIcon icon="add" size={26} color="var(--muted)" />
            </ActionButton>
          </HoverTooltip>
        </div>
        <div className="palette-grid">
          {availablePalettes.map((palette) => (
            <ColorPaletteCard
              key={palette.id}
              palette={palette}
              isSelected={selectedPaletteId === palette.id}
              onClick={() => handleSelectPalette(palette.id)}
              onEdit={() => setEditingPalette(palette.id)}
              onDelete={() => handleDeletePalette(palette.id)}
              onQuickColorEdit={handleQuickColorEdit}
              disabled={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
