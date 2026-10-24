# Pixel PC 🖥️🎮

A cozy top-down pixel-art simulation game inspired by the atmosphere and exploration mechanics of life-simulation games like *Stardew Valley*, featuring a fully functional simulated retro desktop operating system connected to **9Router** with real AI completions.

---

## 🌟 Product Highlights

- **Cozy Pixel-Art Bedroom**: Handcrafted 16-bit procedural canvas textures (wooden floorboards, bed with pillow and quilt, wardrobe, bookshelf, potted plants, night window with stars/moon, bedside lamp with warm radial glow, and glowing CRT computer monitor).
- **Physical Gameplay Loop**:
  1. Walk around the bedroom using **WASD** or **Arrow Keys**.
  2. Approach the computer desk to trigger the contextual prompt: `"Press [E] to use PC"`.
  3. Press **E** to sit down and boot into the retro virtual computer.
  4. Launch **AI Chat** powered by 9Router.
  5. Default Model: pre-configured to `ag/gemini-3.8-flash-medium`.
  6. Send prompts and receive real, live streamed AI responses with markdown and code highlights.
  7. Press **Escape** or click **Exit** on the taskbar to return to your cozy room.
- **Retro Virtual Desktop OS**:
  - **Window Manager**: Draggable title bars, z-index elevation, minimize, maximize, restore, close.
  - **Taskbar & Start Menu**: Active window tabs, application launcher, system tray, real-time clock, CRT scanline filter toggle.
  - **8-Bit Web Audio Synthesizer**: Procedural retro audio (PC boot chime, keyclicks, window open/close swooshes, footsteps, notification bells) with no missing sound files.
  - **Applications**:
    - 🤖 **AI Chat**: Connected to 9Router, model selector, SSE streaming, conversation management, copy buttons, markdown renderer.
    - ⚙️ **Settings**: 9Router connection manager, Base URL configuration, API key entry & masking, live connection tester, model discovery.
    - 💻 **Safe Terminal**: Interactive isolated shell supporting `help`, `about`, `clear`, `date`, `ls`, `cat`, `model`, `ping`, `echo`, `whoami`.
    - 📁 **File Explorer**: Browse virtual filesystem (`documents/`, `prompts/`, `system/`) with prompt templates and notes.
    - 📝 **Cozy Notes**: Lightweight scratchpad with auto-save and persistence.
    - 📊 **System Monitor**: Animated simulated CPU load, RAM meter, and network activity (labeled as simulated metrics).
- **Multi-Platform Ready**:
  - 🌐 **Web**: Deployable to **Vercel** with native Serverless Functions (`/api/health`, `/api/ai/*`).
  - 🖥️ **Desktop**: Packaged with **Electron** featuring context isolation, strict CSP, and a narrow preload bridge.

---

## 🏗️ Repository Architecture

```
pixel/
├── api/                           # Vercel Serverless Functions
│   ├── _utils.ts                  # SSRF protection, URL & API key resolution
│   ├── health.ts                  # GET /api/health
│   └── ai/
│       ├── models.ts              # GET /api/ai/models
│       ├── test-connection.ts     # POST /api/ai/test-connection
│       ├── chat.ts                # POST /api/ai/chat
│       └── chat-stream.ts         # POST /api/ai/chat-stream (SSE)
├── src/
│   ├── game/                      # Phaser 3 Game Engine
│   │   ├── GameManager.ts         # Phaser-React bridge
│   │   ├── SoundFx.ts             # Web Audio procedural sound synthesizer
│   │   ├── TextureGenerator.ts    # Procedural 16-bit pixel-art generator
│   │   └── scenes/
│   │       ├── BootScene.ts       # Asset & animation registration
│   │       └── BedroomScene.ts    # Player movement, collisions, PC interaction
│   ├── virtual-pc/                # Virtual Desktop React System
│   │   ├── DesktopOS.tsx          # Desktop workspace & window manager
│   │   ├── apps/
│   │   │   ├── AIChatApp.tsx      # 9Router AI Chat app
│   │   │   ├── SettingsApp.tsx    # 9Router config & connection test
│   │   │   ├── TerminalApp.tsx    # Safe simulated terminal
│   │   │   ├── FileExplorerApp.tsx# Virtual filesystem explorer
│   │   │   ├── NotesApp.tsx       # Local notes manager
│   │   │   └── SysMonitorApp.tsx  # Simulated system monitor
│   │   ├── components/            # WindowFrame, Taskbar, DesktopIcons, CrtOverlay
│   │   └── context/DesktopContext.tsx
│   ├── shared/                    # Shared Types, Constants & Schemas
│   │   ├── constants.ts           # DEFAULT_MODEL_ID = 'ag/gemini-3.8-flash-medium'
│   │   ├── schemas.ts             # Zod validation schemas
│   │   ├── types.ts               # TypeScript interface contracts
│   │   ├── api-client.ts          # Front-end API client & SSE stream reader
│   │   └── storage.ts             # LocalStorage & save state manager
│   ├── App.tsx                    # Top-level React container
│   ├── main.tsx                   # React DOM entrypoint
│   └── index.css                  # Tailwind styles & pixel-art rendering rules
├── electron/                      # Electron Desktop Distribution
│   ├── main.ts                    # Secure BrowserWindow & IPC handlers
│   └── preload.ts                 # Narrow context bridge
├── scripts/
│   └── build-electron.mjs         # Electron build bundler
├── tests/                         # Vitest Test Suite
│   ├── schemas.test.ts            # Schema and defaults verification
│   ├── security.test.ts           # SSRF & secret masking tests
│   └── api-handlers.test.ts       # Vercel API function unit tests
├── .env.example                   # Example environment configuration
├── vercel.json                    # Vercel deployment configuration
├── vite.config.ts                 # Vite config with API dev middleware
├── tailwind.config.js             # Retro color theme & pixel shadows
├── tsconfig.json                  # Strict TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default local settings point to 9Router at `http://127.0.0.1:20128/v1`.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The embedded Vite API middleware automatically handles `/api/*` endpoints during local development!

