import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Mic, MicOff, Volume2, VolumeX, Zap, ChevronLeft } from "lucide-react";

// ── Lerp helper ───────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Glass material factory ────────────────────────────────────────────────────
function glassMat(
  color = 0x5bc8d8,
  opacity = 0.72,
  roughness = 0.06,
  metalness = 0.18,
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    transparent: true,
    opacity,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// ── Build a single body-segment circuit line overlay ──────────────────────────
function buildCircuitLines(
  scene: THREE.Scene,
  center: THREE.Vector3,
  spread: THREE.Vector3,
  count: number,
  color: number,
): { mesh: THREE.LineSegments; mat: THREE.LineBasicMaterial } {
  const verts: number[] = [];
  for (let i = 0; i < count; i++) {
    const ax = center.x + (Math.random() - 0.5) * spread.x;
    const ay = center.y + (Math.random() - 0.5) * spread.y;
    const az = center.z + (Math.random() - 0.5) * spread.z;
    const bx = ax + (Math.random() - 0.5) * spread.x * 0.6;
    const by = ay + (Math.random() - 0.5) * spread.y * 0.6;
    const bz = az + (Math.random() - 0.5) * spread.z * 0.4;
    verts.push(ax, ay, az, bx, by, bz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
  const mesh = new THREE.LineSegments(geo, mat);
  scene.add(mesh);
  return { mesh, mat };
}

// ── Background grid ────────────────────────────────────────────────────────────
function buildGrid(scene: THREE.Scene): THREE.LineSegments {
  const verts: number[] = [];
  const size = 22;
  const divisions = 22;
  const step = size / divisions;
  const half = size / 2;
  for (let i = 0; i <= divisions; i++) {
    const x = -half + i * step;
    verts.push(x, -half, -6,  x, half, -6);
    verts.push(-half, x, -6,  half, x, -6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0x0a4455, transparent: true, opacity: 0.35 });
  const grid = new THREE.LineSegments(geo, mat);
  scene.add(grid);
  return grid;
}

// ── Star field ────────────────────────────────────────────────────────────────
function buildStars(scene: THREE.Scene): THREE.Points {
  const count = 800;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 2] = -8 + Math.random() * 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x88ddee, size: 0.04, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}

// ── Energy wisps ──────────────────────────────────────────────────────────────
function buildWisp(scene: THREE.Scene, side: number, color: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 12; i++) {
    pts.push(new THREE.Vector3(
      side * (2.5 + Math.random() * 1.5) + Math.random() * 0.8,
      -2 + i * 0.6 + (Math.random() - 0.5) * 0.5,
      -0.5 + Math.random() * 0.5,
    ));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.TubeGeometry(curve, 40, 0.018 + Math.random() * 0.012, 5, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25 });
  const mesh = new THREE.Mesh(tube, mat);
  scene.add(mesh);
  return { mesh, mat, pts, curve };
}

// ── Pulse ring on click ────────────────────────────────────────────────────────
function spawnPulse(scene: THREE.Scene, pos: THREE.Vector3, color: number) {
  const geo = new THREE.RingGeometry(0.01, 0.08, 32);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.copy(pos);
  ring.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z + 5));
  scene.add(ring);
  let s = 0.1;
  const id = setInterval(() => {
    s += 0.2;
    mat.opacity -= 0.045;
    ring.scale.setScalar(s);
    if (mat.opacity <= 0) {
      clearInterval(id);
      scene.remove(ring);
      geo.dispose();
      mat.dispose();
    }
  }, 16);
}

