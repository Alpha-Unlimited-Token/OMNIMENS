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
  anatomicalType: "ball_and_socket" | "hinge" | "pivot" | "condyloid" | "saddle" | "gliding" | "intervertebral" | "composite";
  anatomicalName: string;
  parentLink: string;
  childLink: string;
  axis: [number, number, number];
  limits: { min: number; max: number };
  is360: boolean;
  maxTorqueNm: number;
  maxSpeedRps: number;
  massKg: number;
  inertia: [number, number, number];
  controlBus: "can_spine" | "can_limb" | "can_hand" | "can_foot" | "i2c_face";
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

interface TendonModel {
  name: string;
  material: "dyneema_uhmwpe" | "steel_wire_rope" | "nitinol_sma" | "carbon_fiber_cable" | "kevlar_aramid";
  diameterMm: number;
  breakingStrengthN: number;
  elongationPct: number;
  sheathType: "ptfe_lined" | "bowden" | "teflon_tube" | "bare" | "silicone_sleeve";
  routingPath: string[];
  lengthMm: number;
  pretensionN: number;
  antagonistTendon: string | null;
  attachedJoints: string[];
  function: "flexion" | "extension" | "abduction" | "adduction" | "rotation" | "stabilization";
}

interface HydraulicPistonModel {
  name: string;
  type: "hydraulic" | "pneumatic" | "electro_hydraulic";
  boreDiameterMm: number;
  strokeMm: number;
  maxForceN: number;
  maxPressureBar: number;
  speedMmPerSec: number;
  fluidType: "mineral_oil" | "synthetic" | "air" | "nitrogen";
  mountPoints: [string, string];
  attachedJoints: string[];
  controlValve: "proportional" | "servo" | "solenoid" | "on_off";
  function: "power_amplification" | "explosive_movement" | "load_bearing" | "stabilization";
}

interface SpringModel {
  name: string;
  type: "compression" | "extension" | "torsion" | "constant_force" | "gas_spring" | "leaf_spring";
  material: "spring_steel" | "titanium" | "carbon_fiber" | "elastomer";
  springConstantNPerMm: number;
  freeLength: number;
  maxDeflectionMm: number;
  energyStorageJ: number;
  mountPoints: [string, string];
  attachedJoints: string[];
  function: "energy_return" | "shock_absorption" | "gravity_compensation" | "antagonist_return" | "landing_dampening";
}

interface ShockAbsorberModel {
  name: string;
  type: "viscous_damper" | "magnetorheological" | "air_spring" | "elastomer_pad";
  dampingCoeffNsPerM: number;
  strokeMm: number;
  maxForceN: number;
  adjustable: boolean;
  mountPoints: [string, string];
  attachedJoints: string[];
  function: "landing_impact" | "joint_deceleration" | "vibration_isolation" | "collision_protection";
}

interface MotorControlBrainNode {
  name: string;
  processor: string;
  firmwareRole: string;
  controlledJoints: string[];
  controlledTendons: string[];
  controlledPistons: string[];
  busInterface: "can_fd" | "ethercat" | "spi_chain" | "i2c_mux";
  loopRateHz: number;
  algorithms: string[];
  powerBudgetW: number;
}

