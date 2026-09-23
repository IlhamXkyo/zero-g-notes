# Zero-G Notes

A desktop sticky note application built with Electron and the Matter.js 2D physics engine.

Notes exist as interactive rigid bodies on the screen. In zero-gravity mode, notes float and drift across the viewport, bouncing off boundaries and neighboring cards. Enabling gravity pulls notes downward, stacking them along the bottom of the window like physical paper.

## Features

- **2D Physics Engine**: Rigid-body collision detection, momentum transfer, and velocity dampening powered by Matter.js.
- **Gravity Modes**: Toggle between floating weightless orbit and downward gravitational pull.
- **Typing Stabilization**: Focusing a note automatically pins its velocity, preventing drift while typing.
- **Persistent Storage**: Note contents, positions, and color states are preserved locally across app restarts.
- **Color Themes**: Support for warm paper and slate dark modes with customizable card tinting.

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

## Installation and Run

1. Clone the repository:
   ```bash
   git clone https://github.com/IlhamXkyo/zero-g-notes.git
   cd zero-g-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the desktop application:
   ```bash
   npm start
   ```

To package the application for Windows:
```bash
npm run package
```

## Controls

- **Drag Note**: Click and hold a note header to reposition or fling across the screen.
- **Toggle Gravity**: Press the gravity icon in the toolbar or use `Ctrl + G`.
- **New Note**: Click the plus button or press `Ctrl + N`.
- **Delete Note**: Click the close icon on the top right of each card.

## Tech Stack

- Electron
- Matter.js
- HTML5 Canvas and DOM overlay
- CSS3

## License

MIT License. See LICENSE for details.
