import { useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from './ui/Section'
import { TECH_LAYERS } from '../data/site'
import { fadeUp, DUR, EASE_UI } from '../lib/motion'

/**
 * Engineering / technology.
 *
 * Not a logo wall. The system is drawn as nested diamonds — interface on the
 * outside, signals at the core — echoing the rotated squares of the Vortiqen
 * mark. Selecting a layer lights its ring and moves the ring label onto it, so
 * the diagram is the navigation rather than decoration beside it.
 *
 * Selection responds to hover, focus, and click on real buttons, so it is
 * fully keyboard operable and never hover-only.
 */

const CENTRE = 160

/**
 * Ring geometry. A square rotated 45° occupies size × √2, so the outermost is
 * capped at 212 to stay inside the 320 viewBox with margin.
 */
const RINGS = TECH_LAYERS.map((_, i) => {
  const size = 212 - i * 40
  return {
    size,
    // Top vertex of the diamond — where the active label is parked.
    labelY: CENTRE - (size * Math.SQRT2) / 2 - 9,
  }
})

export default function Technology() {
  const [active, setActive] = useState(0)

  return (
    <Section id="technology" label="Engineering" index="05">
      <div className="shell pt-8 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          {/* ------------------------------------------------------- copy */}
          <div>
            <motion.div {...fadeUp(0, 24)}>
              <h2 id="technology-heading" className="text-display-md">
                Built for reliability.
                <br />
                Designed for scale.
              </h2>
              <p className="mt-5 max-w-measure text-lead text-fg-1">
                We think in layers. Each one has its own failure modes, its own tests, and
                its own budget — which is what makes the whole system predictable.
              </p>
            </motion.div>

            {/* Layer selector. Every row always shows its contents; the active
                row simply brightens. Revealing items only on selection left
                four empty rows and read as unfinished. */}
            <motion.ul {...fadeUp(0.1)} className="mt-8 md:mt-12 border-t border-[var(--line)]">
              {TECH_LAYERS.map((layer, i) => {
                const isActive = active === i
                return (
                  <li key={layer.label} className="border-b border-[var(--line)]">
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className="group flex w-full flex-wrap items-baseline gap-x-5 gap-y-1 py-4 text-left"
                    >
                      <span
                        className={`eyebrow tnum shrink-0 transition-colors duration-fast ease-ui ${
                          isActive ? 'text-accent-soft' : 'text-fg-2/50'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span
                        className={`shrink-0 text-[0.9375rem] transition-colors duration-fast ease-ui ${
                          isActive ? 'text-fg-0' : 'text-fg-1 group-hover:text-fg-0'
                        }`}
                      >
                        {layer.label}
                      </span>

                      <span
                        className={`ml-auto font-mono text-[0.6875rem] transition-colors duration-fast ease-ui ${
                          isActive ? 'text-fg-1' : 'text-fg-2/45'
                        }`}
                      >
                        {layer.items.join('  ·  ')}
                      </span>
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          </div>

          {/* ----------------------------------------------------- diagram */}
          <motion.div
            {...fadeUp(0.05, 28)}
            className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[20rem] lg:max-w-[25rem]"
          >
            <div
              aria-hidden="true"
              className="grid-field mask-radial absolute inset-0 opacity-30"
            />

            <svg
              viewBox="0 0 320 320"
              className="relative h-full w-full overflow-visible"
              role="img"
              aria-label={`System layers, ${TECH_LAYERS[active].label} highlighted`}
            >
              {/* Axis connectors run through every diamond vertex. */}
              <g stroke="currentColor" className="text-fg-0" strokeWidth="1" opacity="0.1">
                <line x1={CENTRE} y1="12" x2={CENTRE} y2="308" />
                <line x1="12" y1={CENTRE} x2="308" y2={CENTRE} />
              </g>

              {RINGS.map((ring, i) => {
                const isActive = active === i
                return (
                  <motion.rect
                    key={i}
                    x={CENTRE - ring.size / 2}
                    y={CENTRE - ring.size / 2}
                    width={ring.size}
                    height={ring.size}
                    transform={`rotate(45 ${CENTRE} ${CENTRE})`}
                    fill="none"
                    stroke={isActive ? '#4C7EFF' : 'currentColor'}
                    className="text-fg-0"
                    animate={{
                      opacity: isActive ? 1 : 0.16,
                      strokeWidth: isActive ? 1.6 : 1,
                    }}
                    transition={{ duration: DUR.base, ease: EASE_UI }}
                  />
                )
              })}

              {/* Core */}
              <rect
                x={CENTRE - 7}
                y={CENTRE - 7}
                width="14"
                height="14"
                transform={`rotate(45 ${CENTRE} ${CENTRE})`}
                fill="#4C7EFF"
              />
              <circle
                cx={CENTRE}
                cy={CENTRE}
                r="17"
                fill="none"
                stroke="#4C7EFF"
                strokeWidth="1"
                opacity="0.35"
              />

              {/* Label rides the active ring's top vertex. */}
              <motion.text
                x={CENTRE}
                y={RINGS[active].labelY}
                textAnchor="middle"
                animate={{ y: RINGS[active].labelY }}
                transition={{ duration: DUR.base, ease: EASE_UI }}
                className="fill-fg-1 font-mono text-[9px] uppercase tracking-[0.16em]"
              >
                {TECH_LAYERS[active].label}
              </motion.text>
            </svg>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
