import { useState } from "react";
import "./ColorPreview.css";

export const ColorPreview = ({ palette, size = "sm", showTooltip = false }) => {
  const [copiedColor, setCopiedColor] = useState(null);

  if (!palette) return null;

  const colors = [
    { name: "Primary", hex: palette.primary_hex },
    { name: "Secondary", hex: palette.secondary_hex },
    { name: "Accent", hex: palette.accent_hex },
    { name: "Background", hex: palette.background_hex },
  ];

  const copyToClipboard = async (text, colorName) => {
    try {
      await navigator.clipboard.writeText(text);

      // Show visual feedback
      setCopiedColor(colorName);
      setTimeout(() => setCopiedColor(null), 1500);

      console.log(`✅ ${colorName} color ${text} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy:", err);
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      console.log(`✅ ${text} copied to clipboard!`);
    } catch (err) {
      console.error("Fallback: Could not copy text: ", err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className={`color-preview color-preview--${size}`}>
      {colors.map((color, index) => (
        <div
          key={`${color.name}-${index}`}
          className={`color-swatch ${copiedColor === color.name ? "copied" : ""}`}
          style={{ backgroundColor: color.hex }}
          title={showTooltip ? `${color.name}: ${color.hex} • Click to copy` : `Click to copy ${color.hex}`}
          aria-label={`${color.name} color: ${color.hex}. Click to copy.`}
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(color.hex, color.name);
          }}
        />
      ))}
    </div>
  );
};
