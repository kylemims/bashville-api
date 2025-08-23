# Client-Side Implementation Guide: Layout Stash System

## Overview
This guide provides detailed instructions for implementing the client-side "Layout Stash" system for Bashville - a comprehensive project generator where users can select layouts, choose colors, and generate complete working projects (static React frontends or full-stack React+Django applications).

## Current Server-Side Implementation Status

### ✅ Completed Backend Features
- **Project Model Enhanced**: Added `project_type` field with 4 choices:
  - `static-tailwind`: Static React + Tailwind CSS
  - `static-css`: Static React + Custom CSS  
  - `fullstack-tailwind`: Full-Stack (React + Django) + Tailwind
  - `fullstack-css`: Full-Stack (React + Django) + Custom CSS

- **API Endpoints Ready**:
  - `GET/POST /projects/` - List/Create projects with project_type support
  - `GET/PUT/DELETE /projects/{id}/` - Project CRUD with layout type
  - `POST /codegen/generate/` - Generate complete project files based on type
  - `GET /colorpalettes/` - Color palette selection
  - `GET /commands/` - Bash command management

- **Layout Template System**: Complete template infrastructure for all 4 project types
- **Master Setup Scripts**: Automated project generation with color integration
- **Color Palette Integration**: CSS variables work across all project types

### Required Client-Side Implementation

## 1. PROJECT TYPE SELECTION MODULE

### 1.1 Create Layout Selection Component
**File**: `src/components/LayoutSelector.jsx`

```jsx
// Required functionality:
const LayoutSelector = ({ selectedType, onTypeChange, disabled = false }) => {
  const projectTypes = [
    {
      value: 'static-tailwind',
      label: 'Static React + Tailwind',
      description: 'Modern utility-first CSS framework',
      icon: '⚡',
      category: 'frontend'
    },
    {
      value: 'static-css',
      label: 'Static React + Custom CSS',
      description: 'Traditional CSS with full control',
      icon: '🎨',
      category: 'frontend'
    },
    {
      value: 'fullstack-tailwind',
      label: 'Full-Stack + Tailwind',
      description: 'React frontend + Django backend + Tailwind',
      icon: '🚀',
      category: 'fullstack'
    },
    {
      value: 'fullstack-css',
      label: 'Full-Stack + Custom CSS',
      description: 'React frontend + Django backend + Custom CSS',
      icon: '⚙️',
      category: 'fullstack'
    }
  ];

  // Implement card-based selection UI with visual indicators
  // Include category grouping (Frontend vs Full-Stack)
  // Show complexity indicators and estimated setup time
  // Include preview thumbnails if possible
};
```

### 1.2 Update Project Creation Flow
**Files to Modify**:
- `src/components/ProjectModal.jsx` (or equivalent)
- `src/pages/Dashboard.jsx`

**Required Changes**:
```jsx
// Add project_type to project creation/editing forms
const [projectData, setProjectData] = useState({
  title: '',
  description: '',
  project_type: 'static-tailwind', // Default value
  color_palette: null,
  backend_config: {}
});

// Include LayoutSelector in project creation modal
<LayoutSelector 
  selectedType={projectData.project_type}
  onTypeChange={(type) => setProjectData({...projectData, project_type: type})}
/>
```

## 2. ENHANCED PROJECT DASHBOARD

### 2.1 Project Cards Enhancement
**File**: `src/components/ProjectCard.jsx`

**Add Visual Indicators**:
```jsx
// Display project type with appropriate styling
const getProjectTypeConfig = (type) => {
  const configs = {
    'static-tailwind': { 
      color: 'bg-blue-500', 
      label: 'Static + Tailwind',
      complexity: 'Simple'
    },
    'static-css': { 
      color: 'bg-green-500', 
      label: 'Static + CSS',
      complexity: 'Simple'
    },
    'fullstack-tailwind': { 
      color: 'bg-purple-500', 
      label: 'Full-Stack + Tailwind',
      complexity: 'Advanced'
    },
    'fullstack-css': { 
      color: 'bg-orange-500', 
      label: 'Full-Stack + CSS',
      complexity: 'Advanced'
    }
  };
  return configs[type] || configs['static-tailwind'];
};

// Add project type badge to card header
// Include complexity indicator
// Show appropriate action buttons based on type
```

