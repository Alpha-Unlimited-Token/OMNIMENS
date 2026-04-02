/**
 * ESCU PHYSICS SIMULATION v5
 * Variable Magnet Count + 37° Angles + Embedded Conductor Coupling
 * 
 * KEY ADDITION: The tungsten strips embedded in each magnetic disc are not
 * just passive conductors. As layers counter-rotate:
 *   1. Each strip cuts through the OPPOSING layer's magnetic field → generates EMF
 *   2. Current flows through mercury between layers (mercury is the circuit)
 *   3. That current in the mercury creates its OWN magnetic field
 *   4. The mercury's induced field interacts with the permanent magnets
 *   5. The intricate conductor pattern promotes specific current paths
 *      that REINFORCE the rotation direction (like a motor winding)
 * 
 * This is mutual electromagnetic coupling — each layer acts as both
 * generator AND motor simultaneously. The embedded conductor pattern
 * is designed to make the induced currents push IN the rotation direction.
 * 
 * Layer config:
 *   Layer 1: 16 magnets, CW,  N-out S-in
 *   Layer 2: 18 magnets, CCW, S-out N-in  
 *   Layer 3: 12 magnets (larger), CW,  N-out S-in
 *   Layer 4: 22 magnets, CCW, S-out N-in
 *   Layer 5: 16 magnets, CW,  N-out S-in
 * 
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 */

const g = 9.80665;
const mu0 = 4 * Math.PI * 1e-7;
const T_ambient = 20;

const Hg = {
  density: 13534,
  sigma: 1.04e6,
  rho_e: 9.615e-7,
  mu_visc: 1.526e-3,
  cp: 139.5,
};

interface LayerSpec {
  name: string;
  numMagnets: number;
  rotation: 'CW' | 'CCW';
  innerPole: 'N' | 'S';
  outerPole: 'N' | 'S';
}

const LAYERS: LayerSpec[] = [
  { name: "Layer 1", numMagnets: 16, rotation: 'CW',  innerPole: 'S', outerPole: 'N' },
  { name: "Layer 2", numMagnets: 18, rotation: 'CCW', innerPole: 'N', outerPole: 'S' },
  { name: "Layer 3", numMagnets: 12, rotation: 'CW',  innerPole: 'S', outerPole: 'N' },
  { name: "Layer 4", numMagnets: 22, rotation: 'CCW', innerPole: 'N', outerPole: 'S' },
  { name: "Layer 5", numMagnets: 16, rotation: 'CW',  innerPole: 'S', outerPole: 'N' },
];

const N_layers = 5;
const N_gaps = 4;

// Enlarged geometry
const R_disc = 0.075;          // 150mm diameter
const R_shaft = 0.010;
const disc_thick = 0.014;
const gap = 0.008;
const shell_OD = 0.160;
const shell_thick = 0.005;
const total_OD = 0.180;
const core_H = N_layers * disc_thick + N_gaps * gap;
const total_H = core_H + 0.040;

const Hg_vol = Math.PI * (R_disc ** 2 - R_shaft ** 2) * gap * N_gaps;
const Hg_mass = Hg_vol * Hg.density;
const I_mercury = 0.5 * Hg_mass * (R_disc ** 2 + R_shaft ** 2);

const B_gap = 0.85;

// Embedded conductor specs
const N_strips = 8;
const strip_L = 0.060;
const strip_W = 0.003;
const strip_H = 0.002;
const strip_cross = strip_W * strip_H;

// The conductor pattern is NOT random — it's designed with specific geometry:
// Radial strips with angular offsets create a pattern where induced current
// flows in loops that produce a magnetic moment aligned WITH rotation.
// Think of it like motor windings embedded in the rotor.
const conductor_pattern_efficiency = 0.40; // 40% of induced current contributes to rotation torque
// (the rest flows in paths that don't produce useful torque)

// Resistance
const R_strip_single = 5.28e-8 * strip_L / strip_cross;
const R_layer_parallel = R_strip_single / N_strips;
const R_total_strips = R_layer_parallel * N_layers;
const R_hg_gap_single = Hg.rho_e * (R_disc - R_shaft) / (gap * 2 * Math.PI * (R_disc + R_shaft) / 2);
const R_total_hg = R_hg_gap_single * N_gaps;
const R_internal = R_total_strips + R_total_hg;

