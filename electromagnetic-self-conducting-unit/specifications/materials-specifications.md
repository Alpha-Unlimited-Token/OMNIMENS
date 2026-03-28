# ESCU MATERIALS SPECIFICATIONS
## Complete Materials List with Properties

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## MERCURY-SAFE MATERIALS ONLY

CRITICAL: All materials in contact with mercury must be mercury-resistant. The following materials are APPROVED and REJECTED:

### APPROVED (Mercury-Resistant)

| Material | Use In ESCU | Why Safe |
|----------|-------------|----------|
| Tungsten (W) | Conductor strips | Does NOT amalgamate with mercury at any temperature |
| Molybdenum (Mo) | Collection rings | No mercury amalgamation, excellent conductor |
| Tantalum (Ta) | Bus bars | Mercury-resistant, corrosion-proof, good conductor |
| Titanium Grade 5 | Shell, shaft, caps | Completely inert to mercury |
| Titanium Grade 2 | Cooling jacket walls | Mercury-resistant, better thermal conductivity |
| Stainless Steel 316L | Fasteners, fittings | Mercury-resistant at operating temperatures |
| Niobium (Nb) | Backup conductor option | Mercury-resistant superconductor potential |
| Viton (FKM) | O-ring seals | Chemical resistance to mercury vapor |
| EPDM Rubber | Cooling system seals | Not in contact with mercury |
| Hastelloy C-276 | Cooling channel walls | Ultimate corrosion resistance |
| Silicon Carbide (SiC) | Rectifier MOSFETs | Semiconductor, no mercury contact |
| Ferrofluid | Shaft seals | Magnetically held, seals mercury |

### REJECTED (Mercury-Reactive)

| Material | Reason for Rejection |
|----------|---------------------|
| Copper (Cu) | AMALGAMATES with mercury — dissolves into Cu-Hg amalgam |
| Aluminum (Al) | AMALGAMATES violently — mercury penetrates oxide layer, destroys structure |
| Iron (Fe) | Can amalgamate under sustained exposure |
| Gold (Au) | Readily amalgamates — only safe as thin external plating (prong tips) |
| Silver (Ag) | Amalgamates easily — dental amalgam component |
| Zinc (Zn) | Readily amalgamates |
| Tin (Sn) | Amalgamates at room temperature |
| Lead (Pb) | Amalgamates + toxic |

---

## DETAILED MATERIAL PROPERTIES

### Tungsten (W) — Conductor Strips
| Property | Value |
|----------|-------|
| Density | 19,300 kg/m³ |
| Melting Point | 3,422°C |
| Electrical Resistivity | 5.28 × 10⁻⁸ Ω·m |
| Thermal Conductivity | 174 W/(m·K) |
| Tensile Strength | 1,510 MPa |
| Hardness | 7.5 Mohs |
| Mercury Resistance | Excellent — no amalgamation |
| Strip dimensions | 40mm × 3mm × 2mm |
| Quantity | 40 strips (8 per layer × 5 layers) |
| Total tungsten mass | 185g |

### Molybdenum (Mo) — Collection Rings
| Property | Value |
|----------|-------|
| Density | 10,220 kg/m³ |
| Melting Point | 2,623°C |
| Electrical Resistivity | 5.34 × 10⁻⁸ Ω·m |
| Thermal Conductivity | 138 W/(m·K) |
| Mercury Resistance | Excellent |
| Ring dimensions | 30mm ID / 32mm OD × 2mm (inner), 115mm ID / 117mm OD × 2mm (outer) |
| Quantity | 10 rings (2 per layer × 5 layers) |
| Total molybdenum mass | 95g |

### Tantalum (Ta) — Central Bus Bars
| Property | Value |
|----------|-------|
| Density | 16,690 kg/m³ |
| Melting Point | 3,017°C |
| Electrical Resistivity | 13.5 × 10⁻⁸ Ω·m |
| Thermal Conductivity | 57.5 W/(m·K) |
| Mercury Resistance | Excellent — completely inert |
| Bar dimensions | 4mm diameter × 180mm length |
| Quantity | 2 (positive and negative) |
| Total tantalum mass | 30g |

### Titanium Grade 5 (Ti-6Al-4V) — Shell, Shaft, Caps
| Property | Value |
|----------|-------|
| Density | 4,430 kg/m³ |
| Melting Point | 1,660°C |
| Tensile Strength | 950 MPa |
| Thermal Conductivity | 6.7 W/(m·K) |
| Mercury Resistance | Excellent |
| Components | Outer shell, top/bottom caps, central shaft, cradle |
| Total titanium mass | ~2,800g |

### N52 NdFeB — Halbach Array Magnets
| Property | Value |
|----------|-------|
| Density | 7,500 kg/m³ |
| Remanence (Br) | 1.45 T |
| Max Energy Product (BHmax) | 52 MGOe |
| Curie Temperature | 312°C |
| Max Operating Temperature | 80°C (standard N52) |
| Coating | Ni-Cu-Ni (triple layer, 15-25 μm) |
| Segment size | 3mm × 24mm × 12mm |
| Total segments | 80 (Halbach shell) + 80×5 (plate magnets) = 480 |
| Total magnet mass | ~780g |

### Mercury (Hg) — Working Fluid
| Property | Value |
|----------|-------|
| Density | 13,534 kg/m³ |
| Melting Point | -38.83°C |
| Boiling Point | 356.73°C |
| Electrical Conductivity | 1.04 × 10⁶ S/m |
| Thermal Conductivity | 8.3 W/(m·K) |
| Dynamic Viscosity | 1.526 × 10⁻³ Pa·s |
| Surface Tension | 0.487 N/m |
| Purity Required | 99.99% (triple-distilled) |
| Gap volume (per gap) | ~27 cm³ |
| Total mercury volume | ~108 cm³ |
| Total mercury mass | ~1,460g |

---

## MASS BUDGET

| Component | Material | Mass (g) |
|-----------|----------|----------|
| Outer shell | Ti Gr.5 | 1,200 |
| Top/bottom caps | Ti Gr.5 | 400 |
| Central shaft | Ti Gr.5 | 120 |
| Cooling jacket | Ti Gr.2 + Hastelloy | 350 |
| Halbach shell magnets | N52 NdFeB | 280 |
| Magnetic plate magnets | N52 NdFeB | 500 |
| Plate frames | Ti Gr.5 | 400 |
| Conductor strips | Tungsten | 185 |
| Collection rings | Molybdenum | 95 |
| Bus bars | Tantalum | 30 |
| Mercury (Hg) | Hg 99.99% | 1,460 |
| AMFOS coils (24) | Copper (sealed) | 180 |
| Magnetometers (12) | MEMS IC | 5 |
| Rectifier/regulator | SiC PCB | 25 |
| Seals (Viton, ferrofluid) | Various | 15 |
| Fasteners | 316L SS | 30 |
| Vibration isolators | Silicone gel | 20 |
| Mu-metal shield | Ni-Fe | 120 |
| Misc (wiring, insulators) | Various | 35 |
| **TOTAL** | — | **4,200g (4.2kg)** |

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
