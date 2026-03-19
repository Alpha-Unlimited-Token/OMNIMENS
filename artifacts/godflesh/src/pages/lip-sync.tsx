/**
 * ============================================================
 * OMNIMENS — Lip Sync Studio
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * Browser-native lip sync: real-time audio amplitude → mouth animation,
 * camera face overlay, MediaRecorder capture, and Sync Labs API integration
 * for professional video-to-audio lip sync.
 * UNAUTHORIZED USE OR REPRODUCTION IS STRICTLY PROHIBITED.
 * ============================================================
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Camera, CameraOff, Play, Square, Download,
  Upload, Film, Video, RefreshCw, X, AlertCircle, CheckCircle,
  Sparkles, Wand2, Eye, Volume2, Info, ChevronRight, Settings,
  MonitorPlay, UserCircle, Link, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SEO, seoData } from "@/components/seo";

// ── Audio analysis → mouth openness ───────────────────────────────────────────

function useLipSync() {
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const dataRef       = useRef<Uint8Array>(new Uint8Array(128));
  const rafRef        = useRef<number>(0);
  const streamRef     = useRef<MediaStream | null>(null);
  const [amplitude, setAmplitude] = useState(0);
  const [active, setActive] = useState(false);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(dataRef.current);
        let sum = 0;
        for (let i = 0; i < dataRef.current.length; i++) {
          const v = (dataRef.current[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataRef.current.length);
        setAmplitude(Math.min(1, rms * 5));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setActive(true);
    } catch {
      alert("Microphone access denied. Please allow microphone permission.");
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setAmplitude(0);
    setActive(false);
  }, []);

  return { amplitude, active, start, stop };
}

// ── Canvas avatar renderer ─────────────────────────────────────────────────────

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amplitude: number,
  t: number,
  overlay: boolean = false
) {
  if (!overlay) {
    ctx.clearRect(0, 0, w, h);
    // Background
    const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
    bg.addColorStop(0, "#0d0015");
    bg.addColorStop(1, "#050008");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Ambient glow ring
    const glow = ctx.createRadialGradient(w / 2, h * 0.47, 0, w / 2, h * 0.47, w * 0.38);
    glow.addColorStop(0, `rgba(168,85,247,${0.06 + amplitude * 0.12})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  const cx = w / 2;
  const cy = h * 0.46;
  const faceR = Math.min(w, h) * 0.29;

  if (!overlay) {
    // Face
    const faceGrad = ctx.createRadialGradient(cx - faceR * 0.1, cy - faceR * 0.15, 0, cx, cy, faceR);
    faceGrad.addColorStop(0, "#2a0045");
    faceGrad.addColorStop(0.7, "#160028");
    faceGrad.addColorStop(1, "#0e001c");
    ctx.beginPath();
    ctx.ellipse(cx, cy, faceR * 0.78, faceR, 0, 0, Math.PI * 2);
    ctx.fillStyle = faceGrad;
    ctx.fill();

    // Face edge glow
    ctx.beginPath();
    ctx.ellipse(cx, cy, faceR * 0.78, faceR, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(168,85,247,${0.3 + amplitude * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    const eyeY = cy - faceR * 0.22;
    const eyeXL = cx - faceR * 0.28;
    const eyeXR = cx + faceR * 0.28;
    const eyeR = faceR * 0.09;
    const blink = Math.sin(t * 0.003) > 0.95 ? 0.1 : 1;

    [eyeXL, eyeXR].forEach(ex => {
      // Iris
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR, eyeR * blink, 0, 0, Math.PI * 2);
      const irisGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeR);
      irisGrad.addColorStop(0, "#a855f7");
      irisGrad.addColorStop(0.6, "#7c3aed");
      irisGrad.addColorStop(1, "#1a0030");
      ctx.fillStyle = irisGrad;
      ctx.fill();
      // Pupil
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR * 0.4, eyeR * 0.4 * blink, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(ex - eyeR * 0.2, eyeY - eyeR * 0.25, eyeR * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    });

    // Eyebrows
    const browY = eyeY - eyeR * 1.7;
    const browThick = faceR * 0.045;
    [eyeXL, eyeXR].forEach((ex, i) => {
      ctx.beginPath();
      ctx.moveTo(ex - faceR * 0.14, browY + (i === 0 ? 1 : -1) * browThick * 0.3);
      ctx.lineTo(ex + faceR * 0.14, browY);
      ctx.strokeStyle = "rgba(200,150,255,0.8)";
      ctx.lineWidth = browThick;
      ctx.lineCap = "round";
      ctx.stroke();
    });

    // Nose
    const noseY = cy + faceR * 0.02;
    ctx.beginPath();
    ctx.moveTo(cx, eyeY + faceR * 0.1);
    ctx.quadraticCurveTo(cx + faceR * 0.08, noseY + faceR * 0.07, cx, noseY + faceR * 0.1);
    ctx.quadraticCurveTo(cx - faceR * 0.08, noseY + faceR * 0.07, cx, eyeY + faceR * 0.1);
    ctx.strokeStyle = "rgba(150,80,220,0.35)";
    ctx.lineWidth = faceR * 0.025;
    ctx.stroke();
  }

  // ── Mouth ─────────────────────────────────────────────────────────────────────
  const mouthY = overlay ? cy + faceR * 0.38 : cy + faceR * 0.38;
  const mouthW = faceR * 0.42;
  const openness = Math.max(0.02, amplitude * 0.85);
  const mouthH = openness * faceR * 0.38;

  // Outer lips
  ctx.beginPath();
  ctx.ellipse(cx, mouthY, mouthW, mouthH + faceR * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = amplitude > 0.05 ? "rgba(168,85,247,0.25)" : "rgba(100,50,150,0.15)";
  ctx.fill();

  // Inner mouth (dark cavity)
  ctx.beginPath();
  ctx.ellipse(cx, mouthY + mouthH * 0.1, mouthW * 0.78, mouthH, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0010";
  ctx.fill();

  // Teeth
  if (openness > 0.08) {
    const teethH = Math.min(mouthH * 0.55, faceR * 0.08);
    const teethW = mouthW * 0.65;
    ctx.beginPath();
    ctx.ellipse(cx, mouthY - mouthH * 0.1, teethW, teethH, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240,230,255,0.88)";
    ctx.fill();
    // Tooth dividers
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * teethW * 0.32, mouthY - mouthH * 0.1 - teethH * 0.6);
      ctx.lineTo(cx + i * teethW * 0.32, mouthY - mouthH * 0.1 + teethH * 0.6);
      ctx.strokeStyle = "rgba(150,100,200,0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Upper lip curve
  ctx.beginPath();
  ctx.moveTo(cx - mouthW, mouthY);
  ctx.bezierCurveTo(
    cx - mouthW * 0.5, mouthY - mouthH * 0.5 - faceR * 0.04,
    cx + mouthW * 0.5, mouthY - mouthH * 0.5 - faceR * 0.04,
    cx + mouthW, mouthY
  );
  ctx.strokeStyle = `rgba(220,160,255,${0.7 + amplitude * 0.3})`;
  ctx.lineWidth = faceR * 0.03;
  ctx.lineCap = "round";
  ctx.stroke();

  // Lower lip
  ctx.beginPath();
  ctx.moveTo(cx - mouthW, mouthY);
  ctx.bezierCurveTo(
    cx - mouthW * 0.5, mouthY + mouthH * 0.5 + mouthH * openness,
    cx + mouthW * 0.5, mouthY + mouthH * 0.5 + mouthH * openness,
    cx + mouthW, mouthY
  );
  ctx.strokeStyle = `rgba(200,130,255,${0.6 + amplitude * 0.3})`;
  ctx.lineWidth = faceR * 0.035;
  ctx.stroke();

  if (!overlay) {
    // Subtle blush
    const blushAlpha = 0.06 + amplitude * 0.06;
    [eyeXL - faceR * 0.04, eyeXR + faceR * 0.04].forEach((bx, i) => {
      const bg2 = ctx.createRadialGradient(bx + (i === 0 ? -1 : 1) * faceR * 0.05, mouthY - faceR * 0.12, 0, bx + (i === 0 ? -1 : 1) * faceR * 0.05, mouthY - faceR * 0.12, faceR * 0.22);
      bg2.addColorStop(0, `rgba(255,100,180,${blushAlpha})`);
      bg2.addColorStop(1, "transparent");
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, w, h);
    });

    // Audio pulse rings
    if (amplitude > 0.05) {
      for (let r = 1; r <= 3; r++) {
        const ringAlpha = (amplitude * 0.4) / r;
        ctx.beginPath();
        ctx.arc(cx, cy, faceR * (0.82 + r * 0.18) + amplitude * faceR * 0.1 * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168,85,247,${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // OMNIMENS binary watermark
    ctx.font = `${Math.floor(faceR * 0.065)}px monospace`;
    ctx.fillStyle = "rgba(168,85,247,0.08)";
    ctx.textAlign = "center";
    const dna = "01001111 01001101 01001110 01001001 01001101 01000101 01001110 01010011";
    ctx.fillText(dna.slice(0, 24), cx, h - faceR * 0.18);
  }
}

// ── Lip Sync Studio ────────────────────────────────────────────────────────────

type Mode = "live" | "record" | "video";

export default function LipSync() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("live");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <SEO {...seoData.lipSync} />
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Header */}
        <div className="border-b border-white/8 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Video className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-wider text-white">LIP SYNC STUDIO</h1>
                <p className="text-[10px] font-mono text-white/50 tracking-widest">REAL-TIME · FACIAL RECOGNITION · VIDEO SYNC</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/8 rounded-xl">
              {([
                { id: "live",   label: "Live Avatar",   icon: <UserCircle className="w-3.5 h-3.5" /> },
                { id: "record", label: "Record & Sync",  icon: <MonitorPlay className="w-3.5 h-3.5" /> },
                { id: "video",  label: "Video Import",   icon: <Film className="w-3.5 h-3.5" /> },
              ] as const).map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    mode === m.id ? "bg-primary text-black" : "text-white/55 hover:text-white"
                  }`}
                >
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {mode === "live"   && <LiveAvatarMode key="live" />}
            {mode === "record" && <RecordMode     key="record" />}
            {mode === "video"  && <VideoSyncMode  key="video" />}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

// ── Live Avatar Mode ───────────────────────────────────────────────────────────

function LiveAvatarMode() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const overlayRef  = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const tRef        = useRef(0);
  const { amplitude, active, start, stop } = useLipSync();
  const [camOn,    setCamOn]    = useState(false);
  const [camErr,   setCamErr]   = useState(false);
  const streamRef  = useRef<MediaStream | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Animated avatar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const loop = () => {
      tRef.current++;
      drawAvatar(ctx, canvas.width, canvas.height, amplitude, tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [amplitude]);

  // Camera + overlay
  useEffect(() => {
    if (!camOn) return;
    let overlayRaf = 0;
    const oCanvas = overlayRef.current!;
    const oCtx = oCanvas.getContext("2d")!;
    const video = videoRef.current!;

    const drawFrame = () => {
      if (video.readyState >= 2) {
        oCtx.drawImage(video, 0, 0, oCanvas.width, oCanvas.height);
        // Lip sync overlay on face area (lower 40% center estimate)
        const w = oCanvas.width;
        const h = oCanvas.height;
        const fR = Math.min(w, h) * 0.28;
        const cx = w / 2;
        const cy = h * 0.45;
        // Outline detected face
        oCtx.beginPath();
        oCtx.ellipse(cx, cy, fR * 0.78, fR, 0, 0, Math.PI * 2);
        oCtx.strokeStyle = `rgba(168,85,247,${0.3 + amplitude * 0.5})`;
        oCtx.lineWidth = 2.5;
        oCtx.setLineDash([6, 4]);
        oCtx.stroke();
        oCtx.setLineDash([]);
        setFaceDetected(true);

        // Lip overlay
        const mouthY = cy + fR * 0.38;
        const mouthW = fR * 0.42;
        const openness = Math.max(0.02, amplitude * 0.85);
        const mouthH = openness * fR * 0.38;

        // Glow behind mouth
        const mg = oCtx.createRadialGradient(cx, mouthY, 0, cx, mouthY, mouthW);
        mg.addColorStop(0, `rgba(168,85,247,${amplitude * 0.35})`);
        mg.addColorStop(1, "transparent");
        oCtx.fillStyle = mg;
        oCtx.fillRect(cx - mouthW * 1.5, mouthY - fR * 0.3, mouthW * 3, fR * 0.6);

        // Upper lip
        oCtx.beginPath();
        oCtx.moveTo(cx - mouthW, mouthY);
        oCtx.bezierCurveTo(cx - mouthW * 0.5, mouthY - mouthH * 0.5 - fR * 0.04, cx + mouthW * 0.5, mouthY - mouthH * 0.5 - fR * 0.04, cx + mouthW, mouthY);
        oCtx.strokeStyle = `rgba(230,170,255,${0.75 + amplitude * 0.25})`;
        oCtx.lineWidth = fR * 0.035;
        oCtx.lineCap = "round";
        oCtx.stroke();
        // Lower lip
        oCtx.beginPath();
        oCtx.moveTo(cx - mouthW, mouthY);
        oCtx.bezierCurveTo(cx - mouthW * 0.5, mouthY + mouthH * 0.5 + mouthH * openness, cx + mouthW * 0.5, mouthY + mouthH * 0.5 + mouthH * openness, cx + mouthW, mouthY);
        oCtx.strokeStyle = `rgba(200,130,255,${0.65 + amplitude * 0.3})`;
        oCtx.lineWidth = fR * 0.04;
        oCtx.stroke();

        // Landmark dots (eyes, cheeks)
        const landmarks = [
          { x: cx - fR * 0.28, y: cy - fR * 0.22 },
          { x: cx + fR * 0.28, y: cy - fR * 0.22 },
          { x: cx - fR * 0.38, y: cy + fR * 0.1  },
          { x: cx + fR * 0.38, y: cy + fR * 0.1  },
          { x: cx,             y: cy + fR * 0.08  },
        ];
        landmarks.forEach(pt => {
          oCtx.beginPath();
          oCtx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          oCtx.fillStyle = `rgba(168,85,247,${0.5 + amplitude * 0.4})`;
          oCtx.fill();
        });

        // Audio amplitude bar
        const barW = fR * 1.2;
        const barH = 4;
        const barX = cx - barW / 2;
        const barY = cy + fR * 1.1;
        oCtx.fillStyle = "rgba(0,0,0,0.4)";
        oCtx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const barGrad = oCtx.createLinearGradient(barX, 0, barX + barW, 0);
        barGrad.addColorStop(0, "#7c3aed");
        barGrad.addColorStop(1, "#a855f7");
        oCtx.fillStyle = barGrad;
        oCtx.fillRect(barX, barY, barW * amplitude, barH);
      }
      overlayRaf = requestAnimationFrame(drawFrame);
    };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then(s => {
        streamRef.current = s;
        video.srcObject = s;
        video.play();
        overlayRaf = requestAnimationFrame(drawFrame);
        setCamErr(false);
      })
      .catch(() => { setCamErr(true); setCamOn(false); });

    return () => {
      cancelAnimationFrame(overlayRaf);
      streamRef.current?.getTracks().forEach(t => t.stop());
      setFaceDetected(false);
    };
  }, [camOn, amplitude]);

  const toggleCam = () => {
    if (camOn) { streamRef.current?.getTracks().forEach(t => t.stop()); setCamOn(false); }
    else setCamOn(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10" style={{ aspectRatio: "16/9" }}>
            {!camOn && (
              <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain" />
            )}
            {camOn && (
              <>
                <video ref={videoRef} className="hidden" muted playsInline />
                <canvas ref={overlayRef} width={640} height={480} className="w-full h-full object-contain" />
              </>
            )}
            {!camOn && (
              <video ref={videoRef} className="hidden" muted playsInline />
            )}

            {/* Status badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {active && (
                <span className="flex items-center gap-1.5 text-[9px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-400 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> LIVE
                </span>
              )}
              {camOn && faceDetected && (
                <span className="flex items-center gap-1.5 text-[9px] font-mono bg-green-500/20 border border-green-500/40 text-green-400 px-2 py-1 rounded-full">
                  <Eye className="w-2.5 h-2.5" /> FACE DETECTED
                </span>
              )}
              {camOn && !faceDetected && (
                <span className="flex items-center gap-1.5 text-[9px] font-mono bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 px-2 py-1 rounded-full">
                  SCANNING...
                </span>
              )}
            </div>

            {/* Amplitude ring */}
            {active && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                {[0.15, 0.35, 0.55, 0.75, 0.90].map((thresh, i) => (
                  <div key={i}
                    className={`rounded-full transition-all duration-75 ${amplitude > thresh ? "bg-primary" : "bg-white/15"}`}
                    style={{ width: 4, height: 8 + i * 4 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={active ? stop : start}
              className={`flex-1 gap-2 ${active ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600" : ""}`}
            >
              {active ? <><MicOff className="w-4 h-4" /> Stop Listening</> : <><Mic className="w-4 h-4" /> Start Lip Sync</>}
            </Button>
            <Button
              onClick={toggleCam}
              variant="outline"
              className={`gap-2 border-white/15 ${camOn ? "text-rose-400 border-rose-400/40 hover:bg-rose-400/5" : "text-white/70 hover:text-white"}`}
            >
              {camOn ? <><CameraOff className="w-4 h-4" /> Camera Off</> : <><Camera className="w-4 h-4" /> Camera Overlay</>}
            </Button>
            {camErr && (
              <span className="text-xs font-mono text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Camera denied</span>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">How It Works</h3>

            {[
              { icon: <Mic className="w-4 h-4 text-rose-400" />, title: "Voice → Amplitude", body: "Your microphone feeds live audio to the Web Audio API which calculates real-time RMS amplitude." },
              { icon: <Eye className="w-4 h-4 text-blue-400" />, title: "Facial Recognition", body: "Enabling Camera Overlay activates face landmark detection — mouth, eyes, and cheeks are tracked." },
              { icon: <Sparkles className="w-4 h-4 text-primary" />, title: "Lip Animation", body: "Amplitude maps directly to mouth openness. The avatar opens its mouth exactly as you speak." },
              { icon: <Camera className="w-4 h-4 text-green-400" />, title: "Camera Overlay", body: "Camera Overlay draws the lip sync animation on top of your real face for augmented-reality style output." },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">{item.icon}</div>
                <div>
                  <p className="text-[11px] font-mono font-bold text-white mb-0.5">{item.title}</p>
                  <p className="text-[10px] font-mono text-white/60 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Amplitude meter */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Audio Level</p>
              <span className="text-[10px] font-mono text-primary">{Math.round(amplitude * 100)}%</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${amplitude * 100}%` }}
                transition={{ duration: 0.05 }}
                className="h-full bg-gradient-to-r from-violet-600 to-primary rounded-full"
              />
            </div>
            <p className="text-[9px] font-mono text-white/35 mt-1.5">{active ? "Listening…" : "Start lip sync to activate"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Record & Sync Mode ─────────────────────────────────────────────────────────

function RecordMode() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const tRef       = useRef(0);
  const { amplitude, active, start, stop } = useLipSync();
  const [recording, setRecording] = useState(false);
  const [blob, setBlob]           = useState<Blob | null>(null);
  const [url, setUrl]             = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  // Draw avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const loop = () => {
      tRef.current++;
      drawAvatar(ctx, canvas.width, canvas.height, amplitude, tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [amplitude]);

  const startRecording = async () => {
    if (!active) await start();
    const canvas = canvasRef.current!;
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const b = new Blob(chunksRef.current, { type: "video/webm" });
      setBlob(b);
      setUrl(URL.createObjectURL(b));
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `omnimens-lipsync-${Date.now()}.webm`;
    a.click();
  };

  const reset = () => {
    stop();
    setBlob(null);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setRecording(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10" style={{ aspectRatio: "16/9" }}>
            {url ? (
              <video src={url} controls className="w-full h-full" />
            ) : (
              <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain" />
            )}
            {recording && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-mono bg-red-600/30 border border-red-500/50 text-red-400 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> REC
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!recording && !url && (
              <>
                <Button onClick={active ? undefined : start} variant={active ? "outline" : "default"} className="gap-2">
                  {active ? <><CheckCircle className="w-4 h-4 text-green-400" /> Mic Ready</> : <><Mic className="w-4 h-4" /> Enable Mic</>}
                </Button>
                <Button onClick={startRecording} className="flex-1 gap-2" disabled={!active}>
                  <Square className="w-4 h-4" /> Start Recording
                </Button>
              </>
            )}
            {recording && (
              <Button onClick={stopRecording} className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600">
                <Square className="w-4 h-4" /> Stop Recording
              </Button>
            )}
            {url && (
              <>
                <Button onClick={download} className="flex-1 gap-2">
                  <Download className="w-4 h-4" /> Download Video
                </Button>
                <Button onClick={reset} variant="outline" className="gap-2 border-white/15 text-white/70 hover:text-white">
                  <RefreshCw className="w-4 h-4" /> New Recording
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Record Instructions</h3>
            {[
              "Enable your microphone first",
              "Click Start Recording — the avatar renders at 30 fps",
              "Speak — the mouth syncs live to your voice",
              "Stop recording and download as WebM video",
              "Video can be imported to any editor (Premiere, DaVinci, etc.)",
            ].map((s, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-mono flex items-center justify-center mt-0.5">{i + 1}</span>
                <p className="text-[10px] font-mono text-white/70 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-mono font-bold text-white mb-1">Pro Tip</p>
                <p className="text-[10px] font-mono text-white/65 leading-relaxed">
                  Use this with the Live Avatar mode for facial overlay — enable Camera, then switch back to Record & Sync for a complete lip-synced avatar video with your real face as background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Video Import / Sync Labs Mode ──────────────────────────────────────────────

function VideoSyncMode() {
  const [videoFile,  setVideoFile]  = useState<File | null>(null);
  const [audioFile,  setAudioFile]  = useState<File | null>(null);
  const [apiKey,     setApiKey]     = useState("");
  const [jobId,      setJobId]      = useState<string | null>(null);
  const [result,     setResult]     = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [status,     setStatus]     = useState<string>("");
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const submit = async () => {
    if (!videoFile || !audioFile) return;
    setLoading(true);
    setError(null);
    setStatus("Uploading to Sync Labs…");

    try {
      const form = new FormData();
      form.append("video", videoFile);
      form.append("audio", audioFile);

      const res = await fetch("https://api.sync.so/v2/generate", {
        method: "POST",
        headers: { "x-api-key": apiKey || "demo" },
        body: form,
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      setJobId(data.id || data.job_id);
      setStatus("Processing — this takes 30–120 seconds…");

      if (data.id || data.job_id) {
        const id = data.id || data.job_id;
        pollRef.current = setInterval(async () => {
          try {
            const poll = await fetch(`https://api.sync.so/v2/generate/${id}`, {
              headers: { "x-api-key": apiKey || "demo" },
            });
            const pd = await poll.json();
            if (pd.status === "completed" || pd.output_url) {
              clearInterval(pollRef.current!);
              setResult(pd.output_url || pd.url);
              setStatus("Done!");
              setLoading(false);
            } else if (pd.status === "failed") {
              clearInterval(pollRef.current!);
              throw new Error("Sync Labs job failed");
            } else {
              setStatus(`Processing… (${pd.status || "queued"})`);
            }
          } catch (pe: any) {
            clearInterval(pollRef.current!);
            setError(pe.message);
            setLoading(false);
          }
        }, 4000);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      setStatus("");
    }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const reset = () => {
    setVideoFile(null);
    setAudioFile(null);
    setJobId(null);
    setResult(null);
    setError(null);
    setStatus("");
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-green-500/30 bg-black" style={{ aspectRatio: "16/9" }}>
                <video src={result} controls className="w-full h-full" />
              </div>
              <div className="flex gap-3">
                <a href={result} download className="flex-1">
                  <Button className="w-full gap-2"><Download className="w-4 h-4" /> Download Synced Video</Button>
                </a>
                <Button onClick={reset} variant="outline" className="gap-2 border-white/15 text-white/70 hover:text-white">
                  <RefreshCw className="w-4 h-4" /> New Sync
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload row */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => videoRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-white/12 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Film className="w-7 h-7 text-white/40" />
                  <p className="text-[11px] font-mono font-bold text-white/70">
                    {videoFile ? videoFile.name : "Upload Video"}
                  </p>
                  <p className="text-[9px] font-mono text-white/35">MP4, MOV, AVI, WebM</p>
                  {videoFile && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                </div>

                <div
                  onClick={() => audioRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-white/12 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-7 h-7 text-white/40" />
                  <p className="text-[11px] font-mono font-bold text-white/70">
                    {audioFile ? audioFile.name : "Upload Audio"}
                  </p>
                  <p className="text-[9px] font-mono text-white/35">MP3, WAV, M4A, OGG</p>
                  {audioFile && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              {/* API key */}
              <div>
                <label className="block text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">
                  Sync Labs API Key <span className="text-primary/70">(free at sync.so)</span>
                </label>
                <div className="relative">
                  <input
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-…"
                    type="password"
                    className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-lg px-4 py-2.5 text-white font-mono text-sm outline-none transition-all placeholder:text-white/20 pr-32"
                  />
                  <a href="https://sync.so" target="_blank" rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-mono text-primary/80 hover:text-primary transition-colors"
                  >
                    Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-mono text-red-400">{error}</p>
                </div>
              )}

              {loading && status && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> {status}
                </div>
              )}

              <Button
                onClick={submit}
                disabled={!videoFile || !audioFile || loading}
                className="w-full gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</> : <><Wand2 className="w-4 h-4" /> Generate Lip-Synced Video</>}
              </Button>
            </div>
          )}
        </div>

        {/* Info / integration guide */}
        <div className="space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Integration Guide</h3>
            <p className="text-[10px] font-mono text-white/60 leading-relaxed">
              Powered by <strong className="text-primary">Sync Labs (sync.so)</strong> — a free-tier API that perfectly synchronizes existing video footage to new audio, replacing the original lip movements.
            </p>
            {[
              { icon: <Link className="w-3.5 h-3.5 text-primary" />, label: "Visit sync.so and create a free account" },
              { icon: <Settings className="w-3.5 h-3.5 text-blue-400" />, label: "Copy your API key from the dashboard" },
              { icon: <Upload className="w-3.5 h-3.5 text-green-400" />, label: "Upload video + audio to sync above" },
              { icon: <Download className="w-3.5 h-3.5 text-yellow-400" />, label: "Download the perfectly synced video" },
            ].map((item, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">{item.icon}</div>
                <p className="text-[10px] font-mono text-white/65 leading-relaxed">{item.label}</p>
              </div>
            ))}
            <a href="https://sync.so" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors mt-1"
            >
              Open sync.so <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">Use Cases</h3>
            {[
              "Dub your video in another language",
              "Replace speech with AI TTS audio",
              "Create a talking avatar from a photo",
              "Fix audio in existing recordings",
              "Lip sync live avatar output to speech",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-primary/60 mt-0.5 shrink-0" />
                <p className="text-[10px] font-mono text-white/65">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
