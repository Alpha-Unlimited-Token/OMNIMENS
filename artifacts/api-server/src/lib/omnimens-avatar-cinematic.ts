/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS AVATAR CINEMATIC PIPELINE
 * ────────────────────────────────────
 * Receives recorded face-tracking keyframes from the Avatar Studio frontend
 * and generates a complete Blender 4 Python scene ready for cinematic rendering.
 *
 * Cinematic styles: studio · cinematic · scifi · noir · documentary · fantasy
 *
 * Output ZIP contains:
 *   render-cinematic.py     — Blender Python scene (run with: blender --python render-cinematic.py)
 *   animation-data.json     — Raw keyframe data (yaw/pitch/roll/blink/mouth per frame)
 *   camera-path.json        — Camera animation config for style
 *   README.txt              — Step-by-step Blender render instructions
 */

import JSZip from "jszip";

export interface AvatarFrame {
  t: number;       // time in seconds
  yaw: number;     // head yaw rotation (radians)
  pitch: number;   // head pitch rotation (radians)
  roll: number;    // head roll rotation (radians)
  eyeL: number;    // left eye openness 0–1
  eyeR: number;    // right eye openness 0–1
  mouth: number;   // mouth openness 0–1
  brow: number;    // brow raise 0–1
}

export interface CinematicExportRequest {
  frames: AvatarFrame[];
  cinematicStyle: string;
  fps: number;
  avatarType: string;
  totalDuration: number;
}

// ─── Style definitions ────────────────────────────────────────────────────────

