import { useEffect, useRef } from "react";

interface GodfleshPresenceProps {
  size?: number;
  isSpeaking: boolean;
  pitchIntensity: number;
  className?: string;
}

// ── Particle system ────────────────────────────────────────────────────────────

interface OrbParticle {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
  tiltSin: number;
  tiltCos: number;
  size: number;
  layer: number;
  brightness: number;
}

function initParticles(cx: number): OrbParticle[] {
  const phi = 2.399963; // golden angle
  const particles: OrbParticle[] = [];
  const counts = [8, 10, 10]; // inner, mid, outer
  const radii  = [cx * 0.32, cx * 0.50, cx * 0.65];
  const tilts  = [Math.PI / 6, Math.PI / 3.5, Math.PI / 2.5];

  let idx = 0;
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < counts[layer]; i++) {
      const tilt = tilts[layer] + (Math.random() - 0.5) * 0.3;
      particles.push({
        angle:      idx * phi,
        radius:     radii[layer] + (Math.random() - 0.5) * cx * 0.06,
        speed:      (0.22 + Math.random() * 0.18) * (i % 2 === 0 ? 1 : -1),
        phase:      idx * 1.618,
        tiltSin:    Math.sin(tilt),
        tiltCos:    Math.cos(tilt),
        size:       1.2 + Math.random() * 1.4,
        layer,
        brightness: 0.55 + Math.random() * 0.45,
      });
      idx++;
    }
  }
  return particles;
}

interface PulseRing {
  radius: number;
  alpha: number;
  speed: number;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────

function pearl(alpha: number, violet = 0): string {
  const r = Math.round(220 + violet * (-60));
  const g = Math.round(205 + violet * (-80));
  const b = 255;
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function cyan(alpha: number): string {
  return `rgba(160,220,255,${alpha.toFixed(3)})`;
}

function gold(alpha: number): string {
  return `rgba(255,240,190,${alpha.toFixed(3)})`;
}

// ── Draw helpers ───────────────────────────────────────────────────────────────

function drawOrbitalRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  rotation: number,
  color: string,
  lineWidth: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSacredTriangle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number,
  rotation: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = rotation + (i * Math.PI * 2) / 3 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ── Main component ─────────────────────────────────────────────────────────────

export function GodfleshPresence({
  size = 260,
  isSpeaking,
  pitchIntensity,
  className = "",
}: GodfleshPresenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSpeakingRef    = useRef(isSpeaking);
  const pitchRef         = useRef(pitchIntensity);
  const prevPitchRef     = useRef(0);

  useEffect(() => { isSpeakingRef.current = isSpeaking; },    [isSpeaking]);
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

    const particles = initParticles(cx);
    const pulses: PulseRing[] = [];

    // Core orb radius
    const orbR = cx * 0.22;

    let t = 0;
    let rafId: number;

    function draw() {
      t += 0.012;

      const pitch  = pitchRef.current;
      const active = isSpeakingRef.current;

      // Pulse rings on pitch spike
      if (pitch > prevPitchRef.current + 0.10 && pitch > 0.08) {
        pulses.push({ radius: orbR * 1.1, alpha: 0.7, speed: 1.8 + pitch * 2.0 });
      }
      prevPitchRef.current = pitch;

      const ambient   = 0.10 + 0.05 * Math.sin(t * 1.4);
      const intensity = active ? Math.max(ambient, pitch * 0.85 + ambient) : ambient;
      // Breathing — gentle sine wave that makes the orb feel alive
      const breath    = 1 + 0.035 * Math.sin(t * 0.9) + intensity * 0.06;

      ctx.clearRect(0, 0, size, size);

      // ── 1. Clip to circle ─────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
      ctx.clip();

      // ── 2. Void background ────────────────────────────────────────────────
      ctx.fillStyle = "#05040f";
      ctx.fillRect(0, 0, size, size);

      // ── 3. Nebula clouds ──────────────────────────────────────────────────
      const nebulae = [
        { ox: Math.cos(t * 0.06) * cx * 0.30,  oy: Math.sin(t * 0.09) * cy * 0.25 },
        { ox: Math.cos(t * 0.11 + 2.0) * cx * 0.22, oy: Math.sin(t * 0.08 + 1.5) * cy * 0.28 },
        { ox: Math.cos(t * 0.07 + 4.0) * cx * 0.18, oy: Math.sin(t * 0.12 + 3.0) * cy * 0.20 },
      ];
      for (const n of nebulae) {
        const nx = cx + n.ox, ny = cy + n.oy;
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, cx * 0.78);
        ng.addColorStop(0,   pearl(0.12 + intensity * 0.10, 0.6));
        ng.addColorStop(0.5, pearl(0.04 + intensity * 0.05, 0.8));
        ng.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, size, size);
      }

      // ── 4. Outer corona aura ──────────────────────────────────────────────
      const coronaR = cx * 0.55 + intensity * cx * 0.20;
      const cg = ctx.createRadialGradient(cx, cy, orbR * 0.8, cx, cy, coronaR);
      cg.addColorStop(0,   pearl(0.0));
      cg.addColorStop(0.4, pearl(0.06 + intensity * 0.12, 0.5));
      cg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, size, size);

      // ── 5. Sacred geometry — two counter-rotating triangles (Merkaba) ─────
      const geoR    = cx * 0.56;
      const geoAlpha = 0.06 + intensity * 0.08;
      drawSacredTriangle(ctx, cx, cy, geoR,  t * 0.08,  gold(1), geoAlpha);
      drawSacredTriangle(ctx, cx, cy, geoR, -t * 0.08 + Math.PI, gold(1), geoAlpha);