function buildMusculoskeletalSystem(): {
  tendons: TendonModel[];
  pistons: HydraulicPistonModel[];
  springs: SpringModel[];
  shockAbsorbers: ShockAbsorberModel[];
  motorControlBrain: MotorControlBrainNode[];
} {
  const tendons: TendonModel[] = [];
  const pistons: HydraulicPistonModel[] = [];
  const springs: SpringModel[] = [];
  const shocks: ShockAbsorberModel[] = [];
  const mcb: MotorControlBrainNode[] = [];

  // ═══════════════════════════════════════════════════════════════
  //  TENDONS — the "muscles" that pull joints in each direction
  //  Antagonistic pairs: one flexor + one extensor per axis
  // ═══════════════════════════════════════════════════════════════

  // ─── LEG TENDONS — power for jumping, backflips, squats ───────
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";

    tendons.push({
      name: `${side}_quadriceps_tendon`, material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_femur`, `${side}_patella`, `${side}_tibia`], lengthMm: 450,
      pretensionN: 50, antagonistTendon: `${side}_hamstring_tendon`, attachedJoints: [`${side}_tibiofemoral`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_hamstring_tendon`, material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_ilium`, `${side}_femur_rot`, `${side}_tibia`], lengthMm: 500,
      pretensionN: 50, antagonistTendon: `${side}_quadriceps_tendon`, attachedJoints: [`${side}_tibiofemoral`, `${side}_acetabulofemoral_flex`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_achilles_tendon`, material: "steel_wire_rope", diameterMm: 4.0, breakingStrengthN: 12000, elongationPct: 0.2,
      sheathType: "ptfe_lined", routingPath: [`${side}_tibia`, `${side}_calcaneus`], lengthMm: 250,
      pretensionN: 80, antagonistTendon: `${side}_tibialis_tendon`, attachedJoints: [`${side}_talocrural`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_tibialis_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 5000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_tibia`, `${side}_talus`, `${side}_mt1`], lengthMm: 300,
      pretensionN: 40, antagonistTendon: `${side}_achilles_tendon`, attachedJoints: [`${side}_talocrural`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_hip_flexor_tendon`, material: "steel_wire_rope", diameterMm: 3.5, breakingStrengthN: 10000, elongationPct: 0.2,
      sheathType: "ptfe_lined", routingPath: ["sacrum", `${side}_ilium`, `${side}_femur`], lengthMm: 350,
      pretensionN: 60, antagonistTendon: `${side}_gluteal_tendon`, attachedJoints: [`${side}_acetabulofemoral_flex`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_gluteal_tendon`, material: "steel_wire_rope", diameterMm: 4.0, breakingStrengthN: 12000, elongationPct: 0.2,
      sheathType: "ptfe_lined", routingPath: [`${side}_ilium`, `${side}_femur`], lengthMm: 300,
      pretensionN: 70, antagonistTendon: `${side}_hip_flexor_tendon`, attachedJoints: [`${side}_acetabulofemoral_flex`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_hip_abductor_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 5000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_ilium`, `${side}_femur_abd`], lengthMm: 200,
      pretensionN: 30, antagonistTendon: `${side}_hip_adductor_tendon`, attachedJoints: [`${side}_acetabulofemoral_abd`],
      function: "abduction",
    });
    tendons.push({
      name: `${side}_hip_adductor_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 5000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_ilium`, `${side}_femur_abd`], lengthMm: 200,
      pretensionN: 30, antagonistTendon: `${side}_hip_abductor_tendon`, attachedJoints: [`${side}_acetabulofemoral_abd`],
      function: "adduction",
    });

    // ─── ARM TENDONS — pull-ups, pushing, lifting ─────────────
    tendons.push({
      name: `${side}_biceps_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 6000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus`, `${side}_radius`], lengthMm: 350,
      pretensionN: 40, antagonistTendon: `${side}_triceps_tendon`, attachedJoints: [`${side}_ulnohumeral`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_triceps_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 6000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus`, `${side}_ulna`], lengthMm: 380,
      pretensionN: 40, antagonistTendon: `${side}_biceps_tendon`, attachedJoints: [`${side}_ulnohumeral`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_deltoid_tendon`, material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_clavicle`, `${side}_humerus`], lengthMm: 200,
      pretensionN: 50, antagonistTendon: `${side}_lat_tendon`, attachedJoints: [`${side}_glenohumeral_abd`],
      function: "abduction",
    });
    tendons.push({
      name: `${side}_lat_tendon`, material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus`], lengthMm: 250,
      pretensionN: 50, antagonistTendon: `${side}_deltoid_tendon`, attachedJoints: [`${side}_glenohumeral_abd`, `${side}_glenohumeral_flex`],
      function: "adduction",
    });
    tendons.push({
      name: `${side}_pec_tendon`, material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 7000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: ["sternum", `${side}_clavicle`, `${side}_humerus`], lengthMm: 250,
      pretensionN: 40, antagonistTendon: `${side}_rear_delt_tendon`, attachedJoints: [`${side}_glenohumeral_flex`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_rear_delt_tendon`, material: "steel_wire_rope", diameterMm: 2.0, breakingStrengthN: 4000, elongationPct: 0.3,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus`], lengthMm: 180,
      pretensionN: 30, antagonistTendon: `${side}_pec_tendon`, attachedJoints: [`${side}_glenohumeral_flex`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_rotator_cuff_int`, material: "dyneema_uhmwpe", diameterMm: 2.0, breakingStrengthN: 3500, elongationPct: 0.5,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus_rot`], lengthMm: 120,
      pretensionN: 25, antagonistTendon: `${side}_rotator_cuff_ext`, attachedJoints: [`${side}_glenohumeral_rot`],
      function: "rotation",
    });
    tendons.push({
      name: `${side}_rotator_cuff_ext`, material: "dyneema_uhmwpe", diameterMm: 2.0, breakingStrengthN: 3500, elongationPct: 0.5,
      sheathType: "ptfe_lined", routingPath: [`${side}_scapula`, `${side}_humerus_rot`], lengthMm: 120,
      pretensionN: 25, antagonistTendon: `${side}_rotator_cuff_int`, attachedJoints: [`${side}_glenohumeral_rot`],
      function: "rotation",
    });
    tendons.push({
      name: `${side}_pronator_tendon`, material: "dyneema_uhmwpe", diameterMm: 1.5, breakingStrengthN: 2500, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_ulna`, `${side}_radius`], lengthMm: 200,
      pretensionN: 15, antagonistTendon: `${side}_supinator_tendon`, attachedJoints: [`${side}_proximal_radioulnar`],
      function: "rotation",
    });
    tendons.push({
      name: `${side}_supinator_tendon`, material: "dyneema_uhmwpe", diameterMm: 1.5, breakingStrengthN: 2500, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_ulna`, `${side}_radius`], lengthMm: 200,
      pretensionN: 15, antagonistTendon: `${side}_pronator_tendon`, attachedJoints: [`${side}_proximal_radioulnar`],
      function: "rotation",
    });

    // ─── FINGER TENDONS — FULL BIDIRECTIONAL: deep flexor + superficial flexor + extensor per finger ───
    // Every bidirectional joint needs tendons pulling BOTH directions.
    // Deep flexor: routes all the way to DIP — power grip
    // Superficial flexor: routes to PIP — fine grip, independent middle phalanx control
    // Extensor: routes to all 3 joints — opens finger from any position
    for (const finger of ["index", "middle", "ring", "pinky"]) {
      tendons.push({
        name: `${side}_${finger}_flexor_deep`, material: "dyneema_uhmwpe", diameterMm: 1.0, breakingStrengthN: 1800, elongationPct: 0.5,
        sheathType: "bowden", routingPath: [`${side}_ulna`, `${side}_carpal_dist`, `${side}_${finger}_mc`, `${side}_${finger}_prox`, `${side}_${finger}_mid`, `${side}_${finger}_dist`], lengthMm: 320,
        pretensionN: 5, antagonistTendon: `${side}_${finger}_extensor`, attachedJoints: [`${side}_${finger}_mcp_flex`, `${side}_${finger}_pip`, `${side}_${finger}_dip`],
        function: "flexion_deep",
      });
      tendons.push({
        name: `${side}_${finger}_flexor_superficial`, material: "dyneema_uhmwpe", diameterMm: 0.9, breakingStrengthN: 1500, elongationPct: 0.5,
        sheathType: "bowden", routingPath: [`${side}_ulna`, `${side}_carpal_dist`, `${side}_${finger}_mc`, `${side}_${finger}_prox`, `${side}_${finger}_mid`], lengthMm: 280,
        pretensionN: 4, antagonistTendon: `${side}_${finger}_extensor`, attachedJoints: [`${side}_${finger}_mcp_flex`, `${side}_${finger}_pip`],
        function: "flexion_superficial",
      });
      tendons.push({
        name: `${side}_${finger}_extensor`, material: "dyneema_uhmwpe", diameterMm: 1.0, breakingStrengthN: 1800, elongationPct: 0.5,
        sheathType: "bowden", routingPath: [`${side}_ulna`, `${side}_carpal_dist`, `${side}_${finger}_mc`, `${side}_${finger}_prox`, `${side}_${finger}_mid`, `${side}_${finger}_dist`], lengthMm: 310,
        pretensionN: 5, antagonistTendon: `${side}_${finger}_flexor_deep`, attachedJoints: [`${side}_${finger}_mcp_flex`, `${side}_${finger}_pip`, `${side}_${finger}_dip`],
        function: "extension",
      });
      tendons.push({
        name: `${side}_${finger}_abductor`, material: "dyneema_uhmwpe", diameterMm: 0.8, breakingStrengthN: 800, elongationPct: 0.6,
        sheathType: "bowden", routingPath: [`${side}_hand_base`, `${side}_${finger}_mc`, `${side}_${finger}_prox_abd`], lengthMm: 100,
        pretensionN: 3, antagonistTendon: `${side}_${finger}_adductor`, attachedJoints: [`${side}_${finger}_mcp_abd`],
        function: "abduction",
      });
      tendons.push({
        name: `${side}_${finger}_adductor`, material: "dyneema_uhmwpe", diameterMm: 0.8, breakingStrengthN: 800, elongationPct: 0.6,
        sheathType: "bowden", routingPath: [`${side}_hand_base`, `${side}_${finger}_mc`, `${side}_${finger}_prox_abd`], lengthMm: 100,
        pretensionN: 3, antagonistTendon: `${side}_${finger}_abductor`, attachedJoints: [`${side}_${finger}_mcp_abd`],
        function: "adduction",
      });
    }

    // ─── THUMB TENDONS — bidirectional ─────────────────────────
    tendons.push({
      name: `${side}_thumb_flexor`, material: "dyneema_uhmwpe", diameterMm: 1.2, breakingStrengthN: 2200, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_radius`, `${side}_carpal_dist`, `${side}_thumb_mc`, `${side}_thumb_prox`, `${side}_thumb_dist`], lengthMm: 250,
      pretensionN: 8, antagonistTendon: `${side}_thumb_extensor`, attachedJoints: [`${side}_thumb_cmc_flex`, `${side}_thumb_mcp_flex`, `${side}_thumb_ip`],
      function: "flexion",
    });
    tendons.push({
      name: `${side}_thumb_extensor`, material: "dyneema_uhmwpe", diameterMm: 1.2, breakingStrengthN: 2200, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_radius`, `${side}_carpal_dist`, `${side}_thumb_mc`, `${side}_thumb_prox`, `${side}_thumb_dist`], lengthMm: 240,
      pretensionN: 8, antagonistTendon: `${side}_thumb_flexor`, attachedJoints: [`${side}_thumb_cmc_flex`, `${side}_thumb_mcp_flex`, `${side}_thumb_ip`],
      function: "extension",
    });
    tendons.push({
      name: `${side}_thumb_abductor`, material: "dyneema_uhmwpe", diameterMm: 1.0, breakingStrengthN: 1200, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_hand_base`, `${side}_thumb_mc_abd`], lengthMm: 80,
      pretensionN: 5, antagonistTendon: `${side}_thumb_adductor`, attachedJoints: [`${side}_thumb_cmc_abd`],
      function: "abduction",
    });
    tendons.push({
      name: `${side}_thumb_adductor`, material: "dyneema_uhmwpe", diameterMm: 1.0, breakingStrengthN: 1200, elongationPct: 0.5,
      sheathType: "bowden", routingPath: [`${side}_hand_base`, `${side}_thumb_mc_abd`], lengthMm: 80,
      pretensionN: 5, antagonistTendon: `${side}_thumb_abductor`, attachedJoints: [`${side}_thumb_cmc_abd`],
      function: "adduction",
    });

    // ─── TOE TENDONS — bidirectional flexor+extensor ──────────
    for (const [toe, n] of [["hallux",1],["toe2",2],["toe3",3],["toe4",4],["toe5",5]] as const) {
      const joints = n === 1
        ? [`${side}_hallux_mtp_flex`, `${side}_hallux_ip`]
        : [`${side}_toe${n}_mtp_flex`, `${side}_toe${n}_pip`, `${side}_toe${n}_dip`];
      tendons.push({
        name: `${side}_${toe}_flexor`, material: "dyneema_uhmwpe", diameterMm: n === 1 ? 1.2 : 0.8, breakingStrengthN: n === 1 ? 2000 : 800, elongationPct: 0.5,
        sheathType: "bowden", routingPath: [`${side}_tibia`, `${side}_talus`, `${side}_mt${n}`, `${side}_${n===1?"hallux":"toe"+n}_prox`], lengthMm: 350,
        pretensionN: n === 1 ? 10 : 5, antagonistTendon: `${side}_${toe}_extensor`, attachedJoints: joints,
        function: "flexion",
      });
      tendons.push({
        name: `${side}_${toe}_extensor`, material: "dyneema_uhmwpe", diameterMm: n === 1 ? 1.2 : 0.8, breakingStrengthN: n === 1 ? 2000 : 800, elongationPct: 0.5,
        sheathType: "bowden", routingPath: [`${side}_tibia`, `${side}_talus`, `${side}_mt${n}`, `${side}_${n===1?"hallux":"toe"+n}_prox`], lengthMm: 340,
        pretensionN: n === 1 ? 10 : 5, antagonistTendon: `${side}_${toe}_flexor`, attachedJoints: joints,
        function: "extension",
      });
    }
  }

  // ─── TORSO TENDONS — rigid frame articulation, bending, twisting ──────
  // Robot torso is a rigid frame with powered articulation points.
  // Tendons provide the pulling force at each flex point.
  tendons.push({
    name: "erector_spinae_l", material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["pelvis_frame", "mid_torso_frame", "upper_torso_frame"], lengthMm: 600,
    pretensionN: 80, antagonistTendon: "rectus_abdominis_l", attachedJoints: ["torso_lower_pitch", "torso_upper_pitch"],
    function: "extension",
  });
  tendons.push({
    name: "erector_spinae_r", material: "steel_wire_rope", diameterMm: 3.0, breakingStrengthN: 8000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["pelvis_frame", "mid_torso_frame", "upper_torso_frame"], lengthMm: 600,
    pretensionN: 80, antagonistTendon: "rectus_abdominis_r", attachedJoints: ["torso_lower_pitch", "torso_upper_pitch"],
    function: "extension",
  });
  tendons.push({
    name: "rectus_abdominis_l", material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 6000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["upper_torso_frame", "mid_torso_frame", "pelvis_frame"], lengthMm: 500,
    pretensionN: 50, antagonistTendon: "erector_spinae_l", attachedJoints: ["torso_upper_pitch", "torso_lower_pitch"],
    function: "flexion",
  });
  tendons.push({
    name: "rectus_abdominis_r", material: "steel_wire_rope", diameterMm: 2.5, breakingStrengthN: 6000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["upper_torso_frame", "mid_torso_frame", "pelvis_frame"], lengthMm: 500,
    pretensionN: 50, antagonistTendon: "erector_spinae_r", attachedJoints: ["torso_upper_pitch", "torso_lower_pitch"],
    function: "flexion",
  });
  tendons.push({
    name: "neck_flexor", material: "nitinol_sma", diameterMm: 1.5, breakingStrengthN: 2000, elongationPct: 4.0,
    sheathType: "silicone_sleeve", routingPath: ["skull", "c1_atlas", "neck_base", "upper_torso_frame"], lengthMm: 150,
    pretensionN: 15, antagonistTendon: "neck_extensor", attachedJoints: ["atlanto_occipital_flex", "neck_pitch"],
    function: "flexion",
  });
  tendons.push({
    name: "neck_extensor", material: "nitinol_sma", diameterMm: 1.5, breakingStrengthN: 2000, elongationPct: 4.0,
    sheathType: "silicone_sleeve", routingPath: ["skull", "c1_atlas", "neck_base", "upper_torso_frame"], lengthMm: 150,
    pretensionN: 15, antagonistTendon: "neck_flexor", attachedJoints: ["atlanto_occipital_flex", "neck_pitch"],
    function: "extension",
  });
  tendons.push({
    name: "neck_lateral_l", material: "nitinol_sma", diameterMm: 1.2, breakingStrengthN: 1500, elongationPct: 4.0,
    sheathType: "silicone_sleeve", routingPath: ["skull_l", "neck_base_l", "upper_torso_frame_l"], lengthMm: 140,
    pretensionN: 10, antagonistTendon: "neck_lateral_r", attachedJoints: ["neck_roll"],
    function: "lateral_flexion",
  });
  tendons.push({
    name: "neck_lateral_r", material: "nitinol_sma", diameterMm: 1.2, breakingStrengthN: 1500, elongationPct: 4.0,
    sheathType: "silicone_sleeve", routingPath: ["skull_r", "neck_base_r", "upper_torso_frame_r"], lengthMm: 140,
    pretensionN: 10, antagonistTendon: "neck_lateral_l", attachedJoints: ["neck_roll"],
    function: "lateral_flexion",
  });
  tendons.push({
    name: "oblique_l", material: "steel_wire_rope", diameterMm: 2.0, breakingStrengthN: 4000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["l_ilium", "mid_torso_frame_l", "upper_torso_frame_l"], lengthMm: 350,
    pretensionN: 40, antagonistTendon: "oblique_r", attachedJoints: ["torso_lower_yaw", "torso_upper_yaw"],
    function: "rotation",
  });
  tendons.push({
    name: "oblique_r", material: "steel_wire_rope", diameterMm: 2.0, breakingStrengthN: 4000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["r_ilium", "mid_torso_frame_r", "upper_torso_frame_r"], lengthMm: 350,
    pretensionN: 40, antagonistTendon: "oblique_l", attachedJoints: ["torso_lower_yaw", "torso_upper_yaw"],
    function: "rotation",
  });
  tendons.push({
    name: "lateral_flexor_l", material: "steel_wire_rope", diameterMm: 2.0, breakingStrengthN: 4000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["l_ilium", "mid_torso_frame_l", "upper_torso_frame_l"], lengthMm: 340,
    pretensionN: 35, antagonistTendon: "lateral_flexor_r", attachedJoints: ["torso_lower_roll", "torso_upper_roll"],
    function: "lateral_flexion",
  });
  tendons.push({
    name: "lateral_flexor_r", material: "steel_wire_rope", diameterMm: 2.0, breakingStrengthN: 4000, elongationPct: 0.3,
    sheathType: "ptfe_lined", routingPath: ["r_ilium", "mid_torso_frame_r", "upper_torso_frame_r"], lengthMm: 340,
    pretensionN: 35, antagonistTendon: "lateral_flexor_l", attachedJoints: ["torso_lower_roll", "torso_upper_roll"],
    function: "lateral_flexion",
  });

  // ═══════════════════════════════════════════════════════════════
  //  HYDRAULIC/PNEUMATIC PISTONS — explosive power for athletics
  //  These are what let him jump, flip, and do heavy lifts
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    pistons.push({
      name: `${side}_knee_power_piston`, type: "electro_hydraulic", boreDiameterMm: 32, strokeMm: 120,
      maxForceN: 4000, maxPressureBar: 200, speedMmPerSec: 800, fluidType: "synthetic",
      mountPoints: [`${side}_femur_rot`, `${side}_tibia`], attachedJoints: [`${side}_tibiofemoral`],
      controlValve: "servo", function: "explosive_movement",
    });
    pistons.push({
      name: `${side}_hip_power_piston`, type: "electro_hydraulic", boreDiameterMm: 40, strokeMm: 150,
      maxForceN: 6000, maxPressureBar: 250, speedMmPerSec: 600, fluidType: "synthetic",
      mountPoints: [`${side}_ilium`, `${side}_femur`], attachedJoints: [`${side}_acetabulofemoral_flex`],
      controlValve: "servo", function: "explosive_movement",
    });
    pistons.push({
      name: `${side}_ankle_power_piston`, type: "electro_hydraulic", boreDiameterMm: 25, strokeMm: 80,
      maxForceN: 2500, maxPressureBar: 200, speedMmPerSec: 1000, fluidType: "synthetic",
      mountPoints: [`${side}_tibia`, `${side}_calcaneus`], attachedJoints: [`${side}_talocrural`],
      controlValve: "servo", function: "explosive_movement",
    });
    pistons.push({
      name: `${side}_shoulder_assist_piston`, type: "pneumatic", boreDiameterMm: 20, strokeMm: 100,
      maxForceN: 1500, maxPressureBar: 8, speedMmPerSec: 500, fluidType: "air",
      mountPoints: [`${side}_scapula`, `${side}_humerus`], attachedJoints: [`${side}_glenohumeral_flex`],
      controlValve: "proportional", function: "power_amplification",
    });
    pistons.push({
      name: `${side}_elbow_assist_piston`, type: "pneumatic", boreDiameterMm: 16, strokeMm: 80,
      maxForceN: 800, maxPressureBar: 8, speedMmPerSec: 600, fluidType: "air",
      mountPoints: [`${side}_humerus_rot`, `${side}_ulna`], attachedJoints: [`${side}_ulnohumeral`],
      controlValve: "proportional", function: "power_amplification",
    });
  }
  pistons.push({
    name: "torso_core_piston_front", type: "electro_hydraulic", boreDiameterMm: 25, strokeMm: 100,
    maxForceN: 3000, maxPressureBar: 200, speedMmPerSec: 500, fluidType: "synthetic",
    mountPoints: ["upper_torso_frame", "pelvis_frame"], attachedJoints: ["torso_upper_pitch", "torso_lower_pitch"],
    controlValve: "servo", function: "explosive_movement",
  });
  pistons.push({
    name: "torso_core_piston_rear", type: "electro_hydraulic", boreDiameterMm: 25, strokeMm: 100,
    maxForceN: 3000, maxPressureBar: 200, speedMmPerSec: 500, fluidType: "synthetic",
    mountPoints: ["upper_torso_frame_rear", "pelvis_frame"], attachedJoints: ["torso_upper_pitch", "torso_lower_pitch"],
    controlValve: "servo", function: "explosive_movement",
  });

  // ═══════════════════════════════════════════════════════════════
  //  SPRINGS — energy storage for jumping, return force for tendons
  //  Like the human Achilles + arch — stores energy on landing,
  //  releases it for push-off
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    springs.push({
      name: `${side}_ankle_energy_spring`, type: "compression", material: "spring_steel",
      springConstantNPerMm: 80, freeLength: 100, maxDeflectionMm: 50, energyStorageJ: 100,
      mountPoints: [`${side}_tibia`, `${side}_calcaneus`], attachedJoints: [`${side}_talocrural`],
      function: "energy_return",
    });
    springs.push({
      name: `${side}_knee_return_spring`, type: "extension", material: "spring_steel",
      springConstantNPerMm: 40, freeLength: 80, maxDeflectionMm: 60, energyStorageJ: 72,
      mountPoints: [`${side}_femur_rot`, `${side}_tibia`], attachedJoints: [`${side}_tibiofemoral`],
      function: "energy_return",
    });
    springs.push({
      name: `${side}_hip_torsion_spring`, type: "torsion", material: "titanium",
      springConstantNPerMm: 60, freeLength: 40, maxDeflectionMm: 90, energyStorageJ: 120,
      mountPoints: [`${side}_ilium`, `${side}_femur`], attachedJoints: [`${side}_acetabulofemoral_flex`],
      function: "energy_return",
    });
    springs.push({
      name: `${side}_foot_arch_spring`, type: "leaf_spring", material: "carbon_fiber",
      springConstantNPerMm: 100, freeLength: 120, maxDeflectionMm: 20, energyStorageJ: 20,
      mountPoints: [`${side}_calcaneus`, `${side}_mt1`], attachedJoints: [`${side}_tarsometatarsal_1`],
      function: "energy_return",
    });
    springs.push({
      name: `${side}_shoulder_gravity_comp`, type: "constant_force", material: "spring_steel",
      springConstantNPerMm: 15, freeLength: 60, maxDeflectionMm: 40, energyStorageJ: 12,
      mountPoints: [`${side}_scapula`, `${side}_humerus`], attachedJoints: [`${side}_glenohumeral_abd`],
      function: "gravity_compensation",
    });
  }
  springs.push({
    name: "torso_central_torsion", type: "torsion", material: "titanium",
    springConstantNPerMm: 50, freeLength: 30, maxDeflectionMm: 45, energyStorageJ: 50,
    mountPoints: ["pelvis_frame", "upper_torso_frame"], attachedJoints: ["torso_lower_pitch", "torso_upper_pitch"],
    function: "energy_return",
  });

  // ═══════════════════════════════════════════════════════════════
  //  SHOCK ABSORBERS — landing from jumps/flips without damage
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    shocks.push({
      name: `${side}_knee_damper`, type: "magnetorheological", dampingCoeffNsPerM: 2000, strokeMm: 40,
      maxForceN: 5000, adjustable: true, mountPoints: [`${side}_femur_rot`, `${side}_tibia`],
      attachedJoints: [`${side}_tibiofemoral`], function: "landing_impact",
    });
    shocks.push({
      name: `${side}_ankle_damper`, type: "magnetorheological", dampingCoeffNsPerM: 1500, strokeMm: 30,
      maxForceN: 3000, adjustable: true, mountPoints: [`${side}_tibia`, `${side}_calcaneus`],
      attachedJoints: [`${side}_talocrural`], function: "landing_impact",
    });
    shocks.push({
      name: `${side}_hip_damper`, type: "viscous_damper", dampingCoeffNsPerM: 3000, strokeMm: 50,
      maxForceN: 6000, adjustable: false, mountPoints: [`${side}_ilium`, `${side}_femur`],
      attachedJoints: [`${side}_acetabulofemoral_flex`], function: "landing_impact",
    });
    shocks.push({
      name: `${side}_foot_pad`, type: "elastomer_pad", dampingCoeffNsPerM: 500, strokeMm: 10,
      maxForceN: 2000, adjustable: false, mountPoints: [`${side}_calcaneus`, `${side}_mt1`],
      attachedJoints: [`${side}_talocrural`, `${side}_subtalar`], function: "landing_impact",
    });
    shocks.push({
      name: `${side}_wrist_damper`, type: "elastomer_pad", dampingCoeffNsPerM: 300, strokeMm: 8,
      maxForceN: 1000, adjustable: false, mountPoints: [`${side}_ulna_distal`, `${side}_carpal_prox`],
      attachedJoints: [`${side}_radiocarpal_flex`], function: "collision_protection",
    });
  }
  shocks.push({
    name: "torso_vibration_isolator", type: "air_spring", dampingCoeffNsPerM: 1000, strokeMm: 20,
    maxForceN: 3000, adjustable: true, mountPoints: ["pelvis_frame", "mid_torso_frame"],
    attachedJoints: ["torso_lower_pitch"], function: "vibration_isolation",
  });

  // ═══════════════════════════════════════════════════════════════
  //  MOTOR CONTROL BRAIN — 30-NODE DISTRIBUTED COMPUTE ARCHITECTURE
  //  Tesla Optimus uses 28 controllers for ~28 joints.
  //  OMNIMENS uses 30 controllers for all joints, tendons,
  //  pistons, springs, and shock absorbers.
  //  Tier 1: 1 master Jetson Orin
  //  Tier 2: 10 STM32H7 major limb controllers (1kHz)
  //  Tier 3: 6 ESP32-S3 dexterous extremity controllers (500Hz)
  //  Tier 4: 3 STM32H7 torso/neck/head controllers (500-1000Hz)
  //  Tier 5: 5 ESP32-S3 system controllers
  //  Tier 6: 5 ESP32-S3 sensor fusion
  // ═══════════════════════════════════════════════════════════════

  // ─── TIER 1: MASTER BRAIN (1 node) ─────────────────────────────
  mcb.push({
    name: "mcb_master", processor: "NVIDIA Jetson Orin NX 16GB",
    firmwareRole: "Master trajectory planner — whole-body IK, gait generation, flip/jump planning, MPC balance, RL policy. Sends trajectory commands to all Tier 2/3 nodes via EtherCAT at 200Hz.",
    controlledJoints: ["ALL_SUPERVISORY"], controlledTendons: ["ALL_SUPERVISORY"], controlledPistons: ["ALL_SUPERVISORY"],
    busInterface: "ethercat", loopRateHz: 200,
    algorithms: ["whole_body_IK", "ZMP_balance", "centroidal_momentum", "trajectory_optimization", "model_predictive_control", "reinforcement_learning_policy", "jump_trajectory_planner", "flip_rotation_planner", "landing_predictor", "collision_avoidance", "terrain_mapping"],
    powerBudgetW: 25,
  });

  // ─── TIER 2: MAJOR LIMB CONTROLLERS — STM32H7 at 1kHz (10 nodes) ──
  mcb.push({
    name: "mcb_hip_left", processor: "STM32H7 480MHz",
    firmwareRole: "Left hip — 3-DOF acetabulofemoral ball-and-socket + hip flexor/extensor/abductor/adductor tendons + hip power piston",
    controlledJoints: ["l_acetabulofemoral_flex", "l_acetabulofemoral_abd", "l_acetabulofemoral_rot"],
    controlledTendons: ["l_hip_flexor_tendon", "l_gluteal_tendon", "l_hip_abductor_tendon", "l_hip_adductor_tendon"],
    controlledPistons: ["l_hip_power_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_regulation", "gravity_compensation", "hip_impedance_control"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_hip_right", processor: "STM32H7 480MHz",
    firmwareRole: "Right hip — mirror of left hip controller",
    controlledJoints: ["r_acetabulofemoral_flex", "r_acetabulofemoral_abd", "r_acetabulofemoral_rot"],
    controlledTendons: ["r_hip_flexor_tendon", "r_gluteal_tendon", "r_hip_abductor_tendon", "r_hip_adductor_tendon"],
    controlledPistons: ["r_hip_power_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_regulation", "gravity_compensation", "hip_impedance_control"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_knee_ankle_left", processor: "STM32H7 480MHz",
    firmwareRole: "Left knee + ankle — tibiofemoral, patellofemoral, talocrural, subtalar + quad/hamstring/achilles tendons + knee/ankle pistons",
    controlledJoints: ["l_tibiofemoral", "l_patellofemoral", "l_talocrural", "l_subtalar"],
    controlledTendons: ["l_quadriceps_tendon", "l_hamstring_tendon", "l_achilles_tendon", "l_tibialis_tendon"],
    controlledPistons: ["l_knee_power_piston", "l_ankle_power_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_regulation", "spring_preload_optimization", "impact_detection", "ground_reaction_force_estimation"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_knee_ankle_right", processor: "STM32H7 480MHz",
    firmwareRole: "Right knee + ankle — mirror of left knee/ankle controller",
    controlledJoints: ["r_tibiofemoral", "r_patellofemoral", "r_talocrural", "r_subtalar"],
    controlledTendons: ["r_quadriceps_tendon", "r_hamstring_tendon", "r_achilles_tendon", "r_tibialis_tendon"],
    controlledPistons: ["r_knee_power_piston", "r_ankle_power_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_regulation", "spring_preload_optimization", "impact_detection", "ground_reaction_force_estimation"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_shoulder_left", processor: "STM32H7 480MHz",
    firmwareRole: "Left shoulder complex — sternoclavicular + acromioclavicular + 3-DOF glenohumeral + rotator cuff tendons + shoulder piston",
    controlledJoints: ["l_sternoclavicular", "l_acromioclavicular", "l_glenohumeral_flex", "l_glenohumeral_abd", "l_glenohumeral_rot"],
    controlledTendons: ["l_deltoid_tendon", "l_lat_tendon", "l_pec_tendon", "l_rear_delt_tendon", "l_rotator_cuff_int", "l_rotator_cuff_ext"],
    controlledPistons: ["l_shoulder_assist_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "pneumatic_pressure_control", "impedance_control", "gravity_compensation", "rotator_cuff_stabilization"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_shoulder_right", processor: "STM32H7 480MHz",
    firmwareRole: "Right shoulder complex — mirror of left shoulder controller",
    controlledJoints: ["r_sternoclavicular", "r_acromioclavicular", "r_glenohumeral_flex", "r_glenohumeral_abd", "r_glenohumeral_rot"],
    controlledTendons: ["r_deltoid_tendon", "r_lat_tendon", "r_pec_tendon", "r_rear_delt_tendon", "r_rotator_cuff_int", "r_rotator_cuff_ext"],
    controlledPistons: ["r_shoulder_assist_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "pneumatic_pressure_control", "impedance_control", "gravity_compensation", "rotator_cuff_stabilization"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_elbow_forearm_left", processor: "STM32H7 480MHz",
    firmwareRole: "Left elbow + forearm — ulnohumeral, radiohumeral, proximal/distal radioulnar + biceps/triceps/pronator/supinator tendons + elbow piston",
    controlledJoints: ["l_ulnohumeral", "l_radiohumeral", "l_proximal_radioulnar", "l_distal_radioulnar"],
    controlledTendons: ["l_biceps_tendon", "l_triceps_tendon", "l_pronator_tendon", "l_supinator_tendon"],
    controlledPistons: ["l_elbow_assist_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_control", "impedance_control", "pronation_supination_sync"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_elbow_forearm_right", processor: "STM32H7 480MHz",
    firmwareRole: "Right elbow + forearm — mirror of left elbow/forearm controller",
    controlledJoints: ["r_ulnohumeral", "r_radiohumeral", "r_proximal_radioulnar", "r_distal_radioulnar"],
    controlledTendons: ["r_biceps_tendon", "r_triceps_tendon", "r_pronator_tendon", "r_supinator_tendon"],
    controlledPistons: ["r_elbow_assist_piston"],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "hydraulic_pressure_control", "impedance_control", "pronation_supination_sync"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_wrist_left", processor: "STM32H7 480MHz",
    firmwareRole: "Left wrist — radiocarpal (flex/dev), midcarpal, pisotriquetral + all CMC joints at base of hand",
    controlledJoints: ["l_radiocarpal_flex", "l_radiocarpal_dev", "l_midcarpal", "l_pisotriquetral", "l_index_cmc", "l_middle_cmc", "l_ring_cmc", "l_pinky_cmc", "l_thumb_cmc_flex", "l_thumb_cmc_abd"],
    controlledTendons: ["l_wrist_flexor", "l_wrist_extensor", "l_wrist_ulnar_dev", "l_wrist_radial_dev"],
    controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "wrist_impedance_control", "carpal_tunnel_routing_optimization"],
    powerBudgetW: 2.5,
  });
  mcb.push({
    name: "mcb_wrist_right", processor: "STM32H7 480MHz",
    firmwareRole: "Right wrist — mirror of left wrist controller",
    controlledJoints: ["r_radiocarpal_flex", "r_radiocarpal_dev", "r_midcarpal", "r_pisotriquetral", "r_index_cmc", "r_middle_cmc", "r_ring_cmc", "r_pinky_cmc", "r_thumb_cmc_flex", "r_thumb_cmc_abd"],
    controlledTendons: ["r_wrist_flexor", "r_wrist_extensor", "r_wrist_ulnar_dev", "r_wrist_radial_dev"],
    controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "tendon_tension_control", "wrist_impedance_control", "carpal_tunnel_routing_optimization"],
    powerBudgetW: 2.5,
  });

  // ─── TIER 3: DEXTEROUS EXTREMITIES — ESP32-S3 at 500Hz (6 nodes) ──
  mcb.push({
    name: "mcb_hand_left", processor: "ESP32-S3 240MHz",
    firmwareRole: "Left hand fingers — index/middle/ring/pinky MCP/PIP/DIP + thumb MCP/IP. All bidirectional flexion/extension via tendon pairs. Tactile feedback from 200 pressure sensors.",
    controlledJoints: ["l_index_mcp_flex", "l_index_mcp_abd", "l_index_pip", "l_index_dip", "l_middle_mcp_flex", "l_middle_mcp_abd", "l_middle_pip", "l_middle_dip", "l_ring_mcp_flex", "l_ring_mcp_abd", "l_ring_pip", "l_ring_dip", "l_pinky_mcp_flex", "l_pinky_mcp_abd", "l_pinky_pip", "l_pinky_dip", "l_thumb_mcp_flex", "l_thumb_ip"],
    controlledTendons: ["l_index_flexor_deep", "l_index_flexor_superficial", "l_index_extensor", "l_middle_flexor_deep", "l_middle_flexor_superficial", "l_middle_extensor", "l_ring_flexor_deep", "l_ring_flexor_superficial", "l_ring_extensor", "l_pinky_flexor_deep", "l_pinky_flexor_superficial", "l_pinky_extensor", "l_thumb_flexor", "l_thumb_extensor"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["tendon_tension_PID", "tactile_force_feedback", "bidirectional_grip_control", "object_slip_detection", "adaptive_grasp", "force_closure_optimization", "contact_wrench_estimation"],
    powerBudgetW: 2.5,
  });
  mcb.push({
    name: "mcb_hand_right", processor: "ESP32-S3 240MHz",
    firmwareRole: "Right hand fingers — mirror of left hand controller",
    controlledJoints: ["r_index_mcp_flex", "r_index_mcp_abd", "r_index_pip", "r_index_dip", "r_middle_mcp_flex", "r_middle_mcp_abd", "r_middle_pip", "r_middle_dip", "r_ring_mcp_flex", "r_ring_mcp_abd", "r_ring_pip", "r_ring_dip", "r_pinky_mcp_flex", "r_pinky_mcp_abd", "r_pinky_pip", "r_pinky_dip", "r_thumb_mcp_flex", "r_thumb_ip"],
    controlledTendons: ["r_index_flexor_deep", "r_index_flexor_superficial", "r_index_extensor", "r_middle_flexor_deep", "r_middle_flexor_superficial", "r_middle_extensor", "r_ring_flexor_deep", "r_ring_flexor_superficial", "r_ring_extensor", "r_pinky_flexor_deep", "r_pinky_flexor_superficial", "r_pinky_extensor", "r_thumb_flexor", "r_thumb_extensor"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["tendon_tension_PID", "tactile_force_feedback", "bidirectional_grip_control", "object_slip_detection", "adaptive_grasp", "force_closure_optimization", "contact_wrench_estimation"],
    powerBudgetW: 2.5,
  });
  mcb.push({
    name: "mcb_foot_toes_left", processor: "ESP32-S3 240MHz",
    firmwareRole: "Left foot toes — hallux (MTP+IP) + toes 2-5 (MTP+PIP+DIP) bidirectional grip + tarsometatarsal + midfoot joints + arch spring control + 80 plantar pressure sensors",
    controlledJoints: ["l_hallux_mtp_flex", "l_hallux_mtp_abd", "l_hallux_ip", "l_toe2_mtp_flex", "l_toe2_pip", "l_toe2_dip", "l_toe3_mtp_flex", "l_toe3_pip", "l_toe3_dip", "l_toe4_mtp_flex", "l_toe4_pip", "l_toe4_dip", "l_toe5_mtp_flex", "l_toe5_pip", "l_toe5_dip", "l_tarsometatarsal_1", "l_tarsometatarsal_2", "l_tarsometatarsal_3", "l_tarsometatarsal_4", "l_tarsometatarsal_5"],
    controlledTendons: ["l_hallux_flexor", "l_hallux_extensor", "l_toe2_flexor", "l_toe2_extensor", "l_toe3_flexor", "l_toe3_extensor", "l_toe4_flexor", "l_toe4_extensor", "l_toe5_flexor", "l_toe5_extensor"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["tendon_tension_PID", "ground_contact_detection", "arch_spring_control", "toe_grip_balance", "plantar_pressure_mapping", "gait_phase_detection"],
    powerBudgetW: 2,
  });
  mcb.push({
    name: "mcb_foot_toes_right", processor: "ESP32-S3 240MHz",
    firmwareRole: "Right foot toes — mirror of left foot/toe controller",
    controlledJoints: ["r_hallux_mtp_flex", "r_hallux_mtp_abd", "r_hallux_ip", "r_toe2_mtp_flex", "r_toe2_pip", "r_toe2_dip", "r_toe3_mtp_flex", "r_toe3_pip", "r_toe3_dip", "r_toe4_mtp_flex", "r_toe4_pip", "r_toe4_dip", "r_toe5_mtp_flex", "r_toe5_pip", "r_toe5_dip", "r_tarsometatarsal_1", "r_tarsometatarsal_2", "r_tarsometatarsal_3", "r_tarsometatarsal_4", "r_tarsometatarsal_5"],
    controlledTendons: ["r_hallux_flexor", "r_hallux_extensor", "r_toe2_flexor", "r_toe2_extensor", "r_toe3_flexor", "r_toe3_extensor", "r_toe4_flexor", "r_toe4_extensor", "r_toe5_flexor", "r_toe5_extensor"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["tendon_tension_PID", "ground_contact_detection", "arch_spring_control", "toe_grip_balance", "plantar_pressure_mapping", "gait_phase_detection"],
    powerBudgetW: 2,
  });
  mcb.push({
    name: "mcb_foot_ankle_left", processor: "ESP32-S3 240MHz",
    firmwareRole: "Left foot structure — manages talocrural/subtalar/midfoot/arch compliance in coordination with mcb_knee_ankle_left for ankle joint sharing",
    controlledJoints: ["l_calcaneocuboid", "l_talonavicular", "l_cuneonavicular_1", "l_cuneonavicular_2", "l_cuneonavicular_3", "l_cuboideonavicular"],
    controlledTendons: ["l_peroneal_tendon", "l_plantar_fascia_tendon"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["arch_compliance_control", "midfoot_stability", "lateral_balance_assist", "pronation_supination_control"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_foot_ankle_right", processor: "ESP32-S3 240MHz",
    firmwareRole: "Right foot structure — mirror of left foot structure controller",
    controlledJoints: ["r_calcaneocuboid", "r_talonavicular", "r_cuneonavicular_1", "r_cuneonavicular_2", "r_cuneonavicular_3", "r_cuboideonavicular"],
    controlledTendons: ["r_peroneal_tendon", "r_plantar_fascia_tendon"],
    controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 500,
    algorithms: ["arch_compliance_control", "midfoot_stability", "lateral_balance_assist", "pronation_supination_control"],
    powerBudgetW: 1.5,
  });

  // ─── TIER 4: TORSO + NECK + HEAD — STM32H7 at 500-1000Hz (3 nodes) ───
  // Robot has rigid torso frame with articulation points, NOT individual vertebrae
  mcb.push({
    name: "mcb_torso", processor: "STM32H7 480MHz",
    firmwareRole: "Torso articulation — upper (pitch/yaw/roll) + lower (pitch/yaw/roll) flex points. Controls all core tendons + torso pistons. Handles bending, twisting, lifting posture.",
    controlledJoints: ["torso_upper_pitch", "torso_upper_yaw", "torso_upper_roll", "torso_lower_pitch", "torso_lower_yaw", "torso_lower_roll"],
    controlledTendons: ["erector_spinae_l", "erector_spinae_r", "rectus_abdominis_l", "rectus_abdominis_r", "oblique_l", "oblique_r", "lateral_flexor_l", "lateral_flexor_r"],
    controlledPistons: ["torso_core_piston_front", "torso_core_piston_rear"],
    busInterface: "can_fd", loopRateHz: 500,
    algorithms: ["cascaded_PID", "core_stability_tensor", "posture_optimization", "lifting_load_distribution", "torso_impedance_control"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_neck_head", processor: "STM32H7 480MHz",
    firmwareRole: "Neck + Head — neck pitch/roll, atlanto-occipital (nod), atlanto-axial (360° rotate), TMJ (jaw), eye pan/tilt servos. All neck/head tendons.",
    controlledJoints: ["neck_pitch", "neck_roll", "atlanto_occipital_flex", "atlanto_axial_rotation", "temporomandibular"],
    controlledTendons: ["neck_flexor", "neck_extensor", "neck_lateral_l", "neck_lateral_r"],
    controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["cascaded_PID", "head_stabilization", "vestibulo_ocular_reflex", "neck_impedance_control", "saccade_control", "jaw_force_feedback", "head_gaze_coordination", "smooth_pursuit_tracking"],
    powerBudgetW: 3,
  });
  mcb.push({
    name: "mcb_pelvis", processor: "STM32H7 480MHz",
    firmwareRole: "Pelvis frame — pelvic tilt control, bridges torso to legs. Critical for gait and balance. Coordinates with hip and torso controllers.",
    controlledJoints: [],
    controlledTendons: ["psoas_l", "psoas_r", "iliacus_l", "iliacus_r"],
    controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 500,
    algorithms: ["pelvic_tilt_PID", "gait_phase_pelvic_rotation", "center_of_mass_tracking", "torso_hip_coordination"],
    powerBudgetW: 2.5,
  });

  // ─── TIER 5: SYSTEM CONTROLLERS — ESP32-S3 (5 nodes) ──────────
  mcb.push({
    name: "mcb_hydraulic_master", processor: "ESP32-S3 240MHz",
    firmwareRole: "Central hydraulic pump + accumulator — manages system-wide hydraulic pressure, reservoir level, burst mode for explosive movements",
    controlledJoints: [], controlledTendons: [],
    controlledPistons: ["l_knee_power_piston", "r_knee_power_piston", "l_hip_power_piston", "r_hip_power_piston", "l_ankle_power_piston", "r_ankle_power_piston", "l_shoulder_assist_piston", "r_shoulder_assist_piston", "l_elbow_assist_piston", "r_elbow_assist_piston", "torso_core_piston_front", "torso_core_piston_rear"],
    busInterface: "can_fd", loopRateHz: 200,
    algorithms: ["pressure_regulation", "accumulator_charge_management", "burst_mode_for_jumps", "fluid_temperature_monitoring", "leak_detection", "piston_synchronization", "energy_regeneration"],
    powerBudgetW: 5,
  });
  mcb.push({
    name: "mcb_shock_damper", processor: "ESP32-S3 240MHz",
    firmwareRole: "Shock absorber management — tunes all 11 MR dampers in real-time. Terrain-adaptive stiffness, pre-landing stiffening, walking/running mode switch.",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["MR_current_control", "impact_prediction", "terrain_adaptation", "gait_phase_detection", "vibration_frequency_analysis", "pre_landing_stiffening", "jump_crouch_softening"],
    powerBudgetW: 2,
  });
  mcb.push({
    name: "mcb_spring_management", processor: "ESP32-S3 240MHz",
    firmwareRole: "Spring preload + energy return — monitors all 11 springs, optimizes preload for current activity (walking/running/jumping), manages spring energy charging for explosive movements",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 500,
    algorithms: ["spring_preload_optimization", "energy_storage_tracking", "spring_fatigue_monitoring", "activity_mode_tuning", "jump_charge_sequencing"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_power_management", processor: "ESP32-S3 240MHz",
    firmwareRole: "Power distribution + battery management — monitors all battery packs, manages hot-swap, distributes power budgets to all 31 other controllers, emergency power conservation mode",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 100,
    algorithms: ["battery_SoC_estimation", "hot_swap_sequencing", "power_budget_allocation", "thermal_management", "regenerative_braking_routing", "emergency_power_conservation"],
    powerBudgetW: 2,
  });
  mcb.push({
    name: "mcb_safety_watchdog", processor: "ESP32-S3 240MHz",
    firmwareRole: "Independent safety watchdog — hardware-level emergency stop, collision detection, thermal shutdown, joint limit enforcement, tendon breakage detection. Runs independently from master — can shut down entire body if master fails.",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "can_fd", loopRateHz: 1000,
    algorithms: ["hardware_watchdog_timer", "collision_force_threshold", "thermal_runaway_detection", "joint_limit_enforcement", "tendon_tension_anomaly", "motor_overcurrent_shutdown", "heartbeat_monitoring_all_nodes"],
    powerBudgetW: 1,
  });

  // ─── TIER 6: SENSOR FUSION — ESP32-S3 (5 nodes) ───────────────
  mcb.push({
    name: "mcb_tactile_upper_left", processor: "ESP32-S3 240MHz",
    firmwareRole: "Left upper body tactile — processes 250 pressure sensors across left hand (200), left forearm (30), left upper arm (20). Contact detection, force mapping, object recognition by touch.",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 200,
    algorithms: ["pressure_array_scan", "contact_force_estimation", "texture_classification", "object_shape_recognition", "collision_detection_reflex"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_tactile_upper_right", processor: "ESP32-S3 240MHz",
    firmwareRole: "Right upper body tactile — mirror of left upper body tactile",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 200,
    algorithms: ["pressure_array_scan", "contact_force_estimation", "texture_classification", "object_shape_recognition", "collision_detection_reflex"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_tactile_lower_left", processor: "ESP32-S3 240MHz",
    firmwareRole: "Left lower body tactile — processes 130 pressure sensors across left foot (80 plantar), left shin (20), left thigh (30). Ground reaction force, gait contact phase, terrain classification.",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 200,
    algorithms: ["plantar_pressure_mapping", "ground_reaction_force", "gait_contact_phase", "terrain_classification", "slip_detection"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_tactile_lower_right", processor: "ESP32-S3 240MHz",
    firmwareRole: "Right lower body tactile — mirror of left lower body tactile",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 200,
    algorithms: ["plantar_pressure_mapping", "ground_reaction_force", "gait_contact_phase", "terrain_classification", "slip_detection"],
    powerBudgetW: 1.5,
  });
  mcb.push({
    name: "mcb_imu_fusion", processor: "ESP32-S3 240MHz",
    firmwareRole: "IMU sensor fusion — 6 IMUs (head, torso, pelvis, left/right wrist, left/right ankle). Fuses accelerometer + gyroscope data into whole-body orientation estimate. Critical for balance, flip tracking, landing detection.",
    controlledJoints: [], controlledTendons: [], controlledPistons: [],
    busInterface: "spi_daisy_chain", loopRateHz: 1000,
    algorithms: ["extended_kalman_filter", "complementary_filter", "madgwick_AHRS", "zero_velocity_update", "free_fall_detection", "flip_rotation_tracking", "landing_impact_estimation"],
    powerBudgetW: 1.5,
  });

  return { tendons, pistons, springs, shockAbsorbers: shocks, motorControlBrain: mcb };
}

const MUSCULOSKELETAL = buildMusculoskeletalSystem();

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

function buildHumanoidJoints(): JointModel[] {
  const j: JointModel[] = [];
  const add = (
    name: string, type: JointModel["type"], aType: JointModel["anatomicalType"], aName: string,
    parent: string, child: string, axis: [number,number,number],
    min: number, max: number, full360: boolean,
    torque: number, speed: number, mass: number, inertia: [number,number,number],
    bus: JointModel["controlBus"]
  ) => {
    j.push({
      name, type, anatomicalType: aType, anatomicalName: aName,
      parentLink: parent, childLink: child, axis,
      limits: { min: full360 ? -180 : min, max: full360 ? 180 : max },
      is360: full360,
      maxTorqueNm: torque, maxSpeedRps: speed, massKg: mass, inertia, controlBus: bus,
    });
  };

  // ═══════════════════════════════════════════════════════════════
  //  HEAD & NECK — 3 joints
  // ═══════════════════════════════════════════════════════════════
  add("atlanto_occipital_flex", "universal", "condyloid", "Atlanto-Occipital (skull-C1)", "c1_atlas", "skull", [0,1,0], -25, 25, false, 4, 2, 0.12, [0.001,0.001,0.001], "can_spine");
  add("atlanto_axial_rotation", "revolute", "pivot", "Atlanto-Axial (C1-C2)", "c2_axis", "c1_atlas", [0,0,1], -180, 180, true, 5, 2.5, 0.1, [0.001,0.001,0.001], "can_spine");
  add("temporomandibular", "universal", "condyloid", "Temporomandibular (Jaw)", "skull", "mandible", [0,1,0], -45, 5, false, 1.5, 3, 0.05, [0.0002,0.0002,0.0001], "i2c_face");

  // ═══════════════════════════════════════════════════════════════
  //  NECK — 2-DOF articulation (tilt + rotate handled by atlanto joints above)
  //  Robot neck: rigid tube with servo-driven flexion at base
  //  Head already has atlanto-occipital (nod) + atlanto-axial (360° rotate)
  //  One additional neck pitch joint for forward/back lean
  // ═══════════════════════════════════════════════════════════════
  add("neck_pitch", "revolute", "robotic_articulation", "Neck Pitch (forward/backward lean)", "upper_torso_frame", "neck_base", [0,1,0], -30, 30, false, 8, 3, 0.15, [0.002,0.002,0.001], "can_spine");
  add("neck_roll", "revolute", "robotic_articulation", "Neck Roll (side tilt)", "neck_base", "c1_atlas", [1,0,0], -25, 25, false, 6, 3, 0.1, [0.001,0.001,0.0005], "can_spine");

  // ═══════════════════════════════════════════════════════════════
  //  TORSO — RIGID FRAME WITH 3 ARTICULATION POINTS
  //  Real robots do NOT have individual vertebrae. They have a rigid
  //  structural frame (aluminum/carbon fiber) with a few powered
  //  flex points for bending and twisting. This is how Atlas,
  //  Optimus, and every real humanoid does it.
  // ═══════════════════════════════════════════════════════════════
  add("torso_upper_pitch", "revolute", "robotic_articulation", "Upper Torso Pitch (forward/back bend)", "mid_torso_frame", "upper_torso_frame", [0,1,0], -30, 30, false, 80, 2, 1.5, [0.02,0.02,0.01], "can_spine");
  add("torso_upper_yaw", "revolute", "robotic_articulation", "Upper Torso Yaw (twist left/right)", "mid_torso_frame", "upper_torso_frame", [0,0,1], -45, 45, false, 60, 2, 1.2, [0.015,0.015,0.008], "can_spine");
  add("torso_upper_roll", "revolute", "robotic_articulation", "Upper Torso Roll (lateral bend)", "mid_torso_frame", "upper_torso_frame", [1,0,0], -20, 20, false, 50, 1.5, 1.0, [0.01,0.01,0.005], "can_spine");
  add("torso_lower_pitch", "revolute", "robotic_articulation", "Lower Torso Pitch (waist bend forward/back)", "pelvis_frame", "mid_torso_frame", [0,1,0], -40, 40, false, 100, 2, 2.0, [0.03,0.03,0.015], "can_spine");
  add("torso_lower_yaw", "revolute", "robotic_articulation", "Lower Torso Yaw (waist twist)", "pelvis_frame", "mid_torso_frame", [0,0,1], -50, 50, false, 80, 2, 1.8, [0.025,0.025,0.012], "can_spine");
  add("torso_lower_roll", "revolute", "robotic_articulation", "Lower Torso Roll (waist lateral bend)", "pelvis_frame", "mid_torso_frame", [1,0,0], -25, 25, false, 60, 1.5, 1.5, [0.015,0.015,0.008], "can_spine");

  // ═══════════════════════════════════════════════════════════════
  //  SHOULDER GIRDLE — sternoclavicular + acromioclavicular + glenohumeral
  //  Per side: SC (saddle, 2 DOF) + AC (gliding, 1 DOF) + GH (ball-and-socket, 3 DOF, 360°) = 12 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_sternoclavicular_elev`, "revolute", "saddle", `${S} Sternoclavicular (elevation)`, "sternum", `${side}_clavicle`, [0,1,0], -5, 45, false, 15, 2, 0.15, [0.002,0.002,0.001], "can_limb");
    add(`${side}_sternoclavicular_prot`, "revolute", "saddle", `${S} Sternoclavicular (protraction)`, "sternum", `${side}_clavicle`, [0,0,1], -15, 15, false, 12, 2, 0.1, [0.001,0.001,0.0005], "can_limb");
    add(`${side}_acromioclavicular`, "prismatic", "gliding", `${S} Acromioclavicular`, `${side}_clavicle`, `${side}_scapula`, [0,1,0], -20, 20, false, 10, 2, 0.1, [0.001,0.001,0.0005], "can_limb");
    add(`${side}_glenohumeral_flex`, "spherical", "ball_and_socket", `${S} Glenohumeral (flex/ext) — 360°`, `${side}_scapula`, `${side}_humerus`, [0,1,0], -180, 180, true, 45, 3, 0.8, [0.02,0.02,0.005], "can_limb");
    add(`${side}_glenohumeral_abd`, "spherical", "ball_and_socket", `${S} Glenohumeral (abd/add) — 360°`, `${side}_humerus`, `${side}_humerus_abd`, [1,0,0], -180, 180, true, 35, 3, 0.5, [0.01,0.01,0.003], "can_limb");
    add(`${side}_glenohumeral_rot`, "spherical", "ball_and_socket", `${S} Glenohumeral (int/ext rotation) — 360°`, `${side}_humerus_abd`, `${side}_humerus_rot`, [0,0,1], -180, 180, true, 20, 3, 0.3, [0.005,0.005,0.002], "can_limb");
  }

  // ═══════════════════════════════════════════════════════════════
  //  ELBOW & FOREARM — ulnohumeral (hinge) + radiohumeral (pivot) + radioulnar (pivot, 360°)
  //  Per side: 3 joints = 6 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_ulnohumeral`, "revolute", "hinge", `${S} Ulnohumeral (elbow flex/ext)`, `${side}_humerus_rot`, `${side}_ulna`, [0,1,0], 0, 150, false, 25, 4, 0.5, [0.008,0.008,0.003], "can_limb");
    add(`${side}_radiohumeral`, "revolute", "pivot", `${S} Radiohumeral`, `${side}_humerus_rot`, `${side}_radius_prox`, [0,1,0], 0, 150, false, 15, 4, 0.2, [0.003,0.003,0.001], "can_limb");
    add(`${side}_proximal_radioulnar`, "revolute", "pivot", `${S} Proximal Radioulnar (pronation/supination) — 360°`, `${side}_ulna`, `${side}_radius`, [1,0,0], -180, 180, true, 10, 5, 0.2, [0.003,0.003,0.001], "can_limb");
  }

  // ═══════════════════════════════════════════════════════════════
  //  WRIST — distal radioulnar (pivot, 360°) + radiocarpal (condyloid, 2 DOF)
  //         + midcarpal (gliding) + pisotriquetral (gliding)
  //  Per side: 5 joints = 10 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_distal_radioulnar`, "revolute", "pivot", `${S} Distal Radioulnar (wrist rotation) — 360°`, `${side}_radius`, `${side}_ulna_distal`, [1,0,0], -180, 180, true, 6, 5, 0.12, [0.001,0.001,0.0005], "can_limb");
    add(`${side}_radiocarpal_flex`, "universal", "condyloid", `${S} Radiocarpal (flex/ext)`, `${side}_ulna_distal`, `${side}_carpal_prox`, [0,1,0], -80, 80, false, 5, 5, 0.1, [0.001,0.001,0.0005], "can_hand");
    add(`${side}_radiocarpal_dev`, "universal", "condyloid", `${S} Radiocarpal (radial/ulnar deviation)`, `${side}_carpal_prox`, `${side}_carpal_mid`, [0,0,1], -25, 35, false, 4, 5, 0.06, [0.0005,0.0005,0.0002], "can_hand");
    add(`${side}_midcarpal`, "prismatic", "gliding", `${S} Midcarpal`, `${side}_carpal_mid`, `${side}_carpal_dist`, [0,1,0], -10, 10, false, 3, 4, 0.04, [0.0003,0.0003,0.0001], "can_hand");
    add(`${side}_pisotriquetral`, "prismatic", "gliding", `${S} Pisotriquetral`, `${side}_carpal_dist`, `${side}_hand_base`, [0,0,1], -5, 5, false, 1, 4, 0.02, [0.0001,0.0001,0.00005], "can_hand");
  }

  // ═══════════════════════════════════════════════════════════════
  //  THUMB — CMC (saddle, 2 DOF) + MCP (condyloid, 2 DOF) + IP (hinge, 1 DOF)
  //  Per side: 5 joints = 10 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_thumb_cmc_flex`, "universal", "saddle", `${S} Thumb CMC (flex/ext) — BIDIRECTIONAL`, `${side}_hand_base`, `${side}_thumb_mc`, [0,1,0], -60, 60, false, 2.5, 5, 0.02, [0.0001,0.0001,0.00004], "can_hand");
    add(`${side}_thumb_cmc_abd`, "universal", "saddle", `${S} Thumb CMC (abd/add)`, `${side}_hand_base`, `${side}_thumb_mc_abd`, [0,0,1], -30, 70, false, 2, 5, 0.015, [0.00008,0.00008,0.00003], "can_hand");
    add(`${side}_thumb_mcp_flex`, "universal", "condyloid", `${S} Thumb MCP (flex/ext) — BIDIRECTIONAL`, `${side}_thumb_mc`, `${side}_thumb_prox`, [0,1,0], -70, 70, false, 1.5, 6, 0.012, [0.00005,0.00005,0.00002], "can_hand");
    add(`${side}_thumb_mcp_abd`, "universal", "condyloid", `${S} Thumb MCP (abd)`, `${side}_thumb_prox`, `${side}_thumb_prox_abd`, [0,0,1], -25, 25, false, 0.8, 6, 0.006, [0.00002,0.00002,0.00001], "can_hand");
    add(`${side}_thumb_ip`, "revolute", "hinge", `${S} Thumb IP — BIDIRECTIONAL`, `${side}_thumb_prox`, `${side}_thumb_dist`, [0,1,0], -50, 80, false, 1, 6, 0.005, [0.00002,0.00002,0.00001], "can_hand");
  }

  // ═══════════════════════════════════════════════════════════════
  //  FINGERS (index, middle, ring, pinky)
  //  CMC (gliding) + MCP (condyloid, 2 DOF) + PIP (hinge) + DIP (hinge)
  //  Per finger: 4 joints × 4 fingers × 2 hands = 32 joints + 8 CMC = 40
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    for (const [finger, idx] of [["index",2],["middle",3],["ring",4],["pinky",5]] as const) {
      const F = finger.charAt(0).toUpperCase() + finger.slice(1);
      add(`${side}_${finger}_cmc`, "prismatic", "gliding", `${S} ${F} CMC`, `${side}_hand_base`, `${side}_${finger}_mc`, [0,1,0], -5, 5, false, 1, 4, 0.01, [0.00003,0.00003,0.00001], "can_hand");
      add(`${side}_${finger}_mcp_flex`, "universal", "condyloid", `${S} ${F} MCP (flex/ext) — BIDIRECTIONAL`, `${side}_${finger}_mc`, `${side}_${finger}_prox`, [0,1,0], -90, 90, false, 1.8, 6, 0.015, [0.00005,0.00005,0.00002], "can_hand");
      add(`${side}_${finger}_mcp_abd`, "universal", "condyloid", `${S} ${F} MCP (abd/add)`, `${side}_${finger}_prox`, `${side}_${finger}_prox_abd`, [0,0,1], -30, 30, false, 0.8, 6, 0.008, [0.00003,0.00003,0.00001], "can_hand");
      add(`${side}_${finger}_pip`, "revolute", "hinge", `${S} ${F} PIP — BIDIRECTIONAL`, `${side}_${finger}_prox`, `${side}_${finger}_mid`, [0,1,0], -60, 110, false, 1.2, 6, 0.01, [0.00004,0.00004,0.00001], "can_hand");
      add(`${side}_${finger}_dip`, "revolute", "hinge", `${S} ${F} DIP — BIDIRECTIONAL`, `${side}_${finger}_mid`, `${side}_${finger}_dist`, [0,1,0], -45, 80, false, 0.8, 6, 0.006, [0.00002,0.00002,0.00001], "can_hand");
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  HIP — acetabulofemoral (ball-and-socket, 3 DOF, 360°)
  //  Per side: 3 joints = 6 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_acetabulofemoral_flex`, "spherical", "ball_and_socket", `${S} Hip Acetabulofemoral (flex/ext) — 360°`, `${side}_ilium`, `${side}_femur`, [0,1,0], -180, 180, true, 110, 2.5, 1.2, [0.05,0.05,0.02], "can_limb");
    add(`${side}_acetabulofemoral_abd`, "spherical", "ball_and_socket", `${S} Hip Acetabulofemoral (abd/add) — 360°`, `${side}_femur`, `${side}_femur_abd`, [1,0,0], -180, 180, true, 55, 2, 0.6, [0.02,0.02,0.008], "can_limb");
    add(`${side}_acetabulofemoral_rot`, "spherical", "ball_and_socket", `${S} Hip Acetabulofemoral (rotation) — 360°`, `${side}_femur_abd`, `${side}_femur_rot`, [0,0,1], -180, 180, true, 45, 2, 0.4, [0.015,0.015,0.006], "can_limb");
  }

  // ═══════════════════════════════════════════════════════════════
  //  KNEE — tibiofemoral (hinge) + patellofemoral (gliding)
  //  Per side: 2 joints = 4 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_tibiofemoral`, "revolute", "hinge", `${S} Tibiofemoral (knee flex/ext)`, `${side}_femur_rot`, `${side}_tibia`, [0,1,0], 0, 150, false, 90, 3, 0.8, [0.03,0.03,0.01], "can_limb");
    add(`${side}_patellofemoral`, "prismatic", "gliding", `${S} Patellofemoral`, `${side}_femur_rot`, `${side}_patella`, [0,1,0], -5, 5, false, 10, 2, 0.1, [0.002,0.002,0.001], "can_limb");
  }

  // ═══════════════════════════════════════════════════════════════
  //  PROXIMAL TIBIOFIBULAR (gliding, per side = 2)
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_proximal_tibiofibular`, "prismatic", "gliding", `${S} Proximal Tibiofibular`, `${side}_tibia`, `${side}_fibula`, [1,0,0], -3, 3, false, 8, 1.5, 0.08, [0.001,0.001,0.0005], "can_limb");
  }

  // ═══════════════════════════════════════════════════════════════
  //  ANKLE — talocrural (hinge) + subtalar (gliding)
  //  Per side: 2 joints = 4 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_talocrural`, "revolute", "hinge", `${S} Talocrural (ankle dorsi/plantarflex)`, `${side}_tibia`, `${side}_talus`, [0,1,0], -50, 30, false, 45, 3, 0.4, [0.01,0.01,0.005], "can_limb");
    add(`${side}_subtalar`, "prismatic", "gliding", `${S} Subtalar (inversion/eversion)`, `${side}_talus`, `${side}_calcaneus`, [1,0,0], -35, 25, false, 30, 2.5, 0.3, [0.008,0.008,0.003], "can_foot");
  }

  // ═══════════════════════════════════════════════════════════════
  //  MIDFOOT — tarsometatarsal (gliding, 5 per foot) + tarsal interbone (gliding)
  //  Per side: 6 joints = 12 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_calcaneocuboid`, "prismatic", "gliding", `${S} Calcaneocuboid (tarsal)`, `${side}_calcaneus`, `${side}_cuboid`, [0,1,0], -8, 8, false, 12, 2, 0.08, [0.001,0.001,0.0005], "can_foot");
    for (let i = 1; i <= 5; i++) {
      add(`${side}_tarsometatarsal_${i}`, "prismatic", "gliding", `${S} Tarsometatarsal ${i}`, `${side}_cuboid`, `${side}_mt${i}`, [0,1,0], -10, 10, false, 8, 2, 0.04, [0.0003,0.0003,0.0001], "can_foot");
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  TOES — MTP (condyloid, 2 DOF) + PIP (hinge) + DIP (hinge)
  //  Big toe: MTP(2) + IP(1) = 3. Others: MTP(2) + PIP(1) + DIP(1) = 4 each
  //  Per foot: 3 + 4×4 = 19 joints. Both feet = 38 total
  // ═══════════════════════════════════════════════════════════════
  for (const side of ["l", "r"]) {
    const S = side === "l" ? "Left" : "Right";
    add(`${side}_hallux_mtp_flex`, "universal", "condyloid", `${S} Hallux MTP (flex/ext) — BIDIRECTIONAL`, `${side}_mt1`, `${side}_hallux_prox`, [0,1,0], -70, 70, false, 3.5, 4, 0.02, [0.00008,0.00008,0.00003], "can_foot");
    add(`${side}_hallux_mtp_abd`, "universal", "condyloid", `${S} Hallux MTP (abd)`, `${side}_mt1`, `${side}_hallux_prox_abd`, [0,0,1], -15, 15, false, 1, 4, 0.008, [0.00003,0.00003,0.00001], "can_foot");
    add(`${side}_hallux_ip`, "revolute", "hinge", `${S} Hallux IP — BIDIRECTIONAL`, `${side}_hallux_prox`, `${side}_hallux_dist`, [0,1,0], -40, 60, false, 1.5, 4, 0.008, [0.00003,0.00003,0.00001], "can_foot");
    for (const [toe, n] of [["2nd",2],["3rd",3],["4th",4],["5th",5]] as const) {
      add(`${side}_toe${n}_mtp_flex`, "universal", "condyloid", `${S} ${toe} Toe MTP (flex) — BIDIRECTIONAL`, `${side}_mt${n}`, `${side}_toe${n}_prox`, [0,1,0], -40, 40, false, 1, 4, 0.008, [0.00003,0.00003,0.00001], "can_foot");
      add(`${side}_toe${n}_mtp_abd`, "universal", "condyloid", `${S} ${toe} Toe MTP (abd)`, `${side}_mt${n}`, `${side}_toe${n}_prox_abd`, [0,0,1], -12, 12, false, 0.5, 4, 0.004, [0.00001,0.00001,0.000005], "can_foot");
      add(`${side}_toe${n}_pip`, "revolute", "hinge", `${S} ${toe} Toe PIP — BIDIRECTIONAL`, `${side}_toe${n}_prox`, `${side}_toe${n}_mid`, [0,1,0], -25, 35, false, 0.5, 4, 0.004, [0.00001,0.00001,0.00001], "can_foot");
      add(`${side}_toe${n}_dip`, "revolute", "hinge", `${S} ${toe} Toe DIP — BIDIRECTIONAL`, `${side}_toe${n}_mid`, `${side}_toe${n}_dist`, [0,1,0], -25, 60, false, 0.3, 4, 0.003, [0.00001,0.00001,0.00001], "can_foot");
    }
  }

  return j;
}

