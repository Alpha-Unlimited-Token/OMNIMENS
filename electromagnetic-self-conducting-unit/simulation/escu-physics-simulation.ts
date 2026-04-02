/**
 * ESCU PHYSICS SIMULATION v2
 * Electromagnetic Self-Conducting Unit — Full Physics Model
 * Earth conditions, proper energy accounting, anti-gravity analysis
 * 
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 */

// ============================================================
// CONSTANTS
// ============================================================
const g = 9.80665;              // m/s²
const mu0 = 4 * Math.PI * 1e-7; // H/m permeability of free space
const ATM = 101325;             // Pa
const T_ambient = 20;           // °C

// ============================================================
// MERCURY
// ============================================================
const Hg = {
  density: 13534,               // kg/m³
  sigma: 1.04e6,                // S/m electrical conductivity
  rho_e: 9.615e-7,              // Ω·m resistivity
  mu_visc: 1.526e-3,            // Pa·s dynamic viscosity
  cp: 139.5,                    // J/(kg·K) specific heat
  k_therm: 8.3,                 // W/(m·K) thermal conductivity
  vol: 380e-6,                  // m³ (380 mL)
};
const Hg_mass = Hg.vol * Hg.density; // 5.143 kg

// ============================================================
// ESCU GEOMETRY (from master blueprint exactly)
// ============================================================
const R_disc = 0.048;           // m — disc radius (96mm diameter / 2)
const R_shaft = 0.0075;        // m — shaft radius (15mm / 2)
const disc_thick = 0.012;      // m — 12mm per disc
const gap = 0.008;             // m — 8mm mercury gap between layers
const N_layers = 5;
const N_gaps = 4;               // gaps between 5 layers
const N_strips = 8;             // tungsten strips per disc
const N_mag_seg = 16;           // magnet segments per disc (Halbach)
const strip_L = 0.040;         // m
const strip_W = 0.003;         // m
const strip_H = 0.002;         // m
const shell_OD = 0.100;        // m (100mm)
const shell_thick = 0.004;     // m
const core_H = 0.150;          // m
const total_H = 0.180;         // m
const total_OD = 0.120;        // m
const total_mass = 4.2;        // kg
const N_amfos = 24;
const amfos_dim = 0.008;       // m (8mm coils)

// N52 magnets
const B_remanence = 1.45;      // T
const halbach_gain = 1.4;      // Halbach focusing factor
// Effective field inside the active region
// Halbach cylindrical array: inner field ≈ Br * ln(Ro/Ri) * halbach_efficiency
// With 32 segments in a 4mm shell: Ro=48mm, Ri=44mm
// ln(48/44) = 0.0870, so theoretical B_inner = 1.45 * 0.087 * 1.4 ≈ 0.177T
// BUT the disc magnets ALSO contribute — each disc has its own Halbach array
// facing inward, and 5 layers create overlapping fields in the gaps.
// Conservative estimate from blueprint claim of 1.2-1.4T inner surface:
const B_shell = 1.3;           // T — from the cylindrical shell alone (blueprint spec)
// Each disc's Halbach array adds field into the gap
// Gap field = shell field + disc contributions (opposing poles compress flux)
const B_gap = 0.8;             // T — realistic gap field accounting for geometry
// The blueprint claims 1.2-1.4T at the shell inner surface, but the field
// in the mercury gap between disc layers is lower due to distance.
// At 8mm gap with 12mm thick magnet discs, field falls off significantly.
// Using a realistic mid-gap value.

// Kickstart
const V_kick = 48;             // V
const I_kick = 20;             // A
const P_kick = 960;            // W
const t_kick = 30;             // seconds

// ============================================================
// BODY POWER BUDGET (from blueprint + user: server = 240W)
// ============================================================
const load_server = 240;
const load_ai = 400;
const load_actuators = 1200;
const load_sensors = 100;
const load_comms = 100;
const load_amfos = 215;
const load_cooling = 100;
const load_reserve = 200;
const BODY_TOTAL = load_server + load_ai + load_actuators + load_sensors + load_comms + load_amfos + load_cooling + load_reserve;
const LOAD_MULT = 1.15; // 15% above average as requested
const TOTAL_LOAD = BODY_TOTAL * LOAD_MULT;

// ============================================================
// DERIVED QUANTITIES
// ============================================================
const gap_area = Math.PI * (R_disc * R_disc - R_shaft * R_shaft); // m² per gap
const active_vol = gap_area * gap * N_gaps; // m³ of mercury in active region
const I_mercury = 0.5 * Hg_mass * (R_disc * R_disc + R_shaft * R_shaft); // kg·m² moment of inertia

// Tungsten strip resistance
const R_strip = 5.28e-8 * strip_L / (strip_W * strip_H); // Ω per strip
const R_layer = R_strip / N_strips; // strips in parallel
const R_total_strips = R_layer * N_layers;

