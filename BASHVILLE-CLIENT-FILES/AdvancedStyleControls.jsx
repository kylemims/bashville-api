import { useState } from "react";
import "./AdvancedStyleControls.css";
import { isContrastAccessible, getBestTextColor } from "../../utils/colorUtils";

// Advanced style controls for developer-friendly customization
export const AdvancedStyleControls = ({ formData, onStyleChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState("layout");
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current style preferences with defaults
  const stylePrefs = formData?.style_preferences || {};
  const getStyleValue = (key, defaultValue) => stylePrefs[key] || defaultValue;

  // Shared helper function for getting component overrides
  const getComponentOverride = (component, property) => {
    return stylePrefs?.component_overrides?.[component]?.[property] || null;
  };

  // Handle style preference changes
  const handleStyleChange = (key, value) => {
    const newPrefs = { ...stylePrefs, [key]: value };
    onStyleChange(newPrefs);
  };

  // Handle component override changes
  const handleComponentOverride = (component, property, value) => {
    const currentOverrides = stylePrefs?.component_overrides || {};
    const componentOverrides = currentOverrides[component] || {};

    const newOverrides = {
      ...currentOverrides,
      [component]: {
        ...componentOverrides,
        [property]: value || null,
      },
    };

    // Clean up null values
    Object.keys(newOverrides).forEach((comp) => {
      Object.keys(newOverrides[comp]).forEach((prop) => {
        if (!newOverrides[comp][prop]) {
          delete newOverrides[comp][prop];
        }
      });
      if (Object.keys(newOverrides[comp]).length === 0) {
        delete newOverrides[comp];
      }
    });

    const newPrefs = {
      ...stylePrefs,
      component_overrides: newOverrides,
    };
    onStyleChange(newPrefs);
  };

  // Check if gradient causes contrast issues
  const hasGradientContrastIssues = () => {
    if (getStyleValue("hero_style", "gradient") !== "gradient") return false;

    const primaryText = getBestTextColor(formData?.primary_hex || "#3b82f6");
    const secondaryText = getBestTextColor(formData?.secondary_hex || "#1e40af");

    // Check if buttons will have contrast issues on gradient
    const primaryContrast = isContrastAccessible(primaryText, formData?.primary_hex);
    const secondaryContrast = isContrastAccessible(secondaryText, formData?.secondary_hex);

    return !primaryContrast || !secondaryContrast;
  };

  const tabs = [
    { id: "layout", label: "Layout", icon: "🎨" },
    { id: "hero", label: "Hero", icon: "🌟" },
    { id: "components", label: "Components", icon: "🧩" },
    { id: "developer", label: "Developer", icon: "⚡" },
  ];

  return (
    <div className={`advanced-style-controls ${className}`}>
      <div className="controls-header">
        <button
          className="controls-toggle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-expanded={isExpanded}
          type="button">
          <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
          <span className="toggle-label">Advanced Styling</span>
          {hasGradientContrastIssues() && (
            <span className="contrast-alert" title="Gradient may cause contrast issues">
              ⚠️
            </span>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="controls-content">
          <div className="controls-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
                type="button">
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="controls-panel">
            {activeTab === "layout" && (
              <LayoutControls stylePrefs={stylePrefs} onStyleChange={handleStyleChange} />
            )}

            {activeTab === "hero" && (
              <HeroControls
                formData={formData}
                stylePrefs={stylePrefs}
                onStyleChange={handleStyleChange}
                onComponentOverride={handleComponentOverride}
                hasContrastIssues={hasGradientContrastIssues()}
                getComponentOverride={getComponentOverride}
              />
            )}

            {activeTab === "components" && (
              <ComponentControls
                formData={formData}
                onComponentOverride={handleComponentOverride}
                getComponentOverride={getComponentOverride}
              />
            )}

            {activeTab === "developer" && (
              <DeveloperControls stylePrefs={stylePrefs} onStyleChange={handleStyleChange} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Layout controls for overall styling
const LayoutControls = ({ stylePrefs, onStyleChange }) => {
  const getStyleValue = (key, defaultValue) => stylePrefs[key] || defaultValue;

  return (
    <div className="control-section">
      <h4>Layout Style</h4>

      <div className="control-group">
        <label>Overall Style</label>
        <div className="radio-group">
          {[
            { value: "modern", label: "Modern", desc: "Clean, minimal design" },
            { value: "classic", label: "Classic", desc: "Traditional layout" },
            { value: "minimal", label: "Minimal", desc: "Ultra-clean design" },
          ].map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name="layout_style"
                value={option.value}
                checked={getStyleValue("layout_style", "modern") === option.value}
                onChange={(e) => onStyleChange("layout_style", e.target.value)}
              />
              <div className="radio-content">
                <span className="radio-label">{option.label}</span>
                <span className="radio-desc">{option.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Border Radius</label>
        <select
          value={getStyleValue("border_radius", "medium")}
          onChange={(e) => onStyleChange("border_radius", e.target.value)}>
          <option value="none">None (0px)</option>
          <option value="small">Small (4px)</option>
          <option value="medium">Medium (8px)</option>
          <option value="large">Large (12px)</option>
          <option value="full">Full (rounded)</option>
        </select>
      </div>

      <div className="control-group">
        <div className="toggle-group">
          <label className="toggle-option">
            <input
              type="checkbox"
              checked={getStyleValue("shadows", true)}
              onChange={(e) => onStyleChange("shadows", e.target.checked)}
            />
            <span>Drop Shadows</span>
          </label>

          <label className="toggle-option">
            <input
              type="checkbox"
              checked={getStyleValue("animations", true)}
              onChange={(e) => onStyleChange("animations", e.target.checked)}
            />
            <span>Hover Animations</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Hero section specific controls
const HeroControls = ({
  formData,
  stylePrefs,
  onStyleChange,
  onComponentOverride,
  hasContrastIssues,
  getComponentOverride,
}) => {
  const getStyleValue = (key, defaultValue) => stylePrefs[key] || defaultValue;

  return (
    <div className="control-section">
      <h4>Hero Section</h4>

      {hasContrastIssues && (
        <div className="contrast-warning-banner">
          <span className="warning-icon">⚠️</span>
          <span>
            Gradient may cause button contrast issues. Consider using solid background or override button
            colors below.
          </span>
        </div>
      )}

      <div className="control-group">
        <label>Background Style</label>
        <div className="radio-group">
          {[
            { value: "gradient", label: "Gradient", desc: "Primary → Secondary gradient" },
            { value: "solid", label: "Solid Primary", desc: "Solid primary color" },
          ].map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name="hero_style"
                value={option.value}
                checked={getStyleValue("hero_style", "gradient") === option.value}
                onChange={(e) => onStyleChange("hero_style", e.target.value)}
              />
              <div className="radio-content">
                <span className="radio-label">{option.label}</span>
                <span className="radio-desc">{option.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {getStyleValue("hero_style", "gradient") === "gradient" && (
        <div className="control-group">
          <label>Gradient Direction</label>
          <select
            value={getStyleValue("hero_gradient_direction", "135deg")}
            onChange={(e) => onStyleChange("hero_gradient_direction", e.target.value)}>
            <option value="90deg">Left to Right</option>
            <option value="180deg">Top to Bottom</option>
            <option value="135deg">Diagonal (Default)</option>
            <option value="45deg">Diagonal Reverse</option>
            <option value="0deg">Bottom to Top</option>
            <option value="270deg">Right to Left</option>
          </select>
        </div>
      )}

      <div className="control-group">
        <h5>Button Color Overrides</h5>
        <p className="control-desc">Override button colors specifically for the hero section</p>

        <div className="color-override-grid">
          {[
            { key: "primary", label: "Primary Button", current: formData?.primary_hex },
            { key: "secondary", label: "Secondary Button", current: formData?.secondary_hex },
            { key: "accent", label: "Accent Button", current: formData?.accent_hex },
          ].map((button) => {
            const overrideColor = getComponentOverride("hero_buttons", button.key);
            return (
              <div key={button.key} className="color-override-item">
                <label>{button.label}</label>
                <div className="color-override-input">
                  <input
                    type="color"
                    value={overrideColor || button.current || "#000000"}
                    onChange={(e) => onComponentOverride("hero_buttons", button.key, e.target.value)}
                  />
                  <span className="current-color">Current: {overrideColor || button.current}</span>
                  {overrideColor && (
                    <button
                      className="reset-override"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onComponentOverride("hero_buttons", button.key, null);
                      }}
                      title="Reset to default"
                      type="button">
                      ↺
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Component-specific controls
const ComponentControls = ({ formData, onComponentOverride, getComponentOverride }) => {
  const components = [
    {
      name: "navbar",
      label: "Navigation Bar",
      properties: [
        { key: "background", label: "Background", current: formData?.ui_hex },
        { key: "text", label: "Text Color", current: getBestTextColor(formData?.ui_hex || "#ffffff") },
      ],
    },
    {
      name: "cards",
      label: "Cards & Content",
      properties: [
        { key: "background", label: "Background", current: formData?.ui_hex },
        { key: "border", label: "Border Color", current: "#e5e5e5" },
      ],
    },
    {
      name: "footer",
      label: "Footer",
      properties: [
        { key: "background", label: "Background", current: formData?.ui_hex },
        { key: "text", label: "Text Color", current: getBestTextColor(formData?.ui_hex || "#ffffff") },
      ],
    },
  ];

  return (
    <div className="control-section">
      <h4>Component Overrides</h4>
      <p className="control-desc">Fine-tune individual components beyond the main color palette</p>

      {components.map((component) => (
        <div key={component.name} className="component-override-group">
          <h5>{component.label}</h5>

          <div className="color-override-grid">
            {component.properties.map((property) => {
              const overrideColor = getComponentOverride(component.name, property.key);
              return (
                <div key={property.key} className="color-override-item">
                  <label>{property.label}</label>
                  <div className="color-override-input">
                    <input
                      type="color"
                      value={overrideColor || property.current || "#000000"}
                      onChange={(e) => onComponentOverride(component.name, property.key, e.target.value)}
                    />
                    <span className="current-color">
                      {overrideColor ? "Override: " : "Default: "}
                      {overrideColor || property.current}
                    </span>
                    {overrideColor && (
                      <button
                        className="reset-override"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onComponentOverride(component.name, property.key, null);
                        }}
                        title="Reset to default"
                        type="button">
                        ↺
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Developer-specific controls
const DeveloperControls = ({ stylePrefs, onStyleChange }) => {
  const getStyleValue = (key, defaultValue) => stylePrefs[key] || defaultValue;

  return (
    <div className="control-section">
      <h4>Developer Options</h4>

      <div className="control-group">
        <label>CSS Framework</label>
        <select
          value={getStyleValue("css_framework", "tailwind")}
          onChange={(e) => onStyleChange("css_framework", e.target.value)}>
          <option value="tailwind">Tailwind CSS</option>
          <option value="css">Custom CSS</option>
          <option value="scss">SCSS/Sass</option>
        </select>
      </div>

      <div className="control-group">
        <label>Accessibility Mode</label>
        <select
          value={getStyleValue("accessibility_mode", "auto")}
          onChange={(e) => onStyleChange("accessibility_mode", e.target.value)}>
          <option value="strict">Strict WCAG AA</option>
          <option value="auto">Auto-optimize</option>
          <option value="relaxed">Relaxed (AA Large)</option>
        </select>
      </div>

      <div className="control-group">
        <div className="toggle-group">
          <label className="toggle-option">
            <input
              type="checkbox"
              checked={getStyleValue("semantic_colors", true)}
              onChange={(e) => onStyleChange("semantic_colors", e.target.checked)}
            />
            <span>Semantic CSS Variables</span>
            <span className="control-desc">Generate --color-primary, --color-secondary variables</span>
          </label>
        </div>
      </div>
    </div>
  );
};
