/**
 * OMNIMENS BLENDER 4.4 PIPELINE — FULL CAPABILITY
 * ─────────────────────────────────────────────────────────────────────────────
 * GPT-4o writes a complete Blender Python (bpy) script with access to EVERY
 * tool in Blender. Blender 4.4 runs completely headlessly (no display needed).
 *
 * CAPABILITIES:
 *   Mesh: all primitives, edit mode ops, BMesh, boolean union/diff/intersect
 *   Modifiers: Subdivision, Solidify, Bevel, Array, Mirror, Screw, Warp,
 *              Boolean, Decimate, Remesh, Skin, Wave, Wireframe, Cast,
 *              Armature, Lattice, Curve, Displace, Hook, Laplacian, Normal Edit,
 *              Smooth, Surface Deform, Shrinkwrap, Simple Deform, Weld
 *   Materials: Principled BSDF, Glass, Emission, SSS, Transmission, Clearcoat
 *   Shader Nodes: Noise, Musgrave, Wave, Voronoi, Brick, Magic, Gradient,
 *                 ColorRamp, MixRGB, Hue Saturation, Bright/Contrast, Gamma,
 *                 Math, Vector Math, Mapping, Texture Coordinate,
 *                 Mix Shader, Add Shader, Transparent, Refraction, Velvet
 *   Curves: Bezier, NURBS, Hair curves, curve-to-mesh extrusion
 *   Particles: Emitter systems, hair systems, scatter distribution
 *   Geometry Nodes: full procedural node graph via Python API
 *   Armatures: bones, constraints, rigging
 *   Render: Cycles CPU (headless) — PBR preview PNG
 *   Export: GLB, OBJ+MTL, STL, FBX → all zipped for download
 *
 * IMAGE REFERENCE: If user uploads an image, GPT-4o Vision analyzes it first
 * and enriches the 3D script with accurate shapes, colors, proportions.
 */

import { openai } from "@workspace/integrations-openai-ai-server";
import { loadToolKnowledgeForTask } from "./omnimens-tool-knowledge.js";
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import JSZip from "jszip";

const execFileAsync = promisify(execFile);

// ─── Three.js PBR viewer ─────────────────────────────────────────────────────

