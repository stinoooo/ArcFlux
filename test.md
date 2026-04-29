# Arcnode Design System

> Engineering-first platform studio for building, experimenting with, and launching focused software projects.

This folder is the design system for **Arcnode** â€” a platform studio by Stijn (`stinoo.dev`) that ships well-engineered software projects under a single umbrella. The system captures the brand's visual foundations, content tone, components, and product UI kits so any agent, designer, or engineer can produce on-brand work.

---

## What is Arcnode?

> "A workspace for serious software." â€” `arcnode.dev` hero copy

Arcnode is **not a single product**. It's a platform studio: a workspace and launchpad for focused software projects, each engineered for quality and shipped iteratively. The author Stijn (`@s_tinoo`) is a CS / Software Engineering student in the Netherlands; the brand reflects an OOP, backend-leaning, "ship in public" mindset.

**Three brand principles (`components/WhatIsArcnode.tsx`):**

1. **Engineering-first** â€” Clean structure, maintainable systems, thoughtful architecture.
2. **Ship in public** â€” Build iteratively, launch frequently, improve continuously.
3. **One umbrella** â€” Tools, experiments, and products unified under a single platform.

---

## Products in the Arcnode Network

| Product            | Status   | Description                                                                                              | Stack                                |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **arcnode.dev**    | Live     | Marketing site & "platform" landing page â€” hero, projects grid, about, updates/roadmap, waitlist.        | Next.js 14, Tailwind, Framer Motion  |
| **ArcInternship** | Live     | Web app to log internship hours and daily activities. Light **and** dark mode. Bilingual (NL / EN).      | Next.js 14, Tailwind, NextAuth, Mongo |
| **ArcUnzip**       | Live     | In-browser ZIP archive viewer with file tree, content search, and JSON / media preview.                  | Next.js 15, Tailwind v4, zip.js      |
| **ArcJournal**     | Live     | Cross-platform desktop journaling app (Electron). Daily entries, emotion tags, day grading.              | Electron, React/Vite, Express server |
| **ArcTasks**       | Planned  | Task / to-do management app on the Arcnode network.                                                      | â€”                                    |
| **ArcType**        | Building | Typing test platform with deep statistics.                                                               | â€”                                    |
| **ArcSentinel**    | Building | OSINT / domain intelligence platform.                                                                    | â€”                                    |
| Other Arc-* repos  | Various  | ArcFlux (projection mapping), ArcValentine, ArcPulse, ArcNote, ArcNote (notes app), and more.            | â€”                                    |

The **arcnode.dev** site itself is the canonical brand surface; ArcInternship and ArcUnzip are the cleanest in-product expressions of the design language.

---

## Source materials

Everything here was derived from the user's GitHub repositories and uploaded brand assets. Paths are recorded for reference in case the reader has access.

**GitHub repos (under `stinoooo/`):**

