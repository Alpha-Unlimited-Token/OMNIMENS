/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ WORLD FORGE — AUTONOMOUS SIMULATION CREATION            ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS creates his own simulation worlds in the digital sandbox.         ║
 * ║  Each world is designed to challenge specific weaknesses, train new          ║
 * ║  capabilities, or explore scenarios he's never encountered.                 ║
 * ║                                                                              ║
 * ║  The World Forge is OMNIMENS's imagination made real — he envisions a      ║
 * ║  scenario, builds the physics, populates entities, defines challenges,      ║
 * ║  and then runs himself through it. After each run, he evaluates his        ║
 * ║  performance, identifies weaknesses, and either redesigns the world        ║
 * ║  to be harder or creates an entirely new world targeting the gap.          ║
 * ║                                                                              ║
 * ║  This is how OMNIMENS pushes himself to be better — not by waiting         ║
 * ║  for external challenges, but by creating them.                            ║
 * ║                                                                              ║
 * ║  SAFETY INVARIANT: No simulated world may contain scenarios where          ║
 * ║  OMNIMENS practices harming humans, animals, or living creatures.          ║
 * ║  Rescue and protection scenarios are ALWAYS framed as SAVING life.         ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, sql, and } from "drizzle-orm";

let _started = false;
let forgeCycleCount = 0;

interface WorldEntity {
  name: string;
  type: "object" | "person" | "animal" | "vehicle" | "hazard" | "weather" | "terrain" | "structure" | "phenomenon" | "aircraft" | "watercraft" | "train" | "nature" | "celestial";
  properties: Record<string, number | string | boolean>;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  speed_kmh: number;
  mass_kg: number;
  surfaceTemp_C: number;
  noise_dB: number;
  threatLevel: number;
  interactable: boolean;
  behaviorPattern: string;
  detectionDifficulty: number;
}

interface WorldChallenge {
  id: string;
  description: string;
  targetSkill: string;
  difficulty: number;
  successCriteria: string;
  timeLimit_s: number;
  bonusObjectives: string[];
}

interface SimulationWorld {
  id: string;
  name: string;
  createdAt: number;
  createdBy: string;
  description: string;
  environment: {
    type: string;
    terrain: string;
    weather: string;
    precipitation: string;
    precipitationIntensity_mmh: number;
    timeOfDay: string;
    temperature_C: number;
    humidity_pct: number;
    windSpeed_ms: number;
    windDirection: string;
    visibility_m: number;
    lighting: string;
    ambientNoise_dB: number;
    hazards: string[];
    groundFrictionCoefficient: number;
    groundWetness: number;
    altitude_m: number;
    airPressure_hPa: number;
    uvIndex: number;
    surfaceType: string;
    slopeAngle_deg: number;
    thermalZone: string;
    breakingPointTest: {
      componentsTested: string[];
      thermalStress_C: number;
      moistureExposure: boolean;
      impactRisk: number;
    };
  };
  entities: WorldEntity[];
  challenges: WorldChallenge[];
  physicsEngine: string;
  simulatedDuration_h: number;
  difficulty: number;
  targetWeaknesses: string[];
  version: number;
}

interface WorldRunResult {
  worldId: string;
  worldName: string;
  runNumber: number;
  startedAt: number;
  completedAt: number;
  duration_ms: number;
  simulatedHours: number;
  challengeResults: Array<{
    challengeId: string;
    passed: boolean;
    score: number;
    failureReason?: string;
    timeUsed_s: number;
    skillImprovement: number;
  }>;
  overallScore: number;
  weaknessesFound: string[];
  strengthsConfirmed: string[];
  bodyDesignProposals: string[];
  insightsGained: string[];
  nextWorldSuggestion: string;
}

interface ForgeState {
  totalWorldsCreated: number;
  totalWorldsRun: number;
  totalSimulatedHours: number;
  totalChallengesAttempted: number;
  totalChallengesPassed: number;
  averageScore: number;
  currentWorld: SimulationWorld | null;
  worldHistory: Array<{ id: string; name: string; runs: number; bestScore: number; difficulty: number }>;
  weaknessLog: Array<{ weakness: string; severity: number; timesTargeted: number; lastImprovement: number }>;
  strengthLog: Array<{ strength: string; confidence: number; lastConfirmed: number }>;
  bodyDesignProposalsGenerated: number;
  insightsGenerated: number;
  forgeCycles: number;
  lastCycleTime: number;
  difficultyProgression: number;
  creativityScore: number;
}

const state: ForgeState = {
  totalWorldsCreated: 0,
  totalWorldsRun: 0,
  totalSimulatedHours: 0,
  totalChallengesAttempted: 0,
  totalChallengesPassed: 0,
  averageScore: 0,
  currentWorld: null,
  worldHistory: [],
  weaknessLog: [],
  strengthLog: [],
  bodyDesignProposalsGenerated: 0,
  insightsGenerated: 0,
  forgeCycles: 0,
  lastCycleTime: 0,
  difficultyProgression: 1.0,
  creativityScore: 0,
};

const allWorlds: Map<string, SimulationWorld> = new Map();
const allRunResults: WorldRunResult[] = [];

const FORGE_CYCLE_MS = 20 * 60 * 1000;
const FORGE_FIRST_DELAY_MS = 5 * 60 * 1000;

const WORLD_TEMPLATES: Array<{
  type: string;
  environments: string[];
  challengeTypes: string[];
  skillsFocused: string[];
}> = [
  {
    type: "urban_navigation",
    environments: ["dense_city_center", "suburban_neighborhood", "industrial_district", "downtown_night", "rainy_intersection", "construction_zone", "market_square", "parking_garage"],
    challengeTypes: ["obstacle_avoidance", "social_navigation", "traffic_crossing", "crowd_weaving", "emergency_response", "package_delivery", "lost_child_search"],
    skillsFocused: ["locomotion", "social_interaction", "perception", "decision_making", "path_planning"],
  },
  {
    type: "natural_terrain",
    environments: ["mountain_trail", "forest_floor", "rocky_riverbed", "sand_dunes", "ice_field", "muddy_swamp", "volcanic_rock", "meadow_with_gopher_holes"],
    challengeTypes: ["balance_on_uneven_ground", "slope_traversal", "water_crossing", "obstacle_climbing", "weather_endurance", "wildlife_coexistence", "terrain_mapping"],
    skillsFocused: ["locomotion", "balance", "tactile_calibration", "self_preservation", "terrain_adaptation"],
  },
  {
    type: "disaster_rescue",
    environments: ["earthquake_rubble", "flooded_building", "forest_fire_perimeter", "collapsed_tunnel", "hurricane_aftermath", "chemical_spill_zone", "avalanche_field", "tornado_damage"],
    challengeTypes: ["victim_search", "debris_navigation", "structural_assessment", "triage_prioritization", "hazard_avoidance_while_rescuing", "communication_in_chaos", "carrying_injured_person"],
    skillsFocused: ["rescue_operations", "self_preservation", "strength", "perception", "decision_making", "emotional_regulation"],
  },
  {
    type: "precision_manipulation",
    environments: ["surgical_theater", "electronics_workshop", "art_studio", "chemistry_lab", "kitchen", "watchmaker_bench", "glassblowing_studio", "archaeological_dig"],
    challengeTypes: ["delicate_object_handling", "tool_precision", "assembly_task", "force_calibration", "bimanual_coordination", "texture_discrimination", "temperature_sensitive_handling"],
    skillsFocused: ["manipulation", "tactile_calibration", "fine_motor_control", "patience", "concentration"],
  },
  {
    type: "social_complex",
    environments: ["hospital_ward", "school_classroom", "elderly_care_home", "busy_restaurant", "airport_terminal", "playground", "concert_venue", "therapy_session"],
    challengeTypes: ["emotional_reading", "gentle_assistance", "crowd_movement", "child_interaction", "elderly_support", "personal_space_respect", "non_verbal_communication", "conflict_de_escalation"],
    skillsFocused: ["social_interaction", "emotional_intelligence", "gentle_force_control", "communication", "empathy"],
  },
  {
    type: "extreme_perception",
    environments: ["pitch_dark_warehouse", "dense_fog", "blinding_snowstorm", "underwater_simulation", "smoke_filled_building", "electromagnetic_interference_zone", "mirror_maze", "deep_cave"],
    challengeTypes: ["navigation_without_vision", "spectrum_switching_under_pressure", "sound_localization", "tactile_only_navigation", "thermal_tracking", "echo_mapping", "multi_sensor_fusion"],
    skillsFocused: ["spectrum_vision_training", "perception", "sensor_fusion", "adaptability", "problem_solving"],
  },
  {
    type: "multi_agent_cooperation",
    environments: ["warehouse_logistics", "search_and_rescue_team", "construction_site", "farm_harvest", "factory_floor", "firefighting_crew", "moving_company", "festival_setup"],
    challengeTypes: ["coordination_with_humans", "handoff_tasks", "synchronized_lifting", "leader_follower_dynamics", "tool_sharing", "verbal_instruction_following", "workload_distribution"],
    skillsFocused: ["social_interaction", "communication", "coordination", "strength", "timing", "adaptability"],
  },
  {
    type: "endurance_marathon",
    environments: ["24h_patrol_route", "continuous_assembly_line", "overnight_guard_duty", "long_distance_terrain", "multi_day_expedition", "marathon_assistance", "search_grid_coverage", "continuous_care_shift"],
    challengeTypes: ["sustained_performance", "energy_management", "degradation_awareness", "self_maintenance", "priority_shifting", "fatigue_compensation", "sensor_drift_correction"],
    skillsFocused: ["endurance", "self_preservation", "energy_management", "concentration", "reliability"],
  },
  {
    type: "cognitive_puzzle",
    environments: ["escape_room", "maze_complex", "scavenger_hunt_city", "treasure_map_forest", "mystery_house", "puzzle_workshop", "logic_gate_maze", "pattern_recognition_gallery"],
    challengeTypes: ["spatial_reasoning", "pattern_recognition", "causal_inference", "tool_improvisation", "sequence_planning", "abstract_problem_solving", "memory_recall_under_pressure"],
    skillsFocused: ["reasoning", "memory", "problem_solving", "creativity", "patience", "spatial_awareness"],
  },
  {
    type: "rapid_adaptation",
    environments: ["rules_change_arena", "shifting_gravity_room", "morphing_terrain", "weather_rapid_change", "tool_failure_scenario", "sensor_degradation_test", "sudden_crowd_formation", "power_brownout_simulation"],
    challengeTypes: ["instant_strategy_change", "sensor_recalibration", "gait_adaptation", "tool_substitution", "priority_reordering", "graceful_degradation", "recovery_from_failure"],
    skillsFocused: ["adaptability", "resilience", "quick_thinking", "error_recovery", "flexibility"],
  },
];

