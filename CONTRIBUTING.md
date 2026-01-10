# Contributing to React Inspector Pro

Thanks for your interest in contributing — your help makes this project better.

## Quick Start

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/react-inspector-pro.git
cd react-inspector-pro
```

3. (Optional) Install dev tools if you use the provided scripts:

```bash
npm install
```

## Load the extension (development)

1. Open `chrome://extensions/` in Chrome (or `edge://extensions/` in Edge).
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the project folder (the folder that contains `manifest.json`).
4. After making changes to `inject.js` or `content.js`, click the reload icon on the extension card and refresh the target page.

## Recommended workflow

- Create a feature branch:

```bash
git checkout -b feat/your-feature-name
```

- Make small, focused commits with descriptive messages (use Conventional Commits if possible):

```bash
git add .
git commit -m "feat: add component locator" 
git push origin feat/your-feature-name
```

- Open a Pull Request and include:
	- What you changed and why
	- Steps to reproduce and test your change
	- Screenshots or screencasts for UI changes

## Testing and packaging

- To run the obfuscation (optional) and produce `dist/inject.obf.js`:

```bash
npm install
npm run obfuscate
```

- To assemble a single-folder distributable for sharing or loading (`dist_package`):

```powershell
npm run assemble
# or
powershell .\assemble_dist.ps1
```

## Code style and guidelines

- Keep changes focused and backwards-compatible where possible.
- Avoid introducing large formatting-only diffs; use the existing project style.
- Do not include secrets or credentials in commits.

## Pull request checklist

- [ ] The code builds and the extension loads as unpacked.
- [ ] New functionality includes tests or manual test steps.
- [ ] Changes are documented in the README or in-code comments where appropriate.

## Areas where help is welcome

- Testing on complex production sites (where component names may be minified)
- Improving JSX export logic for complex nested structures
- Accessibility and UI refinements

## Code of conduct

Be respectful and constructive. If you want, add a `CODE_OF_CONDUCT.md` to define expectations.

---

If you'd like, I can also add templates for issues and pull requests (`.github/ISSUE_TEMPLATE`, `.github/PULL_REQUEST_TEMPLATE`) to help contributors provide the right information.