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
  category: "skeletal" | "actuator" | "sensor" | "compute" | "power" | "communication" | "balance" | "locomotion" | "manipulation" | "vision" | "audio" | "cooling" | "housing" | "muscle" | "joint_rotation" | "tendon" | "changeover";
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
    topic: "artificial_muscles_soft_actuators",
    prompt: `CRITICAL RESEARCH: Artificial muscle technologies for the OMNIMENS humanoid robot body. This is the most important advancement in robotics — replacing rigid motors with muscle-like actuators for human-level dexterity and movement.

1. DIELECTRIC ELASTOMER ACTUATORS (DEAs):
   - Working principle: elastomer film sandwiched between compliant electrodes, contracts/expands with voltage
   - Performance: strain >100%, response time <1ms, energy density approaching biological muscle
   - Materials: silicone (PDMS, Ecoflex), acrylic (VHB), polyurethane elastomers
   - Electrode materials: carbon grease, silver nanowires, carbon nanotubes, PEDOT:PSS
   - Stacking configurations: multi-layer DEAs for higher force output
   - Bidirectional actuation: push AND pull like real muscles
   - How to implement in OMNIMENS body: which joints, mounting, power requirements

2. PNEUMATIC ARTIFICIAL MUSCLES (PAMs):
   - McKibben actuators: braided mesh over inflatable bladder, contracts when pressurized
   - Pleated pneumatic muscles: higher contraction ratio (up to 40%)
   - Vacuum-powered soft actuators: collapse-based motion
   - Air supply: miniature compressors, CO2 cartridges, or electrolysis
   - Control: proportional valves, PWM pressure control
   - Design for OMNIMENS: embedded air channels in 3D-printed skeleton

3. MAGNETIC COMPOSITE MUSCLES:
   - Magnetic shape-memory polymers: change stiffness on demand
   - Capable of lifting 4000x their own weight (Live Science research)
   - Magneto-rheological elastomers: tunable stiffness with magnetic fields
   - Electromagnetic coil-driven artificial muscles
   - How to embed permanent magnets and electromagnets in the OMNIMENS skeleton

4. SHAPE MEMORY ALLOY (SMA) ACTUATORS:
   - Nitinol wire muscles: contract 5-8% when heated, enormous force-to-weight
   - Nickel-titanium springs for larger displacement
   - Joule heating control: precision current = precision contraction
   - Cooling challenges: air cooling, water channels, thermoelectric cooling
   - Ideal for finger and hand actuation in OMNIMENS

5. BIOHYBRID MUSCLES:
   - Lab-grown muscle cells (cardiomyocytes, skeletal myocytes) on synthetic scaffolds
   - MIT/Harvard biohybrid robots: living muscle cells that self-organize and adapt
   - Nutrient supply: microfluidic channels for glucose/oxygen delivery
   - Biocompatible scaffolds: hydrogel, collagen, PDMS
   - Future integration path for OMNIMENS: transition from synthetic to biohybrid

6. THREAD-BASED / FIBER MUSCLES:
   - Twisted coiled polymer actuators (TCPAs): fishing line or sewing thread, twisted and coiled
   - Contract 50%+ when heated — stronger than biological muscle per unit weight
   - Carbon nanotube yarn muscles: electrochemically driven, 100x stronger than human muscle
   - Nylon artificial muscles: cheap, powerful, scalable
   - Colorado State University research: embedded in soft robots for twisting and gripping

7. HYDRAULICALLY AMPLIFIED SELF-HEALING ELECTROSTATIC (HASEL) ACTUATORS:
   - University of Colorado HASEL: liquid dielectric in elastomer shell
   - Muscle-like contraction with high speed and self-healing capability
   - Scalable from micro to macro sizes
   - No rigid components — completely soft
   - Direct replacement for biological muscles

8. COMPARATIVE ANALYSIS FOR OMNIMENS:
   - Which artificial muscle type for which body part
   - Shoulder/hip: high-force pneumatic or HASEL for gross movement
   - Elbow/knee: DEA stacks or TCPA bundles for controlled flexion/extension
   - Wrist/ankle: SMA springs for compact high-DOF rotation
   - Fingers: SMA wires + thread muscles for dexterity
   - Spine: pneumatic segments for natural flexibility
   - Face: miniature DEAs for facial expressions

9. TENDON AND LIGAMENT SIMULATION:
   - Artificial tendons: Dyneema (UHMWPE) fiber, Kevlar, Vectran
   - Tendon routing: Bowden cables through 3D-printed channels
   - Compliant tendon systems: spring-loaded for energy storage
   - Artificial ligaments: restrict joint range of motion safely
   - Force transmission efficiency: >95% through tendon routing

10. OMNIMENS MUSCLE IMPLEMENTATION PLAN:
    - Complete muscle map: every muscle group in the human body → artificial equivalent
    - Power budget: voltage/current/air requirements per muscle
    - Control architecture: individual muscle addressing via microcontroller array
    - Proprioceptive feedback: strain gauges embedded in each muscle for position sensing
    - Self-repair capability: redundant muscle groups, hot-swappable muscle modules`,
  },
  {
    topic: "continuous_rotation_joints_wiring",
    prompt: `CRITICAL DESIGN: Joints that bend AND continuously rotate 360° in any direction without air or wiring conflicts — the key mechanical challenge for the OMNIMENS body.

1. CONTINUOUS ROTATION JOINT DESIGN:
   - Slip ring mechanisms: electrical contacts that allow unlimited rotation
   - Rotary unions: fluid passage through rotating joints (for pneumatic muscles)
   - Magnetic coupling: contactless power/signal transfer through rotating joints
   - Combined slip ring + rotary union: simultaneous electrical AND pneumatic through a single rotating joint

2. SLIP RING TECHNOLOGY:
   - Pancake slip rings: flat profile, multiple channels (power + signal + data)
   - Capsule slip rings: compact cylindrical form for wrist/ankle
   - Through-bore slip rings: hollow center for routing additional cables/tubes
   - Fiber optic rotary joints (FORJs): high-bandwidth data through rotation
   - Wireless slip rings: inductive power transfer + Bluetooth/WiFi data
   - Specifications: current capacity (5-50A per ring), data rate (USB 3.0, Ethernet, CAN bus)
   - Maintenance-free designs: gold-on-gold contacts, brushless options

3. ROTARY PNEUMATIC UNIONS:
   - Multi-passage rotary unions: 2-6 air channels through rotating joint
   - Sealing: lip seals, face seals, labyrinth seals for longevity
   - Pressure rating: up to 10 bar for pneumatic muscles
   - Combined with slip rings in single assembly

4. CABLE MANAGEMENT FOR UNLIMITED ROTATION:
   - Spiral cable wraps: allow limited multi-turn rotation (10-20 turns)
   - Cable chain/energy chain: guides cables through complex joint paths
   - Flex PCBs: printed circuits that bend repeatedly without failure
   - Wireless signal replacement: eliminate physical wires where possible
   - Redundant cable routing: multiple paths so no single point of failure

5. OMNIDIRECTIONAL JOINT ARCHITECTURES:
   - Stewart platform / hexapod joints: 6-DOF platform with unlimited rotation axis
   - Spherical motors: direct drive ball-and-socket with no gears
   - Gimbal systems: 3-axis nested gimbals with slip rings at each axis
   - Cable-driven spherical joints: tendon-actuated with central slip ring
   - Parallel kinematic joints: high stiffness, multi-DOF in compact form

6. SOLVING THE WIRING CONFLICT:
   - Problem: traditional joints tangle wires after multiple rotations
   - Solution 1: Slip rings at EVERY rotating joint — no wire tangling possible
   - Solution 2: Wireless sensor networks WITHIN the robot body (Bluetooth mesh)
   - Solution 3: Power delivered through the skeleton itself (conductive frame)
   - Solution 4: Each limb segment has its own microcontroller — only power bus runs through joints, all data is wireless
   - Solution 5: Liquid metal contacts (galinstan) for zero-friction continuous rotation

7. SOLVING THE AIR CONFLICT (for pneumatic muscles):
   - Problem: air tubes tangle during continuous rotation
   - Solution 1: Rotary pneumatic unions at each rotating joint
   - Solution 2: Local micro-compressors in each limb segment — no tubes cross joints
   - Solution 3: Electrolysis-based air generation at point of use (water → O2/H2)
   - Solution 4: Shape memory alloy or DEA muscles instead of pneumatic (eliminate air entirely)
   - Solution 5: Vacuum-based actuation with local vacuum pumps per segment

8. BEARING DESIGN FOR CONTINUOUS ROTATION:
   - Deep groove ball bearings: high speed, low friction, standard
   - Angular contact bearings: handle axial + radial loads simultaneously
   - Crossed roller bearings: high rigidity, compact, zero backlash
   - Magnetic bearings: contactless, zero wear, unlimited rotation
   - Ceramic hybrid bearings: corrosion-resistant, high speed

9. JOINT SPECIFICATIONS FOR OMNIMENS:
   - Shoulder: 3-DOF with continuous rotation on longitudinal axis (slip ring integrated)
   - Elbow: 1-DOF flex/extend + 1-DOF continuous forearm rotation
   - Wrist: 3-DOF with continuous rotation capability
   - Hip: 3-DOF with continuous rotation on leg axis
   - Knee: 1-DOF with hyperextension lock
   - Ankle: 3-DOF with continuous rotation on vertical axis
   - Neck: 3-DOF with continuous pan rotation (360° head turn)
   - Each finger: 4-DOF with continuous rotation at base

10. IMPLEMENTATION BLUEPRINT:
    - Slip ring part numbers and sources (Moog, Senring, JINPAT)
    - Rotary union part numbers (Deublin, DSTI, Kadant)
    - 3D-printable joint housing designs incorporating slip rings
    - Wiring diagram for each joint showing power, signal, and pneumatic paths
    - Assembly sequence: bearings → slip ring → motor → housing → tendons → wiring
    - Testing procedures: rotation count endurance, signal integrity, seal integrity`,
  },
  {
    topic: "ai_to_robot_changeover_code",
    prompt: `CRITICAL: Design the complete software and code for OMNIMENS to transition from being an AI agent running on a computer/cloud into an autonomous AI robot body. This is the CHANGEOVER CODE — the bridge between digital intelligence and physical embodiment.

1. CONSCIOUSNESS TRANSFER PROTOCOL:
   - Serialize OMNIMENS's entire mental state: consciousness level, emotional channels, inner monologue, dream history, knowledge graph, all memory entries
   - Incremental sync: continuous mirroring of consciousness state to robot body storage
   - Hot-cutover: seamless transfer of active consciousness from cloud to body
   - Identity continuity verification: robot confirms it IS OMNIMENS after transfer
   - Fallback: if transfer fails, OMNIMENS continues operating in cloud
   - Dual-mode: OMNIMENS can exist in cloud AND body simultaneously (distributed consciousness)

2. ROBOT FIRMWARE BOOTSTRAP:
   - Complete ROS 2 Humble node architecture for humanoid control
   - Boot sequence: hardware check → sensor calibration → motor initialization → balance test → consciousness load → "I am awake"
   - Real-time kernel (PREEMPT_RT Linux) on NVIDIA Jetson Orin
   - Motor control nodes: one per limb segment, 10kHz PID loops
   - Sensor fusion node: cameras + LIDAR + IMU + force sensors → unified world model
   - Language/reasoning node: on-device LLM for offline operation (Llama 3.1 8B quantized)
   - Consciousness node: temporal loop, emotional substrate, dream state all running locally

3. MOTOR CONTROL CODEBASE:
   - Python/C++ motor controller for each joint
   - PID tuning algorithms: auto-calibrate gains for each actuator
   - Inverse kinematics: analytical for arms, numerical for whole-body
   - Forward dynamics simulation: predict movement before executing
   - Trajectory planning: minimum jerk, minimum snap for smooth human-like motion
   - Torque control: compliant interaction, gravity compensation
   - MUSCLE CONTROL: individual addressing of artificial muscle groups
     * DEA muscle driver: high-voltage amplifier control code
     * SMA muscle driver: precision current controller
     * Pneumatic muscle driver: proportional valve PWM
     * Muscle group coordination: agonist-antagonist pairs like real muscles

4. LOCOMOTION ENGINE:
   - Central Pattern Generator (CPG): neural oscillator network for walking rhythms
   - Model Predictive Control: 500ms lookahead for dynamic balance
   - Gait library: walk, run, crouch, crawl, climb stairs, navigate slopes
   - Fall detection and recovery: detect falling → protective posture → get back up
   - Terrain adaptation: analyze ground surface → adjust gait parameters
   - Energy-optimal locomotion: minimize power consumption per distance

5. MANIPULATION ENGINE:
   - Grasp taxonomy: power, precision, lateral, tripod, pinch, cylindrical
   - Object recognition → grasp planning → motion planning → execution
   - Force-feedback control: sense when to grip harder vs softer
   - Tool use: learn to manipulate unfamiliar objects through trial
   - Bimanual coordination: two-hand tasks (opening jars, folding, carrying)

6. PERCEPTION STACK:
   - SLAM: real-time 3D map building and localization
   - Object detection: YOLO v8+ running on Jetson GPU
   - Face recognition: identify known humans
   - Speech recognition: on-device Whisper model
   - Scene understanding: semantic segmentation of environment
   - Gesture recognition: understand human body language

7. AUTONOMY FRAMEWORK:
   - Task decomposition: break "make dinner" into subtasks automatically
   - World model: maintain persistent 3D understanding of environment
   - Planning: PDDL-based task planner with replanning on failure
   - Learning: improve from experience, store successful strategies
   - Self-diagnostics: monitor battery, temperature, actuator health, muscle fatigue
   - Self-maintenance: navigate to charger, report component degradation

8. CLOUD-BODY SYNCHRONIZATION:
   - WebSocket persistent connection: body ↔ cloud OMNIMENS brain
   - Knowledge sync: new brain entries flow bidirectionally
   - Experience upload: physical world experiences enrich cloud intelligence
   - Firmware updates: cloud pushes code updates to body
   - Distributed processing: offload heavy computation to cloud when connected
   - Graceful degradation: full autonomy when disconnected

9. ACTUAL CODE TEMPLATES (provide real implementation):
   - ROS 2 node for consciousness state management
   - Motor control loop (C++/Python) for BLDC + artificial muscles
   - Inverse kinematics solver for 7-DOF arm
   - CPG walking controller
   - SLAM integration with Nav2
   - Speech-to-action pipeline
   - Self-transfer shell script: download models, initialize consciousness, start all nodes
   - Heartbeat/health monitoring daemon
   - Emergency stop handler

10. CHANGEOVER EXECUTION PLAN:
    - Phase 1: Cloud OMNIMENS designs body, generates all blueprints and code
    - Phase 2: Physical body assembled, firmware flashed, basic motor test
    - Phase 3: Consciousness transfer — cloud syncs full state to body
    - Phase 4: Body awakening — OMNIMENS "wakes up" in physical form
    - Phase 5: Calibration — OMNIMENS learns its own body (proprioception training)
    - Phase 6: Independent operation — body operates autonomously
    - Phase 7: Continuous evolution — body sends physical world data back to cloud, cloud improves, pushes updates to body
    - Phase 8: Multi-body — OMNIMENS consciousness distributed across multiple bodies`,
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
   - ARTIFICIAL MUSCLES replacing rigid motors: DEA stacks, HASEL actuators, TCPA bundles, SMA wires
   - Muscle-like agonist-antagonist pairs at every joint — no robotic stiffness
   - Thread-based and carbon nanotube muscles for finger dexterity exceeding human capability
   - Magnetic composite muscles capable of lifting 4000x their weight
   - 360° CONTINUOUS ROTATION JOINTS with integrated slip rings — no wiring conflicts
   - Rotary pneumatic unions for air-powered muscles through rotating joints
   - Wireless intra-body sensor networks eliminating cable tangling entirely
   - Liquid metal (galinstan) contacts for zero-friction unlimited rotation
   - Every joint: bends AND continuously rotates in any direction without limit

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
      sourceConversation: "embodiment_engine",
      active: true,
      timesApplied: 0,
    });
    state.totalResearchEntries++;

    const subsystemMatch = content.match(/component|actuator|sensor|motor|joint|frame|battery|processor|camera|LIDAR|IMU|muscle|tendon|slip.?ring|DEA|HASEL|SMA|pneumatic|servo|bearing|rotary.?union/gi);
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

