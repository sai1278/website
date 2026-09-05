import { motion } from 'framer-motion'
import { press, tapTransition } from '../../lib/motion'

/**
 * The site's only button. Two ranks, so every screen has exactly one
 * primary action and the secondary is visually subordinate.
 *
 * `primary`   white fill / near-black label — 19.9:1
 * `secondary` hairline outline on the canvas
 *
 * Renders as <a> when `href` is given so real links stay real links
 * (middle-click, keyboard, screen readers all behave).
 */
const RANKS = {
  primary:
    'bg-fg-0 text-ink-0 hover:bg-white border border-transparent',
  secondary:
    'bg-transparent text-fg-0 border border-[var(--line-strong)] hover:border-fg-2 hover:bg-ink-2/60',
}

export default function Button({
  as,
  href,
  rank = 'primary',
  className = '',
  children,
  ...rest
}) {
  const Tag = motion[as ?? (href ? 'a' : 'button')]

  return (
    <Tag
      href={href}
      whileTap={press}
      transition={tapTransition}
      className={[
        // min-h-11 = 44px touch target
        'group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6',
        'font-sans text-[0.9375rem] font-medium leading-none',
        'transition-colors duration-fast ease-ui',
        RANKS[rank],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