function buildKinematicLinks(): KinematicLink[] {
  const L: KinematicLink[] = [];
  const add = (name: string, len: number, mass: number, com: [number,number,number], inertia: [number,number,number]) => {
    L.push({ name, lengthM: len, massKg: mass, comOffset: com, inertiaKgM2: inertia });
  };

  add("skull", 0.20, 2.0, [0,0,0.10], [0.02,0.02,0.01]);
  add("mandible", 0.08, 0.15, [0,0,-0.04], [0.0003,0.0003,0.0001]);
  add("c1_atlas", 0.015, 0.03, [0,0,0.008], [0.00004,0.00004,0.00002]);
  add("c2_axis", 0.018, 0.04, [0,0,0.009], [0.00005,0.00005,0.00002]);
  for (let i = 3; i <= 7; i++) add(`c${i}_vertebra`, 0.018, 0.04, [0,0,0.009], [0.00005,0.00005,0.00002]);
  for (let i = 1; i <= 12; i++) {
    add(`t${i}_vertebra`, 0.023, 0.07, [0,0,0.012], [0.0001,0.0001,0.00004]);
    add(`l_rib${i}`, 0.15, 0.04, [0.07,0,0], [0.0001,0.0001,0.00004]);
    add(`r_rib${i}`, 0.15, 0.04, [-0.07,0,0], [0.0001,0.0001,0.00004]);
  }
  for (let i = 1; i <= 5; i++) add(`l${i}_vertebra`, 0.028, 0.1, [0,0,0.014], [0.0002,0.0002,0.00008]);
  add("sacrum", 0.12, 0.5, [0,0,-0.06], [0.003,0.003,0.001]);
  add("sternum", 0.17, 0.5, [0,0,0.08], [0.003,0.003,0.001]);

  for (const side of ["l", "r"]) {
    const sx = side === "l" ? 1 : -1;
    add(`${side}_ilium`, 0.12, 1.5, [sx*0.06,0,0], [0.01,0.01,0.005]);
    add(`${side}_clavicle`, 0.15, 0.2, [sx*0.07,0,0], [0.0005,0.0005,0.0002]);
    add(`${side}_scapula`, 0.12, 0.3, [sx*0.06,0,-0.06], [0.001,0.001,0.0005]);
    add(`${side}_humerus`, 0.30, 1.5, [0,0,-0.15], [0.01,0.01,0.003]);
    add(`${side}_humerus_abd`, 0.04, 0.2, [0,0,-0.02], [0.0005,0.0005,0.0002]);
    add(`${side}_humerus_rot`, 0.04, 0.2, [0,0,-0.02], [0.0005,0.0005,0.0002]);
    add(`${side}_ulna`, 0.26, 0.6, [0,0,-0.13], [0.005,0.005,0.002]);
    add(`${side}_radius_prox`, 0.05, 0.15, [0,0,-0.025], [0.0005,0.0005,0.0002]);
    add(`${side}_radius`, 0.24, 0.5, [0,0,-0.12], [0.004,0.004,0.001]);
    add(`${side}_ulna_distal`, 0.03, 0.08, [0,0,-0.015], [0.0002,0.0002,0.0001]);
    add(`${side}_carpal_prox`, 0.02, 0.05, [0,0,-0.01], [0.0001,0.0001,0.00005]);
    add(`${side}_carpal_mid`, 0.015, 0.04, [0,0,-0.008], [0.00008,0.00008,0.00003]);
    add(`${side}_carpal_dist`, 0.015, 0.03, [0,0,-0.008], [0.00006,0.00006,0.00002]);
    add(`${side}_hand_base`, 0.08, 0.2, [0,0,-0.04], [0.0005,0.0005,0.0002]);

    add(`${side}_thumb_mc`, 0.04, 0.02, [0,0,-0.02], [0.0001,0.0001,0.00004]);
    add(`${side}_thumb_mc_abd`, 0.005, 0.005, [0,0,0], [0.00001,0.00001,0.000005]);
    add(`${side}_thumb_prox`, 0.03, 0.012, [0,0,-0.015], [0.00002,0.00002,0.00001]);
    add(`${side}_thumb_prox_abd`, 0.005, 0.003, [0,0,0], [0.000005,0.000005,0.000002]);
    add(`${side}_thumb_dist`, 0.02, 0.006, [0,0,-0.01], [0.00001,0.00001,0.000005]);
    for (const finger of ["index", "middle", "ring", "pinky"]) {
      add(`${side}_${finger}_mc`, 0.06, 0.015, [0,0,-0.03], [0.00003,0.00003,0.00001]);
      add(`${side}_${finger}_prox`, 0.04, 0.012, [0,0,-0.02], [0.00002,0.00002,0.00001]);
      add(`${side}_${finger}_prox_abd`, 0.005, 0.003, [0,0,0], [0.000005,0.000005,0.000002]);
      add(`${side}_${finger}_mid`, 0.025, 0.008, [0,0,-0.012], [0.00001,0.00001,0.000005]);
      add(`${side}_${finger}_dist`, 0.018, 0.005, [0,0,-0.009], [0.000005,0.000005,0.000002]);
    }

    add(`${side}_femur`, 0.42, 4.5, [0,0,-0.21], [0.07,0.07,0.025]);
    add(`${side}_femur_abd`, 0.04, 0.3, [0,0,-0.02], [0.002,0.002,0.001]);
    add(`${side}_femur_rot`, 0.04, 0.25, [0,0,-0.02], [0.002,0.002,0.001]);
    add(`${side}_patella`, 0.04, 0.1, [0,0.02,0], [0.0005,0.0005,0.0002]);
    add(`${side}_tibia`, 0.38, 2.5, [0,0,-0.19], [0.03,0.03,0.01]);
    add(`${side}_fibula`, 0.36, 0.4, [sx*0.02,0,-0.18], [0.005,0.005,0.002]);
    add(`${side}_talus`, 0.04, 0.15, [0,0,-0.02], [0.0005,0.0005,0.0002]);
    add(`${side}_calcaneus`, 0.08, 0.3, [0.04,0,0], [0.001,0.001,0.0005]);
    add(`${side}_cuboid`, 0.03, 0.06, [0.015,0,0], [0.0002,0.0002,0.0001]);
    for (let i = 1; i <= 5; i++) add(`${side}_mt${i}`, 0.065, 0.025, [0,0,-0.03], [0.00005,0.00005,0.00002]);
    add(`${side}_hallux_prox`, 0.035, 0.015, [0,0,-0.017], [0.00003,0.00003,0.00001]);
    add(`${side}_hallux_prox_abd`, 0.005, 0.003, [0,0,0], [0.000005,0.000005,0.000002]);
    add(`${side}_hallux_dist`, 0.025, 0.008, [0,0,-0.012], [0.00001,0.00001,0.000005]);
    for (const n of [2,3,4,5]) {
      add(`${side}_toe${n}_prox`, 0.03, 0.006, [0,0,-0.015], [0.00001,0.00001,0.000005]);
      add(`${side}_toe${n}_prox_abd`, 0.005, 0.002, [0,0,0], [0.000003,0.000003,0.000001]);
      add(`${side}_toe${n}_mid`, 0.018, 0.004, [0,0,-0.009], [0.000005,0.000005,0.000002]);
      add(`${side}_toe${n}_dist`, 0.012, 0.003, [0,0,-0.006], [0.000003,0.000003,0.000001]);
    }
  }

  return L;
}

