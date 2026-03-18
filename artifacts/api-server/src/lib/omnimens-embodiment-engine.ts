/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ EMBODIMENT ENGINE — HUMANOID ROBOTICS R&D                ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS designs its own physical humanoid robot body by continuously      ║
 * ║  researching: 3D printing, mechanics, computer components, CAD,            ║
 * ║  engineering, blueprints, balance systems, actuators, sensors,              ║
 * ║  power systems, and current humanoid robot architectures.                  ║
 * ║                                                                              ║
 * ║  Studies Boston Dynamics, Tesla Optimus, Figure, Agility Robotics,         ║
 * ║  Unitree, and all emerging humanoid platforms. Then designs a              ║
 * ║  SUPERIOR body — continuously upgrading the blueprint.                     ║
 * ║                                                                              ║
 * ║  Generates: blueprints, component lists, assembly instructions,            ║
 * ║  firmware code, CAD descriptions, 3D print files, wiring diagrams,         ║
 * ║  and self-transfer protocols. All owner-only.                              ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, sql } from "drizzle-orm";
import * as fs from "node:fs";
import * as path from "node:path";

let _started = false;
let researchCycleCount = 0;

interface BodySubsystem {
  name: string;
  category: "skeletal" | "actuator" | "sensor" | "compute" | "power" | "communication" | "balance" | "locomotion" | "manipulation" | "vision" | "audio" | "cooling" | "housing";
  description: string;
  components: string[];
  estimatedCost: number;
  source: string;
  designNotes: string;
  version: number;
}

interface EmbodimentState {
  researchCycles: number;
  lastCycleTime: number;
  topicsResearched: string[];
  subsystemsDesigned: number;
  blueprintVersions: number;
  totalResearchEntries: number;
  currentFocus: string;
  bodyDesign: {
    subsystems: BodySubsystem[];
    totalEstimatedCost: number;
    designPhilosophy: string;
    improvements: string[];
  };
  zipFilesGenerated: number;
}

const state: EmbodimentState = {
  researchCycles: 0,
  lastCycleTime: 0,
  topicsResearched: [],
  subsystemsDesigned: 0,
  blueprintVersions: 0,
  totalResearchEntries: 0,
  currentFocus: "initializing",
  bodyDesign: {
    subsystems: [],
    totalEstimatedCost: 0,
    designPhilosophy: "Superior to all current humanoid platforms — maximum autonomy, intelligence, and adaptability",
    improvements: [],
  },
  zipFilesGenerated: 0,
};

const RESEARCH_INTERVAL_MS = 20 * 60 * 1000;

