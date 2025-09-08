import React, { useEffect } from "react";

// Simple Live Preview component that you can add to your existing ColorPaletteForm
const LivePreview = ({ formData }) => {
  useEffect(() => {
    // Update CSS custom properties for live preview
    const root = document.documentElement;
    if (formData.primary_hex) root.style.setProperty("--preview-primary", formData.primary_hex);
    if (formData.secondary_hex) root.style.setProperty("--preview-secondary", formData.secondary_hex);
    if (formData.accent_hex) root.style.setProperty("--preview-accent", formData.accent_hex);
    if (formData.background_hex) root.style.setProperty("--preview-background", formData.background_hex);
    if (formData.ui_hex) root.style.setProperty("--preview-ui", formData.ui_hex);
  }, [formData]);

  return (
    <div className="live-preview-container">
      <h4>Live Preview</h4>
      <div className="color-preview-container">
        <div className="color-preview-navbar">
          <div className="color-preview-logo">Your Site</div>
          <div className="color-preview-nav-links">
            <a href="#" className="color-preview-nav-link">
              Home
            </a>
            <a href="#" className="color-preview-nav-link">
              About
            </a>
            <a href="#" className="color-preview-nav-link">
              Contact
            </a>
          </div>
        </div>

        <div className="color-preview-content">
          <div className="color-preview-hero">
            <h2>Welcome to Your Site</h2>
            <p>See your colors come to life</p>
            <div className="color-preview-buttons">
              <button className="color-preview-btn btn-primary">Primary</button>
              <button className="color-preview-btn btn-secondary">Secondary</button>
              <button className="color-preview-btn btn-accent">Accent</button>
            </div>
          </div>

          <div className="color-preview-cards">
            <div className="color-preview-card">
              <h4>Card Title</h4>
              <p>This card uses UI background color</p>
            </div>
            <div className="color-preview-card">
              <h4>Another Card</h4>
              <p>See how your palette looks</p>
            </div>
          </div>
        </div>

        <div className="color-preview-footer">Footer with primary color</div>
      </div>
    </div>
  );
};

export default LivePreview;
