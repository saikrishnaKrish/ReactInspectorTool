React Inspector Pro ⚛️

An enterprise-grade Chrome/Edge extension that provides a deep, non-destructive look into the React Fiber tree of any website. Unlike the standard DevTools, this inspector lives directly on the page, providing real-time audits, style exploration, and code generation.

Version: 1.8.3

Author: Sai Krishna Kanteti

🚀 Key Features

Deep Fiber Inspection: Access Props, State, and Refs by clicking any element on the page.

Export as JSX: Instantly generate a ready-to-use React code snippet of the selected component with its current props.

Computed CSS Explorer: View the actual browser-calculated styles (padding, margin, font-size) alongside React metadata.

Component Search (Alt+S): Highlight every instance of a specific component across the entire page with real-time match counting.

Console Mapping: Map any Prop or State object to a global variable (temp1, temp2) for direct debugging in the browser console.

Health & Accessibility Audit: Automated detection of "CSS Bloat," missing alt tags, and performance bottlenecks (Slow Render warnings).

Interactive UI: A draggable, themeable (Dark/Light) side panel that persists your preferences.

🛠️ Installation (Developer Mode)

Clone the Repository:

git clone [https://github.com/your-username/react-inspector-pro.git](https://github.com/your-username/react-inspector-pro.git)


Open Extensions Page: Navigate to chrome://extensions/ or edge://extensions/.

Enable Developer Mode: Toggle the switch in the top right corner.

Load Unpacked: Click "Load unpacked" and select the folder containing manifest.json.

Start Inspecting: Open any React site (e.g., Airbnb, Netflix) and use the shortcuts below.

⌨️ Keyboard Shortcuts

Shortcut

Action

Alt + I

Toggle Inspector (Enable/Disable hover highlights)

Alt + S

Component Search (Global finder and highlighter)

Alt + L

Layer Mode (Visualizes every component boundary)

📂 File Structure

manifest.json: Extension configuration (MV3) using world: "MAIN" for deep React access.

inject.js: The core engine. Handles Fiber traversal, UI rendering, and audits.

content.js: The bridge script that safely injects the inspector into the page context.

icons/: Extension branding assets.

🧪 Development Workflow

To add new features or modify the UI:

Edit inject.js.

Go to chrome://extensions/ and click the Reload icon on the React Inspector Pro card.

Refresh the tab where you are testing the extension.

📝 License

This project is open-source. Feel free to contribute by opening a Pull Request!

# Recommended Commit for this version
git add .
git commit -m "feat: release v1.8.3 with JSX export, computed styles, and enhanced search"
git push origin main
