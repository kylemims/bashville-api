# 🚀 BASHVILLE USER GUIDE: From Project Creation to Running Website

## Complete Step-by-Step Workflow

### **STEP 1: Create Your Project**
1. **Login to Bashville** and navigate to your dashboard
2. **Click "Create New Project"**
3. **Fill in Project Details:**
   - **Title**: "Vivid About Site" (or your choice)
   - **Description**: "SEO driven site for Vivid CRM" (or your choice)
4. **Select Layout Type**: Choose "Static React + Custom CSS" (static-css)
5. **Select Color Palette**: Choose your preferred palette (like "Mild Thang")
6. **Skip Backend Configuration** (not needed for static sites)
7. **Click "Create Project"**

### **STEP 2: Generate Your Project Files**
1. **From your dashboard**, click on your newly created project
2. **Click "Generate Project"** or "Generate and Write" button
3. **Wait for generation to complete** (should be instant)
4. **Review the generated files** in the preview area
5. **Click "Download Project"** to get a ZIP file

### **STEP 3: Set Up Your Development Environment**

#### **Option A: Using the Generated Setup Script** (Recommended)
```bash
# 1. Extract the downloaded ZIP file
unzip vivid-about-site.zip
cd vivid-about-site

# 2. Make the setup script executable and run it
chmod +x setup.sh
./setup.sh

# 3. Start the development server
npm run dev
```

#### **Option B: Manual Setup**
```bash
# 1. Extract the downloaded ZIP file
unzip vivid-about-site.zip
cd vivid-about-site

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

### **STEP 4: View Your Website**
1. **Open your browser** to `http://localhost:5173` (or the URL shown in terminal)
2. **You should see:**
   - A beautiful React website with your selected colors
   - Navigation with your project title
   - Hero section with gradient background
   - Interactive demo buttons showing your color palette
   - Responsive design that works on mobile and desktop

### **STEP 5: Customize Your Website**
Your generated project includes:
- **`src/App.jsx`**: Main React component with starter content
- **`src/index.css`**: Complete CSS framework with your colors
- **`vite.config.js`**: Vite configuration
- **`package.json`**: Dependencies and scripts
- **`index.html`**: HTML template

#### **Quick Customizations:**
```javascript
// In src/App.jsx - Change the hero text:
<h1>Welcome to {{ project_title }}</h1>
// becomes:
<h1>Welcome to My Amazing Website</h1>

// Add new sections, modify content, etc.
```

```css
/* In src/index.css - Your colors are available as CSS variables: */
.my-custom-element {
  background-color: var(--color-primary);
  color: var(--color-background);
  border: 2px solid var(--color-accent);
}
```

## 🎨 **Understanding Your Generated Files**

### **React Project Structure:**
```
your-project/
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite build configuration
├── setup.sh           # Auto-generated setup script
└── src/
    ├── main.jsx        # React app entry point
    ├── App.jsx         # Main component with starter layout
    └── index.css       # Complete CSS framework with your colors
```

### **Your Color Palette Integration:**
Your selected color palette is automatically integrated as CSS variables:
```css
:root {
  --color-primary: #ff9f94;    /* Your primary color */
  --color-secondary: #88cdce;  /* Your secondary color */
  --color-accent: #ebe9b2;     /* Your accent color */
  --color-background: #353231; /* Your background color */
}
```

### **Pre-built Components:**
Your CSS includes ready-to-use components:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`
- **Cards**: `.card`, `.card-header`, `.card-title`
- **Grid System**: `.grid`, `.grid-2`, `.grid-3`, `.grid-4`
- **Navigation**: `.nav`, `.nav-brand`, `.nav-links`
- **Forms**: `.form-input`, `.form-textarea`, `.form-select`
- **Utilities**: `.text-center`, `.mt-4`, `.mb-8`, etc.

## 🛠️ **Development Commands**

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new dependencies
npm install package-name

# Update dependencies
npm update
```

## 🚀 **Deployment Options**

### **1. Netlify (Recommended for beginners)**
1. Drag and drop your `dist/` folder to Netlify
2. Or connect your Git repository for automatic deployments

### **2. Vercel**
1. Import your project from Git
2. Vercel auto-detects Vite projects

### **3. GitHub Pages**
1. Build your project: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages

### **4. Traditional Web Hosting**
1. Run `npm run build`
2. Upload the contents of `dist/` folder to your web server

## 🎯 **What You Get Out of the Box**

### **✅ Modern React Setup**
- React 18 with hooks
- Vite for fast development and building
- ES6+ JavaScript support
- Hot module replacement

### **✅ Professional CSS Framework**
- Mobile-first responsive design
- CSS custom properties (variables)
- Modern color system with automatic contrast
- Accessible focus styles
- Print-friendly styles

### **✅ Production Ready**
- Optimized build process
- Tree-shaking for smaller bundles
- Automatic vendor prefixing
- Performance optimizations

### **✅ Developer Experience**
- Fast development server
- Instant hot reload
- Clear project structure
- Well-documented code

## 🔧 **Troubleshooting**

### **If `npm run dev` fails:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **If colors don't appear correctly:**
- Check that your CSS variables are properly defined in `src/index.css`
- Ensure you're using the CSS variables: `var(--color-primary)`

### **If the site doesn't load:**
- Check the terminal for error messages
- Ensure port 5173 isn't already in use
- Try `npm run preview` for production build

## 🎪 **Next Steps**

1. **Customize the content** in `src/App.jsx`
2. **Add new components** and pages
3. **Modify the CSS** to match your brand
4. **Add routing** with React Router if needed
5. **Integrate APIs** for dynamic content
6. **Deploy to production** when ready

## 📞 **Need Help?**

Your generated project includes:
- **Comments in the code** explaining key sections
- **CSS documentation** with examples
- **Modern best practices** throughout
- **Responsive design patterns**

**Congratulations! You now have a fully functional, professionally designed React website with your custom colors, ready for development and deployment! 🎉**