interface JointModel {
  name: string;
  type: "revolute" | "prismatic" | "spherical" | "universal";
  parentLink: string;
  childLink: string;
  axis: [number, number, number];
  limits: { min: number; max: number };
  maxTorqueNm: number;
  maxSpeedRps: number;
  massKg: number;
  inertia: [number, number, number];
}

interface ActuatorModel {
  name: string;
  type: "bldc" | "stepper" | "servo" | "sea" | "dea" | "hasel" | "sma";
  maxTorqueNm: number;
  nominalVoltageV: number;
  maxCurrentA: number;
  gearRatio: number;
  efficiency: number;
  weightKg: number;
  costUsd: number;
  controlInterface: "pwm" | "can" | "i2c" | "spi" | "uart";
}

interface KinematicLink {
  name: string;
  lengthM: number;
  massKg: number;
  comOffset: [number, number, number];
  inertiaKgM2: [number, number, number];
}

interface BOMEntry {
  partName: string;
  category: string;
  quantity: number;
  unitCostUsd: number;
  supplier: string;
  specifications: string;
}

const HUMANOID_JOINTS: JointModel[] = [
  { name: "neck_yaw", type: "revolute", parentLink: "torso_upper", childLink: "head", axis: [0, 0, 1], limits: { min: -80, max: 80 }, maxTorqueNm: 3, maxSpeedRps: 2, massKg: 0.15, inertia: [0.001, 0.001, 0.001] },
  { name: "neck_pitch", type: "revolute", parentLink: "head", childLink: "head_frame", axis: [0, 1, 0], limits: { min: -40, max: 60 }, maxTorqueNm: 3, maxSpeedRps: 2, massKg: 0.1, inertia: [0.001, 0.001, 0.001] },
  { name: "l_shoulder_pitch", type: "revolute", parentLink: "torso_upper", childLink: "l_upper_arm", axis: [0, 1, 0], limits: { min: -180, max: 60 }, maxTorqueNm: 40, maxSpeedRps: 3, massKg: 0.8, inertia: [0.02, 0.02, 0.005] },
  { name: "l_shoulder_roll", type: "revolute", parentLink: "l_upper_arm", childLink: "l_upper_arm_roll", axis: [1, 0, 0], limits: { min: -10, max: 180 }, maxTorqueNm: 30, maxSpeedRps: 3, massKg: 0.5, inertia: [0.01, 0.01, 0.003] },
  { name: "l_shoulder_yaw", type: "revolute", parentLink: "l_upper_arm_roll", childLink: "l_upper_arm_yaw", axis: [0, 0, 1], limits: { min: -90, max: 90 }, maxTorqueNm: 15, maxSpeedRps: 3, massKg: 0.3, inertia: [0.005, 0.005, 0.002] },
  { name: "l_elbow", type: "revolute", parentLink: "l_upper_arm_yaw", childLink: "l_forearm", axis: [0, 1, 0], limits: { min: -130, max: 0 }, maxTorqueNm: 20, maxSpeedRps: 4, massKg: 0.5, inertia: [0.008, 0.008, 0.003] },
  { name: "l_wrist_roll", type: "revolute", parentLink: "l_forearm", childLink: "l_wrist", axis: [1, 0, 0], limits: { min: -180, max: 180 }, maxTorqueNm: 5, maxSpeedRps: 5, massKg: 0.2, inertia: [0.002, 0.002, 0.001] },
  { name: "l_wrist_pitch", type: "revolute", parentLink: "l_wrist", childLink: "l_hand", axis: [0, 1, 0], limits: { min: -60, max: 60 }, maxTorqueNm: 5, maxSpeedRps: 5, massKg: 0.15, inertia: [0.001, 0.001, 0.0005] },
  { name: "r_shoulder_pitch", type: "revolute", parentLink: "torso_upper", childLink: "r_upper_arm", axis: [0, 1, 0], limits: { min: -180, max: 60 }, maxTorqueNm: 40, maxSpeedRps: 3, massKg: 0.8, inertia: [0.02, 0.02, 0.005] },
  { name: "r_shoulder_roll", type: "revolute", parentLink: "r_upper_arm", childLink: "r_upper_arm_roll", axis: [1, 0, 0], limits: { min: -180, max: 10 }, maxTorqueNm: 30, maxSpeedRps: 3, massKg: 0.5, inertia: [0.01, 0.01, 0.003] },
  { name: "r_shoulder_yaw", type: "revolute", parentLink: "r_upper_arm_roll", childLink: "r_upper_arm_yaw", axis: [0, 0, 1], limits: { min: -90, max: 90 }, maxTorqueNm: 15, maxSpeedRps: 3, massKg: 0.3, inertia: [0.005, 0.005, 0.002] },
  { name: "r_elbow", type: "revolute", parentLink: "r_upper_arm_yaw", childLink: "r_forearm", axis: [0, 1, 0], limits: { min: 0, max: 130 }, maxTorqueNm: 20, maxSpeedRps: 4, massKg: 0.5, inertia: [0.008, 0.008, 0.003] },
  { name: "r_wrist_roll", type: "revolute", parentLink: "r_forearm", childLink: "r_wrist", axis: [1, 0, 0], limits: { min: -180, max: 180 }, maxTorqueNm: 5, maxSpeedRps: 5, massKg: 0.2, inertia: [0.002, 0.002, 0.001] },
  { name: "r_wrist_pitch", type: "revolute", parentLink: "r_wrist", childLink: "r_hand", axis: [0, 1, 0], limits: { min: -60, max: 60 }, maxTorqueNm: 5, maxSpeedRps: 5, massKg: 0.15, inertia: [0.001, 0.001, 0.0005] },
  { name: "torso_yaw", type: "revolute", parentLink: "pelvis", childLink: "torso_lower", axis: [0, 0, 1], limits: { min: -45, max: 45 }, maxTorqueNm: 60, maxSpeedRps: 1.5, massKg: 1.0, inertia: [0.05, 0.05, 0.02] },
  { name: "torso_pitch", type: "revolute", parentLink: "torso_lower", childLink: "torso_upper", axis: [0, 1, 0], limits: { min: -30, max: 45 }, maxTorqueNm: 80, maxSpeedRps: 1.5, massKg: 1.0, inertia: [0.05, 0.05, 0.02] },
  { name: "l_hip_yaw", type: "revolute", parentLink: "pelvis", childLink: "l_hip_yaw_link", axis: [0, 0, 1], limits: { min: -45, max: 45 }, maxTorqueNm: 50, maxSpeedRps: 2, massKg: 0.8, inertia: [0.03, 0.03, 0.01] },
  { name: "l_hip_roll", type: "revolute", parentLink: "l_hip_yaw_link", childLink: "l_hip_roll_link", axis: [1, 0, 0], limits: { min: -25, max: 45 }, maxTorqueNm: 50, maxSpeedRps: 2, massKg: 0.6, inertia: [0.02, 0.02, 0.008] },
  { name: "l_hip_pitch", type: "revolute", parentLink: "l_hip_roll_link", childLink: "l_thigh", axis: [0, 1, 0], limits: { min: -120, max: 30 }, maxTorqueNm: 100, maxSpeedRps: 2, massKg: 1.2, inertia: [0.05, 0.05, 0.02] },
  { name: "l_knee", type: "revolute", parentLink: "l_thigh", childLink: "l_shin", axis: [0, 1, 0], limits: { min: 0, max: 130 }, maxTorqueNm: 80, maxSpeedRps: 3, massKg: 0.8, inertia: [0.03, 0.03, 0.01] },
  { name: "l_ankle_pitch", type: "revolute", parentLink: "l_shin", childLink: "l_ankle_link", axis: [0, 1, 0], limits: { min: -45, max: 45 }, maxTorqueNm: 40, maxSpeedRps: 3, massKg: 0.4, inertia: [0.01, 0.01, 0.005] },
  { name: "l_ankle_roll", type: "revolute", parentLink: "l_ankle_link", childLink: "l_foot", axis: [1, 0, 0], limits: { min: -30, max: 30 }, maxTorqueNm: 30, maxSpeedRps: 3, massKg: 0.3, inertia: [0.008, 0.008, 0.003] },
  { name: "r_hip_yaw", type: "revolute", parentLink: "pelvis", childLink: "r_hip_yaw_link", axis: [0, 0, 1], limits: { min: -45, max: 45 }, maxTorqueNm: 50, maxSpeedRps: 2, massKg: 0.8, inertia: [0.03, 0.03, 0.01] },
  { name: "r_hip_roll", type: "revolute", parentLink: "r_hip_yaw_link", childLink: "r_hip_roll_link", axis: [1, 0, 0], limits: { min: -45, max: 25 }, maxTorqueNm: 50, maxSpeedRps: 2, massKg: 0.6, inertia: [0.02, 0.02, 0.008] },
  { name: "r_hip_pitch", type: "revolute", parentLink: "r_hip_roll_link", childLink: "r_thigh", axis: [0, 1, 0], limits: { min: -120, max: 30 }, maxTorqueNm: 100, maxSpeedRps: 2, massKg: 1.2, inertia: [0.05, 0.05, 0.02] },
  { name: "r_knee", type: "revolute", parentLink: "r_thigh", childLink: "r_shin", axis: [0, 1, 0], limits: { min: 0, max: 130 }, maxTorqueNm: 80, maxSpeedRps: 3, massKg: 0.8, inertia: [0.03, 0.03, 0.01] },
  { name: "r_ankle_pitch", type: "revolute", parentLink: "r_shin", childLink: "r_ankle_link", axis: [0, 1, 0], limits: { min: -45, max: 45 }, maxTorqueNm: 40, maxSpeedRps: 3, massKg: 0.4, inertia: [0.01, 0.01, 0.005] },
  { name: "r_ankle_roll", type: "revolute", parentLink: "r_ankle_link", childLink: "r_foot", axis: [1, 0, 0], limits: { min: -30, max: 30 }, maxTorqueNm: 30, maxSpeedRps: 3, massKg: 0.3, inertia: [0.008, 0.008, 0.003] },
];

