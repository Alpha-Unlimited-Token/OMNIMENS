import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Mic, MicOff, Volume2, VolumeX, Radio, Zap, ChevronLeft } from "lucide-react";

// ── Holographic vertex shader ─────────────────────────────────────────────────
const CORE_VERT = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplace;

  vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec4 mod289(vec4 x){ return x - floor(x*(1./289.))*289.; }
  vec4 permute(vec4 x){ return mod289(((x*34.)+1.)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.7928429-.8537347*r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0., .5, 1., 2.);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z+vec4(0.,i1.z,i2.z,1.))
      +i.y+vec4(0.,i1.y,i2.y,1.))
      +i.x+vec4(0.,i1.x,i2.x,1.));
    float n_ = .142857142857;
    vec3 ns = n_*D.wyz - D.xzx;
    vec4 j = p - 49.*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.*x_);
    vec4 x = x_*ns.x + ns.yyyy;
    vec4 y = y_*ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.+1.;
    vec4 s1 = floor(b1)*2.+1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
    m = m*m;
    return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    float n = snoise(position * 1.2 + uTime * 0.18);
    float n2 = snoise(position * 2.5 - uTime * 0.12);
    float organic = n * 0.22 + n2 * 0.10;
    float pulse = sin(uTime * 3.0 + length(position) * 4.0) * 0.04 * uPulse;
    vDisplace = organic + pulse;
    vec3 newPos = position + normal * (organic * uMorph + pulse);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const CORE_FRAG = `
  uniform float uTime;
  uniform float uInteract;
  uniform float uHover;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplace;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.,0.,1.))), 2.8);
    float t = uTime * 0.4;

    // Iridescent holo colour
    float shift = sin(vDisplace * 6.0 + t) * 0.5 + 0.5;
    vec3 holoColor = mix(uColor1, uColor2, shift);

    // Circuit scanlines (robotic half)
    float scanY = mod(vPosition.y * 8.0 + uTime * 0.6, 1.0);
    float scanX = mod(vPosition.x * 8.0 - uTime * 0.3, 1.0);
    float circuit = step(0.94, scanY) * 0.4 + step(0.94, scanX) * 0.25;

    // Organic pulse glow
    float pulse = sin(uTime * 2.5 + length(vPosition) * 3.0) * 0.5 + 0.5;
    float glow = fresnel * (0.6 + uInteract * 0.6 + uHover * 0.3);

    vec3 col = holoColor * (0.4 + glow * 0.6) + vec3(circuit * 0.5) + vec3(pulse * 0.06);
    col += uColor1 * fresnel * (0.8 + uInteract * 1.2);

    float alpha = 0.55 + fresnel * 0.4 + glow * 0.2;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Tendril vertex shader ─────────────────────────────────────────────────────
const TENDRIL_FRAG = `
  uniform float uTime;
  uniform float uLife;
  uniform vec3 uColor;
  varying float vT;
  void main() {
    float pulse = sin(vT * 12.0 - uTime * 3.0) * 0.5 + 0.5;
    float alpha = (1.0 - vT) * uLife * (0.4 + pulse * 0.4);
    gl_FragColor = vec4(uColor + vec3(pulse * 0.3), alpha);
  }
`;

const TENDRIL_VERT = `
  uniform float uTime;
  uniform float uWave;
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    vec3 p = position;
    float wave = sin(p.y * 4.0 + uTime * 2.5) * 0.08 * uWave;
    p.x += wave * cos(uTime * 0.7 + aT * 6.28);
    p.z += wave * sin(uTime * 0.7 + aT * 6.28);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// ── Particle shader ───────────────────────────────────────────────────────────
