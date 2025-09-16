import { useState } from "react";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./FileTree.css";

export const FileTree = ({ files, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(["src"]));

  const buildFileTree = (files) => {
    const tree = {};

    files.forEach((file) => {
      const parts = file.path.split("/");
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (i === parts.length - 1) {
          current[part] = {
            type: "file",
            path: file.path,
            content: file.content,
          };
        } else {
          if (!current[part]) {
            current[part] = {
              type: "folder",
              children: {},
            };
          }
          current = current[part].children;
        }
      }
    });

    return tree;
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
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

  const renderFileTreeNode = (name, node, path = "") => {
    const fullPath = path ? `${path}/${name}` : name;

    if (node.type === "file") {
      const isSelected = selectedFile === node.path;

      return (
        <div
          key={node.path}
          className={`file-item ${isSelected ? "selected" : ""}`}
          onClick={() => onFileSelect(node)}
          role="button"
          tabIndex={0}>
          <MaterialIcon
            icon={getFileIcon(name)}
            size={16}
            color={isSelected ? "var(--color-primary)" : "var(--muted)"}
            className="file-icon"
          />
          <span className="file-name">{name}</span>
        </div>
      );
    } else {
      const isExpanded = expandedFolders.has(fullPath);
      const children = node.children || {};
      const childEntries = Object.entries(children);

      return (
        <div key={fullPath} className="folder-container">
          <div className="folder-item" onClick={() => toggleFolder(fullPath)} role="button" tabIndex={0}>
            <MaterialIcon
              icon={isExpanded ? "folder_open" : "folder"}
              size={16}
              color="var(--color-accent)"
              className="folder-icon"
            />
            <span className="folder-name">{name}</span>
            <MaterialIcon
              icon={isExpanded ? "expand_less" : "expand_more"}
              size={14}
              color="var(--muted)"
              className="expand-icon"
            />
          </div>

          {isExpanded && childEntries.length > 0 && (
            <div className="folder-contents">
              {childEntries
                .sort(([, a], [, b]) => {
                  if (a.type !== b.type) {
                    return a.type === "folder" ? -1 : 1;
                  }
                  return 0;
                })
                .map(([childName, childNode]) => renderFileTreeNode(childName, childNode, fullPath))}
            </div>
          )}
        </div>
      );
    }
  };

  const fileTree = buildFileTree(files);
  const rootEntries = Object.entries(fileTree);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h4>Project Files</h4>
        <span className="file-count">{files.length} files</span>
      </div>

      <div className="file-tree-content">
        {rootEntries.length > 0 ? (
          rootEntries
            .sort(([, a], [, b]) => {
              if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
              }
              return 0;
            })
            .map(([name, node]) => renderFileTreeNode(name, node))
        ) : (
          <div className="empty-tree">
            <MaterialIcon icon="folder_open" size={32} color="var(--muted)" />
            <p>No files to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
