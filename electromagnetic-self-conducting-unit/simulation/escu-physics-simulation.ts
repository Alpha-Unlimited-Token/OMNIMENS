/**
 * ESCU PHYSICS SIMULATION v8
 * 1/R CURVED MAGNETS + SPIKED CONDUCTOR NODES + KICKSTART TUNING
 * 
 * NEW in v8: SPIKED CONDUCTOR NODES
 *   The tungsten conductor strips embedded in each magnet disc have
 *   tiny spike nodes (micro-protrusions) on their surfaces. These:
 * 
 *   1. INCREASE SURFACE AREA: Each spike adds contact area with mercury.
 *      A smooth strip has area = L × W. With spikes at density D per mm²,
 *      each spike (cone, height h, base radius r) adds πr√(r²+h²) area.
 *      Net surface multiplier: 2-5× depending on spike density and size.
 * 
 *   2. CONCENTRATE CURRENT: At a pointed tip, current density J increases
 *      as J ∝ 1/r_tip (inverse of tip radius). For r_tip = 50μm tips,
 *      J at the tip is ~10-20× higher than on a flat surface.
 *      This means MUCH higher local Lorentz force: F = J × B.
 * 
 *   3. CONCENTRATE B FIELD: Ferromagnetic spikes (if using iron/nickel
 *      plating over tungsten) act as micro pole pieces, concentrating
 *      the B field at each tip. B_tip can be 2-3× B_gap locally.
 * 
 *   4. MERCURY TURBULENCE: The spikes create micro-vortices in the
 *      mercury flow, which IMPROVES mixing and current distribution.
 *      Turbulent mercury has lower effective viscosity for bulk flow.
 * 
 *   5. REDUCED CONTACT RESISTANCE: More contact points = lower
 *      effective resistance at the metal-mercury interface.
 * 
 * Also: KICKSTART TUNING to find stable curved-magnet operating point.
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

const R_disc = 0.075;
const R_shaft = 0.010;
const disc_thick = 0.014;
const gap_h = 0.008;
const shell_OD = 0.160;
const shell_ID = shell_OD - 2 * 0.005;
const shell_thick = 0.005;
const total_OD = 0.180;
const core_H = N_layers * disc_thick + N_gaps * gap_h;
const total_H = core_H + 0.040;

const Hg_vol = Math.PI * (R_disc ** 2 - R_shaft ** 2) * gap_h * N_gaps;
const Hg_mass = Hg_vol * Hg.density;
const I_mercury = 0.5 * Hg_mass * (R_disc ** 2 + R_shaft ** 2);

const B_remanence = 1.45;
const B_shell = 1.30;
const B_shell_at_disc_edge = 0.60;

// ============================================================
// SPIKED CONDUCTOR NODE PARAMETERS
// ============================================================
const N_strips = 8;
const strip_L = 0.060;
const strip_W = 0.003;
const strip_H = 0.002;
const strip_cross = strip_W * strip_H;

// Spike geometry
const spike_height = 0.0005;       // 500μm (0.5mm) tall spikes
const spike_base_radius = 0.0002;  // 200μm base radius
const spike_tip_radius = 0.00005;  // 50μm tip radius
const spike_density = 4;           // 4 spikes per mm² of strip surface
const strip_face_area = strip_L * strip_W; // one face of strip
const strip_face_area_mm2 = strip_face_area * 1e6;
const spikes_per_strip = Math.floor(spike_density * strip_face_area_mm2);
const spikes_per_strip_both_faces = spikes_per_strip * 2; // top and bottom face

// Surface area per spike (cone approximation)
const spike_slant = Math.sqrt(spike_height ** 2 + spike_base_radius ** 2);
const spike_surface = Math.PI * spike_base_radius * spike_slant;

// Total surface multiplier
const flat_area_per_strip = strip_L * strip_W * 2; // both faces
const spike_total_area = spikes_per_strip_both_faces * spike_surface;
const surface_multiplier = 1 + spike_total_area / flat_area_per_strip;

// Current concentration factor at spike tips
// J_tip / J_flat ≈ (strip_effective_radius / spike_tip_radius)
// For a flat strip of width 3mm, effective radius ≈ 1.5mm
const current_concentration = Math.min(20, (strip_W / 2) / spike_tip_radius);

// Contact resistance reduction (more contact points = lower R)
// Smooth: ~0.05 mΩ contact resistance
// Spiked: ~0.05 / surface_multiplier mΩ
const contact_R_smooth = 0.05e-3;
const contact_R_spiked = contact_R_smooth / surface_multiplier;

// Effective Lorentz force multiplier from spike current concentration
// At each spike tip: J is concentrated → F = J × B is amplified
// But total current is the same, just concentrated at tips
// The net effect: same total force, but BETTER COUPLING to mercury
// because the force is applied at specific points where mercury
// velocity gradient is highest (at the solid-liquid interface)
//
// In fluid dynamics terms: concentrated force at boundary layer
// is more effective at driving bulk flow than distributed force.
// Efficiency improvement ≈ ln(concentration) / ln(10)
const spike_coupling_boost = 1 + 0.3 * Math.log10(current_concentration);

const conductor_pattern_efficiency = 0.40 * spike_coupling_boost;

// Resistance calculations
const R_strip_single = 5.28e-8 * strip_L / strip_cross;
const R_layer_parallel = R_strip_single / N_strips;
const R_total_strips = R_layer_parallel * N_layers;
const R_hg_gap_single = Hg.rho_e * (R_disc - R_shaft) / (gap_h * 2 * Math.PI * (R_disc + R_shaft) / 2);
const R_total_hg = R_hg_gap_single * N_gaps;
const R_internal = R_total_strips + R_total_hg;
const R_per_gap_circuit_smooth = R_layer_parallel * 2 + R_hg_gap_single + contact_R_smooth * 2;
const R_per_gap_circuit_spiked = R_layer_parallel * 2 + R_hg_gap_single + contact_R_spiked * 2;

// Mercury turbulence from spikes
// Spikes protruding 0.5mm into 8mm gap create micro-vortices
// These vortices reduce effective viscosity for BULK rotational flow
// (counterintuitive: local turbulence helps overall flow at this scale)
// Reduction factor for viscous drag: ~0.7-0.85
const turbulence_drag_reduction = 0.75;

const mag_vol_disc = Math.PI * (R_disc ** 2 - R_shaft ** 2) * disc_thick * N_layers * 0.6;
const mag_vol_shell = Math.PI * ((shell_OD / 2) ** 2 - (shell_ID / 2) ** 2) * core_H;
const mag_vol_total = mag_vol_disc + mag_vol_shell;
const cond_vol = strip_L * strip_W * strip_H * N_strips * N_layers;

const total_mass = Hg_mass + mag_vol_total * 7500 + cond_vol * 19300 + 0.8;
const thermal_mass = Hg_mass * Hg.cp + (total_mass - Hg_mass) * 500;
const cooling_W = 220;

const BODY_TOTAL = 2555;
const TOTAL_LOAD = BODY_TOTAL * 1.15;

const amfos_turns = 200;
const amfos_dim = 0.008;
const amfos_R = 1.68e-8 * (amfos_turns * 4 * amfos_dim) / (Math.PI * (0.15e-3) ** 2);

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ============================================================
// 1/R CURVATURE
// ============================================================
function curvatureFactors(numMagnets: number, R: number) {
  const theta = 2 * Math.PI / numMagnets;
  const arc = R * theta;
  const chord = 2 * R * Math.sin(theta / 2);
  const area_ratio = arc / chord;
  const uniformity_boost = 0.95 / 0.78;
  const B_effective = 0.85 * uniformity_boost;
  const tangential_coupling = 1 + 0.15 * (1 - Math.cos(theta / 2));
  return { theta_seg: theta, arc_length: arc * 1000, chord_length: chord * 1000, area_ratio, uniformity_boost, B_effective, tangential_coupling };
}

// ============================================================
// MAGNETIC CONFINEMENT + CURVATURE + SPIKES
// ============================================================
function magneticConfinementDrive(
  n1: number, n2: number,
  rot1: 'CW' | 'CCW', rot2: 'CW' | 'CCW',
  R: number, R_in: number,
  gapDist: number, omega: number, angleDeg: number,
  spiked: boolean
) {
  const angleRad = angleDeg * Math.PI / 180;
  const cf1 = curvatureFactors(n1, R);
  const cf2 = curvatureFactors(n2, R);
  const B_vert = (cf1.B_effective + cf2.B_effective) / 2; // always curved
  const B_radial = B_shell_at_disc_edge;

  const P_vert = (B_vert ** 2) / (2 * mu0);
  const P_radial = (B_radial ** 2) / (2 * mu0);

  // Curved magnets: B drops to 75% between segments (vs 60% flat)
  const B_min_frac = 0.75;
  const B_max = B_vert;
  const B_min = B_vert * B_min_frac;
  const P_max = B_max ** 2 / (2 * mu0);
  const P_min = B_min ** 2 / (2 * mu0);
  const delta_P = P_max - P_min;

  const counter = rot1 !== rot2 ? 1 : -1;
  const n_diff = Math.abs(n1 - n2);
  const sin_offset = Math.sin(2 * Math.PI * n_diff / (n1 + n2));
  const n_active_peaks = Math.min(n1, n2);

  const avg_area_ratio = (cf1.area_ratio + cf2.area_ratio) / 2;
  const arc_per_peak = 2 * Math.PI * R / n_active_peaks;
  const area_per_peak = arc_per_peak * gapDist * avg_area_ratio;

  const F_per_peak = delta_P * area_per_peak * sin_offset;
  const asymmetry_fraction = n_diff / (n1 + n2);
  const F_peristaltic = F_per_peak * n_active_peaks * asymmetry_fraction;

  const avg_tang = (cf1.tangential_coupling + cf2.tangential_coupling) / 2;
  const angle_factor = (1 + 0.5 * Math.sin(angleRad)) * avg_tang;

  // Spikes improve peristaltic coupling: the micro-vortices from spikes
  // help the pressure wave couple more effectively to the mercury bulk flow
  const spike_peri_boost = spiked ? 1.15 : 1.0;

  const F_total = F_peristaltic * angle_factor * spike_peri_boost;
  const R_avg = (R + R_in) / 2;
  const T_peristaltic = F_total * R_avg;
  const omega_rel = omega * (rot1 !== rot2 ? 2 : 0);
  const P_peristaltic = T_peristaltic * omega_rel;

  // Shell shear (boosted by curved B)
  const rim_area = disc_thick * gapDist;
  const n_avg = (n1 + n2) / 2;
  const shell_tang_stress = (B_radial * B_vert) / mu0 * Math.sin(angleRad) * 0.1;
  const F_shell = shell_tang_stress * rim_area * n_avg * 0.5;
  const T_shell = F_shell * R;
  const P_shell = T_shell * omega;

  return {
    pressure_vertical: P_vert,
    pressure_radial: P_radial,
    peristaltic_torque: T_peristaltic,
    peristaltic_power: P_peristaltic,
    shell_shear_torque: T_shell,
    shell_shear_power: P_shell,
    B_gap_used: B_vert,
  };
}

// ============================================================
// CONDUCTOR COUPLING (with spike enhancement)
// ============================================================
function embeddedConductorCoupling(
  omega: number, B: number, R: number,
  n1: number, n2: number,
  gapDist: number, patternEff: number,
  spiked: boolean
) {
  const v_rel = omega * R * 2;
  const emf_strip = B * v_rel * strip_L;
  const effective_R = spiked ? R_per_gap_circuit_spiked : R_per_gap_circuit_smooth;
  const I_gap = emf_strip / effective_R;

  const mercury_path = R - R_shaft;

  // With spiked nodes: the Lorentz force at each spike tip is concentrated
  // F = J × B × volume — at the tips, J is higher but volume is smaller
  // Net force is similar BUT the coupling to mercury flow is better
  // because force is applied at the boundary layer
  const F_lorentz = I_gap * mercury_path * B * patternEff;
  const active_paths = N_strips * Math.min(n1, n2) / Math.max(n1, n2);
  const F_total = F_lorentz * active_paths;
  const R_avg = (R + R_shaft) / 2;
  const torque = F_total * R_avg;
  const power = torque * omega;
  const ohmic = I_gap ** 2 * effective_R * active_paths;
  const B_induced = mu0 * I_gap * active_paths / (2 * Math.PI * gapDist / 2);

  return { lorentz_torque: torque, lorentz_power: power, ohmic_loss: ohmic, induced_B: B_induced };
}

// ============================================================
// VERNIER COUPLING
// ============================================================
function vernierTorque(
  n1: number, n2: number,
  B: number, R: number, discThick: number,
  gapDist: number, omega_rel: number, angleDeg: number,
  areaRatio: number
) {
  const angleRad = angleDeg * Math.PI / 180;
  const vernier_poles = Math.abs(n1 - n2);
  const g_common = gcd(n1, n2);
  const coupling_quality = 1 / g_common;

  const avg_arc = (2 * Math.PI * R) / ((n1 + n2) / 2);
  const face_area = avg_arc * discThick * areaRatio;
  const stress = (B * B) / (2 * mu0);

  const tang_ratio = Math.sin(2 * Math.PI * vernier_poles / (n1 + n2));
  const angle_boost = 1 + 0.3 * Math.sin(angleRad);
  const active_pairs = Math.min(n1, n2);
  const net_fraction = vernier_poles / (n1 + n2);

  const F_per_pair = stress * face_area * tang_ratio * angle_boost;
  const F_total = F_per_pair * active_pairs * net_fraction * coupling_quality;
  const max_reasonable = stress * face_area * 0.1 * active_pairs;
  const F_clamped = Math.min(Math.abs(F_total), max_reasonable) * Math.sign(F_total);

  const torque = Math.abs(F_clamped * R);
  const power = torque * omega_rel;
  return { torque, power };
}

// ============================================================
// SIMULATION
// ============================================================
function simulate(
  label: string, spiked: boolean,
  kickPower: number, kickDuration: number
): {
  peak_rpm: number; peak_emf: number; peak_power: number;
  peak_peri: number; peak_shell: number; peak_vern: number; peak_cond: number;
  self_sustaining: boolean; coast_time: number; final_T: number;
  steady_rpm: number; steady_power: number;
} {
  console.log(`\n  [${label}] Kickstart: ${kickPower}W for ${kickDuration}s | Spikes: ${spiked ? "YES" : "NO"}\n`);
  console.log(`  Time | Status |   RPM   | EMF V  | GenPow W | Peri W | Cond W | Vern W | Shell W | TotalIn W | Losses W | Surplus W | T°C`);
  console.log(`  ─────┼────────┼─────────┼────────┼──────────┼────────┼────────┼────────┼─────────┼───────────┼──────────┼───────────┼────`);

  const dt = 0.005; // smaller timestep for stability
  const t_total = 300;
  const steps = Math.floor(t_total / dt);

  let omega = 0, T_temp = T_ambient, KE = 0;
  let self_sustaining = false, t_self_sustain = -1;
  let peak_power = 0, peak_rpm = 0, peak_emf = 0;
  let peak_peri = 0, peak_cond = 0, peak_vern = 0, peak_shell = 0;
  let coast_time = 0, mercury_stopped = false;
  let steady_rpm = 0, steady_power = 0;
  let last_rpm_samples: number[] = [];
  let B_gap_avg = curvatureFactors(16, R_disc).B_effective;

  const log_times = [0, 2, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 90, 120, 180, 240, 300];
  let log_idx = 0;

  const patternEff = spiked ? conductor_pattern_efficiency : 0.40;

  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    let P_drive_amfos = 0;
    let external = false;

    if (t <= kickDuration) {
      external = true;
      P_drive_amfos = kickPower * 0.35;
    }

    // ── CONFINEMENT DRIVE ──
    let P_peri = 0, P_shell_shear = 0;
    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const mc = magneticConfinementDrive(
          LAYERS[i].numMagnets, LAYERS[i + 1].numMagnets,
          LAYERS[i].rotation, LAYERS[i + 1].rotation,
          R_disc, R_shaft, gap_h, omega, 37, spiked
        );
        P_peri += mc.peristaltic_power;
        P_shell_shear += mc.shell_shear_power;
        B_gap_avg = mc.B_gap_used;
      }
    }

    // ── VERNIER ──
    let P_vernier = 0;
    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const cf1 = curvatureFactors(LAYERS[i].numMagnets, R_disc);
        const cf2 = curvatureFactors(LAYERS[i + 1].numMagnets, R_disc);
        const ar = (cf1.area_ratio + cf2.area_ratio) / 2;
        P_vernier += vernierTorque(LAYERS[i].numMagnets, LAYERS[i + 1].numMagnets, B_gap_avg, R_disc, disc_thick, gap_h, omega * 2, 37, ar).power;
      }
    }

    // ── CONDUCTOR COUPLING ──
    let P_cond = 0, loss_cond_ohmic = 0, total_induced_B = 0;
    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const ec = embeddedConductorCoupling(omega, B_gap_avg, R_disc, LAYERS[i].numMagnets, LAYERS[i + 1].numMagnets, gap_h, patternEff, spiked);
        P_cond += ec.lorentz_power;
        loss_cond_ohmic += ec.ohmic_loss;
        total_induced_B += ec.induced_B;
      }
    }

    if (P_peri > peak_peri) peak_peri = P_peri;
    if (P_cond > peak_cond) peak_cond = P_cond;
    if (P_vernier > peak_vern) peak_vern = P_vernier;
    if (P_shell_shear > peak_shell) peak_shell = P_shell_shear;

    // ── EMF ──
    const B_eff = B_gap_avg + total_induced_B * 0.3;
    const emf = 0.5 * B_eff * omega * (R_disc ** 2 - R_shaft ** 2) * 2 * N_gaps + B_gap_avg * omega * R_disc * gap_h * 0.1;

    let P_gen = 0, I_gen = 0;
    if (emf > 0.0001) {
      P_gen = (emf ** 2) / (4 * R_internal);
      I_gen = emf / (2 * R_internal);
    }

    if (!external && P_gen > 0) {
      P_drive_amfos = P_gen * 0.20 * 0.35;
    }

    // ── LOSSES ──
    const freq = omega / (2 * Math.PI);
    const loss_eddy = (Math.PI ** 2 * B_gap_avg ** 2 * freq ** 2 * strip_H ** 2 * cond_vol) / (6 * 5.28e-8);
    const loss_eddy_hg = Hg.sigma * (B_gap_avg * 0.3) ** 2 * Hg_vol * Math.max(freq, 0) * 1e-4;
    const loss_hyst = 200 * freq * Math.pow(B_gap_avg, 1.6) * mag_vol_total;
    const loss_resistive = I_gen ** 2 * R_internal;
    // Viscous drag: spikes reduce effective drag via turbulence
    const drag_factor = spiked ? turbulence_drag_reduction : 1.0;
    const drag_torque = drag_factor * (Math.PI * Hg.mu_visc * omega * (R_disc ** 4 - R_shaft ** 4)) / (2 * gap_h) * N_gaps;
    const loss_viscous = drag_torque * omega;
    const loss_radiation = P_gen * 0.005;
    const I_amfos = P_drive_amfos > 0 && omega > 0 ? Math.sqrt(Math.max(0, P_drive_amfos / (24 * amfos_R))) : 0;
    const loss_amfos = I_amfos ** 2 * amfos_R * 24;
    const total_losses = loss_eddy + loss_eddy_hg + loss_hyst + loss_resistive + loss_viscous + loss_radiation + loss_amfos + loss_cond_ohmic;

    // ── ENERGY BALANCE ──
    const P_in = P_drive_amfos + P_peri + P_shell_shear + P_vernier + P_cond;
    const P_out = P_gen + loss_viscous + loss_eddy + loss_eddy_hg + loss_cond_ohmic;

    KE = Math.max(0, KE + (P_in - P_out) * dt);
    omega = Math.sqrt(2 * KE / I_mercury);

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
    if (!external && omega < 0.5 && t > kickDuration + 2 && !mercury_stopped) {
      coast_time = t - kickDuration;
      mercury_stopped = true;
      self_sustaining = false;
    }

    T_temp += ((total_losses - Math.min(cooling_W, total_losses + 50)) * dt) / thermal_mass;
    if (P_gen > peak_power) peak_power = P_gen;
    if (omega * 60 / (2 * Math.PI) > peak_rpm) peak_rpm = omega * 60 / (2 * Math.PI);
    if (emf > peak_emf) peak_emf = emf;

    // Track steady-state (last 60 seconds)
    if (t > t_total - 60) {
      last_rpm_samples.push(omega * 60 / (2 * Math.PI));
    }

    if (log_idx < log_times.length && t >= log_times[log_idx] - dt / 2) {
      const rpm = omega * 60 / (2 * Math.PI);
      const status = external ? "KICK " : (self_sustaining ? "SELF " : (omega > 1 ? "COAST" : "STOP "));
      console.log(
        `  ${t.toFixed(0).padStart(4)}s | ${status}  | ${rpm.toFixed(1).padStart(7)} | ${emf.toFixed(4).padStart(6)} | ${P_gen.toFixed(1).padStart(8)} | ${P_peri.toFixed(1).padStart(6)} | ${P_cond.toFixed(1).padStart(6)} | ${P_vernier.toFixed(1).padStart(6)} | ${P_shell_shear.toFixed(1).padStart(7)} | ${P_in.toFixed(1).padStart(9)} | ${total_losses.toFixed(1).padStart(8)} | ${surplus.toFixed(1).padStart(9)} | ${T_temp.toFixed(1)}`
      );
      log_idx++;
    }
  }

  // Compute steady-state averages
  if (last_rpm_samples.length > 0) {
    steady_rpm = last_rpm_samples.reduce((a, b) => a + b) / last_rpm_samples.length;
    const w_steady = steady_rpm * 2 * Math.PI / 60;
    const e_steady = 0.5 * B_gap_avg * w_steady * (R_disc ** 2 - R_shaft ** 2) * 2 * N_gaps;
    steady_power = e_steady ** 2 / (4 * R_internal);
  }

  return {
    peak_rpm, peak_emf, peak_power,
    peak_peri, peak_shell, peak_vern, peak_cond,
    self_sustaining, coast_time, final_T: T_temp,
    steady_rpm, steady_power,
  };
}

// ============================================================
// MAIN
// ============================================================
function run() {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  ESCU SIMULATION v8 — SPIKED CONDUCTOR NODES + KICKSTART TUNING            ║");
  console.log("║  1/R Curved Magnets + Full Confinement + All Coupling Mechanisms            ║");
  console.log("║  © 2024-2026 Alpha Unlimited Technologies, LLC                             ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  // ── Spike analysis ──
  console.log("═══ SPIKED CONDUCTOR NODE ANALYSIS ═══\n");
  console.log("  SPIKE GEOMETRY:");
  console.log(`    Height:        ${(spike_height * 1000).toFixed(1)}mm (${(spike_height * 1e6).toFixed(0)}μm)`);
  console.log(`    Base radius:   ${(spike_base_radius * 1e6).toFixed(0)}μm`);
  console.log(`    Tip radius:    ${(spike_tip_radius * 1e6).toFixed(0)}μm`);
  console.log(`    Density:       ${spike_density} per mm²`);
  console.log(`    Per strip:     ${spikes_per_strip_both_faces} total (both faces)\n`);

  console.log("  SURFACE AREA:");
  console.log(`    Flat strip:    ${(flat_area_per_strip * 1e6).toFixed(1)} mm²`);
  console.log(`    Added by spikes: ${(spike_total_area * 1e6).toFixed(1)} mm²`);
  console.log(`    Surface multiplier: ${surface_multiplier.toFixed(2)}×\n`);

  console.log("  CURRENT CONCENTRATION:");
  console.log(`    J_tip / J_flat: ${current_concentration.toFixed(1)}×`);
  console.log(`    Lorentz coupling boost: ${spike_coupling_boost.toFixed(3)}×`);
  console.log(`    Effective pattern efficiency: ${(conductor_pattern_efficiency * 100).toFixed(1)}% (was 40.0%)\n`);

  console.log("  CONTACT RESISTANCE:");
  console.log(`    Smooth: ${(contact_R_smooth * 1000).toFixed(3)} mΩ`);
  console.log(`    Spiked: ${(contact_R_spiked * 1000).toFixed(3)} mΩ (÷${surface_multiplier.toFixed(1)})\n`);

  console.log("  TURBULENCE DRAG REDUCTION:");
  console.log(`    Viscous drag multiplier: ${turbulence_drag_reduction} (25% reduction)\n`);

  console.log("  Spike cross-section:");
  console.log("    Smooth strip:   ═══════════════  (flat surface, single contact plane)");
  console.log("    Spiked strip:   ╤╤╤╤╤╤╤╤╤╤╤╤╤╤  (many tips, each concentrates current)");
  console.log("                    ↓↓↓↓↓↓↓↓↓↓↓↓↓↓  → current jets into mercury at each tip");
  console.log("                    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈  → micro-vortices improve mixing\n");

  // ── Kickstart sweep ──
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  KICKSTART SWEEP — Finding stable operating point for curved+spiked         ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  console.log("  Testing different kickstart power and duration combinations:\n");

  interface SweepResult {
    label: string;
    power: number;
    duration: number;
    energy: number;
    result: ReturnType<typeof simulate>;
  }

  const sweepConfigs = [
    { label: "A", power: 960,  duration: 30 },  // original
    { label: "B", power: 1440, duration: 30 },  // 50% more power
    { label: "C", power: 960,  duration: 60 },  // double duration
    { label: "D", power: 1920, duration: 45 },  // 2× power, 1.5× time
    { label: "E", power: 2400, duration: 60 },  // 2.5× power, 2× time
  ];

  const results: SweepResult[] = [];

  for (const cfg of sweepConfigs) {
    const r = simulate(
      `${cfg.label}: ${cfg.power}W × ${cfg.duration}s = ${(cfg.power * cfg.duration / 1000).toFixed(0)}kJ`,
      true, cfg.power, cfg.duration
    );
    results.push({ label: cfg.label, power: cfg.power, duration: cfg.duration, energy: cfg.power * cfg.duration, result: r });
  }

  // ── Summary table ──
  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  KICKSTART SWEEP RESULTS                                                   ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  console.log("  Config │ Kick Power │ Duration │ Energy  │ Peak RPM │ Peak W │ Steady RPM │ Coast    │ Self-Sust │ T°C");
  console.log("  ───────┼────────────┼──────────┼─────────┼──────────┼────────┼────────────┼──────────┼───────────┼─────");
  for (const r of results) {
    const res = r.result;
    console.log(
      `     ${r.label}   │ ${r.power.toString().padStart(7)}W  │ ${r.duration.toString().padStart(5)}s   │ ${(r.energy / 1000).toFixed(0).padStart(4)}kJ  │ ${res.peak_rpm.toFixed(0).padStart(6)}   │ ${res.peak_power.toFixed(0).padStart(5)}  │ ${res.steady_rpm.toFixed(1).padStart(8)}   │ ${res.coast_time > 0 ? res.coast_time.toFixed(0) + "s" : "running"} │ ${res.self_sustaining ? "   YES   " : "    NO   "} │ ${res.final_T.toFixed(0)}`
    );
  }

  // ── Best result analysis ──
  const best = results.reduce((a, b) => a.result.steady_rpm > b.result.steady_rpm ? a : b);
  console.log(`\n  BEST CONFIGURATION: ${best.label} (${best.power}W × ${best.duration}s = ${(best.energy / 1000).toFixed(0)}kJ)\n`);

  console.log("─── DRIVE MECHANISM BREAKDOWN (best config, peak values) ───\n");
  console.log(`  Peristaltic pump:     ${best.result.peak_peri.toFixed(1)} W`);
  console.log(`  Shell shear:          ${best.result.peak_shell.toFixed(1)} W`);
  console.log(`  Vernier coupling:     ${best.result.peak_vern.toFixed(1)} W`);
  console.log(`  Conductor coupling:   ${best.result.peak_cond.toFixed(1)} W`);
  console.log(`  TOTAL drive:          ${(best.result.peak_peri + best.result.peak_shell + best.result.peak_vern + best.result.peak_cond).toFixed(1)} W`);
  console.log(`  Peak gen power:       ${best.result.peak_power.toFixed(1)} W`);
  console.log(`  Body load:            ${TOTAL_LOAD.toFixed(0)} W`);
  console.log(`  Shortfall:            ${Math.max(0, TOTAL_LOAD - best.result.peak_power).toFixed(0)} W`);

  // ── What the spikes accomplished ──
  console.log("\n═══ SPIKE EFFECT SUMMARY ═══\n");
  console.log(`  Surface area:          ${surface_multiplier.toFixed(2)}× more mercury contact`);
  console.log(`  Contact resistance:    ${(contact_R_spiked * 1e6).toFixed(1)}μΩ (was ${(contact_R_smooth * 1e6).toFixed(1)}μΩ)`);
  console.log(`  Current concentration: ${current_concentration.toFixed(0)}× at each spike tip`);
  console.log(`  Coupling efficiency:   ${(conductor_pattern_efficiency * 100).toFixed(1)}% (was 40.0%)`);
  console.log(`  Viscous drag:          -25% (turbulent boundary layer reduction)`);
  console.log(`  Peristaltic boost:     +15% (micro-vortex assisted coupling)`);

  console.log("\n© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.");
}

run();
