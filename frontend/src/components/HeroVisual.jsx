import { motion, useReducedMotion } from 'framer-motion'
import { DUR, EASE_OUT } from '../lib/motion'

/*
 * Abstract technical visual for the hero.
 *
 * Not an illustration of anything literal — it is an aperture (the Vortiqen
 * mark, opened up) with a service graph resolving inside it: nodes, edges, and
 * a data spine. It stands for connected systems and engineered structure.
 *
 * Everything is stroked SVG on the same hairline vocabulary as the page. The
 * only continuous motion is CSS rotation on two ring groups — a compositor
 * transform, no JavaScript per frame — plus opacity pulses on three nodes.
 */

// Service graph. Hand-placed so the arrangement reads as deliberate structure.
const NODES = [
  { id: 'n1', x: 150, y: 96, r: 3.5, accent: true },
  { id: 'n2', x: 236, y: 148, r: 3 },
  { id: 'n3', x: 150, y: 200, r: 5, core: true },
  { id: 'n4', x: 64, y: 148, r: 3 },
  { id: 'n5', x: 96, y: 268, r: 3.5, accent: true },
  { id: 'n6', x: 204, y: 268, r: 3 },
  { id: 'n7', x: 150, y: 322, r: 3.5, accent: true },
]

const EDGES = [
  ['n1', 'n2'],
  ['n2', 'n3'],
  ['n3', 'n4'],
  ['n4', 'n1'],
  ['n3', 'n5'],
  ['n3', 'n6'],
  ['n5', 'n7'],
  ['n6', 'n7'],
  ['n1', 'n3'],
]

const at = (id) => NODES.find((n) => n.id === id)

export default function HeroVisual() {
  const reduced = useReducedMotion()

  return (
    <svg
      viewBox="0 0 300 420"
      className="h-full w-full overflow-visible"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* ---- aperture rings ---------------------------------------------- */}
      <g stroke="currentColor" className="text-fg-0">
        {/* Outer ring pair, counter-rotating very slowly. */}
        <g
          className={
            reduced ? '' : 'origin-center motion-safe:animate-[spin_90s_linear_infinite]'
          }
          style={{ transformOrigin: '150px 200px' }}
        >
          <rect
            x="34"
            y="84"
            width="232"
            height="232"
            strokeWidth="1"
            opacity="0.09"
            transform="rotate(12 150 200)"
          />
          <circle cx="150" cy="200" r="128" strokeWidth="1" opacity="0.07" />
        </g>

        <g
          className={
            reduced
              ? ''
              : 'origin-center motion-safe:animate-[spin_60s_linear_infinite_reverse]'
          }
          style={{ transformOrigin: '150px 200px' }}
        >
          <rect
            x="66"
            y="116"
            width="168"
            height="168"
            strokeWidth="1"
            opacity="0.13"
            transform="rotate(-8 150 200)"
          />
          {/* Broken arc — an aperture blade, not a closed circle. */}
          <circle
            cx="150"
            cy="200"
            r="96"
            strokeWidth="1"
            opacity="0.16"
            strokeDasharray="120 42"
          />
        </g>

        {/* Static measurement ticks: 24 marks around the aperture. */}
        <g opacity="0.18">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2
            const r1 = 148
            const r2 = i % 6 === 0 ? 138 : 143
            return (
              <line
                key={i}
                x1={150 + Math.cos(a) * r1}
                y1={200 + Math.sin(a) * r1}
                x2={150 + Math.cos(a) * r2}
                y2={200 + Math.sin(a) * r2}
                strokeWidth="1"
              />
            )
          })}
        </g>
      </g>

      {/* ---- edges: drawn in, once ---------------------------------------- */}
      <g stroke="currentColor" className="text-fg-0" strokeWidth="1" opacity="0.34">
        {EDGES.map(([a, b], i) => {
          const p = at(a)
          const q = at(b)
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: 0.55 + i * 0.07,
                ease: EASE_OUT,
              }}
            />
          )
        })}
      </g>

      {/* ---- vertical data spine ----------------------------------------- */}
      <motion.line
        x1="150"
        y1="34"
        x2="150"
        y2="386"
        stroke="currentColor"
        className="text-fg-0"
        strokeWidth="1"
        strokeDasharray="2 7"
        opacity="0.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay: 0.3, ease: EASE_OUT }}
      />

      {/* ---- nodes -------------------------------------------------------- */}
      <g>
        {NODES.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: DUR.slow,
              delay: 0.8 + i * 0.06,
              ease: EASE_OUT,
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            {/* Accent nodes breathe on opacity only — no layout, no reflow. */}
            {n.accent && !reduced && (
              <circle cx={n.x} cy={n.y} r={n.r + 6} fill="#4C7EFF" opacity="0.1">
                <animate
                  attributeName="opacity"
                  values="0.04;0.16;0.04"
                  dur="4.5s"
                  begin={`${i * 0.7}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {n.core ? (
              <>
                <circle cx={n.x} cy={n.y} r={n.r + 8} stroke="#4C7EFF" strokeWidth="1" opacity="0.4" />
                <rect
                  x={n.x - 4}
                  y={n.y - 4}
                  width="8"
                  height="8"
                  fill="#4C7EFF"
                  transform={`rotate(45 ${n.x} ${n.y})`}
                />
              </>
            ) : (
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.accent ? '#4C7EFF' : '#08090B'}
                stroke={n.accent ? 'none' : 'currentColor'}
                strokeWidth="1"
                className="text-fg-2"
              />
            )}
          </motion.g>
        ))}
      </g>
    </svg>
  )
}