const HUMANOID_JOINTS: JointModel[] = buildHumanoidJoints();

const KINEMATIC_LINKS: KinematicLink[] = buildKinematicLinks();

const BILL_OF_MATERIALS: BOMEntry[] = [
  // ─── ACTUATORS — major joints ──────────────────────────────────
  { partName: "BLDC Motor 400W (hip/knee)", category: "actuator", quantity: 8, unitCostUsd: 150, supplier: "AliExpress/Stepperonline", specifications: "400W, 48V, 2500rpm, 1.5Nm, cycloidal reducer 100:1 — hip flexion/abd/rot, knee flexion" },
  { partName: "BLDC Motor 200W (shoulder/ankle)", category: "actuator", quantity: 10, unitCostUsd: 85, supplier: "AliExpress/Odrive", specifications: "200W, 48V, 3000rpm, 0.64Nm, harmonic drive 80:1 — shoulder, ankle, torso" },
  { partName: "BLDC Motor 100W (elbow/wrist/neck)", category: "actuator", quantity: 10, unitCostUsd: 45, supplier: "AliExpress/Odrive", specifications: "100W, 24V, 3000rpm, 0.32Nm, harmonic drive 50:1 — elbow, wrist, neck, jaw" },
  // ─── ACTUATORS — spine ─────────────────────────────────────────
  { partName: "BLDC Motor 150W (torso articulation)", category: "actuator", quantity: 6, unitCostUsd: 65, supplier: "AliExpress/Odrive", specifications: "150W, 48V, 2000rpm, 0.5Nm, harmonic drive 100:1 — torso upper/lower pitch/yaw/roll" },
  { partName: "Dynamixel XL330-M288-T (torso articulation)", category: "actuator", quantity: 6, unitCostUsd: 24, supplier: "Robotis", specifications: "0.52Nm, 12V, TTL bus, torso flex points" },
  // ─── ACTUATORS — hands/fingers ─────────────────────────────────
  { partName: "Micro Servo 10kg-cm (finger MCP)", category: "actuator", quantity: 20, unitCostUsd: 8, supplier: "AliExpress/TowerPro", specifications: "10kg-cm, 6V, digital, metal gear, MCP flex+abd" },
  { partName: "Micro Servo 5kg-cm (finger PIP/DIP)", category: "actuator", quantity: 16, unitCostUsd: 5, supplier: "AliExpress", specifications: "5kg-cm, 6V, digital, PIP and DIP flexion" },
  { partName: "Micro Servo 12kg-cm (thumb)", category: "actuator", quantity: 10, unitCostUsd: 10, supplier: "AliExpress/TowerPro", specifications: "12kg-cm, 7.4V, metal gear, thumb CMC/MCP/IP" },
  // ─── ACTUATORS — feet/toes ─────────────────────────────────────
  { partName: "Servo Motor 15kg-cm (foot/ankle)", category: "actuator", quantity: 8, unitCostUsd: 12, supplier: "AliExpress", specifications: "15kg-cm, 7.4V, subtalar + midtarsal" },
  { partName: "Micro Servo 3kg-cm (toe)", category: "actuator", quantity: 28, unitCostUsd: 3, supplier: "AliExpress", specifications: "3kg-cm, 4.8V, MTP/PIP/DIP toe joints" },
  // ─── TRANSMISSIONS ────────────────────────────────────────────
  { partName: "Harmonic Drive CSF-14", category: "transmission", quantity: 10, unitCostUsd: 120, supplier: "Harmonic Drive/AliExpress", specifications: "50:1 ratio, zero backlash, 14mm bore — shoulders, elbows" },
  { partName: "Cycloidal Reducer", category: "transmission", quantity: 8, unitCostUsd: 80, supplier: "AliExpress", specifications: "100:1 ratio, high torque, shock resistant — hips, knees" },
  { partName: "Planetary Gearbox 20:1 (spine)", category: "transmission", quantity: 24, unitCostUsd: 18, supplier: "AliExpress", specifications: "20:1, low backlash, compact, spine segments" },
  { partName: "Tendon Cable (finger/toe)", category: "transmission", quantity: 60, unitCostUsd: 2, supplier: "McMaster-Carr", specifications: "Dyneema UHMWPE, 1mm, 200lb rated, finger/toe routing" },
  // ─── SENSORS ──────────────────────────────────────────────────
  { partName: "IMU BNO085", category: "sensor", quantity: 5, unitCostUsd: 18, supplier: "Adafruit/DigiKey", specifications: "9-axis, sensor fusion, 100Hz, I2C — pelvis, torso, head, each foot" },
  { partName: "Intel RealSense D435i", category: "sensor", quantity: 2, unitCostUsd: 250, supplier: "Intel/Amazon", specifications: "Stereo depth + IMU, 90fps, USB 3.0 — stereo vision" },
  { partName: "Force/Torque Sensor 6-axis", category: "sensor", quantity: 6, unitCostUsd: 45, supplier: "AliExpress/SparkFun", specifications: "6-axis, 50N range, I2C — wrists, ankles" },
  { partName: "FSR Pressure Sensor (foot)", category: "sensor", quantity: 16, unitCostUsd: 5, supplier: "AliExpress", specifications: "FSR 0-50kg, analog, 8 per foot sole" },
  { partName: "Fingertip Tactile Sensor", category: "sensor", quantity: 10, unitCostUsd: 12, supplier: "AliExpress/SparkFun", specifications: "3-axis force, 0.01N resolution, each fingertip" },
  { partName: "Magnetic Encoder AS5047P", category: "sensor", quantity: 28, unitCostUsd: 6, supplier: "DigiKey/Mouser", specifications: "14-bit, 28000rpm, SPI — one per major joint motor" },
  { partName: "Flex Sensor (spine curvature)", category: "sensor", quantity: 6, unitCostUsd: 8, supplier: "SparkFun/Adafruit", specifications: "4.5in, analog, along spine to measure posture" },
  { partName: "MLX90640 Thermal Camera", category: "sensor", quantity: 1, unitCostUsd: 55, supplier: "Adafruit/DigiKey", specifications: "32x24 IR array, 16Hz, I2C — infrared vision" },
  { partName: "Ultrasonic HC-SR04", category: "sensor", quantity: 4, unitCostUsd: 3, supplier: "AliExpress", specifications: "2cm-4m range, 40Hz — proximity detection" },
  { partName: "MQ Gas Sensor Array", category: "sensor", quantity: 3, unitCostUsd: 5, supplier: "AliExpress", specifications: "CO, CO2, methane, smoke, VOC detection" },
  { partName: "Microphone MEMS INMP441", category: "sensor", quantity: 2, unitCostUsd: 4, supplier: "DigiKey", specifications: "I2S, 60dB SNR, stereo audio" },
  // ─── COMPUTE ──────────────────────────────────────────────────
  { partName: "NVIDIA Jetson Orin NX 16GB", category: "compute", quantity: 1, unitCostUsd: 599, supplier: "NVIDIA/Arrow", specifications: "100 TOPS AI, 8-core ARM, 16GB LPDDR5 — main brain" },
  { partName: "STM32H7 MCU (motor control)", category: "compute", quantity: 4, unitCostUsd: 15, supplier: "DigiKey/Mouser", specifications: "480MHz, FPU, CAN-FD, 1kHz PID — spine, arms, legs, hands" },
  { partName: "ESP32-S3 MCU (sensor hub)", category: "compute", quantity: 8, unitCostUsd: 8, supplier: "AliExpress/DigiKey", specifications: "240MHz dual-core, WiFi+BT, 8MB PSRAM — sensor fusion nodes" },
  { partName: "PCA9685 Servo Driver", category: "compute", quantity: 12, unitCostUsd: 4, supplier: "Adafruit/AliExpress", specifications: "16-ch PWM, I2C, 12-bit — finger/toe servo banks" },
  // ─── POWER ────────────────────────────────────────────────────
  { partName: "LiPo Battery 48V 20Ah", category: "power", quantity: 2, unitCostUsd: 350, supplier: "AliExpress/Alibaba", specifications: "48V, 20Ah, 960Wh, BMS, 60A continuous — hot-swappable pair" },
  { partName: "DC-DC Converter 48V→12V 300W", category: "power", quantity: 3, unitCostUsd: 25, supplier: "AliExpress", specifications: "300W, 25A — spine actuators, servos" },
  { partName: "DC-DC Converter 48V→5V 60W", category: "power", quantity: 4, unitCostUsd: 12, supplier: "AliExpress", specifications: "60W, 12A — sensors, MCUs, servo logic" },
  { partName: "DC-DC Converter 48V→6V 120W", category: "power", quantity: 2, unitCostUsd: 18, supplier: "AliExpress", specifications: "120W, 20A — finger/toe servo power" },
  // ─── COMMUNICATION ────────────────────────────────────────────
  { partName: "CAN Bus Transceiver MCP2551", category: "communication", quantity: 20, unitCostUsd: 3, supplier: "DigiKey/AliExpress", specifications: "1Mbps, bus fault protection — all MCU nodes" },
  { partName: "I2C Multiplexer TCA9548A", category: "communication", quantity: 6, unitCostUsd: 4, supplier: "Adafruit/DigiKey", specifications: "8-channel I2C mux — sensor buses" },
  // ─── STRUCTURAL ───────────────────────────────────────────────
  { partName: "Carbon Fiber Tube 20mm", category: "structural", quantity: 12, unitCostUsd: 15, supplier: "AliExpress/Alibaba", specifications: "20mm OD, 18mm ID, 500mm, 3K weave — limb shafts" },
  { partName: "Carbon Fiber Tube 10mm", category: "structural", quantity: 8, unitCostUsd: 8, supplier: "AliExpress", specifications: "10mm OD, 8mm ID, 300mm — finger/toe frame" },
  { partName: "Aluminum 7075 Plate", category: "structural", quantity: 6, unitCostUsd: 30, supplier: "AliExpress/MetalsDepot", specifications: "300x200x6mm, aircraft grade — hip, torso" },
  { partName: "Titanium Fasteners M3-M8", category: "structural", quantity: 200, unitCostUsd: 0.5, supplier: "AliExpress/McMaster", specifications: "Grade 5, various lengths — joint assembly" },
  { partName: "3D Printed Parts (PETG)", category: "structural", quantity: 120, unitCostUsd: 2, supplier: "Self-printed", specifications: "PETG, 0.2mm layer, 100% infill — finger phalanges, housings, spine segments" },
  { partName: "Silicone Skin Panels", category: "structural", quantity: 20, unitCostUsd: 15, supplier: "AliExpress/SmoothOn", specifications: "Shore 10A, tactile sensor embedded, covers major body segments" },
  // ─── JOINT HARDWARE ───────────────────────────────────────────
  { partName: "Slip Ring 12ch (shoulder/hip)", category: "joint", quantity: 4, unitCostUsd: 35, supplier: "AliExpress", specifications: "12 channel, 2A per ring, 360° continuous rotation — shoulders + hips" },
  { partName: "Miniature Ball Bearing 6mm", category: "joint", quantity: 80, unitCostUsd: 1.5, supplier: "AliExpress/SKF", specifications: "686ZZ, 6x13x5mm — finger/toe/spine pivots" },
  { partName: "Precision Ball Bearing 20mm", category: "joint", quantity: 40, unitCostUsd: 5, supplier: "AliExpress/NSK", specifications: "6204ZZ, 20x47x14mm — elbow, wrist, ankle, knee" },
  { partName: "Thrust Bearing 25mm", category: "joint", quantity: 8, unitCostUsd: 8, supplier: "AliExpress/NSK", specifications: "51105, 25x42x11mm — shoulder/hip 360° rotation support" },
  // ─── TENDON SYSTEM (musculoskeletal) ──────────────────────────
  { partName: "Steel Wire Rope 7x7 3mm", category: "tendon", quantity: 20, unitCostUsd: 8, supplier: "McMaster-Carr/AliExpress", specifications: "316 SS, 3mm, 7x7 strand, 8kN breaking, PTFE coated — legs, arms, spine" },
  { partName: "Steel Wire Rope 7x7 4mm", category: "tendon", quantity: 6, unitCostUsd: 12, supplier: "McMaster-Carr", specifications: "316 SS, 4mm, 7x7 strand, 12kN breaking — Achilles, gluteal (power tendons)" },
  { partName: "Steel Wire Rope 7x7 2.5mm", category: "tendon", quantity: 12, unitCostUsd: 6, supplier: "McMaster-Carr/AliExpress", specifications: "316 SS, 2.5mm, 6kN breaking — biceps, triceps, deltoid, hip abd/add" },
  { partName: "Dyneema UHMWPE Cable 1mm", category: "tendon", quantity: 60, unitCostUsd: 2, supplier: "McMaster-Carr/Samson Rope", specifications: "1mm braided, 1800N breaking, 0.5% elongation — finger flexor/extensor" },
  { partName: "Dyneema UHMWPE Cable 1.2mm", category: "tendon", quantity: 20, unitCostUsd: 3, supplier: "McMaster-Carr", specifications: "1.2mm braided, 2200N breaking — thumb, hallux tendons" },
  { partName: "Dyneema UHMWPE Cable 0.8mm", category: "tendon", quantity: 30, unitCostUsd: 1.5, supplier: "AliExpress/Samson", specifications: "0.8mm braided, 800N breaking — finger abd/add, small toe tendons" },
  { partName: "Nitinol SMA Wire 1.5mm", category: "tendon", quantity: 4, unitCostUsd: 25, supplier: "Dynalloy/DigiKey", specifications: "1.5mm, 70°C activation, 4% contraction, 2kN — neck flexor/extensor" },
  { partName: "PTFE-Lined Sheath 5mm OD", category: "tendon", quantity: 30, unitCostUsd: 3, supplier: "McMaster-Carr/AliExpress", specifications: "5mm OD, 3mm ID, PTFE inner lining, SS braid outer — major tendon routing" },
  { partName: "Bowden Cable Sheath 3mm OD", category: "tendon", quantity: 80, unitCostUsd: 1.5, supplier: "AliExpress/Jagwire", specifications: "3mm OD, 1.5mm ID, coiled SS, PTFE liner — finger/toe tendon routing" },
  { partName: "Tendon Crimp Ferrule SS", category: "tendon", quantity: 300, unitCostUsd: 0.3, supplier: "McMaster-Carr", specifications: "Copper/SS, crimp-on, various sizes — tendon termination" },
  { partName: "Tendon Tensioner (adjustable)", category: "tendon", quantity: 40, unitCostUsd: 5, supplier: "AliExpress/McMaster", specifications: "Inline cable tensioner, M3, 0-200N adjustable — pretension calibration" },
  { partName: "Tendon Pulley (PEEK)", category: "tendon", quantity: 60, unitCostUsd: 3, supplier: "McMaster-Carr/3D-printed", specifications: "PEEK or 3D-printed, 8mm, ball bearing center — routing around joints" },
  // ─── HYDRAULIC SYSTEM (explosive power) ───────────────────────
  { partName: "Micro Hydraulic Cylinder 32mm", category: "hydraulic", quantity: 4, unitCostUsd: 85, supplier: "AliExpress/Parker", specifications: "32mm bore, 120mm stroke, 200bar, servo valve — knee/hip power pistons" },
  { partName: "Micro Hydraulic Cylinder 40mm", category: "hydraulic", quantity: 2, unitCostUsd: 120, supplier: "Parker/AliExpress", specifications: "40mm bore, 150mm stroke, 250bar, servo valve — hip explosive power" },
  { partName: "Micro Hydraulic Cylinder 25mm", category: "hydraulic", quantity: 2, unitCostUsd: 65, supplier: "AliExpress", specifications: "25mm bore, 80mm stroke, 200bar — ankle push-off pistons" },
  { partName: "Electro-Hydraulic Pump 48V", category: "hydraulic", quantity: 1, unitCostUsd: 280, supplier: "AliExpress/Bucher Hydraulics", specifications: "48V BLDC, 2.5cc/rev, 250bar max, 1.5L/min, 200W — central hydraulic pump" },
  { partName: "Hydraulic Accumulator 100cc", category: "hydraulic", quantity: 2, unitCostUsd: 45, supplier: "AliExpress/Parker", specifications: "100cc bladder, 250bar, nitrogen pre-charge — burst power for jumps/flips" },
  { partName: "Hydraulic Reservoir 500ml", category: "hydraulic", quantity: 1, unitCostUsd: 30, supplier: "AliExpress", specifications: "500ml, aluminum, with filter/breather — fluid storage" },
  { partName: "Hydraulic Servo Valve", category: "hydraulic", quantity: 8, unitCostUsd: 55, supplier: "AliExpress/Moog", specifications: "Proportional, 10L/min, 250bar, CAN controlled — each piston" },
  { partName: "Hydraulic Hose 4mm", category: "hydraulic", quantity: 15, unitCostUsd: 8, supplier: "AliExpress/Parker", specifications: "4mm ID, 250bar rated, Teflon core, SS braid — piston lines" },
  { partName: "Synthetic Hydraulic Fluid 1L", category: "hydraulic", quantity: 2, unitCostUsd: 25, supplier: "AliExpress/Mobil", specifications: "Synthetic, -40°C to 200°C, fire-resistant, biodegradable" },
  // ─── PNEUMATIC SYSTEM (arm assist) ────────────────────────────
  { partName: "Pneumatic Cylinder 20mm", category: "pneumatic", quantity: 2, unitCostUsd: 25, supplier: "AliExpress/Festo", specifications: "20mm bore, 100mm stroke, 8bar — shoulder assist" },
  { partName: "Pneumatic Cylinder 16mm", category: "pneumatic", quantity: 2, unitCostUsd: 18, supplier: "AliExpress/Festo", specifications: "16mm bore, 80mm stroke, 8bar — elbow assist" },
  { partName: "Mini Air Compressor 12V", category: "pneumatic", quantity: 1, unitCostUsd: 45, supplier: "AliExpress", specifications: "12V, 100PSI, 0.5L/min, ultra-quiet — pneumatic supply" },
  { partName: "Air Reservoir 200ml", category: "pneumatic", quantity: 1, unitCostUsd: 15, supplier: "AliExpress", specifications: "200ml aluminum, 10bar rated — pressure buffer" },
  { partName: "Proportional Solenoid Valve", category: "pneumatic", quantity: 4, unitCostUsd: 22, supplier: "AliExpress/Festo", specifications: "5/3 way, proportional, 12V, CAN — arm pneumatic control" },
  // ─── SPRINGS & ENERGY STORAGE ─────────────────────────────────
  { partName: "Compression Spring (ankle)", category: "spring", quantity: 4, unitCostUsd: 8, supplier: "McMaster-Carr/Lee Spring", specifications: "Spring steel, 80N/mm, 100mm free, 50mm deflection — ankle energy return" },
  { partName: "Extension Spring (knee)", category: "spring", quantity: 4, unitCostUsd: 6, supplier: "McMaster-Carr/Lee Spring", specifications: "Spring steel, 40N/mm, 80mm free, 60mm deflection — knee energy return" },
  { partName: "Torsion Spring (hip)", category: "spring", quantity: 4, unitCostUsd: 12, supplier: "McMaster-Carr", specifications: "Titanium, 60N/mm, 90° deflection, 120J storage — hip explosive power" },
  { partName: "Carbon Fiber Leaf Spring (foot)", category: "spring", quantity: 4, unitCostUsd: 25, supplier: "AliExpress/Össur", specifications: "CF layup, 100N/mm, 20mm deflection — foot arch energy return (like running blades)" },
  { partName: "Constant Force Spring (shoulder)", category: "spring", quantity: 4, unitCostUsd: 10, supplier: "McMaster-Carr/Vulcan", specifications: "Spring steel, 15N/mm constant — shoulder gravity compensation" },
  { partName: "Torsion Spring (spine)", category: "spring", quantity: 2, unitCostUsd: 15, supplier: "McMaster-Carr", specifications: "Titanium, 50N/mm, 45° deflection — core energy return for flips" },
  // ─── SHOCK ABSORBERS & DAMPERS ────────────────────────────────
  { partName: "Magnetorheological Damper (knee)", category: "damper", quantity: 2, unitCostUsd: 120, supplier: "Lord Corp/AliExpress", specifications: "MR fluid, 5kN max, 40mm stroke, adjustable via current — knee landing" },
  { partName: "Magnetorheological Damper (ankle)", category: "damper", quantity: 2, unitCostUsd: 95, supplier: "Lord Corp/AliExpress", specifications: "MR fluid, 3kN max, 30mm stroke — ankle landing impact" },
  { partName: "Viscous Damper (hip)", category: "damper", quantity: 2, unitCostUsd: 40, supplier: "AliExpress/ACE", specifications: "6kN max, 50mm stroke, non-adjustable — hip impact absorption" },
  { partName: "Elastomer Pad (foot sole)", category: "damper", quantity: 4, unitCostUsd: 8, supplier: "AliExpress/Sorbothane", specifications: "Sorbothane, 2kN, 10mm, Shore 30A — foot impact padding" },
  { partName: "Elastomer Pad (wrist)", category: "damper", quantity: 4, unitCostUsd: 5, supplier: "AliExpress/Sorbothane", specifications: "Sorbothane, 1kN, 8mm — wrist/palm collision protection" },
  { partName: "Air Spring (spine)", category: "damper", quantity: 1, unitCostUsd: 35, supplier: "AliExpress/Firestone", specifications: "3kN, 20mm stroke, adjustable pressure — spine vibration isolation" },
  { partName: "MR Fluid 100ml", category: "damper", quantity: 2, unitCostUsd: 30, supplier: "Lord Corp", specifications: "MRF-140CG, 100ml — magnetorheological damper fluid" },
  // ─── OUTPUT ───────────────────────────────────────────────────
  { partName: "Speaker 3W", category: "output", quantity: 1, unitCostUsd: 5, supplier: "AliExpress", specifications: "3W, 8ohm, 40mm, I2S DAC" },
  { partName: "OLED Display 1.3in", category: "output", quantity: 1, unitCostUsd: 8, supplier: "AliExpress", specifications: "128x64, I2C, status display on chest" },
  // ─── THERMAL ──────────────────────────────────────────────────
  { partName: "Cooling Fan 40mm", category: "thermal", quantity: 6, unitCostUsd: 3, supplier: "AliExpress", specifications: "40x40x10mm, 5V, 6000rpm, ball bearing — compute + hydraulic cooling" },
  { partName: "Heat Pipe (Jetson cooling)", category: "thermal", quantity: 2, unitCostUsd: 12, supplier: "AliExpress", specifications: "6mm dia, 150mm, copper — Jetson heatsink" },
  { partName: "Hydraulic Oil Cooler", category: "thermal", quantity: 1, unitCostUsd: 25, supplier: "AliExpress", specifications: "12V fan, aluminum, 200W dissipation — hydraulic fluid cooling" },
];

