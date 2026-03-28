# ESCU ASSEMBLY INSTRUCTIONS
## Step-by-Step Build Guide

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Classification:** PROPRIETARY TRADE SECRET
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## REQUIRED TOOLS

- Titanium TIG welding equipment (argon shielded)
- Precision CNC lathe and mill (0.01mm tolerance)
- Magnetization jig for Halbach array assembly
- Mercury handling equipment (fume hood, sealed containers, PPE)
- Torque wrench (M4-M6 range)
- Multimeter (DC voltage, resistance, continuity)
- Oscilloscope (for AMFOS calibration)
- Gaussmeter (magnetic field measurement)
- Infrared thermometer
- Clean room or dust-free environment
- Leak testing equipment (helium leak detector)

## REQUIRED PPE FOR MERCURY HANDLING

- Full-face respirator with mercury vapor cartridge (MSA Advantage 3200)
- Nitrile gloves (double layer)
- Chemical splash goggles
- Lab coat (disposable, non-porous)
- Mercury spill kit on standby

---

## PHASE 1: COMPONENT FABRICATION

### Step 1.1: Central Shaft
1. Machine Ti Gr.5 rod to 15mm OD x 190mm length
2. Bore 2x 4mm channels through center (for bus bars)
3. Bore 1x 2mm channel (for rectifier wiring)
4. Surface finish: Ra 0.4 micrometers
5. Press-fit 2x tantalum bus bars (4mm dia x 185mm) into shaft channels
6. Seal bus bar ends with high-temp ceramic adhesive
7. **Quality check:** Continuity test both bus bars end-to-end (<0.1 Ohm)

### Step 1.2: Magnetic Plates (x5)
1. CNC machine Ti Gr.5 plate frames: 96mm OD, 16mm ID (shaft clearance), 12mm thick
2. Machine 16 magnet pockets per plate (3mm x 24mm x 12mm)
3. Machine 8 conductor strip grooves (radial, 40mm x 3mm x 2mm deep)
4. Insert N52 NdFeB magnets into pockets in Halbach sequence:
   - Each adjacent magnet rotated 90° from neighbor
   - Sequence: →, ↑, ←, ↓, →, ↑, ←, ↓, →, ↑, ←, ↓, →, ↑, ←, ↓
   - Use magnetization jig to hold magnets during insertion (EXTREME force required)
5. Epoxy magnets in place (high-temp epoxy rated to 150°C)
6. Press-fit 8x tungsten conductor strips per plate
7. Install inner and outer molybdenum collection rings
8. Wire collection rings to plate frame contact pads
9. **Quality check per plate:**
   - Gaussmeter: verify >1.0T at plate surface
   - Balance: dynamic balance to G2.5 (ISO 1940)
   - Resistance: <0.05 Ohm strip-to-ring
   - Mass: 180g +/- 5g per plate

### Step 1.3: Halbach Shell (x2 halves)
1. CNC machine Ti Gr.5 cylindrical shell: 108mm ID, 116mm OD, 160mm length
2. Split into 2 halves for assembly access
3. Machine 16 magnet pockets per half-shell (3mm x 24mm x 12mm, arranged as Halbach array)
4. Insert N52 magnets in Halbach sequence (same 90° rotation pattern)
5. Epoxy magnets in place
6. **Quality check:** Gaussmeter confirms >1.2T internal field, <0.01T external (null)

### Step 1.4: AMFOS Coils (x24)
1. Wind 200 turns of 0.3mm copper wire on 12mm air-core former
2. Encapsulate each coil in titanium housing (sealed against mercury vapor)
3. Wire leads through sealed feedthrough
4. **Quality check:** Inductance 0.5mH +/- 10%, DCR <2 Ohm

### Step 1.5: Cooling Jacket
1. Machine Ti Gr.2 inner cylinder: 116mm ID, 120mm OD
2. Machine Hastelloy C-276 spiral channel inserts (3mm wide, 6mm deep, 12 wraps)
3. Machine Ti Gr.5 outer cylinder: 120mm ID, 130mm OD
4. TIG weld inner and outer cylinders with channel inserts between them
5. Install inlet/outlet fittings (316L SS, 6mm tube compression)
6. **Quality check:** Pressure test to 5 bar with water for 1 hour, zero leaks
7. **Quality check:** Flow test at 0.5 L/min, pressure drop <0.5 bar

### Step 1.6: Top and Bottom Caps
1. Machine Ti Gr.5 discs: 120mm OD, 25mm thick
2. Machine central shaft bore: 15.1mm (0.1mm clearance)
3. Machine ferrofluid seal groove around shaft bore
4. Machine Viton O-ring grooves (double seal)
5. Machine prong feedthrough holes (2x per cap)
6. Machine coolant port holes (2x per cap)

### Step 1.7: Rectifier/Regulator Module
1. Assemble SiC MOSFET full-bridge rectifier on PCB
2. Add voltage regulation circuit (48V output, buck converter)
3. Add current sensing and protection
4. Conformal coat PCB for environmental protection
5. Mount in Ti housing (fits inside shaft base)
6. **Quality check:** Apply 50V AC input, verify 48V +/- 0.5V DC output

---

## PHASE 2: SUB-ASSEMBLY

