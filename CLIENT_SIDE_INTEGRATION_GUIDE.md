# CLIENT-SIDE UPDATE INSTRUCTIONS: Server-Side Integration

## 🎯 OVERVIEW

The server-side has been significantly enhanced to generate **complete React projects** instead of just bash scripts. Your client-side interface needs updates to handle the new API response structure and provide a better user experience for downloading and previewing complete project files.

## 📋 SERVER-SIDE CHANGES SUMMARY

### **What Changed on the Server:**

#### **1. Enhanced Project Model**
- **Added `project_type` field** with 4 choices:
  - `static-tailwind`: Static React + Tailwind CSS
  - `static-css`: Static React + Custom CSS
  - `fullstack-tailwind`: Full-Stack (React + Django) + Tailwind
  - `fullstack-css`: Full-Stack (React + Django) + Custom CSS

#### **2. Complete Template System**
- **Added layout templates** in `/bashvilleapi/codegen/templates/layouts/`
- **react-css/** and **react-tailwind/** folders with complete React project templates
- **Each template includes:**
  - `src/App.jsx.j2` - Main React component with starter layout
  - `src/main.jsx.j2` - React entry point
  - `src/index.css.j2` - Complete CSS framework with color variables
  - `index.html.j2` - HTML template
  - `package.json.j2` - Dependencies and scripts
  - `vite.config.js.j2` - Vite configuration
  - `tailwind.config.js.j2` - Tailwind config (for Tailwind projects)

#### **3. Enhanced Code Generation API**
- **POST /codegen/generate/** now returns complete project structure
- **Generates 6-8 files** instead of just a bash script
- **Includes setup instructions** specific to project type
- **Color palette integration** throughout all templates

#### **4. Updated Response Structure**
**OLD Response:**
```json
{
  "files": {
    "setup.sh": "#!/bin/bash script content"
  }
}
```

**NEW Response:**
```json
{
  "project_id": 1,
  "project_name": "project-name",
  "project_type": "static-css",
  "app_label": "generated_app",
  "files": {
    "src/App.jsx": "React component content...",
    "src/main.jsx": "React entry point...",
    "src/index.css": "CSS with color variables...",
    "index.html": "HTML template...",
    "package.json": "Dependencies...",
    "vite.config.js": "Vite config...",
    "setup.sh": "Enhanced setup script..."
  },
  "setup_instructions": {
    "message": "Static React project generated! Ready for frontend development.",
    "steps": ["chmod +x setup.sh", "./setup.sh", "npm run dev"]
  }
}
```

## 🔧 REQUIRED CLIENT-SIDE UPDATES

### **PHASE 1: API Integration Updates**

#### **1.1 Update Project Creation/Editing Forms**

**Files to Modify:**
- Project creation modal component
- Project editing forms
- Project validation

**Required Changes:**

```javascript
// Add project_type to your project form state
const [projectData, setProjectData] = useState({
  title: '',
  description: '',
  project_type: 'static-tailwind', // NEW REQUIRED FIELD
  color_palette: null,
  backend_config: {}
});

// Update your API calls to include project_type
const createProject = async (projectData) => {
  return await api.post('/projects/', {
    title: projectData.title,
    description: projectData.description,
    project_type: projectData.project_type, // REQUIRED
    color_palette: projectData.color_palette_id,
    backend_config: projectData.backend_config || {}
  });
};

// Add project type validation
const validateProject = (data) => {
  const validTypes = ['static-tailwind', 'static-css', 'fullstack-tailwind', 'fullstack-css'];
  if (!validTypes.includes(data.project_type)) {
    throw new Error('Invalid project type');
  }
  // ... other validation
};
```

#### **1.2 Update Project Display Components**

**Files to Modify:**
- Project card components
- Project list components
- Project detail views

**Required Changes:**

```javascript
// Add project type badge/indicator to project cards
const ProjectCard = ({ project }) => {
  const getProjectTypeConfig = (type) => {
    const configs = {
      'static-tailwind': { 
        color: 'bg-blue-500', 
        label: 'Static + Tailwind',
        icon: '⚡'
      },
      'static-css': { 
        color: 'bg-green-500', 
        label: 'Static + CSS',
        icon: '🎨'
      },
      'fullstack-tailwind': { 
        color: 'bg-purple-500', 
        label: 'Full-Stack + Tailwind',
        icon: '🚀'
      },
      'fullstack-css': { 
        color: 'bg-orange-500', 
        label: 'Full-Stack + CSS',
        icon: '⚙️'
      }
    };
    return configs[type] || configs['static-tailwind'];
  };

  const typeConfig = getProjectTypeConfig(project.project_type);

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className={`project-type-badge ${typeConfig.color}`}>
          {typeConfig.icon} {typeConfig.label}
        </span>
      </div>
      {/* ... rest of card content */}
    </div>
  );
};
```

### **PHASE 2: File Handling System**

#### **2.1 Create File Tree Component**

**New File:** `src/components/FileTree.jsx`

```javascript
import React, { useState } from 'react';

