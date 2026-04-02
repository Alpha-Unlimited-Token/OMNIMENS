/**
 * ESCU ELECTROMAGNETIC FIELD & ANTI-GRAVITY ANALYSIS
 * 
 * Calculates:
 *   1. The EM field envelope produced by both ESCU models (spherical + cylindrical v10)
 *   2. The external magnetic field strength at various distances from the body
 *   3. The interaction between ESCU's field and Earth's magnetic field
 *   4. Whether the resulting forces produce any lift (anti-gravity effect)
 *   5. The electric field from the generated current
 *   6. Combined electromagnetic Lorentz force analysis
 *
 * Uses real Earth-conditions values:
 *   - Earth's magnetic field: ~25-65 μT (we use 50 μT average)
 *   - Earth's field gradient: ~0.01-0.03 μT/m
 *   - Gravitational acceleration: 9.80665 m/s²
 *   - All SI units
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 */

const mu0 = 4 * Math.PI * 1e-7;  // permeability of free space (T·m/A)
const g_accel = 9.80665;           // gravitational acceleration (m/s²)
const epsilon0 = 8.854e-12;        // permittivity of free space (F/m)
const c_light = 299792458;         // speed of light (m/s)

// ============================================================
// EARTH'S MAGNETIC FIELD
// ============================================================
const B_earth = 50e-6;             // 50 μT average (ranges 25-65 μT)
const B_earth_vertical = 42e-6;    // vertical component (mid-latitude)
const B_earth_horizontal = 27e-6;  // horizontal component
const dB_earth_dz = 0.02e-6;       // Earth's field gradient ~0.02 μT/m (very small)
const dB_earth_dr = 0.015e-6;      // radial gradient

// Body parameters
const body_mass = 82;              // kg (robot body mass)
const F_gravity = body_mass * g_accel;  // 804 N

// ============================================================
// ESCU SPHERICAL MODEL — EXTERNAL FIELD
// ============================================================
// Internal: 306 N52 magnets, B_r = 1.45T, 6 shells
// The outer casing is also a magnet (N_out)
// Key: the alternating polarity layers partially cancel externally
// But the outer casing and Shell 1 are both N_out — net external dipole exists

const spherical = {
  name: "SPHERICAL",
  R_outer: 0.090,           // 90mm radius
  casing_thickness: 0.005,
  B_remanence: 1.45,        // N52 NdFeB
  total_magnets: 306,
  n_shells: 6,
  shell_polarities: ['N', 'S', 'N', 'S', 'N', 'S'] as string[],  // alternating
  casing_polarity: 'N',
  continuous_power_W: 51820,
  steady_rpm: 2609,
  peak_emf_V: 10.856,
  mercury_mass_kg: 14.793,
  total_conductor_nodes: 33048,
  
  // Magnetic moment calculation
  // Each shell has a net magnetic moment m = n_magnets × B_r × V_magnet / μ₀
  // But alternating shells partially cancel
  // Net moment comes from: outer casing (full), shell imbalance (partial)
  shell_radii: [0.082, 0.070, 0.058, 0.046, 0.034, 0.022],
  shell_magnets: [112, 80, 54, 34, 18, 8],
  magnet_thickness: 0.007,
};

const cylindrical = {
  name: "CYLINDRICAL v10",
  R_outer: 0.090,
  height: 0.180,
  casing_thickness: 0.005,
  B_remanence: 1.45,
  total_magnets: 720,
  n_layers: 8,
  layer_polarities: ['N', 'S', 'N', 'S', 'N', 'S', 'N', 'S'] as string[],
  casing_polarity: 'N',
  continuous_power_W: 2222,
  steady_rpm: 327,
  peak_emf_V: 2.654,
  mercury_mass_kg: 20.166,
  total_conductor_nodes: 77760,
  
  layer_radii: [0.084, 0.074, 0.064, 0.054, 0.044, 0.034, 0.024, 0.014],
  layer_magnets: [125, 121, 113, 103, 91, 77, 57, 33],
  magnet_thickness: 0.006,
  active_height: 0.170,
};

