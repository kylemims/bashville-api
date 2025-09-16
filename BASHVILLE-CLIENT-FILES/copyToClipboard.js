export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);

    // Fallback method for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (!success) {
        throw new Error("Fallback copy failed");
      }

      return true;
    } catch (fallbackErr) {
      console.error("Fallback copy failed:", fallbackErr);
      alert("❌ Failed to copy. Please select and copy manually.");
      throw fallbackErr;
    }
  }
};
