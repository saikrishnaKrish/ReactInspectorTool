# ⚛️ React Inspector Pro

**React Inspector Pro** is an **enterprise-grade Chrome / Edge extension** that provides a deep, **non-destructive inspection** of the React Fiber tree on any website.

Unlike standard React DevTools, this inspector **lives directly on the page**, offering **real-time audits, computed style exploration, and JSX code generation** without breaking application state.

---

## 📦 Version

**v2.6.0**

---

## 👨‍💻 Author

**Sai Krishna Kanteti**

---

## 🚀 Key Features

### 🔍 Deep Fiber Inspection

* Inspect **Props**, **State**, and **Refs** by clicking any React element on the page
* Traverse the actual **React Fiber tree**, not a virtual abstraction

### 🧩 Export as JSX

* Generate a **ready-to-use JSX snippet** for the selected component
* Includes **current props and structure**

### 🎨 Computed CSS Explorer

* View **browser-calculated styles** (margin, padding, font-size, etc.)
* Compare **React metadata vs actual rendered CSS**

### 🔎 Component Search (`Alt + S`)

* Search for any React component globally
* Highlight **all instances** on the page
* Live match counter for quick navigation

### 🧠 Console Mapping

* Map any **Prop** or **State** object to global variables (`temp1`, `temp2`)
* Instantly debug from the **browser console**

### 🩺 Health & Accessibility Audit

* Detect **CSS bloat**
* Identify **missing `alt` attributes**
* Highlight **slow render performance bottlenecks**

### 🖥️ Interactive UI

* Draggable **side panel**
* **Dark / Light theme** support
* Preferences persist across sessions

---

## 🛠️ Installation (Developer Mode)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/saikrishnaKrish/ReactInspecorTool
```

### 2️⃣ Open Extensions Page

* Chrome: `chrome://extensions/`
* Edge: `edge://extensions/`

### 3️⃣ Enable Developer Mode

* Toggle **Developer Mode** (top-right corner)

### 4️⃣ Load the Extension

* Click **Load unpacked**
* Select the folder containing `manifest.json`

### 5️⃣ Start Inspecting

* Open any React website (e.g., **Airbnb**, **Netflix**)
* Use the keyboard shortcuts below

---

## ⌨️ Keyboard Shortcuts

| Shortcut    | Action                                               |
| ----------- | ---------------------------------------------------- |
| **Alt + I** | Toggle Inspector (Enable / Disable hover highlights) |
| **Alt + S** | Component Search (Global finder & highlighter)       |
| **Alt + L** | Layer Mode (Visualize all component boundaries)      |

---

## 📂 Project Structure

```
react-inspector-pro/
├── manifest.json     # Extension configuration (MV3)
├── inject.js         # Core engine (Fiber traversal, UI rendering, audits)
├── content.js        # Bridge script for safe page injection
├── icons/            # Extension branding assets
```

### 🔑 Technical Notes

* Built with **Manifest V3**
* Uses `world: "MAIN"` for deep React internals access
* Fully **non-destructive** — does not mutate application state

---

## 🧪 Development Workflow

To add new features or modify the UI:

1. Edit **`inject.js`**
2. Open `chrome://extensions/`
3. Click **Reload** on the React Inspector Pro extension
4. Refresh the tab where you are testing the extension

---

## 📝 License

This project is **open-source**.

Contributions are welcome!
Feel free to open a **Pull Request** or suggest improvements.

---

# Initial version 
![alt text](image.png)