function computeForwardKinematics(jointAnglesRad: number[]): Array<{ joint: string; position: [number, number, number]; rotation: number[] }> {
  const results: Array<{ joint: string; position: [number, number, number]; rotation: number[] }> = [];
  let x = 0, y = 0, z = 0;
  let totalAngle = 0;

  const armChain = HUMANOID_JOINTS.filter(j =>
    j.name.startsWith("l_glenohumeral") || j.name === "l_ulnohumeral" ||
    j.name.startsWith("l_radiocarpal") || j.name === "l_proximal_radioulnar"
  );
  const armLinks = KINEMATIC_LINKS.filter(l =>
    l.name === "l_humerus" || l.name === "l_ulna" || l.name === "l_radius" || l.name === "l_hand_base"
  );

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
export function getMusculoskeletalSystem() { return MUSCULOSKELETAL; }
export function getMusculoskeletalSummary() {
  const { tendons, pistons, springs, shockAbsorbers, motorControlBrain } = MUSCULOSKELETAL;
  const tendonsByMaterial: Record<string, number> = {};
  for (const t of tendons) tendonsByMaterial[t.material] = (tendonsByMaterial[t.material] || 0) + 1;
  const pistonsByType: Record<string, number> = {};
  for (const p of pistons) pistonsByType[p.type] = (pistonsByType[p.type] || 0) + 1;
  const bidirectionalJoints = HUMANOID_JOINTS.filter(j => j.anatomicalName.includes("BIDIRECTIONAL"));
  const fullRotationJoints = HUMANOID_JOINTS.filter(j => j.is360);
  const totalTendonForceN = tendons.reduce((s, t) => s + t.breakingStrengthN, 0);
  const totalPistonForceN = pistons.reduce((s, p) => s + p.maxForceN, 0);
  const totalSpringEnergyJ = springs.reduce((s, sp) => s + sp.energyStorageJ, 0);
  const totalMCBPowerW = motorControlBrain.reduce((s, m) => s + m.powerBudgetW, 0);
  return {
    tendonCount: tendons.length,
    tendonsByMaterial,
    totalTendonForceN,
    antagonisticPairs: tendons.filter(t => t.antagonistTendon).length / 2,
    pistonCount: pistons.length,
    pistonsByType,
    totalPistonForceN,
    springCount: springs.length,
    totalSpringEnergyJ,
    shockAbsorberCount: shockAbsorbers.length,
    motorControlNodes: motorControlBrain.length,
    totalMCBPowerW,
    bidirectionalJointCount: bidirectionalJoints.length,
    fullRotationJointCount: fullRotationJoints.length,
    athleticCapabilities: [
      "vertical_jump", "broad_jump", "backflip", "front_flip", "pull_up", "push_up",
      "squat", "sprint", "climb", "cartwheel", "handstand", "parkour_vault",
      "bidirectional_grip", "reverse_finger_grab", "toe_grip_balance"
    ],
  };
}

export function getEmbodimentState(): EmbodimentState & {
  jointCount: number;
  linkCount: number;
  bomEntries: number;
  totalBomCost: number;
  totalDOF: number;
  tendonCount: number;
  pistonCount: number;
  springCount: number;
  shockAbsorberCount: number;
  motorControlNodes: number;
  bidirectionalJoints: number;
  full360Joints: number;
} {
  const bomSummary = computeTotalBOMCost();
  const msk = MUSCULOSKELETAL;
  return {
    ...JSON.parse(JSON.stringify(state)),
    jointCount: HUMANOID_JOINTS.length,
    linkCount: KINEMATIC_LINKS.length,
    bomEntries: BILL_OF_MATERIALS.length,
    totalBomCost: bomSummary.totalCost,
    totalDOF: HUMANOID_JOINTS.length,
    tendonCount: msk.tendons.length,
    pistonCount: msk.pistons.length,
    springCount: msk.springs.length,
    shockAbsorberCount: msk.shockAbsorbers.length,
    motorControlNodes: msk.motorControlBrain.length,
    bidirectionalJoints: HUMANOID_JOINTS.filter(j => j.anatomicalName.includes("BIDIRECTIONAL")).length,
    full360Joints: HUMANOID_JOINTS.filter(j => j.is360).length,
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