// Mercury path resistance (radial path through each gap)
const R_hg_gap = Hg.rho_e * (R_disc - R_shaft) / (gap * 2 * Math.PI * (R_disc + R_shaft) / 2);
const R_total_hg = R_hg_gap * N_gaps;

// Total internal electrical resistance
const R_internal = R_total_strips + R_total_hg;

// Magnet volume (shell)
const mag_vol_shell = Math.PI * ((shell_OD / 2) ** 2 - (shell_OD / 2 - shell_thick) ** 2) * core_H;
// Magnet volume (discs)
const mag_vol_disc = Math.PI * (R_disc ** 2 - R_shaft ** 2) * disc_thick * N_layers * 0.6; // 60% is magnet, 40% is conductor/structure
const mag_vol_total = mag_vol_shell + mag_vol_disc;

// Conductor volume
const cond_vol = strip_L * strip_W * strip_H * N_strips * N_layers;

// AMFOS coil parameters
const amfos_turns = 200;       // turns per coil (0.3mm wire on 8mm former)
const amfos_coil_area = amfos_dim * amfos_dim; // m²
const amfos_wire_length = amfos_turns * 4 * amfos_dim; // m per coil
const amfos_R = 1.68e-8 * amfos_wire_length / (Math.PI * (0.15e-3) ** 2); // Ω per coil (0.3mm dia copper)

// Thermal mass
const thermal_mass = Hg_mass * Hg.cp + (total_mass - Hg_mass) * 500; // J/K

// Cooling capacity
const cooling_W = 180; // W (saltwater jacket with 200cm² radiator + micropump)

