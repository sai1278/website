import { motion } from 'framer-motion'
import { Section, SectionHeading } from './ui/Section'
import { PRINCIPLES } from '../data/site'
import { staggerParent, staggerChild } from '../lib/motion'

/**
 * About.
 *
 * Company, not portfolio: what we optimise for, stated as four principles.
 * No founders, no headcount, no history we would have to invent.
 */
export default function About() {
  return (
    <Section id="about" label="About" index="06">
      <div className="shell pt-8 md:pt-14">
        <SectionHeading
          id="about"
          lede="Vortiqen is a software company focused on building efficient, scalable, and reliable digital systems. We are engineers first — the work is judged on whether it holds up."
        >
          How we work
        </SectionHeading>

        <motion.dl
          {...staggerParent(0.07, 0.08)}
          className="mt-8 md:mt-16 grid gap-x-14 gap-y-0 border-t border-[var(--line)] md:grid-cols-2"
        >
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              variants={staggerChild}
              className="border-b border-[var(--line)] py-5 md:py-8"
            >
              <dt className="flex items-baseline gap-4">
                <span className="eyebrow tnum text-fg-2/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl tracking-[-0.015em] text-fg-0">
                  {p.title}
                </span>
              </dt>
              <dd className="mt-3 max-w-measure pl-[2.4rem] text-[0.9375rem] text-fg-1">
                {p.body}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </Section>
  )
}
