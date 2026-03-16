/**
 * OMNIMENS Physical Therapy AI Engine
 *
 * Bridges all identified gaps in current AI physical therapy:
 * - Low adherence (35%) → gamification, streaks, motivational coaching
 * - Missing psychosocial screening → PHQ-2, TSK-11, PCS integration
 * - No red flag triage → immediate referral alerts for emergency signs
 * - Static protocols → adaptive phase-based loading progression
 * - No validated outcome tracking → PROMIS-PF, DASH, KOOS, LEFS, NDI, PSFS
 * - Zero integrative approach → sleep, nutrition, stress, hydration coaching
 * - Pain assessment bias → evidence-based tools validated across populations
 * - Supine position gaps → text-based AI guidance bridges CV limitations
 * - No pain science education → graded exposure, central sensitization literacy
 *
 * Architectures: BeneKinetic, SWORD Health, Exer Health, Kinetisense,
 *                SPOT REHAB, DeepMind Health, AWS Health Lake
 */

import { db } from "@workspace/db";
import {
  omnimensPhysioAssessments,
  omnimensPhysioPrograms,
  omnimensPhysioSessions,
  omnimensPhysioOutcomes,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExercisePrescription {
  id: string;
  name: string;
  category: "mobility" | "stretching" | "strengthening" | "neuromuscular" | "aerobic" | "education";
  sets: number;
  reps?: string;          // "10-15" or "hold 30s"
  hold?: number;          // seconds
  rest: number;           // seconds between sets
  frequency: string;      // "daily" | "3x/week" | "2x/day"
  equipment: string[];    // "none" | "resistance band" | "foam roller" | etc.
  position: string;       // "supine" | "standing" | "seated" | "prone" | "sidelying"
  instructions: string;
  cues: string[];         // "keep core engaged", "breathe out on effort"
  painRule: string;       // "keep pain 0-3/10" | "stop if pain >4/10"
  progressionCriteria: string;
  regression?: string;    // easier modification
  progression?: string;   // harder version
  evidenceBase?: string;  // clinical guideline or study
  videoSearchTerm?: string; // for finding demo videos
}

export interface RedFlagScreen {
  flagsPresent: boolean;
  flags: string[];
  urgency: "immediate_ER" | "urgent_MD" | "refer_out" | "monitor" | "none";
  recommendation: string;
}

export interface PsychosocialProfile {
  phq2Score: number;       // 0-6 (≥3 = positive depression screen)
  tskScore: number;        // 17-68 (>37 = high kinesiophobia)
  pcsScore: number;        // 0-52 (>30 = high catastrophizing)
  depressionRisk: "low" | "moderate" | "high";
  kinesiophobiaLevel: "low" | "moderate" | "high";
  catastrophizingLevel: "low" | "moderate" | "high";
  recommendations: string[];
}

export interface OutcomeMeasure {
  measure: string;
  score: number;
  normalizedScore: number;
  interpretation: string;
  mdc: number;              // Minimum Detectable Change
  mcid: number;             // Minimum Clinically Important Difference
  mcidReached?: boolean;
}

// ── Red Flag Screening ─────────────────────────────────────────────────────────

const RED_FLAG_KEYWORDS = {
  immediate_ER: [
    "bilateral leg numbness", "saddle anesthesia", "loss of bladder", "loss of bowel",
    "bowel incontinence", "bladder incontinence", "cauda equina", "sudden severe headache",
    "worst headache of my life", "thunderclap", "chest pain with exercise", "difficulty breathing",
    "cannot walk", "complete paralysis", "aneurysm", "acute aortic"
  ],
  urgent_MD: [
    "unexplained weight loss", "night sweats", "fever", "cancer history", "cancer",
    "tumor", "night pain that wakes", "constant pain at rest", "unrelenting pain",
    "spinal cord", "myelopathy", "numbness both legs", "progressive weakness",
    "systemically unwell", "significant trauma", "fall from height", "high velocity",
    "steroid use", "osteoporosis fracture", "pathological fracture"
  ],
  refer_out: [
    "DVT", "deep vein thrombosis", "calf swelling redness", "pitting edema",
    "severe infection", "skin breakdown", "wound", "open wound",
    "complex regional pain", "CRPS", "reflex sympathetic"
  ],
};

export function screenRedFlags(description: string): RedFlagScreen {
  const lower = description.toLowerCase();
  const flags: string[] = [];
  let urgency: RedFlagScreen["urgency"] = "none";

  for (const flag of RED_FLAG_KEYWORDS.immediate_ER) {
    if (lower.includes(flag)) {
      flags.push(`🚨 IMMEDIATE: ${flag}`);
      urgency = "immediate_ER";
    }
  }

  if (urgency !== "immediate_ER") {
    for (const flag of RED_FLAG_KEYWORDS.urgent_MD) {
      if (lower.includes(flag)) {
        flags.push(`⚠️ URGENT: ${flag}`);
        if (urgency !== "urgent_MD") urgency = "urgent_MD";
      }
    }
  }

  if (urgency === "none") {
    for (const flag of RED_FLAG_KEYWORDS.refer_out) {
      if (lower.includes(flag)) {
        flags.push(`⚕️ REFER: ${flag}`);
        urgency = "refer_out";
      }
    }
  }

  const recommendations: Record<RedFlagScreen["urgency"], string> = {
    immediate_ER: "⚠️ STOP — Based on your symptoms, please go to the emergency room or call 911 immediately. Do not wait. These symptoms require urgent medical evaluation.",
    urgent_MD: "This symptom pattern requires evaluation by a physician before starting physical therapy. Please contact your doctor today or visit an urgent care clinic.",
    refer_out: "These symptoms suggest you may need specialist evaluation. I recommend seeing your doctor before continuing rehabilitation exercises.",
    monitor: "Some concerning symptoms noted. Please monitor closely and contact your doctor if they worsen.",
    none: "",
  };

  return {
    flagsPresent: flags.length > 0,
    flags,
    urgency,
    recommendation: recommendations[urgency],
  };
}

// ── Psychosocial Scoring ───────────────────────────────────────────────────────

export function interpretPsychosocialScores(
  phq2: number,
  tsk: number,
  pcs: number
): PsychosocialProfile {
  const depressionRisk = phq2 >= 3 ? "high" : phq2 >= 1 ? "moderate" : "low";
  const kinesiophobiaLevel = tsk > 37 ? "high" : tsk > 28 ? "moderate" : "low";
  const catastrophizingLevel = pcs > 30 ? "high" : pcs > 20 ? "moderate" : "low";

  const recommendations: string[] = [];

  if (depressionRisk === "high") {
    recommendations.push("PHQ-2 positive — consider referral to mental health support alongside physical therapy");
    recommendations.push("Use positive reinforcement and celebrate small wins in every session");
    recommendations.push("Focus on activity engagement over pain elimination");
  }

  if (kinesiophobiaLevel === "high") {
    recommendations.push("High fear of movement detected (kinesiophobia) — prioritize pain science education");
    recommendations.push("Use graded exposure: start very low intensity, build gradually");
    recommendations.push("Explicitly reassure patient that hurt ≠ harm");
    recommendations.push("Use TSK-11 language: 'Your spine is strong, movement is medicine'");
  }

  if (catastrophizingLevel === "high") {
    recommendations.push("High pain catastrophizing — cognitive restructuring strategies recommended");
    recommendations.push("Help patient identify thought patterns: rumination, magnification, helplessness");
    recommendations.push("Set realistic, function-based goals (not pain elimination)");
  }

  if (kinesiophobiaLevel === "low" && catastrophizingLevel === "low") {
    recommendations.push("Good psychosocial profile — standard progression is appropriate");
  }

  return {
    phq2Score: phq2,
    tskScore: tsk,
    pcsScore: pcs,
    depressionRisk,
    kinesiophobiaLevel,
    catastrophizingLevel,
    recommendations,
  };
}

// ── Outcome Measure Database ──────────────────────────────────────────────────

export const OUTCOME_MEASURES = {
  PROMIS_PF: {
    name: "PROMIS Physical Function",
    maxScore: 100,
    mdc: 4.0,
    mcid: 2.5,
    interpretation: (score: number) => {
      if (score >= 70) return "Normal physical function";
      if (score >= 50) return "Mildly limited";
      if (score >= 35) return "Moderately limited";
      return "Severely limited";
    },
  },
  DASH: {
    name: "DASH (Disabilities of Arm, Shoulder & Hand)",
    maxScore: 100,
    mdc: 10.8,
    mcid: 10.2,
    interpretation: (score: number) => {
      if (score <= 10) return "Minimal disability";
      if (score <= 30) return "Mild disability";
      if (score <= 50) return "Moderate disability";
      return "Severe disability";
    },
  },
  KOOS: {
    name: "KOOS (Knee Injury & Osteoarthritis Outcome Score)",
    maxScore: 100,
    mdc: 10.0,
    mcid: 8.0,
    interpretation: (score: number) => {
      if (score >= 85) return "Near-normal knee function";
      if (score >= 65) return "Mildly impaired";
      if (score >= 40) return "Moderately impaired";
      return "Severely impaired";
    },
  },
  LEFS: {
    name: "Lower Extremity Functional Scale",
    maxScore: 80,
    mdc: 9.0,
    mcid: 9.0,
    interpretation: (score: number) => {
      const pct = (score / 80) * 100;
      if (pct >= 87) return "Near-normal function";
      if (pct >= 63) return "Mild limitation";
      if (pct >= 44) return "Moderate limitation";
      return "Severe limitation";
    },
  },
  NDI: {
    name: "Neck Disability Index",
    maxScore: 50,
    mdc: 7.0,
    mcid: 5.0,
    interpretation: (score: number) => {
      if (score <= 4) return "No disability";
      if (score <= 14) return "Mild disability";
      if (score <= 24) return "Moderate disability";
      if (score <= 34) return "Severe disability";
      return "Complete disability";
    },
  },
  PSFS: {
    name: "Patient-Specific Functional Scale",
    maxScore: 10,
    mdc: 2.0,
    mcid: 2.0,
    interpretation: (score: number) => {
      if (score >= 8) return "Excellent function";
      if (score >= 5) return "Moderate function";
      if (score >= 2) return "Severely limited";
      return "Minimal function";
    },
  },
  NPRS: {
    name: "Numeric Pain Rating Scale",
    maxScore: 10,
    mdc: 1.74,
    mcid: 2.0,
    interpretation: (score: number) => {
      if (score === 0) return "No pain";
      if (score <= 3) return "Mild pain";
      if (score <= 6) return "Moderate pain";
      return "Severe pain";
    },
  },
  GROC: {
    name: "Global Rating of Change",
    maxScore: 7,
    mdc: 1.0,
    mcid: 2.0,
    interpretation: (score: number) => {
      if (score >= 5) return "Marked improvement";
      if (score >= 3) return "Somewhat improved";
      if (score >= -2) return "About the same";
      return "Worsened";
    },
  },
};

// ── Evidence-Based Exercise Database ─────────────────────────────────────────

export const EXERCISE_LIBRARY: Record<string, ExercisePrescription[]> = {
  lower_back: [
    {
      id: "lb_cat_cow",
      name: "Cat-Cow Stretch",
      category: "mobility",
      sets: 2,
      reps: "10-15",
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "quadruped",
      instructions: "Start on hands and knees. Arch your back up (cat), then let it sag down (cow). Move slowly and breathe.",
      cues: ["Move with your breath", "Keep arms straight", "Go only as far as comfortable"],
      painRule: "Stop if pain >3/10",
      progressionCriteria: "Able to complete full range without pain for 3 sessions",
      progression: "Add pelvic rotation",
      evidenceBase: "Supported by multiple guidelines for non-specific LBP",
      videoSearchTerm: "cat cow stretch physical therapy",
    },
    {
      id: "lb_knee_to_chest",
      name: "Single Knee to Chest",
      category: "stretching",
      sets: 2,
      reps: "10",
      hold: 30,
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "supine",
      instructions: "Lying on your back, bring one knee to your chest and hold. Keep the other leg straight or bent.",
      cues: ["Keep lower back relaxed on the floor", "Breathe normally", "Feel gentle stretch in the glute/hip"],
      painRule: "Keep discomfort 0-3/10 — should be a gentle pull only",
      progressionCriteria: "3 pain-free sessions",
      progression: "Double knee to chest",
      evidenceBase: "Standard Phase 1 LBP protocol, Spinal Physio Guidelines",
    },
    {
      id: "lb_dead_bug",
      name: "Dead Bug",
      category: "neuromuscular",
      sets: 3,
      reps: "8 each side",
      rest: 45,
      frequency: "3x/week",
      equipment: [],
      position: "supine",
      instructions: "Lying on your back, arms toward the ceiling, knees bent 90°. Slowly lower opposite arm and leg while pressing lower back into the floor.",
      cues: ["Press lower back FLAT into floor throughout", "Exhale as you extend", "Do NOT let your back arch"],
      painRule: "Stop if pain >3/10",
      progressionCriteria: "Perfect form for 3 consecutive sessions",
      regression: "Arm only or leg only",
      progression: "Add resistance band",
      evidenceBase: "McGill Core Stability Protocol — highest-evidence core exercise for LBP",
    },
    {
      id: "lb_bridge",
      name: "Glute Bridge",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 45,
      frequency: "3x/week",
      equipment: [],
      position: "supine",
      instructions: "Lying on back, knees bent, feet flat. Squeeze glutes and lift hips until body forms a straight line from shoulders to knees. Hold 2 seconds at top.",
      cues: ["Squeeze the glutes hard at the top", "Don't hyperextend your lower back", "Keep feet hip-width apart"],
      painRule: "Pain must stay ≤3/10",
      progressionCriteria: "3 sets of 15 with good form, no pain",
      regression: "Partial range bridge",
      progression: "Single-leg bridge, then weighted bridge",
      evidenceBase: "Clam-shell + bridge combo: highest-evidence glute activation for LBP",
    },
    {
      id: "lb_bird_dog",
      name: "Bird Dog",
      category: "neuromuscular",
      sets: 3,
      reps: "10 each side",
      rest: 45,
      frequency: "3x/week",
      equipment: [],
      position: "quadruped",
      instructions: "On hands and knees. Slowly extend opposite arm and leg simultaneously while keeping spine neutral and pelvis level.",
      cues: ["Don't let your hip hike", "Keep your core braced", "Move like a table staying perfectly flat"],
      painRule: "Stop if pain >3/10",
      progressionCriteria: "Controlled, level pelvis for all reps",
      regression: "Arm only or leg only",
      progression: "Add resistance band to ankle",
      evidenceBase: "McGill 'Big Three' core exercises — gold standard for LBP stabilization",
    },
    {
      id: "lb_walking",
      name: "Graded Walking Program",
      category: "aerobic",
      sets: 1,
      reps: "15-20 min",
      rest: 0,
      frequency: "daily",
      equipment: [],
      position: "standing",
      instructions: "Walk at a comfortable pace for 15-20 minutes. Increase by 5 minutes every 3 days as tolerated. Focus on upright posture.",
      cues: ["Upright posture — don't lean forward", "Swing arms naturally", "Stop if pain exceeds 4/10"],
      painRule: "Pain must stay <4/10 throughout",
      progressionCriteria: "Able to walk 30+ min without pain increase",
      progression: "Incline walking, light hiking",
      evidenceBase: "Walking is highest-evidence aerobic exercise for non-specific LBP — Hayden et al.",
    },
  ],

  knee: [
    {
      id: "knee_quad_set",
      name: "Quad Set (Isometric)",
      category: "strengthening",
      sets: 3,
      reps: "15",
      hold: 5,
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "supine",
      instructions: "Lying on back, leg straight. Tighten the quad by pushing the back of the knee into the floor. Hold 5 seconds.",
      cues: ["Feel the quad muscle tighten", "Push knee DOWN into surface", "Keep breathing"],
      painRule: "Should be pain-free",
      progressionCriteria: "Complete without pain for 3 sessions",
      progression: "Straight Leg Raise",
      evidenceBase: "Phase 1 post-operative and patellofemoral protocol",
    },
    {
      id: "knee_slr",
      name: "Straight Leg Raise",
      category: "strengthening",
      sets: 3,
      reps: "12-15",
      rest: 45,
      frequency: "daily",
      equipment: [],
      position: "supine",
      instructions: "Lying on back. Bend one knee, keep the other straight. Tighten the quad and lift the straight leg to ~45°. Lower slowly.",
      cues: ["Tighten quad BEFORE lifting", "Keep toes pulled back", "Lower slowly — 3 seconds down"],
      painRule: "Pain ≤2/10",
      progressionCriteria: "3 sets of 15 without pain",
      progression: "Ankle weights (0.5-1kg)",
      evidenceBase: "Standard post-ACL, post-arthroplasty Phase 1",
    },
    {
      id: "knee_terminal_extension",
      name: "Terminal Knee Extension (TKE)",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 45,
      frequency: "3x/week",
      equipment: ["resistance band"],
      position: "standing",
      instructions: "Loop a band behind your knee. Stand facing anchor. Bend knee slightly, then fully straighten against band resistance.",
      cues: ["Squeeze quad at full extension", "Keep hip level", "Control the return"],
      painRule: "Pain <3/10",
      progressionCriteria: "Able to complete with good form 3x",
      progression: "Increase band resistance",
      evidenceBase: "PFPS and post-ACL protocol staple",
    },
    {
      id: "knee_vmostep",
      name: "Step-Down (Eccentric VMO)",
      category: "strengthening",
      sets: 3,
      reps: "10 each",
      rest: 60,
      frequency: "3x/week",
      equipment: ["step"],
      position: "standing",
      instructions: "Stand on a step. Slowly lower the opposite foot toward the floor (3-4 seconds), barely touching, then return. Control the descent.",
      cues: ["Knee tracks over 2nd toe", "Don't let knee cave in", "The LOWERING phase is the exercise"],
      painRule: "Pain ≤4/10 acceptable for PFPS (not for acute injury)",
      progressionCriteria: "Perfect alignment through descent for 3 sessions",
      regression: "Mini squat",
      progression: "Higher step, single-leg squat",
      evidenceBase: "Highest evidence for VMO strengthening in PFPS — Heintjes et al.",
    },
    {
      id: "knee_hamstring_curl",
      name: "Prone Hamstring Curl",
      category: "strengthening",
      sets: 3,
      reps: "12-15",
      rest: 45,
      frequency: "3x/week",
      equipment: [],
      position: "prone",
      instructions: "Lying on your stomach. Slowly curl your heel toward your buttock and slowly lower.",
      cues: ["Don't raise your hip", "Control the lowering phase", "4 seconds up, 4 seconds down"],
      painRule: "Pain ≤3/10",
      progressionCriteria: "3 sets of 15 with full range",
      progression: "Ankle weights",
      evidenceBase: "Essential for ACL reconstruction and hamstring tear rehab",
    },
  ],

  shoulder: [
    {
      id: "sh_pendulum",
      name: "Pendulum Exercise",
      category: "mobility",
      sets: 2,
      reps: "30 seconds each direction",
      rest: 30,
      frequency: "2x/day",
      equipment: [],
      position: "standing",
      instructions: "Lean forward with hand resting on a table. Let the affected arm hang freely. Gently swing it in circles using body momentum — let gravity do the work.",
      cues: ["Keep the arm completely relaxed", "Use your body to create motion, not the arm", "Circles should be small, about dinner plate size"],
      painRule: "Should feel like relief, not pain",
      progressionCriteria: "Full circles without muscle guarding",
      progression: "AROM circles",
      evidenceBase: "Phase 1 post-surgical shoulder — Codman exercise protocol",
    },
    {
      id: "sh_doorway_stretch",
      name: "Doorway Pec Stretch",
      category: "stretching",
      sets: 3,
      hold: 30,
      rest: 30,
      reps: "3 holds",
      frequency: "2x/day",
      equipment: [],
      position: "standing",
      instructions: "Stand in a doorway, arm at 90° on the frame. Step forward until you feel a stretch across your chest.",
      cues: ["Keep arm at shoulder height", "Feel stretch in chest — not shoulder pain", "Breathe and relax into stretch"],
      painRule: "Stretch discomfort ≤3/10 — never sharp pain",
      progressionCriteria: "Improved posture, reduced rounding",
      progression: "Both arms simultaneously",
      evidenceBase: "First-line treatment for forward head posture and rotator cuff impingement",
    },
    {
      id: "sh_side_lying_er",
      name: "Side-Lying External Rotation",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 45,
      frequency: "3x/week",
      equipment: ["light dumbbell"],
      position: "sidelying",
      instructions: "Lie on your non-affected side. Elbow bent 90°, arm resting on your side. Rotate the forearm up toward the ceiling. Lower slowly.",
      cues: ["Keep elbow pinned to side", "Rotate slowly — 3 seconds up, 3 seconds down", "Don't shrug the shoulder"],
      painRule: "Pain ≤3/10",
      progressionCriteria: "3 sets of 15 with 1-2kg without pain",
      regression: "No weight",
      progression: "Seated cable ER, standing band ER",
      evidenceBase: "Infraspinatus/teres minor isolation — highest evidence for rotator cuff rehab",
    },
    {
      id: "sh_band_row",
      name: "Resistance Band Row",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 45,
      frequency: "3x/week",
      equipment: ["resistance band"],
      position: "standing",
      instructions: "Anchor band at chest height. Pull elbows back keeping them close to body. Squeeze shoulder blades together at the back position.",
      cues: ["Lead with elbows, not hands", "Squeeze shoulder blades at the end", "Keep wrists straight"],
      painRule: "Pain ≤3/10",
      progressionCriteria: "3 sets of 15 with control",
      progression: "Increase band resistance, cable row",
      evidenceBase: "Scapular stabilizer activation — standard rotator cuff impingement protocol",
    },
    {
      id: "sh_ys_ts_ws",
      name: "Y-T-W Exercise (Scapular)",
      category: "strengthening",
      sets: 3,
      reps: "10 each shape",
      rest: 60,
      frequency: "3x/week",
      equipment: [],
      position: "prone",
      instructions: "Lying face down, arms by sides. Lift arms to form a Y shape (above head), then T (out to sides), then W (bent at elbows). Hold each 2 seconds.",
      cues: ["Lift from shoulder blade, not just the arm", "Keep chin tucked — no neck strain", "These should be small movements"],
      painRule: "Pain <3/10",
      progressionCriteria: "All 3 positions with good scapular control",
      progression: "Light weights (0.5-1kg)",
      evidenceBase: "Highest EMG activation for lower/middle trapezius — Cools et al.",
    },
  ],

  cervical: [
    {
      id: "cx_chin_tuck",
      name: "Chin Tuck (Craniocervical Flexion)",
      category: "neuromuscular",
      sets: 3,
      reps: "10",
      hold: 10,
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "supine",
      instructions: "Lying on back. Gently tuck your chin toward your chest as if making a double chin. Hold 10 seconds. Release.",
      cues: ["Think 'make a double chin'", "Feel the stretch at the base of skull", "Don't push hard — gentle tension"],
      painRule: "Should feel a gentle pull — no sharp pain",
      progressionCriteria: "3 sets of 10 without pain for 3 sessions",
      progression: "Seated chin tuck, add light resistance with finger",
      evidenceBase: "Deep cervical flexor strengthening — Jull et al. gold-standard trial",
    },
    {
      id: "cx_rotation",
      name: "Cervical Rotation ROM",
      category: "mobility",
      sets: 2,
      reps: "10 each side",
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "seated",
      instructions: "Sit upright. Slowly turn your head to look over one shoulder. Return to center. Repeat other side. Go only as far as comfortable.",
      cues: ["Keep chin level — don't tilt", "Move through pain-free range only", "Move slowly and smoothly"],
      painRule: "Pain ≤3/10",
      progressionCriteria: "Improved range with reduced pain",
      progression: "Add gentle overpressure with hand",
      evidenceBase: "Standard cervical mobility protocol — WAD and non-specific neck pain guidelines",
    },
  ],

  hip: [
    {
      id: "hip_clam",
      name: "Clamshell",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 45,
      frequency: "3x/week",
      equipment: [],
      position: "sidelying",
      instructions: "Lie on your side, hips bent to ~45°, knees bent. Keeping feet together, lift the top knee like a clamshell opening. Lower slowly.",
      cues: ["Don't let your pelvis roll back", "Keep feet together throughout", "Squeeze glute med at the top"],
      painRule: "Pain ≤2/10",
      progressionCriteria: "3 sets of 15 without pelvic rotation",
      progression: "Add resistance band above knees",
      evidenceBase: "Glute med activation — highest evidence for hip OA, PFPS, ITB syndrome, running injuries",
    },
    {
      id: "hip_hip_flexor_stretch",
      name: "Hip Flexor Stretch (Kneeling Lunge)",
      category: "stretching",
      sets: 3,
      hold: 30,
      reps: "3 holds each side",
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "kneeling",
      instructions: "Kneel with one knee down. Shift weight forward until stretch is felt in the front of the hip/thigh. Keep your torso upright.",
      cues: ["Tuck your tailbone under (posterior pelvic tilt)", "Feel stretch in hip flexor of back leg", "Keep chest up — don't lean forward"],
      painRule: "Stretch ≤3/10",
      progressionCriteria: "Improved hip extension ROM",
      progression: "Add arm reach overhead, foot up on chair",
      evidenceBase: "First-line for hip flexor tightness in LBP and anterior hip pain",
    },
  ],

  ankle_foot: [
    {
      id: "ankle_alphabet",
      name: "Ankle Alphabet",
      category: "mobility",
      sets: 2,
      reps: "Full alphabet A-Z",
      rest: 30,
      frequency: "daily",
      equipment: [],
      position: "seated",
      instructions: "Seated with leg extended. Use your foot to trace the letters A through Z in the air, moving from the ankle only.",
      cues: ["Only move the ankle — keep your knee still", "Make letters as large as comfortable", "Great for reducing stiffness and swelling"],
      painRule: "Mild discomfort ≤3/10 acceptable",
      progressionCriteria: "Full alphabet with full range",
      progression: "Standing ankle circles with weight",
      evidenceBase: "Standard post-ankle sprain and post-surgical protocol",
    },
    {
      id: "ankle_calf_raise",
      name: "Calf Raise (Eccentric)",
      category: "strengthening",
      sets: 3,
      reps: "15",
      rest: 60,
      frequency: "3x/week",
      equipment: ["step"],
      position: "standing",
      instructions: "Stand on edge of a step on your toes. Rise up on both feet, then slowly lower on only the affected foot (3-4 seconds). This is the eccentric phase.",
      cues: ["The LOWERING is the most important part", "Lower over 3-4 full seconds", "Let heel drop below step level for full stretch"],
      painRule: "Pain ≤4/10 acceptable for Achilles rehab (Alfredson protocol)",
      progressionCriteria: "3 sets of 15 with full range, increasing load",
      regression: "Bilateral calf raise",
      progression: "Add weight via backpack or dumbbell",
      evidenceBase: "Alfredson Protocol — highest evidence for Achilles tendinopathy globally",
    },
  ],
};

// ── Program Generator ──────────────────────────────────────────────────────────

export function getExercisesForRegion(
  bodyRegion: string,
  phase: number,
  psychosocial?: PsychosocialProfile
): ExercisePrescription[] {
  const key = bodyRegion.toLowerCase().replace(/ /g, "_");
  const all = EXERCISE_LIBRARY[key] || EXERCISE_LIBRARY.lower_back;

  // Phase filtering:
  // Phase 1 (acute): mobility + stretching + gentle neuromuscular
  // Phase 2 (subacute): add strengthening
  // Phase 3+: full program
  let exercises = all;
  if (phase === 1) {
    exercises = all.filter(e => ["mobility", "stretching", "neuromuscular", "education", "aerobic"].includes(e.category)).slice(0, 4);
  } else if (phase === 2) {
    exercises = all.slice(0, 5);
  }

  // If high kinesiophobia, reduce load and prioritize education/mobility
  if (psychosocial?.kinesiophobiaLevel === "high") {
    exercises = exercises.map(e => ({
      ...e,
      sets: Math.max(1, e.sets - 1),
      painRule: "Stop if pain >2/10 — we prioritize comfort and confidence",
    }));
  }

  return exercises;
}

export function determinePhase(painAtRest: number, painOnset: string, weeksSinceOnset: number): number {
  if (painOnset === "acute" && weeksSinceOnset < 2) return 1;
  if (painAtRest >= 6 || weeksSinceOnset < 4) return 1;
  if (painAtRest >= 3 || weeksSinceOnset < 12) return 2;
  if (weeksSinceOnset < 24) return 3;
  return 4;
}

// ── Integrative Recovery Recommendations ─────────────────────────────────────

export function buildIntegrativeRecommendations(profile: {
  sleepQuality?: string;
  stressLevel?: number;
  nutritionQuality?: string;
  painAtRest?: number;
  diagnosis?: string;
}): string {
  const tips: string[] = [];

  // Sleep
  if (profile.sleepQuality === "poor") {
    tips.push(`
🌙 SLEEP OPTIMIZATION (Critical for Recovery)
Your sleep quality affects how fast you recover MORE than exercise does. Cartilage repairs, muscles rebuild, and inflammation resolves during sleep.
• Target 7-9 hours. Even 1 hour of extra sleep speeds healing significantly.
• Use a body pillow for positioning: for back pain, sleep with a pillow between knees (sidelying) or under knees (supine).
• Avoid screens 1 hour before bed — blue light increases pain sensitivity.
• Consider magnesium glycinate (200-400mg) — evidence supports reduced muscle tension and improved sleep quality.`);
  }

  // Stress
  if (profile.stressLevel && profile.stressLevel >= 7) {
    tips.push(`
🧘 STRESS & NERVOUS SYSTEM REGULATION
High stress keeps your nervous system in threat-mode, amplifying pain signals (central sensitization). Recovery is slower when cortisol is chronically elevated.
• Practice box breathing daily: 4 counts in, 4 hold, 4 out, 4 hold. Do this before your exercises.
• Even 10 minutes of daily mindfulness has measurable effects on pain intensity.
• The pain-stress cycle is real: pain causes stress, stress amplifies pain. Breaking it starts with calming the nervous system.`);
  }

  // Nutrition
  if (!profile.nutritionQuality || profile.nutritionQuality === "poor") {
    tips.push(`
🥗 NUTRITION FOR RECOVERY
• Protein: 1.2-1.6g per kg bodyweight daily. Muscle and tendon repair depend entirely on amino acid availability.
• Anti-inflammatory foods: fatty fish (salmon, sardines), berries, leafy greens, olive oil, turmeric.
• Collagen synthesis: Vitamin C-rich foods + collagen peptides (15g) 1 hour before exercise enhances tendon/cartilage repair (Shaw et al. 2017).
• Hydration: Dehydration reduces intervertebral disc height and joint lubrication. Aim for pale yellow urine.
• Avoid: excess alcohol, ultra-processed foods, trans fats — all increase systemic inflammation.`);
  }

  return tips.join("\n");
}

// ── Pain Science Education Library ───────────────────────────────────────────

export const PAIN_SCIENCE_LIBRARY = {
  central_sensitization: `
PAIN SCIENCE: Why Chronic Pain Happens
Your pain is 100% real — but it's produced by your brain as a protective response, not just a signal of tissue damage. In chronic pain, the nervous system becomes "sensitized" — like a smoke detector that goes off even when there's no fire.

Key evidence-based concepts:
• Hurt ≠ Harm: Pain is an alarm system, not a damage meter. You can have severe pain with minimal tissue damage, and vice versa.
• The "volume knob": Chronic pain turns up your nervous system's amplification. Stress, poor sleep, and fear all turn it up further.
• Movement is medicine: Graded exposure to movement — starting easy and building up — is the highest-evidence treatment for rewiring a sensitized nervous system.
• Recovery is non-linear: Good days and bad days are normal. A bad day doesn't mean you're getting worse.`,

  kinesiophobia_education: `
MOVEMENT IS SAFE: Understanding Fear of Movement
Fear of movement (kinesiophobia) is completely understandable after injury — but it slows recovery significantly.

The research is clear:
• Avoiding movement makes the brain more sensitive to pain signals, not less.
• The body is remarkably strong and resilient. Your spine, joints, and muscles are built to move.
• Graded exposure — gradually doing more — systematically reduces both pain and fear.
• Every time you complete an exercise and nothing "breaks," you're rewiring your brain's threat response.

Your program starts very gentle for exactly this reason — to build your confidence, not just your strength.`,

  recovery_timeline: `
REALISTIC RECOVERY TIMELINES (Evidence-Based)
• Acute muscle strain: 2-6 weeks
• Ligament sprain (Grade 1-2): 4-12 weeks  
• Rotator cuff tendinopathy: 3-6 months of consistent rehab
• Patellofemoral pain: 3-6 months
• Non-specific low back pain: 6-12 weeks (most improve significantly)
• Chronic pain (>3 months): Expect progress over months, not days — but progress IS the norm with the right approach.

Progress is measured by FUNCTION (what you can do), not just pain. Pain often improves last — function leads.`,
};

// ── DB Operations ─────────────────────────────────────────────────────────────

export async function getLatestAssessment(userId: string) {
  const [assessment] = await db
    .select()
    .from(omnimensPhysioAssessments)
    .where(eq(omnimensPhysioAssessments.userId, userId))
    .orderBy(desc(omnimensPhysioAssessments.createdAt))
    .limit(1);
  return assessment || null;
}

export async function saveAssessment(userId: string, data: Record<string, unknown>) {
  const [saved] = await db
    .insert(omnimensPhysioAssessments)
    .values({ userId, ...data as Record<string, never> })
    .returning();
  return saved;
}

export async function getActiveProgram(userId: string) {
  const [program] = await db
    .select()
    .from(omnimensPhysioPrograms)
    .where(and(
      eq(omnimensPhysioPrograms.userId, userId),
      eq(omnimensPhysioPrograms.isActive, true)
    ))
    .orderBy(desc(omnimensPhysioPrograms.createdAt))
    .limit(1);
  return program || null;
}

export async function saveProgram(userId: string, data: Record<string, unknown>) {
  await db
    .update(omnimensPhysioPrograms)
    .set({ isActive: false })
    .where(eq(omnimensPhysioPrograms.userId, userId));

  const [saved] = await db
    .insert(omnimensPhysioPrograms)
    .values({ userId, ...data as Record<string, never> })
    .returning();
  return saved;
}

export async function saveSession(userId: string, data: Record<string, unknown>) {
  const [saved] = await db
    .insert(omnimensPhysioSessions)
    .values({ userId, ...data as Record<string, never> })
    .returning();
  return saved;
}

export async function getOutcomeHistory(userId: string, measure: string) {
  return db
    .select()
    .from(omnimensPhysioOutcomes)
    .where(and(
      eq(omnimensPhysioOutcomes.userId, userId),
      eq(omnimensPhysioOutcomes.measure, measure)
    ))
    .orderBy(desc(omnimensPhysioOutcomes.createdAt))
    .limit(10);
}

export async function saveOutcome(userId: string, data: Record<string, unknown>) {
  const [saved] = await db
    .insert(omnimensPhysioOutcomes)
    .values({ userId, ...data as Record<string, never> })
    .returning();
  return saved;
}

// ── Context Builder for System Prompt ────────────────────────────────────────

export async function loadPhysioContext(userId: string): Promise<string> {
  try {
    const [assessment, program] = await Promise.all([
      getLatestAssessment(userId),
      getActiveProgram(userId),
    ]);

    if (!assessment && !program) return "";

    const parts: string[] = ["\n\n━━━ PATIENT PHYSIOTHERAPY RECORD ━━━"];

    if (assessment) {
      parts.push(`
Diagnosis: ${assessment.diagnosis || "Not specified"}
Body Region: ${assessment.bodyRegion || "Not specified"}
Pain Level (rest/activity): ${assessment.painAtRest ?? "?"}/${assessment.painWithActivity ?? "?"} out of 10
Onset: ${assessment.painOnset || "Not specified"} | Duration: ${assessment.painDuration || "Not specified"}
Psychosocial: PHQ-2=${assessment.phq2Score ?? "?"} TSK=${assessment.tskScore ?? "?"} PCS=${assessment.pcsScore ?? "?"}
Primary Goal: ${assessment.primaryGoal || "Not specified"}
Red Flags: ${assessment.redFlagsPresent ? `YES — ${assessment.redFlagDetails}` : "None identified"}
Sleep: ${assessment.sleepQuality || "Unknown"} | Stress: ${assessment.stressLevel ?? "?"}
`);
    }

    if (program) {
      parts.push(`
Active Rehab Program: ${program.name} (Phase ${program.phase}, Week ${program.weekNumber})
Exercises: ${(program.exercises as ExercisePrescription[]).map(e => e.name).join(", ")}
Frequency: ${program.frequencyPerWeek}x/week
`);
    }

    parts.push("━━━");
    return parts.join("\n");
  } catch {
    return "";
  }
}
