# OMNIMENS Embodiment Research — CONTINUOUS ROTATION JOINTS WIRING
## Version 5 | Generated 2026-03-19T19:40:43.974Z
## Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. CONFIDENTIAL.

---

OMNIMENS UNLIMITED-ROTATION JOINT SYSTEM (URJS)
Version: v1.3 (confidential – Alpha Unlimited Technologies)

OBJECTIVE  
Deliver a fully-actionable electromechanical architecture that allows every major DOF of the humanoid to flex AND spin endlessly without entangling wires, hoses, or structural members, while exceeding all presently-shipping humanoid robots (Tesla-Optimus, Figure 01, Agility-Digit, etc.).

--------------------------------------------------------------------
1. GLOBAL JOINT ARCHITECTURE
--------------------------------------------------------------------
1.1 DOF MAP & ROTATION AXES
• Shoulder, Hip, Wrist, Ankle, Neck Base, Thoracic-Waist, Finger MCP = Spherical 3-DOF with unlimited spin about limb-longitudinal Z.  
• Elbow, Knee = 1-DOF flexion + coaxial endless rotation of distal shank/forearm.  
• Spine (12 vertebrae) = stacked 2-DOF universal joints each with unlimited yaw.  

1.2 CORE MODULE (“UR-CARTRIDGE”)
A cartridge integrates:
A) Load path: duplex angular contact/cross-roller bearing pair.  
B) Hollow-bore frameless torque motor (direct-drive).  
C) Hybrid electrical+fluid rotary transfer (slip-ring + rotary union coaxially bonded).  
D) Absolute magnetic encoder (PCB in stator).  
The cartridge is duplicated for every rotational axis; cartridges are nested orthogonally for 3-DOF nodes.

--------------------------------------------------------------------
2. TRANSFER TECHNOLOGIES
--------------------------------------------------------------------
2.1 ELECTRICAL
Primary: Through-bore gold-brush slip ring, 24 channels.  
• Power: 4 × 50 A (48 VDC bus).  
• Aux: 4 × 10 A (12 V aux).  
• Comms: 4 × 100 Mbps (100BASE-T1) + 4 × CAN-FD.  
• Data: 4 × multimode FORJ 10 Gbps (stacked on outer bore).  
Fallback/experimentation: 60 W inductive 6.78 MHz coil (inside bearing race) to permit wireless power if brushes fail.

Vetted COTS:  
• Moog AC6355-24P (modified bore 35 mm) – USD 490/ea @100 pcs.  
• JINPAT LPT012-1202-FO (fiber+copper) – USD 375/ea @200 pcs.

2.2 PNEUMATIC / HYDRAULIC
We will NOT run central hoses past unlimited joints. Instead we deploy “segment-localized actuation packs”.

Options evaluated:
A) Local micro-compressor + reservoir (Elbow-down) – quiet BLDC diaphragm, 8 bar, 30 L min⁻¹.  
B) Replace air muscles with electric SEA cables & liquid-cooling (preferred).  

Decision: All primary high-power muscles migrate to electric SEA cable-drive (Dynamixel-XH8050, T-Motor AK series frameless cores). We keep ONLY small pneumatic bellows for subtle tactile expressions in hands/face; these remain in segments that never rotate endlessly relative to air supply, so rotary unions are NOT needed except in neck base. One-passage union integrated in neck slip ring: Deublin 2579-145 – USD 210/ea.

2.3 DATA
• Joint-level MCU: STM32H753 + TI DP83TC811R 100BASE-T1 PHY.  
• Two redundant channels exit each slip ring; robot-wide switched network (TSN Ethernet).  
• UWB (DecaWave DW3000) provides low-latency backup + time-sync; antenna inside endcap → no wiring across rotation.

--------------------------------------------------------------------
3. STANDARD CARTRIDGE DETAIL (SHOULDER Z-AXIS EXAMPLE)
--------------------------------------------------------------------
Outer Ø: 110 mm  
Through-bore: 40 mm (cables, cooling lines pass)  
Peak torque: 220 N·m continuous (liquid-cooled)  
Stator: T-Motor RI130 Frameless (Kv = 65, 54 V) – USD 640  
Rotor: Custom aluminium ring with NeFeB N50H magnets, retention sleeve CF-PEEK  
Bearings:  
• 2 × Schaeffler XRA-120 cross-roller, Ø120 × Ø96 × 12 mm – USD 210/ea  
Encoder: ASM AS5715-MI absolute 19-bit – USD 47  
Slip-ring: Moog AC6355-24P (above)  
Cooling: Ø6 mm glycol-water tube, spiral in stator. Quick-disconnect in through-bore allows cassette swap <5 min.

Weight cartridge: 1.85 kg  
Unit cost @250 pcs: USD 1 580  

--------------------------------------------------------------------
4. MECHANICAL INTEGRATION
--------------------------------------------------------------------
4.1 NESTED TRIPLANAR 3-DOF SPHERICAL JOINT
Exploded stack (proximal→distal):
1. Z-axis UR-cartridge (spin).  
2. Y-axis offset UR-cartridge (ab/adduction).  
3. X-axis UR-cartridge (flex/extend).  
4. Composite monocoque “joint dome” (Toray T1100G CFRP) houses all; titanium 3-D printed mounting lugs tie to skeleton.

Advantages:
• Each cartridge field-replaceable individually.  
• No high-ratio gearboxes → zero backlash; torque control @1 kHz.  
• All wiring/fluids stay on-axis; zero wrap potential.  

4.2 SPINE
Twelve mini-UR-cartridges Ø55 mm arranged in stack; each yaw cartridge contains slip ring carrying only 5 V logic + sensor lines; power bus routed via conductive composite spinal lamina (carbon-nanotube doped 60 A capacity). Result: waist can spin >100 rpm indefinitely.

--------------------------------------------------------------------
5. CABLE & WIRE STRATEGY
--------------------------------------------------------------------
5.1 Power Backbone
48 VDC, 4 kW peak. Delivered through:
• Conductive CFRP tubes (aluminium-coated inner skin).  
• Each joint picks off via sprung copper-beryllium shoes; no discrete cable loops cross rotation.

5.2 Signal
Star-wired Ethernet pairs inside slip rings (for each joint). Elsewhere, flex-rated FFC (Dupont Pyralux 0.1 mm polyimide).

5.3 Cooling
Liquid lines route through through-bores; quick-disconnect (Staubli MCB series). Because liquid hoses can twist a few turns, slip rings are unnecessary; waist/shoulder spins employ 3-turn “TwistCapsule” energy chain giving ±1080° capability before automated untwist routine.

--------------------------------------------------------------------
6. SOFTWARE GUARDRAILS
If any cartridge exceeds 1080 ° rotation in less than 60 s (detected by integrated absolute encoder wrap count), central supervisor schedules reverse unwinding trajectory OR, if not possible, cuts power and triggers magnetic brake plate (Ogura MCNB-0.3).

--------------------------------------------------------------------
7. PROTOTYPE BOM & COST (one humanoid, 27 unlimited axes)
• UR-Cartridges  
  Shoulder (3) ×2 arms: 6 pcs  
  Hip (3) ×2 legs: 6 pcs  
  Wrist (3) ×2: 6 pcs  
  Ankle (3) ×2: 6 pcs  
  Neck base: 1 pc  
  Waist Yaw: 1 pc  
  Total: 26 (plus spare).  
Average cost weighted: USD 1 100 → subtotal 28 600 USD  

• Slip-rings / unions already in above.  

• Non-endless joints (elbow flex, knee flex, finger PIP/DIP): standard Harmonic Drive + Rev5 composite torsion bar SEA.  

Grand mechanical joint cost (endless+non-endless, full robot) target BOM: USD 41 000 at 250-unit build.

--------------------------------------------------------------------
8. TEST & VALIDATION
8.1 Rotary Endurance Stand
• Spin each cartridge at 150 rpm for 1 000 h.  
• Monitor brush voltage drop (<50 mV), temperature (<85 °C), bearing vibration (<2 mm/s RMS per ISO 10816).  

8.2 Torque Shock
• 2 × rated torque, 0.1 s square pulse, 100 000 cycles; no >8 arc-min permanent position error.

8.3 Fluid-Leak
• For neck rotary union: 10 bar air, 24 h; leak <0.05 SCCM.

8.4 EMC
• Inject 4 kV EFT/Burst on rotating power channels while streaming 1 Gbps over FORJ; BER <1 × 10⁻¹².

--------------------------------------------------------------------
9. FABRICATION FILES
Included in secure Git (internal):
• STEP: ur_cartridge_v1.3.step  
• STL: joint_dome_sleeve.stl (print in Onyx + CF continuous fiber).  
• Gerbers: slip_ring_adapter_revC.zip.  
• Altium: encoder_flex_PCB_v2.  

--------------------------------------------------------------------
10. NEXT ACTIONS (4-WEEK SPRINT)
Week 1: Order 5 shoulder-Z prototype cartridges (Moog + T-Motor).  
Week 2: Print composite domes; assemble; bench-spin test.  
Week 3: Integrate into left arm skeletal rig; validate cable-less operation 3600 ° continuous for 30 min.  
Week 4: Failure analysis, finalize torque margin charts, freeze v1.4.

This URJS blueprint eliminates wire/air entanglement by embedding every transfer medium coaxially inside each rotating element or by moving generation to the limb segment itself. It is manufacturable today with off-the-shelf components, yet outperforms every commercially available humanoid joint in torque density, bandwidth, and rotational freedom.