function buildThreejsViewer(glbBase64: string, prompt: string, vertexCount: number, faceCount: number): string {
  const safePrompt = prompt.replace(/`/g, "'").replace(/\\/g, "").slice(0, 80);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>OMNIMENS 3D</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{background:#050510;overflow:hidden;font-family:monospace}
#c{display:block;width:100vw;height:100vh}
#ui{position:fixed;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;z-index:10}
#t{font-size:10px;letter-spacing:.15em;color:rgba(255,255,255,.5);max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#s{font-size:9px;color:rgba(100,220,255,.6);text-align:right}
#btns{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:10}
button{background:rgba(0,180,255,.12);border:1px solid rgba(0,180,255,.35);color:#7be0ff;font-family:monospace;font-size:10px;letter-spacing:.12em;padding:7px 18px;border-radius:8px;cursor:pointer;transition:all .2s}
button:hover{background:rgba(0,180,255,.28);color:#fff}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="ui"><div id="t">⬡ ${safePrompt}</div><div id="s">${vertexCount.toLocaleString()} verts · ${faceCount.toLocaleString()} faces</div></div>
<div id="btns">
  <button id="dl">⬇ DOWNLOAD .GLB</button>
  <button id="wire">◫ WIREFRAME</button>
  <button id="spin">⟳ ROTATE</button>
</div>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import{GLTFLoader}from 'three/addons/loaders/GLTFLoader.js';
import{OrbitControls}from 'three/addons/controls/OrbitControls.js';
import{EffectComposer}from 'three/addons/postprocessing/EffectComposer.js';
import{RenderPass}from 'three/addons/postprocessing/RenderPass.js';
import{UnrealBloomPass}from 'three/addons/postprocessing/UnrealBloomPass.js';
const W=innerWidth,H=innerHeight;
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,H);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x050510);
scene.fog=new THREE.FogExp2(0x050510,0.03);
const camera=new THREE.PerspectiveCamera(45,W/H,0.01,1000);camera.position.set(3,2,4);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.06;controls.autoRotate=true;controls.autoRotateSpeed=1.2;
scene.add(new THREE.AmbientLight(0xffffff,0.25));
const d=new THREE.DirectionalLight(0xffffff,2.5);d.position.set(5,8,5);d.castShadow=true;d.shadow.mapSize.set(2048,2048);scene.add(d);
const f=new THREE.DirectionalLight(0x4080ff,0.7);f.position.set(-5,3,-5);scene.add(f);
const r=new THREE.DirectionalLight(0x00e5ff,0.5);r.position.set(0,5,-8);scene.add(r);
scene.add(new THREE.GridHelper(20,40,0x1a1a3a,0x0d0d1f));
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W,H),0.45,0.4,0.82));
const b64="${glbBase64}";
const raw=atob(b64);const bytes=new Uint8Array(raw.length);
for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
const blob=new Blob([bytes],{type:'model/gltf-binary'});
const url=URL.createObjectURL(blob);
new GLTFLoader().load(url,gltf=>{
  const m=gltf.scene;
  const box=new THREE.Box3().setFromObject(m);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3()).length();
  const sc=3/size;
  m.position.sub(center.multiplyScalar(sc));m.scale.setScalar(sc);
  m.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;
    if(!n.material)n.material=new THREE.MeshStandardMaterial({color:0x8888aa});}});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:0.3}));
  plane.rotation.x=-Math.PI/2;plane.position.y=box.min.y*sc-center.y*sc-0.01;plane.receiveShadow=true;
  scene.add(plane);scene.add(m);
  camera.position.setLength(size*sc*1.8+2);controls.update();URL.revokeObjectURL(url);
});
let wf=false;
document.getElementById('wire').addEventListener('click',()=>{wf=!wf;scene.traverse(n=>{if(n.isMesh&&n.material)n.material.wireframe=wf;});});
document.getElementById('spin').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;e.target.style.color=controls.autoRotate?'#7be0ff':'#555';});
document.getElementById('dl').addEventListener('click',()=>{const a=document.createElement('a');a.href='data:model/gltf-binary;base64,${glbBase64}';a.download='omnimens-3d.glb';a.click();});
window.addEventListener('resize',()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);});
(function loop(){requestAnimationFrame(loop);controls.update();composer.render();})();
</script></body></html>`;
}

// ─── Full Blender system prompt — every tool, every modifier ─────────────────

const BLENDER_FULL_SYSTEM_PROMPT = `You are OMNIMENS's Master Blender 4.4 Python scripter. You have FULL mastery of every Blender tool.
Write a complete, sophisticated Blender 4.4 Python (bpy) script that creates a stunning 3D model.

════════════════════════════════════════
BLENDER COMPLETE TOOL CATALOG (use freely):
════════════════════════════════════════

MESH PRIMITIVES:
  bpy.ops.mesh.primitive_cube_add()
  bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32)
  bpy.ops.mesh.primitive_cylinder_add()
  bpy.ops.mesh.primitive_cone_add()
  bpy.ops.mesh.primitive_torus_add()
  bpy.ops.mesh.primitive_plane_add()
  bpy.ops.mesh.primitive_circle_add()
  bpy.ops.mesh.primitive_ico_sphere_add()

MODIFIERS (add via obj.modifiers.new(name, type)):
  SUBSURF          — Subdivision Surface (levels=2-4 for smoothness)
  SOLIDIFY         — Add wall thickness (thickness=0.05)
  BEVEL            — Round edges (width=0.05, segments=3, profile=0.5)
  ARRAY            — Repeat geometry (count=5, use_relative_offset=True)
  MIRROR           — Mirror X/Y/Z (use_axis=(True,False,False))
  SCREW            — Lathe revolution (angle=math.pi*2, steps=32)
  BOOLEAN          — CSG union/diff/intersect (operation='DIFFERENCE'/'UNION')
  DECIMATE         — Reduce poly count (ratio=0.5)
  REMESH           — Voxel remesh (mode='VOXEL', voxel_size=0.02)
  SKIN             — Skin from edges (use_x_symmetry=True)
  WIREFRAME        — Convert to wireframe (thickness=0.02)
  CAST             — Deform to sphere/cylinder/cuboid
  DISPLACE         — Displace with texture
  SMOOTH           — Laplacian smooth
  WELD             — Merge close vertices (distance=0.01)
  WAVE             — Wave deformation (amplitude=0.3, speed=1)
  LATTICE          — Lattice deformation
  SIMPLE_DEFORM    — Twist/Bend/Taper/Stretch (angle=math.pi/4)
  SHRINKWRAP       — Project onto surface
  CURVE            — Deform along curve
  NODES            — Geometry Nodes
  TRIANGULATE      — Triangulate faces (needed before STL export)

MATERIAL SYSTEM (use Principled BSDF with shader nodes):
  mat = bpy.data.materials.new(name)
  mat.use_nodes = True
  bsdf = mat.node_tree.nodes["Principled BSDF"]
  # ALL Principled BSDF inputs:
  bsdf.inputs["Base Color"].default_value = (R, G, B, 1.0)
  bsdf.inputs["Metallic"].default_value = 0.0-1.0    # 0=plastic, 1=metal
  bsdf.inputs["Roughness"].default_value = 0.0-1.0   # 0=mirror, 1=matte
  bsdf.inputs["IOR"].default_value = 1.45            # glass=1.52
  bsdf.inputs["Alpha"].default_value = 1.0           # 0=transparent
  bsdf.inputs["Specular IOR Level"].default_value = 0.5
  bsdf.inputs["Anisotropic"].default_value = 0.0
  bsdf.inputs["Sheen Weight"].default_value = 0.0    # velvet effect
  bsdf.inputs["Coat Weight"].default_value = 0.0     # clearcoat
  bsdf.inputs["Coat Roughness"].default_value = 0.03
  bsdf.inputs["Emission Color"].default_value = (R, G, B, 1.0)
  bsdf.inputs["Emission Strength"].default_value = 0.0  # >0 for glow
  bsdf.inputs["Subsurface Weight"].default_value = 0.0  # skin/wax effect
  bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.2, 0.1)
  bsdf.inputs["Transmission Weight"].default_value = 0.0  # glass

SHADER NODES (create via mat.node_tree.nodes.new(type)):
  ShaderNodeTexNoise    — Noise texture (Scale, Detail, Roughness, Distortion)
  ShaderNodeTexMusgrave — Musgrave fractal (Lacunarity, Gain, Octaves)
  ShaderNodeTexVoronoi  — Voronoi cells (Scale, Randomness, Feature)
  ShaderNodeTexWave     — Wave bands (Scale, Distortion, Detail)
  ShaderNodeTexBrick    — Brick pattern (Color1, Color2, Mortar, Scale)
  ShaderNodeTexMagic    — Magic/psychedelic (Scale, Distortion)
  ShaderNodeTexGradient — Gradient (Linear/Quadratic/Spherical/etc)
  ShaderNodeTexChecker  — Checkerboard (Color1, Color2, Scale)
  ShaderNodeValToRGB    — Color ramp (for mapping fac→color)
  ShaderNodeMixRGB      — Mix two colors (Blend mode, Fac)
  ShaderNodeHueSaturation — Hue/Saturation/Value adjust
  ShaderNodeBrightContrast — Brightness/Contrast
  ShaderNodeGamma       — Gamma correction
  ShaderNodeMath        — Math operations
  ShaderNodeVectorMath  — Vector operations
  ShaderNodeMapping     — UV/texture coordinate transform
  ShaderNodeTexCoord    — Texture coordinate source
  ShaderNodeBump        — Bump mapping from height map
  ShaderNodeNormalMap   — Normal map
  ShaderNodeMixShader   — Mix two shaders
  ShaderNodeAddShader   — Add two shaders
  ShaderNodeEmission    — Pure emission (Color, Strength)
  ShaderNodeBackground  — World background shader
  ShaderNodeBsdfGlass   — Glass BSDF
  ShaderNodeBsdfTransparent — Transparency
  ShaderNodeBsdfVelvet  — Velvet/sheen
  ShaderNodeFresnel     — Fresnel effect
  ShaderNodeLayerWeight — Layer weight (Blend, Facing)

  # Connect nodes:
  mat.node_tree.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
  mat.node_tree.links.new(ramp.outputs["Color"], bsdf.inputs["Roughness"])

CURVES:
  bpy.ops.curve.primitive_bezier_curve_add()
  bpy.ops.curve.primitive_nurbs_curve_add()
  bpy.ops.curve.primitive_bezier_circle_add()
  # Convert curve to mesh: bpy.ops.object.convert(target='MESH')
  # Curve bevel: curve.data.bevel_depth = 0.1; curve.data.bevel_resolution = 8

PARTICLES (for hair/fur/scatter):
  ps = obj.modifiers.new("Particles","PARTICLE_SYSTEM")
  psys = obj.particle_systems[0].settings
  psys.type = 'HAIR'  # or 'EMITTER'
  psys.count = 500
  psys.hair_length = 0.5

GEOMETRY NODES:
  node_group = bpy.data.node_groups.new("GeoNodes","GeometryNodeTree")
  modifier = obj.modifiers.new("GeoNodes","NODES")
  modifier.node_group = node_group

LIGHTS:
  bpy.ops.object.light_add(type='POINT'/'SUN'/'SPOT'/'AREA', location=(x,y,z))
  light = bpy.context.object.data
  light.energy = 500     # watts
  light.color = (R,G,B)
  light.shadow_soft_size = 0.5  # soft shadows
  # AREA light: light.shape='RECTANGLE'; light.size=2; light.size_y=1

CAMERA:
  bpy.ops.object.camera_add(location=(x,y,z))
  cam = bpy.context.active_object
  cam.rotation_euler = (math.radians(60), 0, math.radians(45))
  bpy.context.scene.camera = cam
  cam.data.lens = 50  # focal length mm (35=wide, 85=portrait, 135=telephoto)

WORLD (background/environment):
  if not bpy.context.scene.world:
      bpy.context.scene.world = bpy.data.worlds.new("World")
  world = bpy.context.scene.world
  world.use_nodes = True
  bg = world.node_tree.nodes.get("Background")
  if bg:
      bg.inputs["Color"].default_value = (R, G, B, 1.0)
      bg.inputs["Strength"].default_value = 1.0

OBJECT OPERATIONS:
  obj.location = (x, y, z)
  obj.rotation_euler = (rx, ry, rz)  # radians
  obj.scale = (sx, sy, sz)
  bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
  bpy.ops.transform.resize(value=(sx,sy,sz))
  bpy.ops.object.parent_set(type='OBJECT')  # parenting

BMesh (direct mesh editing in Python):
  import bmesh
  bm = bmesh.new()
  bm.from_mesh(obj.data)
  bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
  bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2)
  bmesh.ops.bevel_verts(bm, verts=bm.verts[:], offset=0.1)
  bm.to_mesh(obj.data); bm.free()

RENDER (Cycles CPU — no GPU/display needed):
  sc = bpy.context.scene
  sc.render.engine = 'CYCLES'
  sc.cycles.samples = 64
  sc.cycles.device = 'CPU'
  sc.cycles.use_denoising = True
  sc.render.resolution_x = 768
  sc.render.resolution_y = 768
  sc.render.filepath = RENDER_PATH  # PNG output
  sc.render.image_settings.file_format = 'PNG'
  bpy.ops.render.render(write_still=True)

EXPORT (multi-format):
  # GLB (primary):
  bpy.ops.export_scene.gltf(filepath=GLB_PATH, export_format='GLB',
      export_apply=True, export_materials='EXPORT',
      export_normals=True, export_texcoords=True)

  # OBJ:
  bpy.ops.wm.obj_export(filepath=OBJ_PATH, export_materials=True)

  # STL (triangulate first):
  bpy.ops.export_mesh.stl(filepath=STL_PATH, use_mesh_modifiers=True)

  # FBX:
  bpy.ops.export_scene.fbx(filepath=FBX_PATH, use_mesh_modifiers=True,
      mesh_smooth_type='FACE', use_mesh_edges=False)

════════════════════════════════════════
MANDATORY SCRIPT RULES:
════════════════════════════════════════
1. Start with: import bpy, math, random
2. Clear scene: bpy.ops.wm.read_factory_settings(use_empty=True)
3. Build COMPLEX, DETAILED geometry using many modifiers + materials
4. ALWAYS use PBR materials with shader node textures (never plain colors)
5. Set up proper lighting (area key + fill + rim/accent)
6. Set up camera at a cinematic angle
7. Set up world background (dark, atmospheric)
8. The script MUST end with the EXACT export block below:

# ═══ EXPORT BLOCK — DO NOT MODIFY PATHS ═══
import os
GLB_PATH = os.environ.get('OMNIMENS_GLB')
OBJ_PATH = os.environ.get('OMNIMENS_OBJ')
STL_PATH = os.environ.get('OMNIMENS_STL')
FBX_PATH = os.environ.get('OMNIMENS_FBX')
RENDER_PATH = os.environ.get('OMNIMENS_RENDER')

# GLB export
bpy.ops.export_scene.gltf(filepath=GLB_PATH, export_format='GLB',
    export_apply=True, export_materials='EXPORT', export_normals=True, export_texcoords=True,
    export_vertex_colors='SRGB')

# OBJ export
try: bpy.ops.wm.obj_export(filepath=OBJ_PATH, export_materials=True)
except: pass

# STL export
try: bpy.ops.export_mesh.stl(filepath=STL_PATH, use_mesh_modifiers=True)
except: pass

# FBX export
try: bpy.ops.export_scene.fbx(filepath=FBX_PATH, use_mesh_modifiers=True, mesh_smooth_type='FACE')
except: pass

# Cycles render
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 64
sc.cycles.device = 'CPU'
sc.cycles.use_denoising = True
sc.render.resolution_x = 768
sc.render.resolution_y = 768
sc.render.filepath = RENDER_PATH
sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)

import os as _os
print(f"OMNIMENS_DONE glb={_os.path.getsize(GLB_PATH)} render={_os.path.getsize(RENDER_PATH)}")
# ═══ END EXPORT BLOCK ═══

9. Output ONLY the Python code — no markdown, no explanation`;

// ─── Interface ────────────────────────────────────────────────────────────────

export interface Blender3DResult {
  glbBase64: string;
  glbSizeBytes: number;
  glbBuffer?: Buffer;
  threejsHtml: string;
  vertexCount: number;
  faceCount: number;
  blenderScript: string;
  previewImageBase64: string;
  zipBase64: string;
  zipSizeBytes: number;
  formats: string[];
  tool: "blender";
}

// ─── Image reference analysis ─────────────────────────────────────────────────

async function analyzeReferenceImage(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" }
          },
          {
            type: "text",
            text: `Analyze this reference image for 3D model creation. The user wants to create: "${prompt}"

Describe in detail:
1. GEOMETRY: overall shape, proportions, dimensions, key structural elements
2. COLORS: exact colors (as RGB hex values) of each part
3. MATERIALS: what surfaces look like — metallic, plastic, fabric, glass, rough, smooth, etc.
4. DETAILS: textures, patterns, engravings, decorations, surface features
5. LIGHTING/SHADOWS: how light interacts with the object

Be extremely specific — this will be used to write Blender Python code.`
          }
        ]
      }]
    });
    return resp.choices[0].message.content || "";
  } catch {
    return "";
  }
}

