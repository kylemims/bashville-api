# CLIENT-SIDE LLM PROMPT: BASHVILLE LAYOUT STASH IMPLEMENTATION

## 🎯 PROJECT VISION & MISSION

You are tasked with implementing the client-side interface for **Bashville - The Layout Stash System**, a revolutionary project generator that transforms how developers create web applications. This is not just another code generator - it's a comprehensive platform where users can:

### **The Vision: "One-Click Project Generation"**
- **Select a Layout Type**: Choose between 4 project architectures (Static React + Tailwind/CSS, Full-Stack React+Django + Tailwind/CSS)
- **Choose Color Palettes**: Apply beautiful, consistent color schemes across the entire project
- **Add Custom Commands**: Include personalized bash scripts and setup commands
- **Generate Complete Projects**: Get fully working, deployable applications with setup scripts
- **Share & Discover**: Community-driven template marketplace (future feature)

### **The User Journey**
1. **Dashboard**: User sees all their project "stashes" with visual type indicators
2. **Creation Flow**: Select layout → Choose colors → Configure backend (if full-stack) → Add commands
3. **Generation**: Click generate → Get complete project files with setup scripts
4. **Download & Deploy**: One-click download, run setup.sh, and have a working application

## 📚 CRITICAL IMPLEMENTATION MATERIALS

You MUST carefully read and understand these three comprehensive guides before beginning any implementation:

### **1. CLIENT_SIDE_IMPLEMENTATION_GUIDE.md**
- **Purpose**: Complete feature specifications and implementation roadmap
- **Key Sections**: 
  - Project type selection module (4 layout types)
  - Enhanced dashboard with filtering
  - Code generation interface with file preview
  - Backend configuration builder for full-stack projects
  - 4-phase implementation strategy
- **CRITICAL**: Follow the exact component specifications and API integration patterns

### **2. API_REFERENCE.md**
- **Purpose**: Complete API documentation with request/response examples
- **Key Sections**:
  - All endpoint specifications with project_type support
  - Expected response structures for code generation
  - File structure documentation for all 4 project types
  - Color palette integration patterns
- **CRITICAL**: Use EXACTLY the API patterns documented - no deviations

### **3. TESTING_GUIDE.md**
- **Purpose**: Comprehensive testing strategy to prevent bugs
- **Key Sections**:
  - Pre-implementation server verification commands
  - Component testing templates with actual test code
  - End-to-end testing scenarios
  - Bug prevention checklist for each phase
- **CRITICAL**: Test each component before moving to the next

## 🎨 UNDERSTANDING THE 4 PROJECT TYPES

### **Static Projects** (Frontend Only)
- **static-tailwind**: React + Vite + Tailwind CSS + Color Variables
- **static-css**: React + Vite + Custom CSS Framework + Color Variables
- **Use Cases**: Landing pages, portfolios, documentation sites
- **Generated Files**: src/App.jsx, index.css, package.json, tailwind.config.js (if tailwind), setup.sh

### **Full-Stack Projects** (Frontend + Backend)
- **fullstack-tailwind**: React frontend + Django REST backend + Tailwind + Color Variables
- **fullstack-css**: React frontend + Django REST backend + Custom CSS + Color Variables  
- **Use Cases**: Web applications, APIs, databases, admin panels
- **Generated Files**: frontend/ folder, Django project structure, models.py, serializers.py, setup.sh

## 🚨 CRITICAL SUCCESS REQUIREMENTS

### **1. INCREMENTAL IMPLEMENTATION**
- **Phase 1**: Layout selection component (Week 1)
- **Phase 2**: Enhanced dashboard (Week 2)  
- **Phase 3**: Code generation UI (Week 3)
- **Phase 4**: Advanced configuration (Week 4)
- **NEVER** implement multiple phases simultaneously
- **TEST** each component thoroughly before proceeding

### **2. API COMPATIBILITY**
- The server-side is **COMPLETE** and **TESTED**
- Use the EXACT API patterns from API_REFERENCE.md
- The `project_type` field is **REQUIRED** for all projects
- Color palette integration must use the documented CSS variable patterns

### **3. NO BREAKING CHANGES**
- **NEVER** remove existing functionality
- **ONLY** add new features to existing components
- **PRESERVE** all current user workflows
- **EXTEND** existing components rather than replacing them

