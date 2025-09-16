// paletteValidation.js - Comprehensive palette validation utilities

import { isContrastAccessible, hexToRgb, luminance } from "./colorUtils";

// Check for extreme colors that might cause eye strain
function isColorTooExtreme(colors) {
  const colorList = [
    colors.primary_hex,
    colors.secondary_hex,
    colors.accent_hex,
    colors.ui_hex,
    colors.background_hex,
  ];

  for (const color of colorList) {
    const lum = luminance(hexToRgb(color));
    // Check for extremely bright colors (pure white or near-white with saturation)
    if (lum > 0.95) return true;
    // Check for extremely dark colors that might make everything invisible
    if (lum < 0.02) return true;
  }
  return false;
}

export function validatePalette(colors) {
  const checks = {
    // Test real-world contrast scenarios, not auto-optimized ones

    // Background readability - test if default text colors work
    backgroundReadability: {
      label: "Background readability",
      passes:
        isContrastAccessible("#000000", colors.background_hex) ||
        isContrastAccessible("#ffffff", colors.background_hex),
      element: "page background",
      background: colors.background_hex,
      text: "default text",
    },

    // UI element contrast - very important for navigation/cards
    uiContrast: {
      label: "UI element contrast",
      passes:
        isContrastAccessible("#000000", colors.ui_hex, 3.0) ||
        isContrastAccessible("#ffffff", colors.ui_hex, 3.0),
      element: "cards and navigation",
      background: colors.ui_hex,
      text: "interface text",
    },

    // Button readability
    primaryButtonReadability: {
      label: "Primary button text",
      passes:
        isContrastAccessible("#000000", colors.primary_hex, 4.5) ||
        isContrastAccessible("#ffffff", colors.primary_hex, 4.5),
      element: "primary button",
      background: colors.primary_hex,
      text: "button text",
    },

    secondaryButtonReadability: {
      label: "Secondary button text",
      passes:
        isContrastAccessible("#000000", colors.secondary_hex, 4.5) ||
        isContrastAccessible("#ffffff", colors.secondary_hex, 4.5),
      element: "secondary button",
      background: colors.secondary_hex,
      text: "button text",
    },

    accentButtonReadability: {
      label: "Accent button text",
      passes:
        isContrastAccessible("#000000", colors.accent_hex, 4.5) ||
        isContrastAccessible("#ffffff", colors.accent_hex, 4.5),
      element: "accent button",
      background: colors.accent_hex,
      text: "button text",
    },

    // Color differentiation - can users tell colors apart?
    primarySecondaryDiff: {
      label: "Primary vs Secondary distinction",
      passes: isContrastAccessible(colors.primary_hex, colors.secondary_hex, 2.0),
      element: "color distinction",
      background: "various",
      text: "color differentiation",
    },

    uiBackgroundDiff: {
      label: "UI vs Background distinction",
      passes: isContrastAccessible(colors.ui_hex, colors.background_hex, 1.5),
      element: "layout clarity",
      background: "various",
      text: "visual hierarchy",
    },

    // Extreme color checks
    extremelyBright: {
      label: "Overly bright colors",
      passes: !isColorTooExtreme(colors),
      element: "color intensity",
      background: "various",
      text: "visual comfort",
    },
  };

  const failed = Object.entries(checks).filter(([key, check]) => !check.passes);
  const passed = Object.entries(checks).filter(([key, check]) => check.passes);

  return {
    checks,
    failed,
    passed,
    isValid: failed.length === 0,
    score: Math.round((passed.length / Object.keys(checks).length) * 100),
    summary: generateSummary(failed, passed),
  };
}

function generateSummary(failed, passed) {
  if (failed.length === 0) {
    return {
      type: "success",
      title: "✅ Excellent Accessibility!",
      message: "All text elements have great contrast and will be easy to read.",
      details: `${passed.length} checks passed`,
    };
  } else if (failed.length <= 2) {
    return {
      type: "warning",
      title: "⚠️ Minor Contrast Issues",
      message: `${failed.length} element${failed.length > 1 ? "s" : ""} may be difficult to read.`,
      details: failed.map(([key, check]) => check.label).join(", "),
    };
  } else {
    return {
      type: "error",
      title: "🚨 Multiple Contrast Issues",
      message: `${failed.length} elements may be difficult to read. Consider adjusting colors.`,
      details: failed.map(([key, check]) => check.label).join(", "),
    };
  }
}

export function getValidationRecommendations(failed) {
  if (failed.length === 0) return [];

  const recommendations = [];

  // Simple recommendations based on common issues
  failed.forEach(([key, check]) => {
    if (key.includes("Button")) {
      recommendations.push({
        type: "color-adjustment",
        message: `Consider making the ${check.element} color lighter or darker for better text readability.`,
        colorField: key.includes("primary")
          ? "primary_hex"
          : key.includes("secondary")
          ? "secondary_hex"
          : "accent_hex",
        affectedElements: check.element,
      });
    } else if (key.includes("ui") || key.includes("UI")) {
      recommendations.push({
        type: "color-adjustment",
        message: `Consider adjusting the UI color for better contrast with ${check.element}.`,
        colorField: "ui_hex",
        affectedElements: check.element,
      });
    } else if (key.includes("background") || key.includes("Background")) {
      recommendations.push({
        type: "color-adjustment",
        message: `Consider making the background color lighter or darker for better readability.`,
        colorField: "background_hex",
        affectedElements: check.element,
      });
    } else {
      recommendations.push({
        type: "color-adjustment",
        message: `Consider adjusting colors for better ${check.element}.`,
        colorField: "ui_hex",
        affectedElements: check.element,
      });
    }
  });

  return recommendations;
}
