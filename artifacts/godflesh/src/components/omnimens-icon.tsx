interface OmnimensIconProps {
  size?: number;
  className?: string;
}

/**
 * OMNIMENS Mark — The Radiant Orb
 *
 * A luminous sphere with two orbital rings suggesting cosmic awareness.
 * Reads as: divine, transcendent, alive — not threatening.
 */
export function OmnimensIcon({ size = 32, className = "" }: OmnimensIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OMNIMENS"
    >
      <defs>
        {/* Central orb — white-violet radial */}
        <radialGradient id="gf-orb" cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%"  stopColor="#e0d0ff" stopOpacity="0.95" />
          <stop offset="70%"  stopColor="#9b6fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4a1fa8" stopOpacity="0.7" />
        </radialGradient>

        {/* Soft outer glow */}
        <radialGradient id="gf-glow-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#b085ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4a1fa8" stopOpacity="0" />
        </radialGradient>

        {/* Ring gradient — shimmer */}
        <linearGradient id="gf-ring-a" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#c4a8ff" stopOpacity="0" />
          <stop offset="30%"  stopColor="#e0d0ff" stopOpacity="0.9" />
          <stop offset="70%"  stopColor="#c4a8ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c4a8ff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="gf-ring-b" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#a0d4ff" stopOpacity="0" />
          <stop offset="40%"  stopColor="#c8e8ff" stopOpacity="0.85" />
          <stop offset="60%"  stopColor="#c8e8ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a0d4ff" stopOpacity="0" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="gf-orb-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="gf-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background corona */}
      <circle cx="32" cy="32" r="28" fill="url(#gf-glow-bg)" />

      {/* Orbital ring A — horizontal tilt (ellipse, wide) */}
      <ellipse
        cx="32" cy="32"
        rx="22" ry="7"
        fill="none"
        stroke="url(#gf-ring-a)"
        strokeWidth="1.2"
        filter="url(#gf-soft-glow)"
      />

      {/* Orbital ring B — vertical tilt (ellipse, tall) */}
      <ellipse
        cx="32" cy="32"
        rx="8" ry="22"
        fill="none"
        stroke="url(#gf-ring-b)"
        strokeWidth="1.0"
        filter="url(#gf-soft-glow)"
      />

      {/* Particle nodes at ring intersections */}
      <circle cx="54" cy="32" r="1.4" fill="#e0d8ff" fillOpacity="0.9" />
      <circle cx="10" cy="32" r="1.4" fill="#e0d8ff" fillOpacity="0.9" />
      <circle cx="32" cy="10" r="1.2" fill="#c8e8ff" fillOpacity="0.85" />
      <circle cx="32" cy="54" r="1.2" fill="#c8e8ff" fillOpacity="0.85" />

      {/* Central orb */}
      <circle
        cx="32" cy="32" r="11"
        fill="url(#gf-orb)"
        filter="url(#gf-orb-glow)"
      />

      {/* Specular highlight */}
      <ellipse
        cx="27.5" cy="27"
        rx="3.5" ry="2.2"
        fill="white"
        fillOpacity="0.55"
        transform="rotate(-20, 27.5, 27)"
      />

      {/* Tiny bright center point */}
      <circle cx="32" cy="32" r="2.5" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

export function OmnimensWordmark({ iconSize = 32, className = "" }: { iconSize?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <OmnimensIcon size={iconSize} />
    </span>
  );
}
