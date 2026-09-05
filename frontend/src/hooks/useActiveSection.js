import { useEffect, useState } from 'react'

/**
 * Tracks which section id is currently dominant in the viewport, so the navbar
 * can show the reader's location (nav-state-active).
 *
 * Uses a single IntersectionObserver with a band across the middle of the
 * viewport — no scroll listener, no per-frame measurement.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }
        if (!visible.size) return
        // Whichever tracked section occupies the most of the band wins.
        const top = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0]
        setActive(top)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids])

  return active
}