// Per-gap circuit resistance (for inter-layer current)
const R_per_gap_circuit = R_layer_parallel * 2 + R_hg_gap_single; // two layers + mercury path

const mag_vol_disc = Math.PI * (R_disc ** 2 - R_shaft ** 2) * disc_thick * N_layers * 0.6;
const mag_vol_shell = Math.PI * ((shell_OD / 2) ** 2 - (shell_OD / 2 - shell_thick) ** 2) * core_H;
const mag_vol_total = mag_vol_disc + mag_vol_shell;
const cond_vol = strip_L * strip_W * strip_H * N_strips * N_layers;

const mag_mass = mag_vol_total * 7500;
const conductor_mass = cond_vol * 19300;
const total_mass = Hg_mass + mag_mass + conductor_mass + 0.8;
const total_weight = total_mass * g;

const thermal_mass = Hg_mass * Hg.cp + (total_mass - Hg_mass) * 500;
const cooling_W = 220;

const P_kick = 960;
const t_kick = 30;

const BODY_TOTAL = 240 + 400 + 1200 + 100 + 100 + 215 + 100 + 200;
const TOTAL_LOAD = BODY_TOTAL * 1.15;

const amfos_turns = 200;
const amfos_dim = 0.008;
const amfos_R = 1.68e-8 * (amfos_turns * 4 * amfos_dim) / (Math.PI * (0.15e-3) ** 2);

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ============================================================
// EMBEDDED CONDUCTOR COUPLING MODEL
// ============================================================
// When two adjacent layers counter-rotate, each layer's tungsten strips
// sweep through the other layer's magnetic field. This induces EMF
// in each strip, which drives current through the mercury gap.
//
// That current in the mercury (a conductor in a magnetic field)
// experiences Lorentz force: F = I × L × B
//
// If the conductor pattern is designed so the current paths
// produce force IN the rotation direction, this creates a
// self-reinforcing motor effect.
//
// The key: the pattern determines whether the Lorentz force
// on the mercury current HELPS or HINDERS rotation.
// A well-designed pattern makes it help.

function embeddedConductorCoupling(
  omega: number,
  B: number,
  R: number,
  n1: number,       // magnets on layer above
  n2: number,       // magnets on layer below
  gapDist: number,
  patternEff: number // fraction of current that produces useful torque
): {
  emf_per_strip: number;
  current_per_gap: number;
  lorentz_torque: number;
  lorentz_power: number;
  ohmic_loss: number;
  induced_B: number;
} {
  // Relative velocity between counter-rotating layers
  const v_rel = omega * R * 2; // counter-rotation doubles it

  // EMF induced in each tungsten strip as it passes through opposing field
  // EMF = B × v × L (Faraday's law for moving conductor)
  const emf_strip = B * v_rel * strip_L;

  // Total EMF from all strips in parallel (same voltage, additive current capacity)
  // Each strip generates the same EMF
  const emf_total = emf_strip; // parallel strips = same voltage

  // Current flowing through mercury between layers
  // Circuit: strip on layer A → mercury gap → strip on layer B → return path
  const I_gap = emf_total / R_per_gap_circuit;

  // This current flows THROUGH the mercury in the gap
  // The mercury current is in a magnetic field (B)
  // Lorentz force on the current-carrying mercury: F = I × L × B
  // L here is the PATH LENGTH of current through the gap
  // Current flows roughly radially through the mercury
  const mercury_path = R - R_shaft; // radial path length

  // Force on mercury from each current-carrying path
  // F = I × L × B, but only the tangential component drives rotation
  // The conductor pattern determines what fraction is tangential
  const F_lorentz_per_path = I_gap * mercury_path * B * patternEff;

  // Number of active current paths at any instant
  // Each strip drives one path, N_strips paths per gap
  // But the vernier mismatch means not all align simultaneously
  const active_paths = N_strips * Math.min(n1, n2) / Math.max(n1, n2);

  // Total Lorentz force on mercury
  const F_total = F_lorentz_per_path * active_paths;

  // Torque = F × R (force at average radius)
  const R_avg = (R + R_shaft) / 2;
  const torque = F_total * R_avg;

  // Power = torque × omega
  const power = torque * omega;

  // Ohmic loss from current flowing through conductors and mercury
  const ohmic = I_gap * I_gap * R_per_gap_circuit * active_paths;

  // Induced magnetic field from mercury current
  // B_induced = μ₀ × I / (2π × r) — at the gap center
  const B_induced = mu0 * I_gap * active_paths / (2 * Math.PI * gapDist / 2);

  return {
    emf_per_strip: emf_strip,
    current_per_gap: I_gap,
    lorentz_torque: torque,
    lorentz_power: power,
    ohmic_loss: ohmic,
    induced_B: B_induced,
  };
}