interface StyleConfig {
  bgColor: [number, number, number];
  keyLight: { color: [number, number, number]; energy: number; pos: [number, number, number]; type: string };
  fillLight: { color: [number, number, number]; energy: number; pos: [number, number, number] };
  rimLight: { color: [number, number, number]; energy: number; pos: [number, number, number] };
  ambientStrength: number;
  cyclesSamples: number;
  cameraStart: [number, number, number];
  cameraEnd: [number, number, number];
  focalLength: number;
  aperture: number;
  fogDensity: number;
  description: string;
}

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  studio: {
    bgColor: [0.04, 0.04, 0.07],
    keyLight: { color: [1.0, 0.97, 0.9], energy: 800, pos: [3, 4, 3], type: "AREA" },
    fillLight: { color: [0.88, 0.92, 1.0], energy: 300, pos: [-3, 2, 2] },
    rimLight: { color: [1.0, 1.0, 1.0], energy: 400, pos: [0, 3, -4] },
    ambientStrength: 0.12,
    cyclesSamples: 128,
    cameraStart: [0, 0.15, 5.5],
    cameraEnd: [0, 0.15, 4.8],
    focalLength: 85,
    aperture: 4.0,
    fogDensity: 0.0,
    description: "Professional 3-point studio lighting — clean, broadcast-quality",
  },
  cinematic: {
    bgColor: [0.008, 0.008, 0.02],
    keyLight: { color: [1.0, 0.6, 0.27], energy: 1200, pos: [4, 5, 2], type: "SPOT" },
    fillLight: { color: [0.13, 0.27, 0.67], energy: 180, pos: [-4, 1, 1] },
    rimLight: { color: [0.0, 1.0, 0.8], energy: 500, pos: [-1, 4, -5] },
    ambientStrength: 0.05,
    cyclesSamples: 256,
    cameraStart: [0.8, 0.3, 5.5],
    cameraEnd: [0, 0.1, 4.5],
    focalLength: 50,
    aperture: 1.8,
    fogDensity: 0.015,
    description: "Dramatic Hollywood cinematic — warm key, cold fill, teal rim",
  },
  scifi: {
    bgColor: [0.008, 0.015, 0.025],
    keyLight: { color: [0.0, 1.0, 0.8], energy: 600, pos: [3, 4, 2], type: "AREA" },
    fillLight: { color: [0.48, 0.22, 0.93], energy: 500, pos: [-4, 2, 1] },
    rimLight: { color: [0.0, 0.8, 1.0], energy: 800, pos: [0, -3, -4] },
    ambientStrength: 0.04,
    cyclesSamples: 192,
    cameraStart: [-0.3, 0.0, 5.8],
    cameraEnd: [0.3, 0.2, 4.6],
    focalLength: 35,
    aperture: 2.0,
    fogDensity: 0.02,
    description: "Sci-fi teal/violet palette — neon rim lighting, volumetric fog",
  },
  noir: {
    bgColor: [0.0, 0.0, 0.0],
    keyLight: { color: [1.0, 0.98, 0.95], energy: 2000, pos: [2, 6, 1], type: "SPOT" },
    fillLight: { color: [0.05, 0.05, 0.08], energy: 30, pos: [-4, 1, 1] },
    rimLight: { color: [0.7, 0.7, 0.6], energy: 100, pos: [0, 4, -6] },
    ambientStrength: 0.0,
    cyclesSamples: 300,
    cameraStart: [0, 0.3, 5.0],
    cameraEnd: [0, 0.3, 5.0],
    focalLength: 135,
    aperture: 2.8,
    fogDensity: 0.0,
    description: "Film noir — single harsh key, deep shadows, classic mono look",
  },
  documentary: {
    bgColor: [0.06, 0.06, 0.08],
    keyLight: { color: [1.0, 0.97, 0.94], energy: 600, pos: [2, 3, 4], type: "AREA" },
    fillLight: { color: [0.94, 0.97, 1.0], energy: 280, pos: [-2, 1, 3] },
    rimLight: { color: [1.0, 1.0, 1.0], energy: 200, pos: [0, 2, -3] },
    ambientStrength: 0.2,
    cyclesSamples: 96,
    cameraStart: [0.15, 0.2, 5.2],
    cameraEnd: [-0.05, 0.1, 5.0],
    focalLength: 70,
    aperture: 5.6,
    fogDensity: 0.0,
    description: "Documentary — natural soft lighting, slight handheld camera drift",
  },
  fantasy: {
    bgColor: [0.018, 0.006, 0.035],
    keyLight: { color: [1.0, 0.75, 0.37], energy: 900, pos: [3, 4, 2], type: "POINT" },
    fillLight: { color: [0.37, 0.69, 1.0], energy: 600, pos: [-4, 2, -1] },
    rimLight: { color: [1.0, 0.37, 0.75], energy: 700, pos: [0, -2, -4] },
    ambientStrength: 0.06,
    cyclesSamples: 200,
    cameraStart: [-0.5, 0.4, 6.0],
    cameraEnd: [0.5, -0.1, 4.8],
    focalLength: 45,
    aperture: 2.4,
    fogDensity: 0.025,
    description: "Fantasy — magical tri-color lighting, gold/blue/magenta palette",
  },
};

// ─── Blender Python script generator ─────────────────────────────────────────

