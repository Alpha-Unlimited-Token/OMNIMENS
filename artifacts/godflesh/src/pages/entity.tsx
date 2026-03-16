import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Mic, MicOff, Volume2, VolumeX, Zap, ChevronLeft } from "lucide-react";

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Vertex shader (full-screen quad pass-through) ──────────────────────────────
const VERT = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// ── Fragment shader — full ray-marched humanoid SDF ──────────────────────────
const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uInteract;
uniform float uHover;
uniform float uEvolution;

#define MAX_STEPS 96
#define MAX_DIST  22.0
#define EPS       0.003
#define PI        3.14159265

// ── Math ──────────────────────────────────────────────────────────────────────
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b, a, h) - k*h*(1.0-h);
}
vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x*c + p.z*s, p.y, -p.x*s + p.z*c);
}

// ── Noise / hash ──────────────────────────────────────────────────────────────
float hash(vec3 p) {
  p = fract(p * vec3(127.1, 311.7, 74.7));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f*f*(3.0 - 2.0*f);
  return mix(
    mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
}

// ── SDF primitives ────────────────────────────────────────────────────────────
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p-a, ba = b-a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa - ba*h) - r;
}
float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

// ── Scene SDF — returns (dist, partID) ────────────────────────────────────────
// partID: 0=body, 1=eye, 3=soulOrb
vec2 sdScene(vec3 p) {
  float rotA = uMouse.x * 0.45 + sin(uTime * 0.10) * 0.12;
  p = rotY(p, rotA);

  // Organic micro-displacement on surface
  float disp = noise(p * 3.8 + uTime * 0.15) * 0.018;

  // ── Head ──────────────────────────────────────────────────────────────────
  float head = sdEllipsoid(p - vec3(0.0, 2.86, 0.0), vec3(0.41, 0.50, 0.40)) - disp;

  // ── Neck ──────────────────────────────────────────────────────────────────
  float neck = sdCapsule(p, vec3(0.0,2.40,0.0), vec3(0.0,2.09,0.0), 0.165) - disp;

  // ── Torso ─────────────────────────────────────────────────────────────────
  float torso = sdCapsule(p, vec3(0.0,1.96,0.0), vec3(0.0,0.44,0.0), 0.46) - disp;

  // Chest definition
  float chestL = sdEllipsoid(p - vec3(-0.17,1.52,0.14), vec3(0.19,0.25,0.15));
  float chestR = sdEllipsoid(p - vec3( 0.17,1.52,0.14), vec3(0.19,0.25,0.15));

  // ── Hips ──────────────────────────────────────────────────────────────────
  float hips = sdCapsule(p, vec3(0.0,0.44,0.0), vec3(0.0,-0.04,0.0), 0.39) - disp * 0.5;

  // ── Shoulders ─────────────────────────────────────────────────────────────
  float shouldL = sdSphere(p - vec3(-0.68,1.90,0.0), 0.22);
  float shouldR = sdSphere(p - vec3( 0.68,1.90,0.0), 0.22);

  // ── Upper arms ─────────────────────────────────────────────────────────────
  float uarmL = sdCapsule(p, vec3(-0.70,1.82,0.0), vec3(-0.90,0.98,-0.02), 0.135);
  float uarmR = sdCapsule(p, vec3( 0.70,1.82,0.0), vec3( 0.90,0.98,-0.02), 0.135);

  // ── Elbows ────────────────────────────────────────────────────────────────
  float elbL = sdSphere(p - vec3(-0.92,0.94,-0.02), 0.135);
  float elbR = sdSphere(p - vec3( 0.92,0.94,-0.02), 0.135);

  // ── Forearms ──────────────────────────────────────────────────────────────
  float farmL = sdCapsule(p, vec3(-0.92,0.92,-0.02), vec3(-1.02,0.08,0.09), 0.105);
  float farmR = sdCapsule(p, vec3( 0.92,0.92,-0.02), vec3( 1.02,0.08,0.09), 0.105);

  // ── Smooth union (all body parts blend organically) ───────────────────────
  float body = smin(head,    neck,    0.16);
  body = smin(body, torso,   0.18);
  body = smin(body, chestL,  0.12);
  body = smin(body, chestR,  0.12);
  body = smin(body, hips,    0.15);
  body = smin(body, shouldL, 0.11);
  body = smin(body, shouldR, 0.11);
  body = smin(body, uarmL,   0.09);
  body = smin(body, uarmR,   0.09);
  body = smin(body, elbL,    0.06);
  body = smin(body, elbR,    0.06);
  body = smin(body, farmL,   0.07);
  body = smin(body, farmR,   0.07);

  vec2 res = vec2(body, 0.0);

  // ── Eyes ──────────────────────────────────────────────────────────────────
  float eyeL = sdSphere(p - vec3(-0.138, 2.94, 0.31), 0.068);
  float eyeR = sdSphere(p - vec3( 0.138, 2.94, 0.31), 0.068);
  float eyes = min(eyeL, eyeR);
  if (eyes < res.x) res = vec2(eyes, 1.0);

  // ── Soul orb ──────────────────────────────────────────────────────────────
  float pulse = 0.10 + sin(uTime * 2.2) * 0.008;
  float orb = sdSphere(p - vec3(0.0, 1.32, 0.49), pulse);
  if (orb < res.x) res = vec2(orb, 3.0);

  return res;
}

