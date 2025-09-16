import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import { copyToClipboard } from "../../utils/copyToClipboard.js";
import "./FilePreview.css";

export const FilePreview = ({ filename, content, onCopy }) => {
  const [copyFeedback, setCopyFeedback] = useState("");

  const getLanguage = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "jsx":
        return "jsx";
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "json":
        return "json";
      case "html":
        return "html";
      case "md":
        return "markdown";
      case "sh":
        return "bash";
      case "py":
        return "python";
      case "yml":
      case "yaml":
        return "yaml";
      default:
        return "text";
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "jsx":
      case "js":
        return "code";
      case "css":
        return "palette";
      case "json":
        return "data_object";
      case "html":
        return "html";
      case "md":
        return "description";
      case "sh":
        return "terminal";
      case "py":
        return "code";
      default:
        return "description";
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(processedContent);
      setCopyFeedback("Copied!");
      if (onCopy) onCopy(filename);

      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const formatFileSize = (content) => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check for template rendering errors and clean content
  const cleanContent = (rawContent) => {
    if (!rawContent) return "";

    // Check for Django template errors
    if (
      rawContent.includes("Error rendering template:") ||
      rawContent.includes("Could parse the remainder:")
    ) {
      return (
        "// Template rendering error detected\n// This indicates a server-side template issue\n// Please check the Django backend template files\n\n" +
        rawContent
      );
    }

    return rawContent;
  };

  const processedContent = cleanContent(content);
  const lineCount = processedContent ? processedContent.split("\n").length : 0;
  const language = getLanguage(filename);
  const hasTemplateError = content && content.includes("Error rendering template:");

  return (
    <div className="file-preview">
      <div className="file-preview-header">
        <div className="file-info">
          <MaterialIcon
            icon={getFileIcon(filename)}
            size={20}
            color="var(--color-primary)"
            className="file-icon"
          />
          <div className="file-details">
            <span className="file-name">{filename}</span>
            <div className="file-meta">
              <span className="file-language">{language}</span>
              <span className="file-size">{formatFileSize(processedContent)}</span>
              <span className="line-count">{lineCount} lines</span>
              {hasTemplateError && (
                <span className="template-error-indicator" title="Template rendering error detected">
                  ⚠️ Template Error
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="file-actions">
          {copyFeedback && (
            <span className={`copy-feedback ${copyFeedback === "Copied!" ? "success" : "error"}`}>
              {copyFeedback}
            </span>
          )}
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            title="Copy file content to clipboard">
            <MaterialIcon icon="content_copy" size={16} />
            Copy
          </ActionButton>
        </div>
      </div>

      <div className="file-content">
        {processedContent ? (
          <SyntaxHighlighter
            language={hasTemplateError ? "text" : language}
            style={tomorrow}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#6b7280",
              backgroundColor: "transparent",
              fontSize: "0.75rem",
            }}
            customStyle={{
              margin: 0,
              background: hasTemplateError ? "#2d1b1b" : "#1a1613",
              fontSize: "0.875rem",
              lineHeight: "1.5",
              border: hasTemplateError ? "1px solid #d46a6a" : "none",
            }}
            codeTagProps={{
              style: {
                fontFamily: '"Monaco", "Menlo", "Consolas", monospace',
              },
            }}>
            {processedContent}
          </SyntaxHighlighter>
        ) : (
          <div className="empty-content">
            <MaterialIcon icon="description" size={48} color="var(--muted)" />
            <p>No content to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