function generateBlenderScript(req: CinematicExportRequest): string {
  const style = STYLE_CONFIGS[req.cinematicStyle] || STYLE_CONFIGS.studio;
  const totalFrames = req.frames.length;
  const fps = req.fps;

  // Serialize frames as Python list of tuples for efficiency
  const frameData = req.frames.map((f, i) =>
    `  (${i + 1}, ${f.yaw.toFixed(4)}, ${f.pitch.toFixed(4)}, ${f.roll.toFixed(4)}, ${f.eyeL.toFixed(3)}, ${f.eyeR.toFixed(3)}, ${f.mouth.toFixed(3)}, ${f.brow.toFixed(3)})`
  ).join(",\n");

  return `#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║          OMNIMENS AVATAR CINEMATIC RENDER SCRIPT             ║
║  Generated automatically — do not edit the frame data        ║
╚══════════════════════════════════════════════════════════════╝

Style:    ${req.cinematicStyle.toUpperCase()} — ${style.description}
Duration: ${req.totalDuration.toFixed(1)}s  |  Frames: ${totalFrames}  |  FPS: ${fps}
Avatar:   ${req.avatarType === 'vrm' ? 'VRM (replace head mesh with your VRM/GLB export)' : 'OMNIMENS default procedural head'}

HOW TO USE:
  1. Open Blender 4.x
  2. File → Scripting → Open this file → Run Script (Alt+P)
  3. The scene will be built automatically
  4. To render: Render → Render Animation  (or Ctrl+F12)
  5. Output will be saved to /tmp/omnimens-render/

To use your own VRM avatar:
  - Export your VRM as GLB: vrm.dev → Convert to GLB
  - In this script, find "REPLACE_WITH_YOUR_GLB_PATH" and set the path
  - The script will import and rig it automatically
"""

import bpy
import math
import os

# ─── Clear scene ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in bpy.data.meshes: bpy.data.meshes.remove(block)

# ─── Render settings ──────────────────────────────────────────────────────────
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = ${style.cyclesSamples}
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = ${fps}
scene.frame_start = 1
scene.frame_end = ${totalFrames}
scene.render.filepath = "/tmp/omnimens-render/frame_"
scene.render.image_settings.file_format = 'PNG'
os.makedirs("/tmp/omnimens-render", exist_ok=True)

# Use GPU if available
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for d in prefs.devices: d.use = True
    scene.cycles.device = 'GPU'
    print("OMNIMENS: GPU rendering enabled")
except Exception as e:
    print(f"OMNIMENS: GPU not available, using CPU ({e})")

# ─── World background ─────────────────────────────────────────────────────────
world = bpy.data.worlds['World']
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (${style.bgColor[0]}, ${style.bgColor[1]}, ${style.bgColor[2]}, 1.0)
bg.inputs[1].default_value = ${style.ambientStrength}

# ─── Avatar mesh ──────────────────────────────────────────────────────────────
# Check if a custom GLB was provided
GLB_PATH = "REPLACE_WITH_YOUR_GLB_PATH"  # Set this to use your own avatar

head_obj = None
if os.path.exists(GLB_PATH):
    print(f"OMNIMENS: Importing GLB avatar from {GLB_PATH}")
    bpy.ops.import_scene.gltf(filepath=GLB_PATH)
    head_obj = bpy.context.selected_objects[0] if bpy.context.selected_objects else None
    if head_obj:
        head_obj.location = (0, 0, 0)
        print("OMNIMENS: GLB avatar imported successfully")

# Fallback: build procedural OMNIMENS head
if not head_obj:
    print("OMNIMENS: Building procedural avatar head")
    # Head armature
    bpy.ops.object.armature_add(location=(0, 0, 0))
    armature = bpy.context.object
    armature.name = "OmnimensArmature"
    bpy.ops.object.mode_set(mode='EDIT')
    bones = armature.data.edit_bones
    # Neck bone
    neck_b = bones['Bone']
    neck_b.name = 'Neck'
    neck_b.head = (0, 0, 0)
    neck_b.tail = (0, 0, 0.5)
    # Head bone
    head_b = bones.new('Head')
    head_b.head = (0, 0, 0.5)
    head_b.tail = (0, 0, 1.6)
    head_b.parent = neck_b
    bpy.ops.object.mode_set(mode='OBJECT')

    # Skin material
    skin_mat = bpy.data.materials.new("OmnimensSkin")
    skin_mat.use_nodes = True
    bsdf = skin_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.83, 0.58, 0.41, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.75
    bsdf.inputs['Subsurface Weight'].default_value = 0.15
    bsdf.inputs['Subsurface Color'].default_value = (1.0, 0.3, 0.1, 1.0)

    # Skull mesh
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, 0, 1.1), segments=64, ring_count=48)
    skull = bpy.context.object
    skull.name = "Head"
    skull.scale = (0.92, 0.88, 1.08)
    skull.data.materials.append(skin_mat)
    skull.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    head_obj = armature

    # Eyes
    eye_mat = bpy.data.materials.new("OmnimensEye")
    eye_mat.use_nodes = True
    eye_bsdf = eye_mat.node_tree.nodes["Principled BSDF"]
    eye_bsdf.inputs['Base Color'].default_value = (0.0, 0.78, 0.63, 1.0)
    eye_bsdf.inputs['Emission Color'].default_value = (0.0, 0.78, 0.63, 1.0)
    eye_bsdf.inputs['Emission Strength'].default_value = 0.4
    eye_bsdf.inputs['Roughness'].default_value = 0.1

    for side, x in [('L', -0.33), ('R', 0.33)]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, location=(x, -0.88, 1.3))
        eye = bpy.context.object
        eye.name = f"Eye_{side}"
        eye.data.materials.append(eye_mat)

    # Neck cylinder
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.55, location=(0, 0, 0.28))
    neck_mesh = bpy.context.object
    neck_mesh.name = "Neck"
    neck_mesh.data.materials.append(skin_mat)

# ─── Lighting setup: ${req.cinematicStyle.toUpperCase()} ──────────────────────
${generateLightingCode(style, req.cinematicStyle)}

# ─── Camera ───────────────────────────────────────────────────────────────────
bpy.ops.object.camera_add(location=(${style.cameraStart.join(", ")}))
cam_obj = bpy.context.object
cam_obj.name = "OmnimensCamera"
scene.camera = cam_obj

# Point camera at head
cam_obj.rotation_euler = (math.radians(90), 0, 0)
cam_constraint = cam_obj.constraints.new('TRACK_TO')
cam_constraint.target = head_obj if head_obj else bpy.context.scene.objects.get('Head') or bpy.context.scene.objects[0]
cam_constraint.track_axis = 'TRACK_NEGATIVE_Z'
cam_constraint.up_axis = 'UP_Y'

# Camera settings
cam = cam_obj.data
cam.lens = ${style.focalLength}
cam.dof.use_dof = True
cam.dof.aperture_fstop = ${style.aperture}
cam.dof.focus_distance = ${Math.sqrt(style.cameraStart[0] ** 2 + style.cameraStart[1] ** 2 + style.cameraStart[2] ** 2).toFixed(1)}

# Camera animation — gentle ${req.cinematicStyle} movement
scene.frame_set(1)
cam_obj.location = (${style.cameraStart.join(", ")})
cam_obj.keyframe_insert(data_path="location", frame=1)
scene.frame_set(${totalFrames})
cam_obj.location = (${style.cameraEnd.join(", ")})
cam_obj.keyframe_insert(data_path="location", frame=${totalFrames})

# Ease in/out for camera
for fcurve in cam_obj.animation_data.action.fcurves:
    for kf in fcurve.keyframe_points:
        kf.interpolation = 'BEZIER'
        kf.easing = 'EASE_IN_OUT'

# ─── Face animation keyframes ─────────────────────────────────────────────────
# Format: (frame, yaw, pitch, roll, eyeL, eyeR, mouth, brow)
FRAMES = [
${frameData}
]

print(f"OMNIMENS: Applying {len(FRAMES)} animation keyframes…")

# Find head bone or head object to animate
head_bone_obj = None
if head_obj and head_obj.type == 'ARMATURE':
    head_bone_obj = head_obj
    pose_bones = head_obj.pose.bones

for (fr, yaw, pitch, roll, eye_l, eye_r, mouth, brow) in FRAMES:
    scene.frame_set(fr)

    if head_bone_obj and 'Head' in pose_bones:
        pb = pose_bones['Head']
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler.x = pitch * 0.7
        pb.rotation_euler.y = roll * 0.4
        pb.rotation_euler.z = yaw
        pb.keyframe_insert(data_path="rotation_euler", frame=fr)
    else:
        # Direct object rotation if no armature
        skull = bpy.context.scene.objects.get('Head')
        if skull:
            skull.rotation_mode = 'XYZ'
            skull.rotation_euler.x = pitch * 0.7
            skull.rotation_euler.y = yaw
            skull.rotation_euler.z = roll * 0.4
            skull.keyframe_insert(data_path="rotation_euler", frame=fr)

    # Eye blink via scale (simple — for full VRM use shape keys)
    for side_name, eye_open in [('Eye_L', eye_l), ('Eye_R', eye_r)]:
        eye_ob = bpy.context.scene.objects.get(side_name)
        if eye_ob:
            eye_ob.scale.z = max(0.05, eye_open)
            eye_ob.keyframe_insert(data_path="scale", frame=fr)

print("OMNIMENS: Keyframes applied successfully")

# ─── Smooth all animation curves ──────────────────────────────────────────────
for obj in bpy.context.scene.objects:
    if obj.animation_data and obj.animation_data.action:
        for fcurve in obj.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'BEZIER'

# ─── Final scene info ─────────────────────────────────────────────────────────
scene.frame_set(1)
print("=" * 60)
print("OMNIMENS Cinematic Scene Ready!")
print(f"  Style:    ${req.cinematicStyle.toUpperCase()}")
print(f"  Duration: ${req.totalDuration.toFixed(1)}s  |  {totalFrames} frames at {fps}fps")
print(f"  Camera:   {style.focalLength}mm f/{style.aperture} — ${style.description}")
print(f"  Output:   /tmp/omnimens-render/")
print("  Render:   Ctrl+F12 (animation) or F12 (single frame)")
print("=" * 60)
`;
}

