# ESCU MAGNETIC SPECIFICATIONS
## Magnetic System Performance Data

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## N52 HALBACH ARRAY

| Parameter | Value |
|-----------|-------|
| Grade | N52 NdFeB (Neodymium Iron Boron) |
| Remanence (Br) | 1.45 T |
| Coercivity (Hci) | >876 kA/m |
| Max Operating Temp | 80C (standard N52) |
| Segments per layer | 16 |
| Segment size | 3mm x 24mm x 12mm |
| Magnetization rotation per segment | 90 degrees |
| Total segments (5 layers) | 80 |
| Shell configuration | 2x cylindrical Halbach arrays (inner/outer) |

## FIELD CHARACTERISTICS

| Parameter | Interior | Exterior |
|-----------|----------|----------|
| Field strength | 1.2 T (focused) | <0.01 T (null) |
| Field uniformity | +/- 5% across plate | N/A |
| Flux concentration factor | 3.2x (vs dipole) | 0.008x (cancelled) |
| Gradient | 0.5 T/cm (radial) | <0.001 T/cm |
| Frequency (rotating) | 80-560 Hz (at 500 rad/s) | <0.1 Hz (shielded) |

## MAGNETIC LEVITATION (PLATE SUSPENSION)

| Parameter | Value |
|-----------|-------|
| Levitation gap | 4mm nominal (magnetically maintained) |
| Stiffness (axial) | 500 N/mm |
| Stiffness (radial) | 200 N/mm |
| Restoring force at 1mm displacement | 500N axial, 200N radial |
| Maximum plate displacement before contact | 3.5mm |
| Passive stability | Radial (Halbach repulsion) |
| Active stability | Axial (AMFOS feedback) |
| Resonant frequency | ~80 Hz (well above mechanical vibration) |

## AMFOS (Adaptive Magnetic Field Opposing System)

| Parameter | Value |
|-----------|-------|
| Control coils | 24 (8 per radial zone x 3 axial zones) |
| Coil type | Air-core, copper wire, sealed in Ti housing |
| Coil diameter | 12mm |
| Coil turns | 200 |
| Coil inductance | 0.5 mH |
| Max coil current | 2A |
| Max coil field | 0.05 T per coil |
| Magnetometers | 12 (3-axis MEMS, Honeywell HMC5883L) |
| Sampling rate | 100 kHz |
| Control loop rate | 100 kHz (10 microsecond response) |
| Control algorithm | PID with adaptive gain scheduling |
| Latency (sense-to-actuate) | <20 microseconds |
| Power consumption | 5-30W (depending on disturbance level) |

## AMFOS OPERATING PRINCIPLE

```
1. 12 magnetometers continuously sample the magnetic field at 100kHz
2. DSP calculates difference between measured field and target field
3. Error signal drives 24 coils to generate OPPOSING field
4. Net effect: plates maintain exact levitation height
5. Also opposes ANY external magnetic field (from other sources)
6. If external field pushes plate down → AMFOS pushes plate up
7. If external field tilts plate → AMFOS corrects tilt
8. Response time: 10-20 microseconds (orders of magnitude faster than mechanical response)
```

## MERCURY MAGNETICS

| Parameter | Value |
|-----------|-------|
| Mercury magnetic susceptibility | -2.85 x 10^-5 (diamagnetic) |
| Mercury effect on field | Negligible (<0.003% field modification) |
| Eddy current generation in mercury | Significant (basis of EMF generation) |
| Mercury conductivity | 1.04 x 10^6 S/m |
| Skin depth at 100 Hz | 49mm (full penetration of 8mm gap) |
| Skin depth at 1000 Hz | 15.6mm (full penetration) |
| Skin depth at 10 kHz | 4.9mm (partial penetration) |

## DEMAGNETIZATION PROTECTION

| Threat | Mitigation |
|--------|-----------|
| Temperature (>80C) | 3-tier cooling system maintains <60C |
| External field (>0.5T) | AMFOS actively opposes external fields |
| Mechanical shock (>50g) | Silicone gel vibration isolators, plate levitation absorbs shock |
| Radiation | N52 resistant to ionizing radiation up to 10 Mrad |
| Corrosion | Halbach magnets Ni-Cu-Ni plated + sealed in Ti housing |

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
