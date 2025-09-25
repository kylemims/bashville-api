import React, { useState } from "react";
import { updateNote } from "../../services/noteService";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { TextBlock } from "../tabs/blocks/TextBlock.jsx";
import { ChecklistBlock } from "../tabs/blocks/ChecklistBlock.jsx";
import { CodeBlock } from "../tabs/blocks/CodeBlock.jsx";
import { NoteMigrationHelper } from "./NoteMigrationHelper.jsx";
import "./BlockBasedNoteCard.css";

export function BlockBasedNoteCard({ note, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [updating, setUpdating] = useState(false);

  const blocks = note.blocks || [];

  // Handle note updates through API
  const handleNoteUpdate = async (updateData) => {
    if (updating) return; // Prevent duplicate calls

    try {
      setUpdating(true);
      console.log("🔄 Updating note via API:", note.id, updateData);

      const updatedNote = await updateNote(note.id, updateData);
      console.log("✅ Note updated successfully:", updatedNote);

      // Call the parent update handler with the full updated note
      onUpdate(updatedNote);
    } catch (error) {
      console.error("❌ Failed to update note:", error);
      // TODO: Show error toast or message
    } finally {
      setUpdating(false);
    }
  };

  // Generate preview text from blocks
  const getPreviewText = () => {
    if (blocks.length === 0) return "Empty note";

    const firstBlock = blocks[0];
    if (firstBlock.type === "text") {
      return firstBlock.content?.substring(0, 100) + (firstBlock.content?.length > 100 ? "..." : "");
    } else if (firstBlock.type === "checklist") {
      const itemCount = firstBlock.items?.length || 0;
      return `Checklist with ${itemCount} items`;
    } else if (firstBlock.type === "code") {
      return `Code block (${firstBlock.language || "code"})`;
    }
    return "Note content";
  };

  const updateBlock = (blockId, updates) => {
    console.log("🔄 Updating block:", blockId, updates);
    const updatedBlocks = blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block));
    console.log("📝 Updated blocks:", updatedBlocks);
    handleNoteUpdate({ blocks: updatedBlocks });
  };

  const deleteBlock = (blockId) => {
    console.log("🗑️ Deleting block:", blockId);
    const updatedBlocks = blocks.filter((block) => block.id !== blockId);
    console.log("📝 Blocks after delete:", updatedBlocks);
    handleNoteUpdate({ blocks: updatedBlocks });
  };

  const moveBlock = (blockId, direction) => {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updatedBlocks = [...blocks];
    [updatedBlocks[currentIndex], updatedBlocks[newIndex]] = [
      updatedBlocks[newIndex],
      updatedBlocks[currentIndex],
    ];

    // Update order values
    updatedBlocks.forEach((block, index) => {
      block.order = index;
    });

    handleNoteUpdate({ blocks: updatedBlocks });
  };

  const addBlock = (type) => {
    console.log("➕ Adding block of type:", type);
    console.log("📋 Current blocks:", blocks);

    const newBlock = {
      id: `block-${Date.now()}`,
      type: type,
      order: blocks.length,
      ...(type === "text" && { content: "" }),
      ...(type === "checklist" && { items: [] }),
      ...(type === "code" && { content: "", language: "javascript" }),
    };

    console.log("🆕 New block:", newBlock);

    const updatedBlocks = [...blocks, newBlock];
    console.log("📝 Updated blocks array:", updatedBlocks);

    handleNoteUpdate({ blocks: updatedBlocks });
    setIsAddingBlock(false);
  };
  const renderBlock = (block, index) => {
    const commonProps = {
      key: block.id,
      block,
      onUpdate: updateBlock,
      onDelete: deleteBlock,
      onMoveUp: (blockId) => moveBlock(blockId, "up"),
      onMoveDown: (blockId) => moveBlock(blockId, "down"),
      isFirst: index === 0,
      isLast: index === blocks.length - 1,
    };

    switch (block.type) {
      case "text":
        return <TextBlock {...commonProps} />;
      case "checklist":
        return <ChecklistBlock {...commonProps} />;
      case "code":
        return <CodeBlock {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={`block-note-card ${isExpanded ? "expanded" : ""}`}>
      {/* Collapsed view */}
      {!isExpanded && (
        <div className="note-card-preview" onClick={() => setIsExpanded(true)}>
          <div className="note-preview-header">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-preview-actions">
              <span className="block-count">{blocks.length} blocks</span>
              <MaterialIcon icon="expand_more" size={20} />
            </div>
          </div>
          <p className="note-preview-text">{getPreviewText()}</p>
          <div className="note-meta">
            <span className="note-category">{note.category_display}</span>
            <span className="note-date">{new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="note-card-expanded">
          {/* Header with title and actions */}
          <div className="note-expanded-header">
            <input
              type="text"
              value={note.title}
              onChange={(e) => handleNoteUpdate({ title: e.target.value })}
              className="note-title-edit"
              placeholder="Note title..."
            />
            <div className="note-header-actions">
              <button
                type="button"
                className="note-action-btn"
                onClick={() => setIsAddingBlock(!isAddingBlock)}
                title="Add block">
                <MaterialIcon icon="add" size={18} />
              </button>
              <button
                type="button"
                className="note-action-btn delete"
                onClick={() => onDelete(note.id)}
                title="Delete note">
                <MaterialIcon icon="delete" size={18} />
              </button>
              <button
                type="button"
                className="note-action-btn"
                onClick={() => setIsExpanded(false)}
                title="Collapse">
                <MaterialIcon icon="expand_less" size={18} />
              </button>
            </div>
          </div>

          {/* Migration helper for legacy notes */}
          <NoteMigrationHelper note={note} onMigrate={handleNoteUpdate} />

          {/* Add block menu */}
          {isAddingBlock && (
            <div className="add-block-menu">
              <button type="button" className="add-block-btn" onClick={() => addBlock("text")}>
                <MaterialIcon icon="text_fields" size={16} />
                <span>Text</span>
              </button>
              <button type="button" className="add-block-btn" onClick={() => addBlock("checklist")}>
                <MaterialIcon icon="checklist" size={16} />
                <span>Checklist</span>
              </button>
              <button type="button" className="add-block-btn" onClick={() => addBlock("code")}>
                <MaterialIcon icon="code" size={16} />
                <span>Code</span>
              </button>
            </div>
          )}

          {/* Blocks */}
          <div className="note-blocks">
            {blocks.length === 0 ? (
              <div className="empty-note-message">
                <p>This note is empty. Click the + button to add content blocks.</p>
              </div>
            ) : (
              blocks.map((block, index) => renderBlock(block, index))
            )}
          </div>

          {/* Footer */}
          <div className="note-expanded-footer">
            <div className="note-meta">
              <span className="note-category">{note.category_display}</span>
              <span className="note-date">Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