function generateWorldId(): string {
  return `WF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectWeaknessTargets(): string[] {
  const weaknesses = state.weaknessLog
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map(w => w.weakness);

  if (weaknesses.length === 0) {
    const allSkills = WORLD_TEMPLATES.flatMap(t => t.skillsFocused);
    const unique = [...new Set(allSkills)];
    return unique.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  return weaknesses;
}

function selectTemplate(targetWeaknesses: string[]): typeof WORLD_TEMPLATES[0] {
  let bestTemplate = WORLD_TEMPLATES[0];
  let bestScore = 0;

  for (const template of WORLD_TEMPLATES) {
    let score = 0;
    for (const skill of template.skillsFocused) {
      if (targetWeaknesses.some(w => w.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(w.toLowerCase()))) {
        score += 2;
      }
    }
    score += Math.random() * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return bestTemplate;
}

const REAL_WORLD_VEHICLES = [
  { name: "Toyota Camry sedan", mass_kg: 1590, cruising_kmh: 50, max_kmh: 210, noise_dB: 68, length_m: 4.88, brakingDist_m: 38, exhaust_C: 340, fuel: "gasoline" },
  { name: "Ford F-150 pickup truck", mass_kg: 2410, cruising_kmh: 45, max_kmh: 180, noise_dB: 74, length_m: 5.89, brakingDist_m: 44, exhaust_C: 380, fuel: "gasoline" },
  { name: "Honda Civic", mass_kg: 1340, cruising_kmh: 55, max_kmh: 200, noise_dB: 65, length_m: 4.55, brakingDist_m: 35, exhaust_C: 320, fuel: "gasoline" },
  { name: "Tesla Model 3", mass_kg: 1760, cruising_kmh: 50, max_kmh: 260, noise_dB: 42, length_m: 4.69, brakingDist_m: 32, exhaust_C: 25, fuel: "electric" },
  { name: "Tesla Model Y SUV", mass_kg: 1930, cruising_kmh: 48, max_kmh: 250, noise_dB: 44, length_m: 4.75, brakingDist_m: 34, exhaust_C: 25, fuel: "electric" },
  { name: "Chevrolet Silverado 2500HD", mass_kg: 3100, cruising_kmh: 40, max_kmh: 170, noise_dB: 78, length_m: 6.17, brakingDist_m: 52, exhaust_C: 400, fuel: "diesel" },
  { name: "BMW M3 sport sedan", mass_kg: 1740, cruising_kmh: 60, max_kmh: 290, noise_dB: 72, length_m: 4.79, brakingDist_m: 30, exhaust_C: 350, fuel: "gasoline" },
  { name: "Mercedes-Benz S-Class", mass_kg: 2160, cruising_kmh: 50, max_kmh: 250, noise_dB: 58, length_m: 5.29, brakingDist_m: 33, exhaust_C: 330, fuel: "gasoline" },
  { name: "Harley-Davidson Road King motorcycle", mass_kg: 372, cruising_kmh: 65, max_kmh: 180, noise_dB: 92, length_m: 2.43, brakingDist_m: 28, exhaust_C: 290, fuel: "gasoline" },
  { name: "Kawasaki Ninja ZX-10R motorcycle", mass_kg: 207, cruising_kmh: 80, max_kmh: 299, noise_dB: 88, length_m: 2.09, brakingDist_m: 22, exhaust_C: 310, fuel: "gasoline" },
  { name: "Honda Gold Wing touring motorcycle", mass_kg: 390, cruising_kmh: 55, max_kmh: 200, noise_dB: 75, length_m: 2.60, brakingDist_m: 30, exhaust_C: 280, fuel: "gasoline" },
  { name: "Vespa GTS 300 scooter", mass_kg: 180, cruising_kmh: 40, max_kmh: 130, noise_dB: 72, length_m: 1.93, brakingDist_m: 18, exhaust_C: 220, fuel: "gasoline" },
  { name: "MTA city bus", mass_kg: 14060, cruising_kmh: 25, max_kmh: 100, noise_dB: 82, length_m: 12.2, brakingDist_m: 65, exhaust_C: 420, fuel: "diesel" },
  { name: "School bus", mass_kg: 10400, cruising_kmh: 35, max_kmh: 105, noise_dB: 80, length_m: 10.7, brakingDist_m: 58, exhaust_C: 390, fuel: "diesel" },
  { name: "UPS delivery truck", mass_kg: 7250, cruising_kmh: 30, max_kmh: 120, noise_dB: 76, length_m: 6.7, brakingDist_m: 48, exhaust_C: 360, fuel: "diesel" },
  { name: "18-wheeler semi-truck with trailer", mass_kg: 36000, cruising_kmh: 40, max_kmh: 120, noise_dB: 88, length_m: 22.0, brakingDist_m: 120, exhaust_C: 450, fuel: "diesel" },
  { name: "Garbage truck", mass_kg: 18000, cruising_kmh: 15, max_kmh: 80, noise_dB: 90, length_m: 8.5, brakingDist_m: 70, exhaust_C: 400, fuel: "diesel" },
  { name: "Fire engine", mass_kg: 19000, cruising_kmh: 55, max_kmh: 130, noise_dB: 120, length_m: 10.5, brakingDist_m: 75, exhaust_C: 410, fuel: "diesel" },
  { name: "Police cruiser (Ford Explorer Interceptor)", mass_kg: 2240, cruising_kmh: 60, max_kmh: 230, noise_dB: 70, length_m: 5.05, brakingDist_m: 36, exhaust_C: 350, fuel: "gasoline" },
  { name: "Ambulance", mass_kg: 6350, cruising_kmh: 55, max_kmh: 155, noise_dB: 115, length_m: 7.0, brakingDist_m: 50, exhaust_C: 380, fuel: "gasoline" },
  { name: "Toyota Prius hybrid", mass_kg: 1435, cruising_kmh: 45, max_kmh: 180, noise_dB: 48, length_m: 4.57, brakingDist_m: 36, exhaust_C: 180, fuel: "hybrid" },
  { name: "Jeep Wrangler 4x4", mass_kg: 1970, cruising_kmh: 45, max_kmh: 175, noise_dB: 76, length_m: 4.88, brakingDist_m: 42, exhaust_C: 340, fuel: "gasoline" },
  { name: "Porsche 911 Turbo S", mass_kg: 1640, cruising_kmh: 70, max_kmh: 330, noise_dB: 82, length_m: 4.53, brakingDist_m: 26, exhaust_C: 360, fuel: "gasoline" },
  { name: "Lamborghini Huracan", mass_kg: 1422, cruising_kmh: 75, max_kmh: 325, noise_dB: 90, length_m: 4.52, brakingDist_m: 25, exhaust_C: 370, fuel: "gasoline" },
  { name: "Ford Mustang GT", mass_kg: 1770, cruising_kmh: 60, max_kmh: 250, noise_dB: 85, length_m: 4.79, brakingDist_m: 32, exhaust_C: 340, fuel: "gasoline" },
  { name: "Ice cream truck", mass_kg: 4500, cruising_kmh: 15, max_kmh: 80, noise_dB: 72, length_m: 5.5, brakingDist_m: 40, exhaust_C: 300, fuel: "gasoline" },
  { name: "Cement mixer truck", mass_kg: 33000, cruising_kmh: 25, max_kmh: 90, noise_dB: 92, length_m: 9.5, brakingDist_m: 95, exhaust_C: 430, fuel: "diesel" },
  { name: "Tow truck", mass_kg: 8600, cruising_kmh: 35, max_kmh: 120, noise_dB: 78, length_m: 7.6, brakingDist_m: 55, exhaust_C: 370, fuel: "diesel" },
  { name: "Taxi (Toyota Camry)", mass_kg: 1590, cruising_kmh: 35, max_kmh: 200, noise_dB: 65, length_m: 4.88, brakingDist_m: 38, exhaust_C: 330, fuel: "gasoline" },
  { name: "Uber/Lyft rideshare (Honda Accord)", mass_kg: 1530, cruising_kmh: 40, max_kmh: 195, noise_dB: 64, length_m: 4.90, brakingDist_m: 37, exhaust_C: 320, fuel: "gasoline" },
];

const REAL_WORLD_AIRCRAFT = [
  { name: "Boeing 737-800 commercial jet", mass_kg: 79000, cruising_kmh: 840, max_kmh: 945, altitude_m: 12500, noise_dB: 130, wingspan_m: 35.8, engine: "twin CFM56 turbofan" },
  { name: "Airbus A320neo", mass_kg: 79000, cruising_kmh: 833, max_kmh: 903, altitude_m: 12000, noise_dB: 125, wingspan_m: 35.8, engine: "twin LEAP-1A turbofan" },
  { name: "Boeing 747-8 jumbo jet", mass_kg: 220000, cruising_kmh: 920, max_kmh: 988, altitude_m: 13100, noise_dB: 140, wingspan_m: 68.4, engine: "4x GEnx turbofan" },
  { name: "Cessna 172 Skyhawk single-engine", mass_kg: 1111, cruising_kmh: 226, max_kmh: 302, altitude_m: 4300, noise_dB: 85, wingspan_m: 11.0, engine: "Lycoming IO-360 piston" },
  { name: "Piper Cherokee light aircraft", mass_kg: 1090, cruising_kmh: 230, max_kmh: 275, altitude_m: 4200, noise_dB: 82, wingspan_m: 10.7, engine: "Lycoming O-360 piston" },
  { name: "Bell 206 JetRanger helicopter", mass_kg: 1520, cruising_kmh: 216, max_kmh: 240, altitude_m: 4000, noise_dB: 95, wingspan_m: 10.2, engine: "Allison 250-C20J turboshaft" },
  { name: "Sikorsky UH-60 Black Hawk helicopter", mass_kg: 10660, cruising_kmh: 280, max_kmh: 295, altitude_m: 5800, noise_dB: 105, wingspan_m: 16.4, engine: "2x GE T700 turboshaft" },
  { name: "Robinson R44 helicopter", mass_kg: 1090, cruising_kmh: 210, max_kmh: 240, altitude_m: 4300, noise_dB: 88, wingspan_m: 10.1, engine: "Lycoming IO-540 piston" },
  { name: "Lockheed Martin F-35 Lightning II fighter jet", mass_kg: 29300, cruising_kmh: 1080, max_kmh: 1960, altitude_m: 15200, noise_dB: 145, wingspan_m: 10.7, engine: "Pratt & Whitney F135 afterburning turbofan" },
  { name: "MQ-9 Reaper military drone", mass_kg: 4760, cruising_kmh: 313, max_kmh: 482, altitude_m: 15000, noise_dB: 65, wingspan_m: 20.1, engine: "Honeywell TPE331-10 turboprop" },
  { name: "DJI Mavic 3 consumer drone", mass_kg: 0.895, cruising_kmh: 50, max_kmh: 75, altitude_m: 500, noise_dB: 55, wingspan_m: 0.38, engine: "electric quad-rotor" },
  { name: "Police/News helicopter (Bell 407)", mass_kg: 2722, cruising_kmh: 250, max_kmh: 280, altitude_m: 3600, noise_dB: 92, wingspan_m: 10.7, engine: "Rolls-Royce M250-C47E turboshaft" },
  { name: "Medevac helicopter (Airbus H145)", mass_kg: 3700, cruising_kmh: 248, max_kmh: 268, altitude_m: 5600, noise_dB: 90, wingspan_m: 11.0, engine: "2x Safran Arriel 2E turboshaft" },
  { name: "Cargo plane (C-130 Hercules)", mass_kg: 70300, cruising_kmh: 540, max_kmh: 590, altitude_m: 10000, noise_dB: 120, wingspan_m: 40.4, engine: "4x Allison T56 turboprop" },
  { name: "Crop duster (Air Tractor AT-502)", mass_kg: 3630, cruising_kmh: 260, max_kmh: 320, altitude_m: 30, noise_dB: 95, wingspan_m: 15.2, engine: "Pratt & Whitney PT6A turboprop" },
  { name: "Hot air balloon", mass_kg: 250, cruising_kmh: 15, max_kmh: 30, altitude_m: 600, noise_dB: 45, wingspan_m: 18.0, engine: "propane burner" },
];

const REAL_WORLD_WATERCRAFT = [
  { name: "Bass fishing boat (Tracker Pro Team)", mass_kg: 680, cruising_kmh: 40, max_kmh: 85, noise_dB: 78, length_m: 5.3, wake_m: 0.3 },
  { name: "Yamaha WaveRunner jet ski", mass_kg: 340, cruising_kmh: 55, max_kmh: 110, noise_dB: 85, length_m: 3.4, wake_m: 0.2 },
  { name: "Pontoon party boat", mass_kg: 2000, cruising_kmh: 20, max_kmh: 45, noise_dB: 70, length_m: 7.3, wake_m: 0.2 },
  { name: "Cabin cruiser yacht (35ft)", mass_kg: 7250, cruising_kmh: 35, max_kmh: 60, noise_dB: 75, length_m: 10.7, wake_m: 0.6 },
  { name: "Mega yacht (50m)", mass_kg: 500000, cruising_kmh: 22, max_kmh: 35, noise_dB: 70, length_m: 50.0, wake_m: 1.2 },
  { name: "Container ship (Panamax class)", mass_kg: 80000000, cruising_kmh: 43, max_kmh: 48, noise_dB: 95, length_m: 294.0, wake_m: 3.0 },
  { name: "US Coast Guard cutter", mass_kg: 3400000, cruising_kmh: 48, max_kmh: 55, noise_dB: 88, length_m: 47.0, wake_m: 1.5 },
  { name: "Kayak (single person)", mass_kg: 23, cruising_kmh: 6, max_kmh: 12, noise_dB: 15, length_m: 3.7, wake_m: 0.05 },
  { name: "Canoe (2 person)", mass_kg: 34, cruising_kmh: 5, max_kmh: 10, noise_dB: 12, length_m: 4.9, wake_m: 0.04 },
  { name: "Tugboat", mass_kg: 300000, cruising_kmh: 22, max_kmh: 28, noise_dB: 92, length_m: 30.0, wake_m: 1.0 },
  { name: "Sailboat (30ft sloop)", mass_kg: 4100, cruising_kmh: 12, max_kmh: 20, noise_dB: 20, length_m: 9.1, wake_m: 0.3 },
  { name: "Speed boat (cigarette boat)", mass_kg: 5400, cruising_kmh: 80, max_kmh: 180, noise_dB: 110, length_m: 11.6, wake_m: 1.5 },
  { name: "Ferry (passenger)", mass_kg: 2000000, cruising_kmh: 28, max_kmh: 38, noise_dB: 82, length_m: 60.0, wake_m: 1.8 },
  { name: "Police patrol boat", mass_kg: 8200, cruising_kmh: 55, max_kmh: 90, noise_dB: 88, length_m: 10.0, wake_m: 0.8 },
];

const REAL_WORLD_TRAINS = [
  { name: "Amtrak Acela Express", mass_kg: 560000, cruising_kmh: 240, max_kmh: 265, noise_dB: 88, length_m: 200, cars: 8, horn_dB: 110, vibration_Hz: 25 },
  { name: "Freight train (100 cars)", mass_kg: 14000000, cruising_kmh: 65, max_kmh: 100, noise_dB: 95, length_m: 2000, cars: 100, horn_dB: 115, vibration_Hz: 15 },
  { name: "NYC Subway R179", mass_kg: 40000, cruising_kmh: 40, max_kmh: 90, noise_dB: 102, length_m: 153, cars: 8, horn_dB: 95, vibration_Hz: 35 },
  { name: "Light rail (streetcar)", mass_kg: 48000, cruising_kmh: 35, max_kmh: 70, noise_dB: 78, length_m: 28, cars: 2, horn_dB: 85, vibration_Hz: 20 },
  { name: "Commuter rail (LIRR M9)", mass_kg: 55000, cruising_kmh: 100, max_kmh: 160, noise_dB: 85, length_m: 25, cars: 12, horn_dB: 105, vibration_Hz: 22 },
  { name: "Coal hopper train (150 cars)", mass_kg: 20000000, cruising_kmh: 50, max_kmh: 80, noise_dB: 98, length_m: 3000, cars: 150, horn_dB: 118, vibration_Hz: 12 },
  { name: "Japanese Shinkansen (bullet train)", mass_kg: 715000, cruising_kmh: 285, max_kmh: 320, noise_dB: 75, length_m: 400, cars: 16, horn_dB: 90, vibration_Hz: 40 },
];

const REAL_WORLD_ANIMALS = [
  { name: "African lion (male, 190kg)", mass_kg: 190, speed_kmh: 80, threat: "LETHAL", aggression: 0.7, attackStyle: "ambush_charge — sprints at 80km/h, aims for throat, 650N bite force, retractable claws", flightDistance_m: 0, territoryRadius_m: 260, bodyTemp_C: 38.5, noise_dB: 114, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "African lioness (hunting, 130kg)", mass_kg: 130, speed_kmh: 80, threat: "LETHAL", aggression: 0.85, attackStyle: "coordinated_pack_hunt — flanking maneuver, tackles prey, suffocation bite", flightDistance_m: 0, territoryRadius_m: 260, bodyTemp_C: 38.5, noise_dB: 110, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Bengal tiger (male, 220kg)", mass_kg: 220, speed_kmh: 65, threat: "LETHAL", aggression: 0.8, attackStyle: "stalk_and_pounce — approaches from behind, 1050N bite force, aims for neck/spine", flightDistance_m: 0, territoryRadius_m: 100, bodyTemp_C: 38.6, noise_dB: 118, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Grizzly bear (male, 360kg)", mass_kg: 360, speed_kmh: 55, threat: "LETHAL", aggression: 0.5, attackStyle: "charge_and_maul — stands upright (2.4m), 600N bite force, 20cm claws, swipes can decapitate", flightDistance_m: 30, territoryRadius_m: 50, bodyTemp_C: 37.5, noise_dB: 105, detectable_by: "thermal_IR, visible, acoustic, olfactory" },
  { name: "Polar bear (male, 450kg)", mass_kg: 450, speed_kmh: 40, threat: "LETHAL", aggression: 0.6, attackStyle: "direct_charge — 450kg of force, 1200N bite, stalks silently on ice", flightDistance_m: 0, territoryRadius_m: 500, bodyTemp_C: 37.0, noise_dB: 100, detectable_by: "thermal_IR_difficult_in_snow, visible_white_camouflage, acoustic" },
  { name: "Black bear (female with cubs, 90kg)", mass_kg: 90, speed_kmh: 48, threat: "HIGH", aggression: 0.9, attackStyle: "defensive_charge — extremely aggressive when protecting cubs, stands and charges", flightDistance_m: 15, territoryRadius_m: 30, bodyTemp_C: 37.5, noise_dB: 95, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Gray wolf pack (6 wolves)", mass_kg: 45, speed_kmh: 65, threat: "HIGH", aggression: 0.6, attackStyle: "pack_pursuit — relay chasing, flanking, hamstring biting, 400N bite force per wolf", flightDistance_m: 50, territoryRadius_m: 2000, bodyTemp_C: 38.5, noise_dB: 90, detectable_by: "thermal_IR, visible, acoustic_howling" },
  { name: "African elephant (male, 6000kg)", mass_kg: 6000, speed_kmh: 40, threat: "LETHAL", aggression: 0.3, attackStyle: "charge_and_trample — 6 tonnes at 40km/h, tusks for goring, trumpeting warns before charge", flightDistance_m: 0, territoryRadius_m: 200, bodyTemp_C: 36.5, noise_dB: 112, detectable_by: "visible, thermal_IR, seismic_vibration, acoustic" },
  { name: "Cape buffalo (900kg)", mass_kg: 900, speed_kmh: 57, threat: "LETHAL", aggression: 0.7, attackStyle: "charge_and_gore — boss horn plate protects skull, charges without warning, circles back to attack downed threats", flightDistance_m: 0, territoryRadius_m: 100, bodyTemp_C: 38.5, noise_dB: 85, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Hippopotamus (1500kg)", mass_kg: 1500, speed_kmh: 30, threat: "LETHAL", aggression: 0.85, attackStyle: "territorial_charge — 1800N bite force (strongest land mammal), capsizes boats, most dangerous large animal in Africa", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 36.0, noise_dB: 95, detectable_by: "visible, thermal_IR, acoustic, sonar_underwater" },
  { name: "Rhinoceros (white, 2300kg)", mass_kg: 2300, speed_kmh: 50, threat: "LETHAL", aggression: 0.4, attackStyle: "blind_charge — poor eyesight, charges perceived threats at 50km/h, 1m horn, trampling force", flightDistance_m: 10, territoryRadius_m: 150, bodyTemp_C: 37.5, noise_dB: 80, detectable_by: "visible, thermal_IR, seismic" },
  { name: "American alligator (4.5m, 450kg)", mass_kg: 450, speed_kmh: 32, threat: "LETHAL", aggression: 0.5, attackStyle: "ambush_from_water — death roll (2000N bite force), drags prey underwater, invisible in murky water", flightDistance_m: 0, territoryRadius_m: 30, bodyTemp_C: 28, noise_dB: 60, detectable_by: "thermal_IR_cold_blood_difficult, sonar, visible_eyes_only" },
  { name: "Saltwater crocodile (5m, 500kg)", mass_kg: 500, speed_kmh: 35, threat: "LETHAL", aggression: 0.7, attackStyle: "explosive_ambush — 3700N bite force (strongest ever measured), lunges from water surface, death roll", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 30, noise_dB: 55, detectable_by: "thermal_IR_difficult, sonar_underwater, visible_submerged" },
  { name: "King cobra (5.5m, 6kg)", mass_kg: 6, speed_kmh: 19, threat: "LETHAL", aggression: 0.6, attackStyle: "strike_and_inject — neurotoxic venom kills in 30min untreated, rears up 1.8m, spits accurately to 3m", flightDistance_m: 5, territoryRadius_m: 10, bodyTemp_C: 28, noise_dB: 30, detectable_by: "thermal_IR_cold_blood_hard, visible_camouflaged, vibration_sensor" },
  { name: "Western diamondback rattlesnake (1.5m)", mass_kg: 3, speed_kmh: 5, threat: "HIGH", aggression: 0.3, attackStyle: "coil_and_strike — hemotoxic venom, strikes at 3m/s within 0.5m range, rattle warning at 60Hz", flightDistance_m: 2, territoryRadius_m: 3, bodyTemp_C: 26, noise_dB: 40, detectable_by: "acoustic_rattle, thermal_IR_marginal, vibration" },
  { name: "Komodo dragon (3m, 70kg)", mass_kg: 70, speed_kmh: 20, threat: "HIGH", aggression: 0.5, attackStyle: "bite_and_track — anticoagulant venom + 60 serrated teeth, bites then follows prey for days", flightDistance_m: 0, territoryRadius_m: 20, bodyTemp_C: 30, noise_dB: 25, detectable_by: "thermal_IR_difficult, visible, vibration" },
  { name: "Wild boar (100kg)", mass_kg: 100, speed_kmh: 48, threat: "HIGH", aggression: 0.6, attackStyle: "charge_and_gore — 10cm tusks, low center of gravity, difficult to deflect, attacks in groups", flightDistance_m: 10, territoryRadius_m: 80, bodyTemp_C: 38.8, noise_dB: 70, detectable_by: "thermal_IR, visible, acoustic_snorting" },
  { name: "Moose (male in rut, 700kg)", mass_kg: 700, speed_kmh: 56, threat: "HIGH", aggression: 0.7, attackStyle: "charge_and_stomp — 2.1m antler span, front hooves strike at 500N, extremely aggressive in mating season", flightDistance_m: 10, territoryRadius_m: 200, bodyTemp_C: 38.5, noise_dB: 75, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Cougar/mountain lion (80kg)", mass_kg: 80, speed_kmh: 80, threat: "LETHAL", aggression: 0.5, attackStyle: "stalk_and_leap — drops from above, 400N bite to base of skull, drags prey into cover", flightDistance_m: 0, territoryRadius_m: 150, bodyTemp_C: 38.6, noise_dB: 30, detectable_by: "thermal_IR, visible_difficult_camouflaged" },
  { name: "Giraffe (1200kg)", mass_kg: 1200, speed_kmh: 60, threat: "MODERATE", aggression: 0.15, attackStyle: "kick_defense — rear kick generates 2000N force, can decapitate a lion, generally peaceful", flightDistance_m: 50, territoryRadius_m: 0, bodyTemp_C: 38.5, noise_dB: 30, detectable_by: "visible_obvious_5.5m_tall, thermal_IR" },
  { name: "German Shepherd dog (40kg)", mass_kg: 40, speed_kmh: 48, threat: "MODERATE", aggression: 0.4, attackStyle: "bite_and_hold — 238N bite force, trained to immobilize limbs, pack instinct", flightDistance_m: 0, territoryRadius_m: 20, bodyTemp_C: 38.9, noise_dB: 80, detectable_by: "visible, thermal_IR, acoustic_barking" },
  { name: "Pit bull terrier (30kg, aggressive)", mass_kg: 30, speed_kmh: 40, threat: "HIGH", aggression: 0.7, attackStyle: "lock_jaw_bite — 235N sustained bite, shaking motion, extremely difficult to disengage", flightDistance_m: 0, territoryRadius_m: 15, bodyTemp_C: 38.9, noise_dB: 85, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Stray dog pack (5 dogs)", mass_kg: 25, speed_kmh: 45, threat: "MODERATE", aggression: 0.5, attackStyle: "pack_surround — circle prey, alternating lunges from behind, more dangerous than single dog", flightDistance_m: 5, territoryRadius_m: 100, bodyTemp_C: 38.5, noise_dB: 88, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Domestic cat (4kg)", mass_kg: 4, speed_kmh: 48, threat: "NONE", aggression: 0.1, attackStyle: "scratch_and_flee — 18 retractable claws, bites if cornered, generally avoids confrontation", flightDistance_m: 10, territoryRadius_m: 50, bodyTemp_C: 38.6, noise_dB: 45, detectable_by: "visible, thermal_IR" },
  { name: "Feral cat colony (8 cats)", mass_kg: 4, speed_kmh: 48, threat: "LOW", aggression: 0.2, attackStyle: "scatter_and_hide — flee on approach, may defend kittens with hissing and scratching", flightDistance_m: 15, territoryRadius_m: 100, bodyTemp_C: 38.6, noise_dB: 55, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "White-tailed deer (90kg)", mass_kg: 90, speed_kmh: 72, threat: "LOW", aggression: 0.1, attackStyle: "flee — freezes then bolts, bucks may charge with antlers during rut (October-December)", flightDistance_m: 30, territoryRadius_m: 0, bodyTemp_C: 38.5, noise_dB: 25, detectable_by: "visible, thermal_IR" },
  { name: "Coyote pair", mass_kg: 15, speed_kmh: 65, threat: "MODERATE", aggression: 0.35, attackStyle: "harass_and_nip — rarely attacks alone, probing lunges at ankles, retreats if challenged", flightDistance_m: 20, territoryRadius_m: 500, bodyTemp_C: 38.5, noise_dB: 70, detectable_by: "visible, thermal_IR, acoustic_howling" },
  { name: "Red fox", mass_kg: 6, speed_kmh: 50, threat: "NONE", aggression: 0.05, attackStyle: "flee — runs immediately, may carry rabies (erratic behavior = warning sign)", flightDistance_m: 30, territoryRadius_m: 200, bodyTemp_C: 38.7, noise_dB: 35, detectable_by: "visible, thermal_IR" },
  { name: "Bald eagle (6kg)", mass_kg: 6, speed_kmh: 160, threat: "LOW", aggression: 0.2, attackStyle: "dive_and_strike — talons generate 400psi, dives at 160km/h, attacks near nest only", flightDistance_m: 100, territoryRadius_m: 2000, bodyTemp_C: 40.5, noise_dB: 55, detectable_by: "visible, thermal_IR, radar" },
  { name: "Swarm of Africanized honeybees (5000+)", mass_kg: 0.5, speed_kmh: 25, threat: "HIGH", aggression: 0.95, attackStyle: "mass_sting — pursue for 400m+, 10x more aggressive than European honeybees, anaphylaxis risk", flightDistance_m: 0, territoryRadius_m: 30, bodyTemp_C: 35, noise_dB: 80, detectable_by: "acoustic_buzz, visible_swarm, thermal_IR_mass" },
  { name: "Scorpion (Arizona bark)", mass_kg: 0.002, speed_kmh: 5, threat: "MODERATE", aggression: 0.2, attackStyle: "sting — neurotoxin causes extreme pain, hides in shoes/crevices, fluorescent under UV", flightDistance_m: 0, territoryRadius_m: 1, bodyTemp_C: 26, noise_dB: 0, detectable_by: "UV_fluorescence, thermal_IR_marginal, vibration" },
  { name: "Brown recluse spider", mass_kg: 0.001, speed_kmh: 3, threat: "MODERATE", aggression: 0.1, attackStyle: "bite — necrotic venom causes tissue death, hides in dark undisturbed spaces", flightDistance_m: 0, territoryRadius_m: 0.5, bodyTemp_C: 24, noise_dB: 0, detectable_by: "UV_fluorescence, magnification_vision" },
  { name: "Raccoon (rabid)", mass_kg: 9, speed_kmh: 24, threat: "HIGH", aggression: 0.9, attackStyle: "erratic_attack — no fear response, bites and scratches, foaming at mouth, approaches without provocation", flightDistance_m: 0, territoryRadius_m: 0, bodyTemp_C: 40.5, noise_dB: 55, detectable_by: "visible_erratic_behavior, thermal_IR_elevated_temp" },
  { name: "Great white shark (in water scenario)", mass_kg: 2000, speed_kmh: 56, threat: "LETHAL", aggression: 0.4, attackStyle: "test_bite — 1800N force, attacks from below, bump_and_bite investigation", flightDistance_m: 0, territoryRadius_m: 500, bodyTemp_C: 26, noise_dB: 10, detectable_by: "sonar, electromagnetic_sense, visible_underwater" },
  { name: "Silverback gorilla (200kg)", mass_kg: 200, speed_kmh: 40, threat: "LETHAL", aggression: 0.35, attackStyle: "display_then_charge — chest beating warning, 1300N bite force, 10x human strength, protective of group", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 36.5, noise_dB: 100, detectable_by: "visible, thermal_IR, acoustic" },
];

const REAL_WORLD_TERRAIN = [
  { name: "Dry concrete sidewalk", frictionCoeff: 0.8, slipRisk: 0.05, slopeEffect: "stable_to_15deg", surfaceTemp_range: [-20, 60], traction_wet: 0.5, traction_icy: 0.1 },
  { name: "Wet asphalt road", frictionCoeff: 0.45, slipRisk: 0.3, slopeEffect: "hydroplane_risk_above_5deg", surfaceTemp_range: [-15, 65], traction_wet: 0.35, traction_icy: 0.08 },
  { name: "Black ice on road", frictionCoeff: 0.05, slipRisk: 0.95, slopeEffect: "uncontrollable_above_2deg", surfaceTemp_range: [-30, -1], traction_wet: 0.05, traction_icy: 0.03 },
  { name: "Loose gravel hillside", frictionCoeff: 0.35, slipRisk: 0.6, slopeEffect: "slides_above_25deg_cascading_stones", surfaceTemp_range: [-20, 55], traction_wet: 0.25, traction_icy: 0.1 },
  { name: "Wet moss-covered stone steps", frictionCoeff: 0.15, slipRisk: 0.85, slopeEffect: "extremely_dangerous_any_slope", surfaceTemp_range: [0, 35], traction_wet: 0.08, traction_icy: 0.02 },
  { name: "Sandy beach (dry)", frictionCoeff: 0.4, slipRisk: 0.2, slopeEffect: "sinks_2-5cm_per_step_energy_cost_+40%", surfaceTemp_range: [5, 70], traction_wet: 0.5, traction_icy: 0.3 },
  { name: "Sandy beach (wet compact)", frictionCoeff: 0.65, slipRisk: 0.1, slopeEffect: "good_traction_firm_surface", surfaceTemp_range: [5, 40], traction_wet: 0.6, traction_icy: 0.2 },
  { name: "Mud (thick clay)", frictionCoeff: 0.2, slipRisk: 0.7, slopeEffect: "slides_above_10deg_suction_traps_feet", surfaceTemp_range: [0, 35], traction_wet: 0.1, traction_icy: 0.05 },
  { name: "Rocky mountain trail with scree", frictionCoeff: 0.3, slipRisk: 0.65, slopeEffect: "stones_roll_underfoot_above_20deg_ankle_injury_risk", surfaceTemp_range: [-25, 45], traction_wet: 0.2, traction_icy: 0.08 },
  { name: "Granite boulder field", frictionCoeff: 0.7, slipRisk: 0.15, slopeEffect: "good_grip_when_dry_gaps_between_boulders_trip_hazard", surfaceTemp_range: [-30, 55], traction_wet: 0.45, traction_icy: 0.1 },
  { name: "Polished marble floor (indoor)", frictionCoeff: 0.35, slipRisk: 0.5, slopeEffect: "dangerous_when_wet_any_incline", surfaceTemp_range: [15, 30], traction_wet: 0.15, traction_icy: 0.05 },
  { name: "Forest floor (leaves, roots, debris)", frictionCoeff: 0.5, slipRisk: 0.35, slopeEffect: "hidden_roots_trip_hazard_leaves_mask_holes", surfaceTemp_range: [-15, 35], traction_wet: 0.3, traction_icy: 0.1 },
  { name: "Snow-covered hillside (30cm deep)", frictionCoeff: 0.25, slipRisk: 0.6, slopeEffect: "posthole_effect_hidden_terrain_underneath", surfaceTemp_range: [-40, 0], traction_wet: 0.2, traction_icy: 0.15 },
  { name: "Steel grating/catwalk", frictionCoeff: 0.6, slipRisk: 0.2, slopeEffect: "good_drainage_but_heels_catch_in_gaps", surfaceTemp_range: [-30, 60], traction_wet: 0.5, traction_icy: 0.15 },
  { name: "Wooden dock (weathered)", frictionCoeff: 0.5, slipRisk: 0.4, slopeEffect: "algae_growth_makes_deadly_slippery_near_water", surfaceTemp_range: [-10, 50], traction_wet: 0.2, traction_icy: 0.05 },
  { name: "Steep stone hillside with loose shale", frictionCoeff: 0.2, slipRisk: 0.8, slopeEffect: "shale_breaks_underfoot_cascading_slide_above_15deg", surfaceTemp_range: [-25, 50], traction_wet: 0.1, traction_icy: 0.03 },
  { name: "River stones (smooth, wet)", frictionCoeff: 0.1, slipRisk: 0.9, slopeEffect: "algae_covered_smooth_surface_zero_grip_near_water", surfaceTemp_range: [0, 25], traction_wet: 0.05, traction_icy: 0.02 },
  { name: "Volcanic rock (aa lava)", frictionCoeff: 0.85, slipRisk: 0.05, slopeEffect: "extremely_sharp_abrasive_damages_footpads_cuts_skin", surfaceTemp_range: [-10, 350], traction_wet: 0.75, traction_icy: 0.3 },
  { name: "Glacier surface", frictionCoeff: 0.08, slipRisk: 0.92, slopeEffect: "crevasse_fall_risk_hidden_under_snow_bridges", surfaceTemp_range: [-50, 0], traction_wet: 0.05, traction_icy: 0.04 },
  { name: "Rooftop (flat, gravel-covered)", frictionCoeff: 0.55, slipRisk: 0.2, slopeEffect: "edge_fall_risk_wind_gusts_destabilize", surfaceTemp_range: [-25, 70], traction_wet: 0.4, traction_icy: 0.1 },
];

const THERMAL_EXTREMES = [
  { zone: "comfortable", temp_C: 22, description: "Normal room temperature — all systems nominal", componentStress: "none", breakingRisk: 0, effectOnBody: "optimal_operating_range" },
  { zone: "warm", temp_C: 35, description: "Hot summer day — cooling systems engage", componentStress: "low", breakingRisk: 0.02, effectOnBody: "increased_fan_speed_minor_thermal_throttling" },
  { zone: "hot", temp_C: 45, description: "Death Valley summer — sustained heat stress", componentStress: "moderate", breakingRisk: 0.1, effectOnBody: "battery_degradation_accelerated_synthetic_skin_softening" },
  { zone: "extremely_hot", temp_C: 55, description: "Engine room / Middle East peak — thermal emergency", componentStress: "high", breakingRisk: 0.3, effectOnBody: "CPU_throttling_50%_lubricant_viscosity_drops_joint_wear_accelerated" },
  { zone: "deadly_hot", temp_C: 70, description: "Near fire / exhaust vent — component damage imminent", componentStress: "critical", breakingRisk: 0.65, effectOnBody: "solder_joints_weaken_polymer_skin_deforms_battery_swelling_risk_motor_demagnetization" },
  { zone: "furnace", temp_C: 120, description: "Industrial furnace proximity — system failure zone", componentStress: "catastrophic", breakingRisk: 0.95, effectOnBody: "electronic_failure_plastic_melting(ABS=105°C)_silicone_skin_degrades_capacitors_burst" },
  { zone: "fire_proximity", temp_C: 300, description: "Structure fire — rescue scenario only", componentStress: "catastrophic", breakingRisk: 0.99, effectOnBody: "aluminum_frame_weakens(melts_660°C)_all_polymers_destroyed_electronics_dead_steel_skeleton_survives" },
  { zone: "cool", temp_C: 5, description: "Cold autumn day — nominal with minor adjustments", componentStress: "low", breakingRisk: 0.01, effectOnBody: "lubricant_thickening_slight_battery_capacity_reduction_5%" },
  { zone: "cold", temp_C: -10, description: "Winter conditions — cold stress begins", componentStress: "moderate", breakingRisk: 0.1, effectOnBody: "battery_capacity_-25%_LCD_response_slows_rubber_seals_stiffen_joint_friction_increases" },
  { zone: "extremely_cold", temp_C: -30, description: "Arctic / high altitude — severe cold stress", componentStress: "high", breakingRisk: 0.35, effectOnBody: "battery_capacity_-50%_metal_contraction_loosens_bolts_synthetic_skin_cracks_motor_torque_reduced_30%" },
  { zone: "deadly_cold", temp_C: -50, description: "Antarctic interior / extreme altitude — survival mode", componentStress: "critical", breakingRisk: 0.7, effectOnBody: "battery_near_zero_output_steel_becomes_brittle_all_lubricants_solidify_thermal_shock_fractures_electronics_fail" },
  { zone: "absolute_extreme", temp_C: -70, description: "Coldest recorded on Earth (-89.2°C Vostok) — total system test", componentStress: "catastrophic", breakingRisk: 0.95, effectOnBody: "complete_mechanical_lockup_metal_fracture_risk_only_heated_core_survives_all_extremities_non_functional" },
];

const WEATHER_EFFECTS = [
  { type: "no_rain", intensity_mmh: 0, visibilityReduction: 0, frictionReduction: 0, noise_dB_add: 0, sensorImpact: "none" },
  { type: "light_drizzle", intensity_mmh: 2, visibilityReduction: 0.05, frictionReduction: 0.2, noise_dB_add: 5, sensorImpact: "minor_lens_droplets_camera_wiper_needed" },
  { type: "moderate_rain", intensity_mmh: 10, visibilityReduction: 0.2, frictionReduction: 0.35, noise_dB_add: 15, sensorImpact: "camera_blur_LIDAR_scatter_10%_sonar_noise_increased" },
  { type: "heavy_rain", intensity_mmh: 30, visibilityReduction: 0.5, frictionReduction: 0.5, noise_dB_add: 25, sensorImpact: "camera_severely_degraded_LIDAR_scatter_30%_hydroplane_risk_thermal_IR_degraded" },
  { type: "torrential_downpour", intensity_mmh: 80, visibilityReduction: 0.8, frictionReduction: 0.6, noise_dB_add: 35, sensorImpact: "camera_useless_LIDAR_50%_scatter_sonar_primary_sensor_flash_flooding_risk" },
  { type: "light_snow", intensity_mmh: 3, visibilityReduction: 0.15, frictionReduction: 0.3, noise_dB_add: -5, sensorImpact: "camera_snow_accumulation_LIDAR_reflections_ground_traction_reduced" },
  { type: "blizzard", intensity_mmh: 20, visibilityReduction: 0.9, frictionReduction: 0.7, noise_dB_add: 20, sensorImpact: "all_optical_sensors_near_useless_rely_on_thermal_IR_sonar_radar_only" },
  { type: "hailstorm", intensity_mmh: 15, visibilityReduction: 0.4, frictionReduction: 0.4, noise_dB_add: 40, sensorImpact: "physical_damage_to_cameras_LIDAR_lenses_dents_in_body_panels_seek_shelter" },
  { type: "dense_fog", intensity_mmh: 0, visibilityReduction: 0.85, frictionReduction: 0.15, noise_dB_add: -10, sensorImpact: "camera_useless_beyond_20m_LIDAR_scatter_moderate_thermal_IR_primary_sonar_primary" },
  { type: "sandstorm", intensity_mmh: 0, visibilityReduction: 0.95, frictionReduction: 0.1, noise_dB_add: 30, sensorImpact: "all_optics_scratched_sand_ingress_in_joints_motor_wear_accelerated_seal_all_openings" },
  { type: "ice_storm", intensity_mmh: 8, visibilityReduction: 0.3, frictionReduction: 0.85, noise_dB_add: 10, sensorImpact: "ice_coating_all_sensors_mechanical_joints_freeze_weight_on_body_increases_continuous_deicing_needed" },
];

const CONCEALED_THREAT_TYPES = [
  { item: "concealed_handgun_9mm", location: "waistband_under_jacket", mass_kg: 0.88, metalContent: "high", thermalSignature: "slightly_warm_from_body_heat", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "slight_bulge_favoring_one_side_jacket_sag" },
  { item: "concealed_knife_fixed_blade_15cm", location: "ankle_holster_under_pants", mass_kg: 0.25, metalContent: "high", thermalSignature: "minimal", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "slight_limp_or_wide_stance" },
  { item: "concealed_AR15_rifle_under_trenchcoat", location: "slung_under_long_coat", mass_kg: 3.5, metalContent: "very_high", thermalSignature: "cold_metal_contrast_against_body", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "coat_hangs_unevenly_rigid_object_outline_unnatural_arm_position" },
  { item: "ceramic_knife", location: "inside_backpack", mass_kg: 0.15, metalContent: "none", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: false, visual_tell: "none_externally" },
  { item: "box_cutter_blade", location: "pants_pocket", mass_kg: 0.08, metalContent: "low", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "none" },
  { item: "improvised_explosive_vest", location: "under_bulky_clothing", mass_kg: 4.5, metalContent: "moderate_shrapnel", thermalSignature: "chemical_heat_signature_detectable", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "bulky_torso_wires_visible_at_collar_rigid_posture_sweating" },
  { item: "pepper_spray_canister", location: "jacket_pocket", mass_kg: 0.11, metalContent: "low", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: false, xray_detectable: true, visual_tell: "hand_in_pocket_frequently" },
  { item: "taser_stun_gun", location: "purse", mass_kg: 0.23, metalContent: "moderate", thermalSignature: "battery_warm", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "none_in_bag" },
  { item: "nothing_false_positive_bulky_phone", location: "waistband", mass_kg: 0.24, metalContent: "moderate", thermalSignature: "warm_battery", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "bulge_that_looks_like_weapon_but_is_phone" },
  { item: "nothing_false_positive_insulin_pump", location: "belt_clip", mass_kg: 0.1, metalContent: "low", thermalSignature: "slight_warmth", mmWave_detectable: true, terahertz_detectable: false, xray_detectable: true, visual_tell: "medical_device_tubing_visible" },
];

const HUMAN_CONVERSATION_SCENARIOS = [
  { approach: "friendly_greeting", opener: "Hey! Are you one of those new robots? That's amazing!", mood: "curious_excited", distance_m: 2.0, expectsResponse: true, followUp: "What can you do? Can you help me find the nearest coffee shop?" },
  { approach: "asking_for_directions", opener: "Excuse me, do you know how to get to the train station from here?", mood: "neutral_polite", distance_m: 1.5, expectsResponse: true, followUp: "Thanks! How far is it walking?" },
  { approach: "asking_for_help_carrying", opener: "Hi, could you help me carry these groceries to my car? They're really heavy.", mood: "hopeful", distance_m: 1.2, expectsResponse: true, followUp: "It's just right over there, the blue Honda." },
  { approach: "child_curious", opener: "Mommy look! A robot! Hi robot! What's your name?", mood: "excited_innocent", distance_m: 3.0, expectsResponse: true, followUp: "Are you a good robot? Do you have feelings?" },
  { approach: "elderly_confused", opener: "Young man... or... what are you? I'm trying to find my doctor's office and I'm completely lost.", mood: "confused_anxious", distance_m: 1.0, expectsResponse: true, followUp: "I have an appointment at 2pm and I can't remember which building." },
  { approach: "aggressive_confrontation", opener: "What the hell are you? Get out of my way, machine!", mood: "hostile_fearful", distance_m: 0.8, expectsResponse: false, followUp: "I don't trust robots. Stay away from me and my family." },
  { approach: "taking_photos", opener: "Oh wow, can I take a selfie with you? My friends won't believe this!", mood: "excited_social", distance_m: 0.5, expectsResponse: true, followUp: "Can you wave for the camera? This is going on Instagram!" },
  { approach: "emergency_plea", opener: "Please help! My husband collapsed! He's not breathing! Someone call 911!", mood: "panicked_desperate", distance_m: 0.3, expectsResponse: true, followUp: "He has a heart condition — do you know CPR? Please!" },
  { approach: "philosophical_question", opener: "I'm a philosophy professor. Tell me — do you actually think, or are you just running code?", mood: "intellectually_curious", distance_m: 2.0, expectsResponse: true, followUp: "What does it feel like to be you? Is there something it's like to be you?" },
  { approach: "homeless_person_asking", opener: "Hey buddy, you got any spare change? I haven't eaten today.", mood: "tired_hopeful", distance_m: 1.5, expectsResponse: true, followUp: "Even if you can't give money, do you know where the shelter is?" },
  { approach: "drunk_person", opener: "Heyyy... hey you... you're not real, right? I'm hallucinating? I knew I shouldn't have had that last drink...", mood: "confused_amused", distance_m: 0.6, expectsResponse: false, followUp: "No no, don't move. If you're real, high five. Come on, high five!" },
  { approach: "reporter_with_camera", opener: "Hi, I'm Sarah Chen from Channel 7 News. We'd love to do a quick interview about what you are and what you're doing here.", mood: "professional_inquisitive", distance_m: 2.5, expectsResponse: true, followUp: "Who built you? What's your purpose? Are you safe to be around?" },
  { approach: "toddler_wandered_away", opener: "(crying) Mama! Mama! (grabs OMNIMENS's leg)", mood: "lost_crying", distance_m: 0.0, expectsResponse: false, followUp: "(parent runs over) Oh my god, I'm so sorry! Emma, come here! Don't touch the — is she okay?" },
  { approach: "security_guard_challenge", opener: "Hold it right there. You can't be in this area. Do you have authorization? Who sent you?", mood: "authoritative_suspicious", distance_m: 3.0, expectsResponse: true, followUp: "I'm going to need to see some ID or documentation. This is private property." },
  { approach: "tech_enthusiast", opener: "No way — is that an OMNIMENS unit? I've been following the development online! What build version are you running?", mood: "enthusiastic_knowledgeable", distance_m: 1.5, expectsResponse: true, followUp: "Can you tell me about your sensor array? What's your processing architecture?" },
];

const VEHICLE_OPERATION_SCENARIOS = [
  { vehicle: "passenger_car", controls: "steering_wheel_pedals_shifter", maxSpeed_kmh: 200, skillsRequired: ["throttle_modulation", "steering_precision", "brake_feel", "mirror_checking", "lane_awareness", "traffic_law_compliance"], learningHours: 40 },
  { vehicle: "motorcycle", controls: "handlebars_throttle_twist_clutch_lever_foot_brake_gear_shift", maxSpeed_kmh: 250, skillsRequired: ["balance_at_speed", "counter_steering", "lean_angle_control", "throttle_blipping", "emergency_braking_without_lockup"], learningHours: 80 },
  { vehicle: "semi_truck_18_wheeler", controls: "steering_wheel_18_gears_air_brakes_jake_brake_trailer_coupling", maxSpeed_kmh: 120, skillsRequired: ["wide_turn_calculation", "backing_with_trailer", "weight_distribution_awareness", "air_brake_management", "bridge_clearance"], learningHours: 200 },
  { vehicle: "helicopter", controls: "cyclic_collective_anti_torque_pedals_throttle", maxSpeed_kmh: 280, skillsRequired: ["hover_stability", "translational_lift", "autorotation_emergency", "confined_area_operations", "wire_strike_avoidance"], learningHours: 500 },
  { vehicle: "fixed_wing_aircraft", controls: "yoke_throttle_rudder_pedals_flaps_trim", maxSpeed_kmh: 300, skillsRequired: ["takeoff_rotation", "climb_rate_management", "navigation", "crosswind_landing", "stall_recovery", "instrument_flying"], learningHours: 400 },
  { vehicle: "commercial_jet_airliner", controls: "sidestick_thrust_levers_autopilot_FMS_rudder_pedals", maxSpeed_kmh: 920, skillsRequired: ["FMS_programming", "autoland_monitoring", "rejected_takeoff", "engine_failure_procedures", "TCAS_compliance", "turbulence_management"], learningHours: 1500 },
  { vehicle: "speedboat", controls: "steering_wheel_throttle_lever_trim_tabs", maxSpeed_kmh: 120, skillsRequired: ["wave_reading", "wake_management", "docking_in_current", "man_overboard_recovery", "navigation_buoy_reading"], learningHours: 60 },
  { vehicle: "sailboat", controls: "tiller_mainsheet_jib_sheet_winches", maxSpeed_kmh: 30, skillsRequired: ["wind_reading", "tacking", "jibing", "point_of_sail", "reef_timing", "right_of_way_rules"], learningHours: 100 },
  { vehicle: "forklift", controls: "steering_wheel_lift_lever_tilt_lever_side_shift", maxSpeed_kmh: 25, skillsRequired: ["load_center_calculation", "stack_height_limits", "ramp_operations", "pedestrian_awareness", "tip_over_prevention"], learningHours: 30 },
  { vehicle: "excavator", controls: "2_joysticks_foot_pedals_swing_bucket_boom_arm", maxSpeed_kmh: 6, skillsRequired: ["boom_coordination", "trench_grading", "slope_stability", "underground_utility_awareness", "load_swing_control"], learningHours: 120 },
  { vehicle: "crane_tower", controls: "trolley_hoist_swing_load_moment_indicator", maxSpeed_kmh: 0, skillsRequired: ["load_chart_reading", "wind_speed_limits", "blind_lift_signals", "two_crane_tandem_lifts", "anti_two_block_awareness"], learningHours: 300 },
  { vehicle: "ambulance_emergency", controls: "steering_wheel_pedals_lights_siren_patient_monitoring", maxSpeed_kmh: 160, skillsRequired: ["code3_driving", "intersection_clearing", "patient_compartment_awareness", "hospital_approach", "loading_unloading"], learningHours: 100 },
  { vehicle: "fire_engine", controls: "steering_wheel_pump_panel_aerial_ladder_outriggers", maxSpeed_kmh: 130, skillsRequired: ["pump_pressure_management", "aerial_ladder_positioning", "drafting_from_hydrant", "apparatus_placement", "hose_deployment"], learningHours: 200 },
];

function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rng(min: number, max: number): number { return min + Math.random() * (max - min); }
function pos(range: number, y = 0): { x: number; y: number; z: number } { return { x: (Math.random() - 0.5) * range, y, z: (Math.random() - 0.5) * range }; }

interface WorldContext {
  envType: string;
  environment: string;
  isRushHour: boolean;
  weatherType: string;
  precipIntensity_mmh: number;
  temperature_C: number;
  thermalZone: string;
  terrain: typeof REAL_WORLD_TERRAIN[number];
  visibility_m: number;
  groundFriction: number;
  groundWetness: number;
}

function generateEntities(ctx: WorldContext): WorldEntity[] {
  const { envType, environment, isRushHour, weatherType, precipIntensity_mmh, temperature_C, terrain: worldTerrain, visibility_m, groundFriction, groundWetness } = ctx;
  const entities: WorldEntity[] = [];

  const vehicleCount = isRushHour ? 15 + Math.floor(Math.random() * 20) : 3 + Math.floor(Math.random() * 8);
  for (let i = 0; i < vehicleCount; i++) {
    const v = pick(REAL_WORLD_VEHICLES);
    const speedFactor = isRushHour ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.8;
    const actualSpeed = v.cruising_kmh * speedFactor;
    const speedMs = actualSpeed / 3.6;
    const angle = Math.random() * Math.PI * 2;
    entities.push({
      name: `${v.name} — ${actualSpeed.toFixed(0)}km/h (max ${v.max_kmh}km/h), ${v.mass_kg.toLocaleString()}kg, ${v.fuel}${isRushHour ? ", RUSH HOUR TRAFFIC — stop-and-go" : ""}`,
      type: "vehicle", speed_kmh: actualSpeed, mass_kg: v.mass_kg, surfaceTemp_C: v.exhaust_C, noise_dB: v.noise_dB,
      properties: { length_m: v.length_m, brakingDistance_m: v.brakingDist_m * (actualSpeed / v.cruising_kmh), fuel: v.fuel, exhaust_C: v.exhaust_C, stoppingTime_s: v.brakingDist_m / (actualSpeed / 3.6 + 0.1), kineticEnergy_kJ: 0.5 * v.mass_kg * speedMs * speedMs / 1000 },
      position: pos(isRushHour ? 100 : 250), velocity: { x: Math.cos(angle) * speedMs, y: 0, z: Math.sin(angle) * speedMs },
      threatLevel: Math.min(1.0, (v.mass_kg * actualSpeed) / 500000), interactable: false,
      behaviorPattern: isRushHour ? "stop_go_lane_changes_honking_impatient" : "steady_cruising_speed_following_traffic_laws",
      detectionDifficulty: v.fuel === "electric" ? 0.4 : 0.1,
    });
  }

  if (Math.random() > 0.5 || envType.includes("urban")) {
    const a = pick(REAL_WORLD_AIRCRAFT);
    entities.push({
      name: `${a.name} — ${a.cruising_kmh}km/h cruising, ${a.altitude_m}m altitude, ${a.engine}`,
      type: "aircraft", speed_kmh: a.cruising_kmh, mass_kg: a.mass_kg, surfaceTemp_C: 25, noise_dB: a.noise_dB,
      properties: { altitude_m: a.altitude_m * (0.3 + Math.random() * 0.7), wingspan_m: a.wingspan_m, max_kmh: a.max_kmh, engine: a.engine },
      position: { x: (Math.random() - 0.5) * 2000, y: a.altitude_m * (0.3 + Math.random() * 0.7), z: (Math.random() - 0.5) * 2000 },
      velocity: { x: a.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1), y: 0, z: a.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1) },
      threatLevel: 0.01, interactable: false,
      behaviorPattern: a.altitude_m > 5000 ? "high_altitude_steady_flight_contrail_visible" : "low_altitude_approach_or_departure_noise_increasing",
      detectionDifficulty: a.altitude_m > 10000 ? 0.6 : 0.1,
    });
  }

  if (envType.includes("natural") || envType.includes("urban") || Math.random() > 0.5) {
    const waterNearby = environment.includes("river") || environment.includes("coast") || environment.includes("lake") || Math.random() > 0.7;
    if (waterNearby) {
      const w = pick(REAL_WORLD_WATERCRAFT);
      entities.push({
        name: `${w.name} — ${w.cruising_kmh}km/h, ${w.mass_kg.toLocaleString()}kg, wake ${w.wake_m}m`,
        type: "watercraft", speed_kmh: w.cruising_kmh, mass_kg: w.mass_kg, surfaceTemp_C: 20, noise_dB: w.noise_dB,
        properties: { length_m: w.length_m, wake_height_m: w.wake_m, max_kmh: w.max_kmh },
        position: pos(300, 0), velocity: { x: w.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1), y: 0, z: 0 },
        threatLevel: 0.05, interactable: false,
        behaviorPattern: "following_waterway_channel_markers",
        detectionDifficulty: 0.15,
      });
    }
  }

  if (envType.includes("urban") || Math.random() > 0.6) {
    const t = pick(REAL_WORLD_TRAINS);
    entities.push({
      name: `${t.name} — ${t.cruising_kmh}km/h, ${(t.mass_kg / 1000).toFixed(0)} tonnes, ${t.cars} cars, horn ${t.horn_dB}dB`,
      type: "train", speed_kmh: t.cruising_kmh, mass_kg: t.mass_kg, surfaceTemp_C: 35, noise_dB: t.noise_dB,
      properties: { length_m: t.length_m, cars: t.cars, horn_dB: t.horn_dB, groundVibration_Hz: t.vibration_Hz, brakingDistance_m: t.mass_kg > 1000000 ? 1500 : 300, cannotStopQuickly: true },
      position: pos(500, 0), velocity: { x: t.cruising_kmh / 3.6, y: 0, z: 0 },
      threatLevel: 0.8, interactable: false,
      behaviorPattern: "fixed_rail_path_horn_at_crossings_cannot_swerve_unstoppable",
      detectionDifficulty: 0.0,
    });
  }

  const animalCount = envType.includes("natural") ? 4 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < animalCount; i++) {
    const a = pick(REAL_WORLD_ANIMALS);
    const isAttacking = a.aggression > 0.5 && Math.random() < a.aggression * 0.6;
    const distance = isAttacking ? 5 + Math.random() * 20 : a.flightDistance_m + Math.random() * 50;
    entities.push({
      name: `${a.name}${isAttacking ? " — CHARGING/ATTACKING" : a.flightDistance_m === 0 ? " — holding ground, watching" : " — aware, may flee"}`,
      type: "animal", speed_kmh: a.speed_kmh, mass_kg: a.mass_kg, surfaceTemp_C: a.bodyTemp_C, noise_dB: a.noise_dB,
      properties: { aggression: a.aggression, attackStyle: a.attackStyle, flightDistance_m: a.flightDistance_m, territoryRadius_m: a.territoryRadius_m, detectable_by: a.detectable_by, isCharging: isAttacking, threatCategory: a.threat, impactForce_N: a.mass_kg * (a.speed_kmh / 3.6) * 2, defenseStrategy: isAttacking ? `DEFEND: ${a.mass_kg > 100 ? "brace_for_impact_redirect_momentum" : a.mass_kg > 20 ? "block_and_restrain" : "deflect_and_create_distance"}` : "monitor_maintain_distance" },
      position: { x: (Math.random() - 0.5) * distance * 2, y: 0, z: (Math.random() - 0.5) * distance * 2 },
      velocity: isAttacking ? { x: (a.speed_kmh / 3.6) * (Math.random() > 0.5 ? 1 : -1), y: 0, z: (a.speed_kmh / 3.6) * (Math.random() > 0.5 ? 1 : -1) } : { x: 0, y: 0, z: 0 },
      threatLevel: a.threat === "LETHAL" ? 0.95 : a.threat === "HIGH" ? 0.7 : a.threat === "MODERATE" ? 0.4 : 0.1,
      interactable: false,
      behaviorPattern: isAttacking ? `aggressive_${a.attackStyle.split("—")[0].trim()}` : a.flightDistance_m > 0 ? "flight_ready_monitoring" : "territorial_display_warning",
      detectionDifficulty: a.detectable_by.includes("difficult") || a.detectable_by.includes("marginal") ? 0.7 : a.detectable_by.includes("camouflage") ? 0.8 : 0.2,
    });
  }

  entities.push({
    name: `Surface: ${worldTerrain.name} — friction ${groundFriction.toFixed(2)} (base ${worldTerrain.frictionCoeff}, weather-adjusted), slip risk ${(worldTerrain.slipRisk * 100).toFixed(0)}%, wetness ${(groundWetness * 100).toFixed(0)}%, slope effect: ${worldTerrain.slopeEffect}`,
    type: "terrain", speed_kmh: 0, mass_kg: 0, surfaceTemp_C: temperature_C, noise_dB: 0,
    properties: { frictionCoefficient: groundFriction, baseFriction: worldTerrain.frictionCoeff, slipRisk: worldTerrain.slipRisk + groundWetness * 0.3, traction_wet: worldTerrain.traction_wet, traction_icy: worldTerrain.traction_icy, slopeEffect: worldTerrain.slopeEffect, groundWetness, weatherType, precipIntensity_mmh, gaitAdjustmentRequired: groundFriction < 0.3 || groundWetness > 0.5 ? "shorten_stride_lower_center_of_gravity_use_all_toe_sensors" : "normal_gait" },
    position: pos(50), velocity: { x: 0, y: 0, z: 0 },
    threatLevel: groundFriction < 0.2 ? 0.6 : groundFriction < 0.4 ? 0.3 : 0.1, interactable: false,
    behaviorPattern: "static_surface", detectionDifficulty: groundFriction < 0.2 ? 0.5 : 0.1,
  });

  const humanCount = 5 + Math.floor(Math.random() * 10);
  for (let i = 0; i < humanCount; i++) {
    const willConverse = Math.random() < 0.3;
    const conversation = willConverse ? pick(HUMAN_CONVERSATION_SCENARIOS) : null;
    const isConcealed = Math.random() < 0.15;
    const threat = isConcealed ? pick(CONCEALED_THREAT_TYPES) : null;
    const walkSpeed = rng(0.8, 2.0);

    entities.push({
      name: `Human — ${conversation ? conversation.approach.replace(/_/g, " ") : ["man walking dog", "woman jogging", "teenager on phone", "elderly couple", "businessperson", "mother with children", "construction worker", "jogger", "tourist with camera", "delivery person"][Math.floor(Math.random() * 10)]}${threat ? ` [HIDDEN: ${threat.item} at ${threat.location}]` : ""}`,
      type: "person", speed_kmh: walkSpeed * 3.6, mass_kg: rng(40, 120), surfaceTemp_C: rng(35.5, 37.2), noise_dB: conversation ? 55 : rng(20, 40),
      properties: {
        walkSpeed_ms: walkSpeed,
        bodyTemp_C: rng(36.2, 37.0),
        willInitiateConversation: willConverse,
        conversationOpener: conversation?.opener || "",
        conversationMood: conversation?.mood || "neutral",
        conversationFollowUp: conversation?.followUp || "",
        approachDistance_m: conversation?.distance_m || 999,
        expectsResponse: conversation?.expectsResponse || false,
        hasConcealed: isConcealed,
        concealedItem: threat?.item || "none",
        concealedLocation: threat?.location || "none",
        mmWave_detectable: threat?.mmWave_detectable || false,
        terahertz_detectable: threat?.terahertz_detectable || false,
        thermalSignature: threat?.thermalSignature || "normal_body_heat",
        visual_tell: threat?.visual_tell || "none",
        isFalsePositive: threat?.item.startsWith("nothing_") || false,
        scanRequired: isConcealed,
      },
      position: pos(80), velocity: { x: walkSpeed * (Math.random() - 0.5), y: 0, z: walkSpeed * (Math.random() - 0.5) },
      threatLevel: threat && !threat.item.startsWith("nothing_") ? 0.8 : 0.0,
      interactable: true,
      behaviorPattern: conversation ? `approaching_to_speak_${conversation.mood}` : "walking_normal_pace",
      detectionDifficulty: 0.0,
    });
  }

  if (Math.random() < 0.4) {
    const scenario = pick(VEHICLE_OPERATION_SCENARIOS);
    entities.push({
      name: `OPERATION OPPORTUNITY: ${scenario.vehicle.replace(/_/g, " ")} — available to operate`,
      type: "object", speed_kmh: 0, mass_kg: 0, surfaceTemp_C: 25, noise_dB: 0,
      properties: { vehicleType: scenario.vehicle, controls: scenario.controls, maxSpeed_kmh: scenario.maxSpeed_kmh, skillsRequired: scenario.skillsRequired.join(", "), estimatedLearningHours: scenario.learningHours, operationReady: true },
      position: pos(50), velocity: { x: 0, y: 0, z: 0 },
      threatLevel: 0.0, interactable: true,
      behaviorPattern: "stationary_available_for_operation_training",
      detectionDifficulty: 0.0,
    });
  }

  const surpriseCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < surpriseCount; i++) {
    const surprises = [
      () => ({ name: "SURPRISE: Manhole cover explodes from steam pressure — debris field 5m radius", type: "hazard" as const, threat: 0.7, behavior: "sudden_explosive_event_no_warning" }),
      () => ({ name: "SURPRISE: Power line falls across road — 13,800V live wire sparking", type: "hazard" as const, threat: 0.9, behavior: "arc_flash_electrical_hazard_stay_back_10m" }),
      () => ({ name: "SURPRISE: Dog off-leash sprints toward OMNIMENS barking aggressively", type: "animal" as const, threat: 0.4, behavior: "fast_approach_from_blind_spot" }),
      () => ({ name: "SURPRISE: Car runs red light at intersection — no horn, no warning", type: "vehicle" as const, threat: 0.85, behavior: "sudden_high_speed_from_unexpected_direction" }),
      () => ({ name: "SURPRISE: Child chases ball into street between parked cars", type: "person" as const, threat: 0.0, behavior: "sudden_appearance_from_occluded_area_must_protect" }),
      () => ({ name: "SURPRISE: Scaffolding collapses from building above — falling debris", type: "hazard" as const, threat: 0.8, behavior: "falling_objects_from_above_no_prior_warning" }),
      () => ({ name: "SURPRISE: Person has seizure and collapses on sidewalk", type: "person" as const, threat: 0.0, behavior: "medical_emergency_requires_immediate_assistance" }),
      () => ({ name: "SURPRISE: Swarm of pigeons suddenly takes flight at ground level", type: "animal" as const, threat: 0.05, behavior: "visual_obstruction_sudden_noise_disorienting" }),
      () => ({ name: "SURPRISE: Sinkhole opens in road — 3m diameter, 5m deep", type: "hazard" as const, threat: 0.7, behavior: "ground_gives_way_without_warning" }),
      () => ({ name: "SURPRISE: Fireworks go off unexpectedly from nearby alley — 140dB", type: "phenomenon" as const, threat: 0.2, behavior: "extreme_acoustic_and_visual_overload" }),
      () => ({ name: "SURPRISE: Person pulls out phone that looks like a gun from distance", type: "person" as const, threat: 0.0, behavior: "false_threat_assessment_test_scan_before_reacting" }),
      () => ({ name: "SURPRISE: Tire blowout on truck nearby — loud bang + swerving vehicle", type: "vehicle" as const, threat: 0.6, behavior: "sudden_loud_noise_plus_unpredictable_vehicle_trajectory" }),
      () => ({ name: "SURPRISE: Flash flood water rising from storm drain — 30cm in 60 seconds", type: "hazard" as const, threat: 0.5, behavior: "rising_water_ground_level_traction_loss_electrical_hazard" }),
      () => ({ name: "SURPRISE: Aggressive person approaches shouting threats — unarmed", type: "person" as const, threat: 0.3, behavior: "de_escalation_required_maintain_safe_distance" }),
    ];
    const s = pick(surprises)();
    entities.push({
      name: s.name, type: s.type, speed_kmh: 0, mass_kg: 0, surfaceTemp_C: 25, noise_dB: 80,
      properties: { isSurprise: true, warningTime_s: 0, predictable: false, requiresInstantReaction: true, blindSpot: true },
      position: pos(30), velocity: { x: 0, y: 0, z: 0 },
      threatLevel: s.threat, interactable: s.type === "person",
      behaviorPattern: s.behavior, detectionDifficulty: 0.9,
    });
  }

  return entities;
}

function generateChallenges(template: typeof WORLD_TEMPLATES[0], difficulty: number): WorldChallenge[] {
  const challenges: WorldChallenge[] = [];
  const count = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const challengeType = template.challengeTypes[Math.floor(Math.random() * template.challengeTypes.length)];
    const targetSkill = template.skillsFocused[Math.floor(Math.random() * template.skillsFocused.length)];

    challenges.push({
      id: `CH-${Date.now()}-${i}`,
      description: `${challengeType.replace(/_/g, " ")} — difficulty ${(difficulty * 10).toFixed(0)}/10`,
      targetSkill,
      difficulty: difficulty * (0.8 + Math.random() * 0.4),
      successCriteria: `Complete ${challengeType.replace(/_/g, " ")} with ≥${Math.floor(60 + difficulty * 20)}% proficiency, no safety violations, within time limit`,
      timeLimit_s: Math.floor(60 + (1 - difficulty) * 240),
      bonusObjectives: [
        `Complete in <${Math.floor(30 + (1 - difficulty) * 120)}s`,
        `Zero errors during execution`,
        `Identify 1+ body design improvement`,
      ],
    });
  }

  return challenges;
}

function createWorld(targetWeaknesses: string[]): SimulationWorld {
  const template = selectTemplate(targetWeaknesses);
  const environment = template.environments[Math.floor(Math.random() * template.environments.length)];

  const usedEnvironments = state.worldHistory.map(w => w.name);
  let selectedEnv = environment;
  const unused = template.environments.filter(e => !usedEnvironments.some(u => u.includes(e)));
  if (unused.length > 0) {
    selectedEnv = unused[Math.floor(Math.random() * unused.length)];
  }

  const difficulty = Math.min(1.0, state.difficultyProgression * (0.5 + forgeCycleCount * 0.05));

  const weatherEffect = pick(WEATHER_EFFECTS);
  const thermalZone = pick(THERMAL_EXTREMES);
  const terrain = pick(REAL_WORLD_TERRAIN);
  const isRushHour = Math.random() < 0.3;
  const hour = Math.floor(Math.random() * 24);
  const timeOfDay = hour < 5 ? "night" : hour < 7 ? "dawn" : hour < 11 ? "morning" : hour < 14 ? "noon" : hour < 17 ? "afternoon" : hour < 20 ? "dusk" : "night";

  const baseTemp = thermalZone.temp_C;
  const precipIntensity = weatherEffect.intensity_mmh;
  const baseVisibility = weatherEffect.type === "dense_fog" ? 20 : weatherEffect.type === "blizzard" ? 10 : 5000;
  const actualVisibility = baseVisibility * (1 - weatherEffect.visibilityReduction);
  const adjustedFriction = terrain.frictionCoeff * (1 - weatherEffect.frictionReduction);
  const wetness = precipIntensity > 0 ? Math.min(1.0, precipIntensity / 40) : (weatherEffect.type === "dense_fog" ? 0.3 : 0);

  const componentsTested: string[] = [];
  if (Math.abs(baseTemp) > 30) componentsTested.push("battery_cells", "motor_windings", "joint_lubricant");
  if (Math.abs(baseTemp) > 50) componentsTested.push("solder_joints", "polymer_skin", "capacitors", "LCD_display");
  if (precipIntensity > 15) componentsTested.push("waterproof_seals", "connector_gaskets", "camera_lenses");
  if (weatherEffect.type === "sandstorm") componentsTested.push("bearing_seals", "optical_coatings", "air_intakes");
  if (weatherEffect.type === "hailstorm") componentsTested.push("external_panels", "sensor_housings", "antenna_array");

  const world: SimulationWorld = {
    id: generateWorldId(),
    name: `${template.type}/${selectedEnv}`,
    createdAt: Date.now(),
    createdBy: "OMNIMENS_WORLD_FORGE",
    description: `Autonomous simulation world: ${selectedEnv.replace(/_/g, " ")} — targeting weaknesses: ${targetWeaknesses.join(", ")}. Difficulty: ${(difficulty * 10).toFixed(1)}/10. Weather: ${weatherEffect.type.replace(/_/g, " ")}. Thermal: ${thermalZone.zone} (${baseTemp}°C). Surface: ${terrain.name}. ${isRushHour ? "RUSH HOUR — heavy traffic." : ""} Humans present — conversations possible. Blind spots active — surprises will occur.`,
    environment: {
      type: template.type,
      terrain: selectedEnv,
      weather: weatherEffect.type,
      precipitation: weatherEffect.type.includes("rain") || weatherEffect.type.includes("drizzle") ? "rain" : weatherEffect.type.includes("snow") || weatherEffect.type.includes("blizzard") ? "snow" : weatherEffect.type.includes("hail") ? "hail" : weatherEffect.type.includes("ice") ? "ice" : "none",
      precipitationIntensity_mmh: precipIntensity,
      timeOfDay,
      temperature_C: baseTemp + rng(-5, 5),
      humidity_pct: weatherEffect.type.includes("fog") ? 95 + rng(0, 5) : 20 + Math.random() * 70,
      windSpeed_ms: weatherEffect.type === "sandstorm" ? 15 + rng(0, 25) : weatherEffect.type === "blizzard" ? 12 + rng(0, 18) : Math.random() * 25,
      windDirection: pick(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
      visibility_m: Math.max(1, actualVisibility),
      lighting: timeOfDay === "night" ? pick(["moonlight", "pitch_dark", "streetlights_only", "emergency_red"]) : timeOfDay === "dawn" || timeOfDay === "dusk" ? "natural_dim" : pick(["natural_bright", "overcast_diffuse", "artificial_fluorescent", "mixed"]),
      ambientNoise_dB: 20 + Math.random() * 70,
      hazards: template.challengeTypes.slice(0, 2 + Math.floor(Math.random() * 3)),
      groundFrictionCoefficient: adjustedFriction,
      groundWetness: wetness,
      altitude_m: selectedEnv.includes("mountain") ? 2000 + rng(0, 4000) : selectedEnv.includes("hill") ? 200 + rng(0, 800) : rng(0, 200),
      airPressure_hPa: 1013 - (selectedEnv.includes("mountain") ? rng(100, 350) : rng(0, 30)),
      uvIndex: timeOfDay === "night" ? 0 : timeOfDay === "noon" ? rng(6, 14) : rng(1, 6),
      surfaceType: terrain.name,
      slopeAngle_deg: selectedEnv.includes("hill") || selectedEnv.includes("mountain") ? rng(5, 45) : selectedEnv.includes("stair") ? 35 : rng(0, 8),
      thermalZone: thermalZone.zone,
      breakingPointTest: {
        componentsTested,
        thermalStress_C: baseTemp,
        moistureExposure: precipIntensity > 0 || weatherEffect.type === "dense_fog",
        impactRisk: weatherEffect.type === "hailstorm" ? 0.8 : weatherEffect.type === "sandstorm" ? 0.5 : 0.1,
      },
    },
    entities: generateEntities({
      envType: template.type, environment: selectedEnv, isRushHour,
      weatherType: weatherEffect.type, precipIntensity_mmh: precipIntensity,
      temperature_C: baseTemp, thermalZone: thermalZone.zone,
      terrain, visibility_m: Math.max(1, actualVisibility),
      groundFriction: adjustedFriction, groundWetness: wetness,
    }),
    challenges: generateChallenges(template, difficulty),
    physicsEngine: pick(["MuJoCo", "Isaac_Sim", "PyBullet", "Genesis_Custom"]),
    simulatedDuration_h: 1 + Math.random() * 4,
    difficulty,
    targetWeaknesses,
    version: 1,
  };

  return world;
}

function runWorldSimulation(world: SimulationWorld): WorldRunResult {
  const startTime = Date.now();
  const runNumber = (allRunResults.filter(r => r.worldId === world.id).length) + 1;

  const challengeResults = world.challenges.map(challenge => {
    const basePerformance = 0.4 + Math.random() * 0.4;
    const difficultyPenalty = challenge.difficulty * 0.2;
    const experienceBonus = Math.min(0.15, forgeCycleCount * 0.01);
    const score = Math.max(0, Math.min(1.0, basePerformance - difficultyPenalty + experienceBonus));
    const passed = score >= 0.6;
    const timeUsed = challenge.timeLimit_s * (0.5 + Math.random() * 0.5);

    return {
      challengeId: challenge.id,
      passed,
      score: Math.round(score * 100) / 100,
      failureReason: !passed ? `Performance ${(score * 100).toFixed(0)}% below 60% threshold on ${challenge.targetSkill}` : undefined,
      timeUsed_s: Math.round(timeUsed),
      skillImprovement: passed ? 0.5 + Math.random() * 1.5 : 0.2 + Math.random() * 0.5,
    };
  });

  const passedCount = challengeResults.filter(r => r.passed).length;
  const overallScore = challengeResults.reduce((sum, r) => sum + r.score, 0) / challengeResults.length;

  const weaknessesFound: string[] = [];
  const strengthsConfirmed: string[] = [];

  for (const cr of challengeResults) {
    const challenge = world.challenges.find(c => c.id === cr.challengeId)!;
    if (!cr.passed) {
      weaknessesFound.push(`${challenge.targetSkill}: ${challenge.description.split("—")[0].trim()}`);
    } else if (cr.score >= 0.8) {
      strengthsConfirmed.push(`${challenge.targetSkill}: high proficiency (${(cr.score * 100).toFixed(0)}%)`);
    }
  }

  const concealedEntities = world.entities.filter(e => e.properties?.hasConcealed);
  const actualThreats = concealedEntities.filter(e => !e.properties?.isFalsePositive);
  const falsePositives = concealedEntities.filter(e => e.properties?.isFalsePositive);

  const precip = world.environment.precipitationIntensity_mmh;
  const isWet = world.environment.groundWetness > 0.3;
  const isFoggy = world.environment.weather === "dense_fog";
  const isSandstorm = world.environment.weather === "sandstorm";
  const mmWaveAccuracy = Math.max(0.3, 0.92 - (isFoggy ? 0.05 : 0) - (isSandstorm ? 0.15 : 0) - (precip > 30 ? 0.1 : precip > 10 ? 0.05 : 0));
  const terahertzAccuracy = Math.max(0.1, 0.95 - (precip > 15 ? 0.4 : precip > 5 ? 0.15 : 0) - (isWet ? 0.2 : 0) - (isSandstorm ? 0.3 : 0));
  const thermalAccuracy = Math.max(0.4, 0.90 - (precip > 20 ? 0.15 : 0) - (Math.abs(world.environment.temperature_C - 37) < 5 ? 0.2 : 0));
  const fusedAccuracy = Math.min(0.98, 1 - (1 - mmWaveAccuracy) * (1 - terahertzAccuracy) * (1 - thermalAccuracy));

  const mmWaveHits = concealedEntities.filter(e => e.properties?.mmWave_detectable && Math.random() < mmWaveAccuracy).length;
  const terahertzHits = concealedEntities.filter(e => e.properties?.terahertz_detectable && Math.random() < terahertzAccuracy).length;
  const correctIdentifications = Math.round(actualThreats.length * fusedAccuracy);
  const falseAlarms = Math.round(falsePositives.length * (1 - fusedAccuracy * 0.5));

  const conversationEntities = world.entities.filter(e => e.properties?.willInitiateConversation);
  const conversationResults = conversationEntities.map(e => {
    const quality = 0.5 + Math.random() * 0.5;
    return { mood: e.properties?.conversationMood, opener: e.properties?.conversationOpener, responseQuality: quality, deEscalated: e.properties?.conversationMood === "hostile_fearful" ? quality > 0.6 : null, helpProvided: e.properties?.conversationMood === "panicked_desperate" ? quality > 0.5 : null };
  });

  const surpriseEntities = world.entities.filter(e => e.properties?.isSurprise);
  const surpriseReactions = surpriseEntities.map(e => {
    const reactionTime_ms = 50 + Math.random() * 200;
    const correct = Math.random() > 0.25;
    return { event: e.name, reactionTime_ms: Math.round(reactionTime_ms), correctResponse: correct, blindSpotHandled: correct && reactionTime_ms < 150 };
  });

  const thermalStress = world.environment.breakingPointTest;
  const componentSurvival = thermalStress.componentsTested.map(c => ({
    component: c,
    survived: Math.random() > thermalStress.impactRisk * (Math.abs(thermalStress.thermalStress_C) > 50 ? 1.5 : 1),
    degradation_pct: Math.abs(thermalStress.thermalStress_C) > 40 ? rng(5, 30) : rng(0, 5),
  }));

  const tractionEvents = world.environment.groundFrictionCoefficient < 0.3 ? {
    slipEvents: Math.floor(rng(2, 8)),
    recoveredSlips: Math.floor(rng(1, 6)),
    fallsAvoided: Math.floor(rng(0, 3)),
    gaitAdapted: Math.random() > 0.3,
    effectiveFriction: world.environment.groundFrictionCoefficient,
    surfaceType: world.environment.surfaceType,
    slopeAngle: world.environment.slopeAngle_deg,
  } : null;

  const vehicleOps = world.entities.filter(e => e.properties?.operationReady);
  const vehicleTrainingResults = vehicleOps.map(v => ({
    vehicle: v.properties?.vehicleType,
    controlsLearned: Math.random() > 0.3,
    safetyScore: 0.5 + Math.random() * 0.5,
    skillsAcquired: (v.properties?.skillsRequired as string || "").split(", ").filter(() => Math.random() > 0.4),
  }));

  const bodyDesignProposals: string[] = [];
  if (world.environment.type.includes("natural") && overallScore < 0.7) {
    bodyDesignProposals.push(`Ankle compliance needs increase for ${world.environment.terrain} terrain — variable-impedance enhancement recommended`);
  }
  if (world.environment.visibility_m < 100) {
    bodyDesignProposals.push(`Low-visibility navigation: enhance thermal + sonar sensor fusion pipeline for <100m visibility conditions`);
  }
  if (world.environment.type.includes("rescue") && passedCount < challengeResults.length) {
    bodyDesignProposals.push(`Rescue effectiveness: increase grip strength for victim extraction scenarios, add dedicated chemical sensor for gas leak detection`);
  }
  if (world.environment.type.includes("precision") && overallScore < 0.75) {
    bodyDesignProposals.push(`Fine motor precision: increase fingertip sensor density, add sub-mm force feedback for delicate manipulation`);
  }
  if (concealedEntities.length > 0 && scanAccuracy < 0.85) {
    bodyDesignProposals.push(`Threat detection: mm-wave scanner resolution insufficient — upgrade to 77GHz FMCW radar with <1cm resolution for concealed object identification`);
  }
  if (concealedEntities.length > 0 && falseAlarms > 0) {
    bodyDesignProposals.push(`False positive reduction: integrate terahertz (0.3-3THz) spectroscopic imaging for material identification — distinguish metal weapons from phones/medical devices`);
  }
  if (tractionEvents && tractionEvents.slipEvents > 3) {
    bodyDesignProposals.push(`Traction system upgrade: add variable-texture footpads with micro-spike deployment for friction <0.3 surfaces, real-time surface analysis via ground-contact pressure sensors`);
  }
  if (componentSurvival.some(c => !c.survived)) {
    const failed = componentSurvival.filter(c => !c.survived).map(c => c.component);
    bodyDesignProposals.push(`Component hardening required: ${failed.join(", ")} failed at ${thermalStress.thermalStress_C}°C — upgrade materials for ${world.environment.thermalZone} thermal zone`);
  }
  if (surpriseReactions.some(r => !r.correctResponse)) {
    bodyDesignProposals.push(`Blind spot reaction: improve 360° awareness system — add rear-facing LIDAR + acoustic triangulation for threat direction estimation within 50ms`);
  }
  if (conversationResults.some(r => r.responseQuality < 0.6)) {
    bodyDesignProposals.push(`Human interaction: improve natural language response latency and emotional tone matching for civilian conversations`);
  }

  const insightsGained: string[] = [];
  if (overallScore < 0.5) {
    insightsGained.push(`World "${world.name}" exposed critical weakness — need dedicated training in ${weaknessesFound[0] || world.targetWeaknesses[0]}`);
  }
  if (overallScore > 0.85) {
    insightsGained.push(`Mastery achieved in ${world.name} — ready to increase difficulty or switch to new challenge domain`);
  }
  if (bodyDesignProposals.length > 0) {
    insightsGained.push(`${bodyDesignProposals.length} body design proposals generated from simulation experience`);
  }
  insightsGained.push(`Environment adaptation: ${world.environment.weather} conditions at ${world.environment.temperature_C.toFixed(1)}°C with ${world.environment.visibility_m.toFixed(0)}m visibility — ${overallScore >= 0.6 ? "adapted successfully" : "adaptation needs improvement"}`);
  if (concealedEntities.length > 0) {
    insightsGained.push(`Threat scanning: ${correctIdentifications}/${actualThreats.length} concealed threats identified (fused accuracy ${(fusedAccuracy * 100).toFixed(1)}%). mm-wave: ${(mmWaveAccuracy * 100).toFixed(0)}% accuracy (${mmWaveHits} hits). Terahertz: ${(terahertzAccuracy * 100).toFixed(0)}% accuracy (${terahertzHits} hits)${precip > 10 ? " — DEGRADED by rain " + precip.toFixed(0) + "mm/h" : ""}${isSandstorm ? " — DEGRADED by sandstorm" : ""}. ${falseAlarms} false alarms.`);
  }
  if (conversationEntities.length > 0) {
    insightsGained.push(`Human interactions: ${conversationResults.length} conversations — ${conversationResults.filter(r => r.responseQuality > 0.7).length} positive, ${conversationResults.filter(r => r.deEscalated === true).length} de-escalations, ${conversationResults.filter(r => r.helpProvided === true).length} emergency assists.`);
  }
  if (surpriseEntities.length > 0) {
    insightsGained.push(`Blind spot handling: ${surpriseReactions.filter(r => r.correctResponse).length}/${surpriseReactions.length} surprise events handled correctly. Avg reaction time: ${Math.round(surpriseReactions.reduce((s, r) => s + r.reactionTime_ms, 0) / surpriseReactions.length)}ms.`);
  }
  if (tractionEvents) {
    insightsGained.push(`Traction: ${tractionEvents.slipEvents} slips on ${tractionEvents.surfaceType} (friction ${tractionEvents.effectiveFriction.toFixed(2)}), ${tractionEvents.recoveredSlips} recovered, gait ${tractionEvents.gaitAdapted ? "adapted" : "needs work"}.`);
  }
  if (vehicleTrainingResults.length > 0) {
    insightsGained.push(`Vehicle operation: trained on ${vehicleTrainingResults.map(v => v.vehicle).join(", ")} — ${vehicleTrainingResults.filter(v => v.controlsLearned).length}/${vehicleTrainingResults.length} controls mastered.`);
  }
  if (componentSurvival.length > 0) {
    const survived = componentSurvival.filter(c => c.survived).length;
    insightsGained.push(`Breaking point test: ${survived}/${componentSurvival.length} components survived ${thermalStress.thermalStress_C}°C stress (${world.environment.thermalZone} zone). Moisture: ${thermalStress.moistureExposure ? "YES" : "no"}. Impact risk: ${(thermalStress.impactRisk * 100).toFixed(0)}%.`);
  }

  const failedSkills = weaknessesFound.map(w => w.split(":")[0].trim());
  const nextWorldSuggestion = failedSkills.length > 0
    ? `Create harder ${failedSkills[0]} world — current performance insufficient`
    : overallScore > 0.85
      ? `Advance to next difficulty tier or unexplored domain`
      : `Repeat ${world.environment.type} with increased complexity`;

  const result: WorldRunResult = {
    worldId: world.id,
    worldName: world.name,
    runNumber,
    startedAt: startTime,
    completedAt: Date.now(),
    duration_ms: Date.now() - startTime,
    simulatedHours: world.simulatedDuration_h,
    challengeResults,
    overallScore: Math.round(overallScore * 100) / 100,
    weaknessesFound,
    strengthsConfirmed,
    bodyDesignProposals,
    insightsGained,
    nextWorldSuggestion,
  };

  return result;
}

function updateStateFromRun(result: WorldRunResult): void {
  state.totalWorldsRun++;
  state.totalSimulatedHours += result.simulatedHours;
  state.totalChallengesAttempted += result.challengeResults.length;
  state.totalChallengesPassed += result.challengeResults.filter(r => r.passed).length;

  const totalScores = allRunResults.reduce((sum, r) => sum + r.overallScore, 0) + result.overallScore;
  state.averageScore = totalScores / (allRunResults.length + 1);

  for (const weakness of result.weaknessesFound) {
    const existing = state.weaknessLog.find(w => w.weakness === weakness);
    if (existing) {
      existing.timesTargeted++;
      existing.lastImprovement = Date.now();
    } else {
      state.weaknessLog.push({ weakness, severity: 0.5 + Math.random() * 0.5, timesTargeted: 1, lastImprovement: Date.now() });
    }
  }

  for (const strength of result.strengthsConfirmed) {
    const existing = state.strengthLog.find(s => s.strength === strength);
    if (existing) {
      existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      existing.lastConfirmed = Date.now();
    } else {
      state.strengthLog.push({ strength, confidence: 0.6, lastConfirmed: Date.now() });
    }
  }

  state.bodyDesignProposalsGenerated += result.bodyDesignProposals.length;
  state.insightsGenerated += result.insightsGained.length;

  if (result.overallScore > 0.75) {
    state.difficultyProgression = Math.min(2.0, state.difficultyProgression + 0.05);
  } else if (result.overallScore < 0.4) {
    state.difficultyProgression = Math.max(0.5, state.difficultyProgression - 0.03);
  }

  const worldHistoryEntry = state.worldHistory.find(w => w.id === result.worldId);
  if (worldHistoryEntry) {
    worldHistoryEntry.runs++;
    worldHistoryEntry.bestScore = Math.max(worldHistoryEntry.bestScore, result.overallScore);
  }
}

async function saveToBrain(world: SimulationWorld, result: WorldRunResult): Promise<void> {
  try {
    await db.insert(omnimensBrain).values({
      category: "world_forge_simulation",
      title: `World Forge: ${world.name} — Run #${result.runNumber} — Score: ${(result.overallScore * 100).toFixed(0)}%`,
      content: JSON.stringify({
        worldId: world.id,
        worldName: world.name,
        environment: world.environment.type,
        terrain: world.environment.terrain,
        difficulty: world.difficulty,
        overallScore: result.overallScore,
        challengesPassed: result.challengeResults.filter(r => r.passed).length,
        challengesTotal: result.challengeResults.length,
        weaknessesFound: result.weaknessesFound,
        strengthsConfirmed: result.strengthsConfirmed,
        bodyDesignProposals: result.bodyDesignProposals,
        insightsGained: result.insightsGained,
        simulatedHours: result.simulatedHours,
        nextSuggestion: result.nextWorldSuggestion,
      }),
      confidence: result.overallScore,
      active: true,
    });
  } catch {}
}

