'use client'

import { useState } from 'react'
import { X, Camera, Wand2, Layers, Shield, FileText, Info, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'about' | 'privacy' | 'terms'

interface IntroScreenProps {
  onClose: () => void
  /** When true, the close button reads "Begin" — used for the first-visit overlay. */
  firstVisit?: boolean
}

export function IntroScreen({ onClose, firstVisit = false }: IntroScreenProps) {
  const [tab, setTab] = useState<Tab>('about')

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop — vignette + blur, not flat dim */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(11,11,12,0.85), rgba(11,11,12,0.96))',
        }}
      />

      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col panel reveal font-mono">
        {/* ── Front matter — looks like the cover of a technical bulletin ── */}
        <header className="px-6 sm:px-8 pt-7 pb-5 border-b border-[var(--line)]">
          <div className="flex items-start justify-between gap-6 reveal reveal-1">
            <div className="flex items-start gap-4">
              <div className="brand-mark w-12 h-12 mt-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/arcnode.svg"
                  alt="Arcnode"
                  className="w-full h-full object-contain"
                  style={{
                    filter:
                      'invert(78%) sepia(60%) saturate(420%) hue-rotate(135deg) brightness(105%) drop-shadow(0 0 6px var(--signal-glow))',
                  }}
                />
              </div>
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-signal glow-signal">
                    Bulletin · 01
                  </span>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)]">
                    Rev 2026·04·29
                  </span>
                </div>
                <h1 className="display-serif text-[44px] leading-[0.95] text-[var(--text)]">
                  Flux<span className="italic text-signal glow-signal">.</span>
                </h1>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--text-dim)] mt-1.5">
                  An optical instrument · by Arcnode
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[var(--text-faint)] hover:text-signal transition-colors p-2 -m-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ── Tab strip ────────────────────────────────────────────── */}
        <nav className="flex items-stretch border-b border-[var(--line)] bg-[var(--ink-1)] reveal reveal-2">
          <TabBtn id="about" active={tab} onClick={setTab} icon={<Info className="w-3 h-3" />} num="01">
            Manual
          </TabBtn>
          <TabBtn id="privacy" active={tab} onClick={setTab} icon={<Shield className="w-3 h-3" />} num="02">
            Privacy
          </TabBtn>
          <TabBtn id="terms" active={tab} onClick={setTab} icon={<FileText className="w-3 h-3" />} num="03">
            Terms
          </TabBtn>
          <div className="flex-1" />
          <span className="hidden sm:flex items-center px-4 text-[9px] tracking-[0.22em] uppercase text-[var(--text-quiet)]">
            NL · EN · AVG / GDPR
          </span>
        </nav>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-7 reveal reveal-3">
          {tab === 'about' && <AboutContent />}
          {tab === 'privacy' && <PrivacyContent />}
          {tab === 'terms' && <TermsContent />}
        </div>

        {/* ── Colophon footer ─────────────────────────────────────── */}
        <footer className="flex items-center justify-between gap-4 px-6 sm:px-8 py-3.5 border-t border-[var(--line)] bg-[var(--ink-0)]/60 reveal reveal-4">
          <div className="flex items-center gap-3 text-[9px] tracking-[0.22em] uppercase text-[var(--text-faint)]">
            <span>Arcnode</span>
            <span className="w-px h-3 bg-[var(--line-bright)]" />
            <a
              href="https://arcnode.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-signal transition-colors"
            >
              arcnode.dev
            </a>
          </div>
          <button onClick={onClose} className="btn btn-primary">
            {firstVisit ? 'Begin' : 'Close'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </footer>
      </div>
    </div>
  )
}

function TabBtn({
  id,
  active,
  onClick,
  icon,
  num,
  children,
}: {
  id: Tab
  active: Tab
  onClick: (t: Tab) => void
  icon: React.ReactNode
  num: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => onClick(id)}
      data-active={active === id}
      className="tab-btn px-4 sm:px-5"
    >
      <span className={cn('tnum text-[9px]', active === id ? 'text-signal' : 'text-[var(--text-quiet)]')}>
        {num}
      </span>
      {icon}
      {children}
    </button>
  )
}

/* ===========================================================
   ABOUT
   =========================================================== */

function AboutContent() {
  return (
    <article className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-[1fr,2fr]">
        <h2 className="display-serif text-[28px] leading-[1.05] text-[var(--text)]">
          A camera-driven<br />
          <span className="italic text-[var(--text-dim)]">physics canvas.</span>
        </h2>
        <p className="text-[13px] leading-[1.7] text-[var(--text-dim)] pt-2 sm:pt-2.5">
          Flux turns whatever your camera sees into a playground. Mark a surface with any colour
          you like &mdash; tape, paper, a marker, a cup &mdash; and Flux detects those shapes,
          letting virtual balls or a laser bounce off them in real time. Built for projection
          mapping, classroom demos, art installations and idle curiosity.
        </p>
      </section>

      <div className="hairline" />

      <section className="grid gap-3 sm:grid-cols-3">
        <Step
          num="01"
          title="See"
          icon={<Camera className="w-4 h-4" />}
        >
          Point a webcam at your scene. Anything in your chosen colour becomes a solid object.
        </Step>
        <Step
          num="02"
          title="Track"
          icon={<Wand2 className="w-4 h-4" />}
        >
          OpenCV finds those colour patches frame by frame &mdash; entirely on your device.
        </Step>
        <Step
          num="03"
          title="React"
          icon={<Layers className="w-4 h-4" />}
        >
          Matter.js drops bouncing balls or fires a laser that reflects off whatever you placed.
        </Step>
      </section>

      <div className="hairline" />

      <section className="space-y-3">
        <div className="section-rule">
          <span className="section-rule-num">04</span>
          <span>Procedure</span>
          <span className="section-rule-line" />
        </div>
        <ol className="space-y-2 text-[12.5px] text-[var(--text-dim)] leading-[1.7]">
          <ProcStep n="i.">
            Press <span className="text-signal">Start</span> in the panel, top-right. Allow camera access.
          </ProcStep>
          <ProcStep n="ii.">
            Open <span className="text-signal">Optics</span> and pick the colour you want to track.
          </ProcStep>
          <ProcStep n="iii.">
            Hold something in that colour in front of the lens. Balls bounce off it.
          </ProcStep>
          <ProcStep n="iv.">
            Tune tolerance, gravity and spawn rate. Press <kbd className="kbd">C</kbd> for projector calibration.
          </ProcStep>
        </ol>
      </section>

      <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-quiet)] pt-2">
        <kbd className="kbd">H</kbd> hide panel · <kbd className="kbd">I</kbd> manual · <kbd className="kbd">C</kbd> calibration · <kbd className="kbd">Esc</kbd> close
      </p>
    </article>
  )
}

function Step({
  num,
  title,
  icon,
  children,
}: {
  num: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="relative panel-quiet p-4 group">
      <div className="flex items-center gap-2 mb-3">
        <span className="tnum text-[10px] tracking-[0.2em] uppercase text-signal">{num}</span>
        <span className="flex-1 h-px bg-[var(--line)]" />
        <span className="text-[var(--signal)] opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
      </div>
      <h3 className="display-serif text-[20px] leading-none text-[var(--text)] mb-2 italic">{title}</h3>
      <p className="text-[11.5px] leading-[1.6] text-[var(--text-dim)]">{children}</p>
    </div>
  )
}

function ProcStep({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="tnum text-signal w-6 shrink-0 italic">{n}</span>
      <span>{children}</span>
    </li>
  )
}

/* ===========================================================
   PRIVACY
   =========================================================== */

function PrivacyContent() {
  return (
    <article className="space-y-7">
      <DocHead
        title="Privacy Policy"
        subtitle="Last revised 29 April 2026 · Governed by Dutch law (AVG / GDPR)"
      />

      <Pull>
        <span className="text-[var(--text)] font-semibold">Short version:</span> Flux runs entirely
        in your browser. No accounts, no server, no database, no analytics, no tracking. Your
        camera feed never leaves your device. We genuinely collect nothing.
      </Pull>

      <Sec n="01" title="Who we are">
        <p>
          This website is provided by <span className="text-[var(--text)]">Arcnode</span>{' '}
          (&quot;we&quot;, &quot;us&quot;), reachable at{' '}
          <a href="mailto:hello@arcnode.dev" className="text-signal hover:underline">hello@arcnode.dev</a>.
          Under the Dutch implementation of the GDPR (UAVG), Arcnode is the data controller for
          the limited processing described below.
        </p>
      </Sec>

      <Sec n="02" title="What we do not collect">
        <ul className="space-y-1.5 list-none">
          <Item>No accounts, no sign-up, no email collection.</Item>
          <Item>No cookies are set by Flux itself.</Item>
          <Item>No analytics (no Google Analytics, Plausible, Vercel Analytics, Sentry, etc.).</Item>
          <Item>No advertising, ad networks, or tracking pixels.</Item>
          <Item>No fingerprinting, no behavioural profiling.</Item>
          <Item>No newsletters, no contact forms, no chat widgets.</Item>
        </ul>
      </Sec>

      <Sec n="03" title="Camera footage">
        <p>
          When you click <span className="text-signal">Start</span>, your browser asks permission to
          access a webcam. The video stream is processed{' '}
          <span className="text-[var(--text)]">locally in your browser</span> by OpenCV.js
          (compiled to WebAssembly) and Matter.js. Frames are rendered to a canvas, scanned for
          the colour you picked, then discarded.
        </p>
        <p>
          The video is{' '}
          <span className="text-[var(--text)]">never uploaded, never recorded, never sent to any
          server</span> &mdash; not ours, not a third party&apos;s. You can verify this yourself: the
          source is public and your browser&apos;s network tab will show no uploads while the camera
          is running.
        </p>
        <p>
          You can revoke camera access in your browser settings at any time. Closing the tab
          stops the camera immediately.
        </p>
      </Sec>

      <Sec n="04" title="What is stored on your device">
        <p>
          Flux uses your browser&apos;s{' '}
          <code className="px-1.5 py-0.5 bg-[var(--ink-2)] border border-[var(--line)] text-signal text-[11px]">localStorage</code>{' '}
          only to remember:
        </p>
        <ul className="space-y-1.5 list-none">
          <Item>Your UI preferences (slider values, selected colour, panel state).</Item>
          <Item>A flag indicating you&apos;ve dismissed this manual.</Item>
        </ul>
        <p>
          This data lives only in your browser. It is never transmitted to us. You can wipe it
          any time via your browser&apos;s site-data settings, or by clicking <em>Reset</em> in the
          control panel. Under the Dutch Telecommunications Act (Telecommunicatiewet, art. 11.7a)
          this strictly-functional use does not require consent.
        </p>
      </Sec>

      <Sec n="05" title="Third parties involved in delivering the page">
        <p>
          Although Flux itself does not contact any backend, loading any web page involves third
          parties that necessarily see your IP address. Under the GDPR an IP address can be
          personal data, so we list them here transparently:
        </p>
        <ul className="space-y-2 list-none">
          <Item>
            <span className="text-[var(--text)]">Vercel Inc.</span> (United States) hosts the static
            files. Vercel sees your IP and request metadata to deliver the page. Legal basis:
            legitimate interest (art. 6(1)(f) GDPR). Transfers outside the EEA are covered by
            Vercel&apos;s Standard Contractual Clauses.
          </Item>
          <Item>
            <span className="text-[var(--text)]">Google Fonts</span>. The Instrument Serif and
            JetBrains Mono fonts are served via Next.js&apos; <code className="px-1 bg-[var(--ink-2)] text-signal text-[11px]">next/font</code>
            mechanism, which downloads them at <em>build</em> time and serves them from our own
            origin &mdash; so Google does not see your IP at runtime.
          </Item>
          <Item>
            <span className="text-[var(--text)]">Cloudflare cdnjs</span> hosts the Matter.js physics
            library that the simulation depends on. Cloudflare sees your IP address to deliver
            the script.
          </Item>
        </ul>
        <p>
          None of these services receive any of your camera footage, your settings or any
          personal data we know about &mdash; because we do not know any.
        </p>
      </Sec>

      <Sec n="06" title="Your rights under the GDPR / AVG">
        <p>
          Even though we hold no data about you, you retain the rights of access, rectification,
          erasure, restriction, portability and objection. To exercise them, email{' '}
          <a href="mailto:hello@arcnode.dev" className="text-signal hover:underline">hello@arcnode.dev</a>.
          You may file a complaint with the Dutch DPA (
          <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">Autoriteit Persoonsgegevens</a>
          ).
        </p>
      </Sec>

      <Sec n="07" title="Children">
        <p>
          Flux is safe to use for children, but we recommend parental supervision when activating
          the camera, as is best practice for any device with a webcam.
        </p>
      </Sec>

      <Sec n="08" title="Changes to this policy">
        <p>
          When this policy changes, the date at the top of this section will update. The
          revision history is visible in the public source code repository.
        </p>
      </Sec>
    </article>
  )
}

/* ===========================================================
   TERMS
   =========================================================== */