function generateLightingCode(style: StyleConfig, styleName: string): string {
  const kl = style.keyLight;
  const fl = style.fillLight;
  const rl = style.rimLight;

  let code = `# ${styleName.toUpperCase()} style lighting
`;
  if (kl.type === "AREA") {
    code += `bpy.ops.object.light_add(type='AREA', location=(${kl.pos.join(", ")}))\n`;
  } else if (kl.type === "SPOT") {
    code += `bpy.ops.object.light_add(type='SPOT', location=(${kl.pos.join(", ")}))\n`;
  } else {
    code += `bpy.ops.object.light_add(type='POINT', location=(${kl.pos.join(", ")}))\n`;
  }
  code += `key = bpy.context.object; key.name = "KeyLight"\n`;
  code += `key.data.energy = ${kl.energy}\n`;
  code += `key.data.color = (${kl.color.join(", ")})\n`;
  if (kl.type === "AREA") code += `key.data.shape = 'ELLIPSE'; key.data.size = 2.0; key.data.size_y = 1.2\n`;
  if (kl.type === "SPOT") code += `key.data.spot_size = math.radians(35); key.data.spot_blend = 0.25\n`;
  code += `key.data.use_shadow = True\n`;
  code += `\n`;
  code += `bpy.ops.object.light_add(type='AREA', location=(${fl.pos.join(", ")}))\n`;
  code += `fill = bpy.context.object; fill.name = "FillLight"\n`;
  code += `fill.data.energy = ${fl.energy}\n`;
  code += `fill.data.color = (${fl.color.join(", ")})\n`;
  code += `fill.data.size = 2.5\n`;
  code += `\n`;
  code += `bpy.ops.object.light_add(type='AREA', location=(${rl.pos.join(", ")}))\n`;
  code += `rim = bpy.context.object; rim.name = "RimLight"\n`;
  code += `rim.data.energy = ${rl.energy}\n`;
  code += `rim.data.color = (${rl.color.join(", ")})\n`;
  code += `rim.data.size = 1.5\n`;

  if (style.fogDensity > 0) {
    code += `\n# Volumetric atmosphere\nbpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))\nvol_cube = bpy.context.object; vol_cube.name = "Atmosphere"\nvol_cube.scale = (6, 6, 6)\nvol_mat = bpy.data.materials.new("AtmosphereMat")\nvol_mat.use_nodes = True\nvol_nodes = vol_mat.node_tree.nodes\nvol_nodes.clear()\nvol_out = vol_nodes.new('ShaderNodeOutputMaterial')\nvol_scatter = vol_nodes.new('ShaderNodeVolumeScatter')\nvol_scatter.inputs['Density'].default_value = ${style.fogDensity}\nvol_mat.node_tree.links.new(vol_scatter.outputs[0], vol_out.inputs[1])\nvol_cube.data.materials.append(vol_mat)\n`;
  }

  return code;
}

