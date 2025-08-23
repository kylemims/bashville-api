# Testing & Quality Assurance Guide

## Pre-Implementation Server-Side Verification

Before beginning client-side implementation, verify these server-side endpoints are working:

### 1. Basic API Health Check
```bash
# Test server is running
curl http://127.0.0.1:8000/projects/
# Should return 401 (unauthorized) - confirms endpoint exists

# Test login
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  http://127.0.0.1:8000/auth/login/
# Should return: {"user": {...}, "token": "..."}
```

### 2. Project CRUD with project_type
```bash
# Get auth token first
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  http://127.0.0.1:8000/auth/login/ | jq -r '.token')

# List projects (should include project_type field)
curl -H "Authorization: Token $TOKEN" http://127.0.0.1:8000/projects/

# Create project with project_type
curl -X POST -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Layout Project",
    "description": "Testing project types",
    "project_type": "static-tailwind"
  }' http://127.0.0.1:8000/projects/
```

### 3. Code Generation Test
```bash
# Test generation endpoint (replace PROJECT_ID with actual ID)
curl -X POST -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1}' \
  http://127.0.0.1:8000/codegen/generate/
```

### 4. Expected Response Validation
Verify the generation response includes:
- `project_type` field matches request
- `files` object contains appropriate templates
- `setup_instructions` are project-type specific
- Generated code includes color palette variables

## Client-Side Implementation Testing Strategy

### Phase 1: Component Unit Tests

#### LayoutSelector Component
```javascript
// Test file: src/components/__tests__/LayoutSelector.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LayoutSelector from '../LayoutSelector';

describe('LayoutSelector', () => {
  test('renders all project type options', () => {
    render(<LayoutSelector selectedType="static-tailwind" onTypeChange={() => {}} />);
    
    expect(screen.getByText('Static React + Tailwind')).toBeInTheDocument();
    expect(screen.getByText('Static React + Custom CSS')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack + Tailwind')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack + Custom CSS')).toBeInTheDocument();
  });

  test('calls onTypeChange when selection changes', () => {
    const mockChange = jest.fn();
    render(<LayoutSelector selectedType="static-tailwind" onTypeChange={mockChange} />);
    
    fireEvent.click(screen.getByText('Static React + Custom CSS'));
    expect(mockChange).toHaveBeenCalledWith('static-css');
  });

  test('shows selected type as active', () => {
    render(<LayoutSelector selectedType="fullstack-tailwind" onTypeChange={() => {}} />);
    
    const selectedCard = screen.getByText('Full-Stack + Tailwind').closest('[data-testid="project-type-card"]');
    expect(selectedCard).toHaveClass('selected'); // or your active class
  });
});
```

#### ProjectCard Enhancement
```javascript
// Test project type badge display
test('displays correct project type badge', () => {
  const project = {
    id: 1,
    title: 'Test Project',
    project_type: 'fullstack-tailwind'
  };
  
  render(<ProjectCard project={project} />);
  expect(screen.getByText('Full-Stack + Tailwind')).toBeInTheDocument();
  expect(screen.getByText('Advanced')).toBeInTheDocument(); // complexity indicator
});
```

### Phase 2: API Integration Tests

#### Project Creation with project_type
```javascript
// Test file: src/services/__tests__/api.test.js
import { createProject } from '../api';

describe('Project API', () => {
  test('creates project with project_type', async () => {
    const projectData = {
      title: 'Test Project',
      project_type: 'static-tailwind',
      color_palette: 1
    };

    const result = await createProject(projectData);
    
    expect(result.project_type).toBe('static-tailwind');
    expect(result.title).toBe('Test Project');
  });

  test('handles invalid project_type gracefully', async () => {
    const projectData = {
      title: 'Test Project',
      project_type: 'invalid-type'
    };

    await expect(createProject(projectData)).rejects.toThrow();
  });
});
```

#### Code Generation Integration
```javascript
test('generates project files successfully', async () => {
  const projectId = 1;
  const result = await generateProject(projectId);
  
  expect(result.files).toBeDefined();
  expect(result.setup_instructions).toBeDefined();
  expect(result.project_type).toBeDefined();
  
  // Verify file structure based on project type
  if (result.project_type.startsWith('static')) {
    expect(result.files['src/App.jsx']).toBeDefined();
    expect(result.files['package.json']).toBeDefined();
  }
  
  if (result.project_type.startsWith('fullstack')) {
    expect(result.files['frontend/src/App.jsx']).toBeDefined();
    expect(result.files['manage.py']).toBeDefined();
  }
});
```

