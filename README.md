# Enchantment Cracker (Web Edition)

A high-fidelity, pixel-perfect web port of [Earthcomputer's EnchantmentCracker](https://github.com/Earthcomputer/EnchantmentCracker).

Cracking the XP seed in Minecraft and predicting enchantment table results, running entirely in the browser using WebAssembly and Web Workers.

## Features

- **Pixel-Perfect Minecraft GUI**:
  - Faithfully reproduces the custom Swing 9-slice frame, title bar, tabs, controls, pixel art textures, and typography (`Minecraftia`).
  - Draggable window with custom pin and close controls.
  - Scale switcher (1x, 2x, 3x) for high-DPI displays while maintaining sharp pixel art rendering.
  - Authentic Minecraft-style tooltips and custom modal dialogs.
- **Fast WebAssembly Seed Cracking Engine**:
  - Searches the entire $2^{32}$ (4.29 billion) initial XP seed space using parallel Web Workers running compiled WebAssembly.
  - Finishes full brute-force in ~1.5–3 seconds with live progress reporting.
  - Instant candidate filtering on subsequent inputs.
- **Player Seed & Drop Calculator**:
  - Recovers the 48-bit player seed from consecutive XP seeds.
  - Simulates item throwing and dummy enchantments to find exact bookshelf requirements, slot choices, and throw counts.
  - Supports all Minecraft versions from 1.8 up through 1.21+.
- **Zero Server Overhead**:
  - Pure client-side static web application.
  - Automated deployment to GitHub Pages via GitHub Actions.

## Building and Running

### Prerequisites
- Node.js 18+ (tested on Node 22+)
- npm

### Installation & Local Development
```bash
# Install dependencies
npm install

# Run development server with live reload
npm run dev
```

### Production Build
```bash
npm run build
```
The compiled static assets will be located in the `dist/` directory.

### GitHub Pages Deployment
A GitHub Actions workflow is provided at `.github/workflows/deploy.yml`. When pushed to `main` or `master`, the repository will automatically build and deploy the web app to GitHub Pages.

## Credits
- Original Java Application: [Earthcomputer](https://github.com/Earthcomputer/EnchantmentCracker)
- Performance and UI improvements in original version: Hexicube