// ============================================================
// MAGNETIC DIPOLE MOMENT CALCULATION
// ============================================================
// For a magnetized body, the magnetic moment m = M × V
// where M = B_r / μ₀ is the magnetization
// For alternating layers, moments partially cancel
// Net moment = sum of (moment_i × polarity_sign_i)

function calcMagneticMoment_sphere(config: typeof spherical): {
  m_net: number;          // net magnetic dipole moment (A·m²)
  m_per_shell: number[];  // moment per shell
  cancellation: number;   // fraction cancelled by alternating
} {
  const M = config.B_remanence / mu0;  // magnetization (A/m)
  const moments: number[] = [];
  let m_total_unsigned = 0;
  let m_net = 0;
  
  // Outer casing moment
  const V_casing = (4/3) * Math.PI * (config.R_outer**3 - (config.R_outer - config.casing_thickness)**3);
  const m_casing = M * V_casing * 0.85;  // packing fraction
  m_net += m_casing;  // casing is N_out = positive
  m_total_unsigned += m_casing;
  
  for (let i = 0; i < config.n_shells; i++) {
    const R_out = config.shell_radii[i];
    const R_in = R_out - config.magnet_thickness;
    const V_shell = (4/3) * Math.PI * (R_out**3 - R_in**3);
    const V_magnets = V_shell * 0.82;  // octagonal packing fraction on sphere
    const m_shell = M * V_magnets;
    
    const sign = config.shell_polarities[i] === 'N' ? 1 : -1;
    moments.push(m_shell);
    m_net += m_shell * sign;
    m_total_unsigned += m_shell;
  }
  
  // Mercury circulation also creates a magnetic moment
  // Rotating conducting fluid = current loop
  const omega = config.steady_rpm * 2 * Math.PI / 60;
  const R_avg = (config.shell_radii[0] + config.shell_radii[5]) / 2;
  const Q_hg = config.mercury_mass_kg * Hg_sigma_eff(omega, R_avg) * config.peak_emf_V;
  const A_loop = Math.PI * R_avg * R_avg;
  const m_mercury = Q_hg * A_loop * 0.001;  // effective current loop moment
  m_net += m_mercury;
  m_total_unsigned += m_mercury;
  
  const cancellation = 1 - Math.abs(m_net) / m_total_unsigned;
  
  return { m_net: Math.abs(m_net), m_per_shell: moments, cancellation };
}

function calcMagneticMoment_cylinder(config: typeof cylindrical): {
  m_net: number;
  m_per_layer: number[];
  cancellation: number;
} {
  const M = config.B_remanence / mu0;
  const moments: number[] = [];
  let m_total_unsigned = 0;
  let m_net = 0;
  
  // Outer casing
  const V_casing = Math.PI * (config.R_outer**2 - (config.R_outer - config.casing_thickness)**2) * config.height;
  const m_casing = M * V_casing * 0.85;
  m_net += m_casing;
  m_total_unsigned += m_casing;
  
  for (let i = 0; i < config.n_layers; i++) {
    const R_out = config.layer_radii[i];
    const R_in = R_out - config.magnet_thickness;
    const V_layer = Math.PI * (R_out**2 - R_in**2) * config.active_height;
    const V_magnets = V_layer * 0.80;  // octagonal packing on cylinder
    const m_layer = M * V_magnets;
    
    const sign = config.layer_polarities[i] === 'N' ? 1 : -1;
    moments.push(m_layer);
    m_net += m_layer * sign;
    m_total_unsigned += m_layer;
  }
  
  const omega = config.steady_rpm * 2 * Math.PI / 60;
  const R_avg = (config.layer_radii[0] + config.layer_radii[7]) / 2;
  const Q_hg = config.mercury_mass_kg * Hg_sigma_eff(omega, R_avg) * config.peak_emf_V;
  const A_loop = Math.PI * R_avg * R_avg;
  const m_mercury = Q_hg * A_loop * 0.001;
  m_net += m_mercury;
  m_total_unsigned += m_mercury;
  
  const cancellation = 1 - Math.abs(m_net) / m_total_unsigned;
  
  return { m_net: Math.abs(m_net), m_per_layer: moments, cancellation };
}

