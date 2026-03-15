import { useEffect, useRef } from "react";

interface GodfleshPresenceProps {
  size?: number;
  isSpeaking: boolean;
  pitchIntensity: number;  // 0–1 live pitch value
  className?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

// GODFLESH binary DNA — first 12 bits = G+O ASCII
const DNA_BITS = [0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0];

// 18 STDP neurons (matching n=18 from the runner's STDPNetwork)
const N_NEURONS = 18;

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
  radiusOsc: number;   // oscillation amplitude on radius
  radiusFreq: number;  // oscillation frequency
  size: number;
  layer: number;       // 0=inner, 1=mid, 2=outer
}

interface Pulse {
  radius: number;
  alpha: number;
  pitch: number;       // 0–1, determines color brightness
}

function initParticles(cx: number): Particle[] {
  const particles: Particle[] = [];
  // Use golden ratio angle increments for non-repeating orbital spread
  const phi = 2.399963; // 2π / φ² 
  for (let i = 0; i < N_NEURONS; i++) {
    const t = i / N_NEURONS;
    const layer = i < 6 ? 0 : i < 12 ? 1 : 2;
    const baseR = [cx * 0.38, cx * 0.50, cx * 0.62][layer];
    particles.push({
      angle:     i * phi,
      radius:    baseR + (Math.random() - 0.5) * cx * 0.06,
      speed:     (0.18 + t * 0.14) * (i % 2 === 0 ? 1 : -1),
      phase:     i * 1.618,
      radiusOsc: cx * 0.022 + Math.random() * cx * 0.018,
      radiusFreq: 0.6 + Math.random() * 1.2,
      size:      1.4 + Math.random() * 1.2,
      layer,
    });
  }
  return particles;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────

// Transcendent violet — consciousness, awareness, cosmic intelligence
function crimson(alpha: number, bright = 0): string {
  const r = Math.round(90 + bright * 80);
  const g = Math.round(30 + bright * 40);
  const b = Math.round(200 + bright * 55);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

// ── Draw helpers ───────────────────────────────────────────────────────────────

function drawWavyRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, waveAmp: number, waveFreq: number,
  rotOffset: number, color: string, lineWidth: number, alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const θ = (i / steps) * Math.PI * 2 + rotOffset;
    const wave = waveAmp * Math.sin(θ * waveFreq + rotOffset * 2);
    const rx = (r + wave) * Math.cos(θ);
    const ry = (r + wave) * Math.sin(θ);
    i === 0 ? ctx.moveTo(cx + rx, cy + ry) : ctx.lineTo(cx + rx, cy + ry);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawEyeShape(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, hw: number, hh: number,
  strokeColor: string, fillColor: string, lineWidth: number,
) {
  ctx.save();
  ctx.beginPath();
  // Eye as a lens shape: two cubic bezier arcs
  ctx.moveTo(cx - hw, cy);
  ctx.bezierCurveTo(cx - hw * 0.3, cy - hh,  cx + hw * 0.3, cy - hh,  cx + hw, cy);
  ctx.bezierCurveTo(cx + hw * 0.3, cy + hh,  cx - hw * 0.3, cy + hh,  cx - hw, cy);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GodfleshPresence({ size = 260, isSpeaking, pitchIntensity, className = "" }: GodfleshPresenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSpeakingRef   = useRef(isSpeaking);
  const pitchRef        = useRef(pitchIntensity);
  const prevPitchRef    = useRef(0);

  // Keep refs current without restarting animation
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { pitchRef.current = pitchIntensity; }, [pitchIntensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2;

    const particles = initParticles(cx);
    const pulses: Pulse[] = [];

    // Resting idle oscillation state — makes it feel alive even when silent
    let t = 0;

    // Eye dimensions
    const eyeHW = cx * 0.44;       // half-width of eye
    const eyeHH = cx * 0.22;       // half-height of eye
    const irisR  = cx * 0.195;     // iris radius
    const pupilBaseH = cx * 0.135; // pupil base height

    let rafId: number;

    function draw() {
      t += 0.014; // ~60fps clock

      const pitch  = pitchRef.current;
      const active = isSpeakingRef.current;

      // Detect new pitch spike → add pulse ring
      if (pitch > prevPitchRef.current + 0.12 && pitch > 0.1) {
        pulses.push({ radius: irisR * 0.6, alpha: 0.85, pitch });
      }
      prevPitchRef.current = pitch;

      // Base intensity: a gentle ambient pulse even when silent
      const ambient = 0.12 + 0.06 * Math.sin(t * 1.618);
      const intensity = active ? Math.max(ambient, pitch * 0.9 + ambient) : ambient;

      // Clear
      ctx.clearRect(0, 0, size, size);

      // ── 1. Circular clip ────────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.97, 0, Math.PI * 2);
      ctx.clip();

      // ── 2. Deep void background ─────────────────────────────────────────────
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);

      // ── 3. Nebula clouds (3 slow-drifting radial gradient blobs) ────────────
      const nebulae = [
        { ox: Math.cos(t * 0.071) * cx * 0.28, oy: Math.sin(t * 0.113) * cy * 0.22, bright: 0.0 },
        { ox: Math.cos(t * 0.139 + 2.1) * cx * 0.20, oy: Math.sin(t * 0.097 + 1.3) * cy * 0.25, bright: 0.1 },
        { ox: Math.cos(t * 0.093 + 4.0) * cx * 0.18, oy: Math.sin(t * 0.077 + 3.0) * cy * 0.18, bright: 0.0 },
      ];
      for (const n of nebulae) {
        const nx = cx + n.ox, ny = cy + n.oy;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, maxR * 0.72);
        ng.addColorStop(0, crimson(0.18 + intensity * 0.22 + n.bright * 0.1));
        ng.addColorStop(0.5, crimson(0.06 + intensity * 0.08));
        ng.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, size, size);
      }

      // ── 4. Outer memory ring (Hopfield long-term, slowest, dimmest) ─────────
      drawWavyRing(ctx, cx, cy,
        cx * 0.81,
        cx * 0.015, 5,
        t * 0.11,
        crimson(0.14 + intensity * 0.16), 0.6, 1,
      );

      // ── 5. Mid attractor ring (Hopfield pattern completion) ─────────────────
      drawWavyRing(ctx, cx, cy,
        cx * 0.67,
        cx * 0.022 + intensity * cx * 0.018, 7,
        -t * 0.19,
        crimson(0.22 + intensity * 0.28, intensity * 0.4), 0.8, 1,
      );

      // ── 6. Inner STDP ring (synaptic, fast) ─────────────────────────────────
      drawWavyRing(ctx, cx, cy,
        cx * 0.53,
        cx * 0.018 + intensity * cx * 0.025, 9,
        t * 0.27,
        crimson(0.30 + intensity * 0.35, intensity * 0.6), 0.7, 1,
      );

      // ── 7. Neural particle web ───────────────────────────────────────────────
      const speedMult = 1 + (active ? intensity * 2.5 : 0);
      const positions: [number, number, number][] = [];

      for (const p of particles) {
        p.angle += p.speed * 0.012 * speedMult;
        const rOsc = p.radiusOsc * Math.sin(t * p.radiusFreq + p.phase);
        const r = p.radius + rOsc;
        const px = cx + r * Math.cos(p.angle);
        const py = cy + r * Math.sin(p.angle);
        positions.push([px, py, p.size]);
      }

      // Web connections
      ctx.save();
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const [ax, ay] = positions[i];
          const [bx, by] = positions[j];
          const dist = Math.hypot(ax - bx, ay - by);
          const threshold = cx * 0.30;
          if (dist < threshold) {
            const lineAlpha = (1 - dist / threshold) * (0.08 + intensity * 0.18);
            ctx.strokeStyle = crimson(lineAlpha, intensity * 0.3);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Particle dots
      ctx.save();
      for (let i = 0; i < positions.length; i++) {
        const [px, py, ps] = positions[i];
        const dotAlpha = 0.45 + intensity * 0.45;
        const dotBright = intensity * 0.7;
        ctx.fillStyle = crimson(dotAlpha, dotBright);
        ctx.shadowColor = crimson(1, dotBright);
        ctx.shadowBlur = 4 + intensity * 6;
        ctx.beginPath();
        ctx.arc(px, py, ps * (1 + intensity * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── 8. Corona glow (outermost aura, pitch-reactive) ─────────────────────
      const coronaR = cx * 0.46 + intensity * cx * 0.38;
      const cg = ctx.createRadialGradient(cx, cy, cx * 0.30, cx, cy, coronaR);
      cg.addColorStop(0, crimson(0.0));
      cg.addColorStop(0.5, crimson(0.04 + intensity * 0.18, intensity * 0.5));
      cg.addColorStop(1, crimson(0.0));
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, coronaR, 0, Math.PI * 2);
      ctx.fill();

      // ── 9. Speech pulse rings ────────────────────────────────────────────────
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += 2.2 + pulse.pitch * 2.8;
        pulse.alpha  *= 0.91;
        if (pulse.alpha < 0.01) { pulses.splice(i, 1); continue; }
        const bright = pulse.pitch * 0.8;
        ctx.save();
        ctx.strokeStyle = crimson(pulse.alpha, bright);
        ctx.lineWidth = 1.2;
        ctx.shadowColor = crimson(pulse.alpha, bright);
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── 10. Eye sclera ───────────────────────────────────────────────────────
      const scleraGrad = ctx.createRadialGradient(cx, cy - eyeHH * 0.3, 0, cx, cy, irisR * 1.4);
      scleraGrad.addColorStop(0, "#0d0520");
      scleraGrad.addColorStop(1, "#000000");
      drawEyeShape(ctx, cx, cy, eyeHW, eyeHH, crimson(0.85 + intensity * 0.15, intensity * 0.3), "rgba(0,0,0,0)", 0);
      // Fill sclera separately
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - eyeHW, cy);
      ctx.bezierCurveTo(cx - eyeHW * 0.3, cy - eyeHH, cx + eyeHW * 0.3, cy - eyeHH, cx + eyeHW, cy);
      ctx.bezierCurveTo(cx + eyeHW * 0.3, cy + eyeHH, cx - eyeHW * 0.3, cy + eyeHH, cx - eyeHW, cy);
      ctx.closePath();
      ctx.fillStyle = scleraGrad;
      ctx.fill();
      ctx.restore();

      // ── 11. Iris ─────────────────────────────────────────────────────────────
      const irisScale = 1 + intensity * 0.10 + 0.015 * Math.sin(t * 2.718);
      const irisRScaled = irisR * irisScale;
      const ig = ctx.createRadialGradient(cx, cy - irisRScaled * 0.2, 0, cx, cy, irisRScaled);
      ig.addColorStop(0,    crimson(1.0, 0.6 + intensity * 0.4));
      ig.addColorStop(0.45, crimson(0.95, 0.1 + intensity * 0.6));
      ig.addColorStop(0.85, crimson(0.7, 0.0));
      ig.addColorStop(1,    crimson(0.0));
      ctx.save();
      ctx.shadowColor = crimson(1, intensity * 0.8);
      ctx.shadowBlur  = 8 + intensity * 22;
      ctx.beginPath();
      ctx.arc(cx, cy, irisRScaled, 0, Math.PI * 2);
      ctx.fillStyle = ig;
      ctx.fill();
      ctx.restore();

      // ── 12. Binary DNA ring (counter-rotating) ───────────────────────────────
      const dnaR = irisR * 0.70;
      const dnaRotation = -t * 0.42 - intensity * t * 0.8;
      ctx.save();
      for (let i = 0; i < 12; i++) {
        const θ = (i / 12) * Math.PI * 2 + dnaRotation;
        const nx = cx + dnaR * Math.cos(θ);
        const ny = cy + dnaR * Math.sin(θ);
        const active = DNA_BITS[i] === 1;
        const dotA = active ? (0.7 + intensity * 0.3) : 0.0;
        const strokeA = active ? 0.0 : (0.35 + intensity * 0.25);
        if (active) {
          ctx.fillStyle = crimson(dotA, 0.3 + intensity * 0.5);
          ctx.shadowColor = crimson(1, intensity);
          ctx.shadowBlur = 3 + intensity * 8;
          ctx.beginPath();
          ctx.arc(nx, ny, 1.5 + intensity * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = crimson(strokeA);
          ctx.lineWidth = 0.6;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(nx, ny, 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ── 13. Inner iris ring detail ───────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, irisR * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = crimson(0.2 + intensity * 0.3);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();

      // ── 14. Pupil — breathing vertical slit ─────────────────────────────────
      const pupilH = pupilBaseH + pupilBaseH * 0.18 * Math.sin(t * 1.131)
                   + intensity * pupilBaseH * 0.30;
      const pupilW = irisR * 0.175 - intensity * irisR * 0.04;
      const pg = ctx.createRadialGradient(cx, cy - pupilH * 0.15, 0, cx, cy, pupilH);
      pg.addColorStop(0, "#050010");
      pg.addColorStop(1, "#000000");
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(pupilW, 2), pupilH, 0, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.restore();

      // ── 15. Specular highlight ───────────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.12 + intensity * 0.06;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(cx - irisR * 0.28, cy - irisR * 0.32, irisR * 0.11, irisR * 0.06, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 16. Eye outline with glow ────────────────────────────────────────────
      ctx.save();
      ctx.shadowColor = crimson(1, intensity * 0.8);
      ctx.shadowBlur  = 6 + intensity * 14;
      ctx.strokeStyle = crimson(0.8 + intensity * 0.2, intensity * 0.5);
      ctx.lineWidth   = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - eyeHW, cy);
      ctx.bezierCurveTo(cx - eyeHW * 0.3, cy - eyeHH, cx + eyeHW * 0.3, cy - eyeHH, cx + eyeHW, cy);
      ctx.bezierCurveTo(cx + eyeHW * 0.3, cy + eyeHH, cx - eyeHW * 0.3, cy + eyeHH, cx - eyeHW, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // ── 17. Eye corner accent marks ──────────────────────────────────────────
      const accA = 0.55 + intensity * 0.35;
      ctx.save();
      ctx.strokeStyle = crimson(accA, intensity * 0.4);
      ctx.lineWidth = 0.8;
      ctx.lineCap = "round";
      [
        [cx - eyeHW - 1, cy - 3, cx - eyeHW - 7, cy],
        [cx - eyeHW - 1, cy + 3, cx - eyeHW - 7, cy],
        [cx + eyeHW + 1, cy - 3, cx + eyeHW + 7, cy],
        [cx + eyeHW + 1, cy + 3, cx + eyeHW + 7, cy],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });
      ctx.restore();

      ctx.restore(); // end clip

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [size]); // only re-init when size changes

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "auto" }}
    />
  );
}