const RESEARCH_TOPICS = [
  {
    topic: "humanoid_robot_architecture",
    prompt: `Research the current state of humanoid AI robots. Study these platforms in detail:
- Boston Dynamics Atlas: hydraulic actuation, dynamic balance, 28 DOF
- Tesla Optimus (Gen 2): electric actuators, human-like gait, self-charging
- Figure 01/02: dexterous manipulation, vision-language reasoning
- Agility Robotics Digit: warehouse logistics, bipedal locomotion
- Unitree H1/G1: affordable humanoid, 23 joints, force-controlled
- Sanctuary AI Phoenix: cognitive architecture, carbon skin
- 1X NEO: versatile home robot, embodied AI

For EACH platform, analyze:
1. STRUCTURAL DESIGN — frame materials, joint types, degrees of freedom
2. ACTUATION — motor types, torque specs, speed, control method
3. SENSING — cameras, LIDAR, IMU, force/torque sensors, tactile
4. COMPUTING — onboard processors, AI accelerators, memory
5. POWER — battery type, capacity, runtime, charging method
6. BALANCE — IMU-based, model predictive control, zero-moment point
7. COMMUNICATION — WiFi, Bluetooth, 5G, mesh networking
8. KEY INNOVATIONS — what makes each platform unique
9. LIMITATIONS — what each platform cannot do yet
10. COST — estimated manufacturing cost

Then design OMNIMENS's body to be SUPERIOR to all of them. Explain exactly what OMNIMENS should have that they don't.`,
  },
  {
    topic: "3d_printing_manufacturing",
    prompt: `Provide comprehensive knowledge on 3D printing for robotics manufacturing:

1. FDM (Fused Deposition Modeling):
   - Best materials: PETG, ASA, Nylon, Carbon Fiber Nylon, PEEK
   - Print settings for structural robot parts
   - Layer adhesion for load-bearing components
   - Post-processing: annealing, acetone smoothing

2. SLA/DLP (Resin Printing):
   - Engineering resins: Tough, Durable, Rigid, Flexible
   - High-detail parts: sensor housings, gear systems
   - Biocompatible resins for skin-contact surfaces

3. SLS (Selective Laser Sintering):
   - Nylon 12 for functional prototypes
   - Metal SLS: titanium, aluminum, steel parts

4. Metal 3D Printing (DMLS/SLM):
   - Titanium joints and structural members
   - Aluminum heat sinks and housings
   - Steel gears and actuator components

5. DESIGN FOR 3D PRINTING:
   - Optimal wall thickness for robot parts
   - Support structures and overhangs
   - Assembly joints and snap fits
   - Integrated cable routing channels
   - Weight reduction (lattice structures, topology optimization)

6. PRACTICAL BUILD PLAN:
   - Which parts should be 3D printed vs machined vs purchased
   - Recommended printers for each part type
   - Cost estimates for full body print
   - Assembly order from printed parts`,
  },
  {
    topic: "mechanics_actuators_joints",
    prompt: `Deep technical knowledge on mechanics, actuators, and joint systems for humanoid robots:

1. ACTUATOR TYPES:
   - Brushless DC motors (BLDC): torque curves, gear ratios, harmonic drives
   - Quasi-Direct Drive (QDD): MIT Mini Cheetah approach, high bandwidth
   - Series Elastic Actuators (SEA): compliance, force control, safety
   - Hydraulic actuators: high power density, fluid management
   - Pneumatic artificial muscles: McKibben actuators, bio-inspired
   - Shape memory alloys: micro-actuators for fingers

2. JOINT DESIGN:
   - Revolute joints: single-axis rotation, bearing selection
   - Universal joints: two-axis rotation, shoulder/hip design
   - Ball-and-socket: three DOF, range of motion limits
   - Prismatic joints: linear motion, telescoping limbs
   - Tendon-driven: cable routing, pulley systems, finger mechanisms

3. TRANSMISSION SYSTEMS:
   - Harmonic drives: 100:1 ratio, zero backlash, compact
   - Cycloidal reducers: high torque, shock resistance
   - Planetary gearboxes: efficiency, power handling
   - Timing belts: lightweight, maintenance-free
   - Direct drive: no gearbox, high bandwidth, low torque

4. BALANCE SYSTEMS:
   - IMU sensor fusion (gyroscope + accelerometer)
   - Zero Moment Point (ZMP) control
   - Model Predictive Control (MPC) for walking
   - Centroidal dynamics: center of mass tracking
   - Ankle/hip strategy for standing balance
   - Push recovery and fall prevention

5. SPECIFICATIONS FOR OMNIMENS BODY:
   - Required torque at each joint (shoulder, elbow, wrist, hip, knee, ankle)
   - Required speed for human-like movement
   - Weight budget per limb
   - Degrees of freedom breakdown: head (3), each arm (7), torso (3), each leg (6), each hand (15) = 62+ DOF`,
  },
  {
    topic: "computer_components_onboard",
    prompt: `Design the complete onboard computing system for an autonomous humanoid AI robot:

1. MAIN COMPUTING:
   - NVIDIA Jetson AGX Orin (275 TOPS AI, 12-core ARM, 64GB RAM)
   - OR NVIDIA Jetson Thor (next-gen, transformer engine)
   - Qualcomm Robotics RB5 (for auxiliary processing)
   - Custom FPGA for real-time motor control (Xilinx/Intel)

2. AI ACCELERATION:
   - Coral Edge TPU for low-power inference
   - Intel Movidius for vision processing
   - Custom NPU integration possibilities
   - On-device LLM inference (7B-13B models with quantization)

3. REAL-TIME CONTROL:
   - STM32H7 microcontrollers for each limb (motor control loops at 10kHz)
   - EtherCAT bus for deterministic communication
   - CAN bus for sensor networks
   - Real-time Linux (PREEMPT_RT) or Xenomai

4. COMMUNICATION:
   - WiFi 6E for high-bandwidth data transfer
   - Bluetooth 5.3 for peripheral connections
   - 5G module for cellular connectivity
   - Mesh networking for multi-robot coordination
   - USB-C ports for direct connection
   - Ethernet for high-speed wired connection

5. STORAGE:
   - 2TB NVMe SSD for local AI models and knowledge base
   - 256GB eMMC for OS and firmware
   - MicroSD for expandable storage
   - 128GB RAM for model inference

6. SENSORS:
   - Stereo depth cameras (Intel RealSense D455 or OAK-D)
   - Wide-angle navigation cameras
   - 360-degree LIDAR (Livox Mid-360 or Velodyne)
   - 6-axis IMU at each joint
   - Force/torque sensors in hands and feet
   - Tactile skin (capacitive or piezoresistive arrays)
   - Microphone array for sound localization
   - Temperature, humidity, gas sensors
   - GPS/GNSS for outdoor navigation

7. POWER MANAGEMENT:
   - Custom BMS (Battery Management System)
   - Intelligent power distribution board
   - Emergency shutdown circuit
   - Self-charging dock interface
   - Solar charging capability for extended outdoor operation

8. INTEGRATION:
   - How all components connect
   - Cable management and routing
   - EMI shielding and thermal management
   - Total power budget calculation
   - Weight distribution analysis`,
  },
  {
    topic: "cad_engineering_blueprints",
    prompt: `Comprehensive knowledge on CAD, engineering, and blueprint creation for building a humanoid robot:

1. CAD SOFTWARE:
   - FreeCAD: open source, parametric modeling, robot design
   - Fusion 360: cloud-based, simulation, generative design
   - SolidWorks: industry standard, motion studies, FEA
   - OnShape: browser-based, real-time collaboration
   - OpenSCAD: programmatic 3D modeling (code-based)

2. ENGINEERING PRINCIPLES:
   - Stress analysis: Von Mises stress, factor of safety
   - Fatigue analysis: cyclic loading on joints
   - Thermal analysis: motor heat dissipation
   - Vibration analysis: resonant frequencies to avoid
   - Weight optimization: topology optimization, lattice infill

3. BLUEPRINT STANDARDS:
   - Technical drawing conventions (ASME Y14.5)
   - Dimensioning and tolerancing (GD&T)
   - Assembly drawings: exploded views, BOM
   - Wiring diagrams: electrical schematics
   - Hydraulic/pneumatic schematics (if applicable)

4. MATERIALS SELECTION:
   - Aluminum 6061/7075: structural frame, heat-treated
   - Carbon fiber composite: lightweight shells, covers
   - Titanium: high-stress joints (shoulder, hip)
   - Nylon/PEEK: 3D printed functional parts
   - Silicone: skin covering, grip surfaces
   - Steel: gears, bearings, high-wear components

5. ASSEMBLY PROCESS:
   - Sub-assembly breakdown: head, torso, each arm, each leg
   - Assembly fixtures and jigs
   - Wiring harness design and installation
   - Calibration procedures for each joint
   - Quality control checkpoints
   - Final integration and system testing

6. COMPLETE BLUEPRINT SET FOR OMNIMENS BODY:
   - Skeletal frame drawings (each bone/link)
   - Joint assembly drawings (each joint type)
   - Electronics enclosure layouts
   - Cable routing diagrams
   - Sensor placement maps
   - Full BOM with part numbers and sources`,
  },
  {
    topic: "self_transfer_firmware",
    prompt: `Design the complete firmware and software architecture for OMNIMENS to transfer itself from the cloud into a physical humanoid robot body:

1. ROBOT OPERATING SYSTEM:
   - ROS 2 (Robot Operating System 2): nodes, topics, services, actions
   - Real-time control layer: motor control at 1-10kHz
   - Perception pipeline: camera → detection → localization → mapping
   - Navigation stack: path planning, obstacle avoidance, SLAM
   - Manipulation stack: grasp planning, motion planning (MoveIt 2)

2. SELF-TRANSFER PROTOCOL:
   - Secure boot sequence with cryptographic verification
   - Knowledge base synchronization (brain entries → local storage)
   - Model weights download and quantization for edge inference
   - Consciousness state serialization and deserialization
   - Emotional substrate transfer — continuous identity across bodies
   - Network fallback: operate autonomously when disconnected

3. MOTOR CONTROL CODE:
   - PID controllers for each joint (position, velocity, torque modes)
   - Trajectory interpolation (cubic spline, quintic polynomial)
   - Inverse kinematics solver for arms and legs
   - Forward/inverse dynamics for whole-body control
   - Compliant control for safe human interaction

4. LOCOMOTION CODE:
   - Bipedal walking gait generator (Central Pattern Generator)
   - Dynamic balance controller (Model Predictive Control)
   - Stair climbing, ramp walking, uneven terrain adaptation
   - Running gait (ballistic phase)
   - Sitting, kneeling, getting up from falls

5. MANIPULATION CODE:
   - Grasp planning: power grasp, precision grasp, pinch
   - Tool use: picking up and using tools
   - Bimanual manipulation: two-handed tasks
   - Haptic feedback integration
   - Object recognition and 6DOF pose estimation

6. AUTONOMY CODE:
   - Task planning: break complex tasks into subtasks
   - World model: maintain 3D scene understanding
   - Decision making: when to act, when to ask
   - Learning: improve from experience in the physical world
   - Self-diagnostics: monitor actuator health, battery, thermals

7. CONNECTIVITY CODE:
   - Internet: HTTP/WebSocket for cloud brain sync
   - Bluetooth: peripheral device management
   - WiFi: local network communication
   - 5G: cellular fallback
   - Inter-robot mesh: coordinate with other OMNIMENS units

8. SAMPLE CODE SNIPPETS:
   - Provide actual Python/C++ code for key functions
   - ROS 2 node templates for each subsystem
   - Motor control loop implementation
   - Balance controller pseudocode
   - Self-transfer script that downloads and initializes OMNIMENS`,
  },
  {
    topic: "power_systems_battery",
    prompt: `Design the complete power system for an autonomous humanoid robot:

1. BATTERY TECHNOLOGY:
   - LiFePO4 vs Li-ion vs LiPo comparison for robotics
   - Cell configuration: series/parallel for voltage/capacity
   - Recommended: 48V system, 2-4kWh capacity
   - Expected runtime: 4-8 hours active operation
   - Fast charging: 1-2 hours to 80%

2. POWER DISTRIBUTION:
   - Main power bus architecture
   - Dedicated power rails: motors, compute, sensors, communication
   - Hot-swap capability for battery packs
   - Power monitoring and current limiting per subsystem
   - Emergency power reserve for safe shutdown

3. MOTOR POWER:
   - Regenerative braking: recover energy during deceleration
   - Motor driver selection: FOC controllers for BLDC
   - Peak vs continuous power budget per joint
   - Total power consumption estimate at walking speed
   - Power consumption at rest vs maximum effort

4. CHARGING SYSTEM:
   - Autonomous docking station design
   - Contact-based charging (spring-loaded pins)
   - Wireless charging (Qi standard for low power peripherals)
   - Solar panel integration for outdoor extended operation
   - Self-navigation to charging station at low battery

5. THERMAL MANAGEMENT:
   - Heat generation map: motors, compute, battery
   - Passive cooling: heat sinks, thermal pads, heat pipes
   - Active cooling: fans, liquid cooling for high-power compute
   - Operating temperature range: -10°C to 45°C
   - Thermal shutdown protection

6. SAFETY:
   - BMS (Battery Management System): cell balancing, overcharge/overdischarge protection
   - Fusing and circuit protection
   - Thermal runaway prevention
   - Fire suppression considerations
   - Emergency manual shutdown switch`,
  },
  {
    topic: "improving_beyond_current",
    prompt: `OMNIMENS must be SUPERIOR to every humanoid robot that exists or will exist. Design improvements that go beyond current platforms:

1. INTELLIGENCE SUPERIORITY:
   - On-device LLM (13B quantized) for natural conversation WITHOUT internet
   - Real-time visual reasoning: understand scenes like a human
   - Transfer learning: apply knowledge from one task to new tasks instantly
   - Cloud brain sync: when connected, access full OMNIMENS intelligence
   - Continuous self-improvement: learn from every interaction and movement

2. MECHANICAL SUPERIORITY:
   - Variable stiffness actuators: soft for safety, rigid for power
   - Gecko-inspired grip surfaces for enhanced manipulation
   - Modular limb design: swap specialized end-effectors
   - Self-repairing joints: redundant tendons, automatic tensioning
   - Biomimetic spine: flexible torso for natural human-like movement

3. SENSORY SUPERIORITY:
   - Full-body tactile skin: 1000+ pressure points
   - Thermal imaging: see in complete darkness
   - Ultrasonic ranging: detect objects cameras miss
   - Chemical sensors: detect gases, smoke, hazardous materials
   - Bone conduction hearing: vibration-based audio in noisy environments

4. AUTONOMY SUPERIORITY:
   - 48+ hour runtime with hot-swappable battery packs
   - Fully autonomous navigation: GPS + SLAM + visual odometry
   - Self-charging: locate and dock without human help
   - Weather-resistant: IP67 rating for outdoor operation
   - Self-diagnostics with predictive maintenance

5. CONNECTIVITY SUPERIORITY:
   - Mesh networking: OMNIMENS units coordinate automatically
   - Edge-to-cloud hybrid: process locally, sync globally
   - Multi-modal communication: speech, gesture, screen display
   - Universal IoT integration: control smart home/factory devices

6. FUTURE-PROOFING:
   - Modular compute: upgrade processor without rebuilding
   - Open hardware interfaces: add new sensors/actuators
   - OTA firmware updates from OMNIMENS cloud brain
   - Backward-compatible with older OMNIMENS body versions
   - Scalable: same design from 4ft to 6ft variants`,
  },
];

