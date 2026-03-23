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
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioFileRef, setAudioFileRef] = useState<File | null>(null);
  const [separating, setSeparating] = useState(false);
  const [separationStatus, setSeparationStatus] = useState("");
  const [fileAmplitudes, setFileAmplitudes] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [layerGainValues, setLayerGainValues] = useState<Record<string, number>>({});
  const [liveSpectrumData, setLiveSpectrumData] = useState<number[]>([]);
  const [fineTuneMode, setFineTuneMode] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodesRef = useRef<GainNode[]>([]);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const playStartTimeRef = useRef(0);
  const playOffsetRef = useRef(0);
  const spectrumAnimRef = useRef(0);
  const wheelSizeRef = useRef(0);
  const animFrameRef = useRef(0);

  const initAudioPlayback = useCallback(async (file: File) => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      const ctx = new AudioContext({ sampleRate: 44100 });
      audioCtxRef.current = ctx;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = buffer;
      setAudioDuration(buffer.duration);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const bandFreqs = [60, 170, 350, 700, 1400, 2800, 5600, 11200, 16000];
      const filters: BiquadFilterNode[] = [];
      const gains: GainNode[] = [];

      bandFreqs.forEach((freq, i) => {
        const filter = ctx.createBiquadFilter();
        if (i === 0) {
          filter.type = "lowshelf";
        } else if (i === bandFreqs.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
        }
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        filters.push(filter);

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        gains.push(gainNode);
      });

      for (let i = 0; i < filters.length; i++) {
        if (i === 0) continue;
        filters[i - 1].connect(filters[i]);
      }

      filters[filters.length - 1].connect(analyser);
      analyser.connect(ctx.destination);

      filtersRef.current = filters;
      gainNodesRef.current = gains;

      setSeparationStatus("Audio loaded — ready for live fine-tuning");
    } catch (e: any) {
      setSeparationStatus(`Audio load error: ${e.message}`);
    }
  }, []);

  const startPlayback = useCallback((offset = 0) => {
    const ctx = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer || !filtersRef.current.length) return;

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch {}
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(filtersRef.current[0]);
    sourceNodeRef.current = source;

    source.onended = () => {
      setIsPlaying(false);
      cancelAnimationFrame(spectrumAnimRef.current);
    };

    playStartTimeRef.current = ctx.currentTime;
    playOffsetRef.current = offset;
    source.start(0, offset);
    setIsPlaying(true);

    const updateSpectrum = () => {
      if (!analyserRef.current || !audioCtxRef.current) return;
      const analyser = analyserRef.current;
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);

      const bins256: number[] = new Array(256).fill(0);
      const binCount = freqData.length;
      const maxFreq = 22050;

      for (let i = 0; i < 256; i++) {
        const lo = maxFreq * (i / 256);
        const hi = maxFreq * ((i + 1) / 256);
        const loIdx = Math.floor((lo / maxFreq) * binCount);
        const hiIdx = Math.min(Math.ceil((hi / maxFreq) * binCount), binCount - 1);
        let sum = 0, count = 0;
        for (let j = loIdx; j <= hiIdx; j++) {
          sum += freqData[j];
          count++;
        }
        bins256[i] = count > 0 ? sum / count : 0;
      }
      setLiveSpectrumData(bins256);

      const elapsed = audioCtxRef.current.currentTime - playStartTimeRef.current + playOffsetRef.current;
      setPlaybackTime(Math.min(elapsed, audioBufferRef.current?.duration || 0));

      spectrumAnimRef.current = requestAnimationFrame(updateSpectrum);
    };
    spectrumAnimRef.current = requestAnimationFrame(updateSpectrum);
  }, []);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch {}
    }
    cancelAnimationFrame(spectrumAnimRef.current);
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      const ctx = audioCtxRef.current;
      const elapsed = ctx ? ctx.currentTime - playStartTimeRef.current + playOffsetRef.current : 0;
      stopPlayback();
      playOffsetRef.current = elapsed;
    } else {
      startPlayback(playOffsetRef.current);
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  const seekTo = useCallback((time: number) => {
    playOffsetRef.current = time;
    setPlaybackTime(time);
    if (isPlaying) {
      stopPlayback();
      startPlayback(time);
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  const applyLayerGain = useCallback((sourceIdx: number, layerIdx: number, gain: number) => {
    const key = `${sourceIdx}-${layerIdx}`;
    setLayerGainValues(prev => ({ ...prev, [key]: gain }));

    if (!atomicLayers[sourceIdx]) return;
    const layer = atomicLayers[sourceIdx].layers[layerIdx];
    if (!layer) return;

    layer.frequencies.forEach(freq => {
      filtersRef.current.forEach(filter => {
        const filterFreq = filter.frequency.value;
        if (Math.abs(freq - filterFreq) / filterFreq < 1.5) {
          const dbGain = (gain - 1.0) * 12;
          filter.gain.setValueAtTime(dbGain, audioCtxRef.current?.currentTime || 0);
        }
      });

      const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - freq) < (freq * 0.15));
      if (binIdx >= 0) {
        onGainAdjust(binIdx, gain);
      }
    });
  }, [atomicLayers, spectralMap, onGainAdjust]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(spectrumAnimRef.current);
      if (sourceNodeRef.current) try { sourceNodeRef.current.stop(); } catch {}
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

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

            <div className="bg-[#1C2333] border border-[#2B3245] rounded-lg p-3 mb-3">
              <p className="text-[9px] font-mono text-rose-400/60 uppercase tracking-wider mb-2">Audio File Analysis + Separation</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="audio/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAudioFileName(file.name);
                      setAudioFileRef(file);
                      setIsolatingLayer(true);
                      setSeparationStatus("Analyzing...");
                      try {
                        const formData = new FormData();
                        formData.append("audio", file);
                        const resp = await fetch("/api/omnimens/spectral-color/analyze-file", {
                          method: "POST",
                          credentials: "include",
                          body: formData,
                        });
                        if (resp.ok) {
                          const data = await resp.json();
                          setAtomicLayers(data.decompositions || []);
                          if (data.amplitudes) setFileAmplitudes(data.amplitudes);
                          if (data.decompositions?.length > 0) setExpandedSource(0);
                          setSeparationStatus(`${data.tones?.length || 0} tones, ${data.decompositions?.length || 0} sources detected`);
                        } else {
                          const err = await resp.json().catch(() => ({ error: "Unknown error" }));
                          setSeparationStatus(`Analysis failed: ${err.error || resp.statusText}`);
                        }
                      } catch (e: any) { setSeparationStatus(`Analysis error: ${e.message || "Unknown"}`); } finally {
                        setIsolatingLayer(false);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 px-3 py-2 rounded border border-dashed border-rose-500/20 hover:border-rose-500/40 transition-all">
                    <span className="text-sm">{"\uD83C\uDFB5"}</span>
                    <span className="text-[9px] font-mono text-[#9DA5B4]/60">
                      {audioFileName || "Upload audio file for analysis"}
                    </span>
                  </div>
                </label>
              </div>
              {separationStatus && (
                <p className="text-[8px] font-mono text-rose-400/50">{separationStatus}</p>
              )}

              {audioFileRef && atomicLayers.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#2B3245]">
                  <p className="text-[8px] font-mono text-[#9DA5B4]/40 mb-2">Separate from file:</p>
                  <div className="flex flex-wrap gap-1">
                    {atomicLayers.map((source, si) => (
                      <div key={si} className="flex gap-1">
                        <button type="button"
                          onClick={async () => {
                            if (!audioFileRef || separating) return;
                            setSeparating(true);
                            setSeparationStatus(`Removing ${source.sourceTone}...`);
                            try {
                              const formData = new FormData();
                              formData.append("audio", audioFileRef);
                              formData.append("mode", "remove");
                              formData.append("targetTone", source.sourceTone);
                              const resp = await fetch("/api/omnimens/spectral-color/separate", {
                                method: "POST",
                                credentials: "include",
                                body: formData,
                              });
                              if (resp.ok) {
                                const blob = await resp.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${audioFileRef.name.replace(/\.[^.]+$/, "")}_remove_${source.sourceTone.replace(/[^a-zA-Z0-9]/g, "_")}.wav`;
                                a.click();
                                URL.revokeObjectURL(url);
                                setSeparationStatus(`Removed ${source.sourceTone} — downloaded!`);
                              } else {
                                const err = await resp.json().catch(() => ({ error: resp.statusText }));
                                setSeparationStatus(`Remove failed: ${err.error || err.details || resp.statusText}`);
                              }
                            } catch (e: any) { setSeparationStatus(`Separation error: ${e.message || "Unknown"}`); } finally {
                              setSeparating(false);
                            }
                          }}
                          disabled={separating}
                          className="px-2 py-0.5 rounded text-[7px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all">
                          Remove {source.sourceTone.slice(0, 15)}
                        </button>
                        <button type="button"
                          onClick={async () => {
                            if (!audioFileRef || separating) return;
                            setSeparating(true);
                            setSeparationStatus(`Isolating ${source.sourceTone}...`);
                            try {
                              const formData = new FormData();
                              formData.append("audio", audioFileRef);
                              formData.append("mode", "isolate");
                              formData.append("targetTone", source.sourceTone);
                              const resp = await fetch("/api/omnimens/spectral-color/separate", {
                                method: "POST",
                                credentials: "include",
                                body: formData,
                              });
                              if (resp.ok) {
                                const blob = await resp.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${audioFileRef.name.replace(/\.[^.]+$/, "")}_isolate_${source.sourceTone.replace(/[^a-zA-Z0-9]/g, "_")}.wav`;
                                a.click();
                                URL.revokeObjectURL(url);
                                setSeparationStatus(`Isolated ${source.sourceTone} — downloaded!`);
                              } else {
                                const err = await resp.json().catch(() => ({ error: resp.statusText }));
                                setSeparationStatus(`Isolate failed: ${err.error || err.details || resp.statusText}`);
                              }
                            } catch (e: any) { setSeparationStatus(`Separation error: ${e.message || "Unknown"}`); } finally {
                              setSeparating(false);
                            }
                          }}
                          disabled={separating}
                          className="px-2 py-0.5 rounded text-[7px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
                          Isolate
                        </button>
                      </div>
                    ))}
                  </div>
                  {separating && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-rose-400/50 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[8px] font-mono text-rose-400/50">Processing audio file...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {audioFileRef && (
              <div className="bg-[#1C2333] border border-cyan-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-wider">Live Fine-Tuning Engine</p>
                  <button type="button"
                    onClick={() => {
                      if (!fineTuneMode && audioFileRef) {
                        initAudioPlayback(audioFileRef);
                        setFineTuneMode(true);
                      } else {
                        stopPlayback();
                        setFineTuneMode(false);
                        setLiveSpectrumData([]);
                      }
                    }}
                    className={`px-3 py-1 rounded text-[8px] font-mono border transition-all ${
                      fineTuneMode
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                        : "bg-[#0E1525] border-cyan-500/20 text-cyan-400/60 hover:border-cyan-500/40"
                    }`}>
                    {fineTuneMode ? "Exit Fine-Tune" : "Enter Fine-Tune Mode"}
                  </button>
                </div>

                {fineTuneMode && (
                  <div className="space-y-2">
                    <div className="bg-[#0E1525] rounded-lg p-2 border border-[#2B3245]">
                      <div className="flex items-center h-16 gap-px overflow-hidden rounded">
                        {(liveSpectrumData.length > 0 ? liveSpectrumData : new Array(256).fill(0)).map((val, i) => {
                          const bin = spectralMap[i];
                          const hex = bin?.hex || "#444";
                          const height = Math.max(1, (val / 255) * 100);
                          return (
                            <div key={i} className="flex-1 flex items-end h-full" style={{ minWidth: "0.5px" }}>
                              <div style={{
                                width: "100%",
                                height: `${height}%`,
                                backgroundColor: hex,
                                opacity: val > 5 ? 0.4 + (val / 255) * 0.6 : 0.15,
                                transition: "height 0.05s linear",
                              }} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1 text-[6px] font-mono text-[#9DA5B4]/30">
                        <span>20Hz</span><span>200</span><span>1k</span><span>5k</span><span>22kHz</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={togglePlayback}
                        className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center hover:bg-cyan-500/30 transition-all">
                        <span className="text-cyan-400 text-xs">{isPlaying ? "\u23F8" : "\u25B6"}</span>
                      </button>
                      <span className="text-[9px] font-mono text-[#9DA5B4]/60 w-20 text-center">
                        {formatTime(playbackTime)} / {formatTime(audioDuration)}
                      </span>
                      <div className="flex-1 relative">
                        <input type="range" min="0" max={Math.floor(audioDuration * 100)} value={Math.floor(playbackTime * 100)}
                          onChange={(e) => seekTo(parseInt(e.target.value) / 100)}
                          className="w-full h-1.5 appearance-none rounded-full bg-[#2B3245] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                        />
                      </div>
                      <button type="button"
                        onClick={() => {
                          stopPlayback();
                          playOffsetRef.current = 0;
                          setPlaybackTime(0);
                        }}
                        className="px-2 py-1 rounded text-[7px] font-mono text-[#9DA5B4]/50 hover:text-cyan-400 border border-[#2B3245] hover:border-cyan-500/30 transition-all">
                        Reset
                      </button>
                    </div>

                    {atomicLayers.length > 0 && (
                      <div className="bg-[#0E1525] rounded-lg p-2.5 border border-[#2B3245]">
                        <p className="text-[8px] font-mono text-cyan-400/50 uppercase tracking-wider mb-2">Per-Layer Gain Control</p>
                        <div className="space-y-1.5">
                          {atomicLayers.map((source, si) => (
                            <div key={si}>
                              <p className="text-[7px] font-mono text-[#9DA5B4]/40 mb-1">{source.sourceTone}</p>
                              {source.layers.map((layer, li) => {
                                const key = `${si}-${li}`;
                                const gain = layerGainValues[key] ?? 1.0;
                                const pct = Math.round(gain * 100);
                                return (
                                  <div key={li} className="flex items-center gap-2 mb-0.5">
                                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: layer.hexColors[0] || "#666" }} />
                                    <span className="text-[7px] font-mono text-[#9DA5B4]/60 w-24 truncate">{layer.layerName}</span>
                                    <input type="range" min="0" max="200" value={Math.round(gain * 100)}
                                      onChange={(e) => applyLayerGain(si, li, parseInt(e.target.value) / 100)}
                                      className="flex-1 h-1 appearance-none rounded-full bg-[#2B3245] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                                    />
                                    <span className={`text-[7px] font-mono w-8 text-right ${
                                      pct === 100 ? "text-[#9DA5B4]/40" : pct > 100 ? "text-emerald-400/70" : "text-red-400/70"
                                    }`}>{pct}%</span>
                                    <button type="button"
                                      onClick={() => applyLayerGain(si, li, 1.0)}
                                      className="text-[6px] font-mono text-[#9DA5B4]/30 hover:text-cyan-400 transition-colors">
                                      RST
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1 mt-2 pt-2 border-t border-[#2B3245]">
                          <button type="button"
                            onClick={() => {
                              atomicLayers.forEach((source, si) => {
                                source.layers.forEach((_, li) => applyLayerGain(si, li, 1.0));
                              });
                            }}
                            className="px-2 py-0.5 rounded text-[7px] font-mono bg-[#1C2333] border border-[#2B3245] text-[#9DA5B4]/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                            Reset All Gains
                          </button>
                          {audioFileRef && (
                            <button type="button"
                              onClick={async () => {
                                if (!audioFileRef || separating) return;
                                setSeparating(true);
                                setSeparationStatus("Exporting with current gain settings...");
                                try {
                                  const gainAdjustments: { bin: number; gain: number }[] = [];
                                  atomicLayers.forEach((source, si) => {
                                    source.layers.forEach((layer, li) => {
                                      const key = `${si}-${li}`;
                                      const gain = layerGainValues[key] ?? 1.0;
                                      if (Math.abs(gain - 1.0) > 0.01) {
                                        layer.bins.forEach(b => gainAdjustments.push({ bin: b, gain }));
                                      }
                                    });
                                  });
                                  if (gainAdjustments.length === 0) {
                                    setSeparationStatus("No gain changes to export");
                                    setSeparating(false);
                                    return;
                                  }
                                  const binGains: Record<string, number> = {};
                                  gainAdjustments.forEach(({ bin, gain }) => { binGains[String(bin)] = gain; });
                                  const targetBins = gainAdjustments.map(a => a.bin);
                                  const formData = new FormData();
                                  formData.append("audio", audioFileRef);
                                  formData.append("mode", "isolate");
                                  formData.append("customBinGains", JSON.stringify(binGains));
                                  formData.append("customTargetBins", JSON.stringify(targetBins));
                                  const resp = await fetch("/api/omnimens/spectral-color/separate", {
                                    method: "POST", credentials: "include", body: formData,
                                  });
                                  if (resp.ok) {
                                    const blob = await resp.blob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${audioFileRef.name.replace(/\.[^.]+$/, "")}_fine_tuned.wav`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    setSeparationStatus("Fine-tuned export downloaded!");
                                  } else {
                                    const err = await resp.json().catch(() => ({ error: resp.statusText }));
                                    setSeparationStatus(`Export failed: ${err.error || resp.statusText}`);
                                  }
                                } catch (e: any) {
                                  setSeparationStatus(`Export error: ${e.message || "Unknown"}`);
                                } finally { setSeparating(false); }
                              }}
                              disabled={separating}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
                              Export with Current Gains
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {atomicLayers.length === 0 && (
              <div className="text-center py-6 border border-dashed border-rose-500/15 rounded-lg">
                <p className="text-[10px] font-mono text-[#9DA5B4]/40">No decomposition yet</p>
                <p className="text-[8px] font-mono text-[#9DA5B4]/25 mt-1">Upload an audio file or start live analysis then click Decompose Sound</p>
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

                          <div className="flex flex-wrap gap-1 mt-2">
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                setSeparationStatus(`Solo ${layer.layerName}...`);
                                try {
                                  const amps = fileAmplitudes.length === 256 ? fileAmplitudes : (() => {
                                    const a = new Array(256).fill(0);
                                    for (const d of soundDecomposition) {
                                      const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                      if (binIdx >= 0) a[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                    }
                                    return a;
                                  })();
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
                                      setSeparationStatus(`Solo ${layer.layerName} — gains applied`);
                                    }
                                  } else {
                                    setSeparationStatus(`Solo failed: ${resp.statusText}`);
                                  }
                                } catch (e: any) { setSeparationStatus(`Solo error: ${e.message || "Unknown"}`); } finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
                              Solo
                            </button>
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                setSeparationStatus(`Removing ${layer.layerName}...`);
                                try {
                                  const amps = fileAmplitudes.length === 256 ? fileAmplitudes : (() => {
                                    const a = new Array(256).fill(0);
                                    for (const d of soundDecomposition) {
                                      const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                      if (binIdx >= 0) a[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                    }
                                    return a;
                                  })();
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
                                      setSeparationStatus(`Removed ${layer.layerName} — gains applied`);
                                    }
                                  } else {
                                    setSeparationStatus(`Remove failed: ${resp.statusText}`);
                                  }
                                } catch (e: any) { setSeparationStatus(`Remove error: ${e.message || "Unknown"}`); } finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all">
                              Remove
                            </button>
                            <button type="button"
                              onClick={async () => {
                                setIsolatingLayer(true);
                                setSeparationStatus(`Isolating ${layer.layerName}...`);
                                try {
                                  const amps = fileAmplitudes.length === 256 ? fileAmplitudes : (() => {
                                    const a = new Array(256).fill(0);
                                    for (const d of soundDecomposition) {
                                      const binIdx = spectralMap.findIndex(b => Math.abs(b.freqCenter - d.freq) < 5);
                                      if (binIdx >= 0) a[binIdx] = Math.min(255, Math.round(d.filtered * 127.5));
                                    }
                                    return a;
                                  })();
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
                                      setSeparationStatus(`Isolated ${layer.layerName} — gains applied`);
                                    }
                                  } else {
                                    setSeparationStatus(`Isolate failed: ${resp.statusText}`);
                                  }
                                } catch (e: any) { setSeparationStatus(`Isolate error: ${e.message || "Unknown"}`); } finally { setIsolatingLayer(false); }
                              }}
                              disabled={isolatingLayer}
                              className="px-2 py-0.5 rounded text-[7px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all">
                              Isolate
                            </button>
                            {audioFileRef && (
                              <>
                                <span className="text-[6px] font-mono text-[#9DA5B4]/20 self-center px-1">|</span>
                                <button type="button"
                                  onClick={async () => {
                                    if (!audioFileRef || separating) return;
                                    setSeparating(true);
                                    setSeparationStatus(`Removing ${layer.layerName} from ${source.sourceTone}...`);
                                    try {
                                      const formData = new FormData();
                                      formData.append("audio", audioFileRef);
                                      formData.append("mode", "remove");
                                      formData.append("targetTone", source.sourceTone);
                                      formData.append("targetLayer", layer.layerType);
                                      const resp = await fetch("/api/omnimens/spectral-color/separate", {
                                        method: "POST", credentials: "include", body: formData,
                                      });
                                      if (resp.ok) {
                                        const blob = await resp.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${audioFileRef.name.replace(/\.[^.]+$/, "")}_remove_${layer.layerName.replace(/[^a-zA-Z0-9]/g, "_")}.wav`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                        setSeparationStatus(`Removed ${layer.layerName} — downloaded!`);
                                      } else {
                                        const err = await resp.json().catch(() => ({ error: resp.statusText }));
                                        setSeparationStatus(`Remove failed: ${err.error || resp.statusText}`);
                                      }
                                    } catch (e: any) { setSeparationStatus(`Remove error: ${e.message || "Unknown"}`); } finally { setSeparating(false); }
                                  }}
                                  disabled={separating}
                                  className="px-2 py-0.5 rounded text-[6px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 transition-all">
                                  {"\uD83D\uDCC1"} Remove from File
                                </button>
                                <button type="button"
                                  onClick={async () => {
                                    if (!audioFileRef || separating) return;
                                    setSeparating(true);
                                    setSeparationStatus(`Isolating ${layer.layerName} from ${source.sourceTone}...`);
                                    try {
                                      const formData = new FormData();
                                      formData.append("audio", audioFileRef);
                                      formData.append("mode", "isolate");
                                      formData.append("targetTone", source.sourceTone);
                                      formData.append("targetLayer", layer.layerType);
                                      const resp = await fetch("/api/omnimens/spectral-color/separate", {
                                        method: "POST", credentials: "include", body: formData,
                                      });
                                      if (resp.ok) {
                                        const blob = await resp.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${audioFileRef.name.replace(/\.[^.]+$/, "")}_isolate_${layer.layerName.replace(/[^a-zA-Z0-9]/g, "_")}.wav`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                        setSeparationStatus(`Isolated ${layer.layerName} — downloaded!`);
                                      } else {
                                        const err = await resp.json().catch(() => ({ error: resp.statusText }));
                                        setSeparationStatus(`Isolate failed: ${err.error || resp.statusText}`);
                                      }
                                    } catch (e: any) { setSeparationStatus(`Isolate error: ${e.message || "Unknown"}`); } finally { setSeparating(false); }
                                  }}
                                  disabled={separating}
                                  className="px-2 py-0.5 rounded text-[6px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-all">
                                  {"\uD83D\uDCC1"} Isolate from File
                                </button>
                              </>
                            )}
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
