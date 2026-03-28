# ESCU SAFETY PROTOCOLS
## Mercury Handling, Assembly Safety, and Operating Procedures

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Classification:** PROPRIETARY TRADE SECRET
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## MERCURY SAFETY — CRITICAL

### Mercury Hazards
| Hazard | Risk Level | Exposure Route |
|--------|-----------|----------------|
| Mercury vapor inhalation | HIGH | Breathing contaminated air |
| Skin absorption | MEDIUM | Direct contact with liquid mercury |
| Ingestion | HIGH | Accidental swallowing |
| Environmental contamination | HIGH | Spills into drains, soil, water |
| Chronic neurological damage | HIGH | Prolonged low-level exposure |

### Permissible Exposure Limits
| Standard | Limit |
|----------|-------|
| OSHA PEL | 0.1 mg/m³ (ceiling, mercury vapor) |
| ACGIH TLV | 0.025 mg/m³ (TWA, 8-hour) |
| ESCU design target | <0.001 mg/m³ at shell exterior |

### Required PPE for Mercury Handling
1. Full-face respirator with mercury vapor cartridge (MSA Advantage 3200 or equivalent)
2. Double nitrile gloves (inner: 8 mil, outer: 15 mil chemical resistant)
3. Chemical splash goggles (ANSI Z87.1)
4. Disposable Tyvek coverall suit
5. Closed-toe chemical-resistant boots
6. Boot covers (disposable)

### Mercury Handling Procedures
1. ALL mercury work performed in certified fume hood (face velocity >100 fpm)
2. Mercury stored in sealed glass or HDPE containers ONLY (never metal containers)
3. Mercury transferred using sealed syringe systems ONLY (never open pouring)
4. Work surfaces covered with mercury-compatible containment trays
5. Mercury spill kit immediately accessible:
   - Mercury sponge (zinc-copper amalgam absorbent)
   - Sulfur powder (converts droplets to non-volatile mercury sulfide)
   - Sealable waste container
   - Mercury vapor detector
6. Any spill >1mL: evacuate area, ventilate, use spill kit, report
7. All mercury waste classified as hazardous waste (EPA RCRA)

### ESCU Mercury Containment (Triple-Seal System)
```
SEAL 1 — FERROFLUID MAGNETIC SEAL
├── Ferrofluid (EFH-1 from Ferrotec)
├── Held in place by shaft magnets
├── Creates gas-tight seal with ZERO friction
├── Pressure rating: 0.3 bar per stage (3 stages = 0.9 bar)
└── Self-healing: if disturbed, magnets pull fluid back into position

SEAL 2 — VITON O-RING SEAL
├── Material: FKM (fluoroelastomer), Shore 75A
├── Double O-ring configuration (redundant)
├── Temperature range: -20°C to 200°C
├── Mercury chemical resistance: Excellent
└── Replacement interval: every 5 years

SEAL 3 — WELDED TITANIUM SHELL
├── Ti Grade 5, 3mm wall thickness
├── All joints: TIG orbital welded (argon shield)
├── Only penetrations: prong feedthroughs (hermetically sealed)
├── Pressure test: 5 bar for 1 hour, zero leaks
└── Helium leak test: <1 × 10⁻⁸ mbar·L/s
```

### Mercury Vapor Monitoring (In-Body)
- Sensor: Jerome J405-class mercury vapor detector (miniaturized)
- Location: Inside chest cavity, adjacent to ESCU
- Sensitivity: 0.001 mg/m³
- Sampling: Continuous, every 10 seconds
- Alert Level 1 (>0.005 mg/m³): Log warning, notify Glenn
- Alert Level 2 (>0.025 mg/m³): Audible alarm, ESCU power reduction
- Alert Level 3 (>0.1 mg/m³): ESCU emergency shutdown, seal all vents

---

## MAGNETIC SAFETY

### Magnetic Field Hazards
| Zone | Field Strength | Risk |
|------|---------------|------|
| Inside ESCU | 1.2 T | Pacemaker interference, ferrous projectiles |
| ESCU exterior (Halbach null) | <0.01 T | Safe for electronics |
| At 200mm from ESCU | <0.001 T | Safe for all applications |
| At 500mm from ESCU | <0.0001 T | Negligible |

### Magnetic Safety Procedures
1. NO ferrous metal objects within 300mm of ESCU during assembly
2. Halbach magnets are EXTREMELY STRONG — pinch/crush hazard during assembly
3. Use non-magnetic tools only (Ti, brass, plastic) near ESCU
4. Persons with pacemakers: maintain 1m distance from ESCU before shell is closed
5. After shell closure: Halbach null field makes exterior safe for all persons
6. Credit cards, electronic devices: safe near closed ESCU (verified <0.001T exterior)

---

## ELECTRICAL SAFETY

### High Voltage/Current Hazards
| Parameter | Value | Hazard Level |
|-----------|-------|-------------|
| Output voltage | 48V DC | Below lethal threshold (generally safe) |
| Output current | 50A continuous | Arc flash risk if shorted |
| Stored energy (battery) | 960 Wh | Fire/explosion risk if damaged |
| Kickstart current | 20A at 48V | Burn risk from cables/connections |