### Phase 3: End-to-End Testing

#### Complete Project Creation Flow
```javascript
// Test file: cypress/integration/project-creation.spec.js
describe('Project Creation Flow', () => {
  beforeEach(() => {
    cy.login('testuser', 'testpass123');
    cy.visit('/dashboard');
  });

  it('creates static tailwind project successfully', () => {
    cy.get('[data-testid="create-project-btn"]').click();
    
    // Fill project details
    cy.get('input[name="title"]').type('My Test Project');
    cy.get('textarea[name="description"]').type('Test description');
    
    // Select project type
    cy.get('[data-testid="layout-selector"]').within(() => {
      cy.contains('Static React + Tailwind').click();
    });
    
    // Select color palette
    cy.get('[data-testid="color-palette-selector"]').select('Ocean Blue');
    
    // Submit
    cy.get('[data-testid="create-project-submit"]').click();
    
    // Verify creation
    cy.contains('My Test Project').should('be.visible');
    cy.contains('Static + Tailwind').should('be.visible');
  });

  it('generates and downloads project files', () => {
    // Navigate to existing project
    cy.contains('My Test Project').click();
    cy.get('[data-testid="generate-project-btn"]').click();
    
    // Wait for generation
    cy.get('[data-testid="generation-progress"]').should('be.visible');
    cy.contains('Generation complete!', { timeout: 10000 });
    
    // Verify file structure
    cy.get('[data-testid="file-tree"]').within(() => {
      cy.contains('src/App.jsx').should('be.visible');
      cy.contains('tailwind.config.js').should('be.visible');
      cy.contains('setup.sh').should('be.visible');
    });
    
    // Test download
    cy.get('[data-testid="download-project-btn"]').click();
    cy.readFile('cypress/downloads/my-test-project.zip').should('exist');
  });
});
```

### Phase 4: Error Handling Tests

#### Network Failure Scenarios
```javascript
describe('Error Handling', () => {
  test('handles generation failure gracefully', async () => {
    // Mock network failure
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    
    render(<GenerateProjectModal project={{id: 1}} isOpen={true} />);
    
    fireEvent.click(screen.getByText('Generate Project'));
    
    await waitFor(() => {
      expect(screen.getByText('Generation failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('validates required fields', () => {
    render(<ProjectCreationModal isOpen={true} />);
    
    fireEvent.click(screen.getByText('Create Project'));
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });
});
```

### Phase 5: Performance Testing

#### Large Project Generation
```javascript
test('handles large project generation efficiently', async () => {
  const largeProjectConfig = {
    models: Array.from({length: 20}, (_, i) => ({
      name: `Model${i}`,
      fields: Array.from({length: 10}, (_, j) => ({
        name: `field${j}`,
        type: 'CharField'
      }))
    }))
  };

  const startTime = Date.now();
  const result = await generateProject(1, largeProjectConfig);
  const endTime = Date.now();
  
  expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
  expect(Object.keys(result.files).length).toBeGreaterThan(10);
});
```

## Bug Prevention Checklist

### Before Each Implementation Phase
- [ ] Verify API endpoints return expected data structure
- [ ] Test with all 4 project types
- [ ] Confirm color palette integration
- [ ] Validate file generation for each type
- [ ] Test with missing/null values
- [ ] Verify backward compatibility

### During Implementation
- [ ] Write tests before implementing features
- [ ] Test each component in isolation
- [ ] Verify props and state management
- [ ] Check error boundary behavior
- [ ] Validate accessibility standards
- [ ] Test responsive design

### After Each Feature
- [ ] Run full test suite
- [ ] Test API integration
- [ ] Verify no existing features broken
- [ ] Check console for errors/warnings
- [ ] Validate user experience flow
- [ ] Performance testing

## Automated Testing Setup

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Mock API Responses
```javascript
// src/__mocks__/api.js
export const mockProjectResponse = {
  id: 1,
  title: 'Test Project',
  project_type: 'static-tailwind',
  color_palette_preview: {
    primary_hex: '#3b82f6',
    secondary_hex: '#1e40af'
  }
};

export const mockGenerationResponse = {
  project_id: 1,
  project_type: 'static-tailwind',
  files: {
    'src/App.jsx': 'mock jsx content',
    'tailwind.config.js': 'mock config'
  },
  setup_instructions: {
    message: 'Project generated!',
    steps: ['npm install', 'npm run dev']
  }
};
```

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/client-side-tests.yml
name: Client-Side Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run build
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cypress-io/github-action@v2
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
```

Remember: **Test early, test often, and never skip testing when implementing new features!**
