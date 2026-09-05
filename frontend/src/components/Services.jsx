import { motion } from 'framer-motion'
import {
  Boxes,
  Braces,
  Cloud,
  Workflow,
  Database,
  MonitorSmartphone,
} from 'lucide-react'
import { Section, SectionHeading } from './ui/Section'
import { SERVICES } from '../data/site'
import { staggerParent, staggerChild } from '../lib/motion'

// Explicit map rather than dynamic lookup, so the bundler can tree-shake.
const ICONS = { Boxes, Braces, Cloud, Workflow, Database, MonitorSmartphone }

/**
 * Asymmetric 12-column rhythm: 7+5 / 5+7 / 6+6. Three full rows, no orphan
 * cell, and no two consecutive rows split the same way — the grid reads as
 * composed rather than as a six-up tile loop.
 */
const SPANS = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-7',
  'lg:col-span-6',
  'lg:col-span-6',
]

/**
 * Service card. The two lead services carry a display-size heading so the
 * section has a clear reading order. Hover wipes in an accent hairline and
 * warms the tag row — colour and opacity only, never layout.
 */
function ServiceCard({ service, span }) {
  const Icon = ICONS[service.icon]
  const wide = service.span === 'wide'

  return (
    <motion.article
      variants={staggerChild}
      className={[
        'group relative flex flex-col justify-between overflow-hidden',
        'border-b border-r border-[var(--line)] p-6 md:p-8 lg:p-10',
        'transition-colors duration-base ease-ui hover:bg-ink-1',
        span,
      ].join(' ')}
    >
      {/* Accent hairline wipes in from the left on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-base ease-out group-hover:scale-x-100"
      />

      <div>
        <div className="flex items-center justify-between">
          <Icon
            className="h-5 w-5 text-fg-2 transition-colors duration-base ease-ui group-hover:text-accent-soft"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="eyebrow tnum text-fg-2/50">{service.index}</span>
        </div>

        <h3
          className={`mt-6 md:mt-8 text-fg-0 ${wide ? 'text-display-sm' : 'text-xl tracking-[-0.015em]'}`}
        >
          {service.title}
        </h3>
        <p className="mt-3 max-w-[34rem] text-[0.9375rem] text-fg-1">{service.body}</p>
      </div>

      <ul className="mt-6 md:mt-8 flex flex-wrap gap-x-2 gap-y-2">
        {service.meta.map((m) => (
          <li
            key={m}
            className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[0.6875rem] text-fg-2 transition-colors duration-base ease-ui group-hover:border-[var(--line-strong)] group-hover:text-fg-1"
          >
            {m}
          </li>
        ))}
      </ul>
    </motion.article>
  )
}

export default function Services() {
  return (
    <Section id="services" label="Services" index="02">
      <div className="shell pt-8 md:pt-14">
        <SectionHeading
          id="services"
          lede="Six practices, one team. Most engagements draw on more than one."
        >
          What we engineer
        </SectionHeading>
      </div>

      {/* Collapses to a single column below lg, where the wide/standard
          distinction is carried by heading size alone.

          The grid is nested inside .shell rather than being one: borders paint
          on the padding box, so a bordered .shell would draw its rules a full
          gutter outside the heading above it. */}
      <div className="shell mt-8 md:mt-16">
        <motion.div
          {...staggerParent(0.06, 0.05)}
          className="grid border-l border-t border-[var(--line)] lg:grid-cols-12"
        >
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} span={SPANS[i]} />
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