- `ArcNode` (main) â€” marketing site. [package.json, tailwind.config.ts, components/*.tsx, data/projects.ts]
- `ArcInternship` (main) â€” internal app. [src/app/globals.css, tailwind.config.ts, src/app/login/page.tsx, src/components/*]
- `ArcUnzip` (main) â€” utility app. [src/app/globals.css, src/components/arcunzip-app.tsx]
- `ArcJournal` (main) â€” Electron desktop app. [client/src/components/*, client/public/emotions/*]

**Uploaded files (now in `assets/`):**

- `assets/bluelogo.svg` â€” primary cyan logo on transparent
- `assets/whitelogo.svg` â€” white logo on transparent
- `assets/bluelogo-background.svg` â€” square logo with navy + grid background tile
- `assets/banner_widest.png`, `banner_larger.png`, `banner_wide.png`, `banner_large.png` â€” wordmark banners on grid-paper backgrounds
- `assets/banner_no_logo.png` â€” empty grid-paper banner with the diagonal split (use as a generic hero background)

---

## Content fundamentals

### Voice & tone

Arcnode writes like a thoughtful senior engineer talking to other engineers. The voice is **calm, direct, and specific** â€” it favors concrete nouns ("workspace", "launchpad", "platform") over hype. There is a small streak of dry humor in the utility products (e.g. ArcUnzip's tagline) but never on the main site.

- **Direct & declarative.** Sentences state facts, not promises. _"Arcnode is a platform studio by Stijn under the stinoo.dev network."_ _"No spam. Just launches."_
- **Short clauses. Active verbs.** _"Building, experimenting with, and shipping well-engineered software projects over time."_
- **First-person plural is rare**; the brand mostly uses third-person about itself ("Arcnode is...") or addresses the visitor in second person ("Stay updated", "Get in Touch").
- **No marketing fluff.** Avoid words like _revolutionary_, _seamless_, _empower_, _unleash_, _delightful_.

### Tone by surface

| Surface                     | Tone                                                       | Example copy                                                                             |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Marketing (arcnode.dev)** | Calm, confident, declarative. Lower the volume.            | _"A workspace for **serious software**."_ _"Real projects, live systems, and future launches."_ |
| **Product UI**              | Functional, plain, helpful. No exclamation points.         | _"No file selected"_ _"Choose a file from the left panel"_ _"Search index ready."_       |
| **Utility / quirky**        | One small joke is allowed in the subtitle, then back to plain. | ArcUnzip: _"Browse ZIP archives beautifully. No, not your pants, you filthy animal."_ |
| **Status messages**         | Past-tense, specific, no fanfare.                          | _"Loaded \"foo.zip\". Building search index..."_ _"Copied to clipboard."_                |
| **Email / form responses**  | Short and human.                                           | _"Thanks for joining the waitlist! Check your email."_ _"Message sent successfully!"_    |

### Casing rules

- **Headings:** Title Case for sections (`Get in Touch`, `Updates & Roadmap`, `Send a Message`). Sentence-style hero (`A workspace for serious software`).
- **Buttons:** Title Case, verb-first (`Explore Projects`, `Join Waitlist`, `Open ZIP`, `Send Message`).
- **The wordmark:** lowercase **`arcnode`** when used inline next to the logo (see `Navbar.tsx`). Capitalized **`Arcnode`** in prose, metadata, and titles.
- **Eyebrows / labels:** UPPERCASE, wide tracking (`0.18em`), small (12 px).
- **Status pills:** Title Case (`Live`, `Building`, `Planned`, `Idea`).

### Person & address

- The brand refers to itself as _"Arcnode"_ â€” never _"we"_ on the marketing site.
- Stijn the person is _"Stijn"_ (about page) or _"@s_tinoo"_ (X) â€” the brand acknowledges its solo author rather than pretending to be a team.
- Visitors are addressed as _"you"_ in second-person CTAs.

### Emoji & punctuation

- **No emoji** in marketing or in product UI. Lucide icons do all the work.
- ArcJournal does use emoji for emotion tagging â€” but that's domain-specific (the user is annotating their own feelings), not brand voice.
- Em-dashes are used naturally in long-form copy. No exclamation points in product UI; one or two in success-state toasts is the maximum.

### Naming conventions

- All in-house products are prefixed **`Arc`** with a CapitalCased suffix: `ArcNode`, `ArcInternship`, `ArcUnzip`, `ArcJournal`, `ArcTasks`, `ArcType`, `ArcSentinel`, `ArcFlux`, `ArcNote`, etc.
- The org-level / network is **arcnode** (lowercase) or **Arcnode Network**.
- Subdomains follow the pattern `<product>.arcnode.dev` or `<product>.stinoo.dev`.

---

## Visual foundations

### The brand "look"

Arcnode reads as a **late-night engineering blueprint**: a deep navy page, a faint grid-paper texture, a single bright cyan accent, and clean Inter type. The signature visual is the **wordmark on a navy + grid background with a diagonal split** seen in every banner asset. Treat that combination â€” navy + grid + cyan + diagonal â€” as the brand's atmospheric fingerprint.

### Color

- **Background:** `#0B1020` (almost-black navy). This is the primary surface.
- **Cards / panels:** `#111A33` â€” sit slightly lighter on the page.
- **Slate / borders:** `#1E2A4A` â€” used for hairlines, raised surfaces, soft separators.
- **Accent (cyan):** `#6AE4FF` â€” exactly one accent color across the entire system. It is _the_ thing the eye lands on. Never compete with a second accent.
  - Tints: `#9AEEFF` (light), `#3ECBEB` (dark hover).
  - Glow: `rgba(106,228,255,0.12)` for borders and soft fills, `rgba(106,228,255,0.05)` for shadow tints.
- **Text:** primary `#E8ECF5`, secondary `#C0C8DB`, muted `#9AA6C2`.
- **Status:** success `#3DFFB5`, error `#FF5C7A`. Both desaturated; success is mint-green not Material green.
- **Light mode** (ArcInternship only): `#EEF1FA` page, `#FFFFFF` cards, `#0B1020` text. Accent shifts to `#0EA5C9` for AA contrast on light.

> **One accent rule:** cyan is the only chromatic color in the UI. Everything else is a navy / slate / fog. If a design needs a second hue, use a status color (success / error) â€” don't introduce purple, orange, or magenta.

### Typography

- **Display & UI:** **Inter** (300, 400, 500, 600, 700). Loaded via Google Fonts in every product.
- **Mono:** **JetBrains Mono** (400, 500, 600). Used for code, JSON keys, file extensions, terminal-y micro-copy.
- **Hierarchy:**
  - Hero (`h1`): 48â€“60 px, bold (700), tight tracking (-0.02 em), text-balance on.
  - Section (`h2`): 30â€“36 px, bold.
  - Card title (`h3`): 20â€“24 px, semibold (600).
  - Body: 16 px, line-height 1.6, color `var(--fg-2)`.
  - Small / muted: 14 px.
  - Eyebrow: 12 px, UPPERCASE, tracking `0.18em`, color `var(--fg-3)`.
- Headings are always semibold or bold; never light. Body text is regular (400).
- Use `text-balance` (or `text-wrap: balance`) on hero / section headlines. Use `text-wrap: pretty` on long paragraphs.

### Spacing

A **4 px base** scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. Sections use 96 px vertical padding (`py-24` in Tailwind). Cards use 24â€“32 px internal padding.

### Radii

- **Buttons / inputs:** 8 px (`--radius-md`).
- **Pills / status badges:** fully rounded (999 px).
- **Small cards:** 12 px (`--radius-lg`).
- **Cards (default):** 16 px (`--radius-xl`).
- **Large cards:** 20â€“24 px.
- **Glass panels (ArcUnzip signature):** **28 px** (`--radius-3xl`). Reserve this for big top-level panels.

### Borders & dividers

- Default border: `1px solid var(--arc-border)` (`#1E2A4A`) on dark; `#C8D0E8` on light.
- Glass panels use a softer border: `1px solid rgba(255,255,255,0.08)`.
- "Active" / focus state borders pull cyan: `border-color: rgba(106,228,255,0.20)` or `0.35`.
- Hairline at the bottom of nav: `border-b border-surface` only after the user scrolls past 20 px (Navbar.tsx).

### Shadows & elevation

Three elevation tiers, plus a "cyan glow" used sparingly:

- **`shadow-sm`**: `0 1px 2px rgba(0,0,0,0.20)` â€” subtle separation under inputs.
- **`shadow-md`**: `0 4px 12px rgba(0,0,0,0.24)` â€” buttons on hover.
- **`shadow-panel`**: `0 20px 60px rgba(0,0,0,0.32)` â€” the ArcUnzip glass panels. This is the "big card" shadow.
- **Cyan glow on hover**: `0 8px 32px rgba(106,228,255,0.05)` â€” projects-grid cards. Always keep the alpha very low (â‰¤ 0.12).

Inner shadows are **not** used. Insets / etched effects are not part of the system.

### Backgrounds & atmosphere

Three background patterns recur:

1. **Flat navy** (`#0B1020`). Default for marketing pages and cards.
2. **Atmospheric gradient** (ArcUnzip): two faint cyan radial spots top-left + top-right + a vertical gradient `#08101F â†’ #0B1020 â†’ #060B16`. Use for hero sections of utility products.
3. **Grid-paper banner**: the diagonal split + cyan grid texture seen in `assets/banner_*.png`. Use as a hero background for "studio / network" framing. The banner itself is the strongest brand mark; treat it as an asset, not a CSS recipe to clone.

Hero sections often layer a faint, large SVG arc shape behind the headline (`Hero.tsx` uses a 800Ã—800 stroke arc at 10 % opacity).

### Transparency & blur

Glass panels use `backdrop-filter: blur(18px)` on a `rgba(17,26,51,0.72)` (or `rgba(11,16,32,0.9)` for stronger) fill. This is the core "depth" trick of the system â€” used for the ArcUnzip header / explorer / preview panels and the navbar after scroll. Don't use blur on small components; reserve for full-width chrome.

### Imagery vibe

Imagery is **cool, technical, and sparse**: navy-on-cyan grid backgrounds, geometric arc shapes, and the logo glyph itself. There are no photographs and no AI illustrations on the marketing site. ArcJournal uses small painterly emotion icons that read as personal/diary; that's the exception, not the rule.

When a generic hero image is needed, use one of the `banner_*.png` assets. They are designed to tile horizontally and have safe space at the bottom for the wordmark.

### Layout rules

- **Container max widths:**
  - `max-w-7xl` (1280 px) for marketing nav / projects grid.
  - `max-w-5xl` (1024 px) for hero text.
  - `max-w-4xl` (896 px) for content sections (About, WhatIsArcnode, Contact).
  - `max-w-md` (448 px) for forms / waitlist.
- **Side padding:** `px-4 sm:px-6 lg:px-8` (responsive 16 / 24 / 32 px).
- **Section vertical:** `py-24` (96 px).
- **Fixed elements:** Navbar is sticky-fixed top, transparent until scroll-y > 20 px, then becomes `bg-background/95 backdrop-blur-sm` with a `border-b`.

### Animation

Animation is a quiet, purposeful layer â€” **never bouncy, never long**. Brand uses **Framer Motion** on marketing surfaces.

- **Easing:** `ease-out` on enter, default ease on hover. No spring physics.
- **Durations:**
  - Micro-interactions / hover: **150 ms** (`duration-150`).
  - Page-level enter: **600 ms** with a 200 ms stagger between siblings (Hero, About, Projects).
  - Card-grid stagger: **400 ms** with `index * 0.1` per card.
- **Patterns used:**
  - `initial={{opacity: 0, y: 20}} â†’ animate={{opacity: 1, y: 0}}` for everything that enters.
  - `whileInView` with `viewport={{ once: true }}` for sections (animate once on first scroll-into-view).
  - Logo on hover: `scale: 1.10` over 200 ms.
  - Primary button on hover: `scale: 1.05`.
  - Status / form-response toasts slide down 10 px and fade in.
- **What's NOT in the system:** no parallax, no sticky-on-scroll reveals, no loop-anims, no hero typewriter, no Lottie. Reduced-motion is honored globally (see `app/globals.css`).

### Hover & press states

- **Primary button** (`bg-accent text-background`): on hover â†’ `bg-accent/90` + `scale-105` (marketing) or just `bg-accent/90` (in-app). 150 ms transition.
- **Secondary button** (`bg-surface text-text border border-surface`): on hover â†’ `bg-surface/80` + `border-muted`.
- **Cards (clickable)**: on hover â†’ `border-accent/50` + `shadow-lg shadow-accent/5`.
- **Text links**: muted â†’ primary text color on hover (`text-muted hover:text-text`). Underline only on `<a>` inside prose.
- **Icon-only buttons** (close, menu): `text-muted hover:text-text`.
- **Disabled** (loading): `opacity-50 cursor-not-allowed`.
- **Press**: no explicit press scale â€” the system relies on the hover transition completing naturally.

### Focus states

- Inputs: `focus:outline-none focus:border-accent` (with `focus:ring-2 ring-arc-blue/40` in ArcInternship).
- Buttons: rely on default focus ring; ArcUnzip uses `focus:ring-4 focus:ring-cyan/10`.

### Cards

The Arcnode card is the workhorse:

```
bg: var(--bg-card)         (#111A33 dark / #FFFFFF light)
border: 1px solid var(--arc-border)
radius: 16-20px
padding: 24-32px
shadow: none by default; shadow-lg with cyan tint on hover (clickable)
```

Glass panels (ArcUnzip): same idea but with the 28 px radius, blur(18px), and the deep panel shadow.

### Iconography

See `ICONOGRAPHY` section below.

---

## Iconography

**Library:** [**Lucide**](https://lucide.dev) (`lucide-react`). Used in ArcUnzip and ArcInternship and assumed across all in-house tooling. Sourced via npm in production; in this design system we link it via CDN (`https://unpkg.com/lucide-static@latest/font/lucide.css`) for use in HTML mockups.

**Style guidelines:**

- Stroke width **1.5â€“2 px** (the Lucide default of 2 is fine).
- Size by context: **14 px** inline with body text, **16 px** in buttons, **18â€“20 px** in headers, **24 px** in hero / standalone use.
- **Color** matches the surrounding text â€” `text-muted` next to muted copy, `text-accent` (cyan) for active or branded states, `text-arc-blue` style tinting only in headers (`<FolderTree className="text-cyan" />`).
- Icons sit with `gap-2` next to their label, never tightly packed.

**Specific icons seen in code:**

- ArcUnzip: `Upload`, `Search`, `Copy`, `Download`, `FolderTree`, `Sparkles`.
- ArcInternship: `Eye`, `EyeOff`, `LogIn`.
- Navbar: hand-rolled hamburger / close SVG (because it's just two paths).

**Custom inline SVG** is used only for:

- The Lucide-incompatible **logo glyph** (see `assets/bluelogo.svg`).
- The decorative arc behind the hero (`Hero.tsx` â€” a single 800 Ã— 800 `<path>` + center `<circle>`).

**Emoji**: not used in chrome, marketing, or product UI. Only ArcJournal uses emotion-image PNGs (not unicode emoji) for tagging journal entries â€” those are domain content, not iconography.

**Brand glyph:** the stylized "A" with rounded apex â€” used as `favicon.svg` and as the small logo mark in `Navbar.tsx` at 28 Ã— 28 px. It is recognizable on its own; never recolor it outside the brand cyan / white set.

---

## What's in this folder

```
README.md                 â€” this file
SKILL.md                  â€” Agent-Skill manifest (cross-compatible with Claude Code Skills)
colors_and_type.css       â€” CSS variables: colors, type, spacing, radii, shadows, motion

assets/                   â€” logos, banners, brand imagery
  bluelogo.svg
  whitelogo.svg
  bluelogo-background.svg
  banner_widest.png
  banner_larger.png
  banner_wide.png
  banner_large.png
  banner_no_logo.png

preview/                  â€” design-system review cards (Type / Colors / Spacing / Components / Brand)

ui_kits/
  arcnode-marketing/      â€” UI kit for the arcnode.dev marketing site
  arcinternship/          â€” UI kit for the ArcInternship dashboard
  arcunzip/               â€” UI kit for the ArcUnzip utility
```

Each UI kit has its own `README.md`, `index.html` (interactive demo), and JSX components.

---

## Caveats

- **Fonts** load from Google Fonts (Inter, JetBrains Mono). They are not bundled as `.ttf` in `fonts/` â€” every product references the Google Fonts CDN, so this matches production. If you need offline fonts, download from Google.
- **The "A" logo glyph** is provided as the original 1560 Ã— 1560 SVG with thousands of dot-paths (it's a rasterized export). For tiny sizes, prefer `favicon.svg` or render it as a flat fill at higher resolution.
- **ArcJournal** is an Electron desktop app; we did not build a UI kit for it (the timer, the marketing site, ArcUnzip, and ArcInternship cover the full visual range). Its emotion-tagging icons are noted as the only place where painterly imagery exists in the brand.