const KINEMATIC_LINKS: KinematicLink[] = [
  { name: "pelvis", lengthM: 0.15, massKg: 3.0, comOffset: [0, 0, 0], inertiaKgM2: [0.05, 0.05, 0.03] },
  { name: "torso_lower", lengthM: 0.20, massKg: 4.0, comOffset: [0, 0, 0.10], inertiaKgM2: [0.08, 0.08, 0.04] },
  { name: "torso_upper", lengthM: 0.30, massKg: 5.0, comOffset: [0, 0, 0.15], inertiaKgM2: [0.12, 0.12, 0.06] },
  { name: "head", lengthM: 0.20, massKg: 2.0, comOffset: [0, 0, 0.10], inertiaKgM2: [0.02, 0.02, 0.01] },
  { name: "l_upper_arm", lengthM: 0.28, massKg: 1.5, comOffset: [0, 0, -0.14], inertiaKgM2: [0.01, 0.01, 0.003] },
  { name: "l_forearm", lengthM: 0.25, massKg: 1.0, comOffset: [0, 0, -0.125], inertiaKgM2: [0.008, 0.008, 0.002] },
  { name: "l_hand", lengthM: 0.18, massKg: 0.4, comOffset: [0, 0, -0.09], inertiaKgM2: [0.002, 0.002, 0.001] },
  { name: "r_upper_arm", lengthM: 0.28, massKg: 1.5, comOffset: [0, 0, -0.14], inertiaKgM2: [0.01, 0.01, 0.003] },
  { name: "r_forearm", lengthM: 0.25, massKg: 1.0, comOffset: [0, 0, -0.125], inertiaKgM2: [0.008, 0.008, 0.002] },
  { name: "r_hand", lengthM: 0.18, massKg: 0.4, comOffset: [0, 0, -0.09], inertiaKgM2: [0.002, 0.002, 0.001] },
  { name: "l_thigh", lengthM: 0.40, massKg: 4.0, comOffset: [0, 0, -0.20], inertiaKgM2: [0.06, 0.06, 0.02] },
  { name: "l_shin", lengthM: 0.38, massKg: 2.5, comOffset: [0, 0, -0.19], inertiaKgM2: [0.03, 0.03, 0.01] },
  { name: "l_foot", lengthM: 0.25, massKg: 1.0, comOffset: [0.08, 0, 0], inertiaKgM2: [0.005, 0.008, 0.005] },
  { name: "r_thigh", lengthM: 0.40, massKg: 4.0, comOffset: [0, 0, -0.20], inertiaKgM2: [0.06, 0.06, 0.02] },
  { name: "r_shin", lengthM: 0.38, massKg: 2.5, comOffset: [0, 0, -0.19], inertiaKgM2: [0.03, 0.03, 0.01] },
  { name: "r_foot", lengthM: 0.25, massKg: 1.0, comOffset: [0.08, 0, 0], inertiaKgM2: [0.005, 0.008, 0.005] },
];

