import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Section } from './ui/Section'
import { PROCESS } from '../data/site'
import { fadeUp, DUR, EASE_OUT } from '../lib/motion'

/**
 * Delivery pipeline.
 *
 * Sticky heading on the left, stages on the right, and a rail between them
 * that fills as the reader descends. The rail is the reason the section is
 * sticky: it turns five paragraphs into one visible pipeline with a position.
 */
export default function Process() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.7', 'end 0.85'],
  })
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Section id="process" label="Solutions" index="03">
      <div ref={ref} className="shell pt-14">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ------------------------------------------------- sticky side */}
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+4rem)] lg:self-start">
            <motion.div {...fadeUp(0, 24)}>
              <h2 id="process-heading" className="text-display-md">
                From idea to production.
              </h2>
              <p className="mt-5 max-w-measure text-lead text-fg-1">
                A pipeline, not a proposal. Every stage has an output the next stage
                depends on, which is what keeps the work reviewable.
              </p>

              <p className="mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-fg-2/70">
                05 stages
              </p>
            </motion.div>
          </div>

          {/* ----------------------------------------------------- stages */}
          <ol className="relative">
            {/* Rail: a static hairline with a scroll-driven accent fill. */}
            <div
              aria-hidden="true"
              className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-[var(--line)] sm:block"
            >
              <motion.div
                style={reduced ? { scaleY: 1 } : { scaleY: railScale }}
                className="h-full w-full origin-top bg-accent/70"
              />
            </div>

            {PROCESS.map((stage, i) => (
              <motion.li
                key={stage.step}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-18% 0px -18% 0px' }}
                transition={{ duration: DUR.slow, ease: EASE_OUT }}
                className="relative pb-14 last:pb-0 sm:pl-10"
              >
                {/* Node on the rail */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 hidden h-2 w-2 -translate-x-[3.5px] rotate-45 bg-ink-0 ring-1 ring-fg-2 sm:block"
                />

                <div className="flex items-baseline gap-4">
                  <span className="eyebrow tnum text-accent-soft">{stage.step}</span>
                  <h3 className="text-display-sm text-fg-0">{stage.title}</h3>
                </div>

                <p className="mt-4 max-w-measure text-fg-1">{stage.body}</p>

                <p className="mt-5 flex flex-wrap items-center gap-x-2 font-mono text-[0.6875rem] text-fg-2">
                  <span className="text-fg-2/60">OUTPUT</span>
                  <span aria-hidden="true" className="text-fg-2/40">
                    →
                  </span>
                  <span className="text-fg-1">{stage.output}</span>
                </p>

                {i < PROCESS.length - 1 && (
                  <hr className="mt-14 border-[var(--line)] sm:hidden" />
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
