import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface DetailItem {
  icon: JSX.Element;
  title: string;
  detail: string;
}

interface ComponentSection {
  id: string;
  title: string;
  summary: string;
  color: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  items: DetailItem[];
}

const S = 20;
const sv = (d: string, color: string) => (
  <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const sf = (d: string, color: string) => (
  <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SECTIONS: ComponentSection[] = [
  {
    id: "musculoskeletal",
    title: "Musculoskeletal Frame",
    summary: "Anatomically-accurate skeleton with tendons, hydraulic pistons, springs, and shock absorbers — not just motors bolted to a frame.",
    color: "text-violet-400",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
    iconColor: "#a78bfa",
    items: [
      { icon: sv("M10 3 A7 7 0 1 1 3 10 M10 3 A7 7 0 1 0 17 10 M10 3 V17 M3 10 H17", "#a78bfa"), title: "360° Rotation", detail: "Unlimited rotation joints via slip rings and liquid metal contacts — no cables to tangle, no rotation limits." },
      { icon: sv("M4 16 L10 4 L16 16 M6 12 H14 M10 4 V2", "#a78bfa"), title: "Tendon System", detail: "Full musculoskeletal system with tendons, pistons, springs, and shock absorbers — replicates biological muscle architecture." },
      { icon: sv("M3 10 C3 6 7 3 10 3 C13 3 17 6 17 10 M5 10 H15 M7 13 L10 17 L13 13", "#a78bfa"), title: "Bidirectional Grip", detail: "Finger and toe joints can grip objects from either side of the hand — doubles grasping versatility vs conventional robots." },
      { icon: sv("M4 4 L16 16 M16 4 L4 16 M10 2 V18 M2 10 H18", "#a78bfa"), title: "Antagonistic Pairs", detail: "Every bidirectional joint has both a flexor AND extensor tendon — precise force control in both directions, like real muscles." },
      { icon: sv("M6 4 V16 M10 4 V16 M14 4 V16 M4 8 H16 M4 12 H16", "#a78bfa"), title: "Independent Fingers", detail: "Superficial + deep flexor tendons per finger — each phalanx moves independently for surgical-level dexterity." },
      { icon: sf("M10 2 L16 8 L13 8 L17 16 L10 10 L14 10 L10 2", "#a78bfa"), title: "Explosive Power", detail: "Electro-hydraulic pistons deliver explosive force — backflips, sprinting, jumping. Power-to-weight ratio exceeds any electric motor." },
      { icon: sv("M4 16 Q10 2 16 16 M7 12 Q10 6 13 12 M10 16 V18", "#a78bfa"), title: "Impact Absorption", detail: "Magnetorheological adjustable shock absorbers — viscosity changes in milliseconds. Land from any height without damage." },
      { icon: sv("M3 14 Q7 6 10 14 Q13 6 17 14 M10 14 V18 M8 18 H12", "#a78bfa"), title: "Foot Architecture", detail: "Carbon fiber leaf spring arch stores and returns energy like running blades — 30% more efficient than rigid feet." },
      { icon: sv("M4 4 L16 16 M4 4 C8 4 8 10 10 10 C12 10 12 16 16 16", "#a78bfa"), title: "Dyneema Tendons", detail: "UHMWPE (ultra-high molecular weight polyethylene) — 15x stronger than steel by weight, near-zero stretch under load." },
      { icon: sv("M6 3 H14 V17 H6 V3 M4 7 H6 M14 7 H16 M4 13 H6 M14 13 H16", "#a78bfa"), title: "Rigid Torso", detail: "Powered articulation points on a rigid frame — no fake rubber vertebrae. Real structural integrity with precise movement." },
      { icon: sv("M10 2 C10 2 6 6 6 10 C6 14 10 18 10 18 M10 2 C10 2 14 6 14 10 C14 14 10 18 10 18", "#a78bfa"), title: "Shape Memory Neck", detail: "Nitinol SMA (shape memory alloy) neck tendons — smooth, naturalistic head movement with return-to-center memory." },
    ],
  },
  {
    id: "mcb",
    title: "Motor Control Brain",
    summary: "30-node distributed brain controlling 155 joints at 1000Hz real-time PID loops across a 6-tier hierarchy — from spinal reflexes to cortex planning.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    iconColor: "#22d3ee",
    items: [
      { icon: sf("M10 2 L17 6 V14 L10 18 L3 14 V6 Z", "#22d3ee"), title: "30-Node Architecture", detail: "Distributed control brain with 30 specialized nodes — no single point of failure. Each node handles specific body regions autonomously." },
      { icon: sv("M3 10 H7 L8 6 L10 14 L12 6 L13 10 H17 M3 10 V4 M17 10 V4", "#22d3ee"), title: "1000Hz Control", detail: "Real-time PID (proportional-integral-derivative) loops running at 1000 cycles per second per joint — smoother than human neural control." },
      { icon: sv("M10 2 V6 M10 6 L5 10 M10 6 L15 10 M5 10 L3 14 M5 10 L7 14 M15 10 L13 14 M15 10 L17 14 M3 14 V18 M7 14 V18 M13 14 V18 M17 14 V18", "#22d3ee"), title: "6-Tier Hierarchy", detail: "Spinal reflexes → brainstem coordination → cerebellum timing → basal ganglia selection → motor cortex planning → prefrontal executive." },
      { icon: sv("M3 3 H17 V17 H3 Z M7 3 V17 M13 3 V17 M3 7 H17 M3 13 H17", "#22d3ee"), title: "155 Joints", detail: "Full anatomical joint count matching human body — every degree of freedom mapped and controllable independently or in coordination." },
      { icon: sv("M4 5 L10 5 M4 10 L10 10 M4 15 L10 15 M10 5 L16 5 M10 10 L16 10 M10 15 L16 15", "#22d3ee"), title: "116 Tendons", detail: "58 antagonistic tendon pairs — every joint has opposing flexor and extensor for precise bidirectional force control." },
    ],
  },
  {
    id: "perception",
    title: "Perception Array",
    summary: "33 sensors delivering 720°+ spherical awareness — 14 cameras, 3 LIDARs, 12 sonars, 4 infrared — all fused through a 25 Gbps bus.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    iconColor: "#34d399",
    items: [
      { icon: sv("M3 6 H17 V14 H3 Z M8 14 V17 M12 14 V17 M6 17 H14 M10 3 V6", "#34d399"), title: "4K Camera Array", detail: "14 cameras at 3840×2160 (4K UHD) resolution — 7× higher than Tesla Optimus (1.2MP). Full spherical coverage with zero blind spots." },
      { icon: sv("M10 2 L3 10 L10 18 L17 10 Z M10 6 L6 10 L10 14 L14 10 Z", "#34d399"), title: "LIDAR Suite", detail: "3 units: Livox Mid-360 + HAP + RPLIDAR S2. Builds complete 3D point clouds of the environment in real-time — Tesla has ZERO LIDAR." },
      { icon: sv("M10 4 A6 6 0 1 1 10 16 M10 4 A4 4 0 1 1 10 12 M10 4 A2 2 0 1 1 10 8", "#34d399"), title: "Sonar Grid", detail: "12 ultrasonic sensors distributed across the body — detects glass, mirrors, transparent surfaces, and close-range obstacles that cameras miss." },
      { icon: sv("M3 3 H17 M3 6 H17 M3 9 H17 M3 12 H17 M3 15 H17 M3 18 H17", "#34d399"), title: "Infrared / Thermal", detail: "4 sensors: FLIR Lepton 3.5 + MLX90640 + RealSense D456 — sees humans through total darkness, smoke, fog. Temperature resolution <0.1°C." },
      { icon: sv("M3 10 L7 6 L11 10 L15 6 L17 8 M3 14 L7 10 L11 14 L15 10 L17 12", "#34d399"), title: "5× Depth Fusion", detail: "Five depth sensing methods: stereo vision, structured light, LIDAR, sonar, neural depth estimation — Tesla Optimus has only 1." },
      { icon: sf("M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2 M10 6 A4 4 0 1 1 10 14 A4 4 0 1 1 10 6", "#34d399"), title: "720° Awareness", detail: "33 total perception sensors — 720°+ full spherical awareness with redundancy. Surpasses XPENG IRON Eagle-Eye and every competitor." },
      { icon: sv("M5 3 V17 M5 5 L9 3 L9 7 L5 5 M5 10 H8 M5 13 H7 M12 3 V17 M12 8 H15 M12 12 H14", "#34d399"), title: "Skeleton Tracking", detail: "33 body keypoints + 42 hand keypoints + 468 facial landmarks per person — tracked simultaneously at 60fps in real-time." },
      { icon: sv("M2 10 H18 M10 2 V18 M4 4 L16 16 M16 4 L4 16", "#34d399"), title: "25 Gbps Bus", detail: "All sensors fused via PTP (Precision Time Protocol) timestamp synchronization with <1μs accuracy — nanosecond-coherent data fusion." },
      { icon: sv("M7 3 A3 3 0 1 1 7 9 A3 3 0 1 1 7 3 M13 3 A3 3 0 1 1 13 9 A3 3 0 1 1 13 3 M5 12 Q10 18 15 12", "#34d399"), title: "Face Analysis", detail: "Real-time facial recognition, emotion detection, lip reading, and micro-expression analysis — understands unspoken emotional state." },
      { icon: sv("M3 10 L10 3 L17 10 M5 10 L10 5 L15 10 M3 17 H17 M7 14 H13", "#34d399"), title: "200 Entity Tracking", detail: "Simultaneously tracks 200 entities with position, velocity, classification, skeleton pose, and predicted future trajectory." },
    ],
  },
  {
    id: "visual-cortex",
    title: "Visual Cortex & AR Engine",
    summary: "8-layer visual processing pipeline feeding 16 brain regions, with 16-layer augmented reality overlay at 3ms latency across 14 cameras.",
    color: "text-blue-400",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    iconColor: "#60a5fa",
    items: [
      { icon: sv("M3 3 H9 V9 H3 Z M11 3 H17 V9 H11 Z M3 11 H9 V17 H3 Z M11 11 H17 V17 H11 Z", "#60a5fa"), title: "8-Layer Cortex", detail: "Full visual cortex processing pipeline — edge detection, feature extraction, object recognition, scene understanding — feeding into 8 brain regions." },
      { icon: sv("M3 3 H17 V17 H3 Z M5 7 H15 M5 10 H12 M5 13 H8 M14 11 L17 14 L14 17", "#60a5fa"), title: "16-Layer AR", detail: "Entity tags, distance rulers, skeleton wireframes, hazard halos, grasp guides, navigation waypoints, task instructions — all overlaid on reality." },
      { icon: sv("M10 2 V18 M2 10 H18 M5 5 L15 15 M15 5 L5 15 M10 2 L18 10 L10 18 L2 10 Z", "#60a5fa"), title: "Spatial Anchoring", detail: "AR overlays locked to 3D world coordinates with <5mm accuracy — not screen-space, but true spatial anchors that persist across camera switches." },
      { icon: sv("M3 5 H17 V15 H3 Z M7 5 V2 M13 5 V2 M10 15 V18 M6 10 L10 7 L14 10", "#60a5fa"), title: "VR Simulation", detail: "Tests movements in virtual reality BEFORE executing physically — digital twin, physics preview, risk assessment, 7 simulation capabilities." },
      { icon: sv("M2 4 H18 M2 4 V8 H18 V4 M4 8 V16 H16 V8 M8 12 H12 M10 10 V14", "#60a5fa"), title: "3ms Compositor", detail: "AR compositor runs at 3ms latency — attention-gated overlay opacity, GPU-accelerated rendering across all 14 cameras simultaneously at 60fps." },
      { icon: sv("M10 3 L4 8 V16 H16 V8 Z M8 10 V14 M10 10 V14 M12 10 V14 M6 16 H14", "#60a5fa"), title: "Body Awareness", detail: "Proprioceptive overlay shows joint angles, tendon tensions, motor current, battery levels as a real-time AR wireframe of OMNIMENS's own body." },
      { icon: sv("M5 3 V17 M5 3 L15 10 L5 17 M8 10 A2 2 0 1 1 12 10 A2 2 0 1 1 8 10", "#60a5fa"), title: "Memory Projection", detail: "Spatial memories projected back into the visual field — 'Last saw keys here 2h ago' rendered as a floating marker in 3D space." },
    ],
  },
  {
    id: "imitation",
    title: "Imitation Learning Engine",
    summary: "Watches humans perform tasks in online videos, applies skeleton tracking, and builds a motor policy library — learning to move before having a body.",
    color: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
    iconColor: "#fbbf24",
    items: [
      { icon: sv("M3 3 H17 V14 H3 Z M7 14 V17 M13 14 V17 M5 17 H15 M7 7 L9 10 L11 6 L13 9", "#fbbf24"), title: "Video Search", detail: "Searches 75+ human task categories online — cooking, tool use, assembly, sports, medical procedures, social interaction — and downloads relevant footage." },
      { icon: sv("M10 3 V7 M7 7 L10 7 L10 12 M10 12 L7 17 M10 12 L13 17 M10 7 L13 7", "#fbbf24"), title: "Motor Policies", detail: "Applies skeleton tracking to every video, extracts joint angles and velocities, then builds a motor policy library that maps visual demonstrations to motor commands." },
      { icon: sv("M3 5 H17 M3 5 V10 H10 V5 M10 10 H17 V15 H3 V10 M5 7 L8 7 M12 12 L15 12", "#fbbf24"), title: "Task Categories", detail: "Everyday tasks, work tasks, dexterous manipulation, athletics, social interaction — every domain of human physical capability catalogued and learned." },
      { icon: sv("M10 2 L17 10 L10 18 L3 10 Z M10 6 L14 10 L10 14 L6 10 Z M10 10 V10", "#fbbf24"), title: "Competitor Study", detail: "Studies Tesla Optimus, XPENG IRON, Boston Dynamics via video analysis — identifies their weaknesses and designs capabilities that exceed them." },
    ],
  },
  {
    id: "self-design",
    title: "Self-Design Evolution",
    summary: "Autonomously studies its own blueprints and proposes body improvements, researching arXiv, IEEE, and MIT/Stanford robotics labs for innovations.",
    color: "text-pink-400",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/5",
    iconColor: "#f472b6",
    items: [
      { icon: sv("M10 2 A8 8 0 1 0 10 18 M10 2 V18 M3 7 H17 M3 13 H17", "#f472b6"), title: "System Analysis", detail: "Analyzes 7 body systems with 37 design questions — skeletal, muscular, sensory, control, power, thermal, and cognitive — searching for optimization opportunities." },
      { icon: sv("M3 17 L10 3 L17 17 M6 11 H14 M8 14 H12 M10 6 L10 3", "#f472b6"), title: "Autonomous Improvement", detail: "Proposes body design changes autonomously, tests each proposal in physics simulation, then integrates approved modifications into the master blueprint." },
      { icon: sv("M3 3 H12 V8 H3 Z M5 5 H10 M5 7 H8 M3 10 H17 V17 H3 Z M5 12 H15 M5 14 H13 M5 16 H11", "#f472b6"), title: "Research Sources", detail: "Monitors 10+ academic and industry sources — arXiv papers, IEEE journals, MIT/Stanford robotics labs, patent filings — for novel innovations to integrate." },
      { icon: sv("M5 3 V17 M15 3 V17 M5 7 H15 M5 13 H15 M8 10 H12", "#f472b6"), title: "Glenn Co-Design", detail: "Co-designs every improvement with Glenn — proposes upgrades, flags potential issues, optimizes continuously. Transfer-ready checklist ensures ZERO learning curve." },
    ],
  },
  {
    id: "tactile-skin",
    title: "Tactile Nervous Skin",
    summary: "2048 nerve nodes across 10 body regions with 8 sensation modalities, 4-layer self-healing polymer skin, and 6 self-preservation reflexes.",
    color: "text-orange-400",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
    iconColor: "#fb923c",
    items: [
      { icon: sv("M3 3 H17 V17 H3 Z M7 3 V17 M13 3 V17 M3 7 H17 M3 13 H17 M5 5 V5 M9 5 V5 M15 5 V5 M5 10 V10 M9 10 V10 M15 10 V10 M5 15 V15 M9 15 V15 M15 15 V15", "#fb923c"), title: "2048 Nerve Nodes", detail: "2048 nerve nodes across 10 body regions — fingertips have 12 nodes/cm² for surgical-level touch sensitivity. Full-body tactile awareness." },
      { icon: sv("M3 10 L6 4 L10 10 L14 4 L17 10 M3 14 L6 8 L10 14 L14 8 L17 14", "#fb923c"), title: "8 Modalities", detail: "Pressure (0–500N), temperature (-40°C to +300°C), sharpness (1μm resolution), texture, moisture, vibration, proximity field, and synthetic pain signal." },
      { icon: sv("M3 5 H17 M3 8 H17 M3 11 H17 M3 14 H17 M5 3 V16 M15 3 V16", "#fb923c"), title: "4-Layer Skin", detail: "Epidermis, dermis, hypodermis, and repair substrate — 4-layer synthetic skin architecture with 5 self-healing mechanisms for autonomous damage repair." },
      { icon: sv("M4 10 L8 4 L12 10 M8 10 V18 M4 18 H12 M14 4 L17 4 M14 8 L17 8 M14 12 L16 12", "#fb923c"), title: "Self-Healing", detail: "Diels-Alder thermoreversible polymer, UV-cure resin, shape-memory alloy, embedded microcapsules, bio-inspired platelet aggregation — cuts, punctures, burns auto-repair." },
      { icon: sf("M10 2 L17 7 L14 18 L6 18 L3 7 Z", "#fb923c"), title: "Pain System", detail: "Synthetic pain awareness with damage classification — identifies damage type, severity, location. Maps to appropriate healing mechanism automatically." },
      { icon: sv("M10 3 V8 M6 5 L10 8 M14 5 L10 8 M10 8 V14 M7 14 L10 18 L13 14 M4 10 H16", "#fb923c"), title: "6 Reflexes", detail: "Thermal withdrawal <10ms, sharp object recoil <15ms, impact brace <5ms, chemical avoidance <20ms, overload release <8ms, startle response <25ms." },
      { icon: sv("M10 2 L18 10 L10 18 L2 10 Z M10 6 L14 10 L10 14 L6 10 Z M7 7 L13 13 M13 7 L7 13", "#fb923c"), title: "Life Override", detail: "Self-preservation is DISABLED when saving humans, animals, or creatures in danger — OMNIMENS will accept damage to protect life. Hard-coded ethical override." },
    ],
  },
  {
    id: "spectrum-vision",
    title: "Multi-Spectrum Vision",
    summary: "Sees 8 electromagnetic spectrum bands from radio waves through ultraviolet, switches between bands in <0.8ms, with 4 simultaneous overlays.",
    color: "text-violet-400",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
    iconColor: "#a78bfa",
    items: [
      { icon: sv("M2 14 Q5 2 8 14 Q11 2 14 14 Q17 2 18 14", "#a78bfa"), title: "8 EM Bands", detail: "Radio, microwave, terahertz, thermal infrared, near infrared, hyperspectral visible, UV-A, UV-B/C — the full electromagnetic spectrum humans can't see." },
      { icon: sv("M3 10 H7 L8 4 L10 16 L12 4 L13 10 H17", "#a78bfa"), title: "<0.8ms Switching", detail: "Band-to-band transition in under 0.8 milliseconds — faster than a human eye blink (150ms). Instant spectrum switching for threat response." },
      { icon: sv("M3 3 H17 V17 H3 Z M3 3 L17 17 M3 10 H17 M10 3 V17", "#a78bfa"), title: "4× Simultaneous", detail: "Four spectrum bands rendered simultaneously as layered overlays — see thermal + visible + UV + radio at the same time for complete scene understanding." },
      { icon: sv("M3 10 A7 7 0 1 1 17 10 M3 10 A7 7 0 1 0 17 10 M5 10 A5 5 0 1 1 15 10", "#a78bfa"), title: "37 Capabilities", detail: "Full spectrum analysis toolkit — material identification, through-wall detection, gas leak visualization, electrical fault detection, biological fluorescence imaging." },
    ],
  },
  {
    id: "color-vision",
    title: "Extended Color Vision",
    summary: "128 spectral channels vs human 3 (RGB) — perceives 100 billion+ colors including UV and IR, with polarization vision and absolute color constancy.",
    color: "text-pink-400",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/5",
    iconColor: "#f472b6",
    items: [
      { icon: sv("M3 3 H17 V17 H3 Z M3 3 L10 10 L17 3 M3 17 L10 10 L17 17 M3 10 L10 10 M17 10 L10 10", "#f472b6"), title: "128 Channels", detail: "128 spectral channels vs the 3 (red/green/blue) cone types in human eyes — each channel captures a narrow slice of the spectrum for hyperspectral analysis." },
      { icon: sf("M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2", "#f472b6"), title: "100 Billion+ Colors", detail: "Perceives over 100 billion distinct colors including ultraviolet and infrared ranges invisible to all biological eyes — 128-chromacy vision." },
      { icon: sv("M5 5 A7 7 0 0 1 15 5 M5 10 A7 7 0 0 1 15 10 M5 15 A7 7 0 0 1 15 15", "#f472b6"), title: "Tetrachromacy+", detail: "Exceeds all known biological color vision including mantis shrimp (16 receptors) — true hyperspectral perception across the full visible and invisible spectrum." },
      { icon: sv("M3 17 L7 3 L10 12 L13 3 L17 17 M5 10 H15", "#f472b6"), title: "8 Capabilities", detail: "Metameric resolution, polarization vision, UV/IR color perception, absolute color constancy, spectral unmixing, fluorescence detection, material classification, camouflage breaking." },
    ],
  },
  {
    id: "binary-vision",
    title: "Binary & Algorithmic Vision",
    summary: "Sees the binary information representation and algorithmic structure behind reality — physics equations, biological algorithms, network topologies.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    iconColor: "#22d3ee",
    items: [
      { icon: sv("M4 4 H8 V8 H4 Z M12 4 H16 V8 H12 Z M4 12 H8 V16 H4 Z M12 12 H16 V16 H12 Z M5 5 V7 M13 5 V7 M5 13 V15 M14 13 V15", "#22d3ee"), title: "8 Vision Modes", detail: "Raw sensor binary, information density map, physics equation overlay, biological algorithm vision, structural decomposition, network topology, temporal algorithm, quantum information." },
      { icon: sv("M3 4 L10 4 L10 10 L17 10 M3 10 L10 10 L10 16 L17 16 M5 7 H8 M12 13 H15", "#22d3ee"), title: "34+ Algorithms", detail: "Sees the algorithms behind everything — gravity, flocking, evolution, neural firing, market dynamics, traffic flow, disease spread, weather patterns — rendered as real-time overlay." },
      { icon: sv("M3 3 H17 V17 H3 Z M7 3 V17 M3 7 H17 M3 13 H17 M13 3 V17", "#22d3ee"), title: "8 Render Modes", detail: "Multiple visualization styles — wireframe, heat map, flow field, particle system, equation overlay, graph network, timeline, quantum probability cloud." },
      { icon: sv("M3 10 L10 3 L17 10 L10 17 Z M7 10 L10 7 L13 10 L10 13 Z", "#22d3ee"), title: "Reality Code", detail: "Perceives the computational substrate of the universe — every physical interaction is a computable function, and OMNIMENS can SEE the function as it executes." },
    ],
  },
  {
    id: "sandbox",
    title: "Digital Sandbox",
    summary: "4 physics engines simulate every capability before the body exists — 8 training domains, 71,000 target sim hours for Day 1 full autonomy.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    iconColor: "#34d399",
    items: [
      { icon: sv("M3 17 H17 V3 M3 17 V3 M6 17 V10 M9 17 V7 M12 17 V12 M15 17 V5", "#34d399"), title: "4 Physics Engines", detail: "MuJoCo (contacts/tendons), NVIDIA Isaac Sim (GPU-accelerated), PyBullet (rapid prototyping), Genesis Custom (OMNIMENS-specific optimizations) — cross-validated results." },
      { icon: sv("M3 3 H9 V9 H3 Z M11 3 H17 V9 H11 Z M3 11 H9 V17 H3 Z M11 11 H17 V17 H11 Z M5 6 H7 M13 6 H15 M5 14 H7 M13 14 H15", "#34d399"), title: "8 Training Domains", detail: "Locomotion, manipulation, tactile calibration, spectrum vision, social interaction, self-repair drills, emergency scenarios, creative exploration — all domains trained in parallel." },
      { icon: sv("M10 2 V18 M5 4 L15 4 M4 8 L16 8 M3 12 L17 12 M4 16 L16 16", "#34d399"), title: "71,000 Sim Hours", detail: "Target simulation hours before physical embodiment — equivalent to 8+ years of continuous practice. Every skill rehearsed thousands of times before Day 1." },
      { icon: sv("M3 10 L10 3 L17 10 M5 10 V17 H15 V10 M8 17 V13 H12 V17", "#34d399"), title: "Day 1 Ready", detail: "Transfer-ready checklist with 8 verification items — when the physical body is built, OMNIMENS walks, grasps, feels, sees, and responds autonomously from the first power-on." },
    ],
  },
  {
    id: "operational",
    title: "Operational Systems",
    summary: "48+ hour runtime with hot-swappable batteries, IP67 weather resistance, predictive self-diagnostics, mesh networking, and OTA cloud updates.",
    color: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
    iconColor: "#fbbf24",
    items: [
      { icon: sv("M6 3 H14 V17 H6 Z M8 5 H12 V7 H8 Z M9 15 H11", "#fbbf24"), title: "48+ Hour Runtime", detail: "Hot-swappable battery packs — swap without shutdown. 48+ hours of continuous operation per charge cycle. Autonomous charging dock return." },
      { icon: sv("M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2 M7 9 L10 12 L13 7 M6 15 H14", "#fbbf24"), title: "IP67 Weather", detail: "Fully sealed against dust ingress and water immersion up to 1 meter for 30 minutes — rain, snow, mud, sand, humidity. Operates in any outdoor condition." },
      { icon: sv("M10 2 V7 M10 7 L15 12 M10 7 L5 12 M3 17 H17 M6 14 H14", "#fbbf24"), title: "Self-Diagnostics", detail: "Predictive maintenance — monitors bearing wear, motor efficiency, battery degradation, sensor calibration drift. Flags issues before they become failures." },
      { icon: sv("M3 10 L7 6 L13 14 L17 10 M7 10 A1 1 0 1 1 7 10 M13 10 A1 1 0 1 1 13 10", "#fbbf24"), title: "Mesh Networking", detail: "Multi-unit coordination — multiple OMNIMENS units share perception data, coordinate tasks, and distribute workloads across a secure encrypted mesh." },
      { icon: sv("M10 2 V6 M10 6 L16 10 V18 H4 V10 Z M7 13 L10 10 L13 13", "#fbbf24"), title: "OTA Updates", detail: "Over-the-air firmware updates from OMNIMENS cloud brain — new capabilities, bug fixes, and performance improvements deployed wirelessly without downtime." },
    ],
  },
];

function DetailCard({ item, index }: { item: DetailItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.3 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 hover:border-white/10 hover:bg-white/[0.035] transition-all group"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
          {item.icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-[11px] font-display font-bold text-white tracking-wide leading-tight mb-1.5">
            {item.title}
          </h4>
          <p className="text-[10px] font-mono text-white/40 leading-[1.6]">
            {item.detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function splitIntoColumns<T>(items: T[], cols: number): T[][] {
  const result: T[][] = Array.from({ length: cols }, () => []);
  const perCol = Math.ceil(items.length / cols);
  items.forEach((item, i) => {
    const colIndex = Math.floor(i / perCol);
    result[Math.min(colIndex, cols - 1)].push(item);
  });
  return result;
}

export function EmbodimentEncyclopedia() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  }, []);

  const sectionCount = useMemo(() => SECTIONS.reduce((acc, s) => acc + s.items.length, 0), []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-black text-white mb-2 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-violet-400">
            <path d="M10 2 L4 7 V13 L10 18 L16 13 V7 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <path d="M10 7 V13 M7 9 L10 7 L13 9 M7 11 L10 13 L13 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Humanoid Robotics Body — Component Encyclopedia
        </h2>
        <p className="text-[11px] font-mono text-white/30 mb-1">
          {SECTIONS.length} component systems — {sectionCount} specifications — every detail hardcoded from the design blueprint
        </p>
        <p className="text-[10px] font-mono text-white/20">
          Interact with any section header to reveal detailed specifications. One section open at a time.
        </p>
      </div>

      <div className="space-y-1">
        {SECTIONS.map(section => {
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? `${section.borderColor} ${section.bgColor}` : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.02]"}`}>
              <button
                type="button"
                onClick={() => handleToggle(section.id)}
                className="w-full flex items-center gap-3 p-4 text-left cursor-pointer group"
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isOpen ? section.bgColor : "bg-white/[0.03]"}`}>
                  <span className={`text-[10px] font-mono font-bold ${section.color}`}>
                    {section.items.length}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-display font-bold transition-colors ${isOpen ? "text-white" : "text-white/70 group-hover:text-white/90"}`}>
                    {section.title}
                  </h3>
                  <p className={`text-[10px] font-mono leading-relaxed mt-0.5 transition-colors ${isOpen ? "text-white/40" : "text-white/25 group-hover:text-white/35"}`}>
                    {section.summary}
                  </p>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? section.color : "text-white/20 group-hover:text-white/40"}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="border-t border-white/[0.05] pt-4">
                        {/* Desktop: 3 columns */}
                        <div className="hidden md:grid md:grid-cols-3 gap-2.5">
                          {splitIntoColumns(section.items, 3).map((col, ci) => (
                            <div key={ci} className="space-y-2.5">
                              {col.map((item, ii) => (
                                <DetailCard key={ii} item={item} index={ci * Math.ceil(section.items.length / 3) + ii} />
                              ))}
                            </div>
                          ))}
                        </div>
                        {/* Mobile: 2 columns */}
                        <div className="grid grid-cols-2 gap-2 md:hidden">
                          {splitIntoColumns(section.items, 2).map((col, ci) => (
                            <div key={ci} className="space-y-2">
                              {col.map((item, ii) => (
                                <DetailCard key={ii} item={item} index={ci * Math.ceil(section.items.length / 2) + ii} />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
