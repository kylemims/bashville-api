import { useEffect, useMemo } from "react";
import "./LiveColorPreview.css";
import { getBestTextColor, isContrastAccessible } from "./colorUtils";

// Simple Live Preview component that you can add to your existing ColorPaletteForm
export const LiveColorPreview = ({ formData }) => {
  const colors = useMemo(
    () => ({
      primary_hex: formData?.primary_hex || "#3b82f6",
      secondary_hex: formData?.secondary_hex || "#1e40af",
      accent_hex: formData?.accent_hex || "#06b6d4",
      background_hex: formData?.background_hex || "#f8fafc",
      ui_hex: formData?.ui_hex || "#ffffff",
    }),
    [
      formData?.primary_hex,
      formData?.secondary_hex,
      formData?.accent_hex,
      formData?.background_hex,
      formData?.ui_hex,
    ]
  );

  // Calculate optimal text colors with semantic consistency
  const textColors = useMemo(() => {
    // For UI elements (nav, cards), use consistent text color
    const uiTextColor = getBestTextColor(colors.ui_hex);

    return {
      primaryText: getBestTextColor(colors.primary_hex),
      secondaryText: getBestTextColor(colors.secondary_hex),
      accentText: getBestTextColor(colors.accent_hex),
      backgroundText: getBestTextColor(colors.background_hex),
      uiText: uiTextColor, // Cards, navigation text

      // Semantic assignments for consistent UI
      navText: uiTextColor, // Same as UI text for consistency
      navBrandText: getBestTextColor(colors.ui_hex), // Brand/logo in nav
      cardText: uiTextColor, // All card text (titles + paragraphs)
      cardTitleText: uiTextColor, // Card titles use same as card text

      // Hero section gets special treatment - uses primary background
      heroText: getBestTextColor(colors.primary_hex),

      // Footer matches navbar for consistency
      footerText: getBestTextColor(colors.ui_hex), // Footer uses UI background
    };
  }, [colors]);

  // Enhanced contrast checks with semantic groupings
  const contrastChecks = useMemo(
    () => ({
      // Navigation consistency
      navContrastOk: isContrastAccessible(textColors.navText, colors.ui_hex),
      navBrandContrastOk: isContrastAccessible(textColors.navBrandText, colors.ui_hex),

      // Button contrast (each button with its own background)
      buttonPrimaryContrastOk: isContrastAccessible(textColors.primaryText, colors.primary_hex),
      buttonSecondaryContrastOk: isContrastAccessible(textColors.secondaryText, colors.secondary_hex),
      buttonAccentContrastOk: isContrastAccessible(textColors.accentText, colors.accent_hex),

      // Card consistency (all card text on UI background)
      cardTextContrastOk: isContrastAccessible(textColors.cardText, colors.ui_hex),
      cardTitleContrastOk: isContrastAccessible(textColors.cardTitleText, colors.ui_hex),

      // Hero section
      heroTextContrastOk: isContrastAccessible(textColors.heroText, colors.primary_hex),

      // Footer consistency (matches nav)
      footerContrastOk: isContrastAccessible(textColors.footerText, colors.ui_hex),
    }),
    [colors, textColors]
  );
  useEffect(() => {
    // Update CSS custom properties for live preview
    const root = document.documentElement;
    root.style.setProperty("--preview-primary", colors.primary_hex);
    root.style.setProperty("--preview-secondary", colors.secondary_hex);
    root.style.setProperty("--preview-accent", colors.accent_hex);
    root.style.setProperty("--preview-background", colors.background_hex);
    root.style.setProperty("--preview-ui", colors.ui_hex);

    // Set semantic text colors for consistent UI
    root.style.setProperty("--preview-primary-text", textColors.primaryText);
    root.style.setProperty("--preview-secondary-text", textColors.secondaryText);
    root.style.setProperty("--preview-accent-text", textColors.accentText);
    root.style.setProperty("--preview-background-text", textColors.backgroundText);
    root.style.setProperty("--preview-ui-text", textColors.uiText);

    // Semantic UI element colors for consistency
    root.style.setProperty("--preview-nav-text", textColors.navText);
    root.style.setProperty("--preview-nav-brand-text", textColors.navBrandText);
    root.style.setProperty("--preview-card-text", textColors.cardText);
    root.style.setProperty("--preview-card-title-text", textColors.cardTitleText);
    root.style.setProperty("--preview-hero-text", textColors.heroText);
    root.style.setProperty("--preview-footer-text", textColors.footerText);
  }, [colors, textColors]);

  return (
    <div className="live-preview-container">
      <h4>Live Preview</h4>
      <div className="color-preview-container">
        <div className="color-preview-navbar">
          <div className="color-preview-logo">
            Your Site
            {!contrastChecks.navBrandContrastOk && (
              <span className="contrast-warning" title="Brand text may have low contrast on navbar">
                ⚠️
              </span>
            )}
          </div>
          <div className="color-preview-nav-links">
            <span className="color-preview-nav-link">
              Home
              {!contrastChecks.navContrastOk && (
                <span className="contrast-warning" title="Nav text may have low contrast">
                  ⚠️
                </span>
              )}
            </span>
            <span className="color-preview-nav-link">About</span>
            <span className="color-preview-nav-link">Contact</span>
          </div>
        </div>

        <div className="color-preview-content">
          <div className="color-preview-hero">
            <h2>Welcome to Your Site</h2>
            <p>See your colors come to life</p>
            <div className="color-preview-buttons">
              <button className="color-preview-btn btn-primary">
                Primary
                {!contrastChecks.buttonPrimaryContrastOk && (
                  <span className="contrast-warning" title="Primary button may have low contrast">
                    ⚠️
                  </span>
                )}
              </button>
              <button className="color-preview-btn btn-secondary">
                Secondary
                {!contrastChecks.buttonSecondaryContrastOk && (
                  <span className="contrast-warning" title="Secondary button may have low contrast">
                    ⚠️
                  </span>
                )}
              </button>
              <button className="color-preview-btn btn-accent">
                Accent
                {!contrastChecks.buttonAccentContrastOk && (
                  <span className="contrast-warning" title="Accent button may have low contrast">
                    ⚠️
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="color-preview-cards">
            <div className="color-preview-card">
              <h4>
                Card Title
                {!contrastChecks.cardTitleContrastOk && (
                  <span
                    className="contrast-warning"
                    title="Card title may have low contrast on UI background">
                    ⚠️
                  </span>
                )}
              </h4>
              <p>
                This card uses UI background color
                {!contrastChecks.cardTextContrastOk && (
                  <span className="contrast-warning" title="Card text may have low contrast">
                    ⚠️
                  </span>
                )}
              </p>
            </div>
            <div className="color-preview-card">
              <h4>Another Card</h4>
              <p>All card text is consistent</p>
            </div>
          </div>
        </div>

        <div className="color-preview-footer">
          Footer with UI background (matches navbar)
          {!contrastChecks.footerContrastOk && (
            <span className="contrast-warning" title="Footer text may have low contrast">
              ⚠️
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