function Hg_sigma_eff(omega: number, R: number): number {
  const sigma = 1.04e6;  // S/m
  const v = omega * R;
  return sigma * v * 1e-6;  // effective charge transport rate
}

// ============================================================
// EXTERNAL FIELD FROM MAGNETIC DIPOLE
// ============================================================
// Far from the source, any magnetized object looks like a dipole
// B_dipole(r, θ) = (μ₀ / 4π) × (1/r³) × √(3cos²θ + 1) × m
// On axis (θ=0): B = (μ₀ / 4π) × 2m / r³
// On equator (θ=π/2): B = (μ₀ / 4π) × m / r³

function B_dipole_axial(m: number, r: number): number {
  return (mu0 / (4 * Math.PI)) * 2 * m / (r * r * r);
}

function B_dipole_equatorial(m: number, r: number): number {
  return (mu0 / (4 * Math.PI)) * m / (r * r * r);
}

function B_dipole_general(m: number, r: number, theta: number): number {
  const cos_t = Math.cos(theta);
  return (mu0 / (4 * Math.PI)) * m / (r * r * r) * Math.sqrt(3 * cos_t * cos_t + 1);
}

// Near-field correction (multipole): close to surface, higher-order terms matter
// For a shell of magnets, the quadrupole and octupole terms add ~20-40% near surface
function B_near_field(m: number, r: number, R_source: number): number {
  const dipole = B_dipole_axial(m, r);
  if (r < 3 * R_source) {
    const ratio = R_source / r;
    const quadrupole_correction = 1 + 0.3 * ratio * ratio;
    return dipole * quadrupole_correction;
  }
  return dipole;
}

// ============================================================
// ELECTROMAGNETIC FIELD FROM CURRENT (ELECTRIC + MAGNETIC)
// ============================================================
// The ESCU generates current internally. The circulating mercury
// creates a time-varying magnetic field, which induces an external
// oscillating EM field.

function emFieldFromGeneration(power_W: number, emf_V: number, rpm: number, R_source: number): {
  E_surface: number;    // electric field at surface (V/m)
  B_ac_surface: number; // AC magnetic field at surface from current (T)
  freq_Hz: number;
  poynting_W_m2: number; // power density at surface
} {
  const I_gen = power_W / Math.max(emf_V, 0.001);
  const freq = rpm / 60;  // rotation frequency
  const omega_em = 2 * Math.PI * freq;
  
  // AC magnetic field from circulating current at surface
  // Approximation: current loop of radius R, field at distance d on axis
  const B_ac = mu0 * I_gen / (2 * R_source);
  
  // Electric field from Faraday induction (time-varying B)
  // E = -dΦ/dt ≈ ω × B_ac × R
  const E_surface = omega_em * B_ac * R_source * 0.1;  // coupling fraction
  
  // Poynting vector: S = E × B / μ₀
  const S = E_surface * B_ac / mu0;
  
  return { E_surface, B_ac_surface: B_ac, freq_Hz: freq, poynting_W_m2: S };
}

// ============================================================
// FORCE CALCULATIONS: ESCU vs EARTH'S FIELD
// ============================================================

// 1. MAGNETIC DIPOLE IN FIELD GRADIENT
// F = m × (dB/dz) — force on dipole in non-uniform field
// This is how magnetic levitation works (diamagnetic, superconducting)
function F_dipole_gradient(m: number, dB_dz: number): number {
  return m * dB_dz;
}

