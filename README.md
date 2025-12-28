# React Component Layer Inspector

A lightweight Chrome/Edge extension that injects a React component inspector into web pages to visualize component layers, inspect props/state, and highlight DOM layers.

Version: 1.0

---

## Features

- Injects [inject.js](inject.js) into the page context to access React Fiber nodes
- Page-safe [content.js](content.js) that loads the injected script from extension resources
- Dual theme (light/dark), draggable UI, search and layer highlight modes
- Component health audit (performance, prop/state complexity, naming hints)

## Files

- [content.js](content.js) — runs in extension isolated world; injects `inject.js` into the page
- [inject.js](inject.js) — main inspector logic injected into page context (UI, fiber traversal, audits)
- [manifest.json](manifest.json) — extension manifest (MV3)
- icons/ — place extension icons here (optional)

## Quick Install (Load Unpacked)

1. Open `chrome://extensions/` (or `edge://extensions/`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder (the folder containing `manifest.json`).
4. Open any page and use the extension action (if provided) or the content-script will inject automatically.

Notes:

- The content script matches `<all_urls>` so the inspector will attempt to load on all pages where extensions are allowed.
- While developing, reload the unpacked extension after editing files.

## Development

- Edit `inject.js` for core inspector behavior and UI.
- `content.js` is intentionally minimal and only injects `inject.js` into the page so the inspector can access the page's React internals.
- The inspector stores theme in `localStorage` under `ri-theme`.

Recommended workflow:

```bash
git init
git add .
git commit -m "chore: add React Component Layer Inspector"
```

## Security & Privacy

- The injected script runs in the page context to access React internals; it does not transmit data externally by default. If you add telemetry or remote features, get user consent and document it.
- Avoid loading third-party scripts from remote URLs in `inject.js`.

## Package & Share

### Create a distributable ZIP

Use the included PowerShell helper (Windows) or the zip command (macOS/Linux) to create a ZIP ready for sharing or uploading to the Chrome Web Store.

PowerShell (Windows):

```powershell
.
powershell ./pack.ps1
# or via npm script
npm run pack
```

macOS / Linux:

```bash
npm run pack:unix
# or
zip -r ../react-inspector-extension.zip . -x '*.git*' 'node_modules/*'
```

The generated file will be `../react-inspector-extension.zip` (one level up from the repo folder).

### Share options

- Upload the ZIP to the Chrome Web Store (follow the developer docs).
- Host the repo on GitHub and share the repository link so others can `Load unpacked` or download the ZIP from releases.
- Create a release on GitHub and attach the ZIP file for easy distribution.

### Create a CRX (optional)

Chrome's recommended distribution is via the Web Store. Creating and sideloading a CRX is possible but requires packaging and appropriate signing and is platform/browser dependent. For most use-cases, distribute the ZIP or publish to the Web Store.

## Contributing

1. Fork the repo.
2. Create a branch for your change.
3. Open a PR with a short description and testing notes.

## License

Add a license file (e.g., `LICENSE`) or update this README with your chosen license.

---

If you'd like, I can also add a sample `package.json`, a basic build script, or prepare the repo for publishing (ZIP script and prepublish checklist).
