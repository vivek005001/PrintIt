// PrintIt — Brand logo mark (SVG, no emoji)
// A minimal layered-cube / 3D-print-bed mark that feels premium and abstract.

export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PrintIt logo"
    >
      {/* Bottom layer — base plate */}
      <rect x="4" y="28" width="32" height="5" rx="2.5"
        fill="url(#logoGradA)" opacity="0.9" />

      {/* Middle layer — slightly narrower */}
      <rect x="9" y="20" width="22" height="5" rx="2.5"
        fill="url(#logoGradA)" opacity="0.75" />

      {/* Top layer — narrowest */}
      <rect x="14" y="12" width="12" height="5" rx="2.5"
        fill="url(#logoGradA)" opacity="0.6" />

      {/* Print head nozzle — vertical line + dot */}
      <rect x="19" y="5" width="2" height="5" rx="1"
        fill="url(#logoGradB)" />
      <circle cx="20" cy="4" r="2"
        fill="url(#logoGradB)" />

      <defs>
        <linearGradient id="logoGradA" x1="4" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c0562a" />
          <stop offset="1" stopColor="#4f46a0" />
        </linearGradient>
        <linearGradient id="logoGradB" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c0562a" />
          <stop offset="1" stopColor="#4f46a0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
