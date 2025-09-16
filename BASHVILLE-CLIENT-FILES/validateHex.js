/**
 * Validates if a string is a proper hex color code
 * @param {string} hex - The hex color string to validate (e.g., "#FF5733")
 * @returns {boolean} - True if valid hex color, false otherwise
 */

export const validateHex = (hex) => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(hex);
};