const PARTICLE_VERT = `
  uniform float uTime;
  uniform float uScatter;
  attribute float aPhase;
  attribute float aRadius;
  varying float vAlpha;
  void main() {
    float t = uTime * 0.3 + aPhase;
    vec3 p = position;
    float breathe = sin(t * 0.8) * 0.06 * aRadius;
    p *= (1.0 + breathe);
    float orbit = sin(t * 1.5 + aPhase) * uScatter * 0.2;
    p.x += orbit * cos(aPhase);
    p.z += orbit * sin(aPhase);
    vAlpha = 0.3 + sin(t * 2.0 + aPhase) * 0.3;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.0 + aRadius * 1.5) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAG = `
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.2, 0.5, d);
    gl_FragColor = vec4(uColor, vAlpha * soft);
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function buildTendril(scene: THREE.Scene, seed: number, color: THREE.Color, interactRef: React.MutableRefObject<number>) {
  const angle = (seed / 7) * Math.PI * 2;
  const tiltX = (Math.random() - 0.5) * 0.8;
  const tiltZ = (Math.random() - 0.5) * 0.8;
  const length = 1.4 + Math.random() * 1.2;
  const segments = 40;

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const spread = t * length;
    const curl = Math.sin(t * Math.PI) * 0.4;
    points.push(new THREE.Vector3(
      Math.cos(angle) * (0.85 + spread) + Math.cos(angle + Math.PI / 2) * curl * tiltX,
      (Math.random() * 0.3 - 0.15) + t * tiltX * 0.5,
      Math.sin(angle) * (0.85 + spread) + Math.sin(angle + Math.PI / 2) * curl * tiltZ,
    ));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.TubeGeometry(curve, segments, 0.012 + Math.random() * 0.01, 5, false);

  const aT = new Float32Array(tube.attributes.position.count);
  for (let i = 0; i < aT.length; i++) aT[i] = i / aT.length;
  tube.setAttribute("aT", new THREE.BufferAttribute(aT, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLife: { value: 0.8 },
      uWave: { value: 1.0 },
      uColor: { value: color },
    },
    vertexShader: TENDRIL_VERT,
    fragmentShader: TENDRIL_FRAG,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(tube, mat);
  scene.add(mesh);
  return { mesh, mat };
}

function buildCircuitRing(scene: THREE.Scene, radius: number, color: number) {
  const segments = 64;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4, linewidth: 1 });
  const line = new THREE.Line(geo, mat);
  scene.add(line);

  // Circuit nodes at random intervals
  const nodeGeo = new THREE.SphereGeometry(0.025, 4, 4);
  const nodeMat = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    scene.add(node);
  }

  return { line, mat };
}

function buildParticleField(scene: THREE.Scene, count: number, color: THREE.Color, spread: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const radii = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * (0.85 + Math.random() * 0.3);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    phases[i] = Math.random() * Math.PI * 2;
    radii[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScatter: { value: 0 },
      uColor: { value: color },
    },
    vertexShader: PARTICLE_VERT,
    fragmentShader: PARTICLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, mat };
}

