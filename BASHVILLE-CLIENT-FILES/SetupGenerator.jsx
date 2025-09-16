import { useState } from "react";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { generateBashScript } from "../../utils/generateBashScript.js";
import { generateReadme } from "../../utils/generateReadme.js";
import { copyToClipboard } from "../../utils/copyToClipboard.js";
import { downloadFile } from "../../utils/downloadFile.js";
import "./SetupGenerator.css";

export const SetupGenerator = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState("bash");
  const [copyStatus, setCopyStatus] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);

  if (!project) {
    return null;
  }

  const bashScript = generateBashScript(project);
  const readmeContent = generateReadme(project);

  const handleCopy = async (content, type) => {
    try {
      await copyToClipboard(content);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleDownload = (content, filename) => {
    try {
      downloadFile(content, filename);
      setDownloadStatus(filename);
      setTimeout(() => setDownloadStatus(null), 3000);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const getFileHeader = () => {
    if (activeTab === "bash") {
      return {
        title: "Executable Bash Script",
        description: "Copy this script and save as setup.sh, then run chmod +x setup.sh && ./setup.sh",
      };
    } else {
      return {
        title: "Project Documentation",
        description: "Comprehensive README with setup instructions and color palette",
      };
    }
  };

  const fileHeader = getFileHeader();

  return (
    <div className="setup-generator-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="setup-generator-modal">
        <div className="setup-generator-header">
          <h2>Generate Setup Files</h2>
          <ActionButton onClick={onClose} variant="back-secondary" size="sm">
            <MaterialIcon icon="close" size={24} />
          </ActionButton>
        </div>

        <div className="setup-generator-tabs">
          <button
            className={`tab-button ${activeTab === "bash" ? "active" : ""}`}
            onClick={() => setActiveTab("bash")}>
            setup.sh
          </button>
          <button
            className={`tab-button ${activeTab === "readme" ? "active" : ""}`}
            onClick={() => setActiveTab("readme")}>
            README.md
          </button>
        </div>

        <div className="setup-generator-content">
          <div className="file-preview">
            <div className="file-header">
              <h3>{fileHeader.title}</h3>
              <p>{fileHeader.description}</p>
            </div>

            {copyStatus && (
              <div className="file-status">
                <span className="status-icon">✅</span>
                <span>{activeTab === "bash" ? "Bash script" : "README"} copied to clipboard!</span>
              </div>
            )}

            <div className="file-actions">
              <ActionButton
                onClick={() => handleCopy(activeTab === "bash" ? bashScript : readmeContent, activeTab)}
                variant="primary"
                size="sm">
                <MaterialIcon icon="content_copy" size={16} />
                {copyStatus === activeTab ? "Copied!" : "Copy"}
              </ActionButton>
              {downloadStatus && (
                <div className="file-status">
                  <span className="status-icon">✅</span>
                  <span>
                    {downloadStatus} downloaded.
                    {downloadStatus === "setup.sh" && " Run: chmod +x setup.sh && ./setup.sh"}
                  </span>
                </div>
              )}
              <ActionButton
                onClick={() =>
                  handleDownload(
                    activeTab === "bash" ? bashScript : readmeContent,
                    activeTab === "bash" ? "setup.sh" : "README.md"
                  )
                }
                variant="secondary"
                size="sm">
                <MaterialIcon icon="download" size={16} />
                Download
              </ActionButton>
            </div>

            <pre className="code-preview">
              <code>{activeTab === "bash" ? bashScript : readmeContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
