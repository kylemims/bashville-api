import React, { useEffect, useState } from "react";
import "./LiveColorPreview.css";

const LiveColorPreview = ({ formData, isVisible = true }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to get component-specific colors with overrides
  const getComponentColor = (componentType, colorType, defaultColor) => {
    const overrides = formData.style_preferences?.component_overrides || {};
    const componentOverride = overrides[componentType];

    if (componentOverride && componentOverride[colorType]) {
      return componentOverride[colorType];
    }

    return defaultColor;
  };

  // Update CSS custom properties whenever formData changes
  useEffect(() => {
    if (!mounted || !formData.colors) return;

    const root = document.documentElement;
    const colors = formData.colors;
    const stylePrefs = formData.style_preferences || {};

    // Base colors
    root.style.setProperty("--primary-color", colors.primary || "#3b82f6");
    root.style.setProperty("--secondary-color", colors.secondary || "#10b981");
    root.style.setProperty("--accent-color", colors.accent || "#f59e0b");
    root.style.setProperty("--background-color", colors.background || "#ffffff");
    root.style.setProperty("--text-color", colors.text || "#1f2937");
    root.style.setProperty("--border-color", colors.border || "#e5e7eb");

    // Hero section styling
    if (stylePrefs.hero_style === "gradient" && colors.primary && colors.secondary) {
      root.style.setProperty(
        "--hero-background",
        `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
      );
    } else {
      root.style.setProperty("--hero-background", colors.primary || "#3b82f6");
    }

    // Border radius
    const borderRadius = stylePrefs.border_radius || "medium";
    const radiusMap = {
      none: "0px",
      small: "4px",
      medium: "8px",
      large: "16px",
      xl: "24px",
    };
    root.style.setProperty("--border-radius", radiusMap[borderRadius]);

    // Component overrides
    const overrides = stylePrefs.component_overrides || {};
    Object.entries(overrides).forEach(([component, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        if (value) {
          root.style.setProperty(`--${component}-${property.replace("_", "-")}`, value);
        }
      });
    });
  }, [formData, mounted]);

  if (!isVisible || !formData.colors) {
    return null;
  }

  const colors = formData.colors;
  const stylePrefs = formData.style_preferences || {};

  // Visual indicators for applied styles
  const getStyleIndicators = () => {
    const indicators = [];

    if (stylePrefs.hero_style === "gradient") {
      indicators.push("Gradient Hero");
    }

    if (stylePrefs.animations_enabled) {
      indicators.push("Animations");
    }

    if (stylePrefs.shadows_enabled) {
      indicators.push("Shadows");
    }

    const borderRadius = stylePrefs.border_radius;
    if (borderRadius && borderRadius !== "medium") {
      indicators.push(`${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)} Radius`);
    }

    const overrides = stylePrefs.component_overrides || {};
    const overrideCount = Object.keys(overrides).filter((key) =>
      Object.values(overrides[key] || {}).some((value) => value)
    ).length;

    if (overrideCount > 0) {
      indicators.push(`${overrideCount} Override${overrideCount === 1 ? "" : "s"}`);
    }

    return indicators;
  };

  const styleIndicators = getStyleIndicators();

  return (
    <div className="live-preview-container">
      {styleIndicators.length > 0 && (
        <div className="style-indicators">
          <span className="indicators-label">Applied Styles:</span>
          {styleIndicators.map((indicator, index) => (
            <span key={index} className="style-indicator">
              {indicator}
            </span>
          ))}
        </div>
      )}

      <div className="preview-content">
        {/* Hero Section */}
        <div
          className={`preview-hero ${stylePrefs.hero_style === "gradient" ? "gradient-bg" : "solid-bg"}`}
          style={{
            backgroundColor: stylePrefs.hero_style === "gradient" ? "transparent" : colors.primary,
            backgroundImage:
              stylePrefs.hero_style === "gradient"
                ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                : "none",
            borderRadius: stylePrefs.border_radius === "none" ? "0" : undefined,
            boxShadow: stylePrefs.shadows_enabled ? "0 10px 25px rgba(0,0,0,0.1)" : "none",
          }}>
          <h1
            style={{
              color: getComponentColor("hero", "text_color", colors.background || "#ffffff"),
              animation: stylePrefs.animations_enabled ? "fadeInUp 0.6s ease-out" : "none",
            }}>
            Welcome to Your Site
          </h1>
          <p
            style={{
              color: getComponentColor("hero", "text_color", colors.background || "#ffffff"),
              opacity: 0.9,
              animation: stylePrefs.animations_enabled ? "fadeInUp 0.8s ease-out" : "none",
            }}>
            Beautiful design meets powerful functionality
          </p>
          <button
            className="preview-button"
            style={{
              backgroundColor: getComponentColor("button", "background_color", colors.accent),
              color: getComponentColor("button", "text_color", colors.background),
              borderRadius: stylePrefs.border_radius === "none" ? "0" : undefined,
              boxShadow: stylePrefs.shadows_enabled ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
              animation: stylePrefs.animations_enabled ? "fadeInUp 1s ease-out" : "none",
            }}>
            Get Started
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="preview-nav"
          style={{
            backgroundColor: getComponentColor("navigation", "background_color", colors.background),
            borderColor: getComponentColor("navigation", "border_color", colors.border),
            boxShadow: stylePrefs.shadows_enabled ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
          }}>
          <div
            className="nav-brand"
            style={{ color: getComponentColor("navigation", "text_color", colors.primary) }}>
            Brand
          </div>
          <div className="nav-links">
            {["Home", "About", "Services", "Contact"].map((link, index) => (
              <a
                key={link}
                href="#"
                style={{
                  color: getComponentColor("navigation", "text_color", colors.text),
                  animation: stylePrefs.animations_enabled
                    ? `fadeInDown ${0.3 + index * 0.1}s ease-out`
                    : "none",
                }}>
                {link}
              </a>
            ))}
          </div>
        </nav>

        {/* Content Section */}
        <div
          className="preview-content-section"
          style={{
            backgroundColor: getComponentColor("content", "background_color", colors.background),
            color: getComponentColor("content", "text_color", colors.text),
          }}>
          <div className="content-grid">
            {[1, 2, 3].map((item, index) => (
              <div
                key={item}
                className="content-card"
                style={{
                  backgroundColor: getComponentColor("card", "background_color", colors.background),
                  borderColor: getComponentColor("card", "border_color", colors.border),
                  borderRadius: stylePrefs.border_radius === "none" ? "0" : undefined,
                  boxShadow: stylePrefs.shadows_enabled
                    ? "0 4px 12px rgba(0,0,0,0.08)"
                    : `1px 1px 3px ${colors.border}`,
                  animation: stylePrefs.animations_enabled
                    ? `fadeInUp ${0.4 + index * 0.2}s ease-out`
                    : "none",
                }}>
                <div
                  className="card-icon"
                  style={{
                    backgroundColor: colors.secondary,
                    borderRadius: stylePrefs.border_radius === "none" ? "0" : undefined,
                  }}></div>
                <h3 style={{ color: getComponentColor("card", "text_color", colors.text) }}>
                  Feature {item}
                </h3>
                <p style={{ color: getComponentColor("card", "text_color", colors.text), opacity: 0.7 }}>
                  Showcase your amazing features with this beautiful card design.
                </p>
                <button
                  style={{
                    backgroundColor: getComponentColor("button", "background_color", colors.primary),
                    color: getComponentColor("button", "text_color", colors.background),
                    borderRadius: stylePrefs.border_radius === "none" ? "0" : undefined,
                    boxShadow: stylePrefs.shadows_enabled ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  }}>
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          className="preview-footer"
          style={{
            backgroundColor: getComponentColor("footer", "background_color", colors.text),
            color: getComponentColor("footer", "text_color", colors.background),
            borderTopColor: getComponentColor("footer", "border_color", colors.border),
          }}>
          <p>&copy; 2024 Your Website. Built with Bashville.</p>
        </footer>
      </div>
    </div>
  );
};

export default LiveColorPreview;