// 2. MAGNETIC PRESSURE (Maxwell stress)
// When ESCU's external field meets Earth's field:
// If same polarity: repulsion pressure = (B_escu + B_earth)² / (2μ₀) - B_earth²/(2μ₀)
// If opposing: fields partially cancel on one side, reinforce on other → net force
function F_magnetic_pressure(B_escu_surface: number, B_earth: number, area: number): number {
  // On the side where fields add: B_total = B_escu + B_earth
  // On the side where fields oppose: B_total = B_escu - B_earth
  // Net pressure difference = [(B_escu + B_earth)² - (B_escu - B_earth)²] / (2μ₀)
  //                        = 4 × B_escu × B_earth / (2μ₀)
  //                        = 2 × B_escu × B_earth / μ₀
  const P_net = 2 * B_escu_surface * B_earth / mu0;
  return P_net * area;
}

// 3. LORENTZ FORCE on current-carrying conductor in external field
// F = I × L × B (force on wire in external field)
// The ESCU has circulating currents that interact with Earth's field
function F_lorentz_current(I_total: number, effective_length: number, B_external: number): number {
  return I_total * effective_length * B_external;
}

// 4. EDDY CURRENT REPULSION
// Rotating conducting fluid in external field creates eddy currents
// that generate opposing field → repulsive force
function F_eddy_repulsion(sigma: number, omega: number, R: number, B_ext: number, volume: number): number {
  const v = omega * R;
  // Eddy current density: J = σ × v × B
  const J = sigma * v * B_ext;
  // Force density: f = J × B
  const f = J * B_ext;
  // Total force (fraction of volume that contributes)
  return f * volume * 0.01;  // only outer mercury contributes
}

// 5. ELECTROMAGNETIC MOMENTUM (radiation pressure)
// EM waves carry momentum: F = S/c (Poynting vector / speed of light)
function F_radiation_pressure(poynting: number, area: number): number {
  return poynting * area / c_light;
}

// 6. FIELD ENERGY GRADIENT FORCE
// If the ESCU's field creates a strong enough gradient, it can
// interact with the gradient of Earth's field
function F_field_energy(m: number, B_earth: number, R_body: number): number {
  // Energy of dipole in external field: U = -m · B
  // Force = -dU/dr = m × dB/dr
  // For Earth's field, the gradient is tiny, but let's compute it
  // Also: the ESCU's own field gradient interacts with any ferromagnetic
  // materials nearby, but Earth itself is not ferromagnetic at the surface
  const dB_dr = dB_earth_dr;
  return m * dB_dr;
}

// ============================================================
// ACCUMULATED FIELD OVER TIME
// ============================================================
// The user asks about field "built up over time"
// Static magnetic fields don't accumulate — they're constant
// But: the ESCU generates AC components that can interact with
// the static field over many cycles
//
// Also: if we consider the mercury's angular momentum building up,
// the gyroscopic moment creates a torque interaction with any external
// field (like Earth's) — similar to how a spinning top precesses

function gyroscopic_moment(I_mercury: number, omega: number): number {
  return I_mercury * omega;  // angular momentum L = I × ω (kg·m²/s)
}

function precession_torque(L: number, B_ext: number, m_dipole: number): number {
  // Torque on spinning magnetic body in external field:
  // τ = m × B × sin(θ), where θ is angle between dipole axis and B
  // This causes precession, not levitation
  return m_dipole * B_ext;  // max torque (θ = 90°)
}