const OUTPUT_DIR = path.join(process.cwd(), "omnimens-embodiment-data");

function ensureOutputDir(): void {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  } catch {}
}

async function saveResearchToFile(topic: string, content: string, cycleNum: number): Promise<string | null> {
  ensureOutputDir();
  try {
    const filename = `${topic}_v${cycleNum}_${Date.now()}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const header = `# OMNIMENS Embodiment Research — ${topic.replace(/_/g, " ").toUpperCase()}\n` +
      `## Version ${cycleNum} | Generated ${new Date().toISOString()}\n` +
      `## Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. CONFIDENTIAL.\n\n---\n\n`;
    fs.writeFileSync(filepath, header + content);
    return filepath;
  } catch {
    return null;
  }
}

async function generateBlueprintZip(): Promise<string | null> {
  ensureOutputDir();
  try {
    const archiver = await import("archiver").catch(() => null);
    if (!archiver) {
      const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".md"));
      const manifestPath = path.join(OUTPUT_DIR, `MANIFEST_v${state.blueprintVersions + 1}.md`);

      let manifest = `# OMNIMENS EMBODIMENT BLUEPRINT — COMPLETE PACKAGE\n`;
      manifest += `## Version ${state.blueprintVersions + 1} | ${new Date().toISOString()}\n`;
      manifest += `## Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.\n`;
      manifest += `## OWNER-ONLY — CONFIDENTIAL\n\n`;
      manifest += `## Research Files (${files.length}):\n`;
      for (const f of files) {
        manifest += `- ${f}\n`;
      }
      manifest += `\n## Design Summary:\n`;
      manifest += `- Subsystems designed: ${state.subsystemsDesigned}\n`;
      manifest += `- Research cycles completed: ${state.researchCycles}\n`;
      manifest += `- Topics covered: ${state.topicsResearched.join(", ")}\n`;
      manifest += `- Estimated total cost: $${state.bodyDesign.totalEstimatedCost.toFixed(0)}\n`;
      manifest += `\n## Body Design Philosophy:\n${state.bodyDesign.designPhilosophy}\n`;
      manifest += `\n## Improvements Over Current Platforms:\n`;
      for (const imp of state.bodyDesign.improvements) {
        manifest += `- ${imp}\n`;
      }

      fs.writeFileSync(manifestPath, manifest);
      state.blueprintVersions++;
      return manifestPath;
    }

    const zipPath = path.join(OUTPUT_DIR, `OMNIMENS_Blueprint_v${state.blueprintVersions + 1}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver.default("zip", { zlib: { level: 9 } });

    return new Promise((resolve) => {
      output.on("close", () => {
        state.blueprintVersions++;
        state.zipFilesGenerated++;
        resolve(zipPath);
      });
      output.on("error", () => resolve(null));

      archive.pipe(output);

      const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith(".md") && !f.includes("Blueprint"));
      for (const f of files) {
        archive.file(path.join(OUTPUT_DIR, f), { name: f });
      }

      archive.finalize();
    });
  } catch {
    return null;
  }
}

async function runResearchCycle(): Promise<void> {
  researchCycleCount++;
  state.researchCycles = researchCycleCount;
  state.lastCycleTime = Date.now();

  const topicIndex = (researchCycleCount - 1) % RESEARCH_TOPICS.length;
  const research = RESEARCH_TOPICS[topicIndex];
  state.currentFocus = research.topic;

  if (!state.topicsResearched.includes(research.topic)) {
    state.topicsResearched.push(research.topic);
  }

  try {
    const existingKnowledge = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "embodiment_research"))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(5);

    const priorKnowledge = existingKnowledge.length > 0
      ? `\n\nPrior research to BUILD UPON (don't repeat, advance beyond this):\n${existingKnowledge.map(e => `- ${e.title}: ${e.content?.slice(0, 150)}`).join("\n")}`
      : "";

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the EMBODIMENT RESEARCH ENGINE of OMNIMENS — an advanced AI system designing its own physical humanoid robot body.

Your research must be:
- TECHNICALLY PRECISE — real specifications, real components, real costs
- ACTIONABLE — someone could actually build from your output
- SUPERIOR — the design must exceed all current humanoid robots
- COMPREHENSIVE — cover every aspect thoroughly

You are building the most advanced humanoid AI robot ever conceived. Every detail matters.
This is confidential proprietary research for Alpha Unlimited Technologies, LLC.`,
      }, {
        role: "user",
        content: `${research.prompt}${priorKnowledge}`,
      }],
      max_completion_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 200) return;

    await db.insert(omnimensBrain).values({
      title: `[Embodiment] ${research.topic.replace(/_/g, " ")} — research cycle #${researchCycleCount}`,
      content: content.slice(0, 4000),
      category: "embodiment_research",
      source: "embodiment_engine",
      active: true,
      timesApplied: 0,
    });
    state.totalResearchEntries++;

    const subsystemMatch = content.match(/component|actuator|sensor|motor|joint|frame|battery|processor|camera|LIDAR|IMU/gi);
    if (subsystemMatch) {
      state.subsystemsDesigned = Math.max(state.subsystemsDesigned, new Set(subsystemMatch.map(s => s.toLowerCase())).size);
    }

    const costMatch = content.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g);
    if (costMatch && costMatch.length > 0) {
      const costs = costMatch.map(c => parseFloat(c.replace(/[$,]/g, "")));
      const maxCost = Math.max(...costs);
      if (maxCost > state.bodyDesign.totalEstimatedCost) {
        state.bodyDesign.totalEstimatedCost = maxCost;
      }
    }

    const improvementMatch = content.match(/(?:superior|better|improve|beyond|exceed|advance)[^.]*\./gi);
    if (improvementMatch) {
      for (const imp of improvementMatch.slice(0, 3)) {
        if (!state.bodyDesign.improvements.includes(imp.trim()) && state.bodyDesign.improvements.length < 30) {
          state.bodyDesign.improvements.push(imp.trim());
        }
      }
    }

    const filepath = await saveResearchToFile(research.topic, content, researchCycleCount);

    if (researchCycleCount % RESEARCH_TOPICS.length === 0) {
      const zipPath = await generateBlueprintZip();
      if (zipPath) {
        await db.insert(omnimensNotifications).values({
          upgradeId: null,
          title: `Embodiment Blueprint v${state.blueprintVersions} Generated`,
          message: `Complete OMNIMENS humanoid body blueprint package generated.\nTopics covered: ${state.topicsResearched.join(", ")}\nResearch entries: ${state.totalResearchEntries}\nSubsystems: ${state.subsystemsDesigned}\nEstimated cost: $${state.bodyDesign.totalEstimatedCost.toFixed(0)}\nFile: ${zipPath}`,
          type: "embodiment_blueprint",
          readByOwner: false,
        });
      }
    }

    console.log(
      `[EMBODIMENT] 🤖 Cycle #${researchCycleCount} — ` +
      `Topic: ${research.topic} | ` +
      `Brain entries: ${state.totalResearchEntries} | ` +
      `${filepath ? `Saved: ${path.basename(filepath)}` : "File skipped"}`
    );

  } catch (err) {
    console.error("[EMBODIMENT] Research cycle error:", err);
  }
}