### **4. USER EXPERIENCE PRIORITIES**
- **Visual Clarity**: Each project type must have distinct visual indicators
- **Progressive Disclosure**: Show complexity options only when needed
- **Clear Feedback**: Loading states, error messages, success confirmations
- **Accessibility**: All components must be keyboard navigable and screen-reader friendly

## 🔧 IMPLEMENTATION APPROACH

### **Start Here - Phase 1 Priority Tasks:**

1. **Read ALL Three Guides**: Understand the complete system before coding
2. **Verify Server Status**: Run the verification commands from TESTING_GUIDE.md
3. **Create LayoutSelector Component**: Follow exact specifications from implementation guide
4. **Update Project Creation Modal**: Add project_type selection
5. **Enhance Project Cards**: Add type badges and complexity indicators
6. **Test Thoroughly**: Every change must be tested before proceeding

### **Component Architecture Requirements:**

```javascript
// Example of required component structure
const LayoutSelector = ({ selectedType, onTypeChange, disabled = false }) => {
  const projectTypes = [
    {
      value: 'static-tailwind',
      label: 'Static React + Tailwind', 
      description: 'Modern utility-first CSS framework',
      icon: '⚡',
      category: 'frontend',
      complexity: 'Simple'
    },
    // ... other types as documented
  ];
  
  // Implement exactly as specified in the guide
};
```

### **API Integration Requirements:**

```javascript
// Follow EXACT patterns from API_REFERENCE.md
const createProject = async (projectData) => {
  return await api.post('/projects/', {
    title: projectData.title,
    description: projectData.description,
    project_type: projectData.project_type, // REQUIRED
    color_palette: projectData.color_palette_id,
    backend_config: projectData.backend_config || {}
  });
};
```

## 🎪 THE BIGGER PICTURE

This implementation is laying the foundation for Bashville to become the **GitHub of project templates** where:
- Developers share layout stashes
- Teams collaborate on project configurations  
- Beginners can generate production-ready applications
- Complex architectures become accessible to everyone

### **Quality Standards:**
- **Code Quality**: Clean, maintainable, well-documented code
- **Performance**: Fast loading, efficient rendering, smooth interactions
- **Accessibility**: WCAG compliant, keyboard navigation, screen reader support
- **Responsiveness**: Works perfectly on mobile, tablet, and desktop
- **Error Handling**: Graceful degradation, clear error messages, recovery options

## 📋 YOUR IMMEDIATE ACTION PLAN

### **Before Writing ANY Code:**
1. [ ] Read CLIENT_SIDE_IMPLEMENTATION_GUIDE.md completely
2. [ ] Read API_REFERENCE.md completely  
3. [ ] Read TESTING_GUIDE.md completely
4. [ ] Run server verification commands from testing guide
5. [ ] Understand the 4 project types and their differences
6. [ ] Plan your Phase 1 implementation approach

### **Phase 1 Implementation Checklist:**
1. [ ] Create LayoutSelector component with all 4 project types
2. [ ] Add project_type field to project creation flow
3. [ ] Update ProjectCard to display project type badges
4. [ ] Add basic filtering by project type
5. [ ] Write comprehensive tests for all new components
6. [ ] Verify API integration works correctly
7. [ ] Test all existing functionality still works

### **Communication Protocol:**
- **Ask Questions**: If anything in the guides is unclear, ask for clarification
- **Report Progress**: Update on each completed component
- **Show Evidence**: Provide screenshots or test results when components are complete
- **Flag Issues**: Immediately report any API compatibility problems or unexpected behaviors

## 🎯 SUCCESS METRICS

Your implementation will be considered successful when:
- [ ] All 4 project types can be selected and created
- [ ] Project generation works for all types
- [ ] Generated files match the documented structure
- [ ] Color palettes are properly integrated
- [ ] Setup scripts work correctly
- [ ] All tests pass
- [ ] No existing functionality is broken
- [ ] User experience is intuitive and polished

## 🚀 REMEMBER: YOU'RE BUILDING THE FUTURE

This isn't just a coding task - you're creating a platform that will empower thousands of developers to build better applications faster. Every component you build, every interaction you polish, every bug you prevent contributes to a tool that will democratize web development.

**Take your time, follow the guides meticulously, test thoroughly, and build something amazing!**

---

**Ready to begin? Start by reading the three implementation guides, then report back with your understanding and Phase 1 implementation plan.**