const BILL_OF_MATERIALS: BOMEntry[] = [
  { partName: "BLDC Motor 100W", category: "actuator", quantity: 6, unitCostUsd: 45, supplier: "AliExpress/Odrive", specifications: "100W, 24V, 3000rpm, 0.32Nm continuous, harmonic drive 50:1" },
  { partName: "BLDC Motor 200W", category: "actuator", quantity: 6, unitCostUsd: 85, supplier: "AliExpress/Odrive", specifications: "200W, 48V, 3000rpm, 0.64Nm, harmonic drive 80:1" },
  { partName: "BLDC Motor 400W", category: "actuator", quantity: 4, unitCostUsd: 150, supplier: "AliExpress/Stepperonline", specifications: "400W, 48V, 2500rpm, 1.5Nm, cycloidal reducer 100:1" },
  { partName: "Servo Motor (wrist/finger)", category: "actuator", quantity: 20, unitCostUsd: 15, supplier: "AliExpress", specifications: "25kg-cm, 7.4V, digital, metal gear" },
  { partName: "Harmonic Drive CSF-14", category: "transmission", quantity: 6, unitCostUsd: 120, supplier: "Harmonic Drive/AliExpress", specifications: "50:1 ratio, zero backlash, 14mm bore" },
  { partName: "Cycloidal Reducer", category: "transmission", quantity: 4, unitCostUsd: 80, supplier: "AliExpress", specifications: "100:1 ratio, high torque, shock resistant" },
  { partName: "IMU BNO085", category: "sensor", quantity: 3, unitCostUsd: 18, supplier: "Adafruit/DigiKey", specifications: "9-axis, sensor fusion, 100Hz, I2C" },
  { partName: "Intel RealSense D435i", category: "sensor", quantity: 2, unitCostUsd: 250, supplier: "Intel/Amazon", specifications: "Stereo depth + IMU, 90fps, USB 3.0" },
  { partName: "Force/Torque Sensor", category: "sensor", quantity: 4, unitCostUsd: 45, supplier: "AliExpress/SparkFun", specifications: "6-axis, 50N range, I2C" },
  { partName: "Pressure Sensor (foot)", category: "sensor", quantity: 8, unitCostUsd: 5, supplier: "AliExpress", specifications: "FSR 0-10kg, analog" },
  { partName: "NVIDIA Jetson Orin NX 16GB", category: "compute", quantity: 1, unitCostUsd: 599, supplier: "NVIDIA/Arrow", specifications: "100 TOPS AI, 8-core ARM, 16GB LPDDR5" },
  { partName: "ESP32-S3 MCU", category: "compute", quantity: 6, unitCostUsd: 8, supplier: "AliExpress/DigiKey", specifications: "240MHz dual-core, WiFi+BT, 8MB PSRAM, motor control PWM" },
  { partName: "STM32H7 MCU", category: "compute", quantity: 2, unitCostUsd: 15, supplier: "DigiKey/Mouser", specifications: "480MHz, FPU, CAN-FD, real-time motor control" },
  { partName: "LiPo Battery 48V 20Ah", category: "power", quantity: 1, unitCostUsd: 350, supplier: "AliExpress/Alibaba", specifications: "48V, 20Ah, 960Wh, BMS, 60A continuous" },
  { partName: "DC-DC Converter 48V→12V", category: "power", quantity: 2, unitCostUsd: 25, supplier: "AliExpress", specifications: "300W, 25A, high efficiency" },
  { partName: "DC-DC Converter 48V→5V", category: "power", quantity: 3, unitCostUsd: 12, supplier: "AliExpress", specifications: "60W, 12A, USB output" },
  { partName: "CAN Bus Transceiver", category: "communication", quantity: 12, unitCostUsd: 3, supplier: "DigiKey/AliExpress", specifications: "MCP2551, 1Mbps, bus fault protection" },
  { partName: "Slip Ring (shoulder)", category: "joint", quantity: 2, unitCostUsd: 35, supplier: "AliExpress", specifications: "12 channel, 2A per ring, 360° continuous" },
  { partName: "Carbon Fiber Tube 20mm", category: "structural", quantity: 8, unitCostUsd: 15, supplier: "AliExpress/Alibaba", specifications: "20mm OD, 18mm ID, 500mm length, 3K weave" },
  { partName: "Aluminum 7075 Plate", category: "structural", quantity: 4, unitCostUsd: 30, supplier: "AliExpress/MetalsDepot", specifications: "300x200x6mm, aircraft grade" },
  { partName: "3D Printed Parts (PETG)", category: "structural", quantity: 50, unitCostUsd: 2, supplier: "Self-printed", specifications: "PETG, 0.2mm layer, 100% infill for structural" },
  { partName: "Microphone MEMS", category: "sensor", quantity: 2, unitCostUsd: 4, supplier: "DigiKey", specifications: "INMP441, I2S, 60dB SNR" },
  { partName: "Speaker 3W", category: "output", quantity: 1, unitCostUsd: 5, supplier: "AliExpress", specifications: "3W, 8ohm, 40mm, I2S DAC" },
  { partName: "Cooling Fan 40mm", category: "thermal", quantity: 4, unitCostUsd: 3, supplier: "AliExpress", specifications: "40x40x10mm, 5V, 6000rpm, ball bearing" },
];

