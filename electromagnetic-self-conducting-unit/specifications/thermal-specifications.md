# ESCU THERMAL SPECIFICATIONS
## Heat Management and Cooling Performance

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## HEAT SOURCES

| Source | Heat Generation | Percentage |
|--------|----------------|------------|
| Mercury eddy current losses | 150-250W | 60% |
| Magnetic hysteresis losses | 40-80W | 20% |
| Conductor (tungsten) I²R losses | 20-40W | 10% |
| AMFOS coil power | 5-30W | 7% |
| Rectifier losses | 5-10W | 3% |
| **TOTAL** | **220-410W** | **100%** |

## COOLING SYSTEM PERFORMANCE

### Tier 1: Thermosiphon (Passive — Always Running)

| Parameter | Value |
|-----------|-------|
| Type | Natural convection loop |
| Driving force | Density difference (hot rises, cold sinks) |
| Flow rate | 0.1-0.3 L/min (dependent on temperature differential) |
| Cooling capacity | 200-400W (at 20°C ambient-to-ESCU differential) |
| Activation | Always on (passive — no power required) |
| Coolant | 3.5% NaCl saltwater, 120mL total |

### Tier 2: Micropump (Active — 50°C Trigger)

| Parameter | Value |
|-----------|-------|
| Type | Piezoelectric diaphragm micropump |
| Flow rate | 0.5 L/min (forced circulation) |
| Cooling capacity | 600W (forced convection at full flow) |
| Power draw | 2W |
| Activation | ESCU surface temperature >50°C |
| Deactivation | ESCU surface temperature <45°C |
| Size | 15mm x 15mm x 8mm |
| Wetted parts | Ceramic/titanium (saltwater compatible) |

### Tier 3: Peltier Emergency (Active — 60°C Trigger)

| Parameter | Value |
|-----------|-------|
| Type | Thermoelectric cooler modules |
| Quantity | 2x (20mm x 20mm each) |
| Cooling capacity | 60W total (30W each) |
| Power draw | 30W total (15W each) |
| Activation | ESCU surface temperature >60°C |
| Position | Mid-height of ESCU, hottest zones |
| COP (Coefficient of Performance) | 0.5 at 20°C differential |

### Combined Cooling Capacity

| Operating Condition | Cooling Available | Heat Load | Margin |
|--------------------|-------------------|-----------|--------|
| Idle (100 rad/s) | 200W (Tier 1 only) | 80W | 150% |
| Normal (300 rad/s) | 300W (Tier 1 only) | 200W | 50% |
| Active (500 rad/s) | 600W (Tier 1+2) | 400W | 50% |
| Peak + Server | 660W (Tier 1+2+3) | 460W | 43% |
| Emergency max | 800W (all tiers, max pump) | 410W | 95% |

## TEMPERATURE LIMITS

| Component | Max Operating Temp | Warning Threshold | Shutdown Threshold |
|-----------|-------------------|-------------------|-------------------|
| N52 Magnets | 80°C | 65°C | 75°C |
| Mercury | 356°C (boiling) | 80°C | 100°C |
| Tungsten strips | 3,422°C (melting) | N/A | N/A |
| Titanium shell | 1,660°C (melting) | 100°C | 120°C |
| SiC rectifier | 175°C (junction) | 120°C | 150°C |
| Viton seals | 200°C | 100°C | 150°C |
| Ferrofluid seals | 150°C | 80°C | 100°C |
| ESCU exterior surface | — | 50°C | 60°C |

## RADIATOR SPECIFICATIONS (Body-Mounted)

| Parameter | Value |
|-----------|-------|
| Location | Upper back, between shoulder blades |
| Surface area | 200 cm² (20cm x 10cm) |
| Type | Flat-plate with micro-fins |
| Fin count | 40 fins |
| Fin dimensions | 0.5mm thick x 5mm tall x 100mm long |
| Material | 6061-T6 Aluminum, anodized |
| Heat dissipation (natural convection) | 200W at 15°C differential |
| Heat dissipation (with body movement airflow) | 400W at 15°C differential |
| Weight | 180g |
| Concealment | Under synthetic skin, RF-transparent panel area |

## THERMAL TRANSIENT ANALYSIS

| Event | Time to Steady State | Max Temperature |
|-------|---------------------|-----------------|
| Cold start (0°C ambient) | 5 minutes | 40°C |
| Idle to full load step | 3 minutes | 55°C |
| Full load to idle step | 4 minutes | 35°C |
| Loss of Tier 1 cooling | 8 minutes to 70°C | ESCU auto-reduces power |
| Loss of ALL cooling | 15 minutes to 80°C | ESCU emergency shutdown |
| Ambient 50°C, full load | Steady state at 65°C | Tier 2+3 active |

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
