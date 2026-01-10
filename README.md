# React Inspector Pro

![License](https://img.shields.io/github/license/saikrishnaKrish/ReactInspectorTool)
![Release](https://img.shields.io/github/v/release/saikrishnaKrish/ReactInspectorTool)

React Inspector Pro is a Chrome/Edge extension that inspects the live React Fiber tree directly on the page. It provides component inspection, JSX export, computed CSS exploration, and performance/a11y insights without switching away from the page.

Author: Sai Krishna Kanteti

---

## Key Features

- Deep Fiber inspection: view Props, State and Refs for components on the page
- Export live components as JSX snippets with current props
- Computed CSS Explorer: view browser-calculated styles side-by-side with React metadata
- Global component search and highlighting (Alt+S)
- Console mapping: expose selected props/state to global vars for quick debugging
- Health & accessibility audits (missing alt, CSS bloat, slow renders)
- Draggable, themeable side panel (light/dark) with persisted preferences

---

## Quick Install (Developer Mode)

1. Clone the repository:

```bash
git clone https://github.com/saikrishnaKrish/ReactInspectorTool.git
cd ReactInspectorTool
```

2. Open `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder (where `manifest.json` is located).
5. Open a React site and start inspecting.

---

## Usage & Shortcuts

| Shortcut | Action |
|---:|:---|
| Alt + I | Toggle Inspector (enable/disable hover highlights) |
| Alt + S | Component search (global finder & highlighter) |
| Alt + L | Layer mode (visualize component boundaries) |

---

## File Structure

- [manifest.json](manifest.json) — extension manifest (MV3)
- [inject.js](inject.js) — core inspector that runs in page context
- [content.js](content.js) — content script that injects `inject.js`
- icons/ — extension icons and branding assets
- README.md, LICENSE, CONTRIBUTING.md, etc.

---

## Development

1. Edit `inject.js` or `content.js` for feature work.
2. Reload the extension on `chrome://extensions/` and refresh the target page.
3. Use the `generate_icons.py` script to create PNG icons if needed (requires Python).

Optional helper scripts (see `package.json`):

```bash
npm run obfuscate   # obfuscate inject.js into dist/inject.obf.js (optional)
npm run assemble    # create dist_package/ for distribution
npm run pack        # create ZIP package (Windows PowerShell helper)
```

---

## Packaging & Distribution

- Use `npm run assemble` to build `dist_package/` containing `manifest.json`, `content.js`, `inject.js` (or `dist/inject.obf.js` if obfuscated), and `icons/`.
- Share the `dist_package/` folder or ZIP it and upload to the Chrome Web Store.
- For private distribution inside an organization, use enterprise deployment tools.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and development workflow.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
