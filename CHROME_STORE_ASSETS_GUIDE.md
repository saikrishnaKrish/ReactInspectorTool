# Chrome Web Store Assets & Submission Guide

## 📋 Required Assets Checklist

### 1. Store Icon - 128x128 PNG ✅
**Requirement:** 128x128 pixels, PNG format
**What you have:** `icons/icon128.svg`
**Action needed:** Convert SVG to PNG

**Tools to convert:**
- Free online: [cloudconvert.com](https://cloudconvert.com/svg-to-png)
- Free online: [ezgif.com](https://ezgif.com/svg-to-png)
- Windows: [Inkscape](https://inkscape.org/) (free, download & install)
- Windows: [GIMP](https://www.gimp.org/) (free)

**Steps:**
1. Go to cloudconvert.com or ezgif.com
2. Upload `icon128.svg` 
3. Convert to PNG
4. Save as `icon128.png` (exactly 128x128)

---

### 2. Screenshots (1-5 required) 📸
**Requirement:** 
- 1280x800 OR 640x400 pixels
- JPEG or 24-bit PNG (NO transparency)
- **At least 1 is required** for store listing
- Maximum 5 screenshots

**What to screenshot:**
1. Extension popup/UI in action
2. Inspector panel with component tree
3. JSX export feature
4. CSS explorer view
5. Search functionality

**How to capture:**
1. Open a React website (e.g., facebook.com, airbnb.com, netflix.com)
2. Press `Alt + I` to activate inspector
3. Click on React components to inspect
4. Take screenshots using:
   - Windows: `Win + Shift + S` (Snip & Sketch)
   - Browser: DevTools → right-click → Screenshot
   - Crop to 1280x800 in any image editor

**Recommended tool:** [Canva Free](https://www.canva.com/) to add text/annotations

---

### 3. Small Promo Tile 📦t
**Quick creation steps:**
1. Use [Canva](https://www.canva.com/) → Custom size 440x280
2. Add:
   - Your icon in center
   - Title: "React Inspector Pro"
   - Tagline: "Debug React Like a Pro"
   - Background: Clean color (blue/purple/dark)
3. Export as JPEG or PNG (24-bit, no transparency)

**Alternative:** Use your SVG icon as base and add text in Paint/GIMP

---

### 4. Marquee Promo Tile 🎬
**Requirement:** 1400x560 pixels, JPEG or PNG (no alpha)

**Quick creation steps:**
1. Use [Canva](https://www.canva.com/) → Custom size 1400x560
2. Add:
   - Your icon on left side
   - Title: "React Inspector Pro"
   - Key features as bullet points:
     - Deep Fiber Inspection
     - JSX Export
     - CSS Explorer
     - Component Search
   - Background: Gradient (blue to purple)
3. Export as JPEG (1400x560 exactly)

---

### 5. Optional: YouTube Video
**Format:** YouTube URL
**What to create:** (Optional but recommended)
- 30-60 second demo video showing:
  - Opening the extension
  - Inspecting a React component
  - Exporting JSX
  - Using search feature
- Upload to YouTube → share link in Chrome Store form

**Tools:** OBS Studio (free), CapCut (free), or Loom (free tier)

---

## 📝 Store Listing Information

### Description (copy from manifest.json)
```
High-fidelity React component inspector with JSX export, computed styles, and global search.
```

Or use the longer version:
```
React Inspector Pro is an enterprise-grade Chrome/Edge extension that provides deep, 
non-destructive inspection of the React Fiber tree on any website.

Features:
• Deep Fiber Inspection - Inspect Props, State, and Refs by clicking any React element
• Export as JSX - Generate ready-to-use JSX snippets for selected components
• Computed CSS Explorer - View browser-calculated styles and compare with React metadata
• Component Search (Alt+S) - Search globally and highlight all instances
• Console Mapping - Map Props/State objects to console variables
• Health & Accessibility Audit - Detect CSS bloat and missing alt attributes
• Interactive UI - Draggable side panel with Dark/Light theme support

Shortcuts:
Alt+I - Toggle Inspector
Alt+S - Component Search
Alt+L - Layer Mode
```

---

## 🔗 URLs to Provide

### Homepage URL (Optional but recommended)
```
https://github.com/saikrishnaKrish/ReactInspectorTool
```

### Support URL (Optional but recommended)
```
https://github.com/saikrishnaKrish/ReactInspectorTool/issues
```

### Author/Developer Website (if you have one)
```
(Leave blank or add personal website)
```

---

## 🎨 Design Tips for Promo Tiles

### Color Scheme for React Inspector Pro:
- **Primary:** Blue (#0066CC) or Cyan (#00BCD4)
- **Secondary:** Purple (#6F3FF0)
- **Accent:** React Blue (#61DAFB)
- **Background:** Dark gray (#1A1A2E) or white (#FFFFFF)

### Fonts:
- Title: Bold, 32-48px
- Body: Regular, 16-20px

### Key Images:
- Use your React icon/logo
- Add visual elements like:
  - Code brackets `{ }`
  - Component tree visualization
  - Debugging symbols

---

## 📤 Chrome Store Form Fields Summary

| Field | Required | Value |
|-------|----------|-------|
| Extension Name | Yes | React Inspector Pro |
| Short Description | Yes | High-fidelity React component inspector with JSX export, computed styles, and global search |
| Full Description | Yes | [Use longer version above] |
| Store Icon (128x128) | Yes | [PNG file] |
| Screenshots | Yes | [1-5 images at 1280x800 or 640x400] |
| Small Promo Tile (440x280) | No | [PNG/JPEG] |
| Marquee Promo Tile (1400x560) | No | [PNG/JPEG] |
| Homepage URL | No | https://github.com/saikrishnaKrish/ReactInspectorTool |
| Support URL | No | https://github.com/saikrishnaKrish/ReactInspectorTool/issues |
| YouTube Video | No | [YouTube URL] |
| Mature Content | No | No |

---

## ✅ Priority Order (Do This First)

1. **Convert icon128.svg to PNG** (5 min)
2. **Create 1-2 screenshots** (15 min)
3. **Create small promo tile** (10 min)
4. **Create marquee promo tile** (10 min)
5. **Submit store listing**
6. *(Optional) Create YouTube demo video* (30 min)

---

## 🛠️ Recommended Free Tools

| Asset | Tool | Time | Difficulty |
|-------|------|------|------------|
| Icon Convert | cloudconvert.com | 2 min | Easy |
| Screenshots | Windows Snip & Sketch | 10 min | Easy |
| Promo Tiles | Canva Free | 15 min | Easy |
| Video Demo | OBS Studio | 30 min | Medium |

---

## 📚 Additional Resources

- [Chrome Web Store Listing Guidelines](https://developer.chrome.com/docs/webstore/listing-your-app/)
- [Chrome Web Store Graphic Assets Spec](https://developer.chrome.com/docs/webstore/images/)
- [Canva Design Templates](https://www.canva.com/)

---

**Total Time Estimate:** 1-2 hours for all assets
**Difficulty:** Low (mostly copying/pasting and using free tools)

Good luck with your Chrome Store submission! 🚀