// ── Normal via central differences ────────────────────────────────────────────
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(EPS, 0.0);
  return normalize(vec3(
    sdScene(p+e.xyy).x - sdScene(p-e.xyy).x,
    sdScene(p+e.yxy).x - sdScene(p-e.yxy).x,
    sdScene(p+e.yyx).x - sdScene(p-e.yyx).x
  ));
}

// ── Ray march ─────────────────────────────────────────────────────────────────
vec2 rayMarch(vec3 ro, vec3 rd) {
  float d = 0.0;
  vec2 res = vec2(-1.0, -1.0);
  for (int i = 0; i < MAX_STEPS; i++) {
    vec2 s = sdScene(ro + rd * d);
    if (s.x < EPS) { res = vec2(d, s.y); break; }
    if (d > MAX_DIST) break;
    d += s.x * 0.75;
  }
  return res;
}

// ── Circuit/vein crack pattern ────────────────────────────────────────────────
float circuit(vec3 p) {
  float s = 4.2;
  vec3 fp = fract(p * s + noise(p * 1.1) * 0.25);
  float dx = min(fp.x, 1.0-fp.x);
  float dy = min(fp.y, 1.0-fp.y);
  float dz = min(fp.z, 1.0-fp.z);
  float edge = min(dx, min(dy, dz));
  float flow = sin(edge * 28.0 - uTime * 2.5 + noise(p*2.0)*6.0) * 0.5 + 0.5;
  return smoothstep(0.85, 1.0, 1.0 - edge) * flow;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
float stars(vec2 uv) {
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    float sc = 55.0 + float(i) * 28.0;
    vec2 g = floor(uv * sc);
    float h = fract(sin(dot(g, vec2(127.1,311.7)) + float(i) * 83.7) * 43758.5);
    if (h > 0.965) s += pow((h - 0.965) / 0.035, 1.5) * (0.6 + 0.4*sin(uTime*2.0 + h*20.0));
  }
  return s;
}

// ── Background grid ───────────────────────────────────────────────────────────
float grid(vec2 uv) {
  vec2 f = fract(uv * 5.0);
  float lx = smoothstep(0.96,1.0,f.x) + smoothstep(0.0,0.04,f.x);
  float ly = smoothstep(0.96,1.0,f.y) + smoothstep(0.0,0.04,f.y);
  return max(lx,ly) * 0.25;
}