---

## 🎮 How to Play

| Control | Action |
| :--- | :--- |
| **W, A, S, D** or **Arrow Keys** | Walk around the bedroom (diagonal speed normalized) |
| **E** | Interact with Computer Desk (when within range) |
| **Escape** | Close Virtual PC and return to bedroom walking mode |
| **Mouse Click / Drag** | Move desktop windows, launch applications from taskbar or icons |
| **CRT Button (Taskbar)** | Toggle nostalgic CRT monitor scanline overlay |
| **Speaker Button** | Toggle 8-bit sound effects on/off |

---

## 🤖 9Router Configuration & AI Model

### Default Model

The default model is configured as:

```text
ag/gemini-3.8-flash-medium
```

The system preserves the `ag/` prefix exactly when communicating with 9Router.

### Connecting to 9Router

1. Walk to the PC desk and press **E**.
2. Open **Settings** (or click the Settings icon on the desktop).
3. Under **9Router AI Gateway**:
   - **Base URL**: Set to `http://127.0.0.1:20128/v1` (for local gateway) or your remote HTTPS gateway.
   - **API Key**: Enter your 9Router Gateway key.
4. Click **Test Connection** to verify endpoint reachability and discover available models.
5. Click **Save Settings** to persist your configuration.
6. Open **AI Chat** and begin messaging!

---

## ☁️ Vercel Deployment Guide

Pixel PC is architected from the ground up for seamless deployment to Vercel.

### Step 1: Push Repository to GitHub

```bash
git add .
git commit -m "feat: complete Pixel PC release"
git remote add origin https://github.com/your-username/pixel-pc.git
git branch -M main
git push -u origin main
```

### Step 2: Import into Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your `pixel-pc` repository and click **Import**.
4. Vercel automatically detects the framework as **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

Under **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `ROUTER_BASE_URL` | `https://your-9router-domain.com/v1` | Publicly reachable HTTPS endpoint of your 9Router gateway. |
| `ROUTER_API_KEY` | *(Optional server key)* | Default server gateway key (optional; users can provide their own in-game). |
| `DEFAULT_MODEL` | `ag/gemini-3.8-flash-medium` | Default AI model ID. |

> ⚠️ **Important Network Note for Remote Deployment**:
> Vercel Functions run in the cloud and cannot directly reach `http://127.0.0.1:20128/v1` running on your local private PC. For production deployment on Vercel:
> - Expose your 9Router gateway using a secure HTTPS reverse proxy, Cloudflare Tunnel, or tailscale/wireguard tunnel with authentication.
> - Never expose an unauthenticated local gateway to the public internet.

### Step 4: Deploy & Verify

1. Click **Deploy**.
2. After deployment succeeds, test the health endpoint:
   ```bash
   curl https://your-deployment.vercel.app/api/health
   ```
   Expected response:
   ```json
   { "status": "healthy", "service": "Pixel PC Game Server", "version": "1.0.0" }
   ```
3. Open your deployed URL, walk to the PC, enter your credentials in Settings, and start chatting!

---

## 🖥️ Electron Desktop Build

To run or distribute Pixel PC as an Electron desktop application:

### Run in Development

```bash
npm run electron:dev
```

### Build Desktop Scripts & Binaries

```bash
# Build main and preload scripts
npm run build:electron

# Package executable for your current OS (Windows .exe, macOS .dmg, Linux AppImage)
npm run electron:pack
```

The Electron build uses:
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- Strict Content Security Policy (`script-src 'self' 'unsafe-inline'`)
- Narrow preload bridge without arbitrary Node.js filesystem access.

---

## 🧪 Testing & Verification

Run the automated test suite with Vitest:

```bash
# Run unit & API integration tests
npm test

# Run TypeScript type-checker
npm run typecheck

# Run production frontend bundle
npm run build
```

---

## 🔒 Security Best Practices

1. **No Secret Leakage**: API keys and tokens are never bundled into client JavaScript.
2. **SSRF Mitigation**: Outbound API proxy requests validate URLs and reject private cloud metadata addresses (`169.254.169.254` and `metadata.google.internal`).
3. **Safe Markdown Rendering**: AI responses are sanitized using DOMPurify before HTML rendering.
4. **Isolated Terminal**: The in-game terminal operates entirely in a fictional virtual memory space without executing system commands.

---

## 📄 License

MIT © 2026 Pixel PC Team. Original pixel art and code created for Pixel PC.
