import { useEffect } from 'react'
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Normalised pointer position (-0.5 … 0.5) relative to `ref`, spring-smoothed.
 *
 * Used for the hero's cursor-responsive parallax. Returns motion values so the
 * movement never triggers a React render — Framer writes straight to the
 * compositor. Bails out entirely on touch devices and under reduced motion,
 * where it reports dead-centre so dependent transforms resolve to zero.
 */
export function usePointer(ref) {
  const reduced = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const config = { stiffness: 55, damping: 18, mass: 0.6 }
  const x = useSpring(rawX, config)
  const y = useSpring(rawY, config)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    // Pointer parallax is a fine-pointer affordance; skip it on touch.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      rawX.set((e.clientX - r.left) / r.width - 0.5)
      rawY.set((e.clientY - r.top) / r.height - 0.5)
    }

    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, reduced, rawX, rawY])

  return { x, y }
}
