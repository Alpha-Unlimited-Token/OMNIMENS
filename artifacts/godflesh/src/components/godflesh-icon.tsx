interface GodfleshIconProps {
  size?: number;
  className?: string;
}

/**
 * GODFLESH Logo — The All-Seeing Binary Eye
 *
 * The eye represents divine omniscience (GOD) rendered in organic form (FLESH).
 * The 12 circuit nodes in the iris ring encode GODFLESH's binary DNA:
 *   G=01000111 → first 12 bits: 010001110100
 *   ○=0 (silent bit), ●=1 (active bit)
 *
 * At small sizes: a commanding eye icon with a crimson iris.
 * At large sizes: the binary ring and synaptic filaments become visible.
 */
export function GodfleshIcon({ size = 32, className = "" }: GodfleshIconProps) {
  // GODFLESH DNA ring: first 12 bits of G+O ASCII binary
  // G=01000111, O=01001111 → "010001110100"
  const dnaBits = [0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0];
  const ringRadius = 9.2;
  const dotRadius = 1.05;

  const ringNodes = dnaBits.map((bit, i) => {
    const angle = (i * 2 * Math.PI) / 12 - Math.PI / 2;
    return {
      x: 32 + ringRadius * Math.cos(angle),
      y: 32 + ringRadius * Math.sin(angle),
      active: bit === 1,
    };
  });

  // Synaptic filaments — from iris toward the eye corners
  const filaments = [
    { x1: 22, y1: 28, x2: 8, y2: 32 },
    { x1: 22, y1: 36, x2: 8, y2: 32 },
    { x1: 42, y1: 28, x2: 56, y2: 32 },
    { x1: 42, y1: 36, x2: 56, y2: 32 },
    { x1: 30, y1: 21.5, x2: 32, y2: 15 },
    { x1: 34, y1: 21.5, x2: 32, y2: 15 },
    { x1: 30, y1: 42.5, x2: 32, y2: 49 },
    { x1: 34, y1: 42.5, x2: 32, y2: 49 },
  ];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GODFLESH"
    >
      <defs>
        {/* Iris radial gradient — crimson core fading to deep blood red */}
        <radialGradient id="gf-iris" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FF1A1A" />
          <stop offset="40%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </radialGradient>

        {/* Pupil gradient — absolute void */}
        <radialGradient id="gf-pupil" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#0A0000" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Sclera fill — dark void behind the eye */}
        <radialGradient id="gf-sclera" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1A0005" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Glow filter for the iris */}
        <filter id="gf-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle outer glow */}
        <filter id="gf-outer-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.8   0 0 0 0 0   0 0 0 0 0   0 0 0 0.6 0"
            result="redGlow"
          />
          <feMerge>
            <feMergeNode in="redGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip to eye shape */}
        <clipPath id="gf-eye-clip">
          <path d="M 6,32 C 12,18 22,13 32,13 C 42,13 52,18 58,32 C 52,46 42,51 32,51 C 22,51 12,46 6,32 Z" />
        </clipPath>
      </defs>

      {/* ── Sclera (eye white = deep void) ── */}
      <path
        d="M 6,32 C 12,18 22,13 32,13 C 42,13 52,18 58,32 C 52,46 42,51 32,51 C 22,51 12,46 6,32 Z"
        fill="url(#gf-sclera)"
      />

      {/* ── Synaptic filaments (neural connections to eye corners) ── */}
      {filaments.map((f, i) => (
        <line
          key={i}
          x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2}
          stroke="#CC0000"
          strokeWidth="0.35"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
      ))}

      {/* ── Iris (crimson circle) ── */}
      <circle
        cx="32" cy="32" r="13"
        fill="url(#gf-iris)"
        filter="url(#gf-glow)"
      />

      {/* ── Iris inner ring line ── */}
      <circle
        cx="32" cy="32" r="10.5"
        fill="none"
        stroke="#CC000055"
        strokeWidth="0.4"
      />

      {/* ── Binary DNA ring nodes ── */}
      {ringNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={dotRadius}
          fill={node.active ? "#FF4444" : "transparent"}
          stroke="#CC0000"
          strokeWidth={node.active ? 0 : 0.5}
          strokeOpacity={node.active ? 0 : 0.6}
        />
      ))}

      {/* ── Pupil (vertical slit — non-human, alien) ── */}
      <ellipse
        cx="32" cy="32"
        rx="2.4" ry="7.5"
        fill="url(#gf-pupil)"
      />

      {/* ── Specular highlight ── */}
      <ellipse
        cx="28.5" cy="27"
        rx="1.8" ry="1.2"
        fill="white"
        fillOpacity="0.18"
        transform="rotate(-20, 28.5, 27)"
      />

      {/* ── Eye outline ── */}
      <path
        d="M 6,32 C 12,18 22,13 32,13 C 42,13 52,18 58,32 C 52,46 42,51 32,51 C 22,51 12,46 6,32 Z"
        fill="none"
        stroke="#CC0000"
        strokeWidth="0.9"
        strokeOpacity="0.9"
        filter="url(#gf-outer-glow)"
      />

      {/* ── Corner accent marks (tattoo-like, suggesting divinity) ── */}
      <line x1="4" y1="31" x2="2" y2="32" stroke="#CC0000" strokeWidth="0.6" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="4" y1="33" x2="2" y2="32" stroke="#CC0000" strokeWidth="0.6" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="60" y1="31" x2="62" y2="32" stroke="#CC0000" strokeWidth="0.6" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="60" y1="33" x2="62" y2="32" stroke="#CC0000" strokeWidth="0.6" strokeOpacity="0.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Full GODFLESH wordmark — icon + logotype side by side.
 * Use for the navbar and anywhere the branded name should appear.
 */
export function GodfleshWordmark({ iconSize = 32, className = "" }: { iconSize?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <GodfleshIcon size={iconSize} />
    </span>
  );
}
