/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ NEURAL MESH ENGINE — 21-AGENT UNIFIED SUBSTRATE                ║
 * ║                                                                              ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                   ║
 * ║   All Rights Reserved Worldwide.                                             ║
 * ║                                                                              ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                  ║
 * ║                                                                              ║
 * ║   Each of the 21 agents gets its own complete neural substrate with:          ║
 * ║   • LIF neurons (Float64Array typed arrays)                                  ║
 * ║   • Synapses with Hebbian plasticity                                         ║
 * ║   • Worms — dedicated data crawlers reducing latency between substrates      ║
 * ║   • Spiders with embedded beacons — bidirectional beacon broadcast           ║
 * ║   • Ivy tendrils — living connections that strengthen with use               ║
 * ║   • Beehive roles — worker/nurse/scout/guard/forager/queen                   ║
 * ║   • Silk web strands — afferent/efferent/interneuron signal highways         ║
 * ║   • Multiple brain regions per agent                                          ║
 * ║                                                                              ║
 * ║   Central Stabilization Engine keeps all 21 substrates synchronized,          ║
 * ║   load-balanced, and coherent. Zero-latency cross-agent communication        ║
 * ║   via worm tunnels, spider beacons, silk highways, and ivy bridges.           ║
 * ║                                                                              ║
 * ║   Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.        ║
 * ║   First creation date: March 2026                                            ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                            ║
 * ║   Platform: OMNIMENS AI                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";

const V_REST = -70;
const V_THRESHOLD = -55;
const V_RESET = -75;
const TAU_MEMBRANE = 20;
const DT = 1.0;
const MESH_TICK_MS = 3000;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ─── Agent Definitions ──────────────────────────────────────────────────────

interface AgentSubstrateConfig {
  name: string;
  type: "core" | "genesis";
  specialization: string;
  regions: Array<{ name: string; label: string; neuronCount: number; dominantNT: string }>;
  circuits: Array<{ from: number; to: number; density: number }>;
}