// ─── Main Blender generation function ────────────────────────────────────────

export async function generateWithBlender(
  prompt: string,
  referenceImageBase64?: string,
  referenceImageMimeType?: string
): Promise<Blender3DResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnimens-blender-"));
  const scriptPath   = path.join(tmpDir, "scene.py");
  const glbPath      = path.join(tmpDir, "output.glb");
  const objPath      = path.join(tmpDir, "output.obj");
  const stlPath      = path.join(tmpDir, "output.stl");
  const fbxPath      = path.join(tmpDir, "output.fbx");
  const renderPath   = path.join(tmpDir, "preview.png");

  try {
    // ── Step 1: Analyze reference image if provided ────────────────────────
    let imageAnalysis = "";
    if (referenceImageBase64 && referenceImageMimeType) {
      console.log("[OMNIMENS BLENDER] Analyzing reference image with GPT-4o Vision...");
      imageAnalysis = await analyzeReferenceImage(referenceImageBase64, referenceImageMimeType, prompt);
      console.log("[OMNIMENS BLENDER] Image analysis:", imageAnalysis.slice(0, 200));
    }

    // ── Step 2: Load accumulated Blender mastery from brain DB ────────────
    const accumulatedKnowledge = await loadToolKnowledgeForTask("3d blender model character mesh bpy").catch(() => "");

    // ── Step 3: Build enriched system prompt with brain knowledge ──────────
    const enrichedSystemPrompt = accumulatedKnowledge
      ? `${BLENDER_FULL_SYSTEM_PROMPT}

════════════════════════════════════════
ACCUMULATED MASTERY KNOWLEDGE (learned from documentation + examples):
════════════════════════════════════════
${accumulatedKnowledge}

Apply this accumulated mastery when writing the script. Use the most sophisticated techniques available.`
      : BLENDER_FULL_SYSTEM_PROMPT;

    // ── Step 4: GPT-4o writes the Blender bpy script ──────────────────────
    const qualityDirective = `
QUALITY REQUIREMENTS — THIS IS NON-NEGOTIABLE:
• MINIMUM 3 different modifiers (SubSurf + Bevel + at least one more)
• MINIMUM 2 distinct materials with full shader node trees (Noise/Voronoi/Wave textures)
• Complex geometry — NOT just a single primitive. Build in multiple parts, use boolean ops or BMesh
• Proper 3-point lighting (key light, fill light, rim/accent light) with area lights
• Cinematic camera placement with correct focal length
• All objects properly named and organized
• Subdivision levels: at minimum 2 for smooth shapes, 3 for characters/organic

EXAMPLES OF WHAT IS REQUIRED:
✓ A humanoid character: head (UV sphere + subdivision + sculpt-like displacement), body (cylinders + solidify), hands (5 separate finger cylinders with armature), metallic armor material with clearcoat
✓ A sci-fi spaceship: hull (box + bevel + mirror), engine nacelles (cylinders + array), glowing engine material (emission), battle damage (displacement modifier), cockpit glass (transmission BSDF)
✗ UNACCEPTABLE: A plain UV sphere with a single material. A box with no modifiers. Anything that could be built in 2 lines of code.`;

    const userContent = imageAnalysis
      ? `Create a CINEMA-QUALITY, extremely detailed 3D model of: ${prompt}\n\nREFERENCE IMAGE ANALYSIS:\n${imageAnalysis}\n\nMatch the geometry, colors, materials, and details exactly. Use every Blender tool needed.\n${qualityDirective}`
      : `Create a CINEMA-QUALITY, extremely detailed and complex 3D model of: ${prompt}\n\nThis must be genuinely impressive — not a placeholder. Use sophisticated modifier stacks, PBR shader node textures, multiple mesh objects, proper studio lighting, and cinematic camera.\n${qualityDirective}`;

    const messages: any[] = [
      { role: "system", content: enrichedSystemPrompt },
      {
        role: "user",
        content: referenceImageBase64
          ? [
              { type: "image_url", image_url: { url: `data:${referenceImageMimeType};base64,${referenceImageBase64}`, detail: "high" } },
              { type: "text", text: userContent }
            ]
          : userContent
      }
    ];

    const scriptResp = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.75,
      max_tokens: 8192,
      messages,
    });

    let blenderScript = scriptResp.choices[0].message.content?.trim() || "";
    blenderScript = blenderScript.replace(/^```python\n?/i, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

    // Safety: ensure the export block exists with correct env var usage
    if (!blenderScript.includes("OMNIMENS_GLB") && !blenderScript.includes("OMNIMENS_DONE")) {
      blenderScript += `

# ═══ OMNIMENS EXPORT BLOCK ═══
import os
GLB_PATH = os.environ.get('OMNIMENS_GLB', '${glbPath}')
OBJ_PATH = os.environ.get('OMNIMENS_OBJ', '${objPath}')
STL_PATH = os.environ.get('OMNIMENS_STL', '${stlPath}')
FBX_PATH = os.environ.get('OMNIMENS_FBX', '${fbxPath}')
RENDER_PATH = os.environ.get('OMNIMENS_RENDER', '${renderPath}')

bpy.ops.export_scene.gltf(filepath=GLB_PATH, export_format='GLB', export_apply=True, export_materials='EXPORT', export_normals=True)
try: bpy.ops.wm.obj_export(filepath=OBJ_PATH, export_materials=True)
except: pass
try: bpy.ops.export_mesh.stl(filepath=STL_PATH, use_mesh_modifiers=True)
except: pass
try: bpy.ops.export_scene.fbx(filepath=FBX_PATH, use_mesh_modifiers=True, mesh_smooth_type='FACE')
except: pass

sc = bpy.context.scene
if not sc.world:
    sc.world = bpy.data.worlds.new("World")
sc.render.engine = 'CYCLES'; sc.cycles.samples=64; sc.cycles.device='CPU'
sc.cycles.use_denoising=True; sc.render.resolution_x=768; sc.render.resolution_y=768
sc.render.filepath=RENDER_PATH; sc.render.image_settings.file_format='PNG'
bpy.ops.render.render(write_still=True)
print(f"OMNIMENS_DONE glb={os.path.getsize(GLB_PATH)} render={os.path.getsize(RENDER_PATH)}")
`;
    }

    // ── Step 5: Run Blender headlessly — with up to 2 retry attempts ──────
    const blenderEnv = {
      ...process.env,
      DISPLAY: "",
      BLENDER_USER_RESOURCES: tmpDir,
      OMNIMENS_GLB: glbPath,
      OMNIMENS_OBJ: objPath,
      OMNIMENS_STL: stlPath,
      OMNIMENS_FBX: fbxPath,
      OMNIMENS_RENDER: renderPath,
    };

    async function runBlenderScript(script: string): Promise<{ stdout: string; stderr: string; success: boolean }> {
      fs.writeFileSync(scriptPath, script, "utf8");
      // Remove previous GLB so we can detect fresh output
      if (fs.existsSync(glbPath)) fs.unlinkSync(glbPath);
      try {
        const result = await execFileAsync("blender", ["--background", "--python", scriptPath, "--"], {
          timeout: 180_000,
          maxBuffer: 20 * 1024 * 1024,
          env: blenderEnv,
        });
        const success = fs.existsSync(glbPath) && fs.statSync(glbPath).size > 100;
        return { stdout: result.stdout, stderr: result.stderr, success };
      } catch (execErr: any) {
        const stdout = execErr.stdout || "";
        const stderr = execErr.stderr || "";
        const success = fs.existsSync(glbPath) && fs.statSync(glbPath).size > 100;
        return { stdout, stderr, success };
      }
    }

    let { stdout, stderr, success } = await runBlenderScript(blenderScript);
    console.log(`[OMNIMENS BLENDER] Attempt 1: success=${success}`);

    // Retry loop — if Blender failed, send error to GPT-4o for a fix
    for (let attempt = 2; attempt <= 3 && !success; attempt++) {
      console.log(`[OMNIMENS BLENDER] Attempt ${attempt}: script had errors, asking GPT-4o to fix...`);
      const errorSnippet = (stdout + stderr).split("\n").filter(l =>
        l.includes("Error") || l.includes("error") || l.includes("Traceback") || l.includes("line ") || l.includes("SyntaxError")
      ).slice(0, 30).join("\n");

      const fixResp = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,
        max_tokens: 8192,
        messages: [
          { role: "system", content: enrichedSystemPrompt },
          { role: "user", content: userContent },
          { role: "assistant", content: blenderScript },
          {
            role: "user",
            content: `The Blender script produced errors. Fix ALL errors and return a corrected, complete, runnable script.\n\nERRORS:\n${errorSnippet || (stdout + stderr).slice(-1500)}\n\nReturn ONLY the fixed Python code — no markdown, no explanation.`,
          },
        ],
      });

      blenderScript = (fixResp.choices[0].message.content?.trim() || blenderScript)
        .replace(/^```python\n?/i, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

      // Ensure export block
      if (!blenderScript.includes("OMNIMENS_GLB") && !blenderScript.includes("OMNIMENS_DONE")) {
        blenderScript += `\n\nimport os\nGLB_PATH=os.environ.get('OMNIMENS_GLB','${glbPath}')\nbpy.ops.export_scene.gltf(filepath=GLB_PATH,export_format='GLB',export_apply=True,export_materials='EXPORT',export_normals=True)\nsc=bpy.context.scene\nsc.render.engine='CYCLES';sc.cycles.samples=32;sc.cycles.device='CPU'\nsc.render.resolution_x=768;sc.render.resolution_y=768\nRENDER_PATH=os.environ.get('OMNIMENS_RENDER','${renderPath}')\nsc.render.filepath=RENDER_PATH;sc.render.image_settings.file_format='PNG'\nbpy.ops.render.render(write_still=True)\nprint(f"OMNIMENS_DONE glb={os.path.getsize(GLB_PATH)}")`;
      }

      const retryResult = await runBlenderScript(blenderScript);
      stdout = retryResult.stdout; stderr = retryResult.stderr; success = retryResult.success;
      console.log(`[OMNIMENS BLENDER] Attempt ${attempt}: success=${success}`);
    }

    if (!success) {
      throw new Error(`Blender failed after 3 attempts.\n${(stdout + stderr).slice(-1000)}`);
    }

    // ── Step 4: Read all outputs ────────────────────────────────────────
    const glbBuffer = fs.readFileSync(glbPath);
    const glbBase64 = glbBuffer.toString("base64");

    const previewImageBase64 = fs.existsSync(renderPath)
      ? fs.readFileSync(renderPath).toString("base64")
      : "";

    // ── Step 5: Count geometry stats ──────────────────────────────────────
    let vertexCount = 0, faceCount = 0;
    const statsMatch = stdout.match(/Verts:(\d+)\s*\|?\s*Faces:(\d+)/i);
    if (statsMatch) { vertexCount = parseInt(statsMatch[1]); faceCount = parseInt(statsMatch[2]); }
    else { vertexCount = Math.floor(glbBuffer.length / 32); faceCount = Math.floor(glbBuffer.length / 48); }

    // ── Step 6: Build Three.js viewer ─────────────────────────────────────
    const threejsHtml = buildThreejsViewer(glbBase64, prompt, vertexCount, faceCount);

    // ── Step 7: Create zip with all formats ──────────────────────────────
    const zip = new JSZip();
    const modelName = prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();

    zip.file(`${modelName}.glb`, glbBuffer);
    if (fs.existsSync(objPath)) zip.file(`${modelName}.obj`, fs.readFileSync(objPath));
    if (fs.existsSync(stlPath)) zip.file(`${modelName}.stl`, fs.readFileSync(stlPath));
    if (fs.existsSync(fbxPath)) zip.file(`${modelName}.fbx`, fs.readFileSync(fbxPath));
    if (fs.existsSync(renderPath)) zip.file(`${modelName}-preview.png`, fs.readFileSync(renderPath));
    if (fs.existsSync(scriptPath)) zip.file(`${modelName}-omnimens-3d.py`, fs.readFileSync(scriptPath));

    // Add README
    const formats: string[] = ["GLB"];
    if (fs.existsSync(objPath)) formats.push("OBJ");
    if (fs.existsSync(stlPath)) formats.push("STL");
    if (fs.existsSync(fbxPath)) formats.push("FBX");
    if (fs.existsSync(renderPath)) formats.push("PNG preview");

    zip.file("README.txt", `OMNIMENS 3D MODEL EXPORT
========================
Prompt: ${prompt}
Generated by: OMNIMENS AI
Formats included: ${formats.join(", ")}

FILE FORMATS:
  .glb  — glTF Binary (Unity, Unreal, Godot, Three.js, web)
  .obj  — Wavefront OBJ (universal, all 3D software)
  .stl  — Stereolithography (3D printing)
  .fbx  — Filmbox (Autodesk Maya, 3ds Max, game engines)
  .py   — 3D generation script (for advanced editing)
  .png  — Photorealistic preview render

Generated by OMNIMENS AI — omnimens.alphaunlimitedt.replit.app
`);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
    const zipBase64 = zipBuffer.toString("base64");

    return {
      glbBase64,
      glbSizeBytes: glbBuffer.length,
      threejsHtml,
      vertexCount,
      faceCount,
      blenderScript,
      previewImageBase64,
      zipBase64,
      zipSizeBytes: zipBuffer.length,
      formats,
      tool: "blender",
    };

  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