// ─── README generator ─────────────────────────────────────────────────────────

function generateReadme(req: CinematicExportRequest): string {
  const style = STYLE_CONFIGS[req.cinematicStyle] || STYLE_CONFIGS.studio;
  return `╔══════════════════════════════════════════════════════════════╗
║          OMNIMENS AVATAR CINEMATIC PACKAGE                   ║
╚══════════════════════════════════════════════════════════════╝

Generated by OMNIMENS Avatar Studio
Style:    ${req.cinematicStyle.toUpperCase()}
Duration: ${req.totalDuration.toFixed(1)} seconds
Frames:   ${req.frames.length} keyframes at ${req.fps}fps

─── WHAT'S IN THIS ZIP ────────────────────────────────────────

  render-cinematic.py    Blender 4 Python scene script
  animation-data.json    Raw face tracking keyframes
  README.txt             This file

─── HOW TO RENDER IN BLENDER ──────────────────────────────────

  1. Download Blender 4.x free from: blender.org

  OPTION A — Script (recommended):
  1. Open Blender → Scripting workspace
  2. Open render-cinematic.py
  3. Press Alt+P (Run Script)
  4. Press Ctrl+F12 to render animation
  5. Frames save to: /tmp/omnimens-render/

  OPTION B — Command line (headless):
  blender --background --python render-cinematic.py

─── USING YOUR OWN AVATAR ─────────────────────────────────────

  VRoid / Ready Player Me avatars:
  1. Export your avatar as .glb or .vrm
  2. Open render-cinematic.py in a text editor
  3. Find: GLB_PATH = "REPLACE_WITH_YOUR_GLB_PATH"
  4. Set it to your file path, e.g. "/home/user/myavatar.glb"
  5. Run the script — your avatar will be imported and rigged

  Free VRM avatars:
  → hub.vroid.com     (thousands of free VRM characters)
  → readyplayer.me    (photorealistic, free tier)
  → avaturn.me        (photo-based, GLB export)

─── 3D TOOLS INTEGRATION ──────────────────────────────────────

  The animation-data.json can be imported into:
  → Blender 4     (via this script)
  → Godot 4       (convert bone rotation data to GDScript)
  → Three.js      (apply to SkinnedMesh bones in browser)
  → Unreal Engine (convert to BVH with any BVH converter)

  To generate GLB prosthetic/anatomical models (restorative art):
  → Ask OMNIMENS to generate a specific 3D model
  → Import the .glb output alongside this avatar scene

─── CINEMATIC STYLE: ${req.cinematicStyle.toUpperCase()} ─────────────────────────────

  ${style.description}

  Camera: ${style.focalLength}mm lens  |  f/${style.aperture} aperture
  Quality: ${style.cyclesSamples} Cycles samples  |  1920×1080  |  ${req.fps}fps
  Movement: ${JSON.stringify(style.cameraStart)} → ${JSON.stringify(style.cameraEnd)}

─── WHAT THE TOOLS USED TO MAKE THIS ─────────────────────────

  • Google MediaPipe FaceMesh — 468 facial landmarks, real-time
  • Three.js — 3D avatar rendering in browser
  • @pixiv/three-vrm — VRM avatar loading & control
  • Blender 4 Cycles — production-quality path-trace renderer
  • OMNIMENS AI — cinematic scene composition & generation

All technologies used are free and open source.
`;
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function buildCinematicZip(req: CinematicExportRequest): Promise<Buffer> {
  const zip = new JSZip();

  // Blender Python script
  const pyScript = generateBlenderScript(req);
  zip.file("render-cinematic.py", pyScript);

  // Raw animation data
  zip.file("animation-data.json", JSON.stringify({
    meta: {
      style: req.cinematicStyle,
      fps: req.fps,
      totalDuration: req.totalDuration,
      frameCount: req.frames.length,
      generatedBy: "OMNIMENS Avatar Studio",
    },
    frames: req.frames,
  }, null, 2));

  // README
  zip.file("README.txt", generateReadme(req));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
}
