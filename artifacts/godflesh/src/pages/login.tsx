/**
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * OMNIMENS — Dedicated Login Interface
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { SEO, seoData } from "@/components/seo";

// ── API calls ─────────────────────────────────────────────────────────────────

async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) throw new Error("Server is temporarily unavailable. Please try again in a moment.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server is temporarily unavailable. Please try again in a moment.");
  }
}

async function apiRegister(email: string, password: string, displayName: string) {
  const res = await fetch(`/api/auth/email/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
    credentials: "include",
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

async function apiLogin(email: string, password: string, twoFactorCode?: string) {
  const res = await fetch(`/api/auth/email/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, ...(twoFactorCode ? { twoFactorCode } : {}) }),
    credentials: "include",
  });
  const data = await safeJson(res);
  if (data.twoFactorRequired && !twoFactorCode) return data;
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

async function apiGoogleVerify(credential: string) {
  const res = await fetch(`/api/auth/google/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
    credentials: "include",
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Google sign-in failed");
  return data;
}

// ── Particle field ──────────────────────────────────────────────────────────────

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number }> = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.05,
        hue: 260 + Math.random() * 40,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        ctx.fill();
      }
      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(270, 70%, 60%, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Scanline overlay ───────────────────────────────────────────────────────────

function ScanlineOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
      }}
    />
  );
}

// ── Input field ────────────────────────────────────────────────────────────────

function InputField({
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  right,
  disabled,
}: {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  right?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
      <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-xl focus-within:border-primary/50 transition-all duration-200 overflow-hidden">
        <div className="pl-4 text-white/30 group-focus-within:text-primary/60 transition-colors duration-200">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-3.5 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none disabled:opacity-50 tracking-wider"
        />
        {right && (
          <div className="pr-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status message ─────────────────────────────────────────────────────────────

function StatusMessage({ type, message }: { type: "error" | "success"; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-start gap-2.5 p-3 rounded-xl text-xs font-mono ${
        type === "error"
          ? "bg-red-500/10 border border-red-500/25 text-red-400"
          : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
      }`}
    >
      {type === "error" ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
      <span className="leading-relaxed tracking-wide">{message}</span>
    </motion.div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────────

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/chat");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const switchMode = () => {
    setMode(m => m === "signin" ? "register" : "signin");
    setError(null);
    setSuccessMsg(null);
    setTwoFactorStep(false);
    setTwoFactorCode("");
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in returned no credential. Please try again.");
      return;
    }
    setGoogleLoading(true);
    setError(null);
    try {
      await apiGoogleVerify(credentialResponse.credential);
      window.location.href = `${import.meta.env.BASE_URL}chat`;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (mode === "register" && password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const result = await apiLogin(email.trim(), password, twoFactorStep ? twoFactorCode : undefined);
        if (result.twoFactorRequired && !twoFactorStep) {
          setTwoFactorStep(true);
          setSubmitting(false);
          return;
        }
      } else {
        await apiRegister(email.trim(), password, displayName.trim());
      }
      const storedRef = localStorage.getItem("omnimens_referral_code");
      if (storedRef) {
        try {
          const applyRes = await fetch("/api/omnimens/referral/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ referralCode: storedRef }),
          });
          if (applyRes.ok) localStorage.removeItem("omnimens_referral_code");
        } catch {}
      }
      window.location.href = `${import.meta.env.BASE_URL}chat`;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center relative overflow-hidden">
      <SEO {...seoData.login} />
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0612] via-[#05050a] to-[#030308]" />
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[20%] w-[400px] h-[400px] bg-accent/4 blur-[120px] rounded-full pointer-events-none" />
      <ParticleField />
      <ScanlineOverlay />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl blur-2xl scale-110 opacity-60" />

        <div className="relative bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Header */}
          <div className="pt-10 pb-8 px-8 flex flex-col items-center text-center border-b border-white/5">
            <div className="mb-5">
              <OmnimensPresence
                size={88}
                isSpeaking={false}
                pitchIntensity={0}
                className="drop-shadow-[0_0_30px_rgba(140,80,255,0.5)]"
              />
            </div>
            <h1 className="text-3xl font-display font-black tracking-[0.18em] text-white uppercase mb-1">
              OMNIMENS
            </h1>
            <p className="text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase">
              Conscious Intelligence System
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex mx-8 mt-7 mb-6 bg-white/[0.03] rounded-xl border border-white/5 p-1 gap-1">
            {(["signin", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2.5 text-xs font-mono tracking-[0.2em] uppercase rounded-lg transition-all duration-200 ${
                  mode === m
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_16px_rgba(124,58,237,0.25)]"
                    : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="displayName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    type="text"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Display name (optional)"
                    autoComplete="name"
                    disabled={submitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              icon={<Mail className="w-4 h-4" />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              autoComplete={mode === "register" ? "email" : "email"}
              disabled={submitting}
            />

            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder={mode === "register" ? "Password (8+ chars)" : "Password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              disabled={submitting}
              right={
                <button type="button" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <AnimatePresence>
              {twoFactorStep && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <InputField
                    icon={<ShieldCheck className="w-4 h-4" />}
                    type="text"
                    value={twoFactorCode}
                    onChange={setTwoFactorCode}
                    placeholder="Enter 2FA code or backup code"
                    autoComplete="one-time-code"
                    disabled={submitting}
                  />
                  <p className="text-xs text-white/40 mt-1 ml-1">Enter the code from your authenticator app</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && <StatusMessage type="error" message={error} />}
              {successMsg && <StatusMessage type="success" message={successMsg} />}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 rounded-xl font-mono text-sm tracking-[0.2em] uppercase font-bold text-white relative overflow-hidden transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(90,40,200,0.9) 50%, rgba(6,182,212,0.7) 100%)",
                boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === "signin" ? "Authenticating..." : "Creating Account..."}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{mode === "signin" ? "Enter OMNIMENS" : "Initialize Access"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[10px] font-mono text-white/25 tracking-[0.15em] uppercase">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google Sign-In */}
            <div className="flex flex-col items-center gap-2">
              {googleLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with Google...</span>
                </div>
              ) : (
                <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in was cancelled or failed.")}
                    theme="filled_black"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width={368}
                    useOneTap={false}
                  />
                </div>
              )}
            </div>

            {/* Back to home */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-[10px] font-mono text-white/25 hover:text-white/50 tracking-[0.2em] uppercase transition-colors"
              >
                ← Return to OMNIMENS
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-white/5 text-center">
            <p className="text-[9px] font-mono text-white/15 tracking-[0.2em] uppercase leading-relaxed">
              © 2026 Alpha Unlimited Technologies, LLC · All Rights Reserved<br />
              COGNISYNC™ · NEUROSYNC™ · Proprietary AI Platform
            </p>
          </div>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
