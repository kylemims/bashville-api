import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MaterialIcon } from "./MaterialIcon.jsx";
import { normalizeLanguage } from "../../utils/codeBlockParser.js";
import "./CodeBlock.css";

export const CodeBlock = ({
  code,
  language = "text",
  className = "",
  showLineNumbers = true,
  maxHeight = 300,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedLanguage = normalizeLanguage(language);
  const codeLines = code.split("\n");
  const shouldShowExpandButton = codeLines.length > 10;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const displayCode =
    !isExpanded && shouldShowExpandButton ? codeLines.slice(0, 10).join("\n") + "\n..." : code;

  return (
    <div className={`code-block ${className}`}>
      {/* Header */}
      <div className="code-header">
        <div className="code-language">
          <MaterialIcon icon="code" size={16} />
          <span>{normalizedLanguage}</span>
        </div>

        <div className="code-actions">
          {shouldShowExpandButton && (
            <button
              className="code-action-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}>
              <MaterialIcon icon={isExpanded ? "expand_less" : "expand_more"} size={16} />
            </button>
          )}

          <button className="code-action-btn" onClick={handleCopy} title="Copy code">
            <MaterialIcon
              icon={copied ? "check" : "content_copy"}
              size={16}
              color={copied ? "var(--accent)" : undefined}
            />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div
        className="code-content"
        style={{
          maxHeight: isExpanded ? "none" : `${maxHeight}px`,
          overflow: isExpanded ? "visible" : "auto",
        }}>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={tomorrow}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: "12px",
            background: "var(--bg-secondary)",
            fontSize: "13px",
            lineHeight: "1.4",
            borderRadius: "0 0 6px 6px",
          }}
          codeTagProps={{
            style: {
              fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
            },
          }}>
          {displayCode}
        </SyntaxHighlighter>
      </div>

      {/* Copy feedback */}
      {copied && (
        <div className="copy-feedback">
          <MaterialIcon icon="check_circle" size={16} />
          <span>Copied!</span>
        </div>
      )}
    </div>
  );
};
