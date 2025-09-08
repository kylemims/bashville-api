// Color Palette Live Preview - JavaScript
// Add this to your Bash Stash client-side JavaScript

class ColorPreview {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.colors = {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#06b6d4",
      background: "#f8fafc",
      ui: "#ffffff",
    };
  }

  updateColors(newColors) {
    // Update internal color state
    this.colors = { ...this.colors, ...newColors };

    // Update CSS custom properties
    const root = document.documentElement;
    root.style.setProperty("--preview-primary", this.colors.primary);
    root.style.setProperty("--preview-secondary", this.colors.secondary);
    root.style.setProperty("--preview-accent", this.colors.accent);
    root.style.setProperty("--preview-background", this.colors.background);
    root.style.setProperty("--preview-ui", this.colors.ui);

    // Update data attributes for CSS targeting
    this.container.setAttribute("data-primary-color", this.colors.primary);
    this.container.setAttribute("data-secondary-color", this.colors.secondary);
    this.container.setAttribute("data-accent-color", this.colors.accent);
    this.container.setAttribute("data-background-color", this.colors.background);
    this.container.setAttribute("data-ui-color", this.colors.ui);
  }

  updateSingleColor(colorType, hexValue) {
    this.updateColors({ [colorType]: hexValue });
  }
}

// Usage Example:
// Initialize the preview
const preview = new ColorPreview("colorPreview");

// Update when user changes color inputs
function handleColorChange(colorType, hexValue) {
  preview.updateSingleColor(colorType, hexValue);
}

// Update all colors at once (useful when loading saved palette)
function loadPalette(palette) {
  preview.updateColors({
    primary: palette.primary_hex,
    secondary: palette.secondary_hex,
    accent: palette.accent_hex,
    background: palette.background_hex,
    ui: palette.ui_hex,
  });
}

// Integration with your color picker inputs:
/*
// Example integration with your existing color inputs
document.getElementById('primaryColorInput').addEventListener('input', (e) => {
  handleColorChange('primary', e.target.value);
});

document.getElementById('secondaryColorInput').addEventListener('input', (e) => {
  handleColorChange('secondary', e.target.value);
});

document.getElementById('accentColorInput').addEventListener('input', (e) => {
  handleColorChange('accent', e.target.value);
});

document.getElementById('backgroundColorInput').addEventListener('input', (e) => {
  handleColorChange('background', e.target.value);
});

document.getElementById('uiColorInput').addEventListener('input', (e) => {
  handleColorChange('ui', e.target.value);
});
*/