### Step 2.1: Shaft Sub-Assembly
1. Install rectifier module into shaft base cavity
2. Route rectifier input wires to collection ring connection points
3. Route rectifier output wires to prong connection points
4. Seal all wire entry points with high-temp silicone
5. **Quality check:** Verify no shorts between bus bars, shield, and shaft body

### Step 2.2: Plate Stack Sub-Assembly
1. Slide plate 1 (CW) onto shaft — verify free rotation, no contact
2. Install spacer ring (defines 8mm mercury gap)
3. Slide plate 2 (CCW) onto shaft — verify free rotation
4. Repeat for plates 3, 4, 5 (alternating CW/CCW)
5. Verify all plates rotate freely and independently
6. **Quality check:** Spin each plate by hand, verify >10 seconds free-spin time

### Step 2.3: Shell Sub-Assembly
1. Install AMFOS coils into mounting positions on shell interior (24 total)
2. Install magnetometers into mounting positions (12 total)
3. Route all AMFOS and magnetometer wiring through shell channels
4. Assemble Halbach shell halves around plate stack
5. Verify plates are centered and magnetically levitated
6. **Quality check:** Gaussmeter scan exterior confirms <0.01T (Halbach null)

---

## PHASE 3: FINAL ASSEMBLY

### Step 3.1: Mercury Fill (HAZARDOUS — FOLLOW ALL PPE PROTOCOLS)
1. Position unit upright in fume hood
2. Remove top cap (bottom cap installed with shaft and seals)
3. Calculate required mercury volume: 108 cm³ (1,460g)
4. Using sealed syringe system, inject triple-distilled mercury (99.99%) into each gap
5. Fill each gap to exactly 8mm depth (27 cm³ per gap)
6. Allow mercury to settle for 5 minutes
7. Verify mercury level in all 4 gaps using inspection port
8. **Quality check:** Total mercury mass 1,460g +/- 10g (weigh before and after)

### Step 3.2: Top Cap Installation
1. Apply ferrofluid to shaft seal groove in top cap
2. Insert Viton O-rings into grooves (2x)
3. Lower top cap onto assembly, aligning shaft through center bore
4. Verify ferrofluid forms complete seal around shaft
5. Torque 8x M4 Ti fasteners to 3.5 Nm (cap to shell)
6. Install prong feedthroughs (2x Ti prongs, gold-plated tips)
7. Wire prongs to rectifier output through shaft
8. Seal all penetrations with aerospace-grade sealant

### Step 3.3: Cooling Jacket Integration
1. Slide cooling jacket over assembled ESCU core
2. Verify jacket slides freely with 0.5mm clearance
3. Connect coolant inlet/outlet ports to cap fittings
4. Seal all connections with EPDM compression fittings
5. Fill cooling loop with 3.5% NaCl saltwater (120mL)
6. Bleed all air from cooling channels
7. **Quality check:** Pressure test complete assembly to 3 bar, 30 minutes, zero leaks

### Step 3.4: Leak Testing
1. Connect helium leak detector to mercury chamber test port
2. Flood exterior with helium gas
3. Verify leak rate <1 x 10⁻⁸ mbar·L/s (hermetic seal)
4. Seal test port permanently
5. **Quality check:** Mercury vapor detector reads <0.01 mg/m³ at shell exterior

---

## PHASE 4: COMMISSIONING

### Step 4.1: AMFOS Calibration
1. Connect AMFOS controller (DSP board)
2. Power magnetometers, verify all 12 reading valid data
3. Calibrate magnetometer offsets (zero-field reference)
4. Enable AMFOS control loop at low gain
5. Verify all 24 coils responding to control signals
6. Gradually increase gain while monitoring plate levitation stability
7. **Quality check:** All plates magnetically levitated with <0.5mm oscillation

### Step 4.2: Kickstart Test
1. Connect external 48V DC power supply to prongs
2. Set current limit to 20A
3. Apply power — AMFOS should begin rotating plates
4. Monitor rotation speed via back-EMF waveform on oscilloscope
5. Verify rotation increases from 0 to >200 rad/s within 15 seconds
6. At >200 rad/s, ESCU becomes self-sustaining
7. Remove external power supply
8. Verify ESCU maintains rotation and produces 48V DC output
9. **Quality check:** Output voltage 48V +/- 0.5V, current capacity >50A

### Step 4.3: Full Load Test
1. Connect 48V 50A resistive load (2,400W)
2. Run ESCU at full load for 1 hour continuous
3. Monitor: output voltage, current, temperature at 5-minute intervals
4. Verify temperature stabilizes below 55°C with cooling active
5. Verify voltage remains 48V +/- 0.5V under full load
6. Remove load, verify ESCU enters idle mode (reduced rotation)
7. **ESCU IS NOW COMMISSIONED AND READY FOR BODY INSTALLATION**

---

## PHASE 5: BODY INSTALLATION

1. Mount ESCU in chest cavity cradle (3x vibration-isolated mounts)
2. Connect coolant lines to body cooling loop
3. Connect power prongs to power distribution board
4. Install mu-metal shield between ESCU and server
5. Perform kickstart using body battery (48V 20A for 30 seconds)
6. Verify self-sustaining operation
7. Connect AMFOS controller to body CAN bus
8. Run full diagnostic

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