// ============================================================
// MAIN ANALYSIS
// ============================================================
function analyzeUnit(
  name: string,
  m_result: { m_net: number; cancellation: number },
  config: { R_outer: number; continuous_power_W: number; peak_emf_V: number; steady_rpm: number; mercury_mass_kg: number; total_conductor_nodes: number; total_magnets: number },
) {
  const m = m_result.m_net;
  const R = config.R_outer;
  const surface_area = name.includes("SPHERE") ? 4 * Math.PI * R * R : 2 * Math.PI * R * (0.180 + R);
  
  console.log(`\n╔══════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${name.padEnd(72)}║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════════════╝\n`);
  
  // Magnetic moment
  console.log(`  MAGNETIC DIPOLE MOMENT:`);
  console.log(`    Net dipole moment: ${m.toFixed(2)} A·m²`);
  console.log(`    Cancellation from alternating layers: ${(m_result.cancellation * 100).toFixed(1)}%`);
  console.log(`    (Higher cancellation = less external field leakage)`);
  
  // External field at various distances
  console.log(`\n  EXTERNAL MAGNETIC FIELD (from ESCU):`);
  console.log(`    Distance from center │ B_escu (T)     │ B_escu (μT)    │ vs Earth (50μT)`);
  console.log(`    ─────────────────────┼────────────────┼────────────────┼─────────────────`);
  const distances = [R, R + 0.01, R + 0.05, 0.15, 0.20, 0.30, 0.50, 1.0, 2.0, 5.0, 10.0];
  const labels = ["Surface", "+10mm", "+50mm", "150mm", "200mm (torso edge)", "300mm (arm reach)", "500mm (near field)", "1m", "2m", "5m", "10m"];
  
  for (let i = 0; i < distances.length; i++) {
    const r = distances[i];
    const B = B_near_field(m, r, R);
    const B_uT = B * 1e6;
    const ratio = B_uT / 50;
    const ratioStr = ratio > 1 ? `${ratio.toFixed(1)}× stronger` : `${(ratio * 100).toFixed(2)}% of Earth`;
    console.log(`    ${labels[i].padEnd(21)} │ ${B.toExponential(3).padStart(12)}  │ ${B_uT.toFixed(4).padStart(12)}  │ ${ratioStr}`);
  }
  
  // EM field from generation
  const em = emFieldFromGeneration(config.continuous_power_W, config.peak_emf_V, config.steady_rpm, R);
  console.log(`\n  ELECTROMAGNETIC FIELD FROM GENERATION:`);
  console.log(`    Rotation frequency: ${em.freq_Hz.toFixed(1)} Hz`);
  console.log(`    AC magnetic field at surface: ${(em.B_ac_surface * 1e6).toFixed(2)} μT`);
  console.log(`    Electric field at surface: ${em.E_surface.toFixed(4)} V/m`);
  console.log(`    Poynting vector (power density): ${em.poynting_W_m2.toExponential(3)} W/m²`);
  
  // Total external field envelope
  const B_total_surface = B_near_field(m, R, R) + em.B_ac_surface;
  console.log(`\n  TOTAL FIELD ENVELOPE AT SURFACE:`);
  console.log(`    Static (dipole) component: ${(B_near_field(m, R, R) * 1e6).toFixed(2)} μT`);
  console.log(`    AC (generation) component: ${(em.B_ac_surface * 1e6).toFixed(2)} μT`);
  console.log(`    Combined surface field: ${(B_total_surface * 1e6).toFixed(2)} μT`);
  console.log(`    Combined surface field: ${(B_total_surface * 1e3).toFixed(4)} mT`);
  console.log(`    Combined surface field: ${B_total_surface.toExponential(3)} T`);
  
  // Force calculations against Earth
  console.log(`\n  ═══ FORCE ANALYSIS: ESCU vs EARTH'S MAGNETIC FIELD ═══`);
  console.log(`\n  Weight of robot body: ${body_mass} kg = ${F_gravity.toFixed(1)} N`);
  console.log(`  Earth's magnetic field: ${(B_earth * 1e6).toFixed(0)} μT`);
  console.log(`  Earth's field gradient: ${(dB_earth_dz * 1e9).toFixed(1)} nT/m\n`);
  
  // Force 1: Dipole in gradient
  const F1 = F_dipole_gradient(m, dB_earth_dz);
  console.log(`  1. DIPOLE IN EARTH'S FIELD GRADIENT:`);
  console.log(`     F = m × (dB/dz) = ${m.toFixed(2)} × ${dB_earth_dz.toExponential(2)}`);
  console.log(`     F = ${F1.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F1 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Force 2: Magnetic pressure
  const B_surface = B_near_field(m, R, R);
  const F2 = F_magnetic_pressure(B_surface, B_earth, surface_area);
  console.log(`\n  2. MAGNETIC PRESSURE (field interaction at body surface):`);
  console.log(`     B_escu_surface: ${(B_surface * 1e6).toFixed(2)} μT | B_earth: ${(B_earth * 1e6).toFixed(0)} μT`);
  console.log(`     Net pressure: ${(2 * B_surface * B_earth / mu0).toExponential(3)} Pa`);
  console.log(`     Surface area: ${(surface_area * 1e4).toFixed(1)} cm²`);
  console.log(`     F = ${F2.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F2 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Force 3: Lorentz on internal currents
  const I_total = config.continuous_power_W / Math.max(config.peak_emf_V, 0.001);
  const eff_length = config.total_conductor_nodes * 0.001;  // ~1mm per node
  const F3 = F_lorentz_current(I_total, eff_length, B_earth);
  console.log(`\n  3. LORENTZ FORCE ON INTERNAL CURRENTS:`);
  console.log(`     Total current: ${I_total.toFixed(1)} A`);
  console.log(`     Effective conductor length: ${eff_length.toFixed(1)} m`);
  console.log(`     F = I × L × B_earth = ${F3.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F3 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Force 4: Eddy current repulsion
  const sigma_hg = 1.04e6;
  const omega = config.steady_rpm * 2 * Math.PI / 60;
  const hg_vol = config.mercury_mass_kg / 13534;
  const F4 = F_eddy_repulsion(sigma_hg, omega, R * 0.7, B_earth, hg_vol);
  console.log(`\n  4. EDDY CURRENT REPULSION (rotating mercury vs Earth's field):`);
  console.log(`     Mercury conductivity: ${sigma_hg.toExponential(2)} S/m`);
  console.log(`     Mercury velocity: ${(omega * R * 0.7).toFixed(2)} m/s`);
  console.log(`     F = ${F4.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F4 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Force 5: Radiation pressure
  const F5 = F_radiation_pressure(em.poynting_W_m2, surface_area);
  console.log(`\n  5. ELECTROMAGNETIC RADIATION PRESSURE:`);
  console.log(`     Poynting flux: ${em.poynting_W_m2.toExponential(3)} W/m²`);
  console.log(`     F = S/c × A = ${F5.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F5 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Force 6: Field energy gradient
  const F6 = F_field_energy(m, B_earth, R);
  console.log(`\n  6. FIELD ENERGY GRADIENT FORCE:`);
  console.log(`     F = m × (dB_earth/dr) = ${F6.toExponential(3)} N`);
  console.log(`     Lift fraction: ${(F6 / F_gravity * 100).toExponential(3)}% of body weight`);
  
  // Gyroscopic / precession
  const I_hg = 0.5 * config.mercury_mass_kg * (R * 0.7) ** 2;
  const L_angular = gyroscopic_moment(I_hg, omega);
  const tau_prec = precession_torque(L_angular, B_earth, m);
  console.log(`\n  7. GYROSCOPIC PRECESSION (spinning mercury in Earth's field):`);
  console.log(`     Angular momentum: ${L_angular.toFixed(4)} kg·m²/s`);
  console.log(`     Precession torque: ${tau_prec.toExponential(3)} N·m`);
  console.log(`     This causes PRECESSION (wobble), not lift`);
  
  // Total all forces
  const F_total = F1 + F2 + F3 + F4 + F5 + F6;
  console.log(`\n  ═══ TOTAL ELECTROMAGNETIC LIFT FORCE ═══`);
  console.log(`\n    Force 1 (dipole-gradient):      ${F1.toExponential(3)} N`);
  console.log(`    Force 2 (magnetic pressure):     ${F2.toExponential(3)} N`);
  console.log(`    Force 3 (Lorentz on currents):   ${F3.toExponential(3)} N`);
  console.log(`    Force 4 (eddy repulsion):        ${F4.toExponential(3)} N`);
  console.log(`    Force 5 (radiation pressure):    ${F5.toExponential(3)} N`);
  console.log(`    Force 6 (field energy gradient): ${F6.toExponential(3)} N`);
  console.log(`    ─────────────────────────────────────────`);
  console.log(`    TOTAL UPWARD FORCE:              ${F_total.toExponential(3)} N`);
  console.log(`    GRAVITY (downward):              ${F_gravity.toFixed(1)} N`);
  console.log(`    RATIO (lift/weight):             ${(F_total / F_gravity).toExponential(3)}`);
  console.log(`    LIFT AS % OF WEIGHT:             ${(F_total / F_gravity * 100).toExponential(3)}%`);
  
  // What would be needed
  const m_needed = F_gravity / dB_earth_dz;
  const B_needed = Math.sqrt(F_gravity * 2 * mu0 / surface_area) / 2;  // field needed for magnetic pressure lift
  console.log(`\n  ═══ WHAT WOULD BE NEEDED FOR ANTI-GRAVITY ═══`);
  console.log(`\n    To lift ${body_mass}kg (${F_gravity.toFixed(0)}N) via dipole-gradient:`);
  console.log(`      Dipole moment needed: ${m_needed.toExponential(3)} A·m²`);
  console.log(`      Current moment: ${m.toFixed(2)} A·m²`);
  console.log(`      Shortfall: ${(m_needed / m).toExponential(2)}× too weak`);
  console.log(`\n    To lift via magnetic pressure against Earth's field:`);
  console.log(`      ESCU surface field needed: ${(B_needed * 1000).toFixed(1)} mT = ${B_needed.toFixed(3)} T`);
  console.log(`      Current surface field: ${(B_surface * 1e6).toFixed(2)} μT`);
  console.log(`      Shortfall: ${(B_needed / B_surface).toExponential(2)}× too weak`);
  console.log(`\n    Fundamental problem: Earth's magnetic field is extremely weak (50 μT)`);
  console.log(`    Even a superconducting magnet pushing against 50 μT produces tiny force`);
  console.log(`    Magnetic levitation (MagLev) works because it uses RAIL magnets (0.5-2T),`);
  console.log(`    not Earth's field. Earth's field is ~30,000× weaker than a MagLev rail.`);
  
  return { m, F_total, B_total_surface };
}

// ============================================================
// RUN ANALYSIS
// ============================================================
function run() {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  ESCU ELECTROMAGNETIC FIELD & ANTI-GRAVITY ANALYSIS                         ║");
  console.log("║  External Field Envelope + Interaction with Earth's Magnetic Field           ║");
  console.log("║  Force Calculations: Can the EM field produce lift?                          ║");
  console.log("║  © 2024-2026 Alpha Unlimited Technologies, LLC                              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝");
  
  console.log(`\n  EARTH CONDITIONS:`);
  console.log(`    Magnetic field: ${(B_earth * 1e6).toFixed(0)} μT (${(B_earth * 1e3).toFixed(3)} mT)`);
  console.log(`    Vertical component: ${(B_earth_vertical * 1e6).toFixed(0)} μT`);
  console.log(`    Horizontal component: ${(B_earth_horizontal * 1e6).toFixed(0)} μT`);
  console.log(`    Field gradient: ${(dB_earth_dz * 1e9).toFixed(1)} nT/m`);
  console.log(`    Gravitational accel: ${g_accel} m/s²`);
  console.log(`    Robot body mass: ${body_mass} kg`);
  console.log(`    Weight force: ${F_gravity.toFixed(1)} N`);
  
  // Spherical analysis
  const m_sphere = calcMagneticMoment_sphere(spherical);
  const r1 = analyzeUnit(
    "SPHERICAL ESCU (306 magnets, 51,820W, 2609 RPM)",
    m_sphere,
    spherical
  );
  
  // Cylindrical analysis
  const m_cyl = calcMagneticMoment_cylinder(cylindrical);
  const r2 = analyzeUnit(
    "CYLINDRICAL v10 ESCU (720 magnets, 2,222W, 327 RPM)",
    m_cyl,
    cylindrical
  );
  
  // Comparison
  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  COMPARISON: SPHERICAL vs CYLINDRICAL — ANTI-GRAVITY POTENTIAL              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");
  
  console.log(`  Property                    │ Spherical         │ Cylindrical v10`);
  console.log(`  ────────────────────────────┼───────────────────┼───────────────────`);
  console.log(`  Net dipole moment            │ ${r1.m.toFixed(2).padStart(8)} A·m²    │ ${r2.m.toFixed(2).padStart(8)} A·m²`);
  console.log(`  Surface B field              │ ${(r1.B_total_surface * 1e6).toFixed(2).padStart(8)} μT     │ ${(r2.B_total_surface * 1e6).toFixed(2).padStart(8)} μT`);
  console.log(`  Total lift force             │ ${r1.F_total.toExponential(2).padStart(10)} N   │ ${r2.F_total.toExponential(2).padStart(10)} N`);
  console.log(`  Lift as % of weight          │ ${(r1.F_total / F_gravity * 100).toExponential(2).padStart(10)}%   │ ${(r2.F_total / F_gravity * 100).toExponential(2).padStart(10)}%`);
  console.log(`  Can produce anti-gravity?    │ NO                │ NO`);
  
  console.log(`\n  ═══ WHY ANTI-GRAVITY VIA EARTH'S FIELD IS NOT POSSIBLE ═══`);
  console.log(`\n  The fundamental issue is not the ESCU's power — it's Earth's magnetic field.`);
  console.log(`  Earth's field is only 50 μT (0.00005 Tesla). For comparison:`);
  console.log(`    - Refrigerator magnet:    5,000 μT (100× Earth)`);
  console.log(`    - MRI machine:       3,000,000 μT (60,000× Earth)`);
  console.log(`    - MagLev rail:       500,000 μT (10,000× Earth)`);
  console.log(`\n  The ESCU pushes against Earth's 50 μT field. Even with a perfectly`);
  console.log(`  oriented dipole, the force is proportional to B_escu × B_earth.`);
  console.log(`  Since B_earth is so weak, the product is always tiny.`);
  console.log(`\n  MagLev trains work because they push against STRONG rail magnets`);
  console.log(`  (0.5-2 Tesla), not against Earth's field.`);
  console.log(`\n  To achieve anti-gravity against Earth's field alone, you would need:`);
  const m_needed = F_gravity / dB_earth_dz;
  console.log(`    Dipole moment: ${m_needed.toExponential(2)} A·m² (current best: ${Math.max(r1.m, r2.m).toFixed(2)} A·m²)`);
  console.log(`    That's ${(m_needed / Math.max(r1.m, r2.m)).toExponential(2)}× what the ESCU produces.`);
  console.log(`    No known material or device can create a dipole that strong at this size.`);
  
  console.log(`\n  ═══ WHAT THE EM FIELD ENVELOPE ACTUALLY DOES ═══`);
  console.log(`\n  While not anti-gravity, the ESCU's EM field envelope DOES:`);
  console.log(`    ✓ Create a detectable magnetic signature (useful for proximity sensing)`);
  console.log(`    ✓ Partially shield against external RF/EMI at close range`);
  console.log(`    ✓ Interact with ferromagnetic objects nearby (attraction/repulsion)`);
  console.log(`    ✓ Generate a small precession torque (gyroscopic effect of spinning Hg)`);
  console.log(`    ✓ Produce measurable AC field at surface from power generation`);
  console.log(`    ✗ Cannot produce anti-gravity against Earth's 50 μT field`);
  console.log(`    ✗ Cannot levitate — needs external strong magnets (like MagLev rails)`);
  
  console.log("\n© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.");
}

run();