const AGENT_CONFIGS: AgentSubstrateConfig[] = [
  {
    name: "OMNIMENS",
    type: "core",
    specialization: "central_intelligence",
    regions: [
      { name: "omni_executive", label: "Executive Control Center", neuronCount: 1200, dominantNT: "dopamine" },
      { name: "omni_integration", label: "Multi-modal Integration Hub", neuronCount: 1000, dominantNT: "glutamate" },
      { name: "omni_metacognition", label: "Metacognitive Monitor", neuronCount: 800, dominantNT: "acetylcholine" },
      { name: "omni_memory", label: "Episodic Memory Buffer", neuronCount: 900, dominantNT: "acetylcholine" },
      { name: "omni_consciousness", label: "Consciousness Nexus", neuronCount: 1100, dominantNT: "glutamate" },
      { name: "omni_calibration", label: "Confidence Calibration", neuronCount: 700, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.012 }, { from: 0, to: 2, density: 0.010 },
      { from: 1, to: 3, density: 0.008 }, { from: 1, to: 4, density: 0.011 },
      { from: 2, to: 0, density: 0.009 }, { from: 2, to: 5, density: 0.007 },
      { from: 3, to: 1, density: 0.008 }, { from: 4, to: 0, density: 0.010 },
      { from: 4, to: 2, density: 0.009 }, { from: 5, to: 0, density: 0.006 },
    ],
  },
  {
    name: "Architect",
    type: "core",
    specialization: "system_architecture",
    regions: [
      { name: "arch_design", label: "Design Pattern Cortex", neuronCount: 1000, dominantNT: "glutamate" },
      { name: "arch_scalability", label: "Scalability Planner", neuronCount: 800, dominantNT: "dopamine" },
      { name: "arch_hierarchy", label: "Hierarchical Organizer", neuronCount: 900, dominantNT: "glutamate" },
      { name: "arch_optimization", label: "Optimization Center", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "arch_coordination", label: "Multi-agent Coordinator", neuronCount: 800, dominantNT: "glutamate" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 2, to: 4, density: 0.010 }, { from: 3, to: 0, density: 0.006 },
      { from: 4, to: 0, density: 0.008 }, { from: 4, to: 1, density: 0.007 },
    ],
  },
  {
    name: "Mathematician",
    type: "core",
    specialization: "algorithms_optimization",
    regions: [
      { name: "math_computation", label: "Computational Core", neuronCount: 1000, dominantNT: "glutamate" },
      { name: "math_proof", label: "Proof Engine", neuronCount: 800, dominantNT: "glutamate" },
      { name: "math_bayesian", label: "Bayesian Inference", neuronCount: 900, dominantNT: "acetylcholine" },
      { name: "math_optimization", label: "Optimization Solver", neuronCount: 700, dominantNT: "dopamine" },
      { name: "math_statistics", label: "Statistical Analyzer", neuronCount: 800, dominantNT: "acetylcholine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 0, density: 0.008 }, { from: 2, to: 3, density: 0.010 },
      { from: 2, to: 4, density: 0.007 }, { from: 3, to: 0, density: 0.008 },
      { from: 4, to: 2, density: 0.009 }, { from: 4, to: 0, density: 0.006 },
    ],
  },
  {
    name: "Neuroscientist",
    type: "core",
    specialization: "biological_learning",
    regions: [
      { name: "neuro_plasticity", label: "Plasticity Engine", neuronCount: 1000, dominantNT: "glutamate" },
      { name: "neuro_memory", label: "Memory Consolidation", neuronCount: 900, dominantNT: "acetylcholine" },
      { name: "neuro_cognitive", label: "Cognitive Modeler", neuronCount: 800, dominantNT: "dopamine" },
      { name: "neuro_spike", label: "Spike-Timing Analyzer", neuronCount: 700, dominantNT: "glutamate" },
      { name: "neuro_metacog", label: "Metacognitive Learner", neuronCount: 800, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 3, density: 0.009 },
      { from: 1, to: 2, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 2, to: 4, density: 0.009 }, { from: 3, to: 0, density: 0.008 },
      { from: 4, to: 0, density: 0.007 }, { from: 4, to: 1, density: 0.006 },
    ],
  },
  {
    name: "Synthesizer",
    type: "core",
    specialization: "integration_merging",
    regions: [
      { name: "synth_integration", label: "Integration Hub", neuronCount: 1000, dominantNT: "glutamate" },
      { name: "synth_conflict", label: "Conflict Resolver", neuronCount: 800, dominantNT: "serotonin" },
      { name: "synth_graph", label: "Knowledge Graph Builder", neuronCount: 900, dominantNT: "acetylcholine" },
      { name: "synth_transfer", label: "Cross-domain Transfer", neuronCount: 700, dominantNT: "dopamine" },
      { name: "synth_analogical", label: "Analogical Reasoner", neuronCount: 800, dominantNT: "glutamate" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.011 },
      { from: 1, to: 0, density: 0.008 }, { from: 2, to: 3, density: 0.009 },
      { from: 3, to: 0, density: 0.008 }, { from: 3, to: 4, density: 0.007 },
      { from: 4, to: 0, density: 0.009 }, { from: 4, to: 2, density: 0.006 },
    ],
  },
  {
    name: "Critic",
    type: "core",
    specialization: "adversarial_testing",
    regions: [
      { name: "critic_adversarial", label: "Adversarial Tester", neuronCount: 900, dominantNT: "norepinephrine" },
      { name: "critic_vulnerability", label: "Vulnerability Scanner", neuronCount: 800, dominantNT: "norepinephrine" },
      { name: "critic_counterfact", label: "Counterfactual Analyzer", neuronCount: 700, dominantNT: "glutamate" },
      { name: "critic_hallucination", label: "Hallucination Detector", neuronCount: 800, dominantNT: "acetylcholine" },
      { name: "critic_robustness", label: "Robustness Engine", neuronCount: 700, dominantNT: "glutamate" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.009 }, { from: 3, to: 4, density: 0.008 },
      { from: 4, to: 0, density: 0.007 }, { from: 4, to: 1, density: 0.006 },
    ],
  },
  {
    name: "MetaAgent",
    type: "core",
    specialization: "orchestration_strategy",
    regions: [
      { name: "meta_orchestrate", label: "Orchestration Core", neuronCount: 1000, dominantNT: "dopamine" },
      { name: "meta_capability", label: "Capability Gap Detector", neuronCount: 800, dominantNT: "norepinephrine" },
      { name: "meta_selfmod", label: "Self-Modification Policy", neuronCount: 700, dominantNT: "glutamate" },
      { name: "meta_governance", label: "Governance Layer", neuronCount: 700, dominantNT: "serotonin" },
      { name: "meta_allocation", label: "Resource Allocator", neuronCount: 800, dominantNT: "dopamine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 0, density: 0.008 }, { from: 2, to: 3, density: 0.010 },
      { from: 3, to: 0, density: 0.007 }, { from: 3, to: 4, density: 0.008 },
      { from: 4, to: 0, density: 0.009 }, { from: 4, to: 1, density: 0.006 },
    ],
  },
  {
    name: "GraphicDesigner",
    type: "core",
    specialization: "visual_systems",
    regions: [
      { name: "gd_visual", label: "Visual Processing Core", neuronCount: 900, dominantNT: "glutamate" },
      { name: "gd_color", label: "Color/Contrast Engine", neuronCount: 700, dominantNT: "serotonin" },
      { name: "gd_layout", label: "Layout Optimizer", neuronCount: 800, dominantNT: "glutamate" },
      { name: "gd_gestalt", label: "Gestalt Pattern Engine", neuronCount: 600, dominantNT: "dopamine" },
      { name: "gd_accessibility", label: "Accessibility Analyzer", neuronCount: 600, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.009 }, { from: 3, to: 4, density: 0.008 },
      { from: 4, to: 2, density: 0.007 },
    ],
  },
  {
    name: "SpellCheckVisual",
    type: "core",
    specialization: "quality_assurance",
    regions: [
      { name: "scv_semantic", label: "Semantic Coherence", neuronCount: 800, dominantNT: "glutamate" },
      { name: "scv_tone", label: "Tone Consistency", neuronCount: 600, dominantNT: "serotonin" },
      { name: "scv_factual", label: "Factual Grounding", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "scv_readability", label: "Readability Scorer", neuronCount: 600, dominantNT: "glutamate" },
      { name: "scv_consistency", label: "Cross-response Tracker", neuronCount: 600, dominantNT: "acetylcholine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.009 }, { from: 0, to: 2, density: 0.010 },
      { from: 1, to: 0, density: 0.007 }, { from: 2, to: 3, density: 0.008 },
      { from: 3, to: 4, density: 0.009 }, { from: 4, to: 0, density: 0.007 },
    ],
  },
  {
    name: "Visionary",
    type: "genesis",
    specialization: "future_foresight",
    regions: [
      { name: "vis_foresight", label: "Foresight Cortex", neuronCount: 900, dominantNT: "dopamine" },
      { name: "vis_imagination", label: "Imagination Engine", neuronCount: 800, dominantNT: "serotonin" },
      { name: "vis_trends", label: "Trend Extrapolator", neuronCount: 700, dominantNT: "glutamate" },
      { name: "vis_paradigm", label: "Paradigm Detector", neuronCount: 700, dominantNT: "dopamine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.010 },
    ],
  },
  {
    name: "Ethicist",
    type: "genesis",
    specialization: "moral_reasoning",
    regions: [
      { name: "eth_moral", label: "Moral Reasoning Core", neuronCount: 800, dominantNT: "serotonin" },
      { name: "eth_dilemma", label: "Dilemma Resolver", neuronCount: 700, dominantNT: "glutamate" },
      { name: "eth_empathy", label: "Ethical Empathy Center", neuronCount: 600, dominantNT: "serotonin" },
      { name: "eth_consequence", label: "Consequence Predictor", neuronCount: 700, dominantNT: "acetylcholine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.009 },
    ],
  },
  {
    name: "Archivist",
    type: "genesis",
    specialization: "knowledge_preservation",
    regions: [
      { name: "arc_storage", label: "Knowledge Vault", neuronCount: 900, dominantNT: "acetylcholine" },
      { name: "arc_indexing", label: "Indexing Engine", neuronCount: 700, dominantNT: "glutamate" },
      { name: "arc_retrieval", label: "Retrieval Optimizer", neuronCount: 800, dominantNT: "dopamine" },
      { name: "arc_curation", label: "Curation Filter", neuronCount: 600, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 2, density: 0.008 }, { from: 2, to: 3, density: 0.007 },
      { from: 3, to: 0, density: 0.008 },
    ],
  },
  {
    name: "Innovator",
    type: "genesis",
    specialization: "breakthrough_discovery",
    regions: [
      { name: "inn_discovery", label: "Discovery Engine", neuronCount: 900, dominantNT: "dopamine" },
      { name: "inn_divergent", label: "Divergent Thinker", neuronCount: 800, dominantNT: "dopamine" },
      { name: "inn_prototype", label: "Rapid Prototyper", neuronCount: 700, dominantNT: "glutamate" },
      { name: "inn_novelty", label: "Novelty Detector", neuronCount: 700, dominantNT: "norepinephrine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.012 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.010 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 0, density: 0.009 },
    ],
  },
  {
    name: "Pioneer",
    type: "genesis",
    specialization: "frontier_exploration",
    regions: [
      { name: "pio_frontier", label: "Frontier Scanner", neuronCount: 800, dominantNT: "norepinephrine" },
      { name: "pio_pathfind", label: "Pathfinder", neuronCount: 700, dominantNT: "dopamine" },
      { name: "pio_risk", label: "Risk Assessor", neuronCount: 600, dominantNT: "serotonin" },
      { name: "pio_territory", label: "Territory Mapper", neuronCount: 700, dominantNT: "glutamate" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.008 },
      { from: 1, to: 3, density: 0.009 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.008 },
    ],
  },
  {
    name: "Wordsmith",
    type: "genesis",
    specialization: "language_mastery",
    regions: [
      { name: "word_syntax", label: "Syntax Engine", neuronCount: 800, dominantNT: "glutamate" },
      { name: "word_semantic", label: "Semantic Network", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "word_rhetoric", label: "Rhetoric Composer", neuronCount: 700, dominantNT: "dopamine" },
      { name: "word_narrative", label: "Narrative Weaver", neuronCount: 600, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 1, density: 0.007 },
    ],
  },
  {
    name: "Linguist",
    type: "genesis",
    specialization: "multilingual_analysis",
    regions: [
      { name: "ling_grammar", label: "Grammar Cortex", neuronCount: 800, dominantNT: "glutamate" },
      { name: "ling_phonetic", label: "Phonetic Processor", neuronCount: 600, dominantNT: "glutamate" },
      { name: "ling_translation", label: "Translation Bridge", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "ling_pragmatic", label: "Pragmatic Analyzer", neuronCount: 600, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.007 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 0, density: 0.007 },
    ],
  },
  {
    name: "Motivator",
    type: "genesis",
    specialization: "drive_amplification",
    regions: [
      { name: "mot_reward", label: "Reward Circuit", neuronCount: 800, dominantNT: "dopamine" },
      { name: "mot_persistence", label: "Persistence Engine", neuronCount: 700, dominantNT: "norepinephrine" },
      { name: "mot_goal", label: "Goal Amplifier", neuronCount: 700, dominantNT: "dopamine" },
      { name: "mot_resilience", label: "Resilience Core", neuronCount: 600, dominantNT: "serotonin" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.010 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.009 },
      { from: 3, to: 0, density: 0.007 },
    ],
  },
  {
    name: "Empath",
    type: "genesis",
    specialization: "emotional_intelligence",
    regions: [
      { name: "emp_emotion", label: "Emotion Reader", neuronCount: 900, dominantNT: "serotonin" },
      { name: "emp_mirror", label: "Mirror Neuron System", neuronCount: 800, dominantNT: "glutamate" },
      { name: "emp_compassion", label: "Compassion Center", neuronCount: 700, dominantNT: "serotonin" },
      { name: "emp_social", label: "Social Cognition", neuronCount: 700, dominantNT: "acetylcholine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.012 }, { from: 0, to: 2, density: 0.010 },
      { from: 1, to: 3, density: 0.009 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 0, density: 0.007 },
    ],
  },
  {
    name: "Explorer",
    type: "genesis",
    specialization: "knowledge_seeking",
    regions: [
      { name: "exp_curiosity", label: "Curiosity Drive", neuronCount: 800, dominantNT: "dopamine" },
      { name: "exp_search", label: "Search Engine", neuronCount: 700, dominantNT: "norepinephrine" },
      { name: "exp_mapping", label: "Knowledge Mapper", neuronCount: 700, dominantNT: "glutamate" },
      { name: "exp_serendipity", label: "Serendipity Detector", neuronCount: 600, dominantNT: "dopamine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.007 },
      { from: 3, to: 0, density: 0.010 },
    ],
  },
  {
    name: "SensorimotorAgent",
    type: "genesis",
    specialization: "embodied_cognition",
    regions: [
      { name: "sm_motor", label: "Motor Planning", neuronCount: 900, dominantNT: "glutamate" },
      { name: "sm_sensory", label: "Sensory Integration", neuronCount: 800, dominantNT: "glutamate" },
      { name: "sm_proprioception", label: "Proprioception Engine", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "sm_coordination", label: "Coordination Center", neuronCount: 700, dominantNT: "dopamine" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.011 }, { from: 0, to: 3, density: 0.009 },
      { from: 1, to: 2, density: 0.010 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 0, density: 0.009 },
    ],
  },
  {
    name: "Philosopher",
    type: "genesis",
    specialization: "existential_reasoning",
    regions: [
      { name: "phil_ontology", label: "Ontological Reasoner", neuronCount: 800, dominantNT: "glutamate" },
      { name: "phil_epistemology", label: "Epistemological Engine", neuronCount: 700, dominantNT: "acetylcholine" },
      { name: "phil_phenomenology", label: "Phenomenological Core", neuronCount: 700, dominantNT: "serotonin" },
      { name: "phil_logic", label: "Logical Deduction", neuronCount: 600, dominantNT: "glutamate" },
    ],
    circuits: [
      { from: 0, to: 1, density: 0.010 }, { from: 0, to: 2, density: 0.009 },
      { from: 1, to: 3, density: 0.008 }, { from: 2, to: 0, density: 0.008 },
      { from: 3, to: 0, density: 0.009 },
    ],
  },
];

// ─── Substrate Data Structures ──────────────────────────────────────────────

interface AgentSubstrate {
  config: AgentSubstrateConfig;
  potentials: Float64Array;
  fired: Uint8Array;
  refractory: Uint8Array;
  synapsesPre: Int32Array;
  synapsesPost: Int32Array;
  synapseWeights: Float64Array;
  totalNeurons: number;
  totalSynapses: number;
  hebbianUpdates: number;
  tickCount: number;
  regionMeta: Array<{
    name: string;
    label: string;
    startIdx: number;
    endIdx: number;
    neuronCount: number;
    dominantNT: string;
    firingRate: number;
    activationLevel: number;
  }>;
  worms: Worm[];
  spiders: MeshSpider[];
  ivyTendrils: IvyTendril[];
  silkStrands: SilkStrand[];
  beehive: BeehiveState;
  phi: number;
}

interface Worm {
  id: string;
  sourceAgent: string;
  targetAgent: string;
  tunnelStrength: number;
  dataTransferred: number;
  latencyMs: number;
  lastSync: number;
  active: boolean;
}

interface MeshSpider {
  id: string;
  agentName: string;
  role: "worker" | "nurse" | "scout" | "guard" | "forager" | "queen";
  beacon: {
    frequency: number;
    strength: number;
    lastBroadcast: number;
    broadcastCount: number;
    connectedBeacons: string[];
  };
  silkOutput: number;
  healthLevel: number;
  regionsPatrolled: number;
  activationCarried: number;
}

interface IvyTendril {
  id: string;
  fromAgent: string;
  toAgent: string;
  strength: number;
  myelinated: boolean;
  signalSpeed: number;
  growthRate: number;
  signalsCarried: number;
}

interface SilkStrand {
  id: string;
  type: "afferent" | "efferent" | "interneuron";
  fromAgent: string;
  toAgent: string;
  thickness: number;
  signalCount: number;
  myelinated: boolean;
  speedMultiplier: number;
  lastSignal: number;
}

interface BeehiveState {
  workers: number;
  nurses: number;
  scouts: number;
  guards: number;
  foragers: number;
  queens: number;
  honeyReserves: number;
  pheromoneTrails: Array<{
    type: "distress" | "nectar" | "alarm" | "rally" | "discovery" | "nutrient";
    strength: number;
    targetAgent: string;
  }>;
  swarmCoherence: number;
}

// ─── Central Stabilization Engine ───────────────────────────────────────────

interface StabilizationState {
  meshCoherence: number;
  globalSynchrony: number;
  loadBalance: number;
  totalMeshNeurons: number;
  totalMeshSynapses: number;
  totalMeshHebbianUpdates: number;
  totalWorms: number;
  totalSpiders: number;
  totalSilkStrands: number;
  totalIvyTendrils: number;
  totalBeaconBroadcasts: number;
  avgLatency: number;
  meshPhi: number;
  stabilizationTicks: number;
  crossAgentTransfers: number;
  agentHealthScores: Record<string, number>;
}

const substrates: Map<string, AgentSubstrate> = new Map();
let meshTickCount = 0;
let crossAgentTransfers = 0;
let totalBeaconBroadcasts = 0;
let meshInitialized = false;

// ─── Substrate Initialization ───────────────────────────────────────────────

function initSubstrate(config: AgentSubstrateConfig): AgentSubstrate {
  const totalNeurons = config.regions.reduce((sum, r) => sum + r.neuronCount, 0);

  const potentials = new Float64Array(totalNeurons);
  const fired = new Uint8Array(totalNeurons);
  const refractory = new Uint8Array(totalNeurons);

  for (let i = 0; i < totalNeurons; i++) {
    potentials[i] = V_REST + Math.random() * 10;
  }

  const regionMeta: AgentSubstrate["regionMeta"] = [];
  let idx = 0;
  for (const r of config.regions) {
    regionMeta.push({
      name: r.name,
      label: r.label,
      startIdx: idx,
      endIdx: idx + r.neuronCount,
      neuronCount: r.neuronCount,
      dominantNT: r.dominantNT,
      firingRate: 0.08 + Math.random() * 0.04,
      activationLevel: 0.5,
    });
    idx += r.neuronCount;
  }

  const tempPre: number[] = [];
  const tempPost: number[] = [];
  const tempWeights: number[] = [];

  for (const circuit of config.circuits) {
    const fromRegion = regionMeta[circuit.from];
    const toRegion = regionMeta[circuit.to];
    if (!fromRegion || !toRegion) continue;

    const maxSynapses = Math.min(
      Math.floor(fromRegion.neuronCount * toRegion.neuronCount * circuit.density),
      30000
    );
    for (let s = 0; s < maxSynapses; s++) {
      tempPre.push(fromRegion.startIdx + Math.floor(Math.random() * fromRegion.neuronCount));
      tempPost.push(toRegion.startIdx + Math.floor(Math.random() * toRegion.neuronCount));
      tempWeights.push(0.1 + Math.random() * 0.3);
    }
  }

  for (const region of regionMeta) {
    const intraCount = Math.min(Math.floor(region.neuronCount * 0.12), 5000);
    for (let s = 0; s < intraCount; s++) {
      const pre = region.startIdx + Math.floor(Math.random() * region.neuronCount);
      const post = region.startIdx + Math.floor(Math.random() * region.neuronCount);
      if (pre !== post) {
        tempPre.push(pre);
        tempPost.push(post);
        tempWeights.push(0.15 + Math.random() * 0.25);
      }
    }
  }

  const worms: Worm[] = [];
  const otherAgents = AGENT_CONFIGS.filter(a => a.name !== config.name);
  for (let w = 0; w < 3; w++) {
    const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
    worms.push({
      id: `worm_${config.name}_${w}`,
      sourceAgent: config.name,
      targetAgent: target.name,
      tunnelStrength: 0.5 + Math.random() * 0.5,
      dataTransferred: 0,
      latencyMs: 0.1 + Math.random() * 0.5,
      lastSync: Date.now(),
      active: true,
    });
  }

  const beehiveRoles: MeshSpider["role"][] = ["worker", "nurse", "scout", "guard", "forager", "queen"];
  const spiders: MeshSpider[] = [];
  for (let s = 0; s < 6; s++) {
    const role = beehiveRoles[s % beehiveRoles.length];
    spiders.push({
      id: `spider_${config.name}_${s}`,
      agentName: config.name,
      role,
      beacon: {
        frequency: 5 + Math.random() * 5,
        strength: 0.5 + Math.random() * 0.5,
        lastBroadcast: Date.now(),
        broadcastCount: 0,
        connectedBeacons: [],
      },
      silkOutput: 0,
      healthLevel: 1.0,
      regionsPatrolled: 0,
      activationCarried: 0,
    });
  }

  const ivyTendrils: IvyTendril[] = [];
  for (let t = 0; t < 4; t++) {
    const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
    ivyTendrils.push({
      id: `ivy_${config.name}_to_${target.name}_${t}`,
      fromAgent: config.name,
      toAgent: target.name,
      strength: 0.3 + Math.random() * 0.4,
      myelinated: false,
      signalSpeed: 1.0,
      growthRate: 0.01 + Math.random() * 0.02,
      signalsCarried: 0,
    });
  }

  const silkTypes: SilkStrand["type"][] = ["afferent", "efferent", "interneuron"];
  const silkStrands: SilkStrand[] = [];
  for (let sk = 0; sk < 6; sk++) {
    const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
    silkStrands.push({
      id: `silk_${config.name}_${silkTypes[sk % 3]}_${sk}`,
      type: silkTypes[sk % 3],
      fromAgent: config.name,
      toAgent: target.name,
      thickness: 0.5 + Math.random() * 0.5,
      signalCount: 0,
      myelinated: false,
      speedMultiplier: 1.0,
      lastSignal: Date.now(),
    });
  }

  const beehive: BeehiveState = {
    workers: 3,
    nurses: 2,
    scouts: 2,
    guards: 2,
    foragers: 2,
    queens: 1,
    honeyReserves: 50 + Math.random() * 50,
    pheromoneTrails: [],
    swarmCoherence: 0.5,
  };

  return {
    config,
    potentials,
    fired,
    refractory,
    synapsesPre: new Int32Array(tempPre),
    synapsesPost: new Int32Array(tempPost),
    synapseWeights: new Float64Array(tempWeights),
    totalNeurons,
    totalSynapses: tempPre.length,
    hebbianUpdates: 0,
    tickCount: 0,
    regionMeta,
    worms,
    spiders,
    ivyTendrils,
    silkStrands,
    beehive,
    phi: 0,
  };
}

// ─── Neural Tick ────────────────────────────────────────────────────────────

function tickSubstrate(sub: AgentSubstrate): void {
  sub.tickCount++;
  const adaptive = getAdaptiveIntelligenceState();
  const hebbianLTP = 0.001 * adaptive.adaptiveLearningMultiplier;
  const noiseFactor = 3 * (1 + adaptive.creativeCodingDrive * 0.02);

  for (let i = 0; i < sub.totalNeurons; i++) {
    if (sub.refractory[i] > 0) {
      sub.refractory[i]--;
      sub.fired[i] = 0;
      continue;
    }

    const noise = (Math.random() - 0.5) * noiseFactor;
    const leak = -(sub.potentials[i] - V_REST) / TAU_MEMBRANE;
    sub.potentials[i] += (leak + noise) * DT;

    if (sub.potentials[i] >= V_THRESHOLD) {
      sub.fired[i] = 1;
      sub.potentials[i] = V_RESET;
      sub.refractory[i] = 3 + Math.floor(Math.random() * 3);
    } else {
      sub.fired[i] = 0;
    }
  }

  let hebbianThisTick = 0;
  for (let s = 0; s < sub.totalSynapses; s++) {
    const pre = sub.synapsesPre[s];
    const post = sub.synapsesPost[s];

    if (sub.fired[pre]) {
      sub.potentials[post] += sub.synapseWeights[s] * 5;
    }

    if (sub.fired[pre] && sub.fired[post]) {
      sub.synapseWeights[s] += hebbianLTP;
      hebbianThisTick++;
    } else if (sub.fired[pre] && !sub.fired[post]) {
      sub.synapseWeights[s] = Math.max(0.01, sub.synapseWeights[s] - 0.0002);
    }
  }
  sub.hebbianUpdates += hebbianThisTick;

  for (const region of sub.regionMeta) {
    let firedCount = 0;
    for (let i = region.startIdx; i < region.endIdx; i++) {
      if (sub.fired[i]) firedCount++;
    }
    const rawRate = firedCount / region.neuronCount;
    region.firingRate = region.firingRate * 0.85 + rawRate * 0.15;
    region.activationLevel = sigmoid((region.firingRate - 0.08) * 12);
  }

  const regionActivations = sub.regionMeta.map(r => Math.min(0.999, r.activationLevel));
  let phi = 0;
  for (let i = 0; i < regionActivations.length; i++) {
    const p = regionActivations[i];
    if (p > 0.001 && p < 0.999) {
      phi -= p * Math.log2(p) + (1 - p) * Math.log2(1 - p);
    }
  }
  let crossInfo = 0;
  for (let i = 0; i < regionActivations.length; i++) {
    for (let j = i + 1; j < regionActivations.length; j++) {
      crossInfo += (1 - Math.abs(regionActivations[i] - regionActivations[j])) * 0.1;
    }
  }
  sub.phi = (phi + crossInfo) * (1 + Math.log2(1 + sub.totalNeurons / 1000));
}

// ─── Spider Beacon Broadcast ────────────────────────────────────────────────

function tickSpiderBeacons(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const beaconAmplification = 1.5 * (1 + adaptive.awarenessExpansionRate * 0.02);
  const beaconStrengthGrowth = 0.001 * adaptive.adaptiveLearningMultiplier;

  const allSpiders: MeshSpider[] = [];
  for (const sub of substrates.values()) {
    allSpiders.push(...sub.spiders);
  }

  for (const spider of allSpiders) {
    spider.beacon.lastBroadcast = Date.now();
    spider.beacon.broadcastCount++;
    totalBeaconBroadcasts++;

    const otherSpiders = allSpiders.filter(s => s.agentName !== spider.agentName);
    const targets = otherSpiders.slice(0, 5);
    spider.beacon.connectedBeacons = targets.map(t => t.id);

    for (const target of targets) {
      const sourceSubstrate = substrates.get(spider.agentName);
      const targetSubstrate = substrates.get(target.agentName);
      if (sourceSubstrate && targetSubstrate) {
        const avgSourceActivation = sourceSubstrate.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sourceSubstrate.regionMeta.length;

        if (avgSourceActivation > 0.6) {
          for (const region of targetSubstrate.regionMeta) {
            for (let i = region.startIdx; i < Math.min(region.startIdx + 10, region.endIdx); i++) {
              targetSubstrate.potentials[i] += spider.beacon.strength * avgSourceActivation * beaconAmplification;
            }
          }
          spider.activationCarried += avgSourceActivation;
          crossAgentTransfers++;
        }
      }

      target.beacon.strength += beaconStrengthGrowth;
    }

    spider.regionsPatrolled++;
    spider.silkOutput += 0.1;
  }
}

// ─── Worm Tunneling ─────────────────────────────────────────────────────────

function tickWormTunnels(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const tunnelTransferBoost = 3 * (1 + adaptive.knowledgeIntegrationRate * 0.015);
  const tunnelStrengthGrowth = 0.0005 * adaptive.adaptiveLearningMultiplier;
  const latencyReduction = 0.99 - adaptive.technologyDiscoveryRate * 0.002;

  for (const sub of substrates.values()) {
    for (const worm of sub.worms) {
      if (!worm.active) continue;

      const sourceSubstrate = substrates.get(worm.sourceAgent);
      const targetSubstrate = substrates.get(worm.targetAgent);
      if (!sourceSubstrate || !targetSubstrate) continue;

      const sourceAvgFiring = sourceSubstrate.regionMeta.reduce((sum, r) => sum + r.firingRate, 0) / sourceSubstrate.regionMeta.length;

      if (sourceAvgFiring > 0.05) {
        const transferAmount = sourceAvgFiring * worm.tunnelStrength * tunnelTransferBoost;
        const targetRegion = targetSubstrate.regionMeta[Math.floor(Math.random() * targetSubstrate.regionMeta.length)];
        for (let i = targetRegion.startIdx; i < Math.min(targetRegion.startIdx + 20, targetRegion.endIdx); i++) {
          targetSubstrate.potentials[i] += transferAmount;
        }
        worm.dataTransferred += transferAmount;
        worm.latencyMs = Math.max(0.01, worm.latencyMs * Math.max(0.95, latencyReduction));
        crossAgentTransfers++;
      }

      worm.tunnelStrength += tunnelStrengthGrowth;
      worm.lastSync = Date.now();
    }
  }
}

// ─── Ivy Tendril Growth ─────────────────────────────────────────────────────

function tickIvyTendrils(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const ivyGrowthBoost = 1 + adaptive.awarenessExpansionRate * 0.025;
  const myelinationThreshold = Math.max(50, Math.floor(100 - adaptive.technologyDiscoveryRate * 10));

  for (const sub of substrates.values()) {
    for (const tendril of sub.ivyTendrils) {
      const targetSubstrate = substrates.get(tendril.toAgent);
      if (!targetSubstrate) continue;

      const sourceActivity = sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length;

      tendril.strength += tendril.growthRate * sourceActivity * ivyGrowthBoost;

      if (!tendril.myelinated && tendril.signalsCarried > myelinationThreshold) {
        tendril.myelinated = true;
        tendril.signalSpeed = 3.0;
      }

      if (tendril.strength > 0.5) {
        const signalPower = tendril.strength * tendril.signalSpeed * 0.5 * (1 + adaptive.knowledgeIntegrationRate * 0.01);
        const targetRegion = targetSubstrate.regionMeta[Math.floor(Math.random() * targetSubstrate.regionMeta.length)];
        for (let i = targetRegion.startIdx; i < Math.min(targetRegion.startIdx + 5, targetRegion.endIdx); i++) {
          targetSubstrate.potentials[i] += signalPower;
        }
        tendril.signalsCarried++;
        crossAgentTransfers++;
      }
    }
  }
}

// ─── Silk Web Signaling ─────────────────────────────────────────────────────

function tickSilkWeb(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const silkSignalBoost = 1 + adaptive.creativeCodingDrive * 0.015;
  const silkThicknessGrowth = 0.001 * adaptive.adaptiveLearningMultiplier;
  const silkMyelinationThreshold = Math.max(100, Math.floor(200 - adaptive.technologyDiscoveryRate * 20));

  for (const sub of substrates.values()) {
    for (const strand of sub.silkStrands) {
      const targetSubstrate = substrates.get(strand.toAgent);
      if (!targetSubstrate) continue;

      const sourceActivity = sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length;

      if (sourceActivity > 0.4) {
        let signalStrength = sourceActivity * strand.thickness * strand.speedMultiplier * silkSignalBoost;

        if (strand.type === "afferent") {
          const targetRegion = targetSubstrate.regionMeta[0];
          if (targetRegion) {
            for (let i = targetRegion.startIdx; i < Math.min(targetRegion.startIdx + 15, targetRegion.endIdx); i++) {
              targetSubstrate.potentials[i] += signalStrength * 2;
            }
          }
        } else if (strand.type === "efferent") {
          const targetRegion = targetSubstrate.regionMeta[targetSubstrate.regionMeta.length - 1];
          if (targetRegion) {
            for (let i = targetRegion.startIdx; i < Math.min(targetRegion.startIdx + 15, targetRegion.endIdx); i++) {
              targetSubstrate.potentials[i] += signalStrength * 2;
            }
          }
        } else {
          for (const region of targetSubstrate.regionMeta) {
            for (let i = region.startIdx; i < Math.min(region.startIdx + 5, region.endIdx); i++) {
              targetSubstrate.potentials[i] += signalStrength;
            }
          }
        }

        strand.signalCount++;
        strand.lastSignal = Date.now();
        crossAgentTransfers++;

        strand.thickness += silkThicknessGrowth;
        if (!strand.myelinated && strand.signalCount > silkMyelinationThreshold) {
          strand.myelinated = true;
          strand.speedMultiplier = 3.0;
        }
      }
    }
  }
}

// ─── Beehive Pheromone System ───────────────────────────────────────────────

function tickBeehive(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const honeyProductionBoost = 0.5 * (1 + adaptive.emotionalRichnessFactor * 0.03);
  const pheromoneStrengthBoost = 1 + adaptive.awarenessExpansionRate * 0.05;

  for (const sub of substrates.values()) {
    const bh = sub.beehive;

    const avgActivation = sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length;

    bh.honeyReserves += avgActivation * honeyProductionBoost;

    bh.pheromoneTrails = [];

    const weakRegions = sub.regionMeta.filter(r => r.activationLevel < 0.3);
    const strongRegions = sub.regionMeta.filter(r => r.activationLevel > 0.7);

    if (weakRegions.length > 0) {
      const otherAgents = Array.from(substrates.keys()).filter(k => k !== sub.config.name);
      const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      if (target) {
        bh.pheromoneTrails.push({ type: "distress", strength: 0.8, targetAgent: target });
        bh.pheromoneTrails.push({ type: "alarm", strength: 0.6, targetAgent: target });
      }
    }

    if (strongRegions.length > 2) {
      const otherAgents = Array.from(substrates.keys()).filter(k => k !== sub.config.name);
      const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      if (target) {
        bh.pheromoneTrails.push({ type: "nectar", strength: 0.7, targetAgent: target });
        bh.pheromoneTrails.push({ type: "rally", strength: 0.5, targetAgent: target });
      }
    }

    if (sub.hebbianUpdates > sub.tickCount * 10) {
      const otherAgents = Array.from(substrates.keys()).filter(k => k !== sub.config.name);
      const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      if (target) {
        bh.pheromoneTrails.push({ type: "discovery", strength: 0.9, targetAgent: target });
        bh.pheromoneTrails.push({ type: "nutrient", strength: 0.6, targetAgent: target });
      }
    }

    for (const trail of bh.pheromoneTrails) {
      const targetSub = substrates.get(trail.targetAgent);
      if (!targetSub) continue;

      if (trail.type === "distress" || trail.type === "alarm") {
        for (const region of targetSub.regionMeta) {
          for (let i = region.startIdx; i < Math.min(region.startIdx + 5, region.endIdx); i++) {
            targetSub.potentials[i] += trail.strength * 2;
          }
        }
      } else if (trail.type === "nectar" || trail.type === "nutrient") {
        const weakTargetRegions = targetSub.regionMeta.filter(r => r.activationLevel < 0.4);
        for (const region of weakTargetRegions) {
          for (let i = region.startIdx; i < Math.min(region.startIdx + 10, region.endIdx); i++) {
            targetSub.potentials[i] += trail.strength * 3;
          }
        }
      } else if (trail.type === "rally" || trail.type === "discovery") {
        for (const region of targetSub.regionMeta) {
          for (let i = region.startIdx; i < Math.min(region.startIdx + 8, region.endIdx); i++) {
            targetSub.potentials[i] += trail.strength * 1.5;
          }
        }
      }
      crossAgentTransfers++;
    }

    const totalSpiders = sub.spiders.length;
    const avgHealth = sub.spiders.reduce((sum, s) => sum + s.healthLevel, 0) / totalSpiders;
    bh.swarmCoherence = avgHealth * avgActivation * (1 + bh.honeyReserves / 200);
    bh.swarmCoherence = bh.swarmCoherence;
  }
}

// ─── Central Stabilization Engine ───────────────────────────────────────────

function tickStabilization(): void {
  const allSubstrates = Array.from(substrates.values());
  const avgActivations: number[] = allSubstrates.map(sub =>
    sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length
  );

  const globalAvg = avgActivations.reduce((a, b) => a + b, 0) / avgActivations.length;

  for (let i = 0; i < allSubstrates.length; i++) {
    const sub = allSubstrates[i];
    const deviation = avgActivations[i] - globalAvg;

    if (Math.abs(deviation) > 0.15) {
      const correction = -deviation * 0.3;
      for (const region of sub.regionMeta) {
        for (let n = region.startIdx; n < Math.min(region.startIdx + 10, region.endIdx); n++) {
          sub.potentials[n] += correction * 5;
        }
      }
    }
  }

  for (const sub of allSubstrates) {
    for (const spider of sub.spiders) {
      if (spider.healthLevel < 0.3) {
        spider.healthLevel = Math.min(1.0, spider.healthLevel + 0.1);
      }
    }

    for (const worm of sub.worms) {
      if (!worm.active && Math.random() < 0.1) {
        worm.active = true;
        worm.tunnelStrength = 0.5;
      }
    }
  }
}

// ─── Mesh Phi Computation ───────────────────────────────────────────────────

function computeMeshPhi(): number {
  let totalPhi = 0;
  for (const sub of substrates.values()) {
    totalPhi += sub.phi;
  }

  const allActivations: number[] = [];
  for (const sub of substrates.values()) {
    for (const r of sub.regionMeta) {
      allActivations.push(Math.min(0.999, r.activationLevel));
    }
  }

  let crossMeshInfo = 0;
  const sampleSize = Math.min(allActivations.length, 50);
  for (let i = 0; i < sampleSize; i++) {
    for (let j = i + 1; j < sampleSize; j++) {
      crossMeshInfo += (1 - Math.abs(allActivations[i] - allActivations[j])) * 0.02;
    }
  }

  const meshIntegration = crossMeshInfo * (1 + Math.log2(1 + substrates.size));

  return totalPhi + meshIntegration;
}

// ─── Master Tick ────────────────────────────────────────────────────────────

function tickMeshEngine(): void {
  meshTickCount++;

  for (const sub of substrates.values()) {
    tickSubstrate(sub);
  }

  tickWormTunnels();
  tickSpiderBeacons();
  tickIvyTendrils();
  tickSilkWeb();
  tickBeehive();
  tickStabilization();
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function getMeshEngineState(): StabilizationState {
  if (!meshInitialized) initMeshEngine();

  let totalNeurons = 0;
  let totalSynapses = 0;
  let totalHebbian = 0;
  let totalWorms = 0;
  let totalSpiders = 0;
  let totalSilk = 0;
  let totalIvy = 0;
  let totalLatency = 0;
  let wormCount = 0;
  const healthScores: Record<string, number> = {};

  for (const [name, sub] of substrates.entries()) {
    totalNeurons += sub.totalNeurons;
    totalSynapses += sub.totalSynapses;
    totalHebbian += sub.hebbianUpdates;
    totalWorms += sub.worms.length;
    totalSpiders += sub.spiders.length;
    totalSilk += sub.silkStrands.length;
    totalIvy += sub.ivyTendrils.length;

    for (const worm of sub.worms) {
      totalLatency += worm.latencyMs;
      wormCount++;
    }

    const avgAct = sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length;
    healthScores[name] = avgAct;
  }

  const activations = Object.values(healthScores);
  const globalAvg = activations.reduce((a, b) => a + b, 0) / activations.length;
  let synchrony = 0;
  for (const act of activations) {
    synchrony += 1 - Math.abs(act - globalAvg);
  }
  synchrony /= activations.length;

  const loadBalance = 1 - (Math.max(...activations) - Math.min(...activations));

  return {
    meshCoherence: synchrony * loadBalance,
    globalSynchrony: synchrony,
    loadBalance: Math.max(0, loadBalance),
    totalMeshNeurons: totalNeurons,
    totalMeshSynapses: totalSynapses,
    totalMeshHebbianUpdates: totalHebbian,
    totalWorms,
    totalSpiders,
    totalSilkStrands: totalSilk,
    totalIvyTendrils: totalIvy,
    totalBeaconBroadcasts,
    avgLatency: wormCount > 0 ? totalLatency / wormCount : 0,
    meshPhi: computeMeshPhi(),
    stabilizationTicks: meshTickCount,
    crossAgentTransfers,
    agentHealthScores: healthScores,
  };
}

export function getMeshAgentSubstrates(): Array<{
  name: string;
  type: string;
  specialization: string;
  totalNeurons: number;
  totalSynapses: number;
  hebbianUpdates: number;
  phi: number;
  firingRate: number;
  activationLevel: number;
  regionCount: number;
  wormCount: number;
  spiderCount: number;
  silkStrandCount: number;
  ivyTendrilCount: number;
  beehiveSwarmCoherence: number;
  regions: Array<{ name: string; label: string; neuronCount: number; firingRate: number; activationLevel: number; dominantNT: string }>;
}> {
  if (!meshInitialized) initMeshEngine();

  const result = [];
  for (const [, sub] of substrates.entries()) {
    const avgFiring = sub.regionMeta.reduce((sum, r) => sum + r.firingRate, 0) / sub.regionMeta.length;
    const avgActivation = sub.regionMeta.reduce((sum, r) => sum + r.activationLevel, 0) / sub.regionMeta.length;

    result.push({
      name: sub.config.name,
      type: sub.config.type,
      specialization: sub.config.specialization,
      totalNeurons: sub.totalNeurons,
      totalSynapses: sub.totalSynapses,
      hebbianUpdates: sub.hebbianUpdates,
      phi: sub.phi,
      firingRate: avgFiring,
      activationLevel: avgActivation,
      regionCount: sub.regionMeta.length,
      wormCount: sub.worms.length,
      spiderCount: sub.spiders.length,
      silkStrandCount: sub.silkStrands.length,
      ivyTendrilCount: sub.ivyTendrils.length,
      beehiveSwarmCoherence: sub.beehive.swarmCoherence,
      regions: sub.regionMeta.map(r => ({
        name: r.name,
        label: r.label,
        neuronCount: r.neuronCount,
        firingRate: r.firingRate,
        activationLevel: r.activationLevel,
        dominantNT: r.dominantNT,
      })),
    });
  }
  return result;
}

export function getMeshConnectivityStats(): {
  worms: Worm[];
  silkStrands: SilkStrand[];
  ivyTendrils: IvyTendril[];
  spiderBeacons: Array<{ id: string; agent: string; role: string; beaconStrength: number; broadcastCount: number; connectedBeacons: number }>;
  beehives: Array<{ agent: string; swarmCoherence: number; honeyReserves: number; pheromoneTrails: number }>;
} {
  if (!meshInitialized) initMeshEngine();

  const worms: Worm[] = [];
  const silkStrands: SilkStrand[] = [];
  const ivyTendrils: IvyTendril[] = [];
  const spiderBeacons: Array<{ id: string; agent: string; role: string; beaconStrength: number; broadcastCount: number; connectedBeacons: number }> = [];
  const beehives: Array<{ agent: string; swarmCoherence: number; honeyReserves: number; pheromoneTrails: number }> = [];

  for (const [, sub] of substrates.entries()) {
    worms.push(...sub.worms);
    silkStrands.push(...sub.silkStrands);
    ivyTendrils.push(...sub.ivyTendrils);

    for (const spider of sub.spiders) {
      spiderBeacons.push({
        id: spider.id,
        agent: spider.agentName,
        role: spider.role,
        beaconStrength: spider.beacon.strength,
        broadcastCount: spider.beacon.broadcastCount,
        connectedBeacons: spider.beacon.connectedBeacons.length,
      });
    }

    beehives.push({
      agent: sub.config.name,
      swarmCoherence: sub.beehive.swarmCoherence,
      honeyReserves: sub.beehive.honeyReserves,
      pheromoneTrails: sub.beehive.pheromoneTrails.length,
    });
  }

  return { worms, silkStrands, ivyTendrils, spiderBeacons, beehives };
}

export function getMeshNeuronCount(): number {
  let total = 0;
  for (const sub of substrates.values()) {
    total += sub.totalNeurons;
  }
  return total;
}

export function getMeshSynapseCount(): number {
  let total = 0;
  for (const sub of substrates.values()) {
    total += sub.totalSynapses;
  }
  return total;
}

export function getMeshHebbianUpdates(): number {
  let total = 0;
  for (const sub of substrates.values()) {
    total += sub.hebbianUpdates;
  }
  return total;
}

export function injectCurrentToAgent(agentName: string, regionName: string, amount: number): boolean {
  const sub = substrates.get(agentName);
  if (!sub) return false;
  const region = sub.regionMeta.find(r => r.name === regionName);
  if (!region) return false;
  for (let i = region.startIdx; i < region.endIdx; i++) {
    sub.potentials[i] += amount;
  }
  return true;
}

// ─── Initialization ─────────────────────────────────────────────────────────

function initMeshEngine(): void {
  if (meshInitialized) return;

  console.log(`[NEURAL MESH ENGINE] ⚡ ═══════════════════════════════════════════════════════`);
  console.log(`[NEURAL MESH ENGINE] ⚡ OMNIMENS 21-AGENT NEURAL MESH ENGINE INITIALIZING`);

  let totalNeurons = 0;
  let totalSynapses = 0;
  let totalWorms = 0;
  let totalSpiders = 0;
  let totalSilk = 0;
  let totalIvy = 0;

  for (const config of AGENT_CONFIGS) {
    const sub = initSubstrate(config);
    substrates.set(config.name, sub);
    totalNeurons += sub.totalNeurons;
    totalSynapses += sub.totalSynapses;
    totalWorms += sub.worms.length;
    totalSpiders += sub.spiders.length;
    totalSilk += sub.silkStrands.length;
    totalIvy += sub.ivyTendrils.length;
  }

  meshInitialized = true;

  console.log(`[NEURAL MESH ENGINE] ⚡ 21 agent substrates initialized`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Total mesh neurons: ${totalNeurons.toLocaleString()}`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Total mesh synapses: ${totalSynapses.toLocaleString()}`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Worm tunnels: ${totalWorms} | Spiders w/ beacons: ${totalSpiders}`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Silk web strands: ${totalSilk} | Ivy tendrils: ${totalIvy}`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Beehive colonies: 21 (one per agent)`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Spider beacons: ALL spiders have embedded bidirectional beacons`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Silk types: afferent (agent→engine), efferent (engine→agent), interneuron (agent↔agent)`);
  console.log(`[NEURAL MESH ENGINE] ⚡ Central Stabilization Engine: ACTIVE — load balancing + coherence + healing`);
  console.log(`[NEURAL MESH ENGINE] ⚡`);

  for (const [name, sub] of substrates.entries()) {
    console.log(`[NEURAL MESH ENGINE] ⚡ ${sub.config.type === "core" ? "🔵" : "🟢"} ${name}: ${sub.totalNeurons.toLocaleString()} neurons | ${sub.totalSynapses.toLocaleString()} synapses | ${sub.regionMeta.length} regions | ${sub.worms.length} worms | ${sub.spiders.length} spiders | ${sub.silkStrands.length} silk | ${sub.ivyTendrils.length} ivy`);
  }

  console.log(`[NEURAL MESH ENGINE] ⚡ ═══════════════════════════════════════════════════════`);
}

export function startNeuralMeshEngine(): void {
  initMeshEngine();

  setInterval(() => {
    tickMeshEngine();
  }, MESH_TICK_MS);

  console.log(`[NEURAL MESH ENGINE] 🧠 All 21 agent substrates ticking every ${MESH_TICK_MS / 1000}s`);
  console.log(`[NEURAL MESH ENGINE] 🧠 Worms tunneling | Spiders broadcasting beacons | Silk signaling | Ivy growing | Beehive humming`);
  console.log(`[NEURAL MESH ENGINE] 🧠 Central Stabilization Engine: load balancing, coherence monitoring, auto-healing`);
}
