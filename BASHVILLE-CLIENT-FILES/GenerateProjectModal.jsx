import { useState } from "react";
import { generateCodeForProject } from "../../services/codeGenService.js";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import { LoadingSpinner } from "../common/LoadingSpinner.jsx";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { FileTree } from "./FileTree.jsx";
import { FilePreview } from "./FilePreview.jsx";
import { ProjectDownloader } from "./ProjectDownloader.jsx";
import "./GenerateProjectModal.css";

export const GenerateProjectModal = ({ project, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("files");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleGenerate = async () => {
    if (!project?.id) {
      setError("No project selected for generation");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log("Generating project files for project ID:", project.id);
      const result = await generateCodeForProject(project.id);
      console.log("Generation result:", result);

      setGenerationResult(result);
      setActiveTab("files");

      // Auto-select the first file for preview
      if (result.files && result.files.length > 0) {
        setSelectedFile(result.files[0].path);
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setError(`Failed to generate project: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file.path);
  };

  const handleDownloadComplete = (projectName) => {
    console.log(`Downloaded project: ${projectName}`);
    // TODO: plug in success message after testing
  };

  const handleClose = () => {
    setGenerationResult(null);
    setSelectedFile(null);
    setError(null);
    setActiveTab("files");
    onClose();
  };

  const getSelectedFileContent = () => {
    if (!selectedFile || !generationResult?.files) return null;
    return generationResult.files.find((f) => f.path === selectedFile);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-container large">
        <div className="modal-header">
          <h2>Generate Project</h2>
          <ActionButton onClick={handleClose} variant="secondary" size="sm">
            <MaterialIcon icon="close" size={20} />
          </ActionButton>
        </div>

        <div className="modal-content">
          {!generationResult ? (
            <div className="generation-start">
              <div className="project-summary">
                <h3>{project?.title || "Untitled Project"}</h3>
                <p>{project?.description || "No description provided"}</p>

                <div className="project-config">
                  <div className="config-item">
                    <span className="config-label">Type:</span>
                    <span className="config-value">{project?.project_type || "static-tailwind"}</span>
                  </div>
                  {project?.color_palette_preview && (
                    <div className="config-item">
                      <span className="config-label">Colors:</span>
                      <span className="config-value">{project.color_palette_preview.name}</span>
                    </div>
                  )}
                  <div className="config-item">
                    <span className="config-label">Commands:</span>
                    <span className="config-value">
                      {project?.commands_preview?.length || 0} bash commands
                    </span>
                  </div>
                </div>
              </div>

              <ErrorMessage message={error} onDismiss={() => setError(null)} />

              <div className="generation-actions">
                <ActionButton variant="primary" size="lg" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generating Project...
                    </>
                  ) : (
                    <>
                      <MaterialIcon icon="auto_fix_high" size={20} />
                      Generate Complete Project
                    </>
                  )}
                </ActionButton>

                <p className="generation-note">
                  This will create a complete React project with all files, setup scripts, and documentation.
                </p>
              </div>
            </div>
          ) : (
            <div className="generation-result">
              <div className="result-header">
                <h3>
                  <MaterialIcon icon="check_circle" size={20} color="var(--color-accent)" />
                  Project Generated Successfully!
                </h3>
                <p>{generationResult.files?.length || 0} files created</p>
              </div>

              <div className="result-tabs">
                <button
                  className={`tab ${activeTab === "files" ? "active" : ""}`}
                  onClick={() => setActiveTab("files")}>
                  <MaterialIcon icon="folder" size={16} />
                  Files ({generationResult.files?.length || 0})
                </button>
                <button
                  className={`tab ${activeTab === "download" ? "active" : ""}`}
                  onClick={() => setActiveTab("download")}>
                  <MaterialIcon icon="download" size={16} />
                  Download
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "files" ? (
                  <div className="file-explorer">
                    <div className="file-tree-panel">
                      <FileTree
                        files={generationResult.files || []}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                      />
                    </div>

                    <div className="file-preview-panel">
                      {selectedFile ? (
                        <FilePreview
                          filename={selectedFile}
                          content={getSelectedFileContent()?.content || ""}
                        />
                      ) : (
                        <div className="no-file-selected">
                          <MaterialIcon icon="description" size={48} color="var(--muted)" />
                          <p>Select a file to preview its content</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ProjectDownloader
                    project={project}
                    files={generationResult.files || []}
                    setupInstructions={generationResult.setup_instructions || { message: "", steps: [] }}
                    onDownloadComplete={handleDownloadComplete}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