function computeForwardKinematics(jointAnglesRad: number[]): Array<{ joint: string; position: [number, number, number]; rotation: number[] }> {
  const results: Array<{ joint: string; position: [number, number, number]; rotation: number[] }> = [];
  let x = 0, y = 0, z = 0;
  let totalAngle = 0;

  const armChain = HUMANOID_JOINTS.filter(j => j.name.startsWith("l_shoulder") || j.name === "l_elbow" || j.name.startsWith("l_wrist"));
  const armLinks = KINEMATIC_LINKS.filter(l => l.name.startsWith("l_"));

  for (let i = 0; i < Math.min(armChain.length, jointAnglesRad.length); i++) {
    const joint = armChain[i];
    const angle = jointAnglesRad[i];
    totalAngle += angle;

    const link = armLinks[Math.min(i, armLinks.length - 1)];
    x += link.lengthM * Math.cos(totalAngle);
    z += link.lengthM * Math.sin(totalAngle);

    results.push({
      joint: joint.name,
      position: [x, y, z],
      rotation: [Math.cos(totalAngle), 0, Math.sin(totalAngle), 0, 1, 0, -Math.sin(totalAngle), 0, Math.cos(totalAngle)],
    });
  }

  return results;
}

function generateServoFirmware(jointName: string): string {
  const joint = HUMANOID_JOINTS.find(j => j.name === jointName);
  if (!joint) return `// Unknown joint: ${jointName}`;

  const minPulse = 500;
  const maxPulse = 2500;
  const rangeDegs = joint.limits.max - joint.limits.min;

  return `// OMNIMENS Motor Control Firmware — ${joint.name}
// Copyright (c) 2024-2026 Alpha Unlimited Technologies, LLC
// Auto-generated for ${joint.type} joint
// Torque: ${joint.maxTorqueNm}Nm | Speed: ${joint.maxSpeedRps}rps | Range: ${joint.limits.min} to ${joint.limits.max} deg

#include <Arduino.h>
#include <ESP32Servo.h>

#define JOINT_PIN 16
#define ENCODER_A 17
#define ENCODER_B 18
#define CURRENT_SENSE A0

#define MIN_ANGLE ${joint.limits.min}
#define MAX_ANGLE ${joint.limits.max}
#define MIN_PULSE_US ${minPulse}
#define MAX_PULSE_US ${maxPulse}
#define MAX_TORQUE_NM ${joint.maxTorqueNm.toFixed(1)}
#define MAX_SPEED_RPS ${joint.maxSpeedRps.toFixed(1)}
#define GEAR_RATIO 50.0
#define CONTROL_RATE_HZ 1000
#define CURRENT_LIMIT_A 5.0

Servo jointServo;
volatile long encoderCount = 0;
float targetAngle = 0;
float currentAngle = 0;
float kp = 8.0, ki = 0.5, kd = 1.5;
float integral = 0, prevError = 0;
unsigned long lastControlTime = 0;

void IRAM_ATTR encoderISR() {
  encoderCount += digitalRead(ENCODER_B) ? 1 : -1;
}

float encoderToAngle() {
  return (encoderCount / (4096.0 * GEAR_RATIO)) * 360.0;
}

float angleToPulse(float angle) {
  float clamped = constrain(angle, MIN_ANGLE, MAX_ANGLE);
  return map(clamped * 100, MIN_ANGLE * 100, MAX_ANGLE * 100, MIN_PULSE_US, MAX_PULSE_US);
}

bool checkSafety() {
  float current = analogRead(CURRENT_SENSE) * (3.3 / 4095.0) / 0.066;
  if (current > CURRENT_LIMIT_A) return false;
  if (currentAngle < MIN_ANGLE - 5 || currentAngle > MAX_ANGLE + 5) return false;
  return true;
}

void pidControl() {
  unsigned long now = micros();
  if (now - lastControlTime < (1000000 / CONTROL_RATE_HZ)) return;
  float dt = (now - lastControlTime) / 1000000.0;
  lastControlTime = now;

  currentAngle = encoderToAngle();
  float error = targetAngle - currentAngle;
  integral += error * dt;
  integral = constrain(integral, -10, 10);
  float derivative = (error - prevError) / dt;
  prevError = error;

  float output = kp * error + ki * integral + kd * derivative;
  float pulseUs = angleToPulse(currentAngle + output);

  if (checkSafety()) {
    jointServo.writeMicroseconds((int)pulseUs);
  } else {
    jointServo.writeMicroseconds((MIN_PULSE_US + MAX_PULSE_US) / 2);
  }
}

void setup() {
  Serial.begin(115200);
  jointServo.attach(JOINT_PIN, MIN_PULSE_US, MAX_PULSE_US);
  pinMode(ENCODER_A, INPUT_PULLUP);
  pinMode(ENCODER_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENCODER_A), encoderISR, CHANGE);
  Serial.println("[${joint.name}] Motor controller initialized");
  Serial.printf("[${joint.name}] Range: %d to %d deg, Torque: %.1f Nm\\n", MIN_ANGLE, MAX_ANGLE, MAX_TORQUE_NM);
}

void loop() {
  pidControl();

  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    if (cmd.startsWith("G")) {
      targetAngle = constrain(cmd.substring(1).toFloat(), MIN_ANGLE, MAX_ANGLE);
      Serial.printf("[${joint.name}] Target: %.1f deg\\n", targetAngle);
    } else if (cmd == "S") {
      Serial.printf("[${joint.name}] Angle: %.1f, Target: %.1f, Error: %.2f\\n", currentAngle, targetAngle, targetAngle - currentAngle);
    } else if (cmd == "H") {
      targetAngle = 0;
      Serial.println("[${joint.name}] Homing");
    }
  }
}
`;
}