const FileTree = ({ files, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));

  // Organize flat file list into tree structure
  const organizeFiles = (files) => {
    const tree = {};
    
    files.forEach(file => {
      const path = file.path;
      const parts = path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          current[part] = {
            type: 'file',
            content: file.content,
            path: file.path
          };
        } else {
          // This is a folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    
    return tree;
  };

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (tree, level = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      if (node.type === 'file') {
        return (
          <div
            key={node.path}
            className={`file-item ${selectedFile === node.path ? 'selected' : ''}`}
            style={{ paddingLeft: `${level * 20 + 20}px` }}
            onClick={() => onFileSelect(node.path)}
          >
            <span className="file-icon">📄</span>
            {name}
          </div>
        );
      } else {
        const isExpanded = expandedFolders.has(name);
        return (
          <div key={name}>
            <div
              className="folder-item"
              style={{ paddingLeft: `${level * 20}px` }}
              onClick={() => toggleFolder(name)}
            >
              <span className="folder-icon">
                {isExpanded ? '📂' : '📁'}
              </span>
              {name}
            </div>
            {isExpanded && renderTree(node.children, level + 1)}
          </div>
        );
      }
    });
  };

  const tree = organizeFiles(files);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h4>📁 Project Files</h4>
      </div>
      <div className="file-tree-content">
        {renderTree(tree)}
      </div>
    </div>
  );
};

export default FileTree;
```

**Add corresponding CSS:**

```css
/* Add to your main CSS file */
.file-tree {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  max-height: 400px;
  overflow-y: auto;
}

.file-tree-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.file-tree-header h4 {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.file-item,
.folder-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
}

.file-item:hover,
.folder-item:hover {
  background-color: #f3f4f6;
}

.file-item.selected {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.file-icon,
.folder-icon {
  font-size: 12px;
}
```

#### **2.2 Create File Preview Component**

**New File:** `src/components/FilePreview.jsx`

```javascript
import React from 'react';
// You'll need to install: npm install react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const FilePreview = ({ filename, content, onCopy }) => {
  const getLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'jsx': 'jsx',
      'js': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'sh': 'bash',
      'py': 'python',
      'md': 'markdown'
    };
    return languageMap[ext] || 'text';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy && onCopy(filename);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop(); // Get just the filename
    a.click();
    URL.revokeObjectURL(url);
  };

  const language = getLanguage(filename);

  return (
    <div className="file-preview">
      <div className="file-preview-header">
        <div className="file-info">
          <span className="file-name">{filename}</span>
          <span className="file-language">{language}</span>
        </div>
        <div className="file-actions">
          <button 
            onClick={copyToClipboard}
            className="btn btn-sm btn-outline"
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
          <button 
            onClick={downloadFile}
            className="btn btn-sm btn-outline"
            title="Download file"
          >
            💾 Download
          </button>
        </div>
      </div>
      <div className="file-content">
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            margin: 0,
            background: '#fafafa',
            fontSize: '13px'
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default FilePreview;
```

**Add corresponding CSS:**

```css
.file-preview {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  height: 100%;
}

.file-preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-weight: 600;
  color: #374151;
}

