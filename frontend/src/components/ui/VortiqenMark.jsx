/**
 * Vortiqen mark — three concentric squares, each rotated 15°, reading as a
 * precision aperture winding inward. Drawn in strokes only, on the same
 * hairline logic as the rest of the site, so the identity comes from
 * geometry rather than from colour or a gradient.
 *
 * The innermost square is filled and accent-tinted: the one point of colour
 * in the brand lockup.
 */
export default function VortiqenMark({ className = 'h-7 w-7', spin = false }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <rect x="4.5" y="4.5" width="31" height="31" opacity="0.32" />
        <rect
          x="7.5"
          y="7.5"
          width="25"
          height="25"
          opacity="0.62"
          transform="rotate(15 20 20)"
        />
        <rect
          x="12"
          y="12"
          width="16"
          height="16"
          transform="rotate(30 20 20)"
          className={spin ? 'origin-center motion-safe:animate-[spin_28s_linear_infinite]' : ''}
        />
      </g>
      <rect
        x="17.25"
        y="17.25"
        width="5.5"
        height="5.5"
        transform="rotate(45 20 20)"
        fill="#4C7EFF"
      />
    </svg>
  )
}