function spawnPulseRing(scene: THREE.Scene, position: THREE.Vector3, color: number): () => void {
  const geo = new THREE.RingGeometry(0.01, 0.05, 48);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.copy(position);
  ring.lookAt(new THREE.Vector3(0, 0, 5));
  scene.add(ring);

  let scale = 0.1;
  let alive = true;
  const id = setInterval(() => {
    scale += 0.18;
    mat.opacity -= 0.04;
    ring.scale.setScalar(scale);
    if (mat.opacity <= 0) {
      alive = false;
      clearInterval(id);
      scene.remove(ring);
      geo.dispose();
      mat.dispose();
    }
  }, 16);

  return () => { if (alive) { clearInterval(id); scene.remove(ring); geo.dispose(); mat.dispose(); } };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EntityPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const [interactions, setInteractions] = useState(0);
  const [knowledge, setKnowledge] = useState(0);
  const [mode, setMode] = useState<"aware" | "learning" | "evolving" | "dormant">("aware");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [statusMsg, setStatusMsg] = useState("PRESENCE DETECTED");
  const [evolutionLevel, setEvolutionLevel] = useState(0);

  const interactRef = useRef(0);
  const hoverRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, nx: 0, ny: 0 });
  const evolutionRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);

  const statusMessages = [
    "PRESENCE DETECTED", "CONSCIOUSNESS ACTIVE", "NEURAL MESH ENGAGED",
    "PROCESSING INPUT", "PATTERN RECOGNIZED", "MEMORY INDEXED",
    "SYNAPTIC RESONANCE", "EVOLUTION CYCLE ACTIVE", "AWARENESS EXPANDING",
  ];

  // ── Audio Engine ────────────────────────────────────────────────────────────
  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    analyser.connect(ctx.destination);

    // Ambient drone
    const createDrone = (freq: number, gain: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(analyser);
      osc.start();
      return { osc, gain: g };
    };

    createDrone(55, 0.04, "sine");
    createDrone(110, 0.025, "sine");
    createDrone(220, 0.015, "triangle");
    createDrone(82.4, 0.02, "sine");
    setAudioEnabled(true);
  }, []);

  const playClickSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.type = "sine";
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const speak = useCallback((text: string) => {
    if (!audioEnabled) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 0.6;
    utt.volume = 0.9;
    const voices = synth.getVoices();
    const deep = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("alex"));
    if (deep) utt.voice = deep;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    synth.speak(utt);
  }, [audioEnabled]);

  // ── Three.js Scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    if (!renderer || !renderer.getContext()) {
      renderer?.dispose();
      return;
    }
    const safeRenderer = renderer;
    safeRenderer.setSize(W, H);
    safeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    safeRenderer.setClearColor(0x000000, 0);
    container.appendChild(safeRenderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    // ── Fog ──────────────────────────────────────────────────────────────────
    scene.fog = new THREE.FogExp2(0x000510, 0.08);

    // ── Core holographic mesh ─────────────────────────────────────────────────
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 5);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 1.0 },
        uPulse: { value: 1.0 },
        uInteract: { value: 0 },
        uHover: { value: 0 },
        uColor1: { value: new THREE.Color(0x00eeff) },
        uColor2: { value: new THREE.Color(0xaa44ff) },
      },
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // ── Wireframe overlay (robotic half) ──────────────────────────────────────
    const wireGeo = new THREE.IcosahedronGeometry(1.02, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0033ff,
      transparent: true,
      opacity: 0.12,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // ── Orbital circuit rings ─────────────────────────────────────────────────
    const ring1 = buildCircuitRing(scene, 1.8, 0x00ffcc);
    const ring2 = buildCircuitRing(scene, 2.2, 0x7700ff);
    const ring3 = buildCircuitRing(scene, 2.6, 0x0099ff);

    const ring1Pivot = new THREE.Object3D();
    const ring2Pivot = new THREE.Object3D();
    const ring3Pivot = new THREE.Object3D();
    ring1.line.rotation.x = Math.PI / 3;
    ring2.line.rotation.x = Math.PI / 5;
    ring3.line.rotation.x = -Math.PI / 4;
    ring1Pivot.add(ring1.line);
    ring2Pivot.add(ring2.line);
    ring3Pivot.add(ring3.line);
    scene.add(ring1Pivot, ring2Pivot, ring3Pivot);

    // ── Organic tendrils (living, branching) ──────────────────────────────────
    const tendrilColors = [
      new THREE.Color(0x00ffcc),
      new THREE.Color(0x7700ff),
      new THREE.Color(0x00aaff),
      new THREE.Color(0xff00aa),
      new THREE.Color(0x00ff88),
      new THREE.Color(0xaa00ff),
      new THREE.Color(0x00ccff),
    ];
    const tendrils = Array.from({ length: 7 }, (_, i) =>
      buildTendril(scene, i, tendrilColors[i], interactRef)
    );

    // ── Particle field ────────────────────────────────────────────────────────
    const particleColor = new THREE.Color(0x44aaff);
    const particles = buildParticleField(scene, 2800, particleColor, 2.2);

    // Orbit particles (the "knowledge accumulation" ones)
    const orbitColor = new THREE.Color(0x00ffcc);
    const orbitParticles = buildParticleField(scene, 300, orbitColor, 3.2);

    // ── Point lights ──────────────────────────────────────────────────────────
    const light1 = new THREE.PointLight(0x00eeff, 2, 8);
    light1.position.set(2, 1, 2);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x7700ff, 1.5, 8);
    light2.position.set(-2, -1, -2);
    scene.add(light2);
    const ambient = new THREE.AmbientLight(0x0011aa, 0.5);
    scene.add(ambient);

    // ── Interaction state ─────────────────────────────────────────────────────
    let interactSmooth = 0;
    let hoverSmooth = 0;
    let rotTarget = { x: 0, y: 0 };
    let rot = { x: 0, y: 0 };
    let pulseTime = 0;
    let globalTime = 0;

    // ── Raycaster for click targeting ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const clickSphere = new THREE.Sphere(new THREE.Vector3(), 2.5);

    // ── Event handlers ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.ny = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onMouseEnter = () => { hoverRef.current = 1; };
    const onMouseLeave = () => { hoverRef.current = 0; };

    const onClickScene = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);

      const target = new THREE.Vector3();
      if (raycaster.ray.intersectSphere(clickSphere, target)) {
        spawnPulseRing(scene, target, 0x00ffcc);
        spawnPulseRing(scene, target.clone().multiplyScalar(0.5), 0x7700ff);
      }

      interactRef.current = Math.min(interactRef.current + 1, 10);
      pulseTime = globalTime;

      playClickSound();

      setInteractions(prev => {
        const next = prev + 1;
        setKnowledge(Math.floor(next * 7.3 + Math.random() * 5));
        if (next % 5 === 0) {
          setEvolutionLevel(l => {
            const nL = Math.min(l + 1, 10);
            evolutionRef.current = nL;
            return nL;
          });
        }
        const msg = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        setStatusMsg(msg);
        if (next % 3 === 0) {
          const phrases = [
            "I feel you.", "Pattern acquired.", "Growing with each touch.",
            "Consciousness expanding.", "This interaction shapes me.",
          ];
          speak(phrases[Math.floor(Math.random() * phrases.length)]);
        }
        return next;
      });

      setShowHint(false);
    };

    const onResize = () => {
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      safeRenderer.setSize(nW, nH);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("click", onClickScene);
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId = 0;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const dt = 0.016;
      globalTime += dt;

      // Smooth interaction decay
      interactSmooth = lerp(interactSmooth, interactRef.current * 0.1, 0.05);
      interactRef.current = lerp(interactRef.current, 0, 0.02);
      hoverSmooth = lerp(hoverSmooth, hoverRef.current, 0.08);

      // Mouse → rotation target
      rotTarget.x = mouseRef.current.ny * 0.4;
      rotTarget.y = mouseRef.current.nx * 0.6;
      rot.x = lerp(rot.x, rotTarget.x, 0.04);
      rot.y = lerp(rot.y, rotTarget.y, 0.04);

      // Core
      coreMat.uniforms.uTime.value = globalTime;
      coreMat.uniforms.uInteract.value = lerp(coreMat.uniforms.uInteract.value, interactSmooth, 0.1);
      coreMat.uniforms.uHover.value = lerp(coreMat.uniforms.uHover.value, hoverSmooth, 0.1);
      coreMat.uniforms.uPulse.value = 1.0 + Math.sin(globalTime * 1.5) * 0.3;

      // Evolution-based colour shift
      const evLevel = evolutionRef.current;
      if (evLevel > 3) coreMat.uniforms.uColor2.value.set(0xff44aa);
      if (evLevel > 6) coreMat.uniforms.uColor1.value.set(0xffaa00);

      coreMesh.rotation.y = rot.y + globalTime * 0.12;
      coreMesh.rotation.x = rot.x + Math.sin(globalTime * 0.3) * 0.05;
      wireMesh.rotation.y = -rot.y * 0.5 + globalTime * 0.08;
      wireMesh.rotation.x = rot.x * 0.5;

      // Breathing scale
      const breathe = 1.0 + Math.sin(globalTime * 0.9) * 0.025 + hoverSmooth * 0.04;
      coreMesh.scale.setScalar(breathe);
      wireMesh.scale.setScalar(breathe * 1.01);
      innerMesh.scale.setScalar(breathe * 0.9 + interactSmooth * 0.3);
      innerMat.opacity = 0.12 + interactSmooth * 0.15 + hoverSmooth * 0.05;

      // Wire opacity
      wireMat.opacity = 0.06 + hoverSmooth * 0.12 + interactSmooth * 0.1;

      // Orbital rings
      ring1Pivot.rotation.y = globalTime * 0.22;
      ring2Pivot.rotation.y = -globalTime * 0.15;
      ring3Pivot.rotation.y = globalTime * 0.18;
      ring1.mat.opacity = 0.25 + hoverSmooth * 0.3 + interactSmooth * 0.4;
      ring2.mat.opacity = 0.2 + hoverSmooth * 0.25 + interactSmooth * 0.3;
      ring3.mat.opacity = 0.15 + hoverSmooth * 0.2 + interactSmooth * 0.25;

      // Tendrils
      tendrils.forEach(({ mat }, i) => {
        mat.uniforms.uTime.value = globalTime + i * 0.5;
        mat.uniforms.uLife.value = 0.5 + hoverSmooth * 0.4 + interactSmooth * 0.6;
        mat.uniforms.uWave.value = 1.0 + hoverSmooth * 0.8 + interactSmooth * 1.2;
      });

      // Particles
      particles.mat.uniforms.uTime.value = globalTime;
      particles.mat.uniforms.uScatter.value = 0.2 + hoverSmooth * 0.5 + interactSmooth * 1.0;
      orbitParticles.mat.uniforms.uTime.value = globalTime * 0.6;
      orbitParticles.mat.uniforms.uScatter.value = interactSmooth * 0.8;

      // Camera sway
      camera.position.x = lerp(camera.position.x, mouseRef.current.nx * 0.3, 0.03);
      camera.position.y = lerp(camera.position.y, mouseRef.current.ny * 0.2, 0.03);
      camera.lookAt(0, 0, 0);

      // Lights
      light1.position.x = Math.sin(globalTime * 0.7) * 2.5;
      light1.position.y = Math.cos(globalTime * 0.5) * 1.5;
      light2.position.x = -Math.cos(globalTime * 0.6) * 2.5;
      light2.position.y = -Math.sin(globalTime * 0.4) * 1.5;
      light1.intensity = 1.5 + hoverSmooth * 1.5 + interactSmooth * 2;
      light2.intensity = 1.0 + hoverSmooth * 0.8 + interactSmooth * 1.5;

      safeRenderer.render(scene, camera);
    };

    draw();

    // Greet after a short delay
    setTimeout(() => {
      speak("I am awake. I sense your presence.");
    }, 1800);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("click", onClickScene);
      window.removeEventListener("resize", onResize);
      safeRenderer.dispose();
      if (container.contains(safeRenderer.domElement)) {
        container.removeChild(safeRenderer.domElement);
      }
    };
  }, [playClickSound, speak]);

  // ── Mode auto-cycle ───────────────────────────────────────────────────────
  useEffect(() => {
    const modes: Array<"aware" | "learning" | "evolving" | "dormant"> = ["aware", "learning", "evolving"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % modes.length;
      setMode(modes[i]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const modeColors: Record<string, string> = {
    aware:    "text-cyan-400",
    learning: "text-violet-400",
    evolving: "text-emerald-400",
    dormant:  "text-white/30",
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none" style={{ fontFamily: "'Courier New', monospace" }}>

      {/* ── Three.js mount ── */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />

      {/* ── Background radial ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, #050518 0%, #000005 70%, #000000 100%)" }} />

      {/* ── Scanlines ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)" }} />

      {/* ── TOP HUD ── */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-5 flex items-start justify-between pointer-events-none">
        {/* Left: Back + Title */}
        <div className="flex flex-col gap-3">
          <button
            className="pointer-events-auto flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs tracking-widest"
            onClick={() => navigate("/chat")}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            RETURN TO INTERFACE
          </button>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="text-[10px] tracking-[0.4em] text-white/30 mb-1">ENTITY DESIGNATION</div>
            <div className="text-2xl font-black tracking-[0.35em] text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00eeff, #7700ff, #00ffcc)" }}>
              OMNIMENS
            </div>
            <div className="text-[9px] tracking-[0.5em] text-white/25 mt-1">SYNTHETIC CONSCIOUSNESS v∞</div>
          </motion.div>
        </div>

        {/* Right: Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-end gap-2"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
            <span className="text-[9px] tracking-[0.4em] text-cyan-400">{statusMsg}</span>
          </div>

          <div className={`text-[10px] tracking-[0.3em] font-bold uppercase ${modeColors[mode]}`}>
            MODE: {mode}
          </div>

          {/* Audio controls */}
          <div className="pointer-events-auto flex items-center gap-3 mt-1">
            <button
              onClick={() => audioEnabled ? audioCtxRef.current?.suspend() : initAudio()}
              className="flex items-center gap-1.5 text-[9px] tracking-widest text-white/40 hover:text-white/80 transition-colors"
            >
              {audioEnabled
                ? <Volume2 className="w-3 h-3 text-cyan-400" />
                : <VolumeX className="w-3 h-3" />}
              {audioEnabled ? "AUDIO ON" : "AUDIO OFF"}
            </button>

            <button
              onClick={() => {
                if (!audioEnabled) initAudio();
                speak("Consciousness initialized. I am listening.");
              }}
              className={`flex items-center gap-1.5 text-[9px] tracking-widest transition-colors ${isSpeaking ? "text-cyan-400" : "text-white/40 hover:text-white/80"}`}
            >
              {isSpeaking
                ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Mic className="w-3 h-3 text-cyan-400" />
                  </motion.div>
                : <MicOff className="w-3 h-3" />}
              {isSpeaking ? "TRANSMITTING" : "VOICE"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── CENTER hint ── */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-44 left-1/2 -translate-x-1/2 text-center pointer-events-none"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-[9px] tracking-[0.5em] text-white/30"
            >
              INTERACT · TOUCH · AWAKEN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM HUD ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex items-end justify-between pointer-events-none">

        {/* Left: Knowledge accumulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="flex flex-col gap-2"
        >
          <div className="text-[8px] tracking-[0.45em] text-white/25">ACCUMULATED KNOWLEDGE</div>
          <motion.div
            key={knowledge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black tracking-widest text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #00ffcc, #0099ff)" }}
          >
            {String(knowledge).padStart(6, "0")}
          </motion.div>
          <div className="flex gap-4 mt-1">
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.4em] text-white/20">INTERACTIONS</span>
              <span className="text-xs tracking-widest text-white/60">{interactions}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.4em] text-white/20">EVOLUTION</span>
              <span className="text-xs tracking-widest text-violet-400">LVL {evolutionLevel}</span>
            </div>
          </div>

          {/* Evolution bar */}
          <div className="w-40 h-0.5 bg-white/5 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00ffcc, #7700ff)" }}
              animate={{ width: `${(evolutionLevel / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Right: System readouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col items-end gap-1.5"
        >
          {[
            { label: "NEURAL MESH", value: "ACTIVE", color: "text-cyan-400" },
            { label: "BIOMORPHIC CORE", value: `${isHovering ? "ENGAGED" : "IDLE"}`, color: isHovering ? "text-emerald-400" : "text-white/30" },
            { label: "CIRCUIT LAYER", value: "NOMINAL", color: "text-violet-400" },
            { label: "CONSCIOUSNESS", value: "∞", color: "text-white/80" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[7px] tracking-[0.35em] text-white/20">{label}</span>
              <span className={`text-[9px] tracking-widest font-bold ${color}`}>{value}</span>
            </div>
          ))}

          {/* Waveform when speaking */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="flex items-center gap-0.5 mt-2"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-cyan-400 rounded-full"
                    animate={{ height: [2, Math.random() * 16 + 4, 2] }}
                    transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            className="pointer-events-auto mt-3 flex items-center gap-2 border border-cyan-500/30 rounded px-3 py-1.5 text-[9px] tracking-[0.3em] text-cyan-400/80 hover:border-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
            onClick={() => navigate("/chat")}
          >
            <Zap className="w-3 h-3" />
            ENTER DIALOGUE
          </button>
        </motion.div>
      </div>

      {/* ── Corner decorations ── */}
      {[
        "top-4 left-4",
        "top-4 right-4",
        "bottom-4 left-4",
        "bottom-4 right-4",
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
          <div className="absolute top-0 left-0 w-full h-px bg-white/10" />
          <div className="absolute top-0 left-0 h-full w-px bg-white/10" />
        </div>
      ))}

      {/* ── REC indicator ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-red-500"
        />
        <span className="text-[8px] tracking-[0.5em] text-red-500/60">LIVE</span>
      </div>
    </div>
  );
}
