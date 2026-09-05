import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Section } from './ui/Section'
import { DISCIPLINES } from '../data/site'
import { staggerParent, staggerChild, fadeUp } from '../lib/motion'

const STATEMENT =
  'Software engineered for what comes next. We work across the whole system — interface, service, data, and platform — so the parts fit and keep fitting.'

/**
 * One word of the statement. Its opacity is driven by scroll position, so the
 * sentence resolves as the reader moves through it. Each word is its own
 * component because each needs its own useTransform.
 */
function Word({ progress, from, to, children }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  )
}

export default function Intro() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  })

  const words = STATEMENT.split(' ')

  return (
    <Section id="intro" label="Introduction" index="01">
      <div ref={ref} className="shell pt-8 md:pt-14">
        {/* Progressive statement reveal. Under reduced motion the whole
            sentence is simply rendered at full opacity. */}
        <h2 id="intro-heading" className="max-w-5xl text-display-md text-fg-0">
          {reduced
            ? STATEMENT
            : words.map((w, i) => (
                <Word
                  key={`${w}-${i}`}
                  progress={scrollYProgress}
                  from={i / words.length}
                  to={Math.min(1, (i + 4) / words.length)}
                >
                  {w}
                </Word>
              ))}
        </h2>

        {/* Disciplines — a plain, dense index. No cards, no icons: this
            section is about breadth, and a list says it fastest. */}
        <motion.ul
          {...staggerParent(0.05, 0.1)}
          className="mt-8 md:mt-16 grid gap-x-10 border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {DISCIPLINES.map((d, i) => (
            <motion.li
              key={d}
              variants={staggerChild}
              className="flex items-baseline gap-4 border-b border-[var(--line)] py-4"
            >
              <span className="eyebrow tnum shrink-0 text-fg-2/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[0.9375rem] text-fg-0">{d}</span>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p {...fadeUp(0.1)} className="mt-8 md:mt-12 max-w-measure text-fg-1">
          Most problems we are handed are not a missing feature. They are a system that
          became difficult to change. We work on both.
        </motion.p>
      </div>
    </Section>
  )
}