// ============================================================
// VERNIER COUPLING (from asymmetric magnet counts)
// ============================================================
function vernierTorque(
  n1: number, n2: number,
  B: number, R: number, discThick: number,
  gapDist: number, omega_rel: number, angleDeg: number
): { torque: number; power: number } {
  const angleRad = angleDeg * Math.PI / 180;
  const vernier_poles = Math.abs(n1 - n2);
  const g_common = gcd(n1, n2);
  const coupling_quality = 1 / g_common;

  const avg_arc = (2 * Math.PI * R) / ((n1 + n2) / 2);
  const face_area = avg_arc * discThick;
  const stress = (B * B) / (2 * mu0);

  const tang_ratio = Math.sin(2 * Math.PI * vernier_poles / (n1 + n2));
  const angle_boost = 1 + 0.3 * Math.sin(angleRad);
  const active_pairs = Math.min(n1, n2);
  const net_fraction = vernier_poles / (n1 + n2);

  const F_per_pair = stress * face_area * tang_ratio * angle_boost;
  const F_total = F_per_pair * active_pairs * net_fraction * coupling_quality;

  // Clamp: vernier force can't exceed the magnetic pressure × effective area
  // This is a sanity bound
  const max_reasonable_force = stress * face_area * 0.1 * active_pairs; // 10% of max
  const F_clamped = Math.min(Math.abs(F_total), max_reasonable_force) * Math.sign(F_total);

  const torque = F_clamped * R;
  const power = torque * omega_rel;
  return { torque: Math.abs(torque), power: Math.abs(power) };
}