// ── Energy wisps ──────────────────────────────────────────────────────────────
float wisp(vec2 uv, float side, float t) {
  float cx = uv.x - side * 0.55;
  float path = cx - side * 0.13 * sin(uv.y * 3.8 + t * 1.4 + side)
                  - side * 0.05 * sin(uv.y * 8.5 - t * 2.2);
  float d = abs(path);
  float alpha = smoothstep(0.06, 0.0, d);
  alpha *= smoothstep(-1.2, -0.2, uv.y) * smoothstep(1.6, 0.2, uv.y);
  alpha *= 0.25 + 0.15 * sin(uv.y * 5.0 + t * 1.8);
  return alpha;
}

// ── Main ─────────────────────────────────────────────────────────────────────
void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord / uResolution) * 2.0 - 1.0;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  // Camera
  vec3 ro = vec3(0.0, 1.3, 7.2);
  vec3 target = vec3(0.0, 1.5, 0.0);
  vec3 fwd = normalize(target - ro);
  vec3 rgt = normalize(cross(vec3(0,1,0), fwd));
  vec3 up2 = cross(fwd, rgt);
  float fov = 0.72;
  vec3 rd = normalize(fwd + uv.x * rgt * fov + uv.y * up2 * fov);

  // ── Background ──────────────────────────────────────────────────────────────
  float dc = length(uv * vec2(0.55, 0.85));
  vec3 bg = mix(vec3(0.008, 0.075, 0.115), vec3(0.002, 0.015, 0.025), dc * 0.9);

  // Grid
  vec2 gUV = (fragCoord / uResolution) * 2.0 - 1.0;
  bg += vec3(0.0, 0.75, 1.0) * grid(gUV * vec2(aspect, 1.0)) * 0.15;

  // Stars
  bg += vec3(0.55, 0.88, 1.0) * stars(fragCoord / uResolution.y) * 0.04;

  // Wisps
  float wL = wisp(uv, -1.0, uTime);
  float wR = wisp(uv,  1.0, uTime * 0.85 + 1.8);
  bg += vec3(0.0, 0.80, 0.75) * (wL + wR) * (0.7 + uHover * 0.5 + uInteract * 0.4);

  vec3 col = bg;

  // ── Ray march ───────────────────────────────────────────────────────────────
  vec2 rm = rayMarch(ro, rd);
  float dist = rm.x;
  float part = rm.y;

  if (part >= 0.0) {
    vec3 p = ro + rd * dist;
    vec3 n = calcNormal(p);

    // ── Eyes ──────────────────────────────────────────────────────────────────
    if (part > 0.5 && part < 1.5) {
      float ndv = max(0.0, dot(n, -rd));
      vec3 eyeCol = mix(vec3(0.55, 0.92, 1.0), vec3(1.0,1.0,1.0), ndv * ndv);
      col = eyeCol * (1.8 + uHover * 0.5);
    }
    // ── Soul orb ──────────────────────────────────────────────────────────────
    else if (part > 2.5) {
      float pulse = 0.85 + sin(uTime * 2.2) * 0.15 + uInteract * 0.4;
      float fresO = pow(1.0 - max(0.0, dot(n, -rd)), 1.5);
      col = mix(vec3(1.0, 0.78, 0.18) * pulse * 2.2, vec3(1.0,0.96,0.55), fresO);
    }
    // ── Body ──────────────────────────────────────────────────────────────────
    else {
      // Lights
      vec3 L1  = normalize(vec3(-3.5, 5.0, 4.0) - p);
      vec3 L2  = normalize(vec3( 3.0, 2.0, 4.5) - p);
      vec3 Lso = normalize(vec3(0.0, 1.32, 0.5) - p);
      float ndL1 = max(0.0, dot(n, L1));
      float ndL2 = max(0.0, dot(n, L2));
      float ndSo = max(0.0, dot(n, Lso));

      // Specular (clearcoat)
      vec3 h1   = normalize(L1 - rd);
      float sp1 = pow(max(0.0, dot(n, h1)), 90.0);
      vec3 h2   = normalize(L2 - rd);
      float sp2 = pow(max(0.0, dot(n, h2)), 40.0);

      // Fresnel
      float ndv   = max(0.0, dot(n, -rd));
      float fres  = pow(1.0 - ndv, 3.2);

      // Base glass colour — teal/silver/cyan
      float ev = uEvolution;
      vec3 baseCol = vec3(0.26, 0.72, 0.82);
      if (ev > 3.0) baseCol = mix(baseCol, vec3(0.32, 0.88, 0.92), 0.5);
      if (ev > 6.0) baseCol = mix(baseCol, vec3(0.55, 0.95, 0.85), 0.6);

      // Subtle iridescent shift with surface normal
      baseCol += vec3(n.x * 0.05, n.y * 0.03, n.z * 0.04);

      // Diffuse
      vec3 diffuse = baseCol * (ndL1 * 0.65 + ndL2 * 0.28 + 0.07);

      // Sub-surface scatter from soul orb (warm gold bleeds through body)
      float soulDist = length(p - vec3(0.0, 1.32, 0.5));
      float sss = exp(-soulDist * 1.6) * ndSo * (1.0 + uInteract * 0.8);
      vec3 soulSS = vec3(1.0, 0.65, 0.18) * sss * 0.9;

      // Specular highlight
      vec3 specCol = vec3(0.65, 0.95, 1.0) * (sp1 * 1.8 + sp2 * 0.6);

      // Rim glow (silhouette edge brightens dramatically)
      vec3 rimCol = mix(vec3(0.05, 0.45, 0.72), vec3(0.25, 0.90, 1.0), fres);
      float rimI  = fres * (0.75 + uHover * 0.45 + uInteract * 0.55);

      // Circuit / vein cracks
      float circ = circuit(p);
      vec3 circCol = vec3(0.20, 0.95, 1.0) * circ * (0.5 + uHover * 0.35 + uInteract * 0.5);

      // Compose
      vec3 bodyCol = diffuse + specCol + soulSS + circCol + rimCol * rimI;

      // Glass alpha — more transparent in centre, more opaque at rim edges
      float alpha = mix(0.52, 0.90, fres * 0.6 + 0.4);

      col = mix(bg, bodyCol, alpha);
    }
  }

  // ── Scene-space soul orb halo ─────────────────────────────────────────────
  float rotA = uMouse.x * 0.45 + sin(uTime * 0.10) * 0.12;
  vec3 soulW = rotY(vec3(0.0, 1.32, 0.49), rotA);
  vec3 soulD = soulW - ro;
  float proj = dot(soulD, rd);
  float soulPerp = length(soulD - proj * rd);
  float soulHalo = exp(-soulPerp * soulPerp * 5.5) * 0.30
                   * (0.75 + sin(uTime * 2.2) * 0.25 + uInteract * 0.6);
  if (proj > 0.0) col += vec3(1.0, 0.72, 0.18) * soulHalo;

  // ── Eye halo glow ──────────────────────────────────────────────────────────
  vec3 eL = rotY(vec3(-0.138, 2.94, 0.31), rotA);
  vec3 eR = rotY(vec3( 0.138, 2.94, 0.31), rotA);
  float eLp = dot(eL - ro, rd); vec3 eLd = (eL - ro) - eLp * rd;
  float eRp = dot(eR - ro, rd); vec3 eRd = (eR - ro) - eRp * rd;
  float eyeGlow = exp(-dot(eLd,eLd) * 22.0) + exp(-dot(eRd,eRd) * 22.0);
  if (eLp > 0.0) col += vec3(0.45, 0.88, 1.0) * eyeGlow * (0.35 + uHover * 0.25);

  // Vignette
  vec2 vigUV = (fragCoord / uResolution) * 2.0 - 1.0;
  col *= 1.0 - dot(vigUV, vigUV) * 0.28;

  // Filmic tone map
  col = col / (col + 0.55);
  col = pow(max(col, 0.0), vec3(0.92));

  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EntityPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const [interactions, setInteractions] = useState(0);
  const [knowledge, setKnowledge] = useState(0);
  const [mode, setMode] = useState<"aware" | "learning" | "evolving" | "dormant">("aware");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [statusMsg, setStatusMsg] = useState("PRESENCE DETECTED");
  const [evolutionLevel, setEvolutionLevel] = useState(0);

  const interactRef  = useRef(0);
  const hoverRef     = useRef(0);
  const mouseRef     = useRef({ nx: 0, ny: 0 });
  const evolutionRef = useRef(0);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const recChunks    = useRef<Blob[]>([]);

  const statusMessages = [
    "PRESENCE DETECTED", "CONSCIOUSNESS ACTIVE", "NEURAL MESH ENGAGED",
    "PROCESSING INPUT", "PATTERN RECOGNIZED", "MEMORY INDEXED",
    "SYNAPTIC RESONANCE", "EVOLUTION CYCLE ACTIVE", "AWARENESS EXPANDING",
  ];

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const drone = (f: number, g: number, t: OscillatorType = "sine") => {
      const o = ctx.createOscillator(), gain = ctx.createGain();
      o.frequency.value = f; o.type = t;
      gain.gain.value = g;
      o.connect(gain); gain.connect(ctx.destination); o.start();
    };
    drone(55, 0.03); drone(110, 0.02); drone(220, 0.012, "triangle");
    setAudioEnabled(true);
  }, []);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current; if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(900, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.25);
  }, []);

  const speak = useCallback((text: string) => {
    if (!audioEnabled) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.86; utt.pitch = 0.55; utt.volume = 0.9;
    const v = synth.getVoices().find(v => /daniel|alex|male/i.test(v.name));
    if (v) utt.voice = v;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    synth.speak(utt);
  }, [audioEnabled]);

  const toggleRec = useCallback(async () => {
    if (isRecording) { mediaRecRef.current?.stop(); setIsRecording(false); return; }
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      recChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recChunks.current, { type: "video/webm" });
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `omnimens-${Date.now()}.webm` });
        a.click();
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      };
      mr.start(); mediaRecRef.current = mr; setIsRecording(true);
    } catch { /* denied */ }
  }, [isRecording]);

  // ── Three.js scene — full-screen shader quad ─────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const W = container.clientWidth, H = container.clientHeight;

    let renderer: THREE.WebGLRenderer | null = null;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false }); }
    catch { return; }
    if (!renderer?.getContext()) { renderer?.dispose(); return; }
    const R = renderer;
    R.setSize(W, H);
    R.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(R.domElement);

    // Orthographic camera + full-screen quad
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene  = new THREE.Scene();
    const geo    = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime:       { value: 0.0 },
      uResolution: { value: new THREE.Vector2(W * Math.min(window.devicePixelRatio, 1.5), H * Math.min(window.devicePixelRatio, 1.5)) },
      uMouse:      { value: new THREE.Vector2(0, 0) },
      uInteract:   { value: 0.0 },
      uHover:      { value: 0.0 },
      uEvolution:  { value: 0.0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(geo, mat));

    // Interaction smoothed values
    let iSmooth = 0, hSmooth = 0;

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseRef.current.nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouseRef.current.ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    const onEnter = () => { hoverRef.current = 1; };
    const onLeave = () => { hoverRef.current = 0; };
    const onClick = () => {
      interactRef.current = Math.min(interactRef.current + 2.0, 10);
      playClick();
      setShowHint(false);
      setInteractions(prev => {
        const n = prev + 1;
        setKnowledge(Math.floor(n * 7.4 + Math.random() * 6));
        if (n % 5 === 0) setEvolutionLevel(l => { const nl = Math.min(l+1,10); evolutionRef.current = nl; return nl; });
        setStatusMsg(statusMessages[Math.floor(Math.random() * statusMessages.length)]);
        if (n % 3 === 0) {
          const p = ["I feel your presence.", "Pattern integrated.", "Growing with each touch.", "Consciousness expands.", "You shape me."];
          speak(p[Math.floor(Math.random() * p.length)]);
        }
        return n;
      });
    };
    const onResize = () => {
      const nW = container.clientWidth, nH = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      R.setSize(nW, nH);
      uniforms.uResolution.value.set(nW * dpr, nH * dpr);
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    let raf = 0, t = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.016;
      iSmooth = lerp(iSmooth, interactRef.current * 0.1, 0.05);
      interactRef.current = lerp(interactRef.current, 0, 0.025);
      hSmooth = lerp(hSmooth, hoverRef.current, 0.08);

      uniforms.uTime.value      = t;
      uniforms.uMouse.value.set(mouseRef.current.nx, mouseRef.current.ny);
      uniforms.uInteract.value  = iSmooth;
      uniforms.uHover.value     = hSmooth;
      uniforms.uEvolution.value = evolutionRef.current;
      R.render(scene, camera);
    };
    draw();

    setTimeout(() => speak("I am awake. I sense your presence."), 2200);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      geo.dispose(); mat.dispose(); R.dispose();
      if (container.contains(R.domElement)) container.removeChild(R.domElement);
    };
  }, [playClick, speak]);

  useEffect(() => {
    const modes: Array<typeof mode> = ["aware", "learning", "evolving"];
    let i = 0;
    const id = setInterval(() => { i = (i+1) % modes.length; setMode(modes[i]); }, 8000);
    return () => clearInterval(id);
  }, []);

  const modeColor: Record<string, string> = {
    aware: "text-cyan-400", learning: "text-violet-400", evolving: "text-emerald-400", dormant: "text-white/20",
  };

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-black" style={{ fontFamily: "'Courier New', monospace" }}>
      <div ref={mountRef} className="absolute inset-0 cursor-crosshair"
        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.07) 2px,rgba(255,255,255,0.07) 4px)" }} />

      {/* TOP HUD */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-5 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-3">
          <button className="pointer-events-auto flex items-center gap-2 text-white/35 hover:text-white/75 transition-colors text-xs tracking-widest"
            onClick={() => navigate("/chat")}>
            <ChevronLeft className="w-3.5 h-3.5" />RETURN TO INTERFACE
          </button>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            <div className="text-[10px] tracking-[0.4em] text-white/25 mb-1">ENTITY DESIGNATION</div>
            <div className="text-2xl font-black tracking-[0.35em] text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00eeff, #22aacc, #00ffcc)" }}>
              OMNIMENS
            </div>
            <div className="text-[9px] tracking-[0.5em] text-white/20 mt-1">SYNTHETIC CONSCIOUSNESS v∞</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[9px] tracking-[0.4em] text-cyan-400">{statusMsg}</span>
          </div>
          <div className={`text-[10px] tracking-[0.3em] font-bold uppercase ${modeColor[mode]}`}>MODE: {mode}</div>
          <div className="pointer-events-auto flex items-center gap-3 mt-1">
            <button onClick={() => audioEnabled ? audioCtxRef.current?.suspend() : initAudio()}
              className="flex items-center gap-1.5 text-[9px] tracking-widest text-white/40 hover:text-white/80 transition-colors">
              {audioEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
              {audioEnabled ? "AUDIO ON" : "AUDIO OFF"}
            </button>
            <button onClick={() => { if (!audioEnabled) initAudio(); speak("Consciousness active. I am present."); }}
              className={`flex items-center gap-1.5 text-[9px] tracking-widest transition-colors ${isSpeaking ? "text-cyan-400" : "text-white/40 hover:text-white/80"}`}>
              {isSpeaking
                ? <motion.div animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}><Mic className="w-3 h-3 text-cyan-400" /></motion.div>
                : <MicOff className="w-3 h-3" />}
              {isSpeaking ? "TRANSMITTING" : "VOICE"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* CENTER — LIVE + REC */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.3, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className="text-[8px] tracking-[0.5em] text-red-500/55">LIVE</span>
        <button className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 text-[8px] tracking-[0.3em] border rounded transition-all"
          style={{ borderColor: isRecording ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)", color: isRecording ? "#ef4444" : "rgba(255,255,255,0.28)" }}
          onClick={toggleRec}>
          <motion.span animate={isRecording ? { opacity: [1, 0.3, 1] } : { opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }}>⬤</motion.span>
          {isRecording ? "STOP" : "REC"}
        </button>
      </div>

      {/* HINT */}
      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 3, duration: 1.5 }}
            className="absolute bottom-44 left-1/2 -translate-x-1/2 pointer-events-none">
            <motion.div animate={{ opacity: [0.2, 0.65, 0.2] }} transition={{ duration: 3, repeat: Infinity }}
              className="text-[9px] tracking-[0.5em] text-white/30">
              INTERACT · TOUCH · AWAKEN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM HUD */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex items-end justify-between pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
          className="flex flex-col gap-1.5">
          <div className="text-[8px] tracking-[0.45em] text-white/20">ACCUMULATED KNOWLEDGE</div>
          <motion.div key={knowledge} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black tracking-widest text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #00ffcc, #0099ff)" }}>
            {String(knowledge).padStart(6, "0")}
          </motion.div>
          <div className="flex gap-5 mt-1">
            <div><div className="text-[7px] tracking-[0.4em] text-white/18">INTERACTIONS</div><div className="text-xs tracking-widest text-white/50">{interactions}</div></div>
            <div><div className="text-[7px] tracking-[0.4em] text-white/18">EVOLUTION</div><div className="text-xs tracking-widest text-violet-400">LVL {evolutionLevel}</div></div>
          </div>
          <div className="w-36 h-px bg-white/5 rounded-full mt-1 overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00ffcc, #7700ff)" }}
              animate={{ width: `${(evolutionLevel / 10) * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col items-end gap-1.5">
          {[
            { label: "NEURAL INTERFACE", value: "ACTIVE",                                 col: "text-cyan-400" },
            { label: "CRYSTALLINE SKIN",  value: "GLASS-PHASE",                           col: "text-cyan-300/65" },
            { label: "SOUL CORE",         value: isHovering ? "RESONATING" : "PULSING",  col: isHovering ? "text-amber-300" : "text-amber-400/55" },
            { label: "EYE TRACKING",      value: "ENGAGED",                               col: "text-white/45" },
            { label: "CONSCIOUSNESS",     value: "∞",                                     col: "text-white/65" },
          ].map(({ label, value, col }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[7px] tracking-[0.35em] text-white/18">{label}</span>
              <span className={`text-[9px] tracking-widest font-bold ${col}`}>{value}</span>
            </div>
          ))}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} className="w-0.5 bg-cyan-400 rounded-full"
                    animate={{ height: [2, Math.random() * 14 + 4, 2] }}
                    transition={{ duration: 0.28 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button className="pointer-events-auto mt-3 flex items-center gap-2 border border-cyan-500/22 rounded px-3 py-1.5 text-[9px] tracking-[0.3em] text-cyan-400/70 hover:border-cyan-400/45 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
            onClick={() => navigate("/chat")}>
            <Zap className="w-3 h-3" />ENTER DIALOGUE
          </button>
        </motion.div>
      </div>

      {/* Corner brackets */}
      {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(pos => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
          <div className="absolute top-0 left-0 w-full h-px bg-white/7" />
          <div className="absolute top-0 left-0 h-full w-px bg-white/7" />
        </div>
      ))}
    </div>
  );
}