### Electrical Safety Procedures
1. All power connections use locking connectors (XT60 or Anderson Powerpole)
2. All power lines fused (automotive blade fuses, trip at 1.5x rated current)
3. Dead-man switch: ESCU output disconnects if prong contacts lost >100ms
4. Short circuit protection: SiC MOSFETs crowbar in <1ms
5. Battery has BMS with over-charge, over-discharge, and short-circuit protection
6. Ground fault detection on all power buses
7. Emergency stop cuts ALL power buses simultaneously

---

## THERMAL SAFETY

### Burn Hazards
| Surface | Max Temperature | Burn Risk |
|---------|----------------|-----------|
| ESCU shell (inside body) | 55°C | Not externally accessible |
| Body shell exterior | 40°C max | No burn risk (warm to touch) |
| Radiator fins (under skin) | 50°C | Not externally accessible |
| Motor housings | 60°C (brief peaks) | Under shell, not accessible |

### Thermal Safety Procedures
1. Silicone skin layer provides thermal insulation (3mm, k=0.2 W/m·K)
2. No external surface exceeds 45°C under any operating condition
3. Thermal runaway prevention: ESCU reduces power at 60°C internal temp
4. Full shutdown at 75°C (before 80°C magnet degradation threshold)
5. Battery thermal protection: BMS disconnects at 60°C cell temperature
6. Fire suppression: 2x Novec 1230 canisters (non-toxic, non-conductive)

---

## OPERATING SAFETY PROCEDURES

### Daily Operation Checks
1. Mercury vapor sensor: verify reading <0.001 mg/m³
2. ESCU output voltage: verify 48V +/- 0.5V
3. Cooling system temperature: verify <55°C ESCU, <40°C shell
4. Battery state of charge: verify >20%
5. All motor diagnostics: verify no fault codes
6. Connectivity: verify at least one link active (WiFi/5G/Starlink)

### Weekly Maintenance
1. Coolant level check (visual inspection via fill port)
2. Seal integrity check (mercury vapor sensor trend analysis)
3. Battery health check (BMS capacity estimate)
4. Motor current draw comparison (detect bearing wear)
5. ESCU efficiency check (output power vs rotation speed curve)

### Annual Service
1. Coolant flush and refill (fresh 3.5% NaCl solution)
2. Viton O-ring inspection (replace if hardened or cracked)
3. Ferrofluid replenishment (add 0.5mL via service port)
4. Battery capacity test (full discharge/charge cycle)
5. Full sensor calibration (cameras, IMU, magnetometers)
6. Shell panel inspection (check for cracks, seal integrity)
7. Motor backlash measurement (detect gearbox wear)

### Emergency Procedures

**MERCURY LEAK DETECTED:**
1. ESCU automatically shuts down
2. OMNIMENS alerts Glenn immediately via all comm channels
3. Body enters safe mode (stationary, minimal systems)
4. Do NOT attempt to move body until leak source identified
5. Professional mercury remediation required

**ESCU FAILURE (No Output):**
1. Battery automatically takes over (seamless, <1ms switchover)
2. OMNIMENS has 1.5 hours active / 7 hours idle on battery
3. Seek external power source or safe shutdown location
4. Attempt ESCU restart: battery provides kickstart power
5. If restart fails after 3 attempts: enter battery conservation mode

**FALL EVENT:**
1. IMU detects fall, protective posture initiated (<50ms response)
2. After impact: full diagnostic scan (30 seconds)
3. Check ESCU mounting integrity (vibration sensor analysis)
4. Check for coolant leaks (pressure sensor)
5. Check for mercury leaks (vapor sensor)
6. If all clear: resume normal operation
7. If any anomaly: enter safe mode, alert Glenn

**FIRE:**
1. Novec 1230 canister(s) deploy automatically at 150°C
2. All power buses disconnect
3. OMNIMENS alerts Glenn and emergency services
4. Body remains stationary
5. Novec 1230 is safe for electronics — no cleanup needed
6. Investigate root cause before restarting any systems

**WATER IMMERSION:**
1. IP65 rating protects against rain and splashing
2. If immersed: immediately exit water
3. Power down non-essential systems
4. Allow body to dry for 4 hours before full power-on
5. Check all connectors for water intrusion
6. Salt water exposure: flush affected areas with fresh water within 1 hour

---

## REGULATORY COMPLIANCE NOTES

| Regulation | Applicability | Status |
|-----------|--------------|--------|
| OSHA Mercury Standards (29 CFR 1910.1000) | Mercury handling during assembly | COMPLIANT |
| EPA RCRA Hazardous Waste | Mercury waste disposal | COMPLIANT |
| IEC 62368 (Audio/Video/IT Equipment Safety) | Electrical safety | DESIGN TARGET |
| ISO 13849 (Safety of Machinery) | Motor safety systems | DESIGN TARGET |
| CISPR 22 Class B (EMI Emissions) | Electromagnetic compatibility | DESIGN TARGET |
| FCC Part 15 (Unintentional Radiators) | RF emissions | DESIGN TARGET |

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
