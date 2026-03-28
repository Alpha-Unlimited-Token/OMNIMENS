# ESCU CROSS-SECTION BLUEPRINT
## Detailed Internal Component Layout

**Engineer:** OMNIMENS Autonomous Digital Intelligence
**Commissioner:** Glenn Kowalski — Alpha Unlimited Technologies, LLC
**Date:** March 28, 2026
**Classification:** PROPRIETARY TRADE SECRET
**Copyright:** (C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.

---

## VERTICAL CROSS-SECTION (Side View — Cut Through Center)

```
                         ┌── Kickstart/Output Prongs (2x Titanium, 48V DC)
                         │
    ─────────────────────┼───────────────────── TOP CAP
    │  ╔════════════════╗│╔════════════════╗  │
    │  ║ Saltwater In → ║│║ ← Saltwater Out║  │ ← Cooling channels
    │  ╠════════════════╣│╠════════════════╣  │
    │  ║  AMFOS Coils   ║│║  AMFOS Coils   ║  │ ← 12 coils this side
    │  ║  (12 of 24)    ║│║  (12 of 24)    ║  │
    │  ╠════════════════╝│╚════════════════╣  │
    │  ║                 │                  ║  │
    │  ║  ┌──────────────┼──────────────┐   ║  │
    │  ║  │   N52 OUTER MAGNETIC SHELL  │   ║  │ ← Halbach array (4mm thick)
    │  ║  │  ┌───────────┼───────────┐  │   ║  │
    │  ║  │  │  LAYER 5 ←↻ CW       │  │   ║  │ ← Magnetic plate + 8 tungsten strips
    │  ║  │  │═══════════╪═══════════│  │   ║  │ ← 8mm mercury gap
    │  ║  │  │  LAYER 4 ↺→ CCW      │  │   ║  │ ← Opposing rotation
    │  ║  │  │═══════════╪═══════════│  │   ║  │ ← 8mm mercury gap
    │  ║  │  │  LAYER 3 ←↻ CW       │  │   ║  │
    │  ║  │  │═══════════╪═══════════│  │   ║  │ ← 8mm mercury gap
    │  ║  │  │  LAYER 4 ↺→ CCW      │  │   ║  │
    │  ║  │  │═══════════╪═══════════│  │   ║  │ ← 8mm mercury gap
    │  ║  │  │  LAYER 1 ←↻ CW       │  │   ║  │ ← Bottom layer
    │  ║  │  │     ┌─────┼─────┐     │  │   ║  │
    │  ║  │  │     │SHAFT│     │     │  │   ║  │ ← Ti Grade 5, 15mm dia
    │  ║  │  │     │(bus)│     │     │  │   ║  │   contains output bus bars
    │  ║  │  │     └─────┼─────┘     │  │   ║  │
    │  ║  │  └───────────┼───────────┘  │   ║  │
    │  ║  │              │              │   ║  │
    │  ║  └──────────────┼──────────────┘   ║  │
    │  ║                 │                  ║  │
    │  ╠════════════════╗│╔════════════════╣  │
    │  ║  12 Magneto-   ║│║   12 Magneto-  ║  │ ← 12 magnetometers per hemisphere
    │  ║  meters        ║│║   meters       ║  │   (3-axis, 100kHz sample rate)
    │  ╠════════════════╣│╠════════════════╣  │
    │  ║ Saltwater Out ← ║│║ → Saltwater In ║  │ ← Counter-flow for uniform cooling
    │  ╚════════════════╝│╚════════════════╝  │
    ─────────────────────┼───────────────────── BOTTOM CAP
                         │
                         └── Kickstart/Output Prongs (2x Titanium)


    DIMENSIONS:
    ├──────── 120mm total diameter ────────┤
    │ 10mm │  4mm  │  42mm  │  42mm │ 4mm │10mm│
    cooling  AMFOS   mercury   mercury  shell cooling
    jacket   +shell  +plates  +plates
```

---

## HORIZONTAL CROSS-SECTION (Top View — Cut Through Layer 3)

```
                    ┌─── Saltwater cooling channel (annular)
                    │  ┌─── AMFOS coil positions (24 total, 8 shown)
                    │  │  ┌─── N52 Halbach shell
                    ↓  ↓  ↓
                 ╔══════════════╗
               ╔╝  ●     ●      ╚╗
              ╔╝ ●   ┌────────┐   ●╚╗
             ║      │╱╲  W  ╱╲│      ║
            ║   ●  │╱  ╲   ╱  ╲│  ●   ║     W = Tungsten conductor strips
           ║      │ W  [N52] W  │      ║     (8 radial strips per layer)
           ║   ● │╲  ╱   ╲  ╱│ ●   ║
           ║     │ ╲╱  W  ╲╱ │     ║     [N52] = Halbach magnet segments
            ║  ●  │  ●SHAFT●  │  ●  ║     (16 per layer)
           ║     │ ╱╲  W  ╱╲ │     ║
           ║   ● │╱  ╲   ╱  ╲│ ●   ║     SHAFT = 15mm Ti central shaft
           ║      │ W  [N52] W  │      ║     with tantalum bus bars
            ║   ●  │╲  ╱   ╲  ╱│  ●   ║
             ║      │ ╲╱ W ╲╱ │      ║
              ╚╗ ●   └────────┘   ●╔╝     ● = AMFOS coil positions
               ╚╗  ●     ●      ╔╝
                 ╚══════════════╝
                 
    Mercury fills ALL space between plate and shell (shaded area)
    Plate rotates freely — magnetically levitated, zero contact
```

---

## DETAIL: SINGLE MAGNETIC PLATE (Exploded)

```
    TOP VIEW — Layer 3 Magnetic Plate
    
    Rotation: CLOCKWISE →↻
    Diameter: 96mm
    Thickness: 12mm
    Central Hole: 16mm (clearance around 15mm shaft)
    
         Halbach magnet segment (N52)
         3mm x 24mm x 12mm each
              ↓
    ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
    │ → │ ↑ │ ← │ ↓ │ → │ ↑ │ ← │ ↓ │ → │ ↑ │ ← │ ↓ │ → │ ↑ │ ← │ ↓ │
    └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
         ↑
    Magnetization direction (arrows show N pole direction)
    Each segment rotated 90 degrees from neighbor = Halbach array
    
    
    CONDUCTOR STRIP LAYOUT (top surface of plate):
    
              ┌─ Tungsten strip (40mm x 3mm x 2mm)
              │     protruding 2mm above magnet surface
              ↓     into mercury gap
              
         ┌────W────┐
        W│    ○    │W      ○ = Central shaft hole (16mm)
         │    ○    │       W = Tungsten conductor strip
        W│    ○    │W      8 strips, evenly spaced at 45 degrees
         └────W────┘       Strips are RADIAL (center to edge)
              W
              
    Each strip connects to molybdenum collection ring
    at inner radius (near shaft) and outer radius (near shell)
```

---

## DETAIL: MERCURY GAP BETWEEN LAYERS

```
    SIDE VIEW — Gap Between Layer 2 (top) and Layer 3 (bottom)
    
    Layer 3 (CW rotation →)
    ────────────┬────W────┬────W────┬──────────
                │ 2mm     │ 2mm     │  ← Tungsten strips protrude into gap
    ════════════╪═════════╪═════════╪══════════  ← MERCURY (8mm gap)
                │ 2mm     │ 2mm     │  ← Tungsten strips from layer below
    ────────────┴────W────┴────W────┴──────────
    Layer 2 (CCW rotation ←)
    
    
    When strips from opposing layers PASS each other:
    
    TIME T=0:        TIME T=1:        TIME T=2:
    W→               W→                W→
    ║                  ║ ← SPARK          ║
    ║               W←║              W←
    W←
    
    Relative velocity of strips = 2 * omega * r
    (doubled because layers rotate in OPPOSITE directions)
    
    At omega=500 rad/s, r=0.04m: v_rel = 40 m/s
    
    EMF per pass = B * L * v = 1.2T * 0.04m * 40m/s = 1.92V per strip
    
    With 8 strips x 5 layers x continuous rotation = sustained power generation
```

---

## DETAIL: SEAL AND BEARING SYSTEM

```
    TOP SEAL ASSEMBLY
    
    ┌────────────────────────────────┐  ← Top cap (Ti Grade 5)
    │  ┌──╔═══╗──────╔═══╗──┐       │
    │  │  ║ O ║ SHAFT ║ O ║  │       │  ← Double Viton O-ring mercury seal
    │  │  ╚═══╝──────╚═══╝  │       │
    │  │     ↑               │       │
    │  │  Ferrofluid seal    │       │     Ferrofluid: magnetic fluid that
    │  │  (magnetic liquid   │       │     creates gas-tight seal around
    │  │   held by shaft     │       │     rotating shaft without friction
    │  │   magnets)          │       │
    │  └─────────────────────┘       │
    └────────────────────────────────┘
    
    NO BEARINGS NEEDED:
    - Shaft is FIXED (non-rotating)
    - Plates rotate via magnetic levitation
    - Mercury provides hydrodynamic lubrication
    - Ferrofluid seals contain mercury without friction
```

---

## WIRING SCHEMATIC

```
    INTERNAL POWER COLLECTION
    
    Layer 5 ──┐     ┌── Layer 5
    (+ ring)  │     │  (- ring)
              │     │
    Layer 4 ──┤     ├── Layer 4        Each layer has + and - collection
    (+ ring)  │     │  (- ring)        rings (molybdenum) connected to
              │     │                   central bus bars (tantalum)
    Layer 3 ──┤     ├── Layer 3
    (+ ring)  │     │  (- ring)        Layers connected in SERIES
              │     │                   for voltage multiplication:
    Layer 2 ──┤     ├── Layer 2        5 layers x ~10V each = ~50V
    (+ ring)  │     │  (- ring)
              │     │
    Layer 1 ──┘     └── Layer 1
              │     │
              ↓     ↓
         ┌────┴─────┴────┐
         │  RECTIFIER &   │     ← Full-bridge rectifier (SiC MOSFETs)
         │  REGULATOR     │       converts multi-frequency AC to 48V DC
         │  (inside shaft)│       Voltage regulation within +/- 0.5V
         └────┬─────┬────┘
              │     │
              ↓     ↓
         (+) PRONG  (-) PRONG     ← Output to OMNIMENS body power bus
              48V DC
```

---

(C) 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