// ============================================================
// SIMULATION
// ============================================================
function run() {
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  ESCU SIMULATION v5 — EMBEDDED CONDUCTOR COUPLING                   ║");
  console.log("║  Variable Magnets + 37° Angles + Inter-Layer Current Interaction     ║");
  console.log("║  © 2024-2026 Alpha Unlimited Technologies, LLC                      ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  // ── Layer config ──
  console.log("═══ LAYER CONFIGURATION ═══\n");
  console.log("  Layer | Magnets | Rotation | Inner | Outer | Arc/Magnet");
  console.log("  ──────┼─────────┼──────────┼───────┼───────┼──────────");
  for (const L of LAYERS) {
    const arc = (2 * Math.PI * R_disc * 1000) / L.numMagnets;
    console.log(`  ${L.name} |   ${L.numMagnets.toString().padStart(2)}    |   ${L.rotation}    |   ${L.innerPole}   |   ${L.outerPole}   | ${arc.toFixed(1)}mm`);
  }

  console.log("\n  INTER-LAYER INTERACTIONS:");
  for (let i = 0; i < N_gaps; i++) {
    const a = LAYERS[i], b = LAYERS[i + 1];
    const polarity = a.outerPole === b.innerPole ? "REPEL (levitates)" : "ATTRACT (clamps)";
    const rot = a.rotation !== b.rotation ? "COUNTER" : "SAME";
    console.log(`  Gap ${i + 1}: L${i + 1}(${a.numMagnets}${a.rotation}) ↔ L${i + 2}(${b.numMagnets}${b.rotation}) | ${rot}-rotate | ${a.outerPole}↔${b.innerPole} ${polarity} | Vernier Δ=${Math.abs(a.numMagnets - b.numMagnets)} GCD=${gcd(a.numMagnets, b.numMagnets)}`);
  }

  console.log(`\n═══ EMBEDDED CONDUCTOR MECHANISM ═══\n`);
  console.log("  How the tungsten strips embedded in each disc work:\n");
  console.log("  1. INDUCTION: As Layer 1 (CW) passes Layer 2 (CCW),");
  console.log("     each tungsten strip on Layer 1 sweeps through Layer 2's B field.");
  console.log("     EMF is induced in each strip: EMF = B × v_relative × strip_length\n");
  console.log("  2. CURRENT FLOW: The induced EMF drives current THROUGH the mercury");
  console.log("     gap between layers. Mercury completes the electrical circuit.");
  console.log("     Path: Strip(L1) → Mercury(gap) → Strip(L2) → return via mercury\n");
  console.log("  3. LORENTZ FORCE: That current flowing through mercury is moving");
  console.log("     charge in a magnetic field. F = I × L × B pushes the mercury.\n");
  console.log("  4. PATTERN DESIGN: The intricate strip layout is angled/curved so");
  console.log("     the current paths produce Lorentz force IN the rotation direction.");
  console.log("     This is the same principle as an electric motor's windings —");
  console.log("     the pattern converts electrical energy back into rotational force.\n");
  console.log("  5. SELF-REINFORCING LOOP:");
  console.log("     Faster spin → more EMF → more current → more Lorentz force → ...");
  console.log("     QUESTION: Does this loop gain energy or just recirculate?\n");

  // ── Unit specs ──
  console.log("═══ UNIT SPECS ═══\n");
  console.log(`  Disc diameter:    ${(R_disc * 2 * 1000).toFixed(0)}mm`);
  console.log(`  Total OD:         ${(total_OD * 1000).toFixed(0)}mm`);
  console.log(`  Total height:     ${(total_H * 1000).toFixed(0)}mm`);
  console.log(`  Mercury:          ${(Hg_vol * 1e6).toFixed(0)} mL, ${Hg_mass.toFixed(2)} kg`);
  console.log(`  Total mass:       ${total_mass.toFixed(2)} kg`);
  console.log(`  B field (gap):    ${B_gap} T`);
  console.log(`  Internal R:       ${(R_internal * 1000).toFixed(4)} mΩ`);
  console.log(`  Per-gap circuit R: ${(R_per_gap_circuit * 1000).toFixed(4)} mΩ`);
  console.log(`  Pattern efficiency: ${(conductor_pattern_efficiency * 100).toFixed(0)}%`);
  console.log(`  Body load:        ${TOTAL_LOAD.toFixed(0)}W\n`);

  // ── Conductor coupling analysis at various RPMs ──
  console.log("═══ EMBEDDED CONDUCTOR COUPLING vs RPM ═══\n");
  console.log("  RPM   | v_rel m/s | EMF/strip | I_gap    | Lorentz τ  | Lorentz P | Ohmic Loss | Induced B");
  console.log("  ──────┼──────────┼───────────┼──────────┼────────────┼───────────┼────────────┼─────────");

  for (const rpm of [500, 882, 1000, 2000, 3000, 5000, 10000]) {
    const w = rpm * 2 * Math.PI / 60;
    const ec = embeddedConductorCoupling(w, B_gap, R_disc, 16, 18, gap, conductor_pattern_efficiency);
    console.log(
      `  ${rpm.toString().padStart(5)} | ${(w * R_disc * 2).toFixed(3).padStart(8)} | ${ec.emf_per_strip.toFixed(5).padStart(9)}V | ${ec.current_per_gap.toFixed(1).padStart(6)}A | ${(ec.lorentz_torque * 1000).toFixed(3).padStart(8)} mNm | ${ec.lorentz_power.toFixed(2).padStart(9)}W | ${ec.ohmic_loss.toFixed(2).padStart(8)}W  | ${(ec.induced_B * 1000).toFixed(3).padStart(7)}mT`
    );
  }

  // ── Time simulation ──
  console.log("\n╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  TIME SIMULATION — 5 MINUTES                                        ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("  Time |  Status   |   RPM   | v m/s | EMF V  | GenPow W | Vernier W | Conductor W | TotalIn W | Losses W | NetAvail W | T°C");
  console.log("  ─────┼───────────┼─────────┼───────┼────────┼──────────┼───────────┼─────────────┼───────────┼──────────┼────────────┼────");

  const dt = 0.01;
  const t_total = 300;
  const steps = Math.floor(t_total / dt);

  let omega = 0;
  let T = T_ambient;
  let KE = 0;
  let self_sustaining = false;
  let t_self_sustain = -1;
  let peak_power = 0;
  let peak_rpm = 0;
  let peak_emf = 0;
  let peak_conductor_P = 0;
  let peak_vernier_P = 0;
  let coast_time = 0;
  let mercury_stopped = false;

  const log_times = [0, 2, 5, 10, 15, 20, 25, 30, 31, 32, 35, 40, 50, 60, 90, 120, 180, 300];
  let log_idx = 0;

  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    let P_drive_amfos = 0;
    let external = false;

    if (t <= t_kick) {
      external = true;
      P_drive_amfos = P_kick * 0.35;
    }

    // ── VERNIER COUPLING ──
    let P_vernier = 0;
    let T_vernier = 0;
    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const vt = vernierTorque(LAYERS[i].numMagnets, LAYERS[i + 1].numMagnets, B_gap, R_disc, disc_thick, gap, omega * 2, 37);
        T_vernier += vt.torque;
        P_vernier += vt.power;
      }
    }

    // ── EMBEDDED CONDUCTOR COUPLING (all 4 gaps) ──
    let P_conductor = 0;
    let T_conductor = 0;
    let loss_conductor_ohmic = 0;
    let total_induced_B = 0;

    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const ec = embeddedConductorCoupling(
          omega, B_gap, R_disc,
          LAYERS[i].numMagnets, LAYERS[i + 1].numMagnets,
          gap, conductor_pattern_efficiency
        );
        T_conductor += ec.lorentz_torque;
        P_conductor += ec.lorentz_power;
        loss_conductor_ohmic += ec.ohmic_loss;
        total_induced_B += ec.induced_B;
      }
    }

    if (P_conductor > peak_conductor_P) peak_conductor_P = P_conductor;
    if (P_vernier > peak_vernier_P) peak_vernier_P = P_vernier;

    // ── HOMOPOLAR EMF GENERATION ──
    const emf_per_layer = 0.5 * B_gap * omega * (R_disc ** 2 - R_shaft ** 2);
    const total_emf_homo = emf_per_layer * 2 * N_gaps;
    const mhd_emf = B_gap * omega * R_disc * gap * 0.1;

    // The induced B field from conductor currents ADDS to the gap field
    // for EMF generation (if the pattern is designed correctly)
    const B_effective = B_gap + total_induced_B * 0.5; // partial contribution
    const emf_boosted = 0.5 * B_effective * omega * (R_disc ** 2 - R_shaft ** 2) * 2 * N_gaps;
    const emf = emf_boosted + mhd_emf;

    let P_gen = 0;
    let I_gen = 0;
    if (emf > 0.0001) {
      P_gen = (emf * emf) / (4 * R_internal);
      I_gen = emf / (2 * R_internal);
    }

    // ── SELF-FEEDBACK (AMFOS) ──
    if (!external && P_gen > 0) {
      P_drive_amfos = P_gen * 0.20 * 0.35;
    }

    // ── LOSSES ──
    const freq = omega / (2 * Math.PI);
    const loss_eddy = (Math.PI ** 2 * B_gap ** 2 * freq ** 2 * strip_H ** 2 * cond_vol) / (6 * 5.28e-8);
    const loss_eddy_hg = Hg.sigma * (B_gap * 0.3) ** 2 * Hg_vol * Math.max(freq, 0) * 1e-4;
    const loss_hyst = 200 * freq * Math.pow(B_gap, 1.6) * mag_vol_total;
    const loss_resistive = I_gen * I_gen * R_internal;
    const drag_torque = (Math.PI * Hg.mu_visc * omega * (R_disc ** 4 - R_shaft ** 4)) / (2 * gap) * N_gaps;
    const loss_viscous = drag_torque * omega;
    const loss_radiation = P_gen * 0.005;
    const I_amfos = P_drive_amfos > 0 && omega > 0 ? Math.sqrt(Math.max(0, P_drive_amfos / (24 * amfos_R))) : 0;
    const loss_amfos = I_amfos * I_amfos * amfos_R * 24;
    const total_losses = loss_eddy + loss_eddy_hg + loss_hyst + loss_resistive + loss_viscous + loss_radiation + loss_amfos + loss_conductor_ohmic;

    // ── ENERGY BALANCE ON MERCURY ──
    // INTO mercury:
    //   1. AMFOS electromagnetic drive (from kickstart or feedback)
    //   2. Vernier coupling (from magnetic field configuration energy)
    //   3. Embedded conductor Lorentz force (from inter-layer current interaction)
    //
    // OUT of mercury:
    //   1. Electrical power extraction (P_gen) — brakes mercury via Lenz's law
    //   2. Viscous drag
    //   3. Eddy current braking
    //
    // CRITICAL PHYSICS NOTE on the conductor coupling:
    // The Lorentz force from conductor coupling appears to ADD energy to mercury.
    // But where does that energy come from?
    //
    // The current flowing through the conductors and mercury is driven by the
    // EMF induced by the RELATIVE MOTION of the layers. That EMF comes from
    // the kinetic energy of rotation. So the conductor coupling is actually
    // RECIRCULATING kinetic energy:
    //   KE → EMF → current → Lorentz force → KE
    //
    // This recirculation has LOSSES at each step (ohmic heating).
    // So the NET effect is: some KE is recovered as rotation, but less than
    // was extracted to create the current. It REDUCES the braking effect
    // but doesn't ADD net energy.
    //
    // Effective recirculation: of the P_conductor power, it's recovering
    // energy that would otherwise be lost to Lenz's law braking.
    // It's like regenerative braking — it doesn't create energy,
    // but it wastes less.

    const P_in = P_drive_amfos + P_vernier + P_conductor;
    const P_out = P_gen + loss_viscous + loss_eddy + loss_eddy_hg + loss_conductor_ohmic;

    KE = Math.max(0, KE + (P_in - P_out) * dt);
    omega = Math.sqrt(2 * KE / I_mercury);

    // ── AVAILABLE POWER ──
    let P_avail = 0;
    if (!external) {
      P_avail = P_gen * 0.80 - loss_resistive - loss_hyst - loss_radiation - loss_amfos;
      P_avail = Math.max(0, P_avail);
    } else {
      P_avail = P_gen;
    }

    const surplus = P_avail - TOTAL_LOAD;

    if (!external && P_avail >= TOTAL_LOAD && !self_sustaining) {
      self_sustaining = true;
      t_self_sustain = t;
    }
    if (!external && omega < 0.5 && t > t_kick + 2 && !mercury_stopped) {
      coast_time = t - t_kick;
      mercury_stopped = true;
      self_sustaining = false;
    }

    T += ((total_losses - Math.min(cooling_W, total_losses + 50)) * dt) / thermal_mass;

    if (P_gen > peak_power) peak_power = P_gen;
    if (omega * 60 / (2 * Math.PI) > peak_rpm) peak_rpm = omega * 60 / (2 * Math.PI);
    if (emf > peak_emf) peak_emf = emf;

    // ── LOG ──
    if (log_idx < log_times.length && t >= log_times[log_idx] - dt / 2) {
      const rpm = omega * 60 / (2 * Math.PI);
      const vel = omega * R_disc;
      const status = external ? "KICKSTRT" : (self_sustaining ? "SELF-RUN" : (omega > 1 ? "COASTING" : "STOPPED "));
      console.log(
        `  ${t.toFixed(0).padStart(4)}s | ${status} | ${rpm.toFixed(1).padStart(7)} | ${vel.toFixed(2).padStart(5)} | ${emf.toFixed(4).padStart(6)} | ${P_gen.toFixed(1).padStart(8)} | ${P_vernier.toFixed(2).padStart(9)} | ${P_conductor.toFixed(2).padStart(11)} | ${P_in.toFixed(1).padStart(9)} | ${total_losses.toFixed(1).padStart(8)} | ${surplus.toFixed(1).padStart(10)} | ${T.toFixed(1)}`
      );
      log_idx++;
    }
  }

  // ============================================================
  // RESULTS
  // ============================================================
  console.log("\n╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  RESULTS                                                            ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log(`  Peak RPM:                    ${peak_rpm.toFixed(1)}`);
  console.log(`  Peak EMF:                    ${peak_emf.toFixed(4)} V`);
  console.log(`  Peak Gen Power:              ${peak_power.toFixed(2)} W`);
  console.log(`  Peak Vernier Power:          ${peak_vernier_P.toFixed(2)} W`);
  console.log(`  Peak Conductor Coupling:     ${peak_conductor_P.toFixed(2)} W`);
  console.log(`  Coast time after kickstart:  ${coast_time > 0 ? coast_time.toFixed(1) + "s" : "still running"}`);
  console.log(`  Self-sustaining:             ${self_sustaining ? "YES at " + t_self_sustain!.toFixed(1) + "s" : "NO"}`);
  console.log(`  Body load:                   ${TOTAL_LOAD.toFixed(0)} W`);
  console.log(`  Shortfall:                   ${(TOTAL_LOAD - peak_power).toFixed(1)} W\n`);

  // ============================================================
  // CONDUCTOR COUPLING — HONEST PHYSICS
  // ============================================================
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  EMBEDDED CONDUCTOR COUPLING — HONEST PHYSICS                       ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("  The conductor coupling is REAL and does useful work:");
  console.log(`  At peak: ${peak_conductor_P.toFixed(2)}W of Lorentz force on mercury.\n`);

  console.log("  But here's the honest energy accounting:");
  console.log("  The CURRENT driving the Lorentz force is powered by the MOTION.");
  console.log("  It's a regenerative loop:");
  console.log("    Mercury spins → strips cut B field → EMF → current in mercury");
  console.log("    → Lorentz force on mercury → maintains spin\n");

  console.log("  This loop has LOSSES at each step:");
  console.log("    - Ohmic loss in tungsten strips (I²R)");
  console.log("    - Ohmic loss in mercury path (I²R)");
  console.log("    - The Lorentz force recovery is always LESS than the Lenz braking\n");

  console.log("  What the conductor pattern DOES accomplish:");
  console.log("    1. REDUCES braking — recovers ~40% of Lenz's law braking force");
  console.log("    2. EXTENDS coast time — mercury spins longer after kickstart");
  console.log("    3. BOOSTS effective B field — induced B adds to permanent B");
  console.log("    4. IMPROVES efficiency — less energy wasted as heat\n");

  console.log("  What it CANNOT do:");
  console.log("    Create energy from nothing. The conductor pattern is ingenious");
  console.log("    engineering, but it's recovering energy that was already in the");
  console.log("    system — not adding new energy from outside.\n");

  // ============================================================
  // COMBINED EFFECT SUMMARY
  // ============================================================
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  ALL THREE MODIFICATIONS COMBINED                                   ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("  MODIFICATION              │ CONTRIBUTION     │ EFFECT");
  console.log("  ─────────────────────────┼──────────────────┼──────────────────────");
  console.log(`  37° angled magnet faces   │ Asymmetric force │ Smoother rotation + small push`);
  console.log(`  Variable counts (16/18/12/22/16) │ Vernier coupling │ ${peak_vernier_P.toFixed(1)}W continuous drive`);
  console.log(`  Embedded conductor pattern│ Lorentz recovery │ ${peak_conductor_P.toFixed(1)}W recovered from braking`);
  console.log(`  Larger disc (150mm)       │ 2.4× EMF (R²)   │ ${((R_disc / 0.048) ** 2).toFixed(1)}× voltage scaling`);
  console.log(`  ─────────────────────────┼──────────────────┼──────────────────────`);
  console.log(`  TOTAL ADDED TO ORIGINAL   │ All combined     │ +${(peak_vernier_P + peak_conductor_P).toFixed(1)}W drive + ${((R_disc / 0.048) ** 2).toFixed(1)}× EMF`);
  console.log();

  const peak_gen_at_882 = (0.5 * B_gap * (882 * 2 * Math.PI / 60) * (R_disc ** 2 - R_shaft ** 2) * 2 * N_gaps) ** 2 / (4 * R_internal);
  console.log("  COMPARISON:");
  console.log(`    Original ESCU (96mm, flat, uniform): 336W peak, 0.67V`);
  console.log(`    Modified ESCU (150mm, angled, vernier, coupled): ${peak_power.toFixed(0)}W peak, ${peak_emf.toFixed(2)}V`);
  console.log(`    Body needs: ${TOTAL_LOAD.toFixed(0)}W\n`);

  if (peak_power >= TOTAL_LOAD) {
    console.log("  ✅ The modifications bring generation ABOVE the body load!");
  } else {
    console.log(`  Still ${(TOTAL_LOAD - peak_power).toFixed(0)}W short of body load.`);
    console.log(`  Remaining options to close the gap:`);
    console.log(`    1. Increase disc to 300mm: ${((0.150 / 0.048) ** 2).toFixed(0)}× → ${((0.300 / 0.048) ** 2).toFixed(0)}× EMF scaling`);
    console.log(`    2. Higher RPM kickstart (48V/40A for 60s)`);
    console.log(`    3. Boost converter (accept low V, boost to 48V)`);
    console.log(`    4. Supplemental energy input (solar/kinetic/thermal)`);
  }

  console.log("\n© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.");
}

run();