// ============================================================
// SIMULATION
// ============================================================
function run() {
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  ESCU PHYSICS SIMULATION v2 — EARTH CONDITIONS — FACTS ONLY         ║");
  console.log("║  © 2024-2026 Alpha Unlimited Technologies, LLC                      ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("EARTH: g=9.81 m/s², P=101325 Pa, T=20°C\n");

  console.log("ESCU: 120mm×180mm, 4.2kg, 5 layers, 4 mercury gaps (8mm each)");
  console.log(`  Mercury: ${(Hg.vol * 1e6).toFixed(0)} mL, ${Hg_mass.toFixed(2)} kg`);
  console.log(`  B field (gap, realistic): ${B_gap.toFixed(2)} T`);
  console.log(`  B field (shell surface): ${B_shell.toFixed(2)} T`);
  console.log(`  Internal resistance: ${(R_internal * 1000).toFixed(4)} mΩ`);
  console.log(`  Moment of inertia: ${(I_mercury * 1e6).toFixed(2)} × 10⁻⁶ kg·m²\n`);

  console.log(`BODY LOAD: ${BODY_TOTAL}W base × ${LOAD_MULT} = ${TOTAL_LOAD.toFixed(0)}W`);
  console.log(`  Server: ${load_server}W | AI: ${load_ai}W | Actuators: ${load_actuators}W`);
  console.log(`  Sensors: ${load_sensors}W | Comms: ${load_comms}W | AMFOS: ${load_amfos}W`);
  console.log(`  Cooling: ${load_cooling}W | Reserve: ${load_reserve}W\n`);

  // Simulation parameters
  const dt = 0.01;             // 10ms timestep
  const t_total = 300;         // 5 minutes
  const steps = Math.floor(t_total / dt);

  let omega = 0;               // rad/s (angular velocity of mercury)
  let T = T_ambient;           // °C temperature
  let T_magnet = T_ambient;    // °C magnet temperature
  let KE = 0;                  // J kinetic energy of mercury
  let total_kickstart_E = 0;   // J total energy input from kickstart
  let self_sustaining = false;
  let t_first_induction = -1;
  let t_self_sustain = -1;
  let peak_power = 0;
  let peak_rpm = 0;
  let peak_emf = 0;
  let peak_current = 0;

  // Log at specific times
  const log_times = [0, 2, 5, 10, 15, 20, 25, 30, 31, 35, 40, 50, 60, 90, 120, 180, 240, 300];
  let log_idx = 0;

  console.log("─── TIME EVOLUTION ─────────────────────────────────────────────────────");
  console.log("  Time  |  Status    |   RPM   | Vel m/s |   EMF V  | Power W  | Losses W | Net W   | Temp °C");
  console.log("────────┼────────────┼─────────┼─────────┼──────────┼──────────┼──────────┼─────────┼────────");

  for (let step = 0; step < steps; step++) {
    const t = step * dt;

    // ── DRIVING TORQUE ──
    // During kickstart: AMFOS coils powered by external 48V/20A
    // After kickstart: whatever the system can feed back
    let P_drive = 0;
    let external = false;

    if (t <= t_kick) {
      external = true;
      // AMFOS creates rotating magnetic field
      // Effective torque on mercury from 24 coils in rotating field config
      // Power delivered to mercury = P_kick * coupling_efficiency
      // Coupling between AMFOS coils and mercury is imperfect
      const coupling_eff = 0.35; // 35% — realistic for air-gap coupled coils to liquid metal
      P_drive = P_kick * coupling_eff; // ~336W actually moves mercury
      total_kickstart_E += P_kick * dt;
    } else {
      external = false;
      // Self-driving: use fraction of generated power to feed AMFOS coils
      // This power comes FROM the mercury's kinetic energy via the generator
      // and is fed BACK to the AMFOS coils to maintain rotation.
      // The generator extracts KE → electricity → AMFOS → torque → KE
      // Each conversion has losses, so net is always less than input.
    }

    // ── ELECTROMAGNETIC GENERATION ──
    // Homopolar generator: EMF = ½ × B × ω × (R² - r²) per layer
    // With opposing rotation between adjacent layers, relative ω doubles
    const emf_per_layer = 0.5 * B_gap * omega * (R_disc ** 2 - R_shaft ** 2);
    // 4 interacting pairs, opposing rotation doubles relative velocity
    const emf_homopolar = emf_per_layer * 2 * N_gaps;

    // Faraday induction from tungsten strips cutting through field
    const v_tangential = omega * R_disc;
    const v_relative = v_tangential * 2; // opposing layers
    const emf_faraday_per_strip = B_gap * v_relative * strip_L;
    // Strips are in parallel within a layer, layers in series
    // But each strip generates same EMF, parallel strips = same voltage, more current
    const emf_faraday = emf_faraday_per_strip * N_layers;

    // Total EMF (these mechanisms overlap — don't double count)
    // The homopolar effect IS the Faraday effect for a disc geometry
    // Use the homopolar calculation as the primary (it's more accurate for disc geometry)
    // Add a small MHD contribution from mercury flow
    const mhd_emf = Hg.sigma > 0 ? B_gap * v_tangential * gap * 0.1 : 0; // small MHD term
    const total_emf = emf_homopolar + mhd_emf;

    // Current through circuit
    // Short-circuit current limited by internal resistance
    const I_sc = total_emf / R_internal;

    // With external load, current is less
    // Load resistance from body power: R_load = V²/P
    // But we need to figure out what voltage we're actually producing
    // and how much current flows to the load
    let I_gen = 0;
    let P_gen = 0;
    let V_terminal = 0;

    if (total_emf > 0.001) {
      // Maximum power transfer: R_load = R_internal → P_max = EMF²/(4R)
      // But we want specific load power, so:
      // P = EMF² / (4 * R_internal) is the absolute max extractable power
      const P_max_extract = (total_emf * total_emf) / (4 * R_internal);

      // The generated power is limited by P_max_extract
      P_gen = P_max_extract;
      I_gen = total_emf / (2 * R_internal); // at max power transfer point
      V_terminal = total_emf / 2; // terminal voltage at max power point
    }

    if (t_first_induction < 0 && P_gen > 0.1) t_first_induction = t;

    // ── SELF-FEEDBACK AFTER KICKSTART ──
    if (!external && P_gen > 0) {
      // Feed 20% of generated power back to AMFOS to maintain rotation
      const feedback_fraction = 0.20;
      const P_feedback = P_gen * feedback_fraction;
      // This power goes through AMFOS coils with coupling efficiency
      const amfos_coupling = 0.35;
      P_drive = P_feedback * amfos_coupling; // effective power driving mercury
      // The feedback power is already accounted for as extracted from KE
    }

    // ── LOSSES ──
    const freq = omega / (2 * Math.PI); // Hz

    // Eddy currents in conductors: P = (π²B²f²d²V)/(6ρ)
    const loss_eddy = (Math.PI ** 2 * B_gap ** 2 * freq ** 2 * strip_H ** 2 * cond_vol) / (6 * 5.28e-8);

    // Eddy currents in mercury itself (mercury is a conductor in changing B field)
    // Mercury eddy loss estimate: σ × (ΔB)² × V × f² × geometry_factor
    const dB_mercury = B_gap * 0.3; // field variation seen by mercury
    const loss_eddy_hg = Hg.sigma * dB_mercury ** 2 * active_vol * (freq > 0 ? freq : 0) * 1e-4;

    // Hysteresis in magnets: P = kh × f × B^1.6 × V
    const kh = 200; // W/(m³·Hz·T^1.6) for NdFeB
    const loss_hyst = kh * freq * Math.pow(B_gap, 1.6) * mag_vol_total;

    // Resistive I²R in conductors
    const loss_resistive = I_gen * I_gen * R_internal;

    // Viscous drag (Couette flow between rotating discs and stationary shell)
    // Torque = (π × μ × ω × (R⁴ - r⁴)) / (2 × h)
    // Power = Torque × ω
    const drag_torque = (Math.PI * Hg.mu_visc * omega * (R_disc ** 4 - R_shaft ** 4)) / (2 * gap) * N_gaps;
    const loss_viscous = drag_torque * omega;

    // Radiation loss (EM radiation from oscillating currents)
    const loss_radiation = P_gen * 0.005;

    // AMFOS coil I²R loss (when driving)
    const I_amfos = P_drive > 0 && omega > 0 ? Math.sqrt(P_drive / (N_amfos * amfos_R)) : 0;
    const loss_amfos_heat = I_amfos * I_amfos * amfos_R * N_amfos;

    const total_losses = loss_eddy + loss_eddy_hg + loss_hyst + loss_resistive + loss_viscous + loss_radiation + loss_amfos_heat;

    // ── ENERGY BALANCE ON MERCURY ──
    // Mercury kinetic energy: KE = ½Iω²
    // Power IN to mercury: P_drive (electromagnetic torque from AMFOS)
    // Power OUT of mercury: P_gen (extracted as electricity) + loss_viscous (friction)
    //                       + loss_eddy (slows mercury via Lenz's law)
    //                       + loss_eddy_hg (eddy braking in mercury)
    //
    // dKE/dt = P_drive - P_gen_extraction - loss_viscous - loss_eddy - loss_eddy_hg
    //
    // The electrical power extracted (P_gen) comes from braking the mercury.
    // The feedback power goes BACK to P_drive (with coupling losses).
    // So the NET extraction from mercury is:
    //   P_gen - P_drive (when self-running) + all friction/eddy losses

    let P_into_mercury = P_drive;
    let P_out_of_mercury = loss_viscous + loss_eddy + loss_eddy_hg;

    // Electrical extraction braking: when current flows, Lenz's law brakes mercury
    // The braking power = P_gen (this is WHERE the electrical power comes from)
    P_out_of_mercury += P_gen;

    const dKE_dt = P_into_mercury - P_out_of_mercury;

    KE = Math.max(0, KE + dKE_dt * dt);

    // Update omega from KE: KE = ½Iω², so ω = √(2KE/I)
    omega = Math.sqrt(2 * KE / I_mercury);

    // ── NET POWER AVAILABLE ──
    // After feedback, what's left for the body?
    let P_available = 0;
    if (!external) {
      const feedback_fraction = 0.20;
      P_available = P_gen * (1 - feedback_fraction) - loss_resistive - loss_hyst - loss_radiation - loss_amfos_heat;
      P_available = Math.max(0, P_available);
    } else {
      P_available = P_gen; // during kickstart, all generated power is surplus
    }

    const surplus = P_available - TOTAL_LOAD;

    // Self-sustaining check
    if (!external && P_available >= TOTAL_LOAD && !self_sustaining) {
      self_sustaining = true;
      t_self_sustain = t;
    }
    if (!external && omega < 1 && t > t_kick + 5) {
      self_sustaining = false;
    }

    // ── THERMAL ──
    const heat_in = total_losses;
    const heat_out = Math.min(cooling_W, heat_in + 50); // cooling can't remove more than it's rated for + margin
    T += ((heat_in - heat_out) * dt) / thermal_mass;
    T_magnet = T * 0.85 + T_ambient * 0.15; // magnets cooled by jacket

    // Track peaks
    if (P_gen > peak_power) peak_power = P_gen;
    if (omega * 60 / (2 * Math.PI) > peak_rpm) peak_rpm = omega * 60 / (2 * Math.PI);
    if (total_emf > peak_emf) peak_emf = total_emf;
    if (I_gen > peak_current) peak_current = I_gen;

    // ── LOG ──
    if (log_idx < log_times.length && t >= log_times[log_idx] - dt / 2) {
      const rpm = omega * 60 / (2 * Math.PI);
      const vel = omega * R_disc;
      const status = external ? "KICKSTART" : (self_sustaining ? "SELF-RUN " : (omega > 1 ? "COASTING " : "STOPPED  "));
      console.log(
        `  ${t.toFixed(0).padStart(5)}s | ${status} | ${rpm.toFixed(1).padStart(7)} | ${vel.toFixed(3).padStart(7)} | ${total_emf.toFixed(5).padStart(8)} | ${P_gen.toFixed(2).padStart(8)} | ${total_losses.toFixed(2).padStart(8)} | ${surplus.toFixed(1).padStart(7)} | ${T.toFixed(1)}`
      );
      log_idx++;
    }
  }

  // ============================================================
  // FINAL RESULTS
  // ============================================================
  const final_rpm = omega * 60 / (2 * Math.PI);
  const final_vel = omega * R_disc;
  const final_KE = KE;

  console.log("\n╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  RESULTS                                                            ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("─── ENERGY INPUT ───");
  console.log(`  Kickstart energy:            ${(total_kickstart_E / 1000).toFixed(2)} kJ (${P_kick}W × ${t_kick}s)`);
  console.log(`  Kickstart cost:              ~$0.008 of electricity\n`);

  console.log("─── PEAK PERFORMANCE ───");
  console.log(`  Peak EMF:                    ${peak_emf.toFixed(6)} V`);
  console.log(`  Peak Current:                ${peak_current.toFixed(2)} A`);
  console.log(`  Peak Power Generated:        ${peak_power.toFixed(4)} W`);
  console.log(`  Peak Mercury RPM:            ${peak_rpm.toFixed(1)}`);
  console.log(`  Peak Mercury Velocity:       ${(peak_rpm * 2 * Math.PI / 60 * R_disc).toFixed(3)} m/s\n`);

  console.log("─── FINAL STATE (t=300s) ───");
  console.log(`  Mercury RPM:                 ${final_rpm.toFixed(3)}`);
  console.log(`  Mercury Velocity:            ${final_vel.toFixed(6)} m/s`);
  console.log(`  Kinetic Energy Remaining:    ${final_KE.toFixed(6)} J`);
  console.log(`  Temperature:                 ${T.toFixed(1)}°C`);
  console.log(`  Magnet Temperature:          ${T_magnet.toFixed(1)}°C`);
  console.log(`  Magnet Safe (<80°C):         ${T_magnet < 80 ? "YES" : "NO — DEMAGNETIZATION RISK"}\n`);

  console.log("─── SELF-SUSTAINING ───");
  console.log(`  First induction at:          ${t_first_induction >= 0 ? t_first_induction.toFixed(2) + "s" : "NEVER"}`);
  console.log(`  Self-sustaining achieved:    ${t_self_sustain >= 0 ? t_self_sustain.toFixed(2) + "s" : "NO"}`);
  console.log(`  Status:                      ${self_sustaining ? "YES — self-sustaining" : "NO — mercury decelerates after kickstart"}\n`);

  console.log("─── POWER vs LOAD ───");
  console.log(`  Body needs:                  ${TOTAL_LOAD.toFixed(0)}W (at 115%)`);
  console.log(`  ESCU peak output:            ${peak_power.toFixed(4)}W`);
  console.log(`  Shortfall:                   ${(TOTAL_LOAD - peak_power).toFixed(1)}W\n`);

  // ============================================================
  // WHY — THE PHYSICS EXPLANATION
  // ============================================================
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  WHY — THE PHYSICS                                                  ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("The homopolar generator equation tells the full story:");
  console.log(`  EMF = ½ × B × ω × (R² - r²)`);
  console.log(`  B = ${B_gap} T, R = ${(R_disc * 1000).toFixed(1)}mm, r = ${(R_shaft * 1000).toFixed(1)}mm\n`);

  const example_rpms = [1000, 3000, 5000, 10000, 30000, 50000];
  console.log("  RPM       | ω (rad/s)  | EMF/layer | Total EMF | Max Power");
  console.log("  ──────────┼────────────┼───────────┼───────────┼──────────");
  for (const rpm of example_rpms) {
    const w = rpm * 2 * Math.PI / 60;
    const emf1 = 0.5 * B_gap * w * (R_disc ** 2 - R_shaft ** 2);
    const emfT = emf1 * 2 * N_gaps; // opposing rotation × pairs
    const Pmax = emfT * emfT / (4 * R_internal);
    console.log(`  ${rpm.toString().padStart(9)} | ${w.toFixed(1).padStart(10)} | ${emf1.toFixed(5).padStart(9)}V | ${emfT.toFixed(4).padStart(9)}V | ${Pmax.toFixed(2).padStart(8)}W`);
  }

  console.log(`\n  Internal resistance: ${(R_internal * 1000).toFixed(4)} mΩ`);
  console.log(`  This is very LOW resistance, which means HIGH current capability.`);
  console.log(`  But the voltage is also very low — that's the homopolar generator's`);
  console.log(`  fundamental characteristic: high current, low voltage.\n`);

  // What RPM would be needed for 48V
  const emf_needed = 48;
  const omega_needed = emf_needed / (0.5 * B_gap * (R_disc ** 2 - R_shaft ** 2) * 2 * N_gaps);
  const rpm_needed = omega_needed * 60 / (2 * Math.PI);
  const v_needed = omega_needed * R_disc;
  console.log("─── WHAT RPM IS NEEDED FOR 48V OUTPUT? ───");
  console.log(`  Required ω: ${omega_needed.toFixed(1)} rad/s`);
  console.log(`  Required RPM: ${rpm_needed.toFixed(0)}`);
  console.log(`  Mercury tip velocity: ${v_needed.toFixed(1)} m/s`);
  console.log(`  Speed of sound in mercury: ~1,451 m/s`);
  if (v_needed > 1451) {
    console.log(`  ⚠ The mercury would need to move at ${(v_needed / 1451).toFixed(1)}× the speed of sound in mercury.`);
    console.log(`  This would cause cavitation and shock waves — not physically practical.\n`);
  } else if (v_needed > 100) {
    console.log(`  ⚠ Very high velocity — centrifugal forces would push mercury outward`);
    console.log(`  against the shell wall, possibly disrupting the gap geometry.\n`);
  } else {
    console.log(`  This velocity is feasible.\n`);
  }

  // Self-sustaining analysis
  console.log("─── SELF-SUSTAINING: THE ENERGY LOOP ───\n");
  console.log("  For self-sustaining operation, the feedback loop must satisfy:");
  console.log("  Generated_Power > Body_Load + Internal_Losses + Feedback_Losses\n");
  console.log("  The feedback loop works like this:");
  console.log("  1. Mercury spins → generates electricity (brakes mercury)");
  console.log("  2. Part of electricity → AMFOS coils → accelerates mercury");
  console.log("  3. Rest of electricity → powers the body\n");
  console.log("  The problem: Step 1 REMOVES kinetic energy from mercury.");
  console.log("  Step 2 puts SOME of it back, but with losses at each conversion:");
  console.log("    - Generator extraction: ~50% efficiency at max power point");
  console.log("    - AMFOS coupling: ~35% efficiency (air gap to liquid metal)");
  console.log("    - Round-trip: 0.50 × 0.35 = 17.5% of extracted power returns");
  console.log("  So for every 100W extracted, only 17.5W returns as rotation.");
  console.log("  The mercury ALWAYS decelerates — it's losing 82.5% per cycle.\n");
  console.log("  This is not a design flaw — it's conservation of energy.");
  console.log("  No electromagnetic generator can output more power than the");
  console.log("  mechanical energy input driving it. The ESCU's driving energy");
  console.log("  is the mercury's kinetic energy, which is finite.\n");

  // Calculate how long the mercury coasts
  const peak_KE = 0.5 * I_mercury * (peak_rpm * 2 * Math.PI / 60) ** 2;
  console.log(`  Kickstart stores ${peak_KE.toFixed(4)} J of kinetic energy in mercury.`);
  console.log(`  At ${TOTAL_LOAD.toFixed(0)}W load, that's ${(peak_KE / TOTAL_LOAD).toFixed(4)} seconds of power.`);
  console.log(`  Even with zero losses, the stored energy is far too small.\n`);

  // ============================================================
  // ANTI-GRAVITY / LEVITATION ANALYSIS
  // ============================================================
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  ANTI-GRAVITY / LEVITATION / EM FIELD EFFECTS ON METAL BODY         ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  const body_mass = 45; // kg estimated (humanoid robot)
  const body_weight = body_mass * g; // N

  console.log("─── ELECTROMAGNETIC FIELD AROUND THE BODY ───\n");

  // Field outside the Halbach shell
  const B_outside_shell = B_shell * 0.07; // Halbach cancels ~93% on outside
  console.log(`  Field inside ESCU shell:     ${B_shell.toFixed(2)} T`);
  console.log(`  Field outside ESCU shell:    ${(B_outside_shell * 1000).toFixed(1)} mT (Halbach cancels 93%)`);
  console.log(`  Field at body surface:       ${(B_outside_shell * 0.1 * 1000).toFixed(2)} mT (falls off as 1/r³)`);
  console.log(`  Earth's magnetic field:      0.05 mT`);
  console.log(`  Field at 1m from body:       ${(B_outside_shell * 0.001 * 1000).toFixed(4)} mT (negligible)\n`);

  // Mu-metal shielding
  console.log("  The mu-metal shield (0.5mm Ni-Fe) between ESCU and server");
  console.log("  attenuates the field by ~1000x, protecting electronics.\n");

  // Force on the metal body from ESCU field
  // F = (B²A)/(2μ₀) for magnetic pressure, but this is internal
  // The body frame (titanium) is NON-ferromagnetic
  console.log("─── FORCES ON TITANIUM BODY FRAME ───\n");
  console.log("  Titanium (Grade 5) is PARAMAGNETIC — very weakly attracted to magnets.");
  console.log("  Magnetic susceptibility of Ti: χ = 1.81 × 10⁻⁴ (nearly zero)");
  console.log("  Force on titanium in ESCU field gradient:");
  const chi_ti = 1.81e-4;
  const dBdr = B_outside_shell / 0.05; // field gradient over 5cm
  const F_ti = chi_ti * B_outside_shell * dBdr * 1 / mu0; // force per m³ of Ti
  const ti_vol_near = 0.001; // ~1 liter of Ti near ESCU
  const F_on_frame = F_ti * ti_vol_near;
  console.log(`  Force on nearby frame: ${F_on_frame.toFixed(4)} N (${(F_on_frame / body_weight * 100).toFixed(6)}% of body weight)`);
  console.log(`  This force is NEGLIGIBLE — titanium barely responds to magnets.\n`);

  // AMFOS anti-gravity assessment
  console.log("─── AMFOS 'ANTI-GRAVITY' ASSESSMENT ───\n");

  // The AMFOS coils create a time-varying magnetic field
  // Can this produce lift? Let's check.
  const amfos_current_max = 20; // A during kickstart, shared across 24 coils
  const I_per_coil = amfos_current_max / N_amfos;
  const F_amfos_per_coil = amfos_turns * I_per_coil * B_shell * amfos_coil_area;
  const F_amfos_total = F_amfos_per_coil * N_amfos;

  console.log(`  AMFOS coils: ${N_amfos} coils, ${amfos_turns} turns each, ${amfos_dim * 1000}mm × ${amfos_dim * 1000}mm`);
  console.log(`  Max current per coil: ${I_per_coil.toFixed(2)} A`);
  console.log(`  Force per coil: ${(F_amfos_per_coil * 1000).toFixed(4)} mN`);
  console.log(`  Total AMFOS force: ${(F_amfos_total * 1000).toFixed(2)} mN (${F_amfos_total.toFixed(4)} N)`);
  console.log(`  ESCU weight: ${(total_mass * g).toFixed(2)} N`);
  console.log(`  Body weight: ${body_weight.toFixed(1)} N`);
  console.log(`  Lift-to-ESCU-weight ratio: ${(F_amfos_total / (total_mass * g)).toFixed(6)}`);
  console.log(`  Lift-to-body-weight ratio: ${(F_amfos_total / body_weight).toFixed(6)}\n`);

  console.log("  VERDICT: The AMFOS electromagnetic force is millinewtons.");
  console.log("  The ESCU weighs 41 N. The body weighs ~441 N.");
  console.log("  Electromagnetic coils at this scale CANNOT produce anti-gravity.");
  console.log("  True electromagnetic levitation (like maglev trains) requires:");
  console.log("    - Superconducting magnets (4K temperature), OR");
  console.log("    - Track-based systems with powered rails, OR");
  console.log("    - Enormously powerful electromagnets (thousands of amps)\n");

  // Diamagnetic levitation?
  console.log("─── COULD THE EM FIELD LEVITATE THE BODY? ───\n");
  console.log("  For diamagnetic levitation (like levitating a frog in 16T field):");
  const B_needed_levitation = Math.sqrt(2 * mu0 * Hg.density * g / chi_ti);
  console.log(`  You would need a field of ~${B_needed_levitation.toFixed(0)} T`);
  console.log(`  The ESCU produces ${B_shell.toFixed(1)} T internally, ${(B_outside_shell * 1000).toFixed(1)} mT externally.`);
  console.log(`  That's a factor of ${(B_needed_levitation / B_outside_shell).toFixed(0)}x too weak for any levitation effect.\n`);

  // Eddy current effects on body during motion
  console.log("─── EM FIELD EFFECTS DURING BODY MOTION ───\n");
  console.log("  When the titanium body moves through the ESCU's external field,");
  console.log("  eddy currents are induced in the titanium (Lenz's law).");
  console.log("  This creates a BRAKING force (opposes motion), not lift.");
  console.log(`  At walking speed (1.4 m/s) in ${(B_outside_shell * 1000).toFixed(1)} mT field:`);
  const eddy_F_walk = Hg.sigma * 0.01 * B_outside_shell ** 2 * 1.4 * 0.001; // rough estimate
  console.log(`  Eddy braking force: ~${(eddy_F_walk * 1000).toFixed(4)} mN — completely negligible.\n`);

  // ============================================================
  // WHAT WORKS AND WHAT NEEDS FIXING
  // ============================================================
  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  WHAT WORKS AND WHAT NEEDS TO CHANGE                                ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("✓ CORRECT DESIGN CHOICES:");
  console.log("  - Mercury as working fluid (best liquid conductor available)");
  console.log("  - Halbach arrays (maximizes field in active region)");
  console.log("  - Opposing rotation layers (doubles relative velocity)");
  console.log("  - Tungsten/Mo/Ta conductors (mercury-resistant, high melting point)");
  console.log("  - Magnetic levitation between layers (zero contact friction)");
  console.log("  - Titanium body frame (non-ferromagnetic, won't interfere with ESCU)");
  console.log("  - Mu-metal shielding (protects server from ESCU field)");
  console.log("  - Saltwater cooling (effective for this thermal load)\n");

  console.log("✗ ISSUES TO ADDRESS:\n");

  console.log("  ISSUE 1: VOLTAGE — Homopolar generators make LOW voltage, HIGH current.");
  console.log(`    At achievable RPMs, EMF is millivolts to single-digit volts.`);
  console.log(`    Blueprint specifies 48V output. This requires either:`);
  console.log(`      a) Disc diameter of 300-500mm (not 96mm)`);
  console.log(`      b) RPM of ${rpm_needed.toFixed(0)} (mercury would experience extreme centrifugal force)`);
  console.log(`      c) A boost converter to step up the voltage (adds 5-10% loss)\n`);

  console.log("  ISSUE 2: SELF-SUSTAINING LOOP — Energy conservation prevents it.");
  console.log("    Every watt of electricity comes from mercury's kinetic energy.");
  console.log("    Feeding power back to AMFOS returns only ~17.5% (conversion losses).");
  console.log("    Mercury MUST slow down — there's no external energy source to replace");
  console.log("    the energy being extracted.\n");

  console.log("  ISSUE 3: KINETIC ENERGY STORAGE — Too small at this scale.");
  console.log(`    Mercury KE at peak: ${peak_KE.toFixed(4)} J`);
  console.log(`    Body needs: ${TOTAL_LOAD.toFixed(0)} J every second`);
  console.log(`    That's ${(peak_KE / TOTAL_LOAD).toFixed(4)} seconds of runtime from stored KE alone.\n`);

  console.log("  ISSUE 4: ANTI-GRAVITY — Not achievable with permanent magnets + coils.");
  console.log("    EM force from AMFOS is millinewtons. Body weighs 441 N.");
  console.log("    Need superconducting magnets or entirely different physics.\n");

  console.log("╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  POSSIBLE FIXES                                                     ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log("  FIX 1: SCALE UP THE DISCS");
  console.log("    Increase disc diameter to 300-500mm.");
  console.log("    EMF scales with R². Tripling radius = 9× the voltage.");
  console.log("    Unit would be ~400mm × 300mm (~size of a car battery).");
  console.log("    Still fits in a humanoid torso.\n");

  console.log("  FIX 2: ADD AN EXTERNAL ENERGY INPUT");
  console.log("    The ESCU concept works as a GENERATOR, not a perpetual motion device.");
  console.log("    It needs a continuous energy INPUT. Options:");
  console.log("    a) Heat differential — thermoelectric elements between hot mercury");
  console.log("       and cool exterior could drive a continuous temperature gradient.");
  console.log("       The body's waste heat from electronics IS a real energy source.");
  console.log("    b) Ambient RF harvesting — adds 1-10W (supplemental only).");
  console.log("    c) Solar panels on body exterior — 100-300W (most practical).");
  console.log("    d) Kinetic energy recovery from walking — 50-200W (proven tech).\n");

  console.log("  FIX 3: USE ESCU AS HIGH-EFFICIENCY FLYWHEEL + GENERATOR");
  console.log("    Instead of self-sustaining, use as energy storage + conversion:");
  console.log("    - Charge from wall power (48V/20A for 10 minutes = 576 kJ)");
  console.log("    - Mercury stores kinetic energy with VERY low friction");
  console.log("    - Draw power as needed (high-current bursts for actuators)");
  console.log("    - Recharge when near a power source");
  console.log("    This is how real regenerative systems work (EVs, flywheels).\n");

  console.log("  FIX 4: REDUCE BODY POWER REQUIREMENTS");
  console.log(`    Current: ${TOTAL_LOAD.toFixed(0)}W at 115%`);
  console.log("    - Use Jetson Orin NX (15W) instead of AGX (60W) for general tasks");
  console.log("    - Spin up AGX only for heavy AI workloads");
  console.log("    - Use efficient actuators with regenerative braking");
  console.log("    - Sleep unused sensors");
  console.log("    - Target: average draw of 600-800W\n");

  console.log("  FIX 5: SERIES-STACK MULTIPLE ESCU UNITS");
  console.log("    3 ESCU units with outputs in series = 3× the voltage.");
  console.log("    Each unit is 120mm × 180mm = still fits in a humanoid chest.\n");

  console.log("═══════════════════════════════════════════════════════════════════════");
  console.log("BOTTOM LINE:");
  console.log("═══════════════════════════════════════════════════════════════════════\n");
  console.log("The ESCU WILL generate real electricity. The physics of MHD and");
  console.log("homopolar generation are proven — these are used in real power plants,");
  console.log("submarines, and railguns.");
  console.log();
  console.log("The design choices (mercury, Halbach, tungsten, opposing rotation)");
  console.log("are all correct and well-engineered.");
  console.log();
  console.log("Two things need to change:");
  console.log("1. It cannot be self-sustaining without an external energy input.");
  console.log("   The 30-second kickstart is not enough — you need continuous input");
  console.log("   (heat recovery, solar, kinetic, or periodic recharging).");
  console.log("2. At 96mm diameter, voltage is too low for 48V without a boost");
  console.log("   converter or larger discs.");
  console.log();
  console.log("With these fixes, the ESCU becomes a REAL, buildable power system.");
  console.log();
  console.log("© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.");
}

run();
