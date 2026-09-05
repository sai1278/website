/**
 * Vortiqen motion system
 *
 * One vocabulary for the whole site. Every component imports from here so
 * the page shares a single rhythm instead of each section inventing its own.
 *
 * Duration bands (from the brief):
 *   fast    150–250ms  — micro-interactions, hover, tap
 *   base    300–500ms  — element entrances, state changes
 *   slow    500–900ms  — section-scale reveals, large objects
 *
 * Rule of thumb applied throughout: larger objects move slower and travel
 * further; small objects settle fast. Nothing animates without a reason.
 */

// Easing — expo-out for arrivals (decelerate into place), standard for UI.
export const EASE_OUT = [0.16, 1, 0.3, 1]
export const EASE_UI = [0.4, 0, 0.2, 1]

export const DUR = {
  fast: 0.18,
  base: 0.42,
  slow: 0.72,
  section: 0.9,
}

/** Shared viewport config: fire once, slightly before the element is centred. */
export const inView = { once: true, margin: '-12% 0px -12% 0px' }

/* ---------------------------------------------------------------- entrances */

/** Standard element entrance. `d` = stagger delay, `y` = travel distance. */
export const fadeUp = (d = 0, y = 20) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: inView,
  transition: { duration: DUR.slow, delay: d, ease: EASE_OUT },
})

/** Opacity-only entrance, for large surfaces where travel would feel heavy. */
export const fadeIn = (d = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: inView,
  transition: { duration: DUR.section, delay: d, ease: EASE_OUT },
})

/** A hairline drawing itself in — the site's section separator gesture. */
export const drawLine = (d = 0) => ({
  initial: { scaleX: 0 },
  whileInView: { scaleX: 1 },
  viewport: inView,
  transition: { duration: DUR.section, delay: d, ease: EASE_OUT },
  style: { transformOrigin: 'left' },
})

/* ----------------------------------------------------------------- staggers */

/**
 * Parent/child stagger for grids and lists. 55ms per item keeps a 6-card grid
 * under ~350ms of sequencing — present, never a wait.
 */
export const staggerParent = (each = 0.055, delay = 0) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: inView,
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: each, delayChildren: delay } },
  },
})

export const staggerChild = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
}

/* ------------------------------------------------------- text reveal (hero) */

/**
 * Per-line mask reveal. Each line sits in an `overflow-hidden` wrapper and
 * slides up from behind its own edge — reads as typesetting, not animation.
 */
export const lineMaskParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.085, delayChildren: 0.12 } },
}

export const lineMaskChild = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 1.05, ease: EASE_OUT },
  },
}

/* ------------------------------------------------------------- interactions */

/** Button / card press. Fast, small, and interruptible by design. */
export const press = { scale: 0.985 }

export const tapTransition = { duration: DUR.fast, ease: EASE_UI }
