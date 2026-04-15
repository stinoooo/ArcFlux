# Flux by Arcnode

Real-time color tracking & physics simulation for projection mapping.

**Live Demo**: [flux.arcnode.dev](https://flux.arcnode.dev)

## Features

- **Live Color Tracking** - OpenCV.js-powered HSV color detection with adjustable tolerance
- **Physics Simulation** - Matter.js physics with bouncing balls or reflective laser mode
- **Corner Pin Calibration** - Perspective correction for projection mapping alignment
- **High-Quality Webcam** - Support for 480p, 720p, 1080p, and 4K camera feeds
- **Persistent Settings** - Your preferences are saved locally
- **Modern UI** - Glass morphism design with keyboard shortcuts

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Toggle control panel |
| `C` | Open corner calibration |
| `Esc` | Close calibration overlay |

## Deployment

### Vercel (Recommended)

```bash
npx vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Manual Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand with persistence
- **Physics**: Matter.js
- **Vision**: OpenCV.js
- **Icons**: Lucide React

## Color Palette

The UI uses a refined matte black palette:

| Name | Hex |
|------|-----|
| Matte Black | `#28282B` |
| Walnut Hull | `#1B1813` |
| Tornado Cloud | `#121213` |
| Young Night | `#232323` |
| Stout | `#0F0B0A` |

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   └── panels/      # Control panel sections
├── hooks/           # Custom React hooks
├── lib/             # Utilities
└── store/           # Zustand store
```

## License

MIT

---

Built with care by [Arcnode](https://arcnode.dev)
