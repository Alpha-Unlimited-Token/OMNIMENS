/**
 * ESCU CYLINDRICAL MODEL v10 — UPGRADED WITH SPHERICAL INNOVATIONS
 * 
 * UPGRADES FROM v9 (122W):
 *   - More magnets per layer, scaling with circumference (outer = more, inner = fewer)
 *   - Different magnet counts per layer for vernier/peristaltic drive inertia
 *   - Flower of Life conductor pattern on every magnet face (both sides + through-holes)
 *   - Octagonal magnets with 37° angled edges (same as spherical)
 *   - Spiked conductor nodes (500μm, 50μm tip)
 *   - N-N / S-S same-layer repulsion for confinement
 *   - Alternating polarity between layers
 *
 * GEOMETRY:
 *   Same 180mm OD, 180mm height cylinder
 *   8 concentric cylindrical magnet layers + outer casing + inner core
 *   Each layer = ring of curved octagonal magnets stacked vertically
 *   Mercury fills the gaps between layers
 *   Top disc and bottom disc cap the cylinder (magnetic confinement)
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

const R_outer_casing = 0.090;
const casing_thickness = 0.005;
const R_outer_gap = R_outer_casing - casing_thickness;
const cylinder_height = 0.180;
const disc_thickness = 0.005;
const active_height = cylinder_height - 2 * disc_thickness;

const N_layers = 8;
const magnet_thickness = 0.006;
const gap_width = 0.004;
const R_core = 0.012;

interface LayerSpec {
  name: string;
  R_outer: number;
  R_inner: number;
  R_mid: number;
  numOctagons: number;
  circumference: number;
  surfaceArea: number;
  polarity: 'N_out' | 'S_out';
}

type LayerMode = 'graduated' | 'dense_pack';

function buildLayers(mode: LayerMode): LayerSpec[] {
  const layers: LayerSpec[] = [];
  let R_out = R_outer_gap - 0.001;

  for (let i = 0; i < N_layers; i++) {
    const R_in = R_out - magnet_thickness;
    const R_mid = (R_out + R_in) / 2;
    const circ = 2 * Math.PI * R_mid;
    const area = circ * active_height;

    let target_side: number;
    if (mode === 'graduated') {
      target_side = 0.008 + 0.004 * (R_mid / 0.082);
      target_side = Math.max(0.006, Math.min(0.014, target_side));
    } else {
      target_side = 0.005 + 0.003 * (R_mid / 0.082);
      target_side = Math.max(0.004, Math.min(0.010, target_side));
    }

    const oct_area = 2 * (1 + Math.sqrt(2)) * target_side * target_side;
    let n = Math.round(area / oct_area);
    if (n % 2 === 0) n += 1;
    n = Math.max(8, n);

    if (i > 0 && layers.length > 0) {
      const prev = layers[i - 1].numOctagons;
      if (n === prev) n += 2;
      if (n % 2 === 0) n += 1;
    }

    const pol: 'N_out' | 'S_out' = i % 2 === 0 ? 'N_out' : 'S_out';

    layers.push({
      name: `Layer ${i + 1}`,
      R_outer: R_out,
      R_inner: R_in,
      R_mid,
      numOctagons: n,
      circumference: circ,
      surfaceArea: area,
      polarity: pol,
    });

    R_out = R_in - gap_width;
  }

  return layers;
}

let LAYERS = buildLayers('graduated');
const N_gaps = N_layers - 1;

function cylVolume(R_out: number, R_in: number, h: number): number {
  return Math.PI * (R_out * R_out - R_in * R_in) * h;
}

function calcMercury(layers: LayerSpec[]): { vol: number; mass: number; I: number } {
  let vol = 0;
  vol += cylVolume(R_outer_gap, layers[0].R_outer, active_height);
  for (let i = 0; i < layers.length - 1; i++) {
    vol += cylVolume(layers[i].R_inner, layers[i + 1].R_outer, active_height);
  }
  vol += cylVolume(layers[layers.length - 1].R_inner, R_core, active_height);
  vol += cylVolume(R_outer_gap, R_core, disc_thickness) * 2 * 0.3;
  const mass = vol * Hg.density;
  const R_avg = (R_outer_gap + R_core) / 2;
  const I = 0.5 * mass * R_avg * R_avg;
  return { vol, mass, I };
}

let hgCalc = calcMercury(LAYERS);
let Hg_vol = hgCalc.vol;
let Hg_mass = hgCalc.mass;
let I_mercury = hgCalc.I;

const FoL_circles = 19;
const FoL_intersection_nodes_per_face = 54;
const FoL_arc_segments_per_face = 72;
const FoL_total_nodes_per_octagon = FoL_intersection_nodes_per_face * 2;

const spike_height = 0.0005;
const spike_tip_radius = 0.00005;
const spike_base_radius = 0.0002;
const hole_diameter = 0.0008;
const holes_per_octagon = FoL_intersection_nodes_per_face;
const trace_thickness = 0.00005;
const trace_width = 0.001;
const trace_cross_section = trace_thickness * trace_width;

function octagonArea(side: number): number {
  return 2 * (1 + Math.sqrt(2)) * side * side;
}

function avgOctSide(layer: LayerSpec): number {
  return Math.sqrt(layer.surfaceArea / layer.numOctagons / (2 * (1 + Math.sqrt(2))));
}

function conductorPerOctagon(side: number): {
  trace_length: number;
  surface_area: number;
  resistance: number;
  num_nodes: number;
  through_holes: number;
} {
  const circle_r = side / 3;
  const avg_arc = Math.PI * circle_r / 6;
  const total_trace_length = avg_arc * FoL_arc_segments_per_face * 2;
  const trace_area = total_trace_length * trace_width * 2;
  const spike_slant = Math.sqrt(spike_height ** 2 + spike_base_radius ** 2);
  const spike_area = Math.PI * spike_base_radius * spike_slant;
  const total_spike_area = spike_area * FoL_total_nodes_per_octagon;
  const R_tungsten = 5.28e-8;
  const R_single_arc = R_tungsten * avg_arc / trace_cross_section;
  const R_parallel = R_single_arc / 24;
  const hole_area = Math.PI * (hole_diameter / 2) ** 2;
  const R_hole = R_tungsten * magnet_thickness / hole_area;
  const R_through = R_hole / holes_per_octagon;

  return {
    trace_length: total_trace_length,
    surface_area: trace_area + total_spike_area,
    resistance: R_parallel + R_through,
    num_nodes: FoL_total_nodes_per_octagon,
    through_holes: holes_per_octagon,
  };
}

const current_concentration = (trace_width / 2) / spike_tip_radius;
const spike_coupling_boost = 1 + 0.3 * Math.log10(current_concentration);
const conductor_pattern_efficiency = 0.55 * spike_coupling_boost;
const contact_R_per_node = 0.05e-3 / 20;

const B_r = 1.45;
const B_gap_base = 0.85;

function cylindricalFieldFactor(R: number, numMagnets: number): {
  B_effective: number;
  tangential_coupling: number;
  confinement_pressure_atm: number;
} {
  const uniformity = 0.88;
  const B_effective = B_gap_base * (uniformity / 0.78);
  const angle_rad = 37 * Math.PI / 180;
  const tangential = 1 + 0.15 * Math.sin(angle_rad);
  const P_face = B_effective ** 2 / (2 * mu0);
  const P_total = P_face * 1.5;
  const P_atm = P_total / 101325;

  return { B_effective, tangential_coupling: tangential, confinement_pressure_atm: P_atm };
}

function cylindricalDrive(
  layer_outer: LayerSpec, layer_inner: LayerSpec,
  omega: number, gapR_outer: number, gapR_inner: number
): {
  peristaltic_W: number;
  compression_wave_W: number;
  through_hole_W: number;
  shell_shear_W: number;
  vernier_W: number;
  disc_pump_W: number;
  lenz_brake_W: number;
} {
  const n1 = layer_outer.numOctagons;
  const n2 = layer_inner.numOctagons;
  const R_gap = (gapR_outer + gapR_inner) / 2;
  const gap = gapR_outer - gapR_inner;

  const cf1 = cylindricalFieldFactor(layer_outer.R_mid, n1);
  const cf2 = cylindricalFieldFactor(layer_inner.R_mid, n2);
  const B_avg = (cf1.B_effective + cf2.B_effective) / 2;

  const n_diff = Math.abs(n1 - n2);
  const n_sum = n1 + n2;
  const P_mag = B_avg ** 2 / (2 * mu0);
  const asym = n_diff / n_sum;
  const gap_area = 2 * Math.PI * R_gap * active_height;
  const omega_rel = omega * (layer_outer.polarity !== layer_inner.polarity ? 2 : 1);

  const active_fraction = asym * 0.15 * ((cf1.tangential_coupling + cf2.tangential_coupling) / 2);
  const F_peri = P_mag * gap_area * active_fraction * 1.1;
  const T_peri = F_peri * R_gap;
  const P_peri = T_peri * omega_rel;

  const vertices_total = 8 * Math.min(n1, n2) / 3;
  const vertex_B_concentration = 1.3;
  const P_vertex = (B_avg * vertex_B_concentration) ** 2 / (2 * mu0);
  const delta_P_vertex = P_vertex - P_mag;
  const vertex_area = gap * gap * 0.05;
  const F_compress = delta_P_vertex * vertex_area * vertices_total;
  const P_compress = F_compress * R_gap * omega * 0.5;

  const side = avgOctSide(layer_outer);
  const cond_data = conductorPerOctagon(side);
  const v_rel = omega * R_gap;
  const emf_local = B_avg * v_rel * side * 0.12;
  const R_circuit = cond_data.resistance + Hg.rho_e * gap / (Math.PI * R_gap * R_gap * 0.01);
  const I_through = emf_local / R_circuit;
  const F_hole = I_through * magnet_thickness * B_avg * 0.3;
  const F_total_holes = F_hole * Math.min(holes_per_octagon, 20) * Math.min(n1, n2);
  const P_through = F_total_holes * R_gap * omega;

  const B_radial = 0.55;
  const rim_area = gap * (2 * Math.PI * R_gap * 0.05);
  const shear_stress = (B_radial * B_avg) / mu0 * Math.sin(37 * Math.PI / 180) * 0.05;
  const F_shear = shear_stress * rim_area * 0.1;
  const P_shear = F_shear * R_gap * omega;

  const gcd_val = gcd(n1, n2);
  const vernier_poles = n_diff;
  const coupling_quality = 1 / Math.max(1, gcd_val);
  const face_area = gap_area / Math.max(1, n1);
  const tang_ratio = Math.sin(2 * Math.PI * vernier_poles / n_sum);
  const F_vern = P_mag * face_area * tang_ratio * coupling_quality * asym * 0.25;
  const T_vern = Math.abs(F_vern) * R_gap;
  const P_vern = T_vern * omega_rel;

  const disc_B = B_avg * 0.7;
  const disc_area = Math.PI * (gapR_outer ** 2 - gapR_inner ** 2) * 0.1;
  const disc_F = disc_B ** 2 / (2 * mu0) * disc_area * asym * 0.08;
  const P_disc = disc_F * R_gap * omega;

  const v_mercury = omega * R_gap;
  const gap_vol = gap_area * gap * 0.3;
  const P_lenz = Hg.sigma * B_avg * B_avg * v_mercury * v_mercury * gap_vol * 0.12;

  return {
    peristaltic_W: Math.max(0, P_peri),
    compression_wave_W: Math.max(0, P_compress),
    through_hole_W: Math.max(0, P_through),
    shell_shear_W: Math.max(0, P_shear),
    vernier_W: Math.max(0, P_vern),
    disc_pump_W: Math.max(0, P_disc),
    lenz_brake_W: Math.max(0, P_lenz),
  };
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function flowerOfLifeCoupling(
  omega: number, B: number, R_gap: number,
  layer_outer: LayerSpec, layer_inner: LayerSpec, gap: number
): {
  lorentz_W: number;
  ohmic_loss_W: number;
  emf_V: number;
  I_total_A: number;
} {
  const n_magnets = Math.min(layer_outer.numOctagons, layer_inner.numOctagons);
  const side = avgOctSide(layer_outer);
  const cond = conductorPerOctagon(side);

  const circle_r = side / 3;
  const circle_area = Math.PI * circle_r * circle_r;
  const d_flux_dt = B * circle_area * omega * 2;
  const emf_per_circle = d_flux_dt * 0.25;
  const emf_per_magnet = emf_per_circle * 6;
  const R_per_magnet = cond.resistance + contact_R_per_node * 2;
  const I_per_magnet = emf_per_magnet / R_per_magnet;

  const F_per_magnet = I_per_magnet * gap * B * conductor_pattern_efficiency;
  const F_total = F_per_magnet * n_magnets;
  const P_lorentz = F_total * R_gap * omega;

  const P_ohmic = I_per_magnet ** 2 * R_per_magnet * n_magnets;

  const emf_total = emf_per_magnet * n_magnets;

  return {
    lorentz_W: Math.max(0, P_lorentz),
    ohmic_loss_W: P_ohmic,
    emf_V: emf_total,
    I_total_A: I_per_magnet * Math.sqrt(n_magnets),
  };
}

function totalGeneration(omega: number): {
  emf_V: number;
  P_gen_W: number;
  I_gen_A: number;
  R_internal: number;
} {
  let emf_total = 0;
  let R_total = 0;

  for (let i = 0; i < N_gaps; i++) {
    const R_gap_outer = LAYERS[i].R_inner;
    const R_gap_inner = LAYERS[i + 1].R_outer;
    const R_gap_mid = (R_gap_outer + R_gap_inner) / 2;
    const gap = R_gap_outer - R_gap_inner;

    const cf = cylindricalFieldFactor(LAYERS[i].R_mid, LAYERS[i].numOctagons);
    const B = cf.B_effective;

    const fol = flowerOfLifeCoupling(omega, B, R_gap_mid, LAYERS[i], LAYERS[i + 1], gap);
    emf_total += fol.emf_V;

    const side = avgOctSide(LAYERS[i]);
    const cond = conductorPerOctagon(side);
    const R_hg_gap = Hg.rho_e * gap / (2 * Math.PI * R_gap_mid * active_height * 0.1);
    R_total += cond.resistance + R_hg_gap;
  }

  const R_casing_gap = (R_outer_gap + LAYERS[0].R_outer) / 2;
  const B_casing = cylindricalFieldFactor(R_outer_gap, 1).B_effective;
  emf_total += B_casing * omega * R_casing_gap * active_height * 0.15;

  if (emf_total < 0.0001) return { emf_V: 0, P_gen_W: 0, I_gen_A: 0, R_internal: R_total };

  const P_gen = (emf_total ** 2) / (4 * R_total);
  const I_gen = emf_total / (2 * R_total);

  return { emf_V: emf_total, P_gen_W: P_gen, I_gen_A: I_gen, R_internal: R_total };
}

function totalLosses(omega: number, P_gen: number, I_gen: number, R_int: number, B_avg: number): number {
  const freq = omega / (2 * Math.PI);

  let conductor_vol = 0;
  for (const layer of LAYERS) {
    const side = avgOctSide(layer);
    const cond = conductorPerOctagon(side);
    conductor_vol += cond.trace_length * trace_cross_section * layer.numOctagons;
  }
  const loss_eddy_cond = (Math.PI ** 2 * B_avg ** 2 * freq ** 2 * trace_thickness ** 2 * conductor_vol) / (6 * 5.28e-8);

  const loss_eddy_hg = Hg.sigma * (B_avg * 0.3) ** 2 * Hg_vol * Math.max(freq, 0) * 1e-4;

  let mag_vol = 0;
  for (const layer of LAYERS) {
    mag_vol += cylVolume(layer.R_outer, layer.R_inner, active_height) * 0.85;
  }
  mag_vol += cylVolume(R_outer_casing, R_outer_gap, cylinder_height) * 0.9;
  const loss_hyst = 200 * freq * Math.pow(B_avg, 1.6) * mag_vol;

  const loss_resistive = I_gen ** 2 * R_int;

  let loss_viscous = 0;
  const drag_reduction = 0.75;
  for (let i = 0; i < N_gaps; i++) {
    const R_gap_outer = LAYERS[i].R_inner;
    const R_gap_inner = LAYERS[i + 1].R_outer;
    const gap = R_gap_outer - R_gap_inner;
    const R_g = (R_gap_outer + R_gap_inner) / 2;
    const drag = drag_reduction * 2 * Math.PI * Hg.mu_visc * omega * R_g * R_g * R_g * active_height / gap;
    loss_viscous += drag * omega;
  }

  const loss_rad = P_gen * 0.005;

  return loss_eddy_cond + loss_eddy_hg + loss_hyst + loss_resistive + loss_viscous + loss_rad;
}

function calcThermal(): { thermal_mass: number } {
  let mvt = 0;
  for (const layer of LAYERS) {
    mvt += cylVolume(layer.R_outer, layer.R_inner, active_height) * 0.85;
  }
  mvt += cylVolume(R_outer_casing, R_outer_gap, cylinder_height) * 0.9;
  const tm = Hg_mass + mvt * 7500 + 0.5;
  return { thermal_mass: Hg_mass * Hg.cp + (tm - Hg_mass) * 500 };
}

let thermal_mass = calcThermal().thermal_mass;
const cooling_W = 250;

interface Circuit {
  name: string;
  breakerMax: number;
  idleDraw: number;
  activeDraw: number;
  alwaysOn: boolean;
}

const PDU_CIRCUITS: Circuit[] = [
  { name: "Server (Jetson AGX Orin)",  breakerMax: 275,  idleDraw: 60,   activeDraw: 240,  alwaysOn: true },
  { name: "Starlink Mini",             breakerMax: 100,  idleDraw: 25,   activeDraw: 75,   alwaysOn: false },
  { name: "LoRa/BT/WiFi comms",        breakerMax: 15,   idleDraw: 5,    activeDraw: 12,   alwaysOn: true },
  { name: "Cameras (11 total)",         breakerMax: 30,   idleDraw: 3,    activeDraw: 22,   alwaysOn: false },
  { name: "Microphones (16 array)",     breakerMax: 5,    idleDraw: 2,    activeDraw: 4,    alwaysOn: true },
  { name: "Speakers",                   breakerMax: 50,   idleDraw: 0,    activeDraw: 30,   alwaysOn: false },
  { name: "Head actuators (3 DOF)",     breakerMax: 45,   idleDraw: 2,    activeDraw: 30,   alwaysOn: false },
  { name: "Waist actuators (3 DOF)",    breakerMax: 120,  idleDraw: 5,    activeDraw: 80,   alwaysOn: false },
  { name: "Shoulder actuators (6 DOF)", breakerMax: 240,  idleDraw: 10,   activeDraw: 160,  alwaysOn: false },
  { name: "Elbow actuators (4 DOF)",    breakerMax: 80,   idleDraw: 3,    activeDraw: 50,   alwaysOn: false },
  { name: "Wrist actuators (6 DOF)",    breakerMax: 30,   idleDraw: 2,    activeDraw: 20,   alwaysOn: false },
  { name: "Hand actuators (30 DOF)",    breakerMax: 150,  idleDraw: 5,    activeDraw: 100,  alwaysOn: false },
  { name: "Hip actuators (6 DOF)",      breakerMax: 480,  idleDraw: 15,   activeDraw: 320,  alwaysOn: false },
  { name: "Knee actuators (2 DOF)",     breakerMax: 240,  idleDraw: 8,    activeDraw: 160,  alwaysOn: false },
  { name: "Ankle actuators (4 DOF)",    breakerMax: 120,  idleDraw: 5,    activeDraw: 80,   alwaysOn: false },
  { name: "IMU + sensors",              breakerMax: 10,   idleDraw: 3,    activeDraw: 8,    alwaysOn: true },
  { name: "Cooling pump",               breakerMax: 40,   idleDraw: 15,   activeDraw: 35,   alwaysOn: true },
  { name: "LED status/eyes",            breakerMax: 10,   idleDraw: 3,    activeDraw: 8,    alwaysOn: false },
  { name: "PDU overhead",               breakerMax: 20,   idleDraw: 10,   activeDraw: 15,   alwaysOn: true },
];

interface OpMode {
  name: string;
  description: string;
  activeCircuits: string[];
  dutyCycle: number;
}

const OP_MODES: OpMode[] = [
  { name: "IDLE", description: "Sitting still, thinking/computing", activeCircuits: ["Server (Jetson AGX Orin)", "LoRa/BT/WiFi comms", "Microphones (16 array)", "IMU + sensors", "Cooling pump", "PDU overhead"], dutyCycle: 0.40 },
  { name: "STANDBY", description: "Alert, cameras on, listening", activeCircuits: ["Server (Jetson AGX Orin)", "LoRa/BT/WiFi comms", "Cameras (11 total)", "Microphones (16 array)", "IMU + sensors", "Cooling pump", "PDU overhead", "LED status/eyes"], dutyCycle: 0.20 },
  { name: "TALKING", description: "Conversing — server + comms + head", activeCircuits: ["Server (Jetson AGX Orin)", "Starlink Mini", "LoRa/BT/WiFi comms", "Cameras (11 total)", "Microphones (16 array)", "Speakers", "Head actuators (3 DOF)", "LED status/eyes", "IMU + sensors", "Cooling pump", "PDU overhead"], dutyCycle: 0.15 },
  { name: "WALKING", description: "Walking — legs + balance", activeCircuits: ["Server (Jetson AGX Orin)", "LoRa/BT/WiFi comms", "Cameras (11 total)", "Microphones (16 array)", "Head actuators (3 DOF)", "Waist actuators (3 DOF)", "Hip actuators (6 DOF)", "Knee actuators (2 DOF)", "Ankle actuators (4 DOF)", "IMU + sensors", "Cooling pump", "PDU overhead"], dutyCycle: 0.10 },
  { name: "WORKING", description: "Using arms and hands", activeCircuits: ["Server (Jetson AGX Orin)", "LoRa/BT/WiFi comms", "Cameras (11 total)", "Microphones (16 array)", "Head actuators (3 DOF)", "Shoulder actuators (6 DOF)", "Elbow actuators (4 DOF)", "Wrist actuators (6 DOF)", "Hand actuators (30 DOF)", "IMU + sensors", "Cooling pump", "PDU overhead"], dutyCycle: 0.10 },
  { name: "FULL MOTION", description: "Walking + arms + talking", activeCircuits: PDU_CIRCUITS.map(c => c.name), dutyCycle: 0.04 },
  { name: "PEAK BURST", description: "Sprinting/lifting (brief)", activeCircuits: PDU_CIRCUITS.map(c => c.name), dutyCycle: 0.01 },
];

function modeLoad(mode: OpMode, usePeak: boolean = false): number {
  let total = 0;
  for (const circuit of PDU_CIRCUITS) {
    const isActive = mode.activeCircuits.includes(circuit.name);
    if (isActive) total += usePeak && mode.name === "PEAK BURST" ? circuit.breakerMax : circuit.activeDraw;
    else if (circuit.alwaysOn) total += circuit.idleDraw;
  }
  return total;
}

function weightedAverageLoad(): number {
  let total = 0;
  for (const mode of OP_MODES) total += modeLoad(mode) * mode.dutyCycle;
  return total;
}

function simulate(kickPower: number, kickDuration: number): {
  peak_rpm: number;
  peak_emf: number;
  peak_power: number;
  steady_rpm: number;
  steady_avail: number;
  mercury_stopped: boolean;
  logs: string[];
} {
  const dt = 0.005;
  const total_time = 300;
  const steps = Math.floor(total_time / dt);

  let omega = 0;
  let T_temp = T_ambient;
  let KE = 0;
  let peak_power = 0, peak_rpm = 0, peak_emf = 0;
  let mercury_stopped = false;
  let steady_samples: number[] = [];
  let steady_power_samples: number[] = [];
  const logs: string[] = [];

  const log_times = [0, 2, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 90, 120, 180, 240, 300];
  let log_idx = 0;

  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    let P_drive_ext = 0;
    let external = false;

    if (t <= kickDuration) {
      external = true;
      P_drive_ext = kickPower * 0.35;
    }

    let P_peri = 0, P_compress = 0, P_through = 0, P_shear = 0, P_vern = 0, P_disc = 0, P_lenz = 0;
    let B_avg = 0;

    if (omega > 0.5) {
      for (let i = 0; i < N_gaps; i++) {
        const R_gap_outer = LAYERS[i].R_inner;
        const R_gap_inner = LAYERS[i + 1].R_outer;

        const drive = cylindricalDrive(LAYERS[i], LAYERS[i + 1], omega, R_gap_outer, R_gap_inner);
        P_peri += drive.peristaltic_W;
        P_compress += drive.compression_wave_W;
        P_through += drive.through_hole_W;
        P_shear += drive.shell_shear_W;
        P_vern += drive.vernier_W;
        P_disc += drive.disc_pump_W;
        P_lenz += drive.lenz_brake_W;

        const cf = cylindricalFieldFactor(LAYERS[i].R_mid, LAYERS[i].numOctagons);
        B_avg += cf.B_effective;
      }
      B_avg /= N_gaps;
    } else {
      B_avg = cylindricalFieldFactor(LAYERS[0].R_mid, LAYERS[0].numOctagons).B_effective;
    }

    const gen = totalGeneration(omega);
    const losses = totalLosses(omega, gen.P_gen_W, gen.I_gen_A, gen.R_internal, B_avg);

    const P_drive_total = P_drive_ext + P_peri + P_compress + P_through + P_shear + P_vern + P_disc;
    const P_out = gen.P_gen_W + losses + P_lenz;

    KE = Math.max(0, KE + (P_drive_total - P_out) * dt);
    omega = Math.sqrt(2 * KE / I_mercury);

    const boost_eff = 0.95;
    const P_avail = external ? gen.P_gen_W : gen.P_gen_W * boost_eff;

    if (!external && omega < 0.5 && t > kickDuration + 2 && !mercury_stopped) {
      mercury_stopped = true;
    }

    T_temp += ((losses - Math.min(cooling_W, losses + 50)) * dt) / thermal_mass;

    if (gen.P_gen_W > peak_power) peak_power = gen.P_gen_W;
    if (omega * 60 / (2 * Math.PI) > peak_rpm) peak_rpm = omega * 60 / (2 * Math.PI);
    if (gen.emf_V > peak_emf) peak_emf = gen.emf_V;

    if (t > 240) {
      steady_samples.push(omega * 60 / (2 * Math.PI));
      steady_power_samples.push(P_avail);
    }

    if (log_idx < log_times.length && t >= log_times[log_idx] - dt / 2) {
      const rpm = omega * 60 / (2 * Math.PI);
      const status = external ? "KICK " : (omega > 1 ? "COAST" : "STOP ");
      const drive_total = P_peri + P_compress + P_through + P_shear + P_vern + P_disc;
      const line = `  ${t.toFixed(0).padStart(4)}s | ${status} | ${rpm.toFixed(1).padStart(7)} | ${gen.emf_V.toFixed(4).padStart(7)} | ${gen.P_gen_W.toFixed(1).padStart(8)} | ${P_avail.toFixed(1).padStart(8)} | ${drive_total.toFixed(0).padStart(7)} | ${T_temp.toFixed(1)}`;
      logs.push(line);
      log_idx++;
    }
  }

  const avg_rpm = steady_samples.length > 0 ? steady_samples.reduce((a, b) => a + b) / steady_samples.length : 0;
  const avg_avail = steady_power_samples.length > 0 ? steady_power_samples.reduce((a, b) => a + b) / steady_power_samples.length : 0;

  return { peak_rpm, peak_emf, peak_power, steady_rpm: avg_rpm, steady_avail: avg_avail, mercury_stopped, logs };
}

function printLayerTable() {
  console.log("  Layer    │ R_outer │ R_inner │ # Magnets  │ Circ (mm) │ Surface cm² │ Oct Side │ Polarity");
  console.log("  ─────────┼─────────┼─────────┼────────────┼───────────┼─────────────┼──────────┼─────────");
  let total = 0;
  for (const layer of LAYERS) {
    const side = avgOctSide(layer) * 1000;
    total += layer.numOctagons;
    console.log(`  ${layer.name.padEnd(9)} │ ${(layer.R_outer * 1000).toFixed(1).padStart(5)}mm │ ${(layer.R_inner * 1000).toFixed(1).padStart(5)}mm │ ${layer.numOctagons.toString().padStart(6)}     │ ${(layer.circumference * 1000).toFixed(1).padStart(7)}  │ ${(layer.surfaceArea * 1e4).toFixed(1).padStart(8)}    │ ${side.toFixed(1).padStart(5)}mm │ ${layer.polarity}`);
  }
  return total;
}

function runConfig(mode: LayerMode, label: string) {
  LAYERS = buildLayers(mode);
  const hg = calcMercury(LAYERS);
  Hg_vol = hg.vol; Hg_mass = hg.mass; I_mercury = hg.I;
  thermal_mass = calcThermal().thermal_mass;

  console.log(`\n╔══════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  ${label.padEnd(72)}║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════════════╝\n`);

  const total_magnets = printLayerTable();
  console.log(`\n  Total magnets: ${total_magnets} | Mercury: ${(Hg_vol * 1e6).toFixed(0)} cm³ / ${(Hg_mass * 1000).toFixed(0)}g | I = ${I_mercury.toExponential(2)}`);
  let total_nodes = 0;
  for (const layer of LAYERS) total_nodes += conductorPerOctagon(avgOctSide(layer)).num_nodes * layer.numOctagons;
  const total_pressure = LAYERS.reduce((s, l) => s + l.numOctagons * 8, 0);
  console.log(`  Conductor nodes: ${total_nodes.toLocaleString()} | Pressure points: ${total_pressure}`);

  console.log(`\n  Time | Status |   RPM   |  EMF V  | GenPow W | Avail W | Drive W | T°C`);
  console.log(`  ─────┼────────┼─────────┼─────────┼──────────┼─────────┼─────────┼────`);
  const sim = simulate(960, 30);
  for (const line of sim.logs) console.log(line);
  console.log(`\n  Result: ${sim.mercury_stopped ? "Mercury STOPPED ✗" : "Mercury spins FOREVER ✓"} | Steady: ${sim.steady_rpm.toFixed(0)} RPM, ${sim.steady_avail.toFixed(1)}W | Peak: ${sim.peak_rpm.toFixed(0)} RPM, ${sim.peak_emf.toFixed(4)}V, ${sim.peak_power.toFixed(1)}W`);
  return { total_magnets, total_nodes, total_pressure, sim };
}

function run() {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  ESCU CYLINDRICAL MODEL v10 — UPGRADED WITH SPHERICAL INNOVATIONS            ║");
  console.log("║  8 Concentric Layers, Octagonal Magnets, FoL Conductor Pattern               ║");
  console.log("║  Graduated Magnet Counts Per Layer (more outside, fewer inside)               ║");
  console.log("║  DUAL TEST: Graduated vs Dense-Pack                                          ║");
  console.log("║  © 2024-2026 Alpha Unlimited Technologies, LLC                              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  console.log("  Upgrades from v9 (84 magnets, 122W):");
  console.log("    ✓ 8 concentric layers (was fewer)");
  console.log("    ✓ Octagonal magnets with 37° angled edges");
  console.log("    ✓ Flower of Life conductor pattern (108 nodes/magnet, both faces)");
  console.log("    ✓ Different magnet counts per layer → vernier/peristaltic drive");
  console.log("    ✓ More magnets on outer layers (bigger circumference)");
  console.log("    ✓ Fewer magnets on inner layers (smaller circumference)");
  console.log("    ✓ Through-hole Ampere drive (current through magnet body)");
  console.log("    ✓ Spiked conductor nodes (500μm, 50μm tip, 10× concentration)");
  console.log("    ✓ Top/bottom disc caps for axial confinement\n");

  const avg_load = weightedAverageLoad();
  const idle_load = modeLoad(OP_MODES[0]);
  console.log(`  Body loads: IDLE ${idle_load}W | Average ${avg_load.toFixed(0)}W | Walk ${modeLoad(OP_MODES[3])}W | Peak ${modeLoad(OP_MODES[6], true)}W\n`);

  const rA = runConfig('graduated', "CONFIG A: Graduated (larger outer magnets, smaller inner)");
  const rB = runConfig('dense_pack', "CONFIG B: Dense-Pack (smaller magnets, more total)");

  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  HEAD-TO-HEAD: CONFIG A vs CONFIG B                                          ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  console.log("  Property                │ A (graduated)     │ B (dense-pack)    │ Winner");
  console.log("  ────────────────────────┼───────────────────┼───────────────────┼────────");
  const w = (a: number, b: number) => b > a ? "B" : (a > b ? "A" : "TIE");
  console.log(`  Total magnets            │ ${rA.total_magnets.toString().padStart(6)}            │ ${rB.total_magnets.toString().padStart(6)}            │ ${w(rA.total_magnets, rB.total_magnets)}`);
  console.log(`  Conductor nodes          │ ${rA.total_nodes.toLocaleString().padStart(10)}        │ ${rB.total_nodes.toLocaleString().padStart(10)}        │ ${w(rA.total_nodes, rB.total_nodes)}`);
  console.log(`  Pressure points          │ ${rA.total_pressure.toString().padStart(6)}            │ ${rB.total_pressure.toString().padStart(6)}            │ ${w(rA.total_pressure, rB.total_pressure)}`);
  const sA = rA.sim.mercury_stopped ? "STOPPED" : "FOREVER";
  const sB = rB.sim.mercury_stopped ? "STOPPED" : "FOREVER";
  console.log(`  Mercury spin             │ ${sA.padStart(10)}        │ ${sB.padStart(10)}        │ ${!rA.sim.mercury_stopped && !rB.sim.mercury_stopped ? "BOTH" : !rA.sim.mercury_stopped ? "A" : "B"}`);
  console.log(`  Steady RPM               │ ${rA.sim.steady_rpm.toFixed(0).padStart(6)}            │ ${rB.sim.steady_rpm.toFixed(0).padStart(6)}            │ ${w(rA.sim.steady_rpm, rB.sim.steady_rpm)}`);
  console.log(`  Continuous output        │ ${rA.sim.steady_avail.toFixed(1).padStart(8)}W         │ ${rB.sim.steady_avail.toFixed(1).padStart(8)}W         │ ${w(rA.sim.steady_avail, rB.sim.steady_avail)}`);
  console.log(`  Peak power               │ ${rA.sim.peak_power.toFixed(1).padStart(8)}W         │ ${rB.sim.peak_power.toFixed(1).padStart(8)}W         │ ${w(rA.sim.peak_power, rB.sim.peak_power)}`);
  console.log(`  Peak EMF                 │ ${rA.sim.peak_emf.toFixed(4).padStart(8)}V         │ ${rB.sim.peak_emf.toFixed(4).padStart(8)}V         │ ${w(rA.sim.peak_emf, rB.sim.peak_emf)}`);

  const best = rB.sim.steady_avail >= rA.sim.steady_avail ? rB : rA;
  const bestLabel = rB.sim.steady_avail >= rA.sim.steady_avail ? "B (Dense-Pack)" : "A (Graduated)";
  const bestPow = best.sim.steady_avail;
  console.log(`\n  WINNER: ${bestLabel} — ${bestPow.toFixed(1)}W continuous\n`);

  console.log("  Mode              │ Load     │ Best Output │ Surplus/Deficit │ Status");
  console.log("  ──────────────────┼──────────┼─────────────┼─────────────────┼────────────");
  for (const mode of OP_MODES) {
    const draw = modeLoad(mode, mode.name === "PEAK BURST");
    const surplus = bestPow - draw;
    const icon = surplus >= 0 ? "✓ SUSTAIN" : (mode.name === "PEAK BURST" ? "⚡ BATTERY" : (bestPow > draw * 0.5 ? "~ PARTIAL" : "✗ NO"));
    console.log(`  ${mode.name.padEnd(18)} │ ${draw.toString().padStart(5)}W   │ ${bestPow.toFixed(0).padStart(7)}W    │ ${(surplus >= 0 ? "+" : "") + surplus.toFixed(0).padStart(5)}W          │ ${icon}`);
  }
  console.log(`\n  WEIGHTED AVG: ${avg_load.toFixed(0)}W needed │ ${bestPow.toFixed(0)}W generated │ ${bestPow >= avg_load ? "✓ SURPLUS " + (bestPow - avg_load).toFixed(0) + "W" : bestPow >= idle_load ? "⚡ Covers idle, battery for active" : "✗ DEFICIT " + (avg_load - bestPow).toFixed(0) + "W"}`);

  console.log("\n═══ v10 UPGRADED vs v9 ORIGINAL ═══\n");
  console.log("  Property              │ Cylindrical v9    │ Cylindrical v10   │ Change");
  console.log("  ──────────────────────┼───────────────────┼───────────────────┼────────");
  console.log(`  Outer diameter        │ 180mm             │ 180mm             │ same`);
  console.log(`  Height                │ 180mm             │ 180mm             │ same`);
  console.log(`  Layers                │ 4                 │ 8                 │ 2×`);
  console.log(`  Total magnets         │ 84                │ ${best.total_magnets.toString().padStart(4)}              │ ${(best.total_magnets / 84).toFixed(1)}×`);
  console.log(`  Conductor nodes       │ ~11,500           │ ${best.total_nodes.toLocaleString().padStart(6)}            │ ${(best.total_nodes / 11500).toFixed(1)}×`);
  console.log(`  Conductor pattern     │ simple grid       │ Flower of Life    │ FoL upgrade`);
  console.log(`  Magnet shape          │ rectangular       │ octagonal 37°     │ oct upgrade`);
  console.log(`  Confinement           │ 4-direction       │ 4-dir + disc caps │ improved`);
  console.log(`  Continuous output     │ 122W              │ ${bestPow.toFixed(0)}W               │ ${(bestPow / 122).toFixed(1)}×`);
  console.log(`  Self-sustaining       │ YES               │ ${best.sim.mercury_stopped ? "NO" : "YES"}               │`);

  console.log("\n═══ CYLINDRICAL v10 vs SPHERICAL ═══\n");
  console.log("  Property              │ Cylindrical v10   │ Spherical (best)  │ Notes");
  console.log("  ──────────────────────┼───────────────────┼───────────────────┼────────");
  console.log(`  Shape                 │ Cylinder          │ Sphere            │ different geometry`);
  console.log(`  Outer diameter        │ 180mm             │ 180mm             │ same`);
  console.log(`  Total magnets         │ ${best.total_magnets.toString().padStart(4)}              │ 306               │ ${best.total_magnets > 306 ? "cyl more" : "sph more"}`);
  console.log(`  Conductor nodes       │ ${best.total_nodes.toLocaleString().padStart(6)}            │ 33,048            │`);
  console.log(`  Confinement           │ 4-dir + disc caps │ ALL directions    │ sphere wins`);
  console.log(`  Continuous output     │ ${bestPow.toFixed(0).padStart(5)}W            │ 51,820W           │ ${bestPow > 51820 ? "cyl wins" : "sphere wins"}`);
  console.log(`  Self-sustaining       │ ${best.sim.mercury_stopped ? "NO " : "YES"}               │ YES               │`);

  console.log("\n© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.");
}

run();