### 2.2 Project Filtering
**File**: `src/components/ProjectFilters.jsx`

```jsx
// Add filters for project types
const ProjectFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    project_type: 'all',
    complexity: 'all',
    category: 'all' // frontend, fullstack, all
  });

  // Implement filter logic
  // Include search functionality
  // Add sorting options (created_at, title, complexity)
};
```

## 3. CODE GENERATION INTERFACE

### 3.1 Generate Project Modal
**File**: `src/components/GenerateProjectModal.jsx`

```jsx
const GenerateProjectModal = ({ project, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post('/codegen/generate/', {
        project_id: project.id
      });
      
      setGeneratedFiles(response.data);
      // Show success state with download options
      // Display setup instructions
      // Provide file preview capability
    } catch (error) {
      // Handle generation errors
    } finally {
      setIsGenerating(false);
    }
  };

  // Include:
  // - Project type confirmation
  // - Color palette preview
  // - Backend configuration summary (for full-stack)
  // - Generation progress indicator
  // - File download interface
  // - Setup instructions display
};
```

### 3.2 File Preview System
**File**: `src/components/FilePreview.jsx`

```jsx
// Create syntax-highlighted file viewer
// Support for multiple file types (JS, CSS, Python, JSON, etc.)
// File tree navigation
// Copy to clipboard functionality
// Download individual files or entire project
```

## 4. BACKEND CONFIGURATION BUILDER

### 4.1 Model Builder (Full-Stack Projects)
**File**: `src/components/ModelBuilder.jsx`

```jsx
const ModelBuilder = ({ config, onChange }) => {
  // Visual model designer
  // Field type selection (CharField, IntegerField, ForeignKey, etc.)
  // Relationship mapping
  // Validation rules
  // Auto-generate REST API endpoints
  
  const fieldTypes = [
    'CharField', 'TextField', 'IntegerField', 'FloatField',
    'BooleanField', 'DateField', 'DateTimeField', 'EmailField',
    'ForeignKey', 'ManyToManyField', 'OneToOneField'
  ];

  // Implement drag-and-drop model creation
  // Field property configuration
  // Model relationship visualization
};
```

### 4.2 Configuration Tabs
**File**: `src/components/ProjectConfigTabs.jsx`

```jsx
// Create tabbed interface for full-stack projects:
// 1. Layout Selection
// 2. Color Palette
// 3. Backend Models (fullstack only)
// 4. Commands & Scripts
// 5. Generation Preview
```

## 5. TESTING STRATEGY

### 5.1 API Integration Tests
```jsx
// Create comprehensive test suite
// Test all project types creation/editing
// Verify generation endpoint responses
// Validate file structure for each project type
// Test error handling and edge cases
```

### 5.2 Component Testing
```jsx
// Unit tests for all new components
// Integration tests for complete workflows
// Visual regression tests for layout consistency
// Accessibility testing for all new UI elements
```

## 6. IMPLEMENTATION PHASES

### Phase 1: Core Layout Selection (Week 1)
- [ ] Create LayoutSelector component
- [ ] Update project creation modal
- [ ] Modify ProjectCard to show project type
- [ ] Add basic filtering by project type
- [ ] Test CRUD operations with project_type field

### Phase 2: Enhanced Dashboard (Week 2)
- [ ] Implement project filtering and sorting
- [ ] Add complexity indicators
- [ ] Create project type management
- [ ] Enhance project cards with type-specific styling
- [ ] Add bulk operations by project type

### Phase 3: Code Generation UI (Week 3)
- [ ] Build GenerateProjectModal
- [ ] Implement file preview system
- [ ] Create download and copy functionality
- [ ] Add generation progress tracking
- [ ] Display setup instructions

### Phase 4: Advanced Configuration (Week 4)
- [ ] Build ModelBuilder for full-stack projects
- [ ] Create configuration tabs system
- [ ] Implement advanced backend config options
- [ ] Add configuration validation
- [ ] Create configuration templates/presets

