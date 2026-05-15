# WebRTC Stats Extension

A Chrome/Edge extension designed to intercept and analyze WebRTC connections in the browser. It features a modern, visually striking popup UI and a robust injected script architecture to capture raw `RTCPeerConnection` statistics.

## Features
- **Injected WebRTC Hook:** Injects scripts directly into the page context to hook `window.RTCPeerConnection`.
- **Premium UI:** A sleek, modern popup interface built with Vanilla TypeScript and CSS.
- **Vite & Manifest V3:** Built with modern tooling using Vite, TypeScript, and `@crxjs/vite-plugin`.

## Architecture
The extension is divided into four main contexts:
1. **Injected Script (`src/injected`)**: Runs in the context of the host webpage. It replaces the native `window.RTCPeerConnection` to intercept connections.
2. **Content Script (`src/content`)**: Acts as a bridge. It injects the `injected` script and passes messages back and forth between the webpage and the extension.
3. **Background Worker (`src/background`)**: The Manifest V3 Service Worker that handles global extension events.
4. **Popup UI (`src/popup`)**: The visual interface the user interacts with when clicking the extension icon.

## Development Setup

### Prerequisites
- Node.js (v24.x LTS recommended)
- NPM

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
   *(Note: For live reload during development, you can use `npm run dev`, but loading the built `dist` folder is often more stable for testing extension APIs).*

### Loading into Browser
1. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`).
2. Toggle **Developer mode** on in the top right corner.
3. Click **Load unpacked** and select the generated `dist/` directory inside this project folder.