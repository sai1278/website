import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Section, SectionHeading } from './ui/Section'
import { WORK } from '../data/site'
import { fadeUp, staggerParent, staggerChild } from '../lib/motion'

/**
 * Per-card geometric motif. Five hairline constructions, chosen by index, so
 * each card is visually distinct without a single raster asset. Strokes only,
 * `currentColor`, so they inherit the card's hover state.
 */
function Motif({ variant }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1 }
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true" focusable="false">
      {variant === 0 && (
        // Retrieval: concentric arcs converging on a point
        <g {...common}>
          {[18, 34, 50, 66, 82].map((r, i) => (
            <circle key={r} cx="100" cy="60" r={r} opacity={0.5 - i * 0.07} />
          ))}
          <rect x="96" y="56" width="8" height="8" fill="currentColor" stroke="none" />
        </g>
      )}

      {variant === 1 && (
        // Automation: an event queue stepping across lanes
        <g {...common}>
          {[30, 60, 90].map((y) => (
            <line key={y} x1="14" y1={y} x2="186" y2={y} opacity="0.28" />
          ))}
          {[
            [40, 30],
            [78, 60],
            [116, 60],
            [154, 90],
          ].map(([x, y], i) => (
            <rect key={i} x={x - 5} y={y - 5} width="10" height="10" fill="currentColor" stroke="none" opacity={0.35 + i * 0.16} />
          ))}
          <path d="M45 30 L73 60 M83 60 L111 60 M121 60 L149 90" opacity="0.5" />
        </g>
      )}

      {variant === 2 && (
        // Platform: stacked infrastructure planes in isometric offset
        <g {...common}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={54 + i * 12}
              y={22 + i * 18}
              width="92"
              height="26"
              opacity={0.6 - i * 0.12}
            />
          ))}
        </g>
      )}

      {variant === 3 && (
        // Multi-tenant: a partitioned field, one cell highlighted
        <g {...common}>
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={20 + c * 23}
                y={18 + r * 23}
                width="23"
                height="23"
                opacity="0.22"
              />
            ))
          )}
          <rect x="66" y="41" width="23" height="23" fill="currentColor" stroke="none" opacity="0.55" />
          <rect x="112" y="64" width="23" height="23" fill="currentColor" stroke="none" opacity="0.3" />
        </g>
      )}

      {variant === 4 && (
        // Developer platform: a branching golden path
        <g {...common}>
          <path d="M16 60 H70" opacity="0.55" />
          <path d="M70 60 C92 60 92 26 114 26 H184" opacity="0.4" />
          <path d="M70 60 C92 60 92 60 114 60 H184" opacity="0.55" />
          <path d="M70 60 C92 60 92 94 114 94 H184" opacity="0.4" />
          {[
            [70, 60],
            [184, 26],
            [184, 60],
            [184, 94],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="currentColor" stroke="none" opacity={i === 0 ? 0.7 : 0.4} />
          ))}
        </g>
      )}
    </svg>
  )
}

function WorkCard({ item, index }) {
  return (
    <motion.article
      /* Reveal is driven by the rail's own inView state, not each card's:
         cards parked outside the horizontal overflow are not intersecting the
         viewport, so a per-card whileInView would leave them blank. */
      variants={staggerChild}
      className="group flex w-[85vw] shrink-0 snap-start flex-col justify-between border border-[var(--line)] bg-ink-1/40 p-7 transition-colors duration-base ease-ui hover:border-[var(--line-strong)] hover:bg-ink-2/60 sm:w-[26rem] lg:p-8"
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow text-fg-2">{item.category}</span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-fg-2/50">
            {item.kind}
          </span>
        </div>

        {/* Motif sits in a reserved aspect box, so no layout shift on load. */}
        <div
          className={`mt-7 aspect-[200/120] w-full transition-colors duration-slow ease-ui ${
            item.accent ? 'text-accent/70 group-hover:text-accent' : 'text-fg-2/60 group-hover:text-fg-1'
          }`}
        >
          <Motif variant={index % 5} />
        </div>

        <h3 className="mt-7 text-display-sm text-fg-0">{item.name}</h3>
        <p className="mt-3 text-[0.9375rem] text-fg-1">{item.body}</p>
      </div>

      <ul className="mt-7 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
        {item.stack.map((t) => (
          <li key={t} className="font-mono text-[0.6875rem] text-fg-2">
            {t}
          </li>
        ))}
      </ul>
    </motion.article>
  )
}

/**
 * Selected work.
 *
 * A native horizontally-scrolling rail: real overflow with scroll-snap, so
 * trackpad, touch, and keyboard all work and nothing is scroll-jacked. The
 * arrow buttons are the pointer alternative to dragging.
 */
export default function Work() {
  const railRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const onScroll = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }, [])

  const nudge = (dir) => {
    const el = railRef.current
    if (!el) return
    // Page by one card width so a nudge always lands on a snap point.
    const card = el.querySelector('article')
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <Section id="work" label="Selected Work" index="04">
      <div className="shell pt-8 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            id="work"
            lede="The kinds of systems we build. These describe capability areas and internal builds — not client case studies."
          >
            Selected work
          </SectionHeading>

          {/* Rail controls — desktop only; touch users swipe. */}
          <motion.div {...fadeUp(0.1)} className="hidden shrink-0 gap-2 lg:flex">
            {[
              { dir: -1, Icon: ArrowLeft, label: 'Previous', disabled: atStart },
              { dir: 1, Icon: ArrowRight, label: 'Next', disabled: atEnd },
            ].map(({ dir, Icon, label, disabled }) => (
              <button
                key={label}
                type="button"
                onClick={() => nudge(dir)}
                disabled={disabled}
                aria-label={`${label} project`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-fg-1 transition-colors duration-fast ease-ui hover:border-fg-2 hover:text-fg-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--line-strong)]"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Full-bleed rail. Left inset resolves to the shell's inner edge so the
          first card lines up with the heading above it, while the rail itself
          still bleeds off the right of the viewport. Scroll padding matches,
          so snap points land on that same edge. */}
      <motion.div
        ref={railRef}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label="Selected work — horizontally scrollable"
        {...staggerParent(0.07, 0.05)}
        className="mt-8 md:mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-[var(--shell-inset)] pr-gutter scroll-pl-[var(--shell-inset)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {WORK.map((item, i) => (
          <WorkCard key={item.id} item={item} index={i} />
        ))}
        {/* Trailing spacer so the last card can snap clear of the edge. */}
        <div aria-hidden="true" className="w-px shrink-0" />
      </motion.div>
    </Section>
  )
}
