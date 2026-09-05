# 🪐 Zero-G Notes

> **Floating desktop sticky notes powered by 2D physics. Float freely in zero-gravity orbit or ground your thoughts with realistic earth gravity.**

[![Electron](https://img.shields.io/badge/Electron-33.x-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Matter.js](https://img.shields.io/badge/Matter.js-2D_Physics-222222?style=flat-square)](https://brm.io/matter-js/)
[![Platform](https://img.shields.io/badge/Platform-Windows_x64-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/IlhamXkyo/zero-g-notes)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📖 About The Project

**Zero-G Notes** reimagines desktop scratchpads by merging modern note-taking with a live 2D rigid-body physics engine. Instead of static, pinned squares cluttering your monitor, notes exist as tactile objects that drift smoothly across your screen, bounce off viewport boundaries, and react naturally when tossed or flicked.

Need order? Flip the **Earth Gravity** switch to watch all floating thoughts drop and stack realistically at the bottom of your screen. When you're ready to explore again, disable gravity to launch them back into zero-g orbit.

---

## ✨ Core Features

### 🌌 Dynamic Physics Engine (Matter.js)
- **True Zero-Gravity:** Notes drift perpetually in weightless space with high restitution (`0.94`) and minimal air damping (`0.004`).
- **Interactive Flick & Toss:** Grab any note by its header and fling it across the screen to bounce off screen borders and neighboring cards.
- **Earth Gravity Toggle:** Instantly apply gravitational acceleration (`gravity.y = 1.0`) to drop and stack notes on the screen floor. Disabling gravity imparts a gentle buoyant release impulse.
- **Typing Stabilization:** Focusing a note's text area automatically stabilizes its velocity so you can write without the card drifting away.

### 🎨 Tactile & Anti-AI Slop UI
- **Intentional Minimalism:** Free from tacky purple-cyan neon blooms, gratuitous lens flares, or generic plastic glassmorphism.
- **Warm Editorial Paper (Light Theme):** Cream alabaster background (`#FCFAF7`), hairline borders, and subdued organic pastel cards (rose, sage, lavender, oat, sky).
- **Architectural Slate (Dark Theme):** Deep matte graphite (`#121518`), crisp high-contrast typography, and refined muted borders.
- **Tactile Feedback:** Crisp button press depths, smooth spring transitions, and custom thin scrollbars.

### 🧹 Note Management & Eraser Tool
- **Auto-Incremented Titles:** New notes are automatically named sequentially (`Note 1`, `Note 2`, `Note 3`...).
- **Inline Title Renaming:** Click any note's title to rename it inline; leaving it blank safely falls back to its numbered label.
- **Eraser Tool (Delete Mode):** Toggle the Eraser tool from the HUD to switch to a crosshair cursor. Hovering any note highlights it in soft crimson; clicking instantly vaporizes the note, its physics body, and its storage record.
- **Notes Vault Drawer:** Open the scrollable Vault side drawer to review all notes in a list, view live storage sync status (`🟢 All changes saved`), focus/highlight specific notes on canvas, or delete unwanted cards directly from the list.

### 🎛️ Customization & Persistence
- **Opacity Slider:** Adjust note background transparency smoothly from 20% semi-transparent up to 100% solid opacity.
- **Note Size Scaler:** Scale note dimensions (0.8× to 1.5×). Scales both the visual DOM elements and the underlying Matter.js collision polygons synchronously for 1:1 collision accuracy.
- **Automatic Local Persistence:** Automatically saves all note texts, titles, coordinates, velocities, rotation angles, colors, and settings to `%APPDATA%/zero-g-notes/notes-data.json`.

### 🖥️ Seamless Desktop Overlay & Click-Through
- **Native Frameless Overlay:** Runs borderless and transparent (`transparent: true`, `frame: false`, `alwaysOnTop: true`).
- **Dynamic Hit-Testing:** Transparent space ignores mouse events (`setIgnoreMouseEvents(true, { forward: true })`) so you can directly interact with background desktop apps and folders. Hovering notes, buttons, or the HUD instantly captures mouse focus.

---

## 🛠️ Tech Stack

- **Runtime:** [Electron.js](https://www.electronjs.org/)
- **Physics Simulation:** [Matter.js](https://brm.io/matter-js/)
- **Frontend / Rendering:** Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3 Custom Properties
- **Compilation & Packaging:** [electron-builder](https://www.electron.build/)

---

## 🎮 Shortcuts & Controls

| Action | Control | Description |
|---|---|---|
| **Toggle Theme** | <kbd>Ctrl</kbd> + <kbd>T</kbd> / HUD Button | Switch between Warm Editorial Paper (Cute) and Architectural Slate (Space). |
| **Flick & Toss** | <kbd>Drag</kbd> note header & release | Imparts kinetic throw velocity based on pointer release speed. |
| **Eraser Mode** | <kbd>🧹</kbd> HUD Button | Toggle Delete Mode: click any note to instantly delete it. |
| **Notes Vault** | <kbd>📁</kbd> HUD Button | Open the scrollable list of all notes with search/preview and sync status. |
| **Settings Panel** | <kbd>⚙️</kbd> HUD Button | Toggle Earth Gravity, adjust note opacity, and scale note size. |
| **Cosmic Impulse** | <kbd>🚀</kbd> HUD Button | Applies a randomized gentle nudge to shuffle all floating notes. |
| **Color Cycling** | <kbd>Click</kbd> note dot icon | Cycles the note between 5 curated theme-matched color presets. |
| **Move HUD** | <kbd>Drag</kbd> HUD Earth icon | Reposition the floating HUD toolbar anywhere on your display. |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IlhamXkyo/zero-g-notes.git
   cd zero-g-notes
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Application Icons (Optional - pre-built assets included):**
   ```bash
   npm run generate-icons
   ```

4. **Launch the application in development mode:**
   ```bash
   npm start
   ```

### Building the Standalone Executable (.exe)

Compile the application into a standalone Windows binary:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory:
- **Portable Executable:** `dist/Zero-G Notes 1.0.0.exe` (Single-file click-to-run, no installer needed)
- **Installer:** `dist/Zero-G Notes Setup 1.0.0.exe` (NSIS one-click installer)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