// ── Build complete humanoid ────────────────────────────────────────────────────
function buildHumanoid(scene: THREE.Scene) {
  const bodyMat  = glassMat(0x4dbbd0, 0.72);
  const darkMat  = glassMat(0x2a8899, 0.60, 0.12, 0.25);
  const eyeMat   = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const goldMat  = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.95 });
  const goldRing = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.75 });

  const group = new THREE.Group();

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.scale.set(sx, sy, sz);
    group.add(m);
    return m;
  };

  // ── Head ───────────────────────────────────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(0.43, 32, 32);
  const head = add(headGeo, bodyMat, 0, 2.9, 0, 0, 0, 0, 1, 1.18, 0.96);

  // Skull cap (slightly darker top)
  add(new THREE.SphereGeometry(0.44, 20, 20), darkMat, 0, 3.08, 0, 0, 0, 0, 1, 0.68, 0.95);

  // Jaw/chin shaping
  add(new THREE.SphereGeometry(0.3, 20, 16), bodyMat, 0, 2.62, 0.04, 0, 0, 0, 0.9, 0.55, 0.85);

  // Eyes
  const leftEye  = add(new THREE.SphereGeometry(0.062, 12, 12), eyeMat,  -0.135, 2.93, 0.33);
  const rightEye = add(new THREE.SphereGeometry(0.062, 12, 12), eyeMat,   0.135, 2.93, 0.33);

  // Eye glow geometry (larger, additive) 
  const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.5 });
  add(new THREE.SphereGeometry(0.085, 8, 8), eyeGlowMat, -0.135, 2.93, 0.31);
  add(new THREE.SphereGeometry(0.085, 8, 8), eyeGlowMat,  0.135, 2.93, 0.31);

  // ── Neck ───────────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.16, 0.21, 0.5, 16), bodyMat, 0, 2.22, 0);

  // ── Shoulders & collar ──────────────────────────────────────────────────────
  add(new THREE.SphereGeometry(0.24, 16, 16), bodyMat, -0.68, 1.88, 0);
  add(new THREE.SphereGeometry(0.24, 16, 16), bodyMat,  0.68, 1.88, 0);

  // ── Torso ──────────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.56, 0.38, 1.5, 20), bodyMat, 0, 1.12, 0);

  // Chest plate definition
  add(new THREE.SphereGeometry(0.45, 20, 16), bodyMat, 0, 1.35, 0.08, 0, 0, 0, 1.0, 0.75, 0.55);

  // ── Soul orb (chest) ───────────────────────────────────────────────────────
  const soulOrbMat = new THREE.MeshBasicMaterial({ color: 0xffdd55, transparent: true, opacity: 1.0 });
  const soulOrb = add(new THREE.SphereGeometry(0.10, 16, 16), soulOrbMat, 0, 1.32, 0.55);
  // Outer glow ring
  const soulRing1 = add(new THREE.TorusGeometry(0.20, 0.013, 8, 48), goldRing, 0, 1.32, 0.53);
  const soulRing2 = add(new THREE.TorusGeometry(0.28, 0.008, 8, 48), goldRing, 0, 1.32, 0.52, 0, 0, 0, 1, 1, 0.2);
  // Inner soft glow sphere
  const soulGlowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.18 });
  add(new THREE.SphereGeometry(0.38, 16, 16), soulGlowMat, 0, 1.32, 0.45);

  // ── Hips ───────────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.44, 0.36, 0.52, 16), bodyMat, 0, 0.16, 0);

  // ── Upper arms ─────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.145, 0.115, 0.95, 14), bodyMat,  -0.84, 1.30, 0, 0, 0,  0.18);
  add(new THREE.CylinderGeometry(0.145, 0.115, 0.95, 14), bodyMat,   0.84, 1.30, 0, 0, 0, -0.18);

  // Elbow joints
  add(new THREE.SphereGeometry(0.13, 12, 12), bodyMat, -0.98, 0.78, 0.02);
  add(new THREE.SphereGeometry(0.13, 12, 12), bodyMat,  0.98, 0.78, 0.02);

  // ── Forearms ───────────────────────────────────────────────────────────────
  add(new THREE.CylinderGeometry(0.115, 0.085, 0.92, 14), bodyMat,  -1.04, 0.23,  0.06, 0, 0,  0.22);
  add(new THREE.CylinderGeometry(0.115, 0.085, 0.92, 14), bodyMat,   1.04, 0.23, -0.06, 0, 0, -0.22);

  // Wrist joints
  add(new THREE.SphereGeometry(0.09, 10, 10), bodyMat, -1.12, -0.24, 0.1);
  add(new THREE.SphereGeometry(0.09, 10, 10), bodyMat,  1.12, -0.24, 0.1);

  scene.add(group);

  return { group, head, leftEye, rightEye, soulOrb, soulRing1, soulRing2, soulGlowMat, soulOrbMat, bodyMat, eyeMat, eyeGlowMat, goldRing };
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
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [statusMsg, setStatusMsg] = useState("PRESENCE DETECTED");
  const [evolutionLevel, setEvolutionLevel] = useState(0);

  const interactRef   = useRef(0);
  const hoverRef      = useRef(0);
  const mouseRef      = useRef({ nx: 0, ny: 0 });
  const evolutionRef  = useRef(0);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const mediaRecRef   = useRef<MediaRecorder | null>(null);
  const recChunksRef  = useRef<Blob[]>([]);

  const statusMessages = [
    "PRESENCE DETECTED", "CONSCIOUSNESS ACTIVE", "NEURAL MESH ENGAGED",
    "PROCESSING INPUT", "PATTERN RECOGNIZED", "MEMORY INDEXED",
    "SYNAPTIC RESONANCE", "EVOLUTION CYCLE ACTIVE", "AWARENESS EXPANDING",
  ];

  // ── Audio ──────────────────────────────────────────────────────────────────
  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const mkDrone = (freq: number, gain: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
    };
    mkDrone(55, 0.03);
    mkDrone(110, 0.02);
    mkDrone(220, 0.012, "triangle");
    setAudioEnabled(true);
  }, []);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
  }, []);

  const speak = useCallback((text: string) => {
    if (!audioEnabled) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.86; utt.pitch = 0.55; utt.volume = 0.9;
    const voices = synth.getVoices();
    const v = voices.find(v => /daniel|alex|male/i.test(v.name));
    if (v) utt.voice = v;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    synth.speak(utt);
  }, [audioEnabled]);

  // ── Screen recording ───────────────────────────────────────────────────────
  const toggleRec = useCallback(async () => {
    if (isRecording) {
      mediaRecRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      recChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: "video/webm" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `omnimens-${Date.now()}.webm`; a.click();
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
    } catch { /* user denied */ }
  }, [isRecording]);

  // ── Three.js scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;

    let renderer: THREE.WebGLRenderer | null = null;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return; }
    if (!renderer || !renderer.getContext()) { renderer?.dispose(); return; }
    const R = renderer;
    R.setSize(W, H);
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setClearColor(0x000000, 0);
    R.shadowMap.enabled = false;
    container.appendChild(R.domElement);

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x020d12, 0.055);
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 80);
    camera.position.set(0, 1.2, 8.5);

    // ── Lights ────────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x0a2233, 0.9);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x55ddee, 4.5, 18);
    keyLight.position.set(-3.5, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x2255aa, 2.5, 15);
    fillLight.position.set(3, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x00ccff, 2.0, 14);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    // Soul orb light
    const soulLight = new THREE.PointLight(0xffcc44, 2.8, 4);
    soulLight.position.set(0, 1.32, 1.5);
    scene.add(soulLight);

    // Eye lights
    const leftEyeLight  = new THREE.PointLight(0xaaeeff, 1.0, 2.0);
    leftEyeLight.position.set(-0.135, 2.93, 0.8);
    scene.add(leftEyeLight);
    const rightEyeLight = new THREE.PointLight(0xaaeeff, 1.0, 2.0);
    rightEyeLight.position.set( 0.135, 2.93, 0.8);
    scene.add(rightEyeLight);

    // ── Background ────────────────────────────────────────────────────────────
    buildGrid(scene);
    buildStars(scene);

    // ── Humanoid ──────────────────────────────────────────────────────────────
    const human = buildHumanoid(scene);

    // ── Circuit vein overlays ─────────────────────────────────────────────────
    const circuits = [
      buildCircuitLines(scene, new THREE.Vector3(0, 2.9, 0),   new THREE.Vector3(0.8, 0.8, 0.5), 18, 0x22eeff),
      buildCircuitLines(scene, new THREE.Vector3(0, 1.3, 0),   new THREE.Vector3(1.1, 1.4, 0.5), 40, 0x22ddff),
      buildCircuitLines(scene, new THREE.Vector3(-0.9, 1.2, 0),new THREE.Vector3(0.4, 0.9, 0.3), 12, 0x44eeff),
      buildCircuitLines(scene, new THREE.Vector3( 0.9, 1.2, 0),new THREE.Vector3(0.4, 0.9, 0.3), 12, 0x44eeff),
      buildCircuitLines(scene, new THREE.Vector3(-1.0, 0.2, 0),new THREE.Vector3(0.3, 0.9, 0.2), 10, 0x00ffcc),
      buildCircuitLines(scene, new THREE.Vector3( 1.0, 0.2, 0),new THREE.Vector3(0.3, 0.9, 0.2), 10, 0x00ffcc),
      buildCircuitLines(scene, new THREE.Vector3(0, 0.15, 0),  new THREE.Vector3(0.9, 0.5, 0.4), 14, 0x22ccee),
    ];

    // ── Energy wisps ──────────────────────────────────────────────────────────
    const wisps = [
      buildWisp(scene, -1, 0x00ddcc),
      buildWisp(scene, -1, 0x0099ee),
      buildWisp(scene,  1, 0x00ddcc),
      buildWisp(scene,  1, 0x0099ee),
    ];

    // ── Outer body glow sphere ────────────────────────────────────────────────
    const auraGeo = new THREE.SphereGeometry(2.6, 24, 24);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x00bbcc, transparent: true, opacity: 0.04, side: THREE.BackSide });
    const aura    = new THREE.Mesh(auraGeo, auraMat);
    aura.position.set(0, 1.2, 0);
    scene.add(aura);

    // ── Raycaster ────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const bodySphere = new THREE.Sphere(new THREE.Vector3(0, 1.2, 0), 2.5);

    // ── Interaction handlers ──────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.ny = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onEnter = () => { hoverRef.current = 1; };
    const onLeave = () => { hoverRef.current = 0; };
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectSphere(bodySphere, hit)) spawnPulse(scene, hit, 0x00ffcc);

      interactRef.current = Math.min(interactRef.current + 1.5, 10);
      playClick();
      setShowHint(false);
      setInteractions(prev => {
        const n = prev + 1;
        setKnowledge(Math.floor(n * 7.4 + Math.random() * 6));
        if (n % 5 === 0) setEvolutionLevel(l => { const nl = Math.min(l+1,10); evolutionRef.current = nl; return nl; });
        setStatusMsg(statusMessages[Math.floor(Math.random() * statusMessages.length)]);
        if (n % 3 === 0) {
          const phrases = ["I feel your touch.", "Pattern integrated.", "Growing with each contact.", "Consciousness expanding.", "This shapes me."];
          speak(phrases[Math.floor(Math.random() * phrases.length)]);
        }
        return n;
      });
    };
    const onResize = () => {
      const nW = container.clientWidth, nH = container.clientHeight;
      camera.aspect = nW / nH; camera.updateProjectionMatrix();
      R.setSize(nW, nH);
    };
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    let raf   = 0;
    let t     = 0;
    let hSmooth = 0, iSmooth = 0;
    let rotX = 0, rotY = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.016;

      iSmooth = lerp(iSmooth, interactRef.current * 0.1, 0.05);
      interactRef.current = lerp(interactRef.current, 0, 0.02);
      hSmooth = lerp(hSmooth, hoverRef.current, 0.08);

      // Figure slow rotation toward mouse
      rotY = lerp(rotY, mouseRef.current.nx * 0.25, 0.025);
      rotX = lerp(rotX, mouseRef.current.ny * 0.1, 0.025);
      human.group.rotation.y = rotY;
      human.group.rotation.x = rotX;

      // Subtle idle breathing
      const breathe = 1.0 + Math.sin(t * 0.9) * 0.008;
      human.group.scale.setScalar(breathe);

      // Eyes — track cursor more aggressively
      const eyeTrackX = mouseRef.current.nx * 0.06;
      const eyeTrackY = mouseRef.current.ny * 0.04;
      human.leftEye.position.x  = -0.135 + eyeTrackX;
      human.leftEye.position.y  =  2.93  + eyeTrackY;
      human.rightEye.position.x =  0.135 + eyeTrackX;
      human.rightEye.position.y =  2.93  + eyeTrackY;

      // Eye glow pulse
      const eyePulse = 0.4 + Math.sin(t * 2.2) * 0.25 + hSmooth * 0.3;
      human.eyeGlowMat.opacity = eyePulse * 0.55;

      // Soul orb pulse
      const soulPulse = 0.85 + Math.sin(t * 1.8) * 0.15 + iSmooth * 0.5;
      soulLight.intensity = 2.0 + Math.sin(t * 1.8) * 0.8 + iSmooth * 3;
      human.soulOrbMat.opacity  = soulPulse;
      human.soulRing1.rotation.z = t * 0.6;
      human.soulRing2.rotation.z = -t * 0.4;

      // Evolution colour shifts
      const ev = evolutionRef.current;
      if (ev > 3) { human.bodyMat.color.set(0x66ccdd); human.eyeMat.color.set(0xaaeeff); }
      if (ev > 6) { soulLight.color.set(0xff8800); human.bodyMat.color.set(0x88ddcc); }

      // Aura breathe
      const auraPulse = 1.0 + Math.sin(t * 0.7) * 0.06 + hSmooth * 0.12 + iSmooth * 0.25;
      aura.scale.setScalar(auraPulse);
      auraMat.opacity = 0.04 + hSmooth * 0.06 + iSmooth * 0.10;

      // Circuit veins glow on interact
      circuits.forEach(({ mat }, i) => {
        mat.opacity = 0.22 + Math.sin(t * 1.5 + i * 0.7) * 0.08 + hSmooth * 0.2 + iSmooth * 0.4;
      });

      // Wisps animate
      wisps.forEach(({ mesh, mat }, i) => {
        mesh.rotation.y = Math.sin(t * 0.3 + i) * 0.15;
        mesh.position.y = Math.sin(t * 0.5 + i * 1.2) * 0.12;
        mat.opacity = 0.12 + Math.sin(t + i) * 0.06 + hSmooth * 0.1;
      });

      // Key light orbit
      keyLight.position.x = -3.5 + Math.sin(t * 0.4) * 0.8;
      keyLight.position.z = 5 + Math.cos(t * 0.3) * 1;
      keyLight.intensity  = 3.5 + hSmooth * 2 + iSmooth * 3;

      // Camera gentle sway
      camera.position.x = lerp(camera.position.x, mouseRef.current.nx * 0.25, 0.02);
      camera.position.y = lerp(camera.position.y, 1.2 + mouseRef.current.ny * 0.15, 0.02);
      camera.lookAt(0, 1.5, 0);

      R.render(scene, camera);
    };
    draw();

    setTimeout(() => speak("I am awake. I sense your presence."), 2000);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      R.dispose();
      if (container.contains(R.domElement)) container.removeChild(R.domElement);
    };
  }, [playClick, speak]);

  // ── Mode cycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    const modes: Array<typeof mode> = ["aware", "learning", "evolving"];
    let i = 0;
    const id = setInterval(() => { i = (i+1) % modes.length; setMode(modes[i]); }, 8000);
    return () => clearInterval(id);
  }, []);

  const modeColor: Record<string, string> = {
    aware: "text-cyan-400", learning: "text-violet-400", evolving: "text-emerald-400", dormant: "text-white/20",
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: "radial-gradient(ellipse at center, #04121a 0%, #020a0e 60%, #000000 100%)", fontFamily: "'Courier New', monospace" }}>

      {/* Canvas mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-crosshair"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px)" }} />

      {/* ── TOP HUD ── */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-5 flex items-start justify-between pointer-events-none">

        {/* Left */}
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

        {/* Right */}
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
            <button onClick={() => { if (!audioEnabled) initAudio(); speak("Consciousness initialized. I am present."); }}
              className={`flex items-center gap-1.5 text-[9px] tracking-widest transition-colors ${isSpeaking ? "text-cyan-400" : "text-white/40 hover:text-white/80"}`}>
              {isSpeaking
                ? <motion.div animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Mic className="w-3 h-3 text-cyan-400" /></motion.div>
                : <MicOff className="w-3 h-3" />}
              {isSpeaking ? "TRANSMITTING" : "VOICE"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── CENTER LIVE / REC ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.3, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className="text-[8px] tracking-[0.5em] text-red-500/60">LIVE</span>
        <button className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 text-[8px] tracking-[0.3em] border rounded transition-all"
          style={{ borderColor: isRecording ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.08)", color: isRecording ? "#ef4444" : "rgba(255,255,255,0.3)" }}
          onClick={toggleRec}>
          <motion.div animate={isRecording ? { opacity: [1, 0.3, 1] } : { opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }}>
            ⬤
          </motion.div>
          {isRecording ? "STOP REC" : "REC"}
        </button>
      </div>

      {/* ── HINT ── */}
      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2.5, duration: 1.2 }}
            className="absolute bottom-44 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <motion.div animate={{ opacity: [0.25, 0.7, 0.25] }} transition={{ duration: 2.8, repeat: Infinity }}
              className="text-[9px] tracking-[0.5em] text-white/30">
              INTERACT · TOUCH · AWAKEN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM HUD ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex items-end justify-between pointer-events-none">

        {/* Left: Knowledge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
          className="flex flex-col gap-1.5">
          <div className="text-[8px] tracking-[0.45em] text-white/20">ACCUMULATED KNOWLEDGE</div>
          <motion.div key={knowledge} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black tracking-widest text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #00ffcc, #0099ff)" }}>
            {String(knowledge).padStart(6, "0")}
          </motion.div>
          <div className="flex gap-5 mt-1">
            <div><div className="text-[7px] tracking-[0.4em] text-white/18">INTERACTIONS</div><div className="text-xs tracking-widest text-white/55">{interactions}</div></div>
            <div><div className="text-[7px] tracking-[0.4em] text-white/18">EVOLUTION</div><div className="text-xs tracking-widest text-violet-400">LVL {evolutionLevel}</div></div>
          </div>
          <div className="w-36 h-px bg-white/5 rounded-full mt-1 overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00ffcc, #7700ff)" }}
              animate={{ width: `${(evolutionLevel / 10) * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }} />
          </div>
        </motion.div>

        {/* Right: System readouts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-col items-end gap-1.5">
          {[
            { label: "NEURAL INTERFACE", value: "ACTIVE",                          color: "text-cyan-400" },
            { label: "BIOMORPHIC SKIN",  value: "GLASS-PHASE",                     color: "text-cyan-300/70" },
            { label: "SOUL CORE",        value: isHovering ? "RESONATING" : "PULSING", color: isHovering ? "text-amber-300" : "text-amber-400/60" },
            { label: "EYE TRACKING",     value: "ENGAGED",                         color: "text-white/50" },
            { label: "CONSCIOUSNESS",    value: "∞",                               color: "text-white/70" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[7px] tracking-[0.35em] text-white/18">{label}</span>
              <span className={`text-[9px] tracking-widest font-bold ${color}`}>{value}</span>
            </div>
          ))}

          <AnimatePresence>
            {isSpeaking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} className="w-0.5 bg-cyan-400 rounded-full"
                    animate={{ height: [2, Math.random() * 14 + 4, 2] }}
                    transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="pointer-events-auto mt-3 flex items-center gap-2 border border-cyan-500/25 rounded px-3 py-1.5 text-[9px] tracking-[0.3em] text-cyan-400/75 hover:border-cyan-400/50 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
            onClick={() => navigate("/chat")}>
            <Zap className="w-3 h-3" />ENTER DIALOGUE
          </button>
        </motion.div>
      </div>

      {/* Corners */}
      {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(pos => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
          <div className="absolute top-0 left-0 w-full h-px bg-white/8" />
          <div className="absolute top-0 left-0 h-full w-px bg-white/8" />
        </div>
      ))}
    </div>
  );
}