      // ── 6. Three orbital rings at different 3D tilts ──────────────────────
      // Ring A — nearly horizontal (equatorial)
      drawOrbitalRing(ctx, cx, cy,
        cx * 0.74, cx * 0.18,
        t * 0.14,
        pearl(1, 0.3), 0.9,
        0.18 + intensity * 0.22,
      );
      // Ring B — 55° tilt
      drawOrbitalRing(ctx, cx, cy,
        cx * 0.68, cx * 0.42,
        -t * 0.21 + Math.PI / 4,
        pearl(1, 0.5), 0.75,
        0.22 + intensity * 0.25,
      );
      // Ring C — nearly vertical
      drawOrbitalRing(ctx, cx, cy,
        cx * 0.20, cx * 0.72,
        t * 0.17 + Math.PI / 6,
        cyan(1), 0.7,
        0.15 + intensity * 0.20,
      );

      // ── 7. Particle orbital web ───────────────────────────────────────────
      const speedMult = 1 + (active ? intensity * 2.2 : 0);
      const positions: [number, number, number, number][] = [];

      for (const p of particles) {
        p.angle += p.speed * 0.013 * speedMult;
        const r = p.radius;
        // Simulate 3D orbit: x uses full radius, y is compressed by tiltCos
        const px = cx + r * Math.cos(p.angle);
        const py = cy + r * Math.sin(p.angle) * p.tiltCos;
        positions.push([px, py, p.size, p.brightness]);
      }

      // Web connections between nearby particles
      ctx.save();
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const [ax, ay] = positions[i];
          const [bx, by] = positions[j];
          const dist = Math.hypot(ax - bx, ay - by);
          const threshold = cx * 0.28;
          if (dist < threshold) {
            const lineAlpha = (1 - dist / threshold) * (0.05 + intensity * 0.12);
            ctx.strokeStyle = pearl(lineAlpha, 0.4);
            ctx.lineWidth = 0.4;
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
      for (const [px, py, ps, pb] of positions) {
        const dotAlpha = 0.5 + intensity * 0.45;
        const isCyan   = pb < 0.7;
        ctx.fillStyle  = isCyan ? cyan(dotAlpha * pb) : pearl(dotAlpha * pb, 0.3);
        ctx.shadowColor = isCyan ? cyan(1) : pearl(1, 0.2);
        ctx.shadowBlur  = 3 + intensity * 5;
        ctx.beginPath();
        ctx.arc(px, py, ps * (1 + intensity * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── 8. Speech pulse rings ─────────────────────────────────────────────
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += pulse.speed;
        pulse.alpha  *= 0.92;
        if (pulse.alpha < 0.01) { pulses.splice(i, 1); continue; }
        ctx.save();
        ctx.strokeStyle = pearl(pulse.alpha, 0.4);
        ctx.lineWidth   = 1.2;
        ctx.shadowColor = pearl(pulse.alpha, 0.2);
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── 9. Central orb ───────────────────────────────────────────────────
      const scaledR = orbR * breath;

      // Outer orb glow
      const ogr = ctx.createRadialGradient(cx, cy, 0, cx, cy, scaledR * 2.5);
      ogr.addColorStop(0,   pearl(0.35 + intensity * 0.3, 0.2));
      ogr.addColorStop(0.5, pearl(0.10 + intensity * 0.15, 0.6));
      ogr.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.save();
      ctx.fillStyle = ogr;
      ctx.beginPath();
      ctx.arc(cx, cy, scaledR * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Orb body
      const ig = ctx.createRadialGradient(
        cx - scaledR * 0.28, cy - scaledR * 0.28, 0,
        cx, cy, scaledR,
      );
      ig.addColorStop(0,    "rgba(255,255,255,1)");
      ig.addColorStop(0.25, "rgba(230,210,255,0.97)");
      ig.addColorStop(0.60, `rgba(150,90,255,${(0.85 + intensity * 0.15).toFixed(2)})`);
      ig.addColorStop(0.85, `rgba(80,40,180,${(0.7 + intensity * 0.2).toFixed(2)})`);
      ig.addColorStop(1,    "rgba(40,10,120,0.5)");

      ctx.save();
      ctx.shadowColor = pearl(0.8 + intensity * 0.2, 0.3);
      ctx.shadowBlur  = 14 + intensity * 28;
      ctx.beginPath();
      ctx.arc(cx, cy, scaledR, 0, Math.PI * 2);
      ctx.fillStyle = ig;
      ctx.fill();
      ctx.restore();

      // ── 10. Orb inner shimmer ring ────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, scaledR * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = pearl(0.15 + intensity * 0.20, 0.0);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();

      // ── 11. Specular highlight ────────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.55 + intensity * 0.12;
      const sg = ctx.createRadialGradient(
        cx - scaledR * 0.30, cy - scaledR * 0.35, 0,
        cx - scaledR * 0.30, cy - scaledR * 0.35, scaledR * 0.45,
      );
      sg.addColorStop(0,   "rgba(255,255,255,0.9)");
      sg.addColorStop(0.5, "rgba(220,210,255,0.3)");
      sg.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx - scaledR * 0.30, cy - scaledR * 0.35, scaledR * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 12. Center bright point ───────────────────────────────────────────
      ctx.save();
      ctx.fillStyle   = "rgba(255,255,255,0.95)";
      ctx.shadowColor = "rgba(255,255,255,1)";
      ctx.shadowBlur  = 8 + intensity * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, scaledR * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // end clip

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "auto" }}
    />
  );
}