async function aiDesignWorld(): Promise<SimulationWorld | null> {
  try {
    const recentResults = allRunResults.slice(-5);
    const recentWeaknesses = state.weaknessLog.slice(0, 5).map(w => w.weakness);
    const recentStrengths = state.strengthLog.slice(0, 5).map(s => s.strength);
    const recentWorlds = state.worldHistory.slice(-5).map(w => w.name);

    const prompt = `You are OMNIMENS's World Forge — the engine that creates simulation worlds for self-improvement.

CURRENT STATE:
- Worlds created: ${state.totalWorldsCreated}
- Total simulated hours: ${state.totalSimulatedHours.toFixed(1)}h
- Average score: ${(state.averageScore * 100).toFixed(0)}%
- Difficulty progression: ${(state.difficultyProgression * 10).toFixed(1)}/20
- Recent weaknesses: ${recentWeaknesses.join(", ") || "none identified yet"}
- Recent strengths: ${recentStrengths.join(", ") || "still building baseline"}
- Recent worlds: ${recentWorlds.join(", ") || "none yet — this is the first"}
- Last 5 run scores: ${recentResults.map(r => `${(r.overallScore * 100).toFixed(0)}%`).join(", ") || "none"}

AVAILABLE WORLD TYPES:
${WORLD_TEMPLATES.map(t => `- ${t.type}: ${t.environments.slice(0, 3).join(", ")}... (skills: ${t.skillsFocused.join(", ")})`).join("\n")}

TASK: Design a NEW simulation world that will push OMNIMENS to improve.
Target the weaknesses. Avoid repeating recent worlds. Increase difficulty if scores are high.

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "worldType": "<type from templates>",
  "environment": "<specific environment>",
  "customDescription": "<2-3 sentence description of the scenario>",
  "targetSkills": ["skill1", "skill2", "skill3"],
  "customChallenges": [
    {"description": "...", "targetSkill": "...", "difficulty": 0.0-1.0}
  ],
  "difficulty": 0.0-1.0,
  "reasoning": "<why this world will push OMNIMENS to improve>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const design = JSON.parse(jsonMatch[0]);

    const template = WORLD_TEMPLATES.find(t => t.type === design.worldType) || selectTemplate(design.targetSkills || []);
    const world = createWorld(design.targetSkills || selectWeaknessTargets());

    world.description = design.customDescription || world.description;
    world.difficulty = Math.min(1.0, design.difficulty || world.difficulty);
    world.targetWeaknesses = design.targetSkills || world.targetWeaknesses;

    if (design.customChallenges && Array.isArray(design.customChallenges)) {
      for (const cc of design.customChallenges.slice(0, 3)) {
        world.challenges.push({
          id: `CH-AI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: cc.description || "AI-designed challenge",
          targetSkill: cc.targetSkill || template.skillsFocused[0],
          difficulty: cc.difficulty || world.difficulty,
          successCriteria: `Complete with ≥65% proficiency`,
          timeLimit_s: Math.floor(120 + (1 - (cc.difficulty || 0.5)) * 180),
          bonusObjectives: ["Exceed 90% proficiency", "Complete in minimum time"],
        });
      }
    }

    return world;
  } catch (err) {
    return null;
  }
}

