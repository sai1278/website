import { motion } from 'framer-motion'
import { fadeUp, drawLine } from '../../lib/motion'

/**
 * Section shell. Every section on the page opens the same way — a hairline
 * that draws itself, a numbered mono eyebrow, then the heading. That
 * repetition is what makes the page feel like one system.
 */
export function Section({ id, label, index, className = '', children, bare = false }) {
  return (
    <section
      id={id}
      aria-labelledby={label ? `${id}-heading` : undefined}
      className={`relative py-12 md:py-section ${className}`}
    >
      {!bare && (
        <div className="shell">
          <motion.hr {...drawLine()} className="rule" />
          {(label || index) && (
            <div className="flex items-baseline gap-4 pt-6">
              {index && <span className="eyebrow tnum text-fg-2/70">{index}</span>}
              {label && <span className="eyebrow">{label}</span>}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Section heading + optional lede, sharing one entrance so the two arrive
 * as a single unit rather than two separate animations.
 */
export function SectionHeading({ id, children, lede, className = '' }) {
  return (
    <motion.div {...fadeUp(0, 24)} className={`max-w-3xl ${className}`}>
      <h2 id={id ? `${id}-heading` : undefined} className="text-display-md">
        {children}
      </h2>
      {lede && <p className="mt-5 max-w-measure text-lead text-fg-1">{lede}</p>}
    </motion.div>
  )
}