## 7. CRITICAL INTEGRATION POINTS

### 7.1 API Compatibility Requirements
```javascript
// Ensure these API patterns are followed:

// Creating projects with project_type
const createProject = async (projectData) => {
  return await api.post('/projects/', {
    title: projectData.title,
    description: projectData.description,
    project_type: projectData.project_type, // REQUIRED FIELD
    color_palette: projectData.color_palette_id,
    backend_config: projectData.backend_config || {}
  });
};

// Generating project files
const generateProject = async (projectId) => {
  return await api.post('/codegen/generate/', {
    project_id: projectId
  });
};

// Expected response structure
{
  "project_id": 1,
  "project_name": "myproject",
  "project_type": "static-tailwind",
  "app_label": "generated_app",
  "files": {
    "src/App.jsx": "...",
    "src/index.css": "...",
    "tailwind.config.js": "...",
    "setup.sh": "..."
  },
  "setup_instructions": {
    "message": "Static React project generated!",
    "steps": ["chmod +x setup.sh", "./setup.sh", "npm run dev"]
  }
}
```

### 7.2 Error Handling Patterns
```javascript
// Handle specific error cases:
// - Missing project_type field
// - Invalid project type values
// - Generation failures
// - Missing templates
// - Color palette integration issues
```

## 8. UI/UX CONSIDERATIONS

### 8.1 Visual Design Requirements
- **Project Type Badges**: Color-coded, consistent styling
- **Complexity Indicators**: Simple/Advanced with appropriate icons
- **Category Grouping**: Frontend vs Full-Stack clear separation
- **Progress Indicators**: Clear feedback during generation
- **File Tree Display**: Organized, searchable file structure

### 8.2 User Experience Flow
1. **Project Creation**: Layout type selection as primary choice
2. **Configuration**: Progressive disclosure based on project type
3. **Generation**: Clear progress and success states
4. **Download**: Multiple format options (ZIP, individual files)
5. **Instructions**: Context-aware setup guidance

## 9. QUALITY ASSURANCE CHECKLIST

### 9.1 Pre-Implementation Verification
- [ ] Confirm all API endpoints return expected data structure
- [ ] Verify project_type field is properly serialized
- [ ] Test generation endpoint with all 4 project types
- [ ] Validate color palette integration works
- [ ] Confirm file structure matches expected patterns

### 9.2 Post-Implementation Testing
- [ ] All project types can be created/edited/deleted
- [ ] Generation works for all combinations
- [ ] File downloads are properly formatted
- [ ] Setup instructions are accurate
- [ ] Color palettes apply correctly to generated code
- [ ] Error states are handled gracefully
- [ ] Performance is acceptable for large projects
- [ ] Mobile responsiveness is maintained

## 10. DEPLOYMENT CONSIDERATIONS

### 10.1 Backward Compatibility
- Ensure existing projects without project_type still function
- Default to 'static-tailwind' for legacy projects
- Graceful handling of missing layout templates

### 10.2 Feature Flags
- Consider implementing feature flags for gradual rollout
- Allow disabling advanced features during testing
- Provide fallback options for generation failures

---

## IMPORTANT REMINDERS FOR CLIENT-SIDE LLM

1. **NEVER REMOVE EXISTING FUNCTIONALITY** - Only add new features
2. **TEST THOROUGHLY** - Each change should be verified before proceeding
3. **MAINTAIN API COMPATIBILITY** - Follow the exact API patterns documented
4. **PROGRESSIVE ENHANCEMENT** - Build features in phases to avoid breaking changes
5. **ERROR HANDLING FIRST** - Implement robust error handling for all new features
6. **USER FEEDBACK** - Provide clear loading states and success/error messages
7. **ACCESSIBILITY** - Ensure all new components are accessible
8. **RESPONSIVE DESIGN** - Maintain mobile compatibility throughout

The server-side is fully ready and tested. Focus on careful, incremental implementation of each component with thorough testing at every step.
