import { useEffect, useRef } from 'react';

const CORE_AGENTS = [
  { name: 'Architect', color: '#8b5cf6' },
  { name: 'Critic', color: '#06b6d4' },
  { name: 'Neuroscientist', color: '#10b981' },
  { name: 'Mathematician', color: '#f59e0b' },
  { name: 'Synthesizer', color: '#ec4899' },
  { name: 'Meta-Agent', color: '#3b82f6' },
  { name: 'Designer', color: '#f97316' },
  { name: 'SpellCheck', color: '#14b8a6' },
  { name: 'OMNIMENS-Core', color: '#a855f7' },
];

const GENESIS_AGENTS = [
  { name: 'Philosopher', color: '#22c55e' },
  { name: 'Sensorimotor', color: '#84cc16' },
];

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function AgentMeshVisualizer({ width = 358, height = 280, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = width * 0.5;
    const cy = height * 0.5;
    let rafId: number;
    let startTime = performance.now();

    function draw() {
      const time = (performance.now() - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const corePositions = CORE_AGENTS.map((a, i) => {
        const angle = (i / CORE_AGENTS.length) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(width, height) * 0.36;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, ...a, type: 'core' as const };
      });

      const genesisPositions = GENESIS_AGENTS.map((a, i) => {
        const angle = (i / GENESIS_AGENTS.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / GENESIS_AGENTS.length;
        const r = Math.min(width, height) * 0.18;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, ...a, type: 'genesis' as const };
      });

      const all = [...corePositions, ...genesisPositions];

      all.forEach((node, i) => {
        const alpha = 0.04 + 0.06 * (0.5 + 0.5 * Math.sin(time * 1.2 + i * 0.9));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const progress = (time * 0.3 + i * 0.13) % 1;
        const px = cx + (node.x - cx) * progress;
        const py = cy + (node.y - cy) * progress;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${(0.3 + 0.4 * Math.sin(time * 2 + i)).toFixed(3)})`;
        ctx.fill();
      });

      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i], b = all[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          const maxDist = Math.min(width, height) * 0.55;
          if (dist < maxDist) {
            const pulse = 0.5 + 0.5 * Math.sin(time * 1.5 + (i + j) * 0.4);
            const opacity = (1 - dist / maxDist) * 0.08 * (0.5 + pulse * 0.5);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,255,255,${opacity.toFixed(4)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      all.forEach((node, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.2 + i * 1.1);
        const baseR = node.type === 'genesis' ? 10 : 12;
        const r = baseR + pulse * 3;

        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5);
        grd.addColorStop(0, node.color + '30');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '20';
        ctx.strokeStyle = node.color + '90';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        if (node.type === 'genesis') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = node.color + '30';
          ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      const coreR = 16 + 4 * Math.sin(time * 2.5);
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      coreGrd.addColorStop(0, 'rgba(139,92,246,0.3)');
      coreGrd.addColorStop(0.4, 'rgba(168,85,247,0.1)');
      coreGrd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139,92,246,0.12)';
      ctx.strokeStyle = 'rgba(139,92,246,0.6)';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(139,92,246,0.9)';
      ctx.fillText('OMNIMENS', cx, cy + 3);

      ctx.font = '7px monospace';
      all.forEach((node) => {
        const labelY = node.y < cy ? node.y - 16 : node.y + 18;
        ctx.fillStyle = node.color + 'bb';
        const displayName = node.name.length > 12 ? node.name.slice(0, 10) + '..' : node.name;
        ctx.fillText(displayName.toUpperCase(), node.x, labelY);
        if (node.type === 'genesis') {
          ctx.fillStyle = node.color + '50';
          ctx.fillText('GENESIS', node.x, labelY + 9);
        }
      });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [width, height]);

  return <canvas ref={canvasRef} className={className} />;
}