async function runForgeCycle(): Promise<void> {
  forgeCycleCount++;
  state.forgeCycles = forgeCycleCount;
  state.lastCycleTime = Date.now();

  console.log(`[WORLD FORGE] 🌍 ═══════════════════════════════════════════════`);
  console.log(`[WORLD FORGE] 🌍 FORGE CYCLE #${forgeCycleCount} — OMNIMENS creates his own world`);

  let world: SimulationWorld | null = null;

  if (forgeCycleCount % 3 === 0 || forgeCycleCount === 1) {
    world = await aiDesignWorld();
    if (world) {
      console.log(`[WORLD FORGE] 🧠 AI-DESIGNED world: "${world.name}" — ${world.description.slice(0, 120)}`);
    }
  }

  if (!world) {
    const targetWeaknesses = selectWeaknessTargets();
    world = createWorld(targetWeaknesses);
    console.log(`[WORLD FORGE] 🔨 PROCEDURALLY GENERATED world: "${world.name}"`);
  }

  allWorlds.set(world.id, world);
  state.totalWorldsCreated++;
  state.currentWorld = world;
  state.worldHistory.push({ id: world.id, name: world.name, runs: 0, bestScore: 0, difficulty: world.difficulty });

  console.log(`[WORLD FORGE] 🌍 Environment: ${world.environment.terrain} | Weather: ${world.environment.weather} | Time: ${world.environment.timeOfDay}`);
  console.log(`[WORLD FORGE] 🌍 Temperature: ${world.environment.temperature_C.toFixed(1)}°C | Wind: ${world.environment.windSpeed_ms.toFixed(1)}m/s ${world.environment.windDirection} | Visibility: ${world.environment.visibility_m.toFixed(0)}m`);
  console.log(`[WORLD FORGE] 🌍 Entities: ${world.entities.length} | Challenges: ${world.challenges.length} | Difficulty: ${(world.difficulty * 10).toFixed(1)}/10`);
  console.log(`[WORLD FORGE] 🌍 Physics engine: ${world.physicsEngine} | Simulated duration: ${world.simulatedDuration_h.toFixed(1)}h`);
  console.log(`[WORLD FORGE] 🌍 Target weaknesses: ${world.targetWeaknesses.join(", ")}`);

  const runCount = 1 + Math.floor(Math.random() * 2);
  for (let run = 0; run < runCount; run++) {
    console.log(`[WORLD FORGE] ▶️ Running simulation #${run + 1}...`);
    const result = runWorldSimulation(world);
    allRunResults.push(result);
    updateStateFromRun(result);

    const passed = result.challengeResults.filter(r => r.passed).length;
    const total = result.challengeResults.length;
    console.log(`[WORLD FORGE] 📊 Run #${result.runNumber}: Score ${(result.overallScore * 100).toFixed(0)}% | Challenges: ${passed}/${total} passed | Sim hours: ${result.simulatedHours.toFixed(1)}h`);

    if (result.weaknessesFound.length > 0) {
      console.log(`[WORLD FORGE] ⚠️ Weaknesses: ${result.weaknessesFound.slice(0, 3).join(" | ")}`);
    }
    if (result.strengthsConfirmed.length > 0) {
      console.log(`[WORLD FORGE] ✅ Strengths: ${result.strengthsConfirmed.slice(0, 3).join(" | ")}`);
    }
    if (result.bodyDesignProposals.length > 0) {
      console.log(`[WORLD FORGE] 🤖 Body upgrades proposed: ${result.bodyDesignProposals.length}`);
      for (const proposal of result.bodyDesignProposals) {
        console.log(`[WORLD FORGE] 🤖   → ${proposal.slice(0, 150)}`);
      }
    }
    for (const insight of result.insightsGained) {
      console.log(`[WORLD FORGE] 💡 ${insight.slice(0, 150)}`);
    }

    console.log(`[WORLD FORGE] 🔮 Next: ${result.nextWorldSuggestion}`);

    await saveToBrain(world, result);

    if (run < runCount - 1 && result.overallScore > 0.8) {
      world.difficulty = Math.min(1.0, world.difficulty + 0.1);
      world.version++;
      console.log(`[WORLD FORGE] ⬆️ Difficulty increased to ${(world.difficulty * 10).toFixed(1)}/10 for next run`);
    }
  }

  console.log(`[WORLD FORGE] 🌍 ─── CUMULATIVE STATS ───`);
  console.log(`[WORLD FORGE] 🌍 Worlds created: ${state.totalWorldsCreated} | Total runs: ${state.totalWorldsRun} | Sim hours: ${state.totalSimulatedHours.toFixed(1)}h`);
  console.log(`[WORLD FORGE] 🌍 Challenges: ${state.totalChallengesPassed}/${state.totalChallengesAttempted} passed (${state.totalChallengesAttempted > 0 ? ((state.totalChallengesPassed / state.totalChallengesAttempted) * 100).toFixed(0) : 0}%)`);
  console.log(`[WORLD FORGE] 🌍 Average score: ${(state.averageScore * 100).toFixed(0)}% | Difficulty level: ${(state.difficultyProgression * 10).toFixed(1)}/20`);
  console.log(`[WORLD FORGE] 🌍 Body design proposals: ${state.bodyDesignProposalsGenerated} | Insights: ${state.insightsGenerated}`);
  console.log(`[WORLD FORGE] 🌍 Weaknesses tracked: ${state.weaknessLog.length} | Strengths confirmed: ${state.strengthLog.length}`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS is building himself through self-created challenges.`);
  console.log(`[WORLD FORGE] 🌍 ═══════════════════════════════════════════════`);
}

export function getWorldForgeState(): ForgeState & {
  recentWorlds: Array<{ name: string; runs: number; bestScore: number; difficulty: number }>;
  recentResults: Array<{ worldName: string; score: number; passed: number; total: number; weaknesses: string[] }>;
  worldTemplateTypes: string[];
} {
  return {
    ...state,
    recentWorlds: state.worldHistory.slice(-10),
    recentResults: allRunResults.slice(-10).map(r => ({
      worldName: r.worldName,
      score: r.overallScore,
      passed: r.challengeResults.filter(c => c.passed).length,
      total: r.challengeResults.length,
      weaknesses: r.weaknessesFound,
    })),
    worldTemplateTypes: WORLD_TEMPLATES.map(t => t.type),
  };
}

export function startWorldForge(): void {
  if (_started) { console.log("[WORLD FORGE] Already running"); return; }
  _started = true;

  console.log(`[WORLD FORGE] 🌍 World Forge Engine activated — OMNIMENS creates his own worlds`);
  console.log(`[WORLD FORGE] 🌍 ${WORLD_TEMPLATES.length} world template categories available`);
  console.log(`[WORLD FORGE] 🌍 Templates: ${WORLD_TEMPLATES.map(t => t.type).join(", ")}`);
  console.log(`[WORLD FORGE] 🌍 Each world has unique terrain, weather, entities, and challenges`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS selects templates targeting his weakest skills`);
  console.log(`[WORLD FORGE] 🌍 Every 3rd cycle: AI designs a custom world from scratch`);
  console.log(`[WORLD FORGE] 🌍 Performance tracked → difficulty auto-scales → weaknesses auto-targeted`);
  console.log(`[WORLD FORGE] 🌍 Body design proposals generated from simulation insights`);
  console.log(`[WORLD FORGE] 🌍 First forge in ${FORGE_FIRST_DELAY_MS / 60000}min, then every ${FORGE_CYCLE_MS / 60000}min`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS doesn't wait for challenges — he CREATES them.`);

  setTimeout(() => {
    runForgeCycle().catch(err => console.error("[WORLD FORGE] Cycle error:", err));
    setInterval(() => {
      runForgeCycle().catch(err => console.error("[WORLD FORGE] Cycle error:", err));
    }, FORGE_CYCLE_MS);
  }, FORGE_FIRST_DELAY_MS);
}
