import { useState, useCallback } from "react";
import { InteractiveCheckbox } from "./InteractiveCheckbox.jsx";
import { CodeBlock } from "./CodeBlock.jsx";
import { InlineCode } from "./InlineCode.jsx";
import { parseCheckboxes, updateCheckboxInContent, getCheckboxStats } from "../../utils/checkboxParser.js";
import { parseCodeBlocks } from "../../utils/codeBlockParser.js";
import "./NoteContent.css";

export const NoteContent = ({
  content,
  onContentUpdate,
  isExpanded = false,
  maxLength = 150,
  readOnly = false,
  className = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse checkboxes from content
  const { checkboxes, parsedContent } = parseCheckboxes(content || "");

  // Parse code blocks from the parsed content
  const { codeBlocks, parsedContent: finalParsedContent } = parseCodeBlocks(parsedContent);

  const { completed, total, hasCheckboxes } = getCheckboxStats(content || "");

  // Handle checkbox toggle
  const handleCheckboxToggle = useCallback(
    async (lineIndex, newCheckedState) => {
      if (readOnly || isProcessing || !onContentUpdate) return;

      try {
        setIsProcessing(true);
        const updatedContent = updateCheckboxInContent(content, lineIndex, newCheckedState);
        await onContentUpdate(updatedContent);
      } catch (error) {
        console.error("❌ Failed to update checkbox:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [content, onContentUpdate, readOnly, isProcessing]
  );

  // Render content with interactive checkboxes and code blocks
  const renderContentWithEnhancements = (textContent) => {
    console.log("🎨 NoteContent rendering:", { textContent, checkboxes, codeBlocks });

    if (!textContent) return null;

    const lines = textContent.split("\n");
    const elements = [];
    let currentCodeBlock = null;

    lines.forEach((line, index) => {
      // Check for checkbox placeholder
      const checkboxMatch = line.match(/^(\s*)CHECKBOX_PLACEHOLDER_(\d+)$/);
      if (checkboxMatch) {
        const [, , originalIndex] = checkboxMatch;
        const checkbox = checkboxes.find((cb) => cb.lineIndex === parseInt(originalIndex));

        if (checkbox) {
          const indentLevel = Math.min(Math.floor(checkbox.indent / 2), 3);
          const indentClass = indentLevel > 0 ? `indented-${indentLevel}` : "";

          elements.push(
            <InteractiveCheckbox
              key={`checkbox-${index}`}
              isChecked={checkbox.isChecked}
              text={checkbox.text}
              onToggle={(newState) => handleCheckboxToggle(checkbox.lineIndex, newState)}
              disabled={readOnly || isProcessing}
              className={indentClass}
            />
          );
        }
        return;
      }

      // Check for code block start
      const codeStartMatch = line.match(/^(\s*)CODE_BLOCK_START_(\d+)$/);
      if (codeStartMatch) {
        const [, , blockIndex] = codeStartMatch;
        currentCodeBlock = codeBlocks.find((cb) => cb.id === `code-${blockIndex}`);
        return;
      }

      // Check for code block end
      const codeEndMatch = line.match(/^(\s*)CODE_BLOCK_END_(\d+)$/);
      if (codeEndMatch && currentCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${currentCodeBlock.id}`}
            code={currentCodeBlock.content.join("\n")}
            language={currentCodeBlock.language}
          />
        );
        currentCodeBlock = null;
        return;
      }

      // Skip code block content lines (they're rendered in the CodeBlock component)
      if (line.match(/^CODE_BLOCK_CONTENT_/)) {
        return;
      }

      // Regular text line - handle inline code
      if (line.trim()) {
        const processedLine = renderLineWithInlineCode(line);
        elements.push(
          <p key={`text-${index}`} className="note-text-line">
            {processedLine}
          </p>
        );
      } else {
        // Empty line
        elements.push(<br key={`br-${index}`} />);
      }
    });

    return elements;
  };

  // Process inline code in a text line
  const renderLineWithInlineCode = (text) => {
    if (!text.includes("`")) return text;

    const parts = [];
    let lastIndex = 0;

    // Find inline code patterns
    const inlineCodeRegex = /`([^`]+)`/g;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before the code
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the inline code component
      parts.push(
        <InlineCode key={`inline-${match.index}`} copyable>
          {match[1]}
        </InlineCode>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Truncate content if not expanded
  const displayContent = isExpanded
    ? finalParsedContent
    : finalParsedContent && finalParsedContent.length > maxLength
    ? finalParsedContent.substring(0, maxLength) + "..."
    : finalParsedContent;

  return (
    <div className={`note-content-renderer ${className}`}>
      {/* Checkbox progress indicator */}
      {hasCheckboxes && (
        <div className="checkbox-progress">
          <span className="progress-text">
            {completed} of {total} completed
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Rendered content */}
      <div className="note-content-body">{renderContentWithEnhancements(displayContent)}</div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="processing-indicator">
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
};