.file-language {
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-content {
  height: calc(100% - 60px);
  overflow: auto;
}
```

#### **2.3 Create Enhanced Download Component**

**New File:** `src/components/ProjectDownloader.jsx`

```javascript
import React, { useState } from 'react';
// You'll need to install: npm install jszip
import JSZip from 'jszip';

const ProjectDownloader = ({ 
  files, 
  projectName, 
  setupInstructions,
  onDownloadStart,
  onDownloadComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateZIP = async () => {
    setIsGenerating(true);
    onDownloadStart && onDownloadStart();

    try {
      const zip = new JSZip();

      // Add all files to ZIP with proper directory structure
      Object.entries(files).forEach(([filepath, content]) => {
        // Skip error files
        if (filepath.startsWith('_') && filepath.endsWith('_error')) {
          return;
        }
        zip.file(filepath, content);
      });

      // Add README with setup instructions
      const readmeContent = generateReadme(setupInstructions);
      zip.file('README.md', readmeContent);

      // Generate ZIP blob
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Download the ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onDownloadComplete && onDownloadComplete(true);
    } catch (error) {
      console.error('Download failed:', error);
      onDownloadComplete && onDownloadComplete(false, error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReadme = (instructions) => {
    return `# ${projectName}

## 🚀 Quick Start

${instructions.message}

### Setup Steps:
${instructions.steps.map((step, index) => `${index + 1}. \`${step}\``).join('\n')}

### What's Included:
${files.filter(f => !f.path.startsWith('_')).map(f => `- \`${f.path}\``).join('\n')}

### Development:
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

Generated by Bashville - The Layout Stash System
`;
  };

  const fileCount = files.filter(f => !f.path.startsWith('_')).length;

  return (
    <div className="project-downloader">
      <div className="download-summary">
        <h4>📦 Download Project</h4>
        <p>{fileCount} files ready for download</p>
        
        <div className="file-list">
          {files
            .filter(f => !f.path.startsWith('_'))
            .map(file => (
            <div key={file.path} className="file-item-summary">
              <span className="file-icon">
                {file.path.endsWith('.jsx') ? '⚛️' : 
                 file.path.endsWith('.css') ? '🎨' :
                 file.path.endsWith('.html') ? '🌐' :
                 file.path.endsWith('.json') ? '📋' :
                 file.path.endsWith('.sh') ? '⚙️' : '📄'}
              </span>
              {file.path}
            </div>
          ))}
        </div>

        <div className="setup-preview">
          <h5>Setup Instructions:</h5>
          <div className="setup-steps">
            {setupInstructions.steps.map((step, index) => (
              <code key={index} className="setup-step">
                {step}
              </code>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={generateZIP}
        disabled={isGenerating}
        className="btn btn-primary btn-lg download-btn"
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span>
            Generating ZIP...
          </>
        ) : (
          <>
            💾 Download Project ZIP
          </>
        )}
      </button>
    </div>
  );
};

export default ProjectDownloader;
```

**Add corresponding CSS:**

```css
.project-downloader {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.download-summary h4 {
  margin: 0 0 8px 0;
  color: #374151;
}

.download-summary p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.file-list {
  margin: 16px 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
}

.file-item-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 14px;
  color: #374151;
}

.file-icon {
  font-size: 16px;
}

.setup-preview {
  margin: 16px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.setup-preview h5 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.setup-steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setup-step {
  background: #1f2937;
  color: #f9fafb;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.download-btn {
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### **PHASE 3: Enhanced Generation Modal**

#### **3.1 Update Generation Modal Component**

**File to Modify:** Your existing generation modal component

**Required Changes:**

```javascript
import React, { useState } from 'react';
import FileTree from './FileTree';
import FilePreview from './FilePreview';
import ProjectDownloader from './ProjectDownloader';

const GenerateProjectModal = ({ project, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'download'
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const response = await api.post('/codegen/generate/', {
        project_id: project.id
      });

      const result = response.data;
      setGenerationResult(result);

      // Auto-select first file for preview
      const files = result.files.filter(f => !f.path.startsWith('_'));
      if (files.length > 0) {
        setSelectedFile(files[0].path);
      }

      setActiveTab('preview');
    } catch (error) {
      console.error('Generation failed:', error);
      // Handle error appropriately
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyFile = (filename) => {
    setCopyFeedback(`Copied ${filename}!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleDownloadStart = () => {
    console.log('Download started...');
  };

  const handleDownloadComplete = (success, error) => {
    if (success) {
      console.log('Download completed successfully!');
      // Show success message
    } else {
      console.error('Download failed:', error);
      // Show error message
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        <div className="modal-header">
          <h2>🚀 Generate Project: {project.title}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-content">
          {!generationResult ? (
            <div className="generation-start">
              <div className="project-summary">
                <h3>Project Configuration</h3>
                <div className="config-item">
                  <strong>Type:</strong> {project.project_type}
                </div>
                <div className="config-item">
                  <strong>Color Palette:</strong> {project.color_palette_preview?.name || 'None'}
                </div>
                <div className="config-item">
                  <strong>Commands:</strong> {project.commands_preview?.length || 0} configured
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-primary btn-lg"
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Project Files'
                )}
              </button>
            </div>
          ) : (
            <div className="generation-result">
              <div className="result-header">
                <h3>✅ Generation Complete!</h3>
                <p>{generationResult.setup_instructions.message}</p>
                
                <div className="result-tabs">
                  <button
                    className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    👁️ Preview Files
                  </button>
                  <button
                    className={`tab ${activeTab === 'download' ? 'active' : ''}`}
                    onClick={() => setActiveTab('download')}
                  >
                    💾 Download
                  </button>
                </div>
              </div>

              {copyFeedback && (
                <div className="copy-feedback">
                  {copyFeedback}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="file-explorer">
                  <div className="file-tree-panel">
                    <FileTree
                      files={generationResult.files}
                      onFileSelect={setSelectedFile}
                      selectedFile={selectedFile}
                    />
                  </div>
                  <div className="file-preview-panel">
                    {selectedFile ? (
                      <FilePreview
                        filename={selectedFile}
                        content={generationResult.files.find(f => f.path === selectedFile)?.content || ''}
                        onCopy={handleCopyFile}
                      />
                    ) : (
                      <div className="no-file-selected">
                        Select a file to preview
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'download' && (
                <ProjectDownloader
                  files={generationResult.files}
                  projectName={generationResult.project_name}
                  setupInstructions={generationResult.setup_instructions}
                  onDownloadStart={handleDownloadStart}
                  onDownloadComplete={handleDownloadComplete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateProjectModal;
```

**Add corresponding CSS:**

```css
.modal-container.large {
  max-width: 1200px;
  width: 90vw;
  height: 80vh;
}

.generation-start {
  text-align: center;
  padding: 40px 20px;
}

.project-summary {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: left;
}

.config-item {
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.config-item:last-child {
  border-bottom: none;
}

.result-header {
  margin-bottom: 20px;
}

.result-tabs {
  display: flex;
  gap: 4px;
  margin-top: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
}

.tab.active {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

.copy-feedback {
  background: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  text-align: center;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

.file-explorer {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  height: 60vh;
}

.file-tree-panel,
.file-preview-panel {
  height: 100%;
}

.no-file-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

@media (max-width: 768px) {
  .file-explorer {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }
  
  .modal-container.large {
    width: 95vw;
    height: 90vh;
  }
}
```

### **PHASE 4: Dependencies and Installation**

#### **4.1 Install Required Packages**

Add these dependencies to your package.json:

```bash
npm install jszip react-syntax-highlighter
```

#### **4.2 Update Import Statements**

In your main components that use the generation modal, ensure you import the new components:

```javascript
// In your main App.js or routing file
import GenerateProjectModal from './components/GenerateProjectModal';

// Ensure all the new components are properly imported in GenerateProjectModal
import FileTree from './FileTree';
import FilePreview from './FilePreview';
import ProjectDownloader from './ProjectDownloader';
```

### **PHASE 5: Error Handling Updates**

#### **5.1 Enhanced Error Handling**

**File to Modify:** Your API service file

```javascript
// Update your API service to handle new error scenarios
const generateProject = async (projectId) => {
  try {
    const response = await api.post('/codegen/generate/', {
      project_id: projectId
    });

    const result = response.data;

    // Check for generation errors in the files array
    const errorFiles = result.files.filter(file => 
      file.path.startsWith('_') && file.path.endsWith('_error')
    );

    if (errorFiles.length > 0) {
      const errors = errorFiles.map(f => f.content).join(', ');
      throw new Error(`Generation failed: ${errors}`);
    }

    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Project not found');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid project configuration');
    } else {
      throw new Error(error.message || 'Generation failed');
    }
  }
};
```

### **PHASE 6: Testing Checklist**

#### **6.1 Component Testing**

Test each new component individually:

1. **FileTree Component:**
   - [ ] Displays file structure correctly
   - [ ] Handles folder expansion/collapse
   - [ ] File selection works
   - [ ] Handles empty file lists

2. **FilePreview Component:**
   - [ ] Syntax highlighting works for all file types
   - [ ] Copy functionality works
   - [ ] Download individual files works
   - [ ] Handles large files gracefully

3. **ProjectDownloader Component:**
   - [ ] ZIP generation works
   - [ ] All files included in ZIP
   - [ ] README generation works
   - [ ] Download progress feedback works

4. **Enhanced Generation Modal:**
   - [ ] Tab switching works
   - [ ] File preview integration works
   - [ ] Download integration works
   - [ ] Error handling works
   - [ ] Loading states work

#### **6.2 Integration Testing**

Test the complete workflow:

1. **Create Project with project_type:**
   - [ ] All 4 project types can be selected
   - [ ] project_type is saved correctly
   - [ ] Project cards show type correctly

2. **Generate Project:**
   - [ ] Generation works for all project types
   - [ ] File structure is correct
   - [ ] Color palettes are applied
   - [ ] Setup instructions are accurate

3. **Download and Test:**
   - [ ] ZIP downloads correctly
   - [ ] Extracted files are complete
   - [ ] Setup script works (test manually)
   - [ ] Generated React projects run successfully

## 🎯 SUCCESS CRITERIA

Your implementation will be successful when:

- [ ] All 4 project types can be created and generated
- [ ] File preview shows all generated files with syntax highlighting
- [ ] ZIP download includes all files with proper structure
- [ ] Setup instructions are displayed correctly
- [ ] Generated projects can be extracted and run successfully
- [ ] No existing functionality is broken
- [ ] Error handling works for all scenarios
- [ ] UI is responsive and user-friendly

## 📞 SUPPORT

If you encounter any issues during implementation:

1. **Check the server-side templates** in `/bashvilleapi/codegen/templates/layouts/`
2. **Verify API responses** match the documented structure
3. **Test with different project types** to ensure consistency
4. **Check browser console** for JavaScript errors
5. **Validate file structure** in generated ZIPs

Remember: The server-side is complete and tested. Focus on careful integration of the new API response structure and providing an excellent user experience for downloading and previewing complete React projects.
