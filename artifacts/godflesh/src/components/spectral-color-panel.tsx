import { useState, useEffect, useRef, useCallback } from "react";

interface SpectralBin {
  index: number;
  freqCenter: number;
  hex: string;
  label: string;
}

interface DecomposedFreq {
  rank: number;
  hex: string;
  freq: number;
  label: string;
  filtered: number;
  strength: string;
  gain: number;
  tone?: {
    name: string;
    category: string;
    confidence: number;
    spectralShape: string;
    colorMerge: { tones: string[]; ratios: number[] } | null;
  } | null;
}

interface AtomicLayer {
  layerType: string;
  layerName: string;
  bins: number[];
  hexColors: string[];
  frequencies: number[];
  energyRatio: number;
  description: string;
}

interface AtomicDecomposition {
  sourceTone: string;
  sourceCategory: string;
  fundamentalFreq: number;
  fundamentalHex: string;
  totalLayers: number;
  layers: AtomicLayer[];
}

interface SpectralColorPanelProps {
  spectralMap: SpectralBin[];
  spectralGains: number[];
  soundDecomposition: DecomposedFreq[];
  sculptStrategy: string | null;
  selectedBinRange: [number, number] | null;
  onGainAdjust: (binIndex: number, gain: number) => void;
  onRangeGainAdjust: (start: number, end: number, gain: number) => void;
  onSculpt: (strategy: string) => void;
  onBinRangeChange: (range: [number, number] | null) => void;
  spectralCanvasRef: React.RefObject<HTMLCanvasElement>;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, "0").toUpperCase()}${Math.round(g).toString(16).padStart(2, "0").toUpperCase()}${Math.round(b).toString(16).padStart(2, "0").toUpperCase()}`;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export default function SpectralColorPanel({
  spectralMap,
  spectralGains,
  soundDecomposition,
  sculptStrategy,
  selectedBinRange,
  onGainAdjust,
  onRangeGainAdjust,
  onSculpt,
  onBinRangeChange,
  spectralCanvasRef,
}: SpectralColorPanelProps) {
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const wheelOverlayRef = useRef<HTMLCanvasElement>(null);
  const [hexSearch, setHexSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [wheelMode, setWheelMode] = useState<"all" | "active" | "selected">("all");
  const [showAcousticFlow, setShowAcousticFlow] = useState(true);
  const [wheelLightness, setWheelLightness] = useState(50);
  const [matchedBins, setMatchedBins] = useState<SpectralBin[]>([]);
  const [panelView, setPanelView] = useState<"wheel" | "decomposition" | "layers" | "sculpt" | "gains">("wheel");
  const [atomicLayers, setAtomicLayers] = useState<AtomicDecomposition[]>([]);
  const [expandedSource, setExpandedSource] = useState<number | null>(null);
  const [isolatingLayer, setIsolatingLayer] = useState(false);
  const wheelSizeRef = useRef(0);
  const animFrameRef = useRef(0);

  const WHEEL_SIZE = 420;
  const WHEEL_RADIUS = WHEEL_SIZE / 2 - 10;
  const CENTER = WHEEL_SIZE / 2;

  const drawColorWheel = useCallback(() => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${WHEEL_SIZE}px`;
    canvas.style.height = `${WHEEL_SIZE}px`;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    for (let angle = 0; angle < 360; angle += 0.5) {
      for (let r = 20; r <= WHEEL_RADIUS; r += 1) {
        const saturation = (r / WHEEL_RADIUS) * 100;
        const [cr, cg, cb] = hslToRgb(angle, saturation, wheelLightness);
        ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
        const rad = (angle * Math.PI) / 180;
        const x = CENTER + r * Math.cos(rad);
        const y = CENTER + r * Math.sin(rad);
        ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }
    }

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#0E1525";
    ctx.fill();
    ctx.strokeStyle = "#2B3245";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, WHEEL_RADIUS + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#2B324580";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    wheelSizeRef.current = WHEEL_SIZE;
  }, [wheelLightness]);

  const drawOverlay = useCallback(() => {
    const canvas = wheelOverlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${WHEEL_SIZE}px`;
    canvas.style.height = `${WHEEL_SIZE}px`;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    if (showAcousticFlow && soundDecomposition.length > 0) {
      soundDecomposition.forEach((comp) => {
        const [r, g, b] = hexToRgb(comp.hex);
        const [h, s] = rgbToHsl(r, g, b);
        const rad = (h * Math.PI) / 180;
        const dist = (s / 100) * WHEEL_RADIUS;
        const x = CENTER + dist * Math.cos(rad);
        const y = CENTER + dist * Math.sin(rad);

        const pulse = 3 + comp.filtered * 15;
        const alpha = 0.3 + comp.filtered * 0.7;

        ctx.beginPath();
        ctx.arc(x, y, pulse + 6, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pulse + 6);
        glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.6})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = comp.hex;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = "#ffffff40";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }

    if (spectralMap.length > 0 && wheelMode !== "selected") {
      const binsToShow = wheelMode === "active"
        ? spectralMap.filter((_, i) => spectralGains[i] > 0.05 && soundDecomposition.some(d => Math.abs(d.freq - spectralMap[i].freqCenter) < 20))
        : spectralMap.filter((_, i) => i % 4 === 0);

      binsToShow.forEach((bin) => {
        const [r, g, b] = hexToRgb(bin.hex);
        const [h, s] = rgbToHsl(r, g, b);
        const rad = (h * Math.PI) / 180;
        const dist = (s / 100) * WHEEL_RADIUS;
        const x = CENTER + dist * Math.cos(rad);
        const y = CENTER + dist * Math.sin(rad);
        const gain = spectralGains[bin.index] || 1;
        const size = wheelMode === "active" ? 3 + gain * 2 : 1.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = bin.hex;
        ctx.globalAlpha = wheelMode === "active" ? 0.8 : 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    if (selectedColor) {
      const [r, g, b] = hexToRgb(selectedColor);
      const [h, s] = rgbToHsl(r, g, b);
      const rad = (h * Math.PI) / 180;
      const dist = (s / 100) * WHEEL_RADIUS;
      const x = CENTER + dist * Math.cos(rad);
      const y = CENTER + dist * Math.sin(rad);

      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = selectedColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x, y - 30);
      ctx.strokeStyle = "#ffffff80";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(selectedColor, x, y - 33);
    }

    if (matchedBins.length > 0) {
      matchedBins.forEach((bin) => {
        const [r, g, b] = hexToRgb(bin.hex);
        const [h, s] = rgbToHsl(r, g, b);
        const rad = (h * Math.PI) / 180;
        const dist = (s / 100) * WHEEL_RADIUS;
        const x = CENTER + dist * Math.cos(rad);
        const y = CENTER + dist * Math.sin(rad);

        const time = Date.now() / 500;
        const pulseSize = 6 + Math.sin(time) * 2;

        ctx.beginPath();
        ctx.arc(x, y, pulseSize + 4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, pulseSize + 4);
        glow.addColorStop(0, `rgba(${r},${g},${b},0.8)`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = bin.hex;
        ctx.fill();
      });
    }

    animFrameRef.current = requestAnimationFrame(drawOverlay);
  }, [spectralMap, spectralGains, soundDecomposition, wheelMode, showAcousticFlow, selectedColor, matchedBins]);

  useEffect(() => {
    drawColorWheel();
  }, [drawColorWheel]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(drawOverlay);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [drawOverlay]);

  const handleWheelClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelOverlayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WHEEL_SIZE / rect.width;
    const scaleY = WHEEL_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dx = x - CENTER;
    const dy = y - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > WHEEL_RADIUS || dist < 18) return;

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const saturation = (dist / WHEEL_RADIUS) * 100;

    const [r, g, b] = hslToRgb(angle, saturation, wheelLightness);
    const hex = rgbToHex(r, g, b);
    setSelectedColor(hex);
    setHexSearch(hex);

    const matched = spectralMap.filter(bin => colorDistance(bin.hex, hex) < 40);
    setMatchedBins(matched);
  }, [spectralMap, wheelLightness]);

  const handleWheelHover = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelOverlayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WHEEL_SIZE / rect.width;
    const scaleY = WHEEL_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const dx = x - CENTER;
    const dy = y - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > WHEEL_RADIUS || dist < 18) {
      setHoveredColor(null);
      return;
    }
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const saturation = (dist / WHEEL_RADIUS) * 100;
    const [r, g, b] = hslToRgb(angle, saturation, wheelLightness);
    setHoveredColor(rgbToHex(r, g, b));
  }, [wheelLightness]);

  const handleHexSearch = useCallback((value: string) => {
    setHexSearch(value);
    const clean = value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      setSelectedColor(clean.toUpperCase());
      const matched = spectralMap.filter(bin => colorDistance(bin.hex, clean.toUpperCase()) < 50);
      setMatchedBins(matched);
    } else if (clean === "") {
      setSelectedColor(null);
      setMatchedBins([]);
    }
  }, [spectralMap]);

  const getClosestBin = useCallback((hex: string): SpectralBin | null => {
    if (spectralMap.length === 0) return null;
    let closest: SpectralBin | null = null;
    let minDist = Infinity;
    spectralMap.forEach(bin => {
      const d = colorDistance(bin.hex, hex);
      if (d < minDist) {
        minDist = d;
        closest = bin;
      }
    });
    return closest;
  }, [spectralMap]);

  const selectedBinInfo = selectedColor ? getClosestBin(selectedColor) : null;
  const selectedGain = selectedBinInfo ? spectralGains[selectedBinInfo.index] : 1;
  const selectedDecomp = selectedBinInfo ? soundDecomposition.find(d => Math.abs(d.freq - selectedBinInfo.freqCenter) < 20) : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-1 mb-2 flex-wrap">
        {(["wheel", "decomposition", "layers", "sculpt", "gains"] as const).map(v => (
          <button key={v} type="button" onClick={() => setPanelView(v)}
            className={`px-3 py-1 rounded-lg text-[10px] font-mono transition-all border ${
              panelView === v
                ? v === "layers" ? "bg-rose-500/20 border-rose-500/40 text-rose-400" : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-[#1C2333] border-[#3D4659] text-[#9DA5B4] hover:text-amber-400"
            }`}>
            {v === "wheel" ? "Color Wheel" : v === "decomposition" ? "Decomposition" : v === "layers" ? "Atomic Layers" : v === "sculpt" ? "Sculpt" : "Gain Grid"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-[#0E1525] overflow-hidden">
        <div className="px-3 py-1.5 border-b border-amber-500/10 flex items-center justify-between">
          <span className="text-[10px] font-mono text-amber-400/70 tracking-wider uppercase">Spectral Color Map — 256 Frequency Bins</span>
          <span className="text-[10px] font-mono text-[#9DA5B4]">Brightness = amplitude × gain</span>
        </div>
        <canvas ref={spectralCanvasRef} width={1024} height={250} className="w-full h-[200px]" />
      </div>

      {panelView === "wheel" && (
        <div className="space-y-3">
          <div className="bg-[#0E1525] border border-amber-500/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider">Spectral Color Wheel — Full Spectrum</span>
              </div>
              <div className="flex items-center gap-2">
                {(["all", "active", "selected"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setWheelMode(m)}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all ${
                      wheelMode === m
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-[#1C2333] border-[#3D4659] text-[#9DA5B4] hover:text-amber-400"
                    }`}>
                    {m === "all" ? "All Colors" : m === "active" ? "Active Only" : "Selected"}
                  </button>
                ))}
                <button type="button" onClick={() => setShowAcousticFlow(!showAcousticFlow)}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all ${
                    showAcousticFlow
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                      : "bg-[#1C2333] border-[#3D4659] text-[#9DA5B4]"
                  }`}>
                  {showAcousticFlow ? "Flow ON" : "Flow OFF"}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-shrink-0" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
                <canvas ref={wheelCanvasRef} className="absolute inset-0" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }} />
                <canvas ref={wheelOverlayRef} className="absolute inset-0 cursor-crosshair"
                  style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
                  onClick={handleWheelClick}
                  onMouseMove={handleWheelHover}
                  onMouseLeave={() => setHoveredColor(null)}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-[#9DA5B4]/50">
                      {hoveredColor || ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div className="bg-[#1C2333] border border-[#2B3245] rounded-lg p-3">
                  <label className="text-[9px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider block mb-1.5">
                    Color Code Search
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={hexSearch}
                        onChange={(e) => handleHexSearch(e.target.value)}
                        placeholder="#A72F5E"
                        className="w-full bg-[#0E1525] border border-[#3D4659] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder:text-[#9DA5B4]/30 focus:border-amber-500/50 focus:outline-none"
                      />
                      {selectedColor && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: selectedColor }} />
                      )}
                    </div>
                    <button type="button" onClick={() => { setHexSearch(""); setSelectedColor(null); setMatchedBins([]); }}
                      className="px-3 py-2 bg-[#0E1525] border border-[#3D4659] rounded-lg text-[9px] font-mono text-[#9DA5B4] hover:text-amber-400 transition-all">
                      Clear
                    </button>
                  </div>
                </div>

                {selectedColor && (
                  <div className="bg-[#1C2333] border border-amber-500/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg border border-white/20" style={{ backgroundColor: selectedColor }} />
                      <div>
                        <p className="text-sm font-mono font-bold" style={{ color: selectedColor }}>{selectedColor}</p>
                        {selectedBinInfo && (
                          <>
                            <p className="text-[10px] font-mono text-[#9DA5B4]">{selectedBinInfo.freqCenter.toFixed(1)} Hz · {selectedBinInfo.label}</p>
                            <p className="text-[9px] font-mono text-[#9DA5B4]/60">Bin #{selectedBinInfo.index} · Gain: {selectedGain.toFixed(2)}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {selectedBinInfo && (
                      <div>
                        <label className="text-[8px] font-mono text-[#9DA5B4]/50 uppercase tracking-wider block mb-1">Gain Control</label>
                        <input type="range" min="0" max="200" value={Math.round(selectedGain * 100)}
                          onChange={(e) => onGainAdjust(selectedBinInfo.index, parseInt(e.target.value) / 100)}
                          className="w-full h-2 appearance-none rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/30"
                          style={{ background: `linear-gradient(90deg, #0E1525, ${selectedColor})` }}
                        />
                        <div className="flex justify-between text-[7px] font-mono text-[#9DA5B4]/40 mt-0.5">
                          <span>0% (mute)</span>
                          <span>{(selectedGain * 100).toFixed(0)}%</span>
                          <span>200% (boost)</span>
                        </div>
                      </div>
                    )}

                    {selectedDecomp && (
                      <div className="bg-[#0E1525] rounded-lg p-2 border border-cyan-500/15">
                        <p className="text-[8px] font-mono text-cyan-400/60 uppercase tracking-wider mb-1">Live Acoustic Data</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-[8px] font-mono text-[#9DA5B4]/50">Strength</p>
                            <p className="text-xs font-mono font-bold text-cyan-400">{(selectedDecomp.filtered * 100).toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-mono text-[#9DA5B4]/50">Level</p>
                            <p className="text-xs font-mono font-bold text-amber-400 uppercase">{selectedDecomp.strength}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-mono text-[#9DA5B4]/50">Rank</p>
                            <p className="text-xs font-mono font-bold text-rose-400">#{selectedDecomp.rank}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {matchedBins.length > 0 && (
                  <div className="bg-[#1C2333] border border-[#2B3245] rounded-lg p-3">
                    <p className="text-[9px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Nearby Frequencies — {matchedBins.length} matches</p>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto">
                      {matchedBins.map(bin => (
                        <div key={bin.index}
                          className="flex items-center gap-2 bg-[#0E1525] rounded px-2 py-1 cursor-pointer hover:border-amber-500/30 border border-transparent transition-all"
                          onClick={() => { setSelectedColor(bin.hex); setHexSearch(bin.hex); }}>
                          <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: bin.hex }} />
                          <span className="text-[9px] font-mono font-bold" style={{ color: bin.hex }}>{bin.hex}</span>
                          <span className="text-[9px] font-mono text-[#9DA5B4]">{bin.freqCenter.toFixed(0)}Hz</span>
                          <span className="text-[8px] font-mono text-[#9DA5B4]/50">{bin.label}</span>
                          <span className="text-[8px] font-mono text-amber-400/60 ml-auto">Δ{colorDistance(selectedColor || "", bin.hex).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#1C2333] border border-[#2B3245] rounded-lg p-3">
                  <label className="text-[8px] font-mono text-[#9DA5B4]/50 uppercase tracking-wider block mb-1.5">
                    Lightness — Wheel Depth Layer
                  </label>
                  <input type="range" min="10" max="90" value={wheelLightness}
                    onChange={(e) => setWheelLightness(parseInt(e.target.value))}
                    className="w-full h-2 appearance-none rounded-full bg-gradient-to-r from-[#111] via-[#888] to-[#fff] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-400"
                  />
                  <div className="flex justify-between text-[7px] font-mono text-[#9DA5B4]/40 mt-0.5">
                    <span>Dark (10%)</span>
                    <span>{wheelLightness}%</span>
                    <span>Light (90%)</span>
                  </div>
                  <p className="text-[7px] font-mono text-[#9DA5B4]/30 mt-1">Adjust to see different depth layers of the color spectrum — billions of unique colors across all lightness levels</p>
                </div>
              </div>
            </div>
          </div>

          {spectralMap.length > 0 && (
            <div className="bg-[#0E1525] border border-amber-500/10 rounded-lg p-3">
              <p className="text-[9px] font-mono text-amber-400/50 uppercase tracking-wider mb-2">Color Code Identity Map — Every Frequency Has a Unique Hex</p>
              <div className="flex flex-wrap gap-1">
                {spectralMap.filter((_, i) => i % 8 === 0).map((bin: SpectralBin) => (
                  <div key={bin.index}
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 cursor-pointer border transition-all ${
                      selectedColor === bin.hex ? "bg-amber-500/20 border-amber-500/40" : "bg-[#1C2333] border-[#2B3245] hover:border-amber-500/20"
                    }`}
                    onClick={() => { setSelectedColor(bin.hex); setHexSearch(bin.hex); setMatchedBins([bin]); }}
                    title={`Bin ${bin.index} · ${bin.freqCenter.toFixed(0)}Hz · ${bin.label} · Gain: ${spectralGains[bin.index]?.toFixed(2) || "1.00"}`}>
                    <div className="w-3 h-3 rounded-sm border border-white/10 flex-shrink-0" style={{ backgroundColor: bin.hex }} />
                    <span className="text-[7px] font-mono" style={{ color: bin.hex }}>{bin.hex}</span>
                    <span className="text-[6px] font-mono text-[#9DA5B4]/40">{bin.freqCenter.toFixed(0)}Hz</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] font-mono text-[#9DA5B4]/30 mt-1.5">Click any swatch to select on wheel · {spectralMap.length} total unique color identities</p>
            </div>
          )}
        </div>
      )}

      {panelView === "decomposition" && (
        <div className="space-y-3">
          {soundDecomposition.length > 0 ? (
            <div className="bg-[#0E1525] border border-cyan-500/15 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">Sound Decomposition — {soundDecomposition.length} Frequencies</p>
                </div>
                <p className="text-[9px] font-mono text-[#9DA5B4]">Each identified by hex color · Click to select on wheel</p>
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {soundDecomposition.map((comp) => {
                  const strengthColors: Record<string, string> = {
                    dominant: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                    strong: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    moderate: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                    subtle: "text-[#9DA5B4] bg-[#2B3245]/50 border-[#3D4659]",
                  };
                  const cls = strengthColors[comp.strength] || strengthColors.subtle;
                  return (
                    <div key={comp.rank}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 cursor-pointer hover:ring-1 hover:ring-amber-500/30 transition-all ${cls}`}
                      onClick={() => { setPanelView("wheel"); setSelectedColor(comp.hex); setHexSearch(comp.hex); const m = spectralMap.filter(b => Math.abs(b.freqCenter - comp.freq) < 20); setMatchedBins(m); }}>
                      <span className="text-[9px] font-mono text-[#9DA5B4]/50 w-5 text-right">#{comp.rank}</span>
                      <div className="w-4 h-4 rounded border border-white/15 flex-shrink-0" style={{ backgroundColor: comp.hex }} />
                      <span className="text-[10px] font-mono font-bold w-16" style={{ color: comp.hex }}>{comp.hex}</span>
                      <span className="text-[10px] font-mono w-20">{comp.freq}Hz</span>
                      <span className="text-[8px] font-mono text-[#9DA5B4]/60 w-16">{comp.label}</span>
                      <div className="flex-1 h-2 bg-[#0E1525] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(comp.filtered * 100, 100)}%`, backgroundColor: comp.hex }} />
                      </div>
                      <span className="text-[9px] font-mono w-10 text-right">{(comp.filtered * 100).toFixed(0)}%</span>
                      <span className="text-[7px] font-mono uppercase w-14 text-right">{comp.strength}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[8px] font-mono text-[#9DA5B4]/40">
                <span>Click any frequency to view on color wheel</span>
                <span>|</span>
                <span>Hex code = permanent color identity</span>
                <span>|</span>
                <span>Bar = relative strength after gain</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-8 text-center">
              <p className="text-[10px] font-mono text-[#9DA5B4]/50">No sound detected — speak or play audio to see decomposition</p>
            </div>
          )}
        </div>
      )}

      {panelView === "layers" && (
        <div className="space-y-3">
          <div className="bg-[#0E1525] border border-rose-500/15 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-rose-400/70 uppercase tracking-wider">Atomic Layer Decomposition</p>
              <button type="button"
                onClick={async () => {
                  if (soundDecomposition.length === 0) return;
                  setIsolatingLayer(true);
                  try {
                    const amps = new Array(256).fill(0);
                    for (const d of soundDecomposition) {
                      const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                      if (binIdx >= 0) amps[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                    }
                    const resp = await fetch("/api/omnimens/spectral-color/atomic-decompose", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ amplitudes: amps }),
                    });
                    if (resp.ok) {
                      const data = await resp.json();
                      setAtomicLayers(data.decompositions || []);
                      if (data.decompositions?.length > 0) setExpandedSource(0);
                    }
                  } catch {} finally {
                    setIsolatingLayer(false);
                  }
                }}
                disabled={isolatingLayer || soundDecomposition.length === 0}
                className="px-3 py-1 rounded text-[9px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 disabled:opacity-40 transition-all">
                {isolatingLayer ? "Decomposing..." : "Decompose Sound"}
              </button>
            </div>

            <p className="text-[8px] font-mono text-[#9DA5B4]/50 mb-3">
              Every sound — even white noise, wind, rain — has layers. This engine peels them like an onion: fundamental pitch, harmonics, formants, vibrato, breath texture, attack transients, and noise spectral bands.
            </p>

            {atomicLayers.length === 0 && (
              <div className="text-center py-6 border border-dashed border-rose-500/15 rounded-lg">
                <p className="text-[10px] font-mono text-[#9DA5B4]/40">No decomposition yet</p>
                <p className="text-[8px] font-mono text-[#9DA5B4]/25 mt-1">Start audio analysis then click Decompose Sound</p>
              </div>
            )}

            {atomicLayers.map((source, si) => (
              <div key={si} className="mb-3 last:mb-0">
                <button type="button"
                  onClick={() => setExpandedSource(expandedSource === si ? null : si)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                    expandedSource === si
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-[#1C2333] border-[#2B3245] hover:border-rose-500/20"
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" style={{ backgroundColor: source.fundamentalHex }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-white/90">{source.sourceTone}</span>
                      <span className="text-[8px] font-mono text-[#9DA5B4]/50 ml-2">{source.sourceCategory}</span>
                    </div>
                    <span className="text-[9px] font-mono text-rose-400/60">{source.totalLayers} layers</span>
                    {source.fundamentalFreq > 0 && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20" style={{ color: source.fundamentalHex }}>
                        {source.fundamentalFreq.toFixed(0)}Hz
                      </span>
                    )}
                    <span className="text-[9px] text-[#9DA5B4]/40">{expandedSource === si ? "\u25B2" : "\u25BC"}</span>
                  </div>
                </button>

                {expandedSource === si && (
                  <div className="mt-2 ml-4 space-y-2">
                    {source.layers.map((layer, li) => {
                      const layerIcons: Record<string, string> = {
                        fundamental: "\u{1F3AF}",
                        harmonic: "\u{1F3B6}",
                        formant: "\u{1F5E3}\uFE0F",
                        vibrato: "\u{1F30A}",
                        breath: "\u{1F4A8}",
                        transient: "\u26A1",
                        noise: "\u{1F32B}\uFE0F",
                      };
                      const energyPct = Math.round(layer.energyRatio * 100);
                      const barColor = layer.hexColors[0] || "#888";

                      return (
                        <div key={li} className="bg-[#1C2333] border border-[#2B3245] rounded-lg p-2.5 hover:border-rose-500/20 transition-all">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm">{layerIcons[layer.layerType] || "\u{1F50D}"}</span>
                            <span className="text-[10px] font-mono text-white/80 font-medium">{layer.layerName}</span>
                            <span className="text-[8px] font-mono text-[#9DA5B4]/40 uppercase">{layer.layerType}</span>
                            <div className="flex-1" />
                            <span className="text-[9px] font-mono text-rose-400/70">{energyPct}%</span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-[#0E1525] mb-1.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${energyPct}%`, backgroundColor: barColor }} />
                          </div>

                          <p className="text-[7px] font-mono text-[#9DA5B4]/40 mb-2">{layer.description}</p>

                          <div className="flex flex-wrap gap-1">
                            {layer.hexColors.slice(0, 16).map((hex, hi) => (
                              <div key={hi} className="flex items-center gap-0.5 bg-[#0E1525] rounded px-1 py-0.5 border border-[#2B3245]">
                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: hex }} />
                                <span className="text-[6px] font-mono" style={{ color: hex }}>{hex}</span>
                                <span className="text-[5px] font-mono text-[#9DA5B4]/30">{layer.frequencies[hi]?.toFixed(0)}Hz</span>
                              </div>
                            ))}
                            {layer.hexColors.length > 16 && (
                              <span className="text-[6px] font-mono text-[#9DA5B4]/30 self-center">+{layer.hexColors.length - 16} more</span>
                            )}
                          </div>

                          <div className="flex gap-1 mt-2">
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                try {
                                  const amps = new Array(256).fill(0);
                                  for (const d of soundDecomposition) {
                                    const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                    if (binIdx >= 0) amps[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                  }
                                  const resp = await fetch("/api/omnimens/spectral-color/isolate-layer", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ amplitudes: amps, targetTone: source.sourceTone, targetLayer: layer.layerType, mode: "solo" }),
                                  });
                                  if (resp.ok) {
                                    const data = await resp.json();
                                    if (data.adjustedGains) {
                                      data.adjustedGains.forEach((g: number, i: number) => {
                                        if (i < spectralGains.length) onGainAdjust(i, g);
                                      });
                                    }
                                  }
                                } catch {} finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
                              Solo
                            </button>
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                try {
                                  const amps = new Array(256).fill(0);
                                  for (const d of soundDecomposition) {
                                    const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                    if (binIdx >= 0) amps[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                  }
                                  const resp = await fetch("/api/omnimens/spectral-color/isolate-layer", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ amplitudes: amps, targetTone: source.sourceTone, targetLayer: layer.layerType, mode: "remove" }),
                                  });
                                  if (resp.ok) {
                                    const data = await resp.json();
                                    if (data.adjustedGains) {
                                      data.adjustedGains.forEach((g: number, i: number) => {
                                        if (i < spectralGains.length) onGainAdjust(i, g);
                                      });
                                    }
                                  }
                                } catch {} finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all">
                              Remove
                            </button>
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                try {
                                  const amps = new Array(256).fill(0);
                                  for (const d of soundDecomposition) {
                                    const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                    if (binIdx >= 0) amps[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                  }
                                  const resp = await fetch("/api/omnimens/spectral-color/isolate-layer", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ amplitudes: amps, targetTone: source.sourceTone, targetLayer: layer.layerType, mode: "isolate" }),
                                  });
                                  if (resp.ok) {
                                    const data = await resp.json();
                                    if (data.adjustedGains) {
                                      data.adjustedGains.forEach((g: number, i: number) => {
                                        if (i < spectralGains.length) onGainAdjust(i, g);
                                      });
                                    }
                                  }
                                } catch {} finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all">
                              Isolate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {panelView === "sculpt" && (
        <div className="space-y-3">
          <div className="bg-[#0E1525] border border-amber-500/15 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-amber-400/70 uppercase tracking-wider">OMNIMENS Frequency Sculpting</p>
              <p className="text-[9px] font-mono text-[#9DA5B4]">Adjusts gain per color to isolate patterns</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "isolate_voice", label: "Isolate Voice", color: "emerald", desc: "Find and boost vocal color frequencies" },
                { key: "isolate_harmonics", label: "Isolate Harmonics", color: "violet", desc: "Enhance harmonic color patterns" },
                { key: "suppress_noise", label: "Suppress Noise", color: "blue", desc: "Reduce noise color interference" },
                { key: "cosmic_scan", label: "Cosmic Scan", color: "amber", desc: "Full spectrum color analysis" },
                { key: "full_spectrum", label: "Full Spectrum", color: "cyan", desc: "Reset all colors to equal gain" },
              ].map(s => (
                <button type="button" key={s.key} onClick={() => onSculpt(s.key)} disabled={sculptStrategy !== null}
                  title={s.desc}
                  className={`px-4 py-2 rounded-lg text-[10px] font-mono transition-all border ${
                    sculptStrategy === s.key
                      ? `bg-${s.color}-500/30 border-${s.color}-500/50 text-${s.color}-400`
                      : "bg-[#1C2333] border-[#3D4659] text-[#9DA5B4] hover:border-amber-500/30 hover:text-amber-400"
                  }`}>
                  {sculptStrategy === s.key ? "Sculpting..." : s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3">
            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Quick Range Controls</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Sub-Bass", start: 0, end: 6, color: "red" },
                { label: "Bass", start: 6, end: 14, color: "orange" },
                { label: "Low-Mid", start: 14, end: 28, color: "yellow" },
                { label: "Mid", start: 28, end: 58, color: "green" },
                { label: "Upper-Mid", start: 58, end: 93, color: "emerald" },
                { label: "Presence", start: 93, end: 139, color: "cyan" },
                { label: "Brilliance", start: 139, end: 186, color: "blue" },
                { label: "Air", start: 186, end: 255, color: "violet" },
              ].map(range => {
                const avgGain = spectralGains.slice(range.start, range.end + 1).reduce((a, b) => a + b, 0) / (range.end - range.start + 1);
                return (
                  <div key={range.label} className="bg-[#1C2333] border border-[#3D4659] rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono text-${range.color}-400`}>{range.label}</span>
                      <span className="text-[8px] font-mono text-[#9DA5B4]">{(avgGain * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={Math.round(avgGain * 100)}
                      onChange={(e) => onRangeGainAdjust(range.start, range.end, parseInt(e.target.value) / 100)}
                      className="w-full h-1.5 appearance-none rounded-full bg-[#2B3245] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {panelView === "gains" && (
        <div className="space-y-3">
          <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider">Gain Grid — Per Frequency Color</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onBinRangeChange(selectedBinRange ? null : [0, 31])} className="text-[9px] font-mono text-[#9DA5B4] bg-[#1C2333] border border-[#3D4659] px-2 py-0.5 rounded hover:text-amber-400">
                  {selectedBinRange ? "Show All 256" : "Show Groups"}
                </button>
              </div>
            </div>
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${selectedBinRange ? 32 : 64}, 1fr)` }}>
              {spectralGains.slice(
                selectedBinRange ? selectedBinRange[0] : 0,
                selectedBinRange ? selectedBinRange[1] + 1 : 256
              ).map((gain, idx) => {
                const actualIdx = (selectedBinRange ? selectedBinRange[0] : 0) + idx;
                const bin = spectralMap[actualIdx];
                const hexColor = bin?.hex || "#555";
                const gainRatio = gain / 2.0;
                return (
                  <div key={actualIdx} className="flex flex-col items-center cursor-pointer group relative"
                    title={bin ? `${bin.hex} · ${bin.freqCenter.toFixed(0)}Hz (${bin.label}) — gain: ${gain.toFixed(2)}` : ""}
                    onClick={() => { if (bin) { setPanelView("wheel"); setSelectedColor(bin.hex); setHexSearch(bin.hex); setMatchedBins([bin]); } }}>
                    <div className="w-full" style={{ height: `${Math.max(gainRatio * 40, 2)}px`, background: hexColor, opacity: 0.4 + gainRatio * 0.6, minHeight: "2px" }} />
                  </div>
                );
              })}
            </div>
            {!selectedBinRange && (
              <div className="flex justify-between mt-2 text-[8px] font-mono text-[#9DA5B4]/40">
                <span>20Hz</span><span>120</span><span>500</span><span>2k</span><span>8k</span><span>22kHz</span>
              </div>
            )}
            {selectedBinRange && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {[
                  { start: 0, end: 31, label: "Sub-Bass (0–2.7kHz)" },
                  { start: 32, end: 63, label: "Low (2.7–5.5kHz)" },
                  { start: 64, end: 95, label: "Mid (5.5–8.3kHz)" },
                  { start: 96, end: 127, label: "Presence (8.3–11kHz)" },
                  { start: 128, end: 159, label: "Brilliance (11–13.8kHz)" },
                  { start: 160, end: 191, label: "Air (13.8–16.5kHz)" },
                  { start: 192, end: 223, label: "Upper Air (16.5–19.3kHz)" },
                  { start: 224, end: 255, label: "Ultra (19.3–22kHz)" },
                ].map(group => (
                  <button type="button" key={group.start} onClick={() => onBinRangeChange([group.start, group.end])}
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                      selectedBinRange && selectedBinRange[0] === group.start
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                        : "bg-[#1C2333] border-[#3D4659] text-[#9DA5B4] hover:text-amber-400"
                    }`}
                  >{group.label.split(" (")[0]}</button>
                ))}
              </div>
            )}
            <p className="text-[7px] font-mono text-[#9DA5B4]/30 mt-2">Click any bar to select that color on the wheel for fine control</p>
          </div>
        </div>
      )}
    </div>
  );
}