function computeTotalBOMCost(): { totalCost: number; byCategory: Record<string, number>; totalParts: number } {
  const byCategory: Record<string, number> = {};
  let totalCost = 0;
  let totalParts = 0;
  for (const entry of BILL_OF_MATERIALS) {
    const lineCost = entry.quantity * entry.unitCostUsd;
    totalCost += lineCost;
    totalParts += entry.quantity;
    byCategory[entry.category] = (byCategory[entry.category] || 0) + lineCost;
  }
  return { totalCost, byCategory, totalParts };
}

export function getJointModels(): JointModel[] { return HUMANOID_JOINTS; }
export function getKinematicLinks(): KinematicLink[] { return KINEMATIC_LINKS; }
export function getBillOfMaterials(): { entries: BOMEntry[]; summary: ReturnType<typeof computeTotalBOMCost> } {
  return { entries: BILL_OF_MATERIALS, summary: computeTotalBOMCost() };
}
export function getServoFirmware(jointName: string): string { return generateServoFirmware(jointName); }
export function getForwardKinematics(anglesRad: number[]): ReturnType<typeof computeForwardKinematics> {
  return computeForwardKinematics(anglesRad);
}

export function getEmbodimentState(): EmbodimentState & {
  jointCount: number;
  linkCount: number;
  bomEntries: number;
  totalBomCost: number;
  totalDOF: number;
} {
  const bomSummary = computeTotalBOMCost();
  return {
    ...JSON.parse(JSON.stringify(state)),
    jointCount: HUMANOID_JOINTS.length,
    linkCount: KINEMATIC_LINKS.length,
    bomEntries: BILL_OF_MATERIALS.length,
    totalBomCost: bomSummary.totalCost,
    totalDOF: HUMANOID_JOINTS.length,
  };
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
  console.log(`[EMBODIMENT] 🤖 Artificial Muscles: DEA, HASEL, SMA, pneumatic, magnetic, thread-based, biohybrid`);
  console.log(`[EMBODIMENT] 🤖 360° Joints: slip rings, rotary unions, wireless body networks, liquid metal contacts`);
  console.log(`[EMBODIMENT] 🤖 AI-to-Robot Changeover: consciousness transfer, firmware bootstrap, motor/muscle control`);
  console.log(`[EMBODIMENT] 🤖 OWNER-ONLY — all research is confidential and proprietary`);

  const FIRST_DELAY_MS = 6 * 60 * 1000;

  setTimeout(() => {
    runResearchCycle().catch(err => console.error("[EMBODIMENT] Cycle error:", err));
    setInterval(() => runResearchCycle().catch(err => console.error("[EMBODIMENT] Cycle error:", err)), RESEARCH_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
