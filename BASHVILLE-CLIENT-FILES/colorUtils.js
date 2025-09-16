export const hexToRgb = (hex) => {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
};

// Calculate relative luminance
export const luminance = ([r, g, b]) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

// Calculate contrast ratio (WCAG)
export const contrastRatio = (hex1, hex2) => {
  const lum1 = luminance(hexToRgb(hex1));
  const lum2 = luminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Is contrast sufficient? (AA standard: 4.5 for normal text)
export const isContrastAccessible = (hex1, hex2, minRatio = 4.5) => {
  return contrastRatio(hex1, hex2) >= minRatio;
};

export const getOptimalTextColor = (backgroundHex) => {
  const lum = luminance(hexToRgb(backgroundHex));

  return lum > 0.5 ? "#000000" : "#ffffff";
};

export const getBestTextColor = (backgroundHex) => {
  const whiteContrast = contrastRatio("#ffffff", backgroundHex);
  const blackContrast = contrastRatio("#000000", backgroundHex);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
};