function TermsContent() {
  return (
    <article className="space-y-7">
      <DocHead
        title="Terms of Use"
        subtitle="Last revised 29 April 2026 · Governed by Dutch law"
      />

      <Sec n="01" title="The service">
        <p>
          Flux is a free, browser-based tool for real-time colour tracking and physics
          simulation, provided by Arcnode. It is offered as-is, without any guarantee of
          continued availability.
        </p>
      </Sec>

      <Sec n="02" title="License">
        <p>
          The Flux source code is released under the MIT License. You are free to use, modify
          and self-host it. The Arcnode name and logo are not covered by the MIT License and
          remain the property of Arcnode.
        </p>
      </Sec>

      <Sec n="03" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="space-y-1.5 list-none">
          <Item>
            Record or surveil people without their informed consent. Flux does not record by
            itself, but you control your camera &mdash; that responsibility is yours.
          </Item>
          <Item>
            Use Flux in a way that violates Dutch or EU law, including the GDPR/AVG and the
            Computer Crime Act (Wet computercriminaliteit).
          </Item>
          <Item>
            Reverse-engineer, attack, or interfere with the hosting infrastructure.
          </Item>
        </ul>
      </Sec>

      <Sec n="04" title="Camera responsibility">
        <p>
          You are responsible for any footage your webcam captures while running Flux. Even
          though the footage stays on your device, recording or projecting other people&apos;s
          likeness in public or in a workplace may itself trigger GDPR obligations on{' '}
          <em>your</em> side.
        </p>
      </Sec>

      <Sec n="05" title="No warranty / limitation of liability">
        <p>
          Flux is provided &quot;as is&quot;. To the fullest extent permitted by Dutch law,
          Arcnode excludes all warranties, express or implied, including merchantability and
          fitness for a particular purpose. Arcnode is not liable for direct, indirect,
          incidental or consequential damages arising from your use of Flux. Nothing in these
          terms limits liability that cannot be limited under Dutch law (e.g. intent or gross
          negligence).
        </p>
      </Sec>

      <Sec n="06" title="Third-party libraries">
        <p>
          Flux depends on open-source libraries (OpenCV.js, Matter.js, React, Next.js, Tailwind
          CSS, Lucide Icons, Zustand). Each is governed by its own license; using Flux does not
          grant you any rights in those libraries beyond what their licenses provide.
        </p>
      </Sec>

      <Sec n="07" title="Changes">
        <p>
          We may update these terms when the project changes. Continued use after a change
          constitutes acceptance. Significant changes will be reflected in the date above.
        </p>
      </Sec>

      <Sec n="08" title="Governing law and jurisdiction">
        <p>
          These terms are governed by the laws of the Netherlands. Disputes that cannot be
          resolved amicably will be submitted exclusively to the competent court in the
          district where Arcnode is established, unless mandatory consumer protection law
          allocates jurisdiction elsewhere.
        </p>
      </Sec>

      <Sec n="09" title="Contact">
        <p>
          Questions or notices:{' '}
          <a href="mailto:hello@arcnode.dev" className="text-signal hover:underline">hello@arcnode.dev</a>.
        </p>
      </Sec>
    </article>
  )
}

/* ===========================================================
   Document primitives
   =========================================================== */

function DocHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h2 className="display-serif text-[34px] leading-[1] text-[var(--text)]">
        <span className="italic text-signal glow-signal">/</span> {title}
      </h2>
      <p className="text-[10px] tracking-[0.22em] uppercase text-[var(--text-faint)] mt-2">
        {subtitle}
      </p>
    </header>
  )
}

function Sec({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-[60px,1fr]">
      <div>
        <div className="tnum text-[10px] tracking-[0.22em] uppercase text-signal pt-1">{n}</div>
      </div>
      <div className="space-y-2.5">
        <h3 className="display-serif text-[18px] leading-none text-[var(--text)] italic">{title}</h3>
        <div className="space-y-2.5 text-[12.5px] leading-[1.7] text-[var(--text-dim)]">
          {children}
        </div>
      </div>
    </section>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[12.5px] leading-[1.65]">
      <span className="text-signal mt-[2px] shrink-0">·</span>
      <span>{children}</span>
    </li>
  )
}

function Pull({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-5 pr-4 py-3.5 border-l-2 border-signal bg-[var(--signal-soft)] text-[13px] leading-[1.7] text-[var(--text-dim)]">
      {children}
    </div>
  )
}
