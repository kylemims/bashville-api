// src/components/project/LayoutSelector.jsx
import { useState } from "react";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./LayoutSelector.css";

export const LayoutSelector = ({ selectedType, onTypeChange, disabled = false }) => {
  const [hoveredType, setHoveredType] = useState(null);

  const projectTypes = [
    {
      value: "static-tailwind",
      label: "Static React + Tailwind",
      description: "Modern utility-first CSS framework",
      icon: "bolt",
      category: "frontend",
      complexity: "Simple",
      estimatedTime: "5 min",
      features: ["React Components", "Tailwind Utilities", "Responsive Design", "Color Variables"],
    },
    {
      value: "static-css",
      label: "Static React + Custom CSS",
      description: "Traditional CSS with full control",
      icon: "palette",
      category: "frontend",
      complexity: "Simple",
      estimatedTime: "5 min",
      features: ["React Components", "Custom CSS", "Full Style Control", "Color Variables"],
    },
    {
      value: "fullstack-tailwind",
      label: "Full-Stack + Tailwind",
      description: "React frontend + Django backend + Tailwind",
      icon: "rocket_launch",
      category: "fullstack",
      complexity: "Advanced",
      estimatedTime: "15 min",
      features: ["React Frontend", "Django REST API", "Database Models", "Tailwind Styles"],
    },
    {
      value: "fullstack-css",
      label: "Full-Stack + Custom CSS",
      description: "React frontend + Django backend + Custom CSS",
      icon: "settings",
      category: "fullstack",
      complexity: "Advanced",
      estimatedTime: "15 min",
      features: ["React Frontend", "Django REST API", "Database Models", "Custom Styles"],
    },
  ];

  const frontendTypes = projectTypes.filter((type) => type.category === "frontend");
  const fullstackTypes = projectTypes.filter((type) => type.category === "fullstack");

  const handleTypeSelect = (type) => {
    if (!disabled) {
      onTypeChange(type.value);
    }
  };

  const getComplexityColor = (complexity) => {
    return complexity === "Simple" ? "var(--color-accent)" : "var(--color-secondary)";
  };

  const TypeCard = ({ type }) => {
    const isSelected = selectedType === type.value;
    const isHovered = hoveredType === type.value;

    return (
      <div
        className={`layout-card ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => handleTypeSelect(type)}
        onMouseEnter={() => !disabled && setHoveredType(type.value)}
        onMouseLeave={() => setHoveredType(null)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Select ${type.label} layout`}>
        <div className="layout-card-header">
          <div className="layout-icon">
            <MaterialIcon
              icon={type.icon}
              size={24}
              color={isSelected ? "var(--color-primary)" : "var(--muted)"}
            />
          </div>
          {isSelected && (
            <div className="layout-select-indicator">
              <MaterialIcon icon="check_circle" size={20} color="var(--bg-primary)" />
              <span className="selected-span-text">selected</span>
            </div>
          )}
          <div className="layout-complexity">
            <span className="complexity-badge" style={{ color: getComplexityColor(type.complexity) }}>
              {type.complexity}
            </span>
          </div>
        </div>

        <div className="layout-card-content">
          <h3 className="layout-title">{type.label}</h3>
          <p className="layout-description">{type.description}</p>

          {(isSelected || isHovered) && (
            <div className="layout-features">
              <div className="layout-meta">
                <span className="setup-time">
                  <MaterialIcon icon="schedule" size={14} color="var(--muted)" />
                  Setup: {type.estimatedTime}
                </span>
              </div>
              <ul className="feature-list">
                {type.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <MaterialIcon icon="check_circle" size={12} color="var(--color-accent)" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="layout-selector">
      <div className="layout-section">
        <div className="section-header">
          <h3 className="section-title">
            <MaterialIcon icon="web" size={20} color="var(--color-primary)" />
            Frontend Projects
          </h3>
          <p className="section-subtitle">Static React applications</p>
        </div>
        <div className="layout-grid">
          {frontendTypes.map((type) => (
            <TypeCard key={type.value} type={type} />
          ))}
        </div>
      </div>

      <div className="layout-section">
        <div className="section-header">
          <h3 className="section-title">
            <MaterialIcon icon="storage" size={20} color="var(--color-primary)" />
            Full-Stack Projects
          </h3>
          <p className="section-subtitle">React frontend + Django backend</p>
        </div>
        <div className="layout-grid">
          {fullstackTypes.map((type) => (
            <TypeCard key={type.value} type={type} />
          ))}
        </div>
      </div>

      {selectedType && (
        <div className="selection-summary">
          <div className="summary-content">
            <MaterialIcon icon="info" size={16} color="var(--color-accent)" />
            <span>
              Selected: <strong>{projectTypes.find((t) => t.value === selectedType)?.label}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