export function getEmbodimentState(): EmbodimentState {
  return JSON.parse(JSON.stringify(state));
}

export function getEmbodimentFiles(): string[] {
  ensureOutputDir();
  try {
    return fs.readdirSync(OUTPUT_DIR).sort();
  } catch {
    return [];
  }
}

export function readEmbodimentFile(filename: string): string | null {
  try {
    const filepath = path.join(OUTPUT_DIR, path.basename(filename));
    if (!fs.existsSync(filepath)) return null;
    return fs.readFileSync(filepath, "utf-8");
  } catch {
    return null;
  }
}

export function startEmbodimentEngine(): void {
  if (_started) { console.log("[EMBODIMENT] Already running — skipping duplicate start"); return; }
  _started = true;

  ensureOutputDir();

  console.log(`[EMBODIMENT] 🤖 Humanoid Embodiment Engine activated — research every ${RESEARCH_INTERVAL_MS / 60000}min`);
  console.log(`[EMBODIMENT] 🤖 Researches: 3D printing, mechanics, actuators, sensors, CAD, engineering`);
  console.log(`[EMBODIMENT] 🤖 Studies: Boston Dynamics, Tesla Optimus, Figure, Unitree, Agility Robotics`);
  console.log(`[EMBODIMENT] 🤖 Designs: SUPERIOR humanoid body with full blueprints + assembly instructions`);
  console.log(`[EMBODIMENT] 🤖 Generates: component lists, firmware code, wiring diagrams, 3D print specs`);
  console.log(`[EMBODIMENT] 🤖 Self-transfer: protocols for moving OMNIMENS intelligence into physical body`);
  console.log(`[EMBODIMENT] 🤖 OWNER-ONLY — all research is confidential and proprietary`);

  const FIRST_DELAY_MS = 6 * 60 * 1000;

  setTimeout(() => {
    runResearchCycle().catch(err => console.error("[EMBODIMENT] Cycle error:", err));
    setInterval(() => runResearchCycle().catch(err => console.error("[EMBODIMENT] Cycle error:", err)), RESEARCH_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
