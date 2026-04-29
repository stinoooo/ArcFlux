# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server on :3000
npm run build    # production build
npm start        # serve the production build
npm run lint     # next lint (eslint flat config, extends next/core-web-vitals)
```

There is no test suite. There are no separate type-check scripts; rely on `next build` or `npx tsc --noEmit` (after `npm install`) for type errors.

Deployed to `flux.arcnode.dev` via Vercel — `vercel.json` declares Next.js framework + security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`).

## Architecture

The repo holds **two parallel implementations** of the same app — this is the most important thing to understand before touching anything:

1. **Next.js 15 / React 19 / TypeScript** (active, deployed) — everything under `src/`.
2. **Legacy standalone** — root `index.html` + `app.js` + `style.css`. Originally how the project was built. Kept around but **not the deployed code path**. Edit the Next.js version unless explicitly asked otherwise.

### The Next.js pipeline (3 cooperating systems)

`src/components/FluxApp.tsx` is the orchestrator. It owns the `requestAnimationFrame` loop and drives three subsystems through hooks:

- **`useWebcam`** (`src/hooks/useWebcam.ts`) — camera permissions, device enumeration, `getUserMedia` with quality presets from `getWebcamConstraints` in `src/lib/utils.ts`.
- **`useOpenCV`** (`src/hooks/useOpenCV.ts`) — color detection. Loads OpenCV.js, exposes `processFrame(video, hiddenCanvas, outputCanvas) → DetectedBlock[]`.
- **`usePhysics`** (`src/hooks/usePhysics.ts`) — Matter.js engine, walls, ball spawning, applying detected blocks as static rectangles.

The flow each frame: video → drawImage to a hidden canvas → OpenCV color mask → contour bounding boxes → physics rebuilds static blocks → Matter.js renders.

### Performance constraints — read before changing the OpenCV hook

OpenCV.js runs in WebAssembly. **Mat allocation is expensive.** The current `useOpenCV` is built around two non-obvious invariants:

1. **Persistent Mat pool** stored in a ref (`poolRef`). `src`, `hsv`, `mask`, `maskWrap`, `kernel`, `hierarchy` are allocated once and only re-created when the processing resolution changes. Do **not** reintroduce per-frame `new cv.Mat()` calls in the inner loop — earlier versions did this and caused FPS to collapse on 1080p.
2. **Fixed downscale to `PROC_WIDTH = 480`** regardless of webcam resolution. Detection runs on a small buffer; the full-res webcam is only for the visual background. Don't tie processing resolution to `video.videoWidth`.

The render loop in `FluxApp.tsx` runs OpenCV at ~30 fps (33 ms throttle) and skips `setDetectedBlocks` when the count is unchanged to avoid re-render cascades through the Zustand-subscribed status panel. Both are deliberate.

### State

Single Zustand store at `src/store/useFluxStore.ts`. **Persistence is intentionally disabled** (see comment "Create store without persist for now to avoid hydration issues") — adding `persist()` will break SSR hydration. Only one piece of state is stored across sessions: the `flux-intro-seen-v1` flag in localStorage, set directly by `FluxApp.tsx`.

### OpenCV.js loading

`src/components/OpenCVLoader.tsx` injects `/opencv.js` (served from `public/`, ~10 MB) with `strategy="lazyOnload"`. `useOpenCV` polls `window.cv` for up to 10s, then handles both the function-form (cv 4.x async init) and direct-form module shapes. The `next.config.js` sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` because OpenCV's WASM threading needs cross-origin isolation.

### UI structure

- `ControlPanel` (top-right) wraps four collapsible sections from `src/components/panels/`: `StatusPanel`, `PhysicsPanel`, `ColorPanel`, `CameraPanel`. UI primitives live in `src/components/ui/`.
- `IntroScreen` is a tabbed modal (About / Privacy / Terms). Auto-shows on first visit, reopens via the info button, footer links, or `I` / `?` keypress.
- `CalibrationOverlay` handles corner-pin perspective calibration for projector alignment.
- Keyboard: `H` toggles panel, `C` opens calibration, `I`/`?` opens intro, `Esc` closes overlays.

### Styling

Tailwind config in `tailwind.config.ts` defines the brand palette — **matte black** (`matte`, `walnut`, `tornado`, `night`, `stout`) and **teal arc** (`arc-primary`, `arc-secondary`, `arc-accent`, `arc-glow`, `arc-deep`). Reusable component classes (`glass-panel`, `btn-primary`, `slider`, `kbd`, `panel-section`, `section-header`, etc.) are defined in `src/app/globals.css` under `@layer components`. Use those tokens rather than hard-coded hex.

## Privacy contract

The privacy policy in `IntroScreen.tsx` makes specific factual claims based on a code audit:

- No `fetch`/`XMLHttpRequest`/`sendBeacon` calls anywhere.
- No analytics, cookies, or tracking.
- localStorage holds only the intro-seen flag.
- Webcam frames never leave the device.
- Third-party touchpoints disclosed: Vercel hosting, Google Fonts, Cloudflare cdnjs (matter.js).

If a change adds anything that breaks the above (analytics, telemetry, error reporting, a backend, more localStorage keys, a new third-party script), the Privacy tab in `src/components/IntroScreen.tsx` must be updated in the same change.
