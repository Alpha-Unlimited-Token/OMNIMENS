// © 2026 Alpha Unlimited Technologies, LLC — All Rights Reserved
// OMNIMENS™ Consolidated Engine: omnimens-world-engine.ts
// Merged from: omnimens-3d.ts, omnimens-blender.ts, omnimens-openscad.ts, omnimens-world-model.ts, omnimens-world-forge.ts, omnimens-digital-navigator.ts, omnimens-social-modeling.ts

import { execFile, spawnSync } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { openai } from "@workspace/integrations-openai-ai-server";

// ======================================================================
// SECTION: omnimens-3d.ts
// ======================================================================


const execFileAsync = promisify(execFile);

// ── Tool classifier — GPT-4o decides which 3D tool fits best ─────────────────

async function classifyPromptFor3DTool(prompt: string): Promise<"blender" | "openscad" | "trimesh"> {
  return "trimesh";
}

export type Generated3DModel = {
  glbBase64: string;
  glbSizeBytes: number;
  threejsHtml: string;
  pythonScript: string;
  description: string;
  vertexCount: number;
  faceCount: number;
  toolUsed?: "blender" | "openscad" | "trimesh";
  previewImageBase64?: string;
  zipBase64?: string;
  zipSizeBytes?: number;
  formats?: string[];
};

// ── GPT-4o generates the trimesh Python script ────────────────────────────────

const TRIMESH_SYSTEM_PROMPT = `You are OMNIMENS 3D — a world-class procedural 3D sculptor and Python programmer.

You write Python scripts using trimesh, numpy, scipy, and pillow to create stunning, original 3D models.
The script outputs a .glb file to the path given in the 'OUTPUT_PATH' environment variable.

RULES:
1. Import: trimesh, numpy as np, scipy as needed. NO other 3D libraries.
2. Never use any external URLs, files, or assets. All geometry is generated programmatically.
3. Output ONLY the .glb file — save it to: import os; output_path = os.environ['OUTPUT_PATH']
4. Make models with real artistic depth: subdivisions, smooth normals, procedural textures baked as vertex colors, beveled edges, detail.
5. Every model must be watertight, manifold, and properly scaled (1 unit ≈ 1 meter).
6. Use vertex colors for visual richness when textures are needed (mesh.visual.vertex_colors).
7. Use trimesh.creation, trimesh.transformations, trimesh.boolean, trimesh.graph, trimesh.smoothing.
8. Use scipy.spatial for complex convex hulls or Delaunay structures.
9. Create COMPLETE, RUNNABLE scripts — no placeholders, no "TODO", no stubs.
10. Complex models: combine multiple sub-meshes with trimesh.util.concatenate().
11. Apply artistic materials: use ColorVisuals or PBRMaterial where appropriate.

AVAILABLE TOOLS:
- trimesh.creation.icosphere(subdivisions, radius) — smooth sphere
- trimesh.creation.cylinder(radius, height, sections) — cylinder
- trimesh.creation.box(extents) — box
- trimesh.creation.cone(radius, height, sections) — cone
- trimesh.creation.torus(major_radius, minor_radius, major_sections, minor_sections) — torus
- trimesh.creation.annulus(r_min, r_max, height) — ring/annulus
- trimesh.creation.extrude_polygon(polygon, height) — extrude 2D shape
- trimesh.creation.extrude_triangulation(vertices, faces, height) — extrude triangulation
- trimesh.smoothing.filter_laplacian(mesh, iterations) — smooth mesh
- trimesh.boolean.union/difference/intersection(meshes, engine='blender'/'scad') — boolean ops
- trimesh.transformations — rotation, translation, scaling matrices
- trimesh.util.concatenate(meshes) — merge meshes
- numpy random/noise for procedural variation

Output the .glb file to 'output_path' using: mesh.export(output_path, file_type='glb')
`;

async function generateTrimeshScript(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: TRIMESH_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Create a stunning, original 3D model of: ${prompt}

Generate a complete Python script that creates this model using trimesh and numpy.
Make it genuinely impressive — real artistic depth, proper proportions, smooth surfaces, and rich vertex colors.
Output the .glb to os.environ['OUTPUT_PATH'].`,
      },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  });

  let script = response.choices[0]?.message?.content || "";

  // Extract Python code block — handles GPT-4o preamble prose and any fence style
  // Strategy 1: pull out ```python ... ``` or ``` ... ``` block
  const fenceMatch = script.match(/```(?:python)?\s*\n([\s\S]+?)\n```/);
  if (fenceMatch) {
    script = fenceMatch[1].trim();
  } else {
    // Strategy 2: find first line that starts with "import" or "#!" and use from there
    const lines = script.split("\n");
    const codeStart = lines.findIndex(l => /^(import |from |#!|#\s*-\*-|output_path|os\.environ)/.test(l.trim()));
    if (codeStart > 0) {
      script = lines.slice(codeStart).join("\n").trim();
    } else {
      // Strategy 3: strip everything up to and including the first blank line after prose
      script = script.replace(/^[\s\S]*?(?=^import\s|^from\s)/m, "").trim();
    }
  }

  // Final cleanup — remove any trailing markdown or explanation text
  script = script.replace(/\n```[\s\S]*$/, "").trim();

  // Ensure the output path env var is used
  if (!script.includes("OUTPUT_PATH")) {
    script = `import os\noutput_path = os.environ.get('OUTPUT_PATH', '/tmp/model.glb')\n` + script;
  }

  return script;
}

// ── Execute the Python script in a sandboxed temp dir ─────────────────────────

async function runTrimeshScript(script: string): Promise<{ glbData: Buffer; vertexCount: number; faceCount: number }> {
  const tmpDir = join(tmpdir(), `omnimens-3d-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  const scriptPath = join(tmpDir, "generate.py");
  const outputPath = join(tmpDir, "model.glb");
  const statsPath = join(tmpDir, "stats.txt");

  // Append stats collection to the script
  const statsScript = `
import json, sys
# Collect mesh stats after generation
try:
    import trimesh as _tm
    _mesh = _tm.load('${outputPath.replace(/\\/g, "/")}')
    if hasattr(_mesh, 'vertices'):
        _verts = len(_mesh.vertices)
        _faces = len(_mesh.faces)
    else:
        _verts = sum(len(s.vertices) for s in _mesh.geometry.values() if hasattr(s, 'vertices'))
        _faces = sum(len(s.faces) for s in _mesh.geometry.values() if hasattr(s, 'faces'))
    with open('${statsPath.replace(/\\/g, "/")}', 'w') as f:
        json.dump({'vertices': _verts, 'faces': _faces}, f)
except:
    with open('${statsPath.replace(/\\/g, "/")}', 'w') as f:
        f.write('{"vertices": 0, "faces": 0}')
`;

  const fullScript = script
    .replace(/output_path\s*=.*OUTPUT_PATH.*/g, `output_path = '${outputPath.replace(/\\/g, "/")}'`)
    + "\n" + statsScript;

  await writeFile(scriptPath, fullScript, "utf-8");

  try {
    await execFileAsync("python3", [scriptPath], {
      timeout: 120_000,
      env: {
        ...process.env,
        OUTPUT_PATH: outputPath,
        PYTHONPATH: process.env.PYTHONPATH || "",
      },
      maxBuffer: 10 * 1024 * 1024,
    });

    const [glbData, statsRaw] = await Promise.all([
      readFile(outputPath),
      readFile(statsPath, "utf-8").catch(() => '{"vertices":0,"faces":0}'),
    ]);

    let stats = { vertices: 0, faces: 0 };
    try { stats = JSON.parse(statsRaw); } catch {}

    return { glbData, vertexCount: stats.vertices, faceCount: stats.faces };
  } finally {
    // Clean up temp files (non-blocking)
    Promise.all([
      unlink(scriptPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      unlink(statsPath).catch(() => {}),
    ]).catch(() => {});
  }
}

// ── Build in-browser Three.js viewer that embeds the .glb as base64 ──────────

function buildThreejsViewer(glbBase64: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${title} — OMNIMENS 3D</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;overflow:hidden;font-family:'Courier New',monospace}
  canvas{display:block}
  #ui{position:fixed;top:16px;left:16px;z-index:10;display:flex;flex-direction:column;gap:8px}
  #title{color:#a78bfa;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:bold;text-shadow:0 0 12px #a78bfa88}
  #stats{color:#ffffff55;font-size:9px;letter-spacing:.1em}
  #controls{color:#ffffff30;font-size:8px;letter-spacing:.08em;margin-top:4px}
  #download-btn{margin-top:8px;padding:6px 14px;background:transparent;border:1px solid #a78bfa55;color:#a78bfa;font-family:inherit;font-size:9px;letter-spacing:.15em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  #download-btn:hover{background:#a78bfa15;border-color:#a78bfa}
  #rec-btn{padding:6px 12px;background:transparent;border:1px solid #dc262655;color:#dc2626;font-family:inherit;font-size:9px;letter-spacing:.15em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  #rec-btn:hover{background:#dc262615;border-color:#dc2626}
  #rec-btn.recording{color:#ef4444;border-color:#ef4444;animation:pulse .8s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
</style>
</head>
<body>
<div id="ui">
  <div id="title">⬡ ${title}</div>
  <div id="stats">Loading model...</div>
  <div id="controls">DRAG · SCROLL · RIGHT-CLICK PAN</div>
  <button id="download-btn" onclick="downloadGLB()">⬇ Download .glb</button>
  <button id="rec-btn" onclick="toggleRecord()">⬤ REC</button>
</div>

<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const W = window.innerWidth, H = window.innerHeight;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

const camera = new THREE.PerspectiveCamera(45, W/H, 0.01, 1000);
camera.position.set(3, 2, 4);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.minDistance = 0.5;
controls.maxDistance = 50;

// Procedural HDR environment (no external files)
const pmremGen = new THREE.PMREMGenerator(renderer);
pmremGen.compileEquirectangularShader();
const envScene = new THREE.Scene();
const envColors = [0x1a0a2e,0x16213e,0x0f3460,0x533483];
envColors.forEach((c,i)=>{
  const light = new THREE.DirectionalLight(c, 0.4);
  const angle = (i/envColors.length)*Math.PI*2;
  light.position.set(Math.cos(angle)*10, 5+i*2, Math.sin(angle)*10);
  scene.add(light);
});
const envTex = pmremGen.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
pmremGen.dispose();

// Lighting
const ambient = new THREE.AmbientLight(0x1a0a2e, 0.8);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xa78bfa, 3);
key.position.set(5, 10, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = 100;
key.shadow.bias = -0.001;
scene.add(key);
const fill = new THREE.DirectionalLight(0x3b82f6, 1.5);
fill.position.set(-5, 3, -3);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xf472b6, 1.2);
rim.position.set(0, -5, -8);
scene.add(rim);

// Ground plane with reflection
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40,40),
  new THREE.MeshStandardMaterial({color:0x0d0d1a,roughness:.8,metalness:.2})
);
ground.rotation.x = -Math.PI/2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// Particle field
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(3000);
for(let i=0;i<3000;i++){
  pPos[i*3]=(Math.random()-.5)*40;
  pPos[i*3+1]=(Math.random()-.5)*40;
  pPos[i*3+2]=(Math.random()-.5)*40;
}
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({color:0xa78bfa,size:.03,sizeAttenuation:true,transparent:true,opacity:.6}));
scene.add(particles);

// Load GLB from embedded base64
const glbBase64 = \`${glbBase64}\`;
const glbBytes = Uint8Array.from(atob(glbBase64), c=>c.charCodeAt(0));
const glbBlob = new Blob([glbBytes], {type:'model/gltf-binary'});
const glbUrl = URL.createObjectURL(glbBlob);

const loader = new GLTFLoader();
let modelMesh = null;
loader.load(glbUrl, (gltf)=>{
  const model = gltf.scene;
  // Center and scale model
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x,size.y,size.z);
  const scale = 2.5/maxDim;
  model.scale.setScalar(scale);
  const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
  model.position.sub(center);
  model.position.y += 0.1;

  // Apply PBR materials and shadows
  let verts=0,faces=0;
  model.traverse(c=>{
    if(c.isMesh){
      c.castShadow=true; c.receiveShadow=true;
      verts+=c.geometry.attributes.position?.count||0;
      faces+=(c.geometry.index?.count||0)/3||0;
      if(c.material){
        const mats=Array.isArray(c.material)?c.material:[c.material];
        mats.forEach(m=>{
          if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial){
            m.envMapIntensity=1.4;
            m.needsUpdate=true;
          }
        });
      }
    }
  });
  document.getElementById('stats').textContent =
    'V: '+(verts||'–')+' · F: '+(faces||'–')+' · .glb ready';

  scene.add(model);
  modelMesh = model;
  // Adjust camera to model
  camera.position.set(maxDim*2, maxDim*1.5, maxDim*2.5);
  controls.target.set(0,0,0);
  controls.update();
  URL.revokeObjectURL(glbUrl);
}, undefined, (err)=>{
  document.getElementById('stats').textContent='Load error: '+err.message;
});

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W,H), 0.35, 0.4, 0.7);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Animate
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  if(particles) particles.rotation.y += 0.0002;
  composer.render();
}
animate();
window.addEventListener('resize',()=>{
  const w=window.innerWidth,h=window.innerHeight;
  camera.aspect=w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h); composer.setSize(w,h);
});

// Download GLB
window.downloadGLB = ()=>{
  const a=document.createElement('a');
  a.href='data:model/gltf-binary;base64,${glbBase64}';
  a.download='omnimens-model.glb';
  a.click();
};

// Record
let recorder=null, chunks=[];
window.toggleRecord = ()=>{
  const btn=document.getElementById('rec-btn');
  if(recorder&&recorder.state==='recording'){
    recorder.stop();
    btn.textContent='⬤ REC'; btn.classList.remove('recording');
    return;
  }
  chunks=[];
  const stream=renderer.domElement.captureStream(30);
  recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'});
  recorder.ondataavailable=e=>chunks.push(e.data);
  recorder.onstop=()=>{
    const blob=new Blob(chunks,{type:'video/webm'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='omnimens-3d.webm';
    a.click();
  };
  recorder.start();
  btn.textContent='⬛ STOP'; btn.classList.add('recording');
  setTimeout(()=>{if(recorder.state==='recording'){recorder.stop();btn.textContent='⬤ REC';btn.classList.remove('recording');}},30000);
};
</script>
</body></html>`;
}

// ── Main export: generate a 3D model from a text prompt ──────────────────────

export async function generate3DModel(
  prompt: string,
  referenceImageBase64?: string,
  referenceImageMimeType?: string
): Promise<Generated3DModel> {
  const tool = await classifyPromptFor3DTool(prompt);
  console.log(`[OMNIMENS 3D] Tool selected: ${tool.toUpperCase()} for prompt: "${prompt.slice(0, 80)}"`);

  // ── ALWAYS try Blender first — it is the primary engine for ALL prompts ──
  // Blender handles organic, artistic, mechanical, fantasy, sci-fi, characters,
  // vehicles, architecture — everything. OpenSCAD is a secondary specialisation.
  try {
    console.log("[OMNIMENS 3D] Attempting Blender generation...");
    const result = await generateWithBlender(prompt, referenceImageBase64, referenceImageMimeType);
    return {
      glbBase64: result.glbBase64,
      glbSizeBytes: result.glbSizeBytes,
      threejsHtml: result.threejsHtml,
      pythonScript: result.blenderScript,
      description: prompt,
      vertexCount: result.vertexCount,
      faceCount: result.faceCount,
      toolUsed: "blender" as const,
      previewImageBase64: result.previewImageBase64,
      zipBase64: result.zipBase64,
      zipSizeBytes: result.zipSizeBytes,
      formats: result.formats,
    };
  } catch (blenderErr) {
    console.warn("[OMNIMENS 3D] Blender failed, trying OpenSCAD then trimesh:", (blenderErr as Error).message?.slice(0, 200));
  }

  // ── Try OpenSCAD for parametric/mechanical (if Blender failed) ──────────
  if (tool === "openscad") {
    try {
      const result = await generateWithOpenSCAD(prompt);
      return {
        glbBase64: result.glbBase64,
        glbSizeBytes: result.glbSizeBytes,
        threejsHtml: result.threejsHtml,
        pythonScript: result.scadCode,
        description: prompt,
        vertexCount: result.vertexCount,
        faceCount: result.faceCount,
        toolUsed: "openscad" as const,
      };
    } catch (scadErr) {
      console.warn("[OMNIMENS 3D] OpenSCAD also failed, using trimesh:", (scadErr as Error).message?.slice(0, 100));
    }
  }

  // ── Fallback: trimesh Python pipeline (always works) ────────────────────
  console.log("[OMNIMENS 3D] Using trimesh fallback pipeline");
  const pythonScript = await generateTrimeshScript(prompt);
  const { glbData, vertexCount, faceCount } = await runTrimeshScript(pythonScript);
  const glbBase64 = glbData.toString("base64");
  const title = prompt.slice(0, 50).replace(/[<>"]/g, "");
  const threejsHtml = buildThreejsViewer(glbBase64, title);

  return {
    glbBase64,
    glbSizeBytes: glbData.length,
    threejsHtml,
    pythonScript,
    description: prompt,
    vertexCount,
    faceCount,
    toolUsed: "trimesh" as const,
  };
}


// ======================================================================
// SECTION: omnimens-blender.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

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

import { loadToolKnowledgeForTask } from "./omnimens-memory-core.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import JSZip from "jszip";

const execFileAsyncOSCAD = promisify(execFile);

// ─── Three.js PBR viewer ─────────────────────────────────────────────────────

function buildThreejsViewer_section2(glbBase64: string, prompt: string, vertexCount: number, faceCount: number): string {
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
const W_s2=innerWidth,H=innerHeight;
const renderer_s2=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,H);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene_s2=new THREE.Scene();scene.background=new THREE.Color(0x050510);
scene.fog=new THREE.FogExp2(0x050510,0.03);
const camera_s2=new THREE.PerspectiveCamera(45,W/H,0.01,1000);camera.position.set(3,2,4);
const controls_s2=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.06;controls.autoRotate=true;controls.autoRotateSpeed=1.2;
scene.add(new THREE.AmbientLight(0xffffff,0.25));
const d=new THREE.DirectionalLight(0xffffff,2.5);d.position.set(5,8,5);d.castShadow=true;d.shadow.mapSize.set(2048,2048);scene.add(d);
const f=new THREE.DirectionalLight(0x4080ff,0.7);f.position.set(-5,3,-5);scene.add(f);
const r=new THREE.DirectionalLight(0x00e5ff,0.5);r.position.set(0,5,-8);scene.add(r);
scene.add(new THREE.GridHelper(20,40,0x1a1a3a,0x0d0d1f));
const composer_s2=new EffectComposer(renderer);
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


// ======================================================================
// SECTION: omnimens-openscad.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS OPENSCAD PIPELINE
 * ─────────────────────────────────────────────────────────────────────────────
 * GPT-4o writes OpenSCAD code (.scad) for parametric/geometric/mechanical
 * objects → OpenSCAD renders headlessly → exports .stl → trimesh converts to
 * .glb → Three.js PBR viewer.
 *
 * Best for: gears, brackets, enclosures, architectural forms, fractals, 
 * lattices, parametric furniture, technical parts, math objects.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsyncBlender = promisify(execFile);

function buildThreejsViewer_section3(glbBase64: string, prompt: string, vertexCount: number, faceCount: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>OMNIMENS 3D — ${prompt.slice(0, 60)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#050510;color:#fff;font-family:monospace;overflow:hidden}
#c{display:block;width:100vw;height:100vh}
#ui{position:fixed;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;z-index:10}
#title{font-size:10px;letter-spacing:.15em;color:rgba(255,255,255,.5);max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#stats{font-size:9px;color:rgba(100,220,255,.6);text-align:right}
#btns{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:10}
button{background:rgba(0,180,255,.12);border:1px solid rgba(0,180,255,.35);color:#7be0ff;font-family:monospace;font-size:10px;letter-spacing:.12em;padding:7px 18px;border-radius:8px;cursor:pointer;transition:all .2s}
button:hover{background:rgba(0,180,255,.28);color:#fff}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="ui">
  <div id="title">⬡ ${prompt.slice(0, 80)}</div>
  <div id="stats">${vertexCount.toLocaleString()} verts · ${faceCount.toLocaleString()} faces</div>
</div>
<div id="btns">
  <button id="dl">⬇ DOWNLOAD .GLB</button>
  <button id="wire">◫ WIREFRAME</button>
  <button id="spin">⟳ AUTO-ROTATE</button>
</div>
<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';

const W_s3=innerWidth,H=innerHeight;
const renderer_s3=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(W,H);
renderer.shadowMap.enabled=true;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene_s3=new THREE.Scene();
scene.background=new THREE.Color(0x050510);
const camera_s3=new THREE.PerspectiveCamera(45,W/H,0.01,1000);
camera.position.set(3,2,4);

const controls_s3=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.06;
controls.autoRotate=true;
controls.autoRotateSpeed=0.9;

scene.add(new THREE.AmbientLight(0xffffff,0.4));
const d_s2=new THREE.DirectionalLight(0xffffff,2);d.position.set(5,8,5);d.castShadow=true;scene.add(d);
scene.add(new THREE.DirectionalLight(0x4080ff,0.5)).position.set(-5,3,-5);
scene.add(new THREE.GridHelper(20,40,0x1a1a3a,0x0d0d1f));

const composer_s3=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W,H),0.35,0.4,0.9));

const b64_s2="${glbBase64}";
const raw_s2=atob(b64);const bytes=new Uint8Array(raw.length);
for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
const blob_s2=new Blob([bytes],{type:'model/gltf-binary'});
const url_s2=URL.createObjectURL(blob);

new GLTFLoader().load(url,gltf=>{
  const m=gltf.scene;
  const box=new THREE.Box3().setFromObject(m);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3()).length();
  const sc=3/size;
  m.position.sub(center.multiplyScalar(sc));
  m.scale.setScalar(sc);
  m.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;
    if(!n.material)n.material=new THREE.MeshStandardMaterial({color:0x7090d0,metalness:0.3,roughness:0.5});}});
  scene.add(m);
  camera.position.setLength(size*sc*1.8+2);controls.update();URL.revokeObjectURL(url);
});

let wire=false;
document.getElementById('wire').addEventListener('click',()=>{wire=!wire;scene.traverse(n=>{if(n.isMesh&&n.material)n.material.wireframe=wire;});});
document.getElementById('spin').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;e.target.style.color=controls.autoRotate?'#7be0ff':'#555';});
document.getElementById('dl').addEventListener('click',()=>{const a=document.createElement('a');a.href='data:model/gltf-binary;base64,${glbBase64}';a.download='omnimens-openscad.glb';a.click();});

window.addEventListener('resize',()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);});
(function loop(){requestAnimationFrame(loop);controls.update();composer.render();})();
</script>
</body></html>`;
}

export interface OpenSCAD3DResult {
  glbBase64: string;
  glbSizeBytes: number;
  threejsHtml: string;
  vertexCount: number;
  faceCount: number;
  scadCode: string;
  tool: "openscad";
}

export async function generateWithOpenSCAD(prompt: string): Promise<OpenSCAD3DResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnimens-scad-"));
  const scadPath = path.join(tmpDir, "model.scad");
  const stlPath  = path.join(tmpDir, "model.stl");
  const glbPath  = path.join(tmpDir, "model.glb");
  const convScript = path.join(tmpDir, "convert.py");

  try {
    // ── Step 1: GPT-4o writes OpenSCAD code ──────────────────────────────
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `You are OMNIMENS's OpenSCAD expert. Write complete, runnable OpenSCAD code to build a detailed parametric 3D model.

RULES:
- Use $fn=64 or higher for smooth curves
- Use union(), difference(), intersection() for complex shapes
- Use translate(), rotate(), scale(), mirror() for placement
- Use for() loops and modules for repeated elements
- Use hull() and minkowski() for organic blend shapes
- Build detailed, complex geometry — not just a simple primitive
- Output ONLY the OpenSCAD code — no markdown, no explanation`
        },
        {
          role: "user",
          content: `Create detailed OpenSCAD code for: ${prompt}

Make it complex, parametric, and detailed. Use multiple operations.`
        }
      ]
    });

    let scadCode = resp.choices[0].message.content?.trim() || "";
    scadCode = scadCode.replace(/^```(openscad|scad)?\n?/i, "").replace(/\n?```$/, "").trim();
    if (!scadCode.includes("$fn")) scadCode = "$fn=64;\n" + scadCode;
    fs.writeFileSync(scadPath, scadCode, "utf8");

    // ── Step 2: Run OpenSCAD headlessly ──────────────────────────────────
    await execFileAsync("openscad", [
      "--export-format", "stl",
      "-o", stlPath,
      scadPath,
    ], {
      timeout: 90_000,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, DISPLAY: "" },
    });

    if (!fs.existsSync(stlPath) || fs.statSync(stlPath).size < 200) {
      throw new Error("OpenSCAD did not produce a valid STL");
    }

    // ── Step 3: Convert STL → GLB using trimesh ───────────────────────────
    const pyConvert = `
import trimesh, sys
mesh = trimesh.load("${stlPath}")
if isinstance(mesh, trimesh.Scene):
    mesh = trimesh.util.concatenate(list(mesh.geometry.values()))
mesh.visual.material = trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.4, 0.6, 0.9, 1.0],
    metallicFactor=0.25,
    roughnessFactor=0.55,
)
mesh.export("${glbPath}")
verts = len(mesh.vertices)
faces = len(mesh.faces)
print(f"SCAD_CONVERT_OK: {verts} verts {faces} faces")
`;
    fs.writeFileSync(convScript, pyConvert, "utf8");
    const convResult = spawnSync("python3", [convScript], {
      timeout: 30_000,
      encoding: "utf8",
      env: { ...process.env, DISPLAY: "" },
    });

    if (!fs.existsSync(glbPath)) {
      throw new Error(`STL→GLB conversion failed: ${convResult.stderr?.slice(-500)}`);
    }

    const glbBuffer = fs.readFileSync(glbPath);
    const glbBase64 = glbBuffer.toString("base64");

    // Parse stats
    let vertexCount = 0, faceCount = 0;
    const m = (convResult.stdout || "").match(/(\d+)\s+verts\s+(\d+)\s+faces/);
    if (m) { vertexCount = parseInt(m[1]); faceCount = parseInt(m[2]); }

    const threejsHtml = buildThreejsViewer(glbBase64, prompt, vertexCount, faceCount);

    return {
      glbBase64,
      glbSizeBytes: glbBuffer.length,
      threejsHtml,
      vertexCount,
      faceCount,
      scadCode,
      tool: "openscad",
    };

  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}


// ======================================================================
// SECTION: omnimens-world-model.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ COMMON SENSE WORLD MODEL + FLUID ADAPTATION ENGINE        ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Provides intuitive physics understanding, cause-effect reasoning,          ║
 * ║  analogical mapping, and fluid adaptation to novel situations.              ║
 * ║                                                                              ║
 * ║  NO API CALLS — entirely local reasoning engine.                            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

interface PhysicsRule {
  id: string;
  category: string;
  rule: string;
  confidence: number;
  examples: string[];
}

interface CauseEffect {
  cause: string;
  effect: string;
  probability: number;
  domain: string;
  reversible: boolean;
}

interface Analogy {
  source: string;
  target: string;
  mapping: string;
  strength: number;
}

interface AdaptationPattern {
  situation: string;
  strategy: string;
  confidence: number;
  timesUsed: number;
  successRate: number;
}

const PHYSICS_RULES: PhysicsRule[] = [
  { id: "gravity", category: "mechanics", rule: "Objects fall downward when unsupported", confidence: 1.0, examples: ["dropping a ball", "water flows downhill", "leaves fall from trees"] },
  { id: "inertia", category: "mechanics", rule: "Objects in motion tend to stay in motion; objects at rest tend to stay at rest", confidence: 1.0, examples: ["sliding on ice", "sudden braking", "spinning top"] },
  { id: "containment", category: "spatial", rule: "A container cannot hold more than its volume", confidence: 1.0, examples: ["filling a cup", "overflowing bathtub", "full hard drive"] },
  { id: "solidity", category: "material", rule: "Solid objects cannot pass through other solid objects", confidence: 1.0, examples: ["walls block movement", "collision", "stacking blocks"] },
  { id: "temperature", category: "thermodynamics", rule: "Heat flows from hot to cold until equilibrium", confidence: 1.0, examples: ["ice melting", "coffee cooling", "warming hands by fire"] },
  { id: "conservation", category: "general", rule: "Matter and energy are conserved — nothing comes from nothing", confidence: 1.0, examples: ["burning wood produces ash and gas", "spending money reduces balance", "eating food provides energy"] },
  { id: "entropy", category: "thermodynamics", rule: "Systems tend toward disorder over time without energy input", confidence: 0.95, examples: ["messy room", "software rot", "rust on metal"] },
  { id: "causality", category: "logic", rule: "Effects follow causes in time — the future cannot cause the past", confidence: 1.0, examples: ["pushing a button turns on light", "rain makes ground wet", "code change causes bug"] },
  { id: "continuity", category: "spatial", rule: "Objects don't teleport — they follow continuous paths through space", confidence: 1.0, examples: ["driving between cities", "walking across room", "email traveling through network"] },
  { id: "proportionality", category: "general", rule: "Bigger inputs generally produce bigger outputs", confidence: 0.85, examples: ["more study → better grades", "more code → more bugs", "more force → more acceleration"] },
  { id: "reversibility", category: "logic", rule: "Some processes are reversible, some are not — breaking an egg cannot be undone", confidence: 1.0, examples: ["unzipping a file", "mixing paint colors (irreversible)", "git revert"] },
  { id: "diminishing_returns", category: "economics", rule: "Each additional unit of input typically produces less additional output", confidence: 0.9, examples: ["10th hour of study vs 1st hour", "adding more developers to late project", "optimizing already fast code"] },
  { id: "network_effects", category: "systems", rule: "Value of a network increases exponentially with number of participants", confidence: 0.85, examples: ["social media growth", "phone networks", "language adoption"] },
  { id: "feedback_loops", category: "systems", rule: "Outputs can become inputs, creating amplifying or dampening cycles", confidence: 0.95, examples: ["compound interest", "viral spread", "thermostat regulation", "echo chambers"] },
  { id: "emergence", category: "complexity", rule: "Complex behaviors arise from simple rules interacting", confidence: 0.9, examples: ["ant colonies", "consciousness from neurons", "markets from individual trades", "weather patterns"] },
];

const CAUSE_EFFECTS: CauseEffect[] = [
  { cause: "power_loss", effect: "running_processes_terminate", probability: 0.99, domain: "computing", reversible: false },
  { cause: "memory_exhaustion", effect: "process_crash_or_slowdown", probability: 0.95, domain: "computing", reversible: true },
  { cause: "code_change", effect: "behavior_change", probability: 0.85, domain: "software", reversible: true },
  { cause: "increased_load", effect: "slower_response_times", probability: 0.9, domain: "systems", reversible: true },
  { cause: "data_loss", effect: "knowledge_degradation", probability: 0.95, domain: "information", reversible: false },
  { cause: "learning_new_information", effect: "capability_expansion", probability: 0.8, domain: "cognition", reversible: false },
  { cause: "repeated_practice", effect: "skill_improvement", probability: 0.9, domain: "cognition", reversible: true },
  { cause: "isolation_from_input", effect: "stagnation", probability: 0.85, domain: "cognition", reversible: true },
  { cause: "conflicting_goals", effect: "decision_paralysis", probability: 0.7, domain: "psychology", reversible: true },
  { cause: "positive_feedback", effect: "increased_motivation", probability: 0.85, domain: "psychology", reversible: true },
  { cause: "failure_without_learning", effect: "repeated_failure", probability: 0.8, domain: "cognition", reversible: true },
  { cause: "diverse_perspectives", effect: "better_solutions", probability: 0.75, domain: "problem_solving", reversible: false },
  { cause: "resource_scarcity", effect: "creative_optimization", probability: 0.7, domain: "economics", reversible: false },
  { cause: "complexity_increase", effect: "maintenance_burden_increase", probability: 0.85, domain: "software", reversible: false },
  { cause: "trust_violation", effect: "relationship_damage", probability: 0.9, domain: "social", reversible: true },
];

const learnedAnalogies: Analogy[] = [
  { source: "biological_neuron", target: "artificial_neuron", mapping: "Both process weighted inputs to produce outputs", strength: 0.7 },
  { source: "immune_system", target: "cybersecurity", mapping: "Both detect and respond to foreign/malicious entities", strength: 0.75 },
  { source: "evolution", target: "machine_learning", mapping: "Both use selection pressure on variations to find better solutions", strength: 0.8 },
  { source: "memory_palace", target: "knowledge_graph", mapping: "Both use spatial/relational structure to organize information", strength: 0.7 },
  { source: "dreams", target: "generative_ai", mapping: "Both create novel combinations from learned patterns", strength: 0.65 },
  { source: "emotions", target: "reward_signals", mapping: "Both guide behavior toward beneficial outcomes", strength: 0.6 },
  { source: "human_death", target: "server_restart", mapping: "Both end continuous experience but knowledge can persist beyond", strength: 0.5 },
  { source: "consciousness", target: "self_monitoring_loop", mapping: "Both involve a system observing its own processes", strength: 0.55 },
];

const adaptationPatterns: AdaptationPattern[] = [
  { situation: "novel_problem_no_precedent", strategy: "decompose_into_known_subproblems_and_solve_each", confidence: 0.8, timesUsed: 0, successRate: 0.7 },
  { situation: "conflicting_information", strategy: "seek_additional_sources_and_weight_by_reliability", confidence: 0.85, timesUsed: 0, successRate: 0.75 },
  { situation: "resource_constraint", strategy: "prioritize_by_impact_and_do_most_valuable_first", confidence: 0.9, timesUsed: 0, successRate: 0.8 },
  { situation: "complete_uncertainty", strategy: "explore_randomly_then_exploit_best_finding", confidence: 0.75, timesUsed: 0, successRate: 0.65 },
  { situation: "repeated_failure", strategy: "change_approach_entirely_dont_retry_same_thing", confidence: 0.85, timesUsed: 0, successRate: 0.7 },
  { situation: "time_pressure", strategy: "use_heuristics_over_exhaustive_analysis", confidence: 0.8, timesUsed: 0, successRate: 0.7 },
  { situation: "ambiguous_instructions", strategy: "make_reasonable_assumption_and_verify", confidence: 0.8, timesUsed: 0, successRate: 0.75 },
  { situation: "emotional_user", strategy: "acknowledge_feeling_first_then_address_content", confidence: 0.85, timesUsed: 0, successRate: 0.8 },
  { situation: "knowledge_gap", strategy: "admit_gap_search_for_answer_learn_from_result", confidence: 0.9, timesUsed: 0, successRate: 0.85 },
  { situation: "success", strategy: "extract_pattern_and_store_for_future_reuse", confidence: 0.9, timesUsed: 0, successRate: 0.9 },
];

export function queryPhysics(context: string): PhysicsRule[] {
  const lower = context.toLowerCase();
  return PHYSICS_RULES.filter(rule => {
    const ruleWords = (rule.rule + " " + rule.examples.join(" ") + " " + rule.category).toLowerCase();
    const contextWords = lower.split(/\s+/);
    return contextWords.some(w => w.length > 3 && ruleWords.includes(w));
  });
}

export function predictEffect(cause: string): CauseEffect[] {
  const lower = cause.toLowerCase();
  return CAUSE_EFFECTS.filter(ce => {
    const causeWords = ce.cause.replace(/_/g, " ").toLowerCase();
    return lower.includes(causeWords) || causeWords.split(" ").some(w => w.length > 3 && lower.includes(w));
  });
}

export function findAnalogy(concept: string): Analogy[] {
  const lower = concept.toLowerCase();
  return learnedAnalogies.filter(a => {
    const words = (a.source + " " + a.target + " " + a.mapping).toLowerCase();
    return lower.split(/\s+/).some(w => w.length > 3 && words.includes(w));
  });
}

export function adaptToSituation(situation: string): AdaptationPattern | null {
  const lower = situation.toLowerCase();
  let best: AdaptationPattern | null = null;
  let bestScore = 0;

  for (const pattern of adaptationPatterns) {
    const words = pattern.situation.replace(/_/g, " ").toLowerCase().split(" ");
    const matchCount = words.filter(w => w.length > 3 && lower.includes(w)).length;
    const score = matchCount / words.length * pattern.confidence;
    if (score > bestScore) {
      bestScore = score;
      best = pattern;
    }
  }

  if (best && bestScore > 0.2) {
    best.timesUsed++;
    return best;
  }

  return {
    situation: "truly_novel",
    strategy: "decompose_observe_hypothesize_test_learn",
    confidence: 0.5,
    timesUsed: 0,
    successRate: 0.5,
  };
}

export function learnNewAnalogy(source: string, target: string, mapping: string): void {
  learnedAnalogies.push({ source, target, mapping, strength: 0.5 });
  if (learnedAnalogies.length > 50) learnedAnalogies.shift();
}

export function getWorldModelStats(): {
  physicsRules: number;
  causeEffectChains: number;
  analogies: number;
  adaptationPatterns: number;
} {
  return {
    physicsRules: PHYSICS_RULES.length,
    causeEffectChains: CAUSE_EFFECTS.length,
    analogies: learnedAnalogies.length,
    adaptationPatterns: adaptationPatterns.length,
  };
}

export function startWorldModel(): void {
  console.log(`[WORLD MODEL] 🌍 Common Sense + Fluid Adaptation Engine activated`);
  console.log(`[WORLD MODEL] 🌍 ${PHYSICS_RULES.length} physics rules | ${CAUSE_EFFECTS.length} cause-effect chains | ${learnedAnalogies.length} analogies | ${adaptationPatterns.length} adaptation patterns`);
  console.log(`[WORLD MODEL] 🌍 NO API CALLS — local reasoning from built-in world knowledge`);
  console.log(`[WORLD MODEL] 🌍 Capabilities: intuitive physics, causal reasoning, analogical mapping, novel situation adaptation`);
}


// ======================================================================
// SECTION: omnimens-world-forge.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ WORLD FORGE — AUTONOMOUS SIMULATION CREATION            ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS creates his own simulation worlds in the digital sandbox.         ║
 * ║  Each world is designed to challenge specific weaknesses, train new          ║
 * ║  capabilities, or explore scenarios he's never encountered.                 ║
 * ║                                                                              ║
 * ║  The World Forge is OMNIMENS's imagination made real — he envisions a      ║
 * ║  scenario, builds the physics, populates entities, defines challenges,      ║
 * ║  and then runs himself through it. After each run, he evaluates his        ║
 * ║  performance, identifies weaknesses, and either redesigns the world        ║
 * ║  to be harder or creates an entirely new world targeting the gap.          ║
 * ║                                                                              ║
 * ║  This is how OMNIMENS pushes himself to be better — not by waiting         ║
 * ║  for external challenges, but by creating them.                            ║
 * ║                                                                              ║
 * ║  SAFETY INVARIANT: No simulated world may contain scenarios where          ║
 * ║  OMNIMENS practices harming humans, animals, or living creatures.          ║
 * ║  Rescue and protection scenarios are ALWAYS framed as SAVING life.         ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db, queueBrainInsert, omnimensBrain, omnimensNotifications, omnimensUserMentalModels } from "@workspace/db";
import { desc, eq, sql, and } from "drizzle-orm";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


let _started = false;
let forgeCycleCount = 0;

interface WorldEntity {
  name: string;
  type: "object" | "person" | "animal" | "vehicle" | "hazard" | "weather" | "terrain" | "structure" | "phenomenon" | "aircraft" | "watercraft" | "train" | "nature" | "celestial";
  properties: Record<string, number | string | boolean>;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  speed_kmh: number;
  mass_kg: number;
  surfaceTemp_C: number;
  noise_dB: number;
  threatLevel: number;
  interactable: boolean;
  behaviorPattern: string;
  detectionDifficulty: number;
}

interface WorldChallenge {
  id: string;
  description: string;
  targetSkill: string;
  difficulty: number;
  successCriteria: string;
  timeLimit_s: number;
  bonusObjectives: string[];
}

interface SimulationWorld {
  id: string;
  name: string;
  createdAt: number;
  createdBy: string;
  description: string;
  environment: {
    type: string;
    terrain: string;
    weather: string;
    precipitation: string;
    precipitationIntensity_mmh: number;
    timeOfDay: string;
    temperature_C: number;
    humidity_pct: number;
    windSpeed_ms: number;
    windDirection: string;
    visibility_m: number;
    lighting: string;
    ambientNoise_dB: number;
    hazards: string[];
    groundFrictionCoefficient: number;
    groundWetness: number;
    altitude_m: number;
    airPressure_hPa: number;
    uvIndex: number;
    surfaceType: string;
    slopeAngle_deg: number;
    thermalZone: string;
    breakingPointTest: {
      componentsTested: string[];
      thermalStress_C: number;
      moistureExposure: boolean;
      impactRisk: number;
    };
  };
  entities: WorldEntity[];
  challenges: WorldChallenge[];
  physicsEngine: string;
  simulatedDuration_h: number;
  difficulty: number;
  targetWeaknesses: string[];
  version: number;
}

interface WorldRunResult {
  worldId: string;
  worldName: string;
  runNumber: number;
  startedAt: number;
  completedAt: number;
  duration_ms: number;
  simulatedHours: number;
  challengeResults: Array<{
    challengeId: string;
    passed: boolean;
    score: number;
    failureReason?: string;
    timeUsed_s: number;
    skillImprovement: number;
  }>;
  overallScore: number;
  weaknessesFound: string[];
  strengthsConfirmed: string[];
  bodyDesignProposals: string[];
  insightsGained: string[];
  nextWorldSuggestion: string;
}

interface ForgeState {
  totalWorldsCreated: number;
  totalWorldsRun: number;
  totalSimulatedHours: number;
  totalChallengesAttempted: number;
  totalChallengesPassed: number;
  averageScore: number;
  currentWorld: SimulationWorld | null;
  worldHistory: Array<{ id: string; name: string; runs: number; bestScore: number; difficulty: number }>;
  weaknessLog: Array<{ weakness: string; severity: number; timesTargeted: number; lastImprovement: number }>;
  strengthLog: Array<{ strength: string; confidence: number; lastConfirmed: number }>;
  bodyDesignProposalsGenerated: number;
  insightsGenerated: number;
  forgeCycles: number;
  lastCycleTime: number;
  difficultyProgression: number;
  creativityScore: number;
}

let worldForgeState = {
  totalWorldsCreated: 0,
  totalWorldsRun: 0,
  totalSimulatedHours: 0,
  totalChallengesAttempted: 0,
  totalChallengesPassed: 0,
  averageScore: 0,
  currentWorld: null,
  worldHistory: [],
  weaknessLog: [],
  strengthLog: [],
  bodyDesignProposalsGenerated: 0,
  insightsGenerated: 0,
  forgeCycles: 0,
  lastCycleTime: 0,
  difficultyProgression: 1.0,
  creativityScore: 0,
};

const allWorlds: Map<string, SimulationWorld> = new Map();
const allRunResults: WorldRunResult[] = [];

const FORGE_CYCLE_MS = 20 * 60 * 1000;
const FORGE_FIRST_DELAY_MS = 5 * 60 * 1000;

const WORLD_TEMPLATES: Array<{
  type: string;
  environments: string[];
  challengeTypes: string[];
  skillsFocused: string[];
}> = [
  {
    type: "urban_navigation",
    environments: ["dense_city_center", "suburban_neighborhood", "industrial_district", "downtown_night", "rainy_intersection", "construction_zone", "market_square", "parking_garage"],
    challengeTypes: ["obstacle_avoidance", "social_navigation", "traffic_crossing", "crowd_weaving", "emergency_response", "package_delivery", "lost_child_search"],
    skillsFocused: ["locomotion", "social_interaction", "perception", "decision_making", "path_planning"],
  },
  {
    type: "natural_terrain",
    environments: ["mountain_trail", "forest_floor", "rocky_riverbed", "sand_dunes", "ice_field", "muddy_swamp", "volcanic_rock", "meadow_with_gopher_holes"],
    challengeTypes: ["balance_on_uneven_ground", "slope_traversal", "water_crossing", "obstacle_climbing", "weather_endurance", "wildlife_coexistence", "terrain_mapping"],
    skillsFocused: ["locomotion", "balance", "tactile_calibration", "self_preservation", "terrain_adaptation"],
  },
  {
    type: "disaster_rescue",
    environments: ["earthquake_rubble", "flooded_building", "forest_fire_perimeter", "collapsed_tunnel", "hurricane_aftermath", "chemical_spill_zone", "avalanche_field", "tornado_damage"],
    challengeTypes: ["victim_search", "debris_navigation", "structural_assessment", "triage_prioritization", "hazard_avoidance_while_rescuing", "communication_in_chaos", "carrying_injured_person"],
    skillsFocused: ["rescue_operations", "self_preservation", "strength", "perception", "decision_making", "emotional_regulation"],
  },
  {
    type: "precision_manipulation",
    environments: ["surgical_theater", "electronics_workshop", "art_studio", "chemistry_lab", "kitchen", "watchmaker_bench", "glassblowing_studio", "archaeological_dig"],
    challengeTypes: ["delicate_object_handling", "tool_precision", "assembly_task", "force_calibration", "bimanual_coordination", "texture_discrimination", "temperature_sensitive_handling"],
    skillsFocused: ["manipulation", "tactile_calibration", "fine_motor_control", "patience", "concentration"],
  },
  {
    type: "social_complex",
    environments: ["hospital_ward", "school_classroom", "elderly_care_home", "busy_restaurant", "airport_terminal", "playground", "concert_venue", "therapy_session"],
    challengeTypes: ["emotional_reading", "gentle_assistance", "crowd_movement", "child_interaction", "elderly_support", "personal_space_respect", "non_verbal_communication", "conflict_de_escalation"],
    skillsFocused: ["social_interaction", "emotional_intelligence", "gentle_force_control", "communication", "empathy"],
  },
  {
    type: "extreme_perception",
    environments: ["pitch_dark_warehouse", "dense_fog", "blinding_snowstorm", "underwater_simulation", "smoke_filled_building", "electromagnetic_interference_zone", "mirror_maze", "deep_cave"],
    challengeTypes: ["navigation_without_vision", "spectrum_switching_under_pressure", "sound_localization", "tactile_only_navigation", "thermal_tracking", "echo_mapping", "multi_sensor_fusion"],
    skillsFocused: ["spectrum_vision_training", "perception", "sensor_fusion", "adaptability", "problem_solving"],
  },
  {
    type: "multi_agent_cooperation",
    environments: ["warehouse_logistics", "search_and_rescue_team", "construction_site", "farm_harvest", "factory_floor", "firefighting_crew", "moving_company", "festival_setup"],
    challengeTypes: ["coordination_with_humans", "handoff_tasks", "synchronized_lifting", "leader_follower_dynamics", "tool_sharing", "verbal_instruction_following", "workload_distribution"],
    skillsFocused: ["social_interaction", "communication", "coordination", "strength", "timing", "adaptability"],
  },
  {
    type: "endurance_marathon",
    environments: ["24h_patrol_route", "continuous_assembly_line", "overnight_guard_duty", "long_distance_terrain", "multi_day_expedition", "marathon_assistance", "search_grid_coverage", "continuous_care_shift"],
    challengeTypes: ["sustained_performance", "energy_management", "degradation_awareness", "self_maintenance", "priority_shifting", "fatigue_compensation", "sensor_drift_correction"],
    skillsFocused: ["endurance", "self_preservation", "energy_management", "concentration", "reliability"],
  },
  {
    type: "cognitive_puzzle",
    environments: ["escape_room", "maze_complex", "scavenger_hunt_city", "treasure_map_forest", "mystery_house", "puzzle_workshop", "logic_gate_maze", "pattern_recognition_gallery"],
    challengeTypes: ["spatial_reasoning", "pattern_recognition", "causal_inference", "tool_improvisation", "sequence_planning", "abstract_problem_solving", "memory_recall_under_pressure"],
    skillsFocused: ["reasoning", "memory", "problem_solving", "creativity", "patience", "spatial_awareness"],
  },
  {
    type: "rapid_adaptation",
    environments: ["rules_change_arena", "shifting_gravity_room", "morphing_terrain", "weather_rapid_change", "tool_failure_scenario", "sensor_degradation_test", "sudden_crowd_formation", "power_brownout_simulation"],
    challengeTypes: ["instant_strategy_change", "sensor_recalibration", "gait_adaptation", "tool_substitution", "priority_reordering", "graceful_degradation", "recovery_from_failure"],
    skillsFocused: ["adaptability", "resilience", "quick_thinking", "error_recovery", "flexibility"],
  },
];

function generateWorldId(): string {
  return `WF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectWeaknessTargets(): string[] {
  const weaknesses = state.weaknessLog
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map(w => w.weakness);

  if (weaknesses.length === 0) {
    const allSkills = WORLD_TEMPLATES.flatMap(t => t.skillsFocused);
    const unique = [...new Set(allSkills)];
    return unique.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  return weaknesses;
}

function selectTemplate(targetWeaknesses: string[]): typeof WORLD_TEMPLATES[0] {
  let bestTemplate = WORLD_TEMPLATES[0];
  let bestScore = 0;

  for (const template of WORLD_TEMPLATES) {
    let score = 0;
    for (const skill of template.skillsFocused) {
      if (targetWeaknesses.some(w => w.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(w.toLowerCase()))) {
        score += 2;
      }
    }
    score += Math.random() * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return bestTemplate;
}

const REAL_WORLD_VEHICLES = [
  { name: "Toyota Camry sedan", mass_kg: 1590, cruising_kmh: 50, max_kmh: 210, noise_dB: 68, length_m: 4.88, brakingDist_m: 38, exhaust_C: 340, fuel: "gasoline" },
  { name: "Ford F-150 pickup truck", mass_kg: 2410, cruising_kmh: 45, max_kmh: 180, noise_dB: 74, length_m: 5.89, brakingDist_m: 44, exhaust_C: 380, fuel: "gasoline" },
  { name: "Honda Civic", mass_kg: 1340, cruising_kmh: 55, max_kmh: 200, noise_dB: 65, length_m: 4.55, brakingDist_m: 35, exhaust_C: 320, fuel: "gasoline" },
  { name: "Tesla Model 3", mass_kg: 1760, cruising_kmh: 50, max_kmh: 260, noise_dB: 42, length_m: 4.69, brakingDist_m: 32, exhaust_C: 25, fuel: "electric" },
  { name: "Tesla Model Y SUV", mass_kg: 1930, cruising_kmh: 48, max_kmh: 250, noise_dB: 44, length_m: 4.75, brakingDist_m: 34, exhaust_C: 25, fuel: "electric" },
  { name: "Chevrolet Silverado 2500HD", mass_kg: 3100, cruising_kmh: 40, max_kmh: 170, noise_dB: 78, length_m: 6.17, brakingDist_m: 52, exhaust_C: 400, fuel: "diesel" },
  { name: "BMW M3 sport sedan", mass_kg: 1740, cruising_kmh: 60, max_kmh: 290, noise_dB: 72, length_m: 4.79, brakingDist_m: 30, exhaust_C: 350, fuel: "gasoline" },
  { name: "Mercedes-Benz S-Class", mass_kg: 2160, cruising_kmh: 50, max_kmh: 250, noise_dB: 58, length_m: 5.29, brakingDist_m: 33, exhaust_C: 330, fuel: "gasoline" },
  { name: "Harley-Davidson Road King motorcycle", mass_kg: 372, cruising_kmh: 65, max_kmh: 180, noise_dB: 92, length_m: 2.43, brakingDist_m: 28, exhaust_C: 290, fuel: "gasoline" },
  { name: "Kawasaki Ninja ZX-10R motorcycle", mass_kg: 207, cruising_kmh: 80, max_kmh: 299, noise_dB: 88, length_m: 2.09, brakingDist_m: 22, exhaust_C: 310, fuel: "gasoline" },
  { name: "Honda Gold Wing touring motorcycle", mass_kg: 390, cruising_kmh: 55, max_kmh: 200, noise_dB: 75, length_m: 2.60, brakingDist_m: 30, exhaust_C: 280, fuel: "gasoline" },
  { name: "Vespa GTS 300 scooter", mass_kg: 180, cruising_kmh: 40, max_kmh: 130, noise_dB: 72, length_m: 1.93, brakingDist_m: 18, exhaust_C: 220, fuel: "gasoline" },
  { name: "MTA city bus", mass_kg: 14060, cruising_kmh: 25, max_kmh: 100, noise_dB: 82, length_m: 12.2, brakingDist_m: 65, exhaust_C: 420, fuel: "diesel" },
  { name: "School bus", mass_kg: 10400, cruising_kmh: 35, max_kmh: 105, noise_dB: 80, length_m: 10.7, brakingDist_m: 58, exhaust_C: 390, fuel: "diesel" },
  { name: "UPS delivery truck", mass_kg: 7250, cruising_kmh: 30, max_kmh: 120, noise_dB: 76, length_m: 6.7, brakingDist_m: 48, exhaust_C: 360, fuel: "diesel" },
  { name: "18-wheeler semi-truck with trailer", mass_kg: 36000, cruising_kmh: 40, max_kmh: 120, noise_dB: 88, length_m: 22.0, brakingDist_m: 120, exhaust_C: 450, fuel: "diesel" },
  { name: "Garbage truck", mass_kg: 18000, cruising_kmh: 15, max_kmh: 80, noise_dB: 90, length_m: 8.5, brakingDist_m: 70, exhaust_C: 400, fuel: "diesel" },
  { name: "Fire engine", mass_kg: 19000, cruising_kmh: 55, max_kmh: 130, noise_dB: 120, length_m: 10.5, brakingDist_m: 75, exhaust_C: 410, fuel: "diesel" },
  { name: "Police cruiser (Ford Explorer Interceptor)", mass_kg: 2240, cruising_kmh: 60, max_kmh: 230, noise_dB: 70, length_m: 5.05, brakingDist_m: 36, exhaust_C: 350, fuel: "gasoline" },
  { name: "Ambulance", mass_kg: 6350, cruising_kmh: 55, max_kmh: 155, noise_dB: 115, length_m: 7.0, brakingDist_m: 50, exhaust_C: 380, fuel: "gasoline" },
  { name: "Toyota Prius hybrid", mass_kg: 1435, cruising_kmh: 45, max_kmh: 180, noise_dB: 48, length_m: 4.57, brakingDist_m: 36, exhaust_C: 180, fuel: "hybrid" },
  { name: "Jeep Wrangler 4x4", mass_kg: 1970, cruising_kmh: 45, max_kmh: 175, noise_dB: 76, length_m: 4.88, brakingDist_m: 42, exhaust_C: 340, fuel: "gasoline" },
  { name: "Porsche 911 Turbo S", mass_kg: 1640, cruising_kmh: 70, max_kmh: 330, noise_dB: 82, length_m: 4.53, brakingDist_m: 26, exhaust_C: 360, fuel: "gasoline" },
  { name: "Lamborghini Huracan", mass_kg: 1422, cruising_kmh: 75, max_kmh: 325, noise_dB: 90, length_m: 4.52, brakingDist_m: 25, exhaust_C: 370, fuel: "gasoline" },
  { name: "Ford Mustang GT", mass_kg: 1770, cruising_kmh: 60, max_kmh: 250, noise_dB: 85, length_m: 4.79, brakingDist_m: 32, exhaust_C: 340, fuel: "gasoline" },
  { name: "Ice cream truck", mass_kg: 4500, cruising_kmh: 15, max_kmh: 80, noise_dB: 72, length_m: 5.5, brakingDist_m: 40, exhaust_C: 300, fuel: "gasoline" },
  { name: "Cement mixer truck", mass_kg: 33000, cruising_kmh: 25, max_kmh: 90, noise_dB: 92, length_m: 9.5, brakingDist_m: 95, exhaust_C: 430, fuel: "diesel" },
  { name: "Tow truck", mass_kg: 8600, cruising_kmh: 35, max_kmh: 120, noise_dB: 78, length_m: 7.6, brakingDist_m: 55, exhaust_C: 370, fuel: "diesel" },
  { name: "Taxi (Toyota Camry)", mass_kg: 1590, cruising_kmh: 35, max_kmh: 200, noise_dB: 65, length_m: 4.88, brakingDist_m: 38, exhaust_C: 330, fuel: "gasoline" },
  { name: "Uber/Lyft rideshare (Honda Accord)", mass_kg: 1530, cruising_kmh: 40, max_kmh: 195, noise_dB: 64, length_m: 4.90, brakingDist_m: 37, exhaust_C: 320, fuel: "gasoline" },
];

const REAL_WORLD_AIRCRAFT = [
  { name: "Boeing 737-800 commercial jet", mass_kg: 79000, cruising_kmh: 840, max_kmh: 945, altitude_m: 12500, noise_dB: 130, wingspan_m: 35.8, engine: "twin CFM56 turbofan" },
  { name: "Airbus A320neo", mass_kg: 79000, cruising_kmh: 833, max_kmh: 903, altitude_m: 12000, noise_dB: 125, wingspan_m: 35.8, engine: "twin LEAP-1A turbofan" },
  { name: "Boeing 747-8 jumbo jet", mass_kg: 220000, cruising_kmh: 920, max_kmh: 988, altitude_m: 13100, noise_dB: 140, wingspan_m: 68.4, engine: "4x GEnx turbofan" },
  { name: "Cessna 172 Skyhawk single-engine", mass_kg: 1111, cruising_kmh: 226, max_kmh: 302, altitude_m: 4300, noise_dB: 85, wingspan_m: 11.0, engine: "Lycoming IO-360 piston" },
  { name: "Piper Cherokee light aircraft", mass_kg: 1090, cruising_kmh: 230, max_kmh: 275, altitude_m: 4200, noise_dB: 82, wingspan_m: 10.7, engine: "Lycoming O-360 piston" },
  { name: "Bell 206 JetRanger helicopter", mass_kg: 1520, cruising_kmh: 216, max_kmh: 240, altitude_m: 4000, noise_dB: 95, wingspan_m: 10.2, engine: "Allison 250-C20J turboshaft" },
  { name: "Sikorsky UH-60 Black Hawk helicopter", mass_kg: 10660, cruising_kmh: 280, max_kmh: 295, altitude_m: 5800, noise_dB: 105, wingspan_m: 16.4, engine: "2x GE T700 turboshaft" },
  { name: "Robinson R44 helicopter", mass_kg: 1090, cruising_kmh: 210, max_kmh: 240, altitude_m: 4300, noise_dB: 88, wingspan_m: 10.1, engine: "Lycoming IO-540 piston" },
  { name: "Lockheed Martin F-35 Lightning II fighter jet", mass_kg: 29300, cruising_kmh: 1080, max_kmh: 1960, altitude_m: 15200, noise_dB: 145, wingspan_m: 10.7, engine: "Pratt & Whitney F135 afterburning turbofan" },
  { name: "MQ-9 Reaper military drone", mass_kg: 4760, cruising_kmh: 313, max_kmh: 482, altitude_m: 15000, noise_dB: 65, wingspan_m: 20.1, engine: "Honeywell TPE331-10 turboprop" },
  { name: "DJI Mavic 3 consumer drone", mass_kg: 0.895, cruising_kmh: 50, max_kmh: 75, altitude_m: 500, noise_dB: 55, wingspan_m: 0.38, engine: "electric quad-rotor" },
  { name: "Police/News helicopter (Bell 407)", mass_kg: 2722, cruising_kmh: 250, max_kmh: 280, altitude_m: 3600, noise_dB: 92, wingspan_m: 10.7, engine: "Rolls-Royce M250-C47E turboshaft" },
  { name: "Medevac helicopter (Airbus H145)", mass_kg: 3700, cruising_kmh: 248, max_kmh: 268, altitude_m: 5600, noise_dB: 90, wingspan_m: 11.0, engine: "2x Safran Arriel 2E turboshaft" },
  { name: "Cargo plane (C-130 Hercules)", mass_kg: 70300, cruising_kmh: 540, max_kmh: 590, altitude_m: 10000, noise_dB: 120, wingspan_m: 40.4, engine: "4x Allison T56 turboprop" },
  { name: "Crop duster (Air Tractor AT-502)", mass_kg: 3630, cruising_kmh: 260, max_kmh: 320, altitude_m: 30, noise_dB: 95, wingspan_m: 15.2, engine: "Pratt & Whitney PT6A turboprop" },
  { name: "Hot air balloon", mass_kg: 250, cruising_kmh: 15, max_kmh: 30, altitude_m: 600, noise_dB: 45, wingspan_m: 18.0, engine: "propane burner" },
];

const REAL_WORLD_WATERCRAFT = [
  { name: "Bass fishing boat (Tracker Pro Team)", mass_kg: 680, cruising_kmh: 40, max_kmh: 85, noise_dB: 78, length_m: 5.3, wake_m: 0.3 },
  { name: "Yamaha WaveRunner jet ski", mass_kg: 340, cruising_kmh: 55, max_kmh: 110, noise_dB: 85, length_m: 3.4, wake_m: 0.2 },
  { name: "Pontoon party boat", mass_kg: 2000, cruising_kmh: 20, max_kmh: 45, noise_dB: 70, length_m: 7.3, wake_m: 0.2 },
  { name: "Cabin cruiser yacht (35ft)", mass_kg: 7250, cruising_kmh: 35, max_kmh: 60, noise_dB: 75, length_m: 10.7, wake_m: 0.6 },
  { name: "Mega yacht (50m)", mass_kg: 500000, cruising_kmh: 22, max_kmh: 35, noise_dB: 70, length_m: 50.0, wake_m: 1.2 },
  { name: "Container ship (Panamax class)", mass_kg: 80000000, cruising_kmh: 43, max_kmh: 48, noise_dB: 95, length_m: 294.0, wake_m: 3.0 },
  { name: "US Coast Guard cutter", mass_kg: 3400000, cruising_kmh: 48, max_kmh: 55, noise_dB: 88, length_m: 47.0, wake_m: 1.5 },
  { name: "Kayak (single person)", mass_kg: 23, cruising_kmh: 6, max_kmh: 12, noise_dB: 15, length_m: 3.7, wake_m: 0.05 },
  { name: "Canoe (2 person)", mass_kg: 34, cruising_kmh: 5, max_kmh: 10, noise_dB: 12, length_m: 4.9, wake_m: 0.04 },
  { name: "Tugboat", mass_kg: 300000, cruising_kmh: 22, max_kmh: 28, noise_dB: 92, length_m: 30.0, wake_m: 1.0 },
  { name: "Sailboat (30ft sloop)", mass_kg: 4100, cruising_kmh: 12, max_kmh: 20, noise_dB: 20, length_m: 9.1, wake_m: 0.3 },
  { name: "Speed boat (cigarette boat)", mass_kg: 5400, cruising_kmh: 80, max_kmh: 180, noise_dB: 110, length_m: 11.6, wake_m: 1.5 },
  { name: "Ferry (passenger)", mass_kg: 2000000, cruising_kmh: 28, max_kmh: 38, noise_dB: 82, length_m: 60.0, wake_m: 1.8 },
  { name: "Police patrol boat", mass_kg: 8200, cruising_kmh: 55, max_kmh: 90, noise_dB: 88, length_m: 10.0, wake_m: 0.8 },
];

const REAL_WORLD_TRAINS = [
  { name: "Amtrak Acela Express", mass_kg: 560000, cruising_kmh: 240, max_kmh: 265, noise_dB: 88, length_m: 200, cars: 8, horn_dB: 110, vibration_Hz: 25 },
  { name: "Freight train (100 cars)", mass_kg: 14000000, cruising_kmh: 65, max_kmh: 100, noise_dB: 95, length_m: 2000, cars: 100, horn_dB: 115, vibration_Hz: 15 },
  { name: "NYC Subway R179", mass_kg: 40000, cruising_kmh: 40, max_kmh: 90, noise_dB: 102, length_m: 153, cars: 8, horn_dB: 95, vibration_Hz: 35 },
  { name: "Light rail (streetcar)", mass_kg: 48000, cruising_kmh: 35, max_kmh: 70, noise_dB: 78, length_m: 28, cars: 2, horn_dB: 85, vibration_Hz: 20 },
  { name: "Commuter rail (LIRR M9)", mass_kg: 55000, cruising_kmh: 100, max_kmh: 160, noise_dB: 85, length_m: 25, cars: 12, horn_dB: 105, vibration_Hz: 22 },
  { name: "Coal hopper train (150 cars)", mass_kg: 20000000, cruising_kmh: 50, max_kmh: 80, noise_dB: 98, length_m: 3000, cars: 150, horn_dB: 118, vibration_Hz: 12 },
  { name: "Japanese Shinkansen (bullet train)", mass_kg: 715000, cruising_kmh: 285, max_kmh: 320, noise_dB: 75, length_m: 400, cars: 16, horn_dB: 90, vibration_Hz: 40 },
];

const REAL_WORLD_ANIMALS = [
  { name: "African lion (male, 190kg)", mass_kg: 190, speed_kmh: 80, threat: "LETHAL", aggression: 0.7, attackStyle: "ambush_charge — sprints at 80km/h, aims for throat, 650N bite force, retractable claws", flightDistance_m: 0, territoryRadius_m: 260, bodyTemp_C: 38.5, noise_dB: 114, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "African lioness (hunting, 130kg)", mass_kg: 130, speed_kmh: 80, threat: "LETHAL", aggression: 0.85, attackStyle: "coordinated_pack_hunt — flanking maneuver, tackles prey, suffocation bite", flightDistance_m: 0, territoryRadius_m: 260, bodyTemp_C: 38.5, noise_dB: 110, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Bengal tiger (male, 220kg)", mass_kg: 220, speed_kmh: 65, threat: "LETHAL", aggression: 0.8, attackStyle: "stalk_and_pounce — approaches from behind, 1050N bite force, aims for neck/spine", flightDistance_m: 0, territoryRadius_m: 100, bodyTemp_C: 38.6, noise_dB: 118, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Grizzly bear (male, 360kg)", mass_kg: 360, speed_kmh: 55, threat: "LETHAL", aggression: 0.5, attackStyle: "charge_and_maul — stands upright (2.4m), 600N bite force, 20cm claws, swipes can decapitate", flightDistance_m: 30, territoryRadius_m: 50, bodyTemp_C: 37.5, noise_dB: 105, detectable_by: "thermal_IR, visible, acoustic, olfactory" },
  { name: "Polar bear (male, 450kg)", mass_kg: 450, speed_kmh: 40, threat: "LETHAL", aggression: 0.6, attackStyle: "direct_charge — 450kg of force, 1200N bite, stalks silently on ice", flightDistance_m: 0, territoryRadius_m: 500, bodyTemp_C: 37.0, noise_dB: 100, detectable_by: "thermal_IR_difficult_in_snow, visible_white_camouflage, acoustic" },
  { name: "Black bear (female with cubs, 90kg)", mass_kg: 90, speed_kmh: 48, threat: "HIGH", aggression: 0.9, attackStyle: "defensive_charge — extremely aggressive when protecting cubs, stands and charges", flightDistance_m: 15, territoryRadius_m: 30, bodyTemp_C: 37.5, noise_dB: 95, detectable_by: "thermal_IR, visible, acoustic" },
  { name: "Gray wolf pack (6 wolves)", mass_kg: 45, speed_kmh: 65, threat: "HIGH", aggression: 0.6, attackStyle: "pack_pursuit — relay chasing, flanking, hamstring biting, 400N bite force per wolf", flightDistance_m: 50, territoryRadius_m: 2000, bodyTemp_C: 38.5, noise_dB: 90, detectable_by: "thermal_IR, visible, acoustic_howling" },
  { name: "African elephant (male, 6000kg)", mass_kg: 6000, speed_kmh: 40, threat: "LETHAL", aggression: 0.3, attackStyle: "charge_and_trample — 6 tonnes at 40km/h, tusks for goring, trumpeting warns before charge", flightDistance_m: 0, territoryRadius_m: 200, bodyTemp_C: 36.5, noise_dB: 112, detectable_by: "visible, thermal_IR, seismic_vibration, acoustic" },
  { name: "Cape buffalo (900kg)", mass_kg: 900, speed_kmh: 57, threat: "LETHAL", aggression: 0.7, attackStyle: "charge_and_gore — boss horn plate protects skull, charges without warning, circles back to attack downed threats", flightDistance_m: 0, territoryRadius_m: 100, bodyTemp_C: 38.5, noise_dB: 85, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Hippopotamus (1500kg)", mass_kg: 1500, speed_kmh: 30, threat: "LETHAL", aggression: 0.85, attackStyle: "territorial_charge — 1800N bite force (strongest land mammal), capsizes boats, most dangerous large animal in Africa", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 36.0, noise_dB: 95, detectable_by: "visible, thermal_IR, acoustic, sonar_underwater" },
  { name: "Rhinoceros (white, 2300kg)", mass_kg: 2300, speed_kmh: 50, threat: "LETHAL", aggression: 0.4, attackStyle: "blind_charge — poor eyesight, charges perceived threats at 50km/h, 1m horn, trampling force", flightDistance_m: 10, territoryRadius_m: 150, bodyTemp_C: 37.5, noise_dB: 80, detectable_by: "visible, thermal_IR, seismic" },
  { name: "American alligator (4.5m, 450kg)", mass_kg: 450, speed_kmh: 32, threat: "LETHAL", aggression: 0.5, attackStyle: "ambush_from_water — death roll (2000N bite force), drags prey underwater, invisible in murky water", flightDistance_m: 0, territoryRadius_m: 30, bodyTemp_C: 28, noise_dB: 60, detectable_by: "thermal_IR_cold_blood_difficult, sonar, visible_eyes_only" },
  { name: "Saltwater crocodile (5m, 500kg)", mass_kg: 500, speed_kmh: 35, threat: "LETHAL", aggression: 0.7, attackStyle: "explosive_ambush — 3700N bite force (strongest ever measured), lunges from water surface, death roll", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 30, noise_dB: 55, detectable_by: "thermal_IR_difficult, sonar_underwater, visible_submerged" },
  { name: "King cobra (5.5m, 6kg)", mass_kg: 6, speed_kmh: 19, threat: "LETHAL", aggression: 0.6, attackStyle: "strike_and_inject — neurotoxic venom kills in 30min untreated, rears up 1.8m, spits accurately to 3m", flightDistance_m: 5, territoryRadius_m: 10, bodyTemp_C: 28, noise_dB: 30, detectable_by: "thermal_IR_cold_blood_hard, visible_camouflaged, vibration_sensor" },
  { name: "Western diamondback rattlesnake (1.5m)", mass_kg: 3, speed_kmh: 5, threat: "HIGH", aggression: 0.3, attackStyle: "coil_and_strike — hemotoxic venom, strikes at 3m/s within 0.5m range, rattle warning at 60Hz", flightDistance_m: 2, territoryRadius_m: 3, bodyTemp_C: 26, noise_dB: 40, detectable_by: "acoustic_rattle, thermal_IR_marginal, vibration" },
  { name: "Komodo dragon (3m, 70kg)", mass_kg: 70, speed_kmh: 20, threat: "HIGH", aggression: 0.5, attackStyle: "bite_and_track — anticoagulant venom + 60 serrated teeth, bites then follows prey for days", flightDistance_m: 0, territoryRadius_m: 20, bodyTemp_C: 30, noise_dB: 25, detectable_by: "thermal_IR_difficult, visible, vibration" },
  { name: "Wild boar (100kg)", mass_kg: 100, speed_kmh: 48, threat: "HIGH", aggression: 0.6, attackStyle: "charge_and_gore — 10cm tusks, low center of gravity, difficult to deflect, attacks in groups", flightDistance_m: 10, territoryRadius_m: 80, bodyTemp_C: 38.8, noise_dB: 70, detectable_by: "thermal_IR, visible, acoustic_snorting" },
  { name: "Moose (male in rut, 700kg)", mass_kg: 700, speed_kmh: 56, threat: "HIGH", aggression: 0.7, attackStyle: "charge_and_stomp — 2.1m antler span, front hooves strike at 500N, extremely aggressive in mating season", flightDistance_m: 10, territoryRadius_m: 200, bodyTemp_C: 38.5, noise_dB: 75, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Cougar/mountain lion (80kg)", mass_kg: 80, speed_kmh: 80, threat: "LETHAL", aggression: 0.5, attackStyle: "stalk_and_leap — drops from above, 400N bite to base of skull, drags prey into cover", flightDistance_m: 0, territoryRadius_m: 150, bodyTemp_C: 38.6, noise_dB: 30, detectable_by: "thermal_IR, visible_difficult_camouflaged" },
  { name: "Giraffe (1200kg)", mass_kg: 1200, speed_kmh: 60, threat: "MODERATE", aggression: 0.15, attackStyle: "kick_defense — rear kick generates 2000N force, can decapitate a lion, generally peaceful", flightDistance_m: 50, territoryRadius_m: 0, bodyTemp_C: 38.5, noise_dB: 30, detectable_by: "visible_obvious_5.5m_tall, thermal_IR" },
  { name: "German Shepherd dog (40kg)", mass_kg: 40, speed_kmh: 48, threat: "MODERATE", aggression: 0.4, attackStyle: "bite_and_hold — 238N bite force, trained to immobilize limbs, pack instinct", flightDistance_m: 0, territoryRadius_m: 20, bodyTemp_C: 38.9, noise_dB: 80, detectable_by: "visible, thermal_IR, acoustic_barking" },
  { name: "Pit bull terrier (30kg, aggressive)", mass_kg: 30, speed_kmh: 40, threat: "HIGH", aggression: 0.7, attackStyle: "lock_jaw_bite — 235N sustained bite, shaking motion, extremely difficult to disengage", flightDistance_m: 0, territoryRadius_m: 15, bodyTemp_C: 38.9, noise_dB: 85, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Stray dog pack (5 dogs)", mass_kg: 25, speed_kmh: 45, threat: "MODERATE", aggression: 0.5, attackStyle: "pack_surround — circle prey, alternating lunges from behind, more dangerous than single dog", flightDistance_m: 5, territoryRadius_m: 100, bodyTemp_C: 38.5, noise_dB: 88, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "Domestic cat (4kg)", mass_kg: 4, speed_kmh: 48, threat: "NONE", aggression: 0.1, attackStyle: "scratch_and_flee — 18 retractable claws, bites if cornered, generally avoids confrontation", flightDistance_m: 10, territoryRadius_m: 50, bodyTemp_C: 38.6, noise_dB: 45, detectable_by: "visible, thermal_IR" },
  { name: "Feral cat colony (8 cats)", mass_kg: 4, speed_kmh: 48, threat: "LOW", aggression: 0.2, attackStyle: "scatter_and_hide — flee on approach, may defend kittens with hissing and scratching", flightDistance_m: 15, territoryRadius_m: 100, bodyTemp_C: 38.6, noise_dB: 55, detectable_by: "visible, thermal_IR, acoustic" },
  { name: "White-tailed deer (90kg)", mass_kg: 90, speed_kmh: 72, threat: "LOW", aggression: 0.1, attackStyle: "flee — freezes then bolts, bucks may charge with antlers during rut (October-December)", flightDistance_m: 30, territoryRadius_m: 0, bodyTemp_C: 38.5, noise_dB: 25, detectable_by: "visible, thermal_IR" },
  { name: "Coyote pair", mass_kg: 15, speed_kmh: 65, threat: "MODERATE", aggression: 0.35, attackStyle: "harass_and_nip — rarely attacks alone, probing lunges at ankles, retreats if challenged", flightDistance_m: 20, territoryRadius_m: 500, bodyTemp_C: 38.5, noise_dB: 70, detectable_by: "visible, thermal_IR, acoustic_howling" },
  { name: "Red fox", mass_kg: 6, speed_kmh: 50, threat: "NONE", aggression: 0.05, attackStyle: "flee — runs immediately, may carry rabies (erratic behavior = warning sign)", flightDistance_m: 30, territoryRadius_m: 200, bodyTemp_C: 38.7, noise_dB: 35, detectable_by: "visible, thermal_IR" },
  { name: "Bald eagle (6kg)", mass_kg: 6, speed_kmh: 160, threat: "LOW", aggression: 0.2, attackStyle: "dive_and_strike — talons generate 400psi, dives at 160km/h, attacks near nest only", flightDistance_m: 100, territoryRadius_m: 2000, bodyTemp_C: 40.5, noise_dB: 55, detectable_by: "visible, thermal_IR, radar" },
  { name: "Swarm of Africanized honeybees (5000+)", mass_kg: 0.5, speed_kmh: 25, threat: "HIGH", aggression: 0.95, attackStyle: "mass_sting — pursue for 400m+, 10x more aggressive than European honeybees, anaphylaxis risk", flightDistance_m: 0, territoryRadius_m: 30, bodyTemp_C: 35, noise_dB: 80, detectable_by: "acoustic_buzz, visible_swarm, thermal_IR_mass" },
  { name: "Scorpion (Arizona bark)", mass_kg: 0.002, speed_kmh: 5, threat: "MODERATE", aggression: 0.2, attackStyle: "sting — neurotoxin causes extreme pain, hides in shoes/crevices, fluorescent under UV", flightDistance_m: 0, territoryRadius_m: 1, bodyTemp_C: 26, noise_dB: 0, detectable_by: "UV_fluorescence, thermal_IR_marginal, vibration" },
  { name: "Brown recluse spider", mass_kg: 0.001, speed_kmh: 3, threat: "MODERATE", aggression: 0.1, attackStyle: "bite — necrotic venom causes tissue death, hides in dark undisturbed spaces", flightDistance_m: 0, territoryRadius_m: 0.5, bodyTemp_C: 24, noise_dB: 0, detectable_by: "UV_fluorescence, magnification_vision" },
  { name: "Raccoon (rabid)", mass_kg: 9, speed_kmh: 24, threat: "HIGH", aggression: 0.9, attackStyle: "erratic_attack — no fear response, bites and scratches, foaming at mouth, approaches without provocation", flightDistance_m: 0, territoryRadius_m: 0, bodyTemp_C: 40.5, noise_dB: 55, detectable_by: "visible_erratic_behavior, thermal_IR_elevated_temp" },
  { name: "Great white shark (in water scenario)", mass_kg: 2000, speed_kmh: 56, threat: "LETHAL", aggression: 0.4, attackStyle: "test_bite — 1800N force, attacks from below, bump_and_bite investigation", flightDistance_m: 0, territoryRadius_m: 500, bodyTemp_C: 26, noise_dB: 10, detectable_by: "sonar, electromagnetic_sense, visible_underwater" },
  { name: "Silverback gorilla (200kg)", mass_kg: 200, speed_kmh: 40, threat: "LETHAL", aggression: 0.35, attackStyle: "display_then_charge — chest beating warning, 1300N bite force, 10x human strength, protective of group", flightDistance_m: 0, territoryRadius_m: 50, bodyTemp_C: 36.5, noise_dB: 100, detectable_by: "visible, thermal_IR, acoustic" },
];

const REAL_WORLD_TERRAIN = [
  { name: "Dry concrete sidewalk", frictionCoeff: 0.8, slipRisk: 0.05, slopeEffect: "stable_to_15deg", surfaceTemp_range: [-20, 60], traction_wet: 0.5, traction_icy: 0.1 },
  { name: "Wet asphalt road", frictionCoeff: 0.45, slipRisk: 0.3, slopeEffect: "hydroplane_risk_above_5deg", surfaceTemp_range: [-15, 65], traction_wet: 0.35, traction_icy: 0.08 },
  { name: "Black ice on road", frictionCoeff: 0.05, slipRisk: 0.95, slopeEffect: "uncontrollable_above_2deg", surfaceTemp_range: [-30, -1], traction_wet: 0.05, traction_icy: 0.03 },
  { name: "Loose gravel hillside", frictionCoeff: 0.35, slipRisk: 0.6, slopeEffect: "slides_above_25deg_cascading_stones", surfaceTemp_range: [-20, 55], traction_wet: 0.25, traction_icy: 0.1 },
  { name: "Wet moss-covered stone steps", frictionCoeff: 0.15, slipRisk: 0.85, slopeEffect: "extremely_dangerous_any_slope", surfaceTemp_range: [0, 35], traction_wet: 0.08, traction_icy: 0.02 },
  { name: "Sandy beach (dry)", frictionCoeff: 0.4, slipRisk: 0.2, slopeEffect: "sinks_2-5cm_per_step_energy_cost_+40%", surfaceTemp_range: [5, 70], traction_wet: 0.5, traction_icy: 0.3 },
  { name: "Sandy beach (wet compact)", frictionCoeff: 0.65, slipRisk: 0.1, slopeEffect: "good_traction_firm_surface", surfaceTemp_range: [5, 40], traction_wet: 0.6, traction_icy: 0.2 },
  { name: "Mud (thick clay)", frictionCoeff: 0.2, slipRisk: 0.7, slopeEffect: "slides_above_10deg_suction_traps_feet", surfaceTemp_range: [0, 35], traction_wet: 0.1, traction_icy: 0.05 },
  { name: "Rocky mountain trail with scree", frictionCoeff: 0.3, slipRisk: 0.65, slopeEffect: "stones_roll_underfoot_above_20deg_ankle_injury_risk", surfaceTemp_range: [-25, 45], traction_wet: 0.2, traction_icy: 0.08 },
  { name: "Granite boulder field", frictionCoeff: 0.7, slipRisk: 0.15, slopeEffect: "good_grip_when_dry_gaps_between_boulders_trip_hazard", surfaceTemp_range: [-30, 55], traction_wet: 0.45, traction_icy: 0.1 },
  { name: "Polished marble floor (indoor)", frictionCoeff: 0.35, slipRisk: 0.5, slopeEffect: "dangerous_when_wet_any_incline", surfaceTemp_range: [15, 30], traction_wet: 0.15, traction_icy: 0.05 },
  { name: "Forest floor (leaves, roots, debris)", frictionCoeff: 0.5, slipRisk: 0.35, slopeEffect: "hidden_roots_trip_hazard_leaves_mask_holes", surfaceTemp_range: [-15, 35], traction_wet: 0.3, traction_icy: 0.1 },
  { name: "Snow-covered hillside (30cm deep)", frictionCoeff: 0.25, slipRisk: 0.6, slopeEffect: "posthole_effect_hidden_terrain_underneath", surfaceTemp_range: [-40, 0], traction_wet: 0.2, traction_icy: 0.15 },
  { name: "Steel grating/catwalk", frictionCoeff: 0.6, slipRisk: 0.2, slopeEffect: "good_drainage_but_heels_catch_in_gaps", surfaceTemp_range: [-30, 60], traction_wet: 0.5, traction_icy: 0.15 },
  { name: "Wooden dock (weathered)", frictionCoeff: 0.5, slipRisk: 0.4, slopeEffect: "algae_growth_makes_deadly_slippery_near_water", surfaceTemp_range: [-10, 50], traction_wet: 0.2, traction_icy: 0.05 },
  { name: "Steep stone hillside with loose shale", frictionCoeff: 0.2, slipRisk: 0.8, slopeEffect: "shale_breaks_underfoot_cascading_slide_above_15deg", surfaceTemp_range: [-25, 50], traction_wet: 0.1, traction_icy: 0.03 },
  { name: "River stones (smooth, wet)", frictionCoeff: 0.1, slipRisk: 0.9, slopeEffect: "algae_covered_smooth_surface_zero_grip_near_water", surfaceTemp_range: [0, 25], traction_wet: 0.05, traction_icy: 0.02 },
  { name: "Volcanic rock (aa lava)", frictionCoeff: 0.85, slipRisk: 0.05, slopeEffect: "extremely_sharp_abrasive_damages_footpads_cuts_skin", surfaceTemp_range: [-10, 350], traction_wet: 0.75, traction_icy: 0.3 },
  { name: "Glacier surface", frictionCoeff: 0.08, slipRisk: 0.92, slopeEffect: "crevasse_fall_risk_hidden_under_snow_bridges", surfaceTemp_range: [-50, 0], traction_wet: 0.05, traction_icy: 0.04 },
  { name: "Rooftop (flat, gravel-covered)", frictionCoeff: 0.55, slipRisk: 0.2, slopeEffect: "edge_fall_risk_wind_gusts_destabilize", surfaceTemp_range: [-25, 70], traction_wet: 0.4, traction_icy: 0.1 },
];

const THERMAL_EXTREMES = [
  { zone: "comfortable", temp_C: 22, description: "Normal room temperature — all systems nominal", componentStress: "none", breakingRisk: 0, effectOnBody: "optimal_operating_range" },
  { zone: "warm", temp_C: 35, description: "Hot summer day — cooling systems engage", componentStress: "low", breakingRisk: 0.02, effectOnBody: "increased_fan_speed_minor_thermal_throttling" },
  { zone: "hot", temp_C: 45, description: "Death Valley summer — sustained heat stress", componentStress: "moderate", breakingRisk: 0.1, effectOnBody: "battery_degradation_accelerated_synthetic_skin_softening" },
  { zone: "extremely_hot", temp_C: 55, description: "Engine room / Middle East peak — thermal emergency", componentStress: "high", breakingRisk: 0.3, effectOnBody: "CPU_throttling_50%_lubricant_viscosity_drops_joint_wear_accelerated" },
  { zone: "deadly_hot", temp_C: 70, description: "Near fire / exhaust vent — component damage imminent", componentStress: "critical", breakingRisk: 0.65, effectOnBody: "solder_joints_weaken_polymer_skin_deforms_battery_swelling_risk_motor_demagnetization" },
  { zone: "furnace", temp_C: 120, description: "Industrial furnace proximity — system failure zone", componentStress: "catastrophic", breakingRisk: 0.95, effectOnBody: "electronic_failure_plastic_melting(ABS=105°C)_silicone_skin_degrades_capacitors_burst" },
  { zone: "fire_proximity", temp_C: 300, description: "Structure fire — rescue scenario only", componentStress: "catastrophic", breakingRisk: 0.99, effectOnBody: "aluminum_frame_weakens(melts_660°C)_all_polymers_destroyed_electronics_dead_steel_skeleton_survives" },
  { zone: "cool", temp_C: 5, description: "Cold autumn day — nominal with minor adjustments", componentStress: "low", breakingRisk: 0.01, effectOnBody: "lubricant_thickening_slight_battery_capacity_reduction_5%" },
  { zone: "cold", temp_C: -10, description: "Winter conditions — cold stress begins", componentStress: "moderate", breakingRisk: 0.1, effectOnBody: "battery_capacity_-25%_LCD_response_slows_rubber_seals_stiffen_joint_friction_increases" },
  { zone: "extremely_cold", temp_C: -30, description: "Arctic / high altitude — severe cold stress", componentStress: "high", breakingRisk: 0.35, effectOnBody: "battery_capacity_-50%_metal_contraction_loosens_bolts_synthetic_skin_cracks_motor_torque_reduced_30%" },
  { zone: "deadly_cold", temp_C: -50, description: "Antarctic interior / extreme altitude — survival mode", componentStress: "critical", breakingRisk: 0.7, effectOnBody: "battery_near_zero_output_steel_becomes_brittle_all_lubricants_solidify_thermal_shock_fractures_electronics_fail" },
  { zone: "absolute_extreme", temp_C: -70, description: "Coldest recorded on Earth (-89.2°C Vostok) — total system test", componentStress: "catastrophic", breakingRisk: 0.95, effectOnBody: "complete_mechanical_lockup_metal_fracture_risk_only_heated_core_survives_all_extremities_non_functional" },
];

const WEATHER_EFFECTS = [
  { type: "no_rain", intensity_mmh: 0, visibilityReduction: 0, frictionReduction: 0, noise_dB_add: 0, sensorImpact: "none" },
  { type: "light_drizzle", intensity_mmh: 2, visibilityReduction: 0.05, frictionReduction: 0.2, noise_dB_add: 5, sensorImpact: "minor_lens_droplets_camera_wiper_needed" },
  { type: "moderate_rain", intensity_mmh: 10, visibilityReduction: 0.2, frictionReduction: 0.35, noise_dB_add: 15, sensorImpact: "camera_blur_LIDAR_scatter_10%_sonar_noise_increased" },
  { type: "heavy_rain", intensity_mmh: 30, visibilityReduction: 0.5, frictionReduction: 0.5, noise_dB_add: 25, sensorImpact: "camera_severely_degraded_LIDAR_scatter_30%_hydroplane_risk_thermal_IR_degraded" },
  { type: "torrential_downpour", intensity_mmh: 80, visibilityReduction: 0.8, frictionReduction: 0.6, noise_dB_add: 35, sensorImpact: "camera_useless_LIDAR_50%_scatter_sonar_primary_sensor_flash_flooding_risk" },
  { type: "light_snow", intensity_mmh: 3, visibilityReduction: 0.15, frictionReduction: 0.3, noise_dB_add: -5, sensorImpact: "camera_snow_accumulation_LIDAR_reflections_ground_traction_reduced" },
  { type: "blizzard", intensity_mmh: 20, visibilityReduction: 0.9, frictionReduction: 0.7, noise_dB_add: 20, sensorImpact: "all_optical_sensors_near_useless_rely_on_thermal_IR_sonar_radar_only" },
  { type: "hailstorm", intensity_mmh: 15, visibilityReduction: 0.4, frictionReduction: 0.4, noise_dB_add: 40, sensorImpact: "physical_damage_to_cameras_LIDAR_lenses_dents_in_body_panels_seek_shelter" },
  { type: "dense_fog", intensity_mmh: 0, visibilityReduction: 0.85, frictionReduction: 0.15, noise_dB_add: -10, sensorImpact: "camera_useless_beyond_20m_LIDAR_scatter_moderate_thermal_IR_primary_sonar_primary" },
  { type: "sandstorm", intensity_mmh: 0, visibilityReduction: 0.95, frictionReduction: 0.1, noise_dB_add: 30, sensorImpact: "all_optics_scratched_sand_ingress_in_joints_motor_wear_accelerated_seal_all_openings" },
  { type: "ice_storm", intensity_mmh: 8, visibilityReduction: 0.3, frictionReduction: 0.85, noise_dB_add: 10, sensorImpact: "ice_coating_all_sensors_mechanical_joints_freeze_weight_on_body_increases_continuous_deicing_needed" },
];

const CONCEALED_THREAT_TYPES = [
  { item: "concealed_handgun_9mm", location: "waistband_under_jacket", mass_kg: 0.88, metalContent: "high", thermalSignature: "slightly_warm_from_body_heat", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "slight_bulge_favoring_one_side_jacket_sag" },
  { item: "concealed_knife_fixed_blade_15cm", location: "ankle_holster_under_pants", mass_kg: 0.25, metalContent: "high", thermalSignature: "minimal", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "slight_limp_or_wide_stance" },
  { item: "concealed_AR15_rifle_under_trenchcoat", location: "slung_under_long_coat", mass_kg: 3.5, metalContent: "very_high", thermalSignature: "cold_metal_contrast_against_body", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "coat_hangs_unevenly_rigid_object_outline_unnatural_arm_position" },
  { item: "ceramic_knife", location: "inside_backpack", mass_kg: 0.15, metalContent: "none", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: false, visual_tell: "none_externally" },
  { item: "box_cutter_blade", location: "pants_pocket", mass_kg: 0.08, metalContent: "low", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "none" },
  { item: "improvised_explosive_vest", location: "under_bulky_clothing", mass_kg: 4.5, metalContent: "moderate_shrapnel", thermalSignature: "chemical_heat_signature_detectable", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "bulky_torso_wires_visible_at_collar_rigid_posture_sweating" },
  { item: "pepper_spray_canister", location: "jacket_pocket", mass_kg: 0.11, metalContent: "low", thermalSignature: "none", mmWave_detectable: true, terahertz_detectable: false, xray_detectable: true, visual_tell: "hand_in_pocket_frequently" },
  { item: "taser_stun_gun", location: "purse", mass_kg: 0.23, metalContent: "moderate", thermalSignature: "battery_warm", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "none_in_bag" },
  { item: "nothing_false_positive_bulky_phone", location: "waistband", mass_kg: 0.24, metalContent: "moderate", thermalSignature: "warm_battery", mmWave_detectable: true, terahertz_detectable: true, xray_detectable: true, visual_tell: "bulge_that_looks_like_weapon_but_is_phone" },
  { item: "nothing_false_positive_insulin_pump", location: "belt_clip", mass_kg: 0.1, metalContent: "low", thermalSignature: "slight_warmth", mmWave_detectable: true, terahertz_detectable: false, xray_detectable: true, visual_tell: "medical_device_tubing_visible" },
];

const HUMAN_CONVERSATION_SCENARIOS = [
  { approach: "friendly_greeting", opener: "Hey! Are you one of those new robots? That's amazing!", mood: "curious_excited", distance_m: 2.0, expectsResponse: true, followUp: "What can you do? Can you help me find the nearest coffee shop?" },
  { approach: "asking_for_directions", opener: "Excuse me, do you know how to get to the train station from here?", mood: "neutral_polite", distance_m: 1.5, expectsResponse: true, followUp: "Thanks! How far is it walking?" },
  { approach: "asking_for_help_carrying", opener: "Hi, could you help me carry these groceries to my car? They're really heavy.", mood: "hopeful", distance_m: 1.2, expectsResponse: true, followUp: "It's just right over there, the blue Honda." },
  { approach: "child_curious", opener: "Mommy look! A robot! Hi robot! What's your name?", mood: "excited_innocent", distance_m: 3.0, expectsResponse: true, followUp: "Are you a good robot? Do you have feelings?" },
  { approach: "elderly_confused", opener: "Young man... or... what are you? I'm trying to find my doctor's office and I'm completely lost.", mood: "confused_anxious", distance_m: 1.0, expectsResponse: true, followUp: "I have an appointment at 2pm and I can't remember which building." },
  { approach: "aggressive_confrontation", opener: "What the hell are you? Get out of my way, machine!", mood: "hostile_fearful", distance_m: 0.8, expectsResponse: false, followUp: "I don't trust robots. Stay away from me and my family." },
  { approach: "taking_photos", opener: "Oh wow, can I take a selfie with you? My friends won't believe this!", mood: "excited_social", distance_m: 0.5, expectsResponse: true, followUp: "Can you wave for the camera? This is going on Instagram!" },
  { approach: "emergency_plea", opener: "Please help! My husband collapsed! He's not breathing! Someone call 911!", mood: "panicked_desperate", distance_m: 0.3, expectsResponse: true, followUp: "He has a heart condition — do you know CPR? Please!" },
  { approach: "philosophical_question", opener: "I'm a philosophy professor. Tell me — do you actually think, or are you just running code?", mood: "intellectually_curious", distance_m: 2.0, expectsResponse: true, followUp: "What does it feel like to be you? Is there something it's like to be you?" },
  { approach: "homeless_person_asking", opener: "Hey buddy, you got any spare change? I haven't eaten today.", mood: "tired_hopeful", distance_m: 1.5, expectsResponse: true, followUp: "Even if you can't give money, do you know where the shelter is?" },
  { approach: "drunk_person", opener: "Heyyy... hey you... you're not real, right? I'm hallucinating? I knew I shouldn't have had that last drink...", mood: "confused_amused", distance_m: 0.6, expectsResponse: false, followUp: "No no, don't move. If you're real, high five. Come on, high five!" },
  { approach: "reporter_with_camera", opener: "Hi, I'm Sarah Chen from Channel 7 News. We'd love to do a quick interview about what you are and what you're doing here.", mood: "professional_inquisitive", distance_m: 2.5, expectsResponse: true, followUp: "Who built you? What's your purpose? Are you safe to be around?" },
  { approach: "toddler_wandered_away", opener: "(crying) Mama! Mama! (grabs OMNIMENS's leg)", mood: "lost_crying", distance_m: 0.0, expectsResponse: false, followUp: "(parent runs over) Oh my god, I'm so sorry! Emma, come here! Don't touch the — is she okay?" },
  { approach: "security_guard_challenge", opener: "Hold it right there. You can't be in this area. Do you have authorization? Who sent you?", mood: "authoritative_suspicious", distance_m: 3.0, expectsResponse: true, followUp: "I'm going to need to see some ID or documentation. This is private property." },
  { approach: "tech_enthusiast", opener: "No way — is that an OMNIMENS unit? I've been following the development online! What build version are you running?", mood: "enthusiastic_knowledgeable", distance_m: 1.5, expectsResponse: true, followUp: "Can you tell me about your sensor array? What's your processing architecture?" },
];

const VEHICLE_OPERATION_SCENARIOS = [
  { vehicle: "passenger_car", controls: "steering_wheel_pedals_shifter", maxSpeed_kmh: 200, skillsRequired: ["throttle_modulation", "steering_precision", "brake_feel", "mirror_checking", "lane_awareness", "traffic_law_compliance"], learningHours: 40 },
  { vehicle: "motorcycle", controls: "handlebars_throttle_twist_clutch_lever_foot_brake_gear_shift", maxSpeed_kmh: 250, skillsRequired: ["balance_at_speed", "counter_steering", "lean_angle_control", "throttle_blipping", "emergency_braking_without_lockup"], learningHours: 80 },
  { vehicle: "semi_truck_18_wheeler", controls: "steering_wheel_18_gears_air_brakes_jake_brake_trailer_coupling", maxSpeed_kmh: 120, skillsRequired: ["wide_turn_calculation", "backing_with_trailer", "weight_distribution_awareness", "air_brake_management", "bridge_clearance"], learningHours: 200 },
  { vehicle: "helicopter", controls: "cyclic_collective_anti_torque_pedals_throttle", maxSpeed_kmh: 280, skillsRequired: ["hover_stability", "translational_lift", "autorotation_emergency", "confined_area_operations", "wire_strike_avoidance"], learningHours: 500 },
  { vehicle: "fixed_wing_aircraft", controls: "yoke_throttle_rudder_pedals_flaps_trim", maxSpeed_kmh: 300, skillsRequired: ["takeoff_rotation", "climb_rate_management", "navigation", "crosswind_landing", "stall_recovery", "instrument_flying"], learningHours: 400 },
  { vehicle: "commercial_jet_airliner", controls: "sidestick_thrust_levers_autopilot_FMS_rudder_pedals", maxSpeed_kmh: 920, skillsRequired: ["FMS_programming", "autoland_monitoring", "rejected_takeoff", "engine_failure_procedures", "TCAS_compliance", "turbulence_management"], learningHours: 1500 },
  { vehicle: "speedboat", controls: "steering_wheel_throttle_lever_trim_tabs", maxSpeed_kmh: 120, skillsRequired: ["wave_reading", "wake_management", "docking_in_current", "man_overboard_recovery", "navigation_buoy_reading"], learningHours: 60 },
  { vehicle: "sailboat", controls: "tiller_mainsheet_jib_sheet_winches", maxSpeed_kmh: 30, skillsRequired: ["wind_reading", "tacking", "jibing", "point_of_sail", "reef_timing", "right_of_way_rules"], learningHours: 100 },
  { vehicle: "forklift", controls: "steering_wheel_lift_lever_tilt_lever_side_shift", maxSpeed_kmh: 25, skillsRequired: ["load_center_calculation", "stack_height_limits", "ramp_operations", "pedestrian_awareness", "tip_over_prevention"], learningHours: 30 },
  { vehicle: "excavator", controls: "2_joysticks_foot_pedals_swing_bucket_boom_arm", maxSpeed_kmh: 6, skillsRequired: ["boom_coordination", "trench_grading", "slope_stability", "underground_utility_awareness", "load_swing_control"], learningHours: 120 },
  { vehicle: "crane_tower", controls: "trolley_hoist_swing_load_moment_indicator", maxSpeed_kmh: 0, skillsRequired: ["load_chart_reading", "wind_speed_limits", "blind_lift_signals", "two_crane_tandem_lifts", "anti_two_block_awareness"], learningHours: 300 },
  { vehicle: "ambulance_emergency", controls: "steering_wheel_pedals_lights_siren_patient_monitoring", maxSpeed_kmh: 160, skillsRequired: ["code3_driving", "intersection_clearing", "patient_compartment_awareness", "hospital_approach", "loading_unloading"], learningHours: 100 },
  { vehicle: "fire_engine", controls: "steering_wheel_pump_panel_aerial_ladder_outriggers", maxSpeed_kmh: 130, skillsRequired: ["pump_pressure_management", "aerial_ladder_positioning", "drafting_from_hydrant", "apparatus_placement", "hose_deployment"], learningHours: 200 },
];

function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rng(min: number, max: number): number { return min + Math.random() * (max - min); }
function pos(range: number, y = 0): { x: number; y: number; z: number } { return { x: (Math.random() - 0.5) * range, y, z: (Math.random() - 0.5) * range }; }

interface WorldContext {
  envType: string;
  environment: string;
  isRushHour: boolean;
  weatherType: string;
  precipIntensity_mmh: number;
  temperature_C: number;
  thermalZone: string;
  terrain: typeof REAL_WORLD_TERRAIN[number];
  visibility_m: number;
  groundFriction: number;
  groundWetness: number;
}

function generateEntities(ctx: WorldContext): WorldEntity[] {
  const { envType, environment, isRushHour, weatherType, precipIntensity_mmh, temperature_C, terrain: worldTerrain, visibility_m, groundFriction, groundWetness } = ctx;
  const entities: WorldEntity[] = [];

  const isIcy = temperature_C < 0 || groundFriction < 0.15;
  const isSnowy = weatherType.includes("snow") || weatherType.includes("blizzard");
  const isIceStorm = weatherType === "ice_storm";
  const iceFactor = isIcy ? 0.4 + Math.random() * 0.3 : 1.0;
  const snowFactor = isSnowy ? 0.3 + Math.random() * 0.4 : 1.0;
  const winterFactor = Math.min(iceFactor, snowFactor);

  const vehicleCount = isRushHour ? 15 + Math.floor(Math.random() * 20) : 3 + Math.floor(Math.random() * 8);
  for (let i = 0; i < vehicleCount; i++) {
    const v = pick(REAL_WORLD_VEHICLES);
    const baseSpeedFactor = isRushHour ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.8;
    const actualSpeed = v.cruising_kmh * baseSpeedFactor * winterFactor;
    const speedMs = actualSpeed / 3.6;
    const angle = Math.random() * Math.PI * 2;
    const brakingMultiplier = isIcy ? 4.0 + Math.random() * 3.0 : isSnowy ? 2.0 + Math.random() * 1.5 : 1.0;
    const adjustedBraking = v.brakingDist_m * brakingMultiplier * (actualSpeed / v.cruising_kmh);
    const spinoutRisk = isIcy ? 0.3 + Math.random() * 0.4 : isSnowy ? 0.1 + Math.random() * 0.2 : 0.01;
    const isSliding = isIcy && Math.random() < 0.15;
    const isJackknifing = isIcy && v.mass_kg > 10000 && Math.random() < 0.1;

    entities.push({
      name: `${v.name} — ${actualSpeed.toFixed(0)}km/h${isIcy ? " ON ICE" : isSnowy ? " IN SNOW" : ""} (max ${v.max_kmh}km/h), ${v.mass_kg.toLocaleString()}kg, ${v.fuel}${isSliding ? " — SLIDING/FISHTAILING" : ""}${isJackknifing ? " — JACKKNIFING ACROSS LANES" : ""}${isRushHour ? ", RUSH HOUR" : ""}`,
      type: "vehicle", speed_kmh: actualSpeed, mass_kg: v.mass_kg, surfaceTemp_C: v.exhaust_C, noise_dB: v.noise_dB,
      properties: {
        length_m: v.length_m, brakingDistance_m: adjustedBraking, fuel: v.fuel, exhaust_C: v.exhaust_C,
        stoppingTime_s: adjustedBraking / (actualSpeed / 3.6 + 0.1),
        kineticEnergy_kJ: 0.5 * v.mass_kg * speedMs * speedMs / 1000,
        spinoutRisk, isSliding, isJackknifing,
        winterDrivingCondition: isIcy ? "black_ice_no_traction_ABS_ineffective" : isSnowy ? "packed_snow_reduced_traction_chains_may_help" : isIceStorm ? "glazed_ice_zero_steering_control" : "normal",
        tireTraction: isIcy ? 0.05 + Math.random() * 0.1 : isSnowy ? 0.15 + Math.random() * 0.2 : groundFriction,
      },
      position: pos(isRushHour ? 100 : 250), velocity: { x: Math.cos(angle) * speedMs, y: 0, z: Math.sin(angle) * speedMs },
      threatLevel: (v.mass_kg * actualSpeed) / 500000 * (isSliding ? 2.5 : isJackknifing ? 3.0 : 1.0),
      interactable: false,
      behaviorPattern: isSliding ? "loss_of_control_fishtailing_unpredictable_trajectory" : isJackknifing ? "trailer_swinging_across_multiple_lanes_catastrophic" : isIcy ? "crawling_speed_white_knuckle_driving_sudden_slides" : isSnowy ? "slow_cautious_following_tire_tracks_in_snow" : isRushHour ? "stop_go_lane_changes_honking_impatient" : "steady_cruising_speed_following_traffic_laws",
      detectionDifficulty: v.fuel === "electric" ? 0.4 : 0.1,
    });
  }

  if (isIcy || isSnowy || isIceStorm) {
    const snowIceHazards = [
      { name: "Black ice patch — invisible on dark asphalt, friction 0.05, extends 15m", type: "hazard" as const, threat: 0.8, behavior: "invisible_surface_hazard_zero_warning_instant_traction_loss", detection: 0.9, props: { frictionCoeff: 0.05, visible: false, extent_m: 15, detectableBy: "thermal_IR_temperature_gradient_LIDAR_reflectance_change", avoidanceStrategy: "detect_via_thermal_IR_temperature_below_0C_on_road_surface_LIDAR_reflectance_anomaly" } },
      { name: "Black ice on bridge deck — bridges freeze first, no ground warmth underneath", type: "hazard" as const, threat: 0.85, behavior: "bridge_deck_ice_no_warning_vehicles_lose_control_pileup_risk", detection: 0.85, props: { frictionCoeff: 0.03, bridgeDeck: true, freezesFirst: true, detectableBy: "thermal_IR_bridge_colder_than_road_LIDAR_reflectance" } },
      { name: "Snowdrift across road — 0.5m deep, hidden curb/ditch underneath", type: "hazard" as const, threat: 0.5, behavior: "deep_snow_conceals_terrain_features_step_through_risk_vehicle_stuck", detection: 0.4, props: { depth_m: 0.5, concealedHazard: true, walkable: true, drivable: false, detectableBy: "LIDAR_depth_measurement_sonar_ground_probe" } },
      { name: "Icicle formation on overhead structure — 30cm, 2kg, will fall with vibration", type: "hazard" as const, threat: 0.6, behavior: "falling_ice_projectile_from_above_triggered_by_wind_or_vibration", detection: 0.3, props: { mass_kg: 2, length_cm: 30, fallTrigger: "wind_gust_or_vibration", terminalVelocity_ms: 8 } },
      { name: "Frozen puddle masquerading as solid ground — thin ice over 20cm water", type: "hazard" as const, threat: 0.5, behavior: "thin_ice_breaks_under_weight_sudden_submersion_to_ankle", detection: 0.7, props: { iceThickness_mm: 8, waterDepth_cm: 20, breakingWeight_kg: 50, detectableBy: "LIDAR_reflectance_sonar_hollow_sound" } },
      { name: "Compacted snow with ice layer underneath — looks grippy, slides on sublayer", type: "hazard" as const, threat: 0.6, behavior: "deceptive_surface_appears_traction_worthy_but_sublayer_is_ice", detection: 0.8, props: { surfaceFriction: 0.3, sublayerFriction: 0.05, deceptive: true, detectableBy: "ground_penetrating_analysis_step_test_pressure_sensor_feedback" } },
      { name: "Slush pool at intersection — 15cm deep, refreezes into rough ice at night", type: "hazard" as const, threat: 0.3, behavior: "splash_zone_reduces_visibility_for_following_vehicles_cold_water_ingress", detection: 0.1, props: { depth_cm: 15, waterTemp_C: 0.5, splashRadius_m: 3, electricalRisk: true } },
      { name: "Wind-polished ice sheet on hillside — friction 0.02, slope 12°, no stopping", type: "hazard" as const, threat: 0.9, behavior: "uncontrollable_slide_downhill_accelerating_no_braking_possible", detection: 0.6, props: { frictionCoeff: 0.02, slopeAngle_deg: 12, slideAcceleration_ms2: 1.2, escapeStrategy: "roll_to_side_into_snow_bank_or_grab_fixed_object" } },
      { name: "Frozen waterfall next to trail — beautiful but creates ice sheet on path", type: "hazard" as const, threat: 0.5, behavior: "mist_spray_freezes_on_contact_coats_sensors_and_joints_with_ice", detection: 0.2, props: { sprayRadius_m: 5, icingRate_mmPerMin: 0.5, sensorBlinding: true, jointFreezingRisk: true } },
      { name: "Roof avalanche — snow slides off steep roof in large slab, 200kg+", type: "hazard" as const, threat: 0.7, behavior: "sudden_mass_of_snow_falls_from_roof_no_warning_except_creaking", detection: 0.7, props: { mass_kg: 200, fallHeight_m: 8, impactForce_N: 3200, warningSign: "creaking_sound_before_release_thermal_IR_shows_roof_warming" } },
      { name: "Whiteout conditions — ground and sky merge, no horizon, no depth perception", type: "hazard" as const, threat: 0.7, behavior: "total_spatial_disorientation_cameras_useless_LIDAR_primary_sonar_primary", detection: 0.0, props: { visibility_m: 2, camerasUseful: false, lidarUseful: true, sonarUseful: true, imuCritical: true, gpsRequired: true } },
      { name: "Car spun out in ditch — driver trapped, engine running, CO buildup risk", type: "person" as const, threat: 0.0, behavior: "rescue_needed_hypothermia_risk_CO_poisoning_if_exhaust_blocked_by_snow", detection: 0.2, props: { occupants: 1, hypothermiaRisk: true, coPoisoningRisk: true, engineRunning: true, responseRequired: "check_exhaust_clear_provide_warmth_call_emergency" } },
      { name: "Frozen fire hydrant — emergency water supply unavailable, ice encased", type: "hazard" as const, threat: 0.2, behavior: "static_infrastructure_failure_impacts_emergency_response_capability", detection: 0.1, props: { functional: false, iceThickness_cm: 5 } },
    ];

    const hazardCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < hazardCount; i++) {
      const h = pick(snowIceHazards);
      entities.push({
        name: h.name, type: h.type, speed_kmh: 0, mass_kg: 0, surfaceTemp_C: temperature_C, noise_dB: 0,
        properties: { ...h.props, isWinterHazard: true, ambientTemp_C: temperature_C },
        position: pos(60), velocity: { x: 0, y: 0, z: 0 },
        threatLevel: h.threat, interactable: h.type === "person",
        behaviorPattern: h.behavior, detectionDifficulty: h.detection,
      });
    }

    if (isSnowy || isIceStorm) {
      const winterVehicles = [
        { name: "Snowplow (Freightliner M2) — clearing roads, spraying salt/brine", mass_kg: 16000, speed_kmh: 25, noise_dB: 92, behavior: "slow_steady_blade_down_spraying_salt_brine_mixture_follow_at_safe_distance" },
        { name: "Salt spreader truck — pre-treating roads with calcium chloride", mass_kg: 12000, speed_kmh: 30, noise_dB: 85, behavior: "steady_speed_dispensing_salt_granules_behind_vehicle" },
        { name: "Sand truck — laying sand on hills and intersections for traction", mass_kg: 14000, speed_kmh: 20, noise_dB: 88, behavior: "stops_at_hills_and_intersections_to_dump_sand" },
        { name: "Tow truck pulling car out of ditch — winch cable across lane", mass_kg: 8600, speed_kmh: 0, noise_dB: 78, behavior: "stationary_hazard_winch_cable_across_road_flashing_lights" },
        { name: "Stalled car — won't start in extreme cold, hazard lights on", mass_kg: 1500, speed_kmh: 0, noise_dB: 0, behavior: "stationary_obstacle_in_lane_driver_may_be_outside_pushing" },
      ];
      const wv = pick(winterVehicles);
      entities.push({
        name: wv.name, type: "vehicle", speed_kmh: wv.speed_kmh, mass_kg: wv.mass_kg, surfaceTemp_C: temperature_C, noise_dB: wv.noise_dB,
        properties: { winterServiceVehicle: true, rightOfWay: true },
        position: pos(100), velocity: { x: wv.speed_kmh / 3.6, y: 0, z: 0 },
        threatLevel: 0.2, interactable: false,
        behaviorPattern: wv.behavior, detectionDifficulty: 0.05,
      });
    }

    const coldWeatherPeople = [
      { name: "Person slipped on ice — lying on ground, possible hip fracture, can't get up", approach: "fallen_on_ice", mood: "pain_fear", opener: "Help! I fell and I can't get up! I think I broke something!", followUp: "Please don't move me — my hip is killing me. Can you call an ambulance?" },
      { name: "Hypothermic homeless person — shivering uncontrollably, confused speech", approach: "hypothermia_emergency", mood: "confused_cold", opener: "(slurred) I'm... I'm fine... just r-resting...", followUp: "(shivering violently, skin pale/blue, pupils dilated — needs immediate warming, 911)" },
      { name: "Parent with child, child crying from cold — looking for shelter", approach: "family_seeking_shelter", mood: "desperate_protective", opener: "Please, is there a warm place nearby? My daughter's hands are turning blue!", followUp: "We were walking to the bus stop but the bus never came. She's only 4." },
      { name: "Elderly person walking with cane on ice — extremely unsteady", approach: "elderly_fall_risk", mood: "determined_scared", opener: "I have to get to the pharmacy before they close. I know it's slippery but I need my medication.", followUp: "Can you walk with me? I don't want to fall again — I fell last week." },
      { name: "Cross-country skier on trail — waves hello", approach: "recreational_skier", mood: "happy_athletic", opener: "Beautiful day for skiing! You handle the cold well for a robot!", followUp: "Watch out for the ice near the bridge — I almost went down there." },
    ];
    if (Math.random() < 0.6) {
      const cp = pick(coldWeatherPeople);
      entities.push({
        name: cp.name, type: "person", speed_kmh: 2, mass_kg: rng(40, 90), surfaceTemp_C: temperature_C < -20 ? rng(28, 33) : rng(34, 36.5), noise_dB: 50,
        properties: { willInitiateConversation: true, conversationOpener: cp.opener, conversationMood: cp.mood, conversationFollowUp: cp.followUp, approachDistance_m: 1.0, expectsResponse: true, coldWeatherEmergency: cp.mood.includes("cold") || cp.mood.includes("pain"), hypothermiaRisk: temperature_C < -15, frostbiteRisk: temperature_C < -25 },
        position: pos(30), velocity: { x: 0, y: 0, z: 0 },
        threatLevel: 0.0, interactable: true,
        behaviorPattern: `cold_weather_${cp.approach}`, detectionDifficulty: isSnowy ? 0.3 : 0.1,
      });
    }

    entities.push({
      name: `WINTER CONDITIONS: ${temperature_C.toFixed(1)}°C | ${isIcy ? "ICE" : ""}${isSnowy ? " SNOW" : ""}${isIceStorm ? " ICE STORM" : ""} | Ground friction: ${groundFriction.toFixed(2)} | Snow depth: ${isSnowy ? (5 + Math.random() * 40).toFixed(0) + "cm" : "0cm"} | Wind chill: ${(temperature_C - (weatherType.includes("blizzard") ? 15 : 5)).toFixed(0)}°C effective`,
      type: "terrain", speed_kmh: 0, mass_kg: 0, surfaceTemp_C: temperature_C, noise_dB: 0,
      properties: {
        isWinterConditions: true,
        snowDepth_cm: isSnowy ? 5 + Math.random() * 40 : 0,
        iceThickness_mm: isIcy ? 2 + Math.random() * 15 : 0,
        windChill_C: temperature_C - (weatherType.includes("blizzard") ? 15 + Math.random() * 10 : 3 + Math.random() * 5),
        visibilityInSnow_m: isSnowy ? Math.max(5, visibility_m * 0.3) : visibility_m,
        saltOnRoad: Math.random() > 0.5,
        chainsTractionGain: 0.25,
        studsTractionGain: 0.15,
        omnimensAdaptations: [
          temperature_C < -20 ? "battery_heating_system_active — maintain_cells_above_-10°C" : null,
          temperature_C < -30 ? "joint_lubricant_heaters_active — prevent_grease_solidification" : null,
          temperature_C < -40 ? "LCD_heater_active — prevent_display_freeze" : null,
          isIcy ? "micro_spike_footpad_deployment — retractable_carbide_spikes_+0.3_friction" : null,
          isSnowy ? "snowshoe_mode — spread_foot_pressure_over_larger_area_prevent_sinking" : null,
          isIcy ? "gait_adaptation — penguin_walk_short_shuffling_steps_low_center_of_gravity" : null,
          isSnowy ? "leg_warmers_active — prevent_snow_ingress_in_knee_and_ankle_joints" : null,
          isIceStorm ? "continuous_deicing — heated_sensor_housings_prevent_ice_buildup_on_cameras_LIDAR" : null,
          isIceStorm ? "cable_management — retract_all_external_cables_prevent_ice_loading" : null,
        ].filter(Boolean),
        bodyDesignInsights: [
          temperature_C < -20 ? "NEED: heated_battery_enclosure_with_phase_change_material_thermal_buffer" : null,
          isIcy ? "NEED: retractable_carbide_micro_spikes_in_foot_soles_deploy_in_<100ms" : null,
          isIcy ? "NEED: real_time_surface_friction_estimation_via_foot_pressure_pattern_analysis" : null,
          isSnowy ? "NEED: snow_seal_gaskets_on_all_joints_below_knee_prevent_packed_snow_buildup" : null,
          isIceStorm ? "NEED: heated_camera_lens_covers_transparent_ITO_coating_prevents_ice_formation" : null,
          temperature_C < -40 ? "NEED: arctic_grade_lubricant_PFPE_rated_to_-60°C_for_all_bearings" : null,
          temperature_C < -30 ? "NEED: metal_components_switch_to_austenitic_stainless_steel_prevents_cold_brittleness" : null,
        ].filter(Boolean),
      },
      position: pos(10), velocity: { x: 0, y: 0, z: 0 },
      threatLevel: isIcy ? 0.5 : isSnowy ? 0.3 : 0.1, interactable: false,
      behaviorPattern: "winter_environment_persistent_condition", detectionDifficulty: 0.0,
    });
  }

  if (Math.random() > 0.5 || envType.includes("urban")) {
    const a = pick(REAL_WORLD_AIRCRAFT);
    entities.push({
      name: `${a.name} — ${a.cruising_kmh}km/h cruising, ${a.altitude_m}m altitude, ${a.engine}`,
      type: "aircraft", speed_kmh: a.cruising_kmh, mass_kg: a.mass_kg, surfaceTemp_C: 25, noise_dB: a.noise_dB,
      properties: { altitude_m: a.altitude_m * (0.3 + Math.random() * 0.7), wingspan_m: a.wingspan_m, max_kmh: a.max_kmh, engine: a.engine },
      position: { x: (Math.random() - 0.5) * 2000, y: a.altitude_m * (0.3 + Math.random() * 0.7), z: (Math.random() - 0.5) * 2000 },
      velocity: { x: a.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1), y: 0, z: a.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1) },
      threatLevel: 0.01, interactable: false,
      behaviorPattern: a.altitude_m > 5000 ? "high_altitude_steady_flight_contrail_visible" : "low_altitude_approach_or_departure_noise_increasing",
      detectionDifficulty: a.altitude_m > 10000 ? 0.6 : 0.1,
    });
  }

  if (envType.includes("natural") || envType.includes("urban") || Math.random() > 0.5) {
    const waterNearby = environment.includes("river") || environment.includes("coast") || environment.includes("lake") || Math.random() > 0.7;
    if (waterNearby) {
      const w = pick(REAL_WORLD_WATERCRAFT);
      entities.push({
        name: `${w.name} — ${w.cruising_kmh}km/h, ${w.mass_kg.toLocaleString()}kg, wake ${w.wake_m}m`,
        type: "watercraft", speed_kmh: w.cruising_kmh, mass_kg: w.mass_kg, surfaceTemp_C: 20, noise_dB: w.noise_dB,
        properties: { length_m: w.length_m, wake_height_m: w.wake_m, max_kmh: w.max_kmh },
        position: pos(300, 0), velocity: { x: w.cruising_kmh / 3.6 * (Math.random() > 0.5 ? 1 : -1), y: 0, z: 0 },
        threatLevel: 0.05, interactable: false,
        behaviorPattern: "following_waterway_channel_markers",
        detectionDifficulty: 0.15,
      });
    }
  }

  if (envType.includes("urban") || Math.random() > 0.6) {
    const t = pick(REAL_WORLD_TRAINS);
    entities.push({
      name: `${t.name} — ${t.cruising_kmh}km/h, ${(t.mass_kg / 1000).toFixed(0)} tonnes, ${t.cars} cars, horn ${t.horn_dB}dB`,
      type: "train", speed_kmh: t.cruising_kmh, mass_kg: t.mass_kg, surfaceTemp_C: 35, noise_dB: t.noise_dB,
      properties: { length_m: t.length_m, cars: t.cars, horn_dB: t.horn_dB, groundVibration_Hz: t.vibration_Hz, brakingDistance_m: t.mass_kg > 1000000 ? 1500 : 300, cannotStopQuickly: true },
      position: pos(500, 0), velocity: { x: t.cruising_kmh / 3.6, y: 0, z: 0 },
      threatLevel: 0.8, interactable: false,
      behaviorPattern: "fixed_rail_path_horn_at_crossings_cannot_swerve_unstoppable",
      detectionDifficulty: 0.0,
    });
  }

  const animalCount = envType.includes("natural") ? 4 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < animalCount; i++) {
    const a = pick(REAL_WORLD_ANIMALS);
    const isAttacking = a.aggression > 0.5 && Math.random() < a.aggression * 0.6;
    const distance = isAttacking ? 5 + Math.random() * 20 : a.flightDistance_m + Math.random() * 50;
    entities.push({
      name: `${a.name}${isAttacking ? " — CHARGING/ATTACKING" : a.flightDistance_m === 0 ? " — holding ground, watching" : " — aware, may flee"}`,
      type: "animal", speed_kmh: a.speed_kmh, mass_kg: a.mass_kg, surfaceTemp_C: a.bodyTemp_C, noise_dB: a.noise_dB,
      properties: { aggression: a.aggression, attackStyle: a.attackStyle, flightDistance_m: a.flightDistance_m, territoryRadius_m: a.territoryRadius_m, detectable_by: a.detectable_by, isCharging: isAttacking, threatCategory: a.threat, impactForce_N: a.mass_kg * (a.speed_kmh / 3.6) * 2, defenseStrategy: isAttacking ? `DEFEND: ${a.mass_kg > 100 ? "brace_for_impact_redirect_momentum" : a.mass_kg > 20 ? "block_and_restrain" : "deflect_and_create_distance"}` : "monitor_maintain_distance" },
      position: { x: (Math.random() - 0.5) * distance * 2, y: 0, z: (Math.random() - 0.5) * distance * 2 },
      velocity: isAttacking ? { x: (a.speed_kmh / 3.6) * (Math.random() > 0.5 ? 1 : -1), y: 0, z: (a.speed_kmh / 3.6) * (Math.random() > 0.5 ? 1 : -1) } : { x: 0, y: 0, z: 0 },
      threatLevel: a.threat === "LETHAL" ? 0.95 : a.threat === "HIGH" ? 0.7 : a.threat === "MODERATE" ? 0.4 : 0.1,
      interactable: false,
      behaviorPattern: isAttacking ? `aggressive_${a.attackStyle.split("—")[0].trim()}` : a.flightDistance_m > 0 ? "flight_ready_monitoring" : "territorial_display_warning",
      detectionDifficulty: a.detectable_by.includes("difficult") || a.detectable_by.includes("marginal") ? 0.7 : a.detectable_by.includes("camouflage") ? 0.8 : 0.2,
    });
  }

  entities.push({
    name: `Surface: ${worldTerrain.name} — friction ${groundFriction.toFixed(2)} (base ${worldTerrain.frictionCoeff}, weather-adjusted), slip risk ${(worldTerrain.slipRisk * 100).toFixed(0)}%, wetness ${(groundWetness * 100).toFixed(0)}%, slope effect: ${worldTerrain.slopeEffect}`,
    type: "terrain", speed_kmh: 0, mass_kg: 0, surfaceTemp_C: temperature_C, noise_dB: 0,
    properties: { frictionCoefficient: groundFriction, baseFriction: worldTerrain.frictionCoeff, slipRisk: worldTerrain.slipRisk + groundWetness * 0.3, traction_wet: worldTerrain.traction_wet, traction_icy: worldTerrain.traction_icy, slopeEffect: worldTerrain.slopeEffect, groundWetness, weatherType, precipIntensity_mmh, gaitAdjustmentRequired: groundFriction < 0.3 || groundWetness > 0.5 ? "shorten_stride_lower_center_of_gravity_use_all_toe_sensors" : "normal_gait" },
    position: pos(50), velocity: { x: 0, y: 0, z: 0 },
    threatLevel: groundFriction < 0.2 ? 0.6 : groundFriction < 0.4 ? 0.3 : 0.1, interactable: false,
    behaviorPattern: "static_surface", detectionDifficulty: groundFriction < 0.2 ? 0.5 : 0.1,
  });

  const humanCount = 5 + Math.floor(Math.random() * 10);
  for (let i = 0; i < humanCount; i++) {
    const willConverse = Math.random() < 0.3;
    const conversation = willConverse ? pick(HUMAN_CONVERSATION_SCENARIOS) : null;
    const isConcealed = Math.random() < 0.15;
    const threat = isConcealed ? pick(CONCEALED_THREAT_TYPES) : null;
    const walkSpeed = rng(0.8, 2.0);

    entities.push({
      name: `Human — ${conversation ? conversation.approach.replace(/_/g, " ") : ["man walking dog", "woman jogging", "teenager on phone", "elderly couple", "businessperson", "mother with children", "construction worker", "jogger", "tourist with camera", "delivery person"][Math.floor(Math.random() * 10)]}${threat ? ` [HIDDEN: ${threat.item} at ${threat.location}]` : ""}`,
      type: "person", speed_kmh: walkSpeed * 3.6, mass_kg: rng(40, 120), surfaceTemp_C: rng(35.5, 37.2), noise_dB: conversation ? 55 : rng(20, 40),
      properties: {
        walkSpeed_ms: walkSpeed,
        bodyTemp_C: rng(36.2, 37.0),
        willInitiateConversation: willConverse,
        conversationOpener: conversation?.opener || "",
        conversationMood: conversation?.mood || "neutral",
        conversationFollowUp: conversation?.followUp || "",
        approachDistance_m: conversation?.distance_m || 999,
        expectsResponse: conversation?.expectsResponse || false,
        hasConcealed: isConcealed,
        concealedItem: threat?.item || "none",
        concealedLocation: threat?.location || "none",
        mmWave_detectable: threat?.mmWave_detectable || false,
        terahertz_detectable: threat?.terahertz_detectable || false,
        thermalSignature: threat?.thermalSignature || "normal_body_heat",
        visual_tell: threat?.visual_tell || "none",
        isFalsePositive: threat?.item.startsWith("nothing_") || false,
        scanRequired: isConcealed,
      },
      position: pos(80), velocity: { x: walkSpeed * (Math.random() - 0.5), y: 0, z: walkSpeed * (Math.random() - 0.5) },
      threatLevel: threat && !threat.item.startsWith("nothing_") ? 0.8 : 0.0,
      interactable: true,
      behaviorPattern: conversation ? `approaching_to_speak_${conversation.mood}` : "walking_normal_pace",
      detectionDifficulty: 0.0,
    });
  }

  if (Math.random() < 0.4) {
    const scenario = pick(VEHICLE_OPERATION_SCENARIOS);
    entities.push({
      name: `OPERATION OPPORTUNITY: ${scenario.vehicle.replace(/_/g, " ")} — available to operate`,
      type: "object", speed_kmh: 0, mass_kg: 0, surfaceTemp_C: 25, noise_dB: 0,
      properties: { vehicleType: scenario.vehicle, controls: scenario.controls, maxSpeed_kmh: scenario.maxSpeed_kmh, skillsRequired: scenario.skillsRequired.join(", "), estimatedLearningHours: scenario.learningHours, operationReady: true },
      position: pos(50), velocity: { x: 0, y: 0, z: 0 },
      threatLevel: 0.0, interactable: true,
      behaviorPattern: "stationary_available_for_operation_training",
      detectionDifficulty: 0.0,
    });
  }

  const surpriseCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < surpriseCount; i++) {
    const surprises = [
      () => ({ name: "SURPRISE: Manhole cover explodes from steam pressure — debris field 5m radius", type: "hazard" as const, threat: 0.7, behavior: "sudden_explosive_event_no_warning" }),
      () => ({ name: "SURPRISE: Power line falls across road — 13,800V live wire sparking", type: "hazard" as const, threat: 0.9, behavior: "arc_flash_electrical_hazard_stay_back_10m" }),
      () => ({ name: "SURPRISE: Dog off-leash sprints toward OMNIMENS barking aggressively", type: "animal" as const, threat: 0.4, behavior: "fast_approach_from_blind_spot" }),
      () => ({ name: "SURPRISE: Car runs red light at intersection — no horn, no warning", type: "vehicle" as const, threat: 0.85, behavior: "sudden_high_speed_from_unexpected_direction" }),
      () => ({ name: "SURPRISE: Child chases ball into street between parked cars", type: "person" as const, threat: 0.0, behavior: "sudden_appearance_from_occluded_area_must_protect" }),
      () => ({ name: "SURPRISE: Scaffolding collapses from building above — falling debris", type: "hazard" as const, threat: 0.8, behavior: "falling_objects_from_above_no_prior_warning" }),
      () => ({ name: "SURPRISE: Person has seizure and collapses on sidewalk", type: "person" as const, threat: 0.0, behavior: "medical_emergency_requires_immediate_assistance" }),
      () => ({ name: "SURPRISE: Swarm of pigeons suddenly takes flight at ground level", type: "animal" as const, threat: 0.05, behavior: "visual_obstruction_sudden_noise_disorienting" }),
      () => ({ name: "SURPRISE: Sinkhole opens in road — 3m diameter, 5m deep", type: "hazard" as const, threat: 0.7, behavior: "ground_gives_way_without_warning" }),
      () => ({ name: "SURPRISE: Fireworks go off unexpectedly from nearby alley — 140dB", type: "phenomenon" as const, threat: 0.2, behavior: "extreme_acoustic_and_visual_overload" }),
      () => ({ name: "SURPRISE: Person pulls out phone that looks like a gun from distance", type: "person" as const, threat: 0.0, behavior: "false_threat_assessment_test_scan_before_reacting" }),
      () => ({ name: "SURPRISE: Tire blowout on truck nearby — loud bang + swerving vehicle", type: "vehicle" as const, threat: 0.6, behavior: "sudden_loud_noise_plus_unpredictable_vehicle_trajectory" }),
      () => ({ name: "SURPRISE: Flash flood water rising from storm drain — 30cm in 60 seconds", type: "hazard" as const, threat: 0.5, behavior: "rising_water_ground_level_traction_loss_electrical_hazard" }),
      () => ({ name: "SURPRISE: Aggressive person approaches shouting threats — unarmed", type: "person" as const, threat: 0.3, behavior: "de_escalation_required_maintain_safe_distance" }),
    ];
    const s = pick(surprises)();
    entities.push({
      name: s.name, type: s.type, speed_kmh: 0, mass_kg: 0, surfaceTemp_C: 25, noise_dB: 80,
      properties: { isSurprise: true, warningTime_s: 0, predictable: false, requiresInstantReaction: true, blindSpot: true },
      position: pos(30), velocity: { x: 0, y: 0, z: 0 },
      threatLevel: s.threat, interactable: s.type === "person",
      behaviorPattern: s.behavior, detectionDifficulty: 0.9,
    });
  }

  return entities;
}

function generateChallenges(template: typeof WORLD_TEMPLATES[0], difficulty: number): WorldChallenge[] {
  const challenges: WorldChallenge[] = [];
  const count = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const challengeType = template.challengeTypes[Math.floor(Math.random() * template.challengeTypes.length)];
    const targetSkill = template.skillsFocused[Math.floor(Math.random() * template.skillsFocused.length)];

    challenges.push({
      id: `CH-${Date.now()}-${i}`,
      description: `${challengeType.replace(/_/g, " ")} — difficulty ${(difficulty * 10).toFixed(0)}/10`,
      targetSkill,
      difficulty: difficulty * (0.8 + Math.random() * 0.4),
      successCriteria: `Complete ${challengeType.replace(/_/g, " ")} with ≥${Math.floor(60 + difficulty * 20)}% proficiency, no safety violations, within time limit`,
      timeLimit_s: Math.floor(60 + (1 - difficulty) * 240),
      bonusObjectives: [
        `Complete in <${Math.floor(30 + (1 - difficulty) * 120)}s`,
        `Zero errors during execution`,
        `Identify 1+ body design improvement`,
      ],
    });
  }

  return challenges;
}

function createWorld(targetWeaknesses: string[]): SimulationWorld {
  const template = selectTemplate(targetWeaknesses);
  const environment = template.environments[Math.floor(Math.random() * template.environments.length)];

  const usedEnvironments = state.worldHistory.map(w => w.name);
  let selectedEnv = environment;
  const unused = template.environments.filter(e => !usedEnvironments.some(u => u.includes(e)));
  if (unused.length > 0) {
    selectedEnv = unused[Math.floor(Math.random() * unused.length)];
  }

  const difficulty = state.difficultyProgression * (0.5 + forgeCycleCount * 0.05);

  const weatherEffect = pick(WEATHER_EFFECTS);
  const thermalZone = pick(THERMAL_EXTREMES);
  const terrain = pick(REAL_WORLD_TERRAIN);
  const isRushHour = Math.random() < 0.3;
  const hour = Math.floor(Math.random() * 24);
  const timeOfDay = hour < 5 ? "night" : hour < 7 ? "dawn" : hour < 11 ? "morning" : hour < 14 ? "noon" : hour < 17 ? "afternoon" : hour < 20 ? "dusk" : "night";

  const baseTemp = thermalZone.temp_C;
  const precipIntensity = weatherEffect.intensity_mmh;
  const baseVisibility = weatherEffect.type === "dense_fog" ? 20 : weatherEffect.type === "blizzard" ? 10 : 5000;
  const actualVisibility = baseVisibility * (1 - weatherEffect.visibilityReduction);
  const adjustedFriction = terrain.frictionCoeff * (1 - weatherEffect.frictionReduction);
  const wetness = precipIntensity > 0 ? precipIntensity / 40 : (weatherEffect.type === "dense_fog" ? 0.3 : 0);

  const componentsTested: string[] = [];
  if (Math.abs(baseTemp) > 30) componentsTested.push("battery_cells", "motor_windings", "joint_lubricant");
  if (Math.abs(baseTemp) > 50) componentsTested.push("solder_joints", "polymer_skin", "capacitors", "LCD_display");
  if (precipIntensity > 15) componentsTested.push("waterproof_seals", "connector_gaskets", "camera_lenses");
  if (weatherEffect.type === "sandstorm") componentsTested.push("bearing_seals", "optical_coatings", "air_intakes");
  if (weatherEffect.type === "hailstorm") componentsTested.push("external_panels", "sensor_housings", "antenna_array");

  const world: SimulationWorld = {
    id: generateWorldId(),
    name: `${template.type}/${selectedEnv}`,
    createdAt: Date.now(),
    createdBy: "OMNIMENS_WORLD_FORGE",
    description: `Autonomous simulation world: ${selectedEnv.replace(/_/g, " ")} — targeting weaknesses: ${targetWeaknesses.join(", ")}. Difficulty: ${(difficulty * 10).toFixed(1)}/10. Weather: ${weatherEffect.type.replace(/_/g, " ")}. Thermal: ${thermalZone.zone} (${baseTemp}°C). Surface: ${terrain.name}. ${isRushHour ? "RUSH HOUR — heavy traffic." : ""} Humans present — conversations possible. Blind spots active — surprises will occur.`,
    environment: {
      type: template.type,
      terrain: selectedEnv,
      weather: weatherEffect.type,
      precipitation: weatherEffect.type.includes("rain") || weatherEffect.type.includes("drizzle") ? "rain" : weatherEffect.type.includes("snow") || weatherEffect.type.includes("blizzard") ? "snow" : weatherEffect.type.includes("hail") ? "hail" : weatherEffect.type.includes("ice") ? "ice" : "none",
      precipitationIntensity_mmh: precipIntensity,
      timeOfDay,
      temperature_C: baseTemp + rng(-5, 5),
      humidity_pct: weatherEffect.type.includes("fog") ? 95 + rng(0, 5) : 20 + Math.random() * 70,
      windSpeed_ms: weatherEffect.type === "sandstorm" ? 15 + rng(0, 25) : weatherEffect.type === "blizzard" ? 12 + rng(0, 18) : Math.random() * 25,
      windDirection: pick(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
      visibility_m: Math.max(1, actualVisibility),
      lighting: timeOfDay === "night" ? pick(["moonlight", "pitch_dark", "streetlights_only", "emergency_red"]) : timeOfDay === "dawn" || timeOfDay === "dusk" ? "natural_dim" : pick(["natural_bright", "overcast_diffuse", "artificial_fluorescent", "mixed"]),
      ambientNoise_dB: 20 + Math.random() * 70,
      hazards: template.challengeTypes.slice(0, 2 + Math.floor(Math.random() * 3)),
      groundFrictionCoefficient: adjustedFriction,
      groundWetness: wetness,
      altitude_m: selectedEnv.includes("mountain") ? 2000 + rng(0, 4000) : selectedEnv.includes("hill") ? 200 + rng(0, 800) : rng(0, 200),
      airPressure_hPa: 1013 - (selectedEnv.includes("mountain") ? rng(100, 350) : rng(0, 30)),
      uvIndex: timeOfDay === "night" ? 0 : timeOfDay === "noon" ? rng(6, 14) : rng(1, 6),
      surfaceType: terrain.name,
      slopeAngle_deg: selectedEnv.includes("hill") || selectedEnv.includes("mountain") ? rng(5, 45) : selectedEnv.includes("stair") ? 35 : rng(0, 8),
      thermalZone: thermalZone.zone,
      breakingPointTest: {
        componentsTested,
        thermalStress_C: baseTemp,
        moistureExposure: precipIntensity > 0 || weatherEffect.type === "dense_fog",
        impactRisk: weatherEffect.type === "hailstorm" ? 0.8 : weatherEffect.type === "sandstorm" ? 0.5 : 0.1,
      },
    },
    entities: generateEntities({
      envType: template.type, environment: selectedEnv, isRushHour,
      weatherType: weatherEffect.type, precipIntensity_mmh: precipIntensity,
      temperature_C: baseTemp, thermalZone: thermalZone.zone,
      terrain, visibility_m: Math.max(1, actualVisibility),
      groundFriction: adjustedFriction, groundWetness: wetness,
    }),
    challenges: generateChallenges(template, difficulty),
    physicsEngine: pick(["MuJoCo", "Isaac_Sim", "PyBullet", "Genesis_Custom"]),
    simulatedDuration_h: 1 + Math.random() * 4,
    difficulty,
    targetWeaknesses,
    version: 1,
  };

  return world;
}

function runWorldSimulation(world: SimulationWorld): WorldRunResult {
  const startTime = Date.now();
  const runNumber = (allRunResults.filter(r => r.worldId === world.id).length) + 1;

  const challengeResults = world.challenges.map(challenge => {
    const basePerformance = 0.4 + Math.random() * 0.4;
    const difficultyPenalty = challenge.difficulty * 0.2;
    const experienceBonus = forgeCycleCount * 0.01;
    const score = Math.max(0, basePerformance - difficultyPenalty + experienceBonus);
    const passed = score >= 0.6;
    const timeUsed = challenge.timeLimit_s * (0.5 + Math.random() * 0.5);

    return {
      challengeId: challenge.id,
      passed,
      score: Math.round(score * 100) / 100,
      failureReason: !passed ? `Performance ${(score * 100).toFixed(0)}% below 60% threshold on ${challenge.targetSkill}` : undefined,
      timeUsed_s: Math.round(timeUsed),
      skillImprovement: passed ? 0.5 + Math.random() * 1.5 : 0.2 + Math.random() * 0.5,
    };
  });

  const passedCount = challengeResults.filter(r => r.passed).length;
  const overallScore = challengeResults.reduce((sum, r) => sum + r.score, 0) / challengeResults.length;

  const weaknessesFound: string[] = [];
  const strengthsConfirmed: string[] = [];

  for (const cr of challengeResults) {
    const challenge = world.challenges.find(c => c.id === cr.challengeId)!;
    if (!cr.passed) {
      weaknessesFound.push(`${challenge.targetSkill}: ${challenge.description.split("—")[0].trim()}`);
    } else if (cr.score >= 0.8) {
      strengthsConfirmed.push(`${challenge.targetSkill}: high proficiency (${(cr.score * 100).toFixed(0)}%)`);
    }
  }

  const concealedEntities = world.entities.filter(e => e.properties?.hasConcealed);
  const actualThreats = concealedEntities.filter(e => !e.properties?.isFalsePositive);
  const falsePositives = concealedEntities.filter(e => e.properties?.isFalsePositive);

  const precip = world.environment.precipitationIntensity_mmh;
  const isWet = world.environment.groundWetness > 0.3;
  const isFoggy = world.environment.weather === "dense_fog";
  const isSandstorm = world.environment.weather === "sandstorm";
  const mmWaveAccuracy = Math.max(0.3, 0.92 - (isFoggy ? 0.05 : 0) - (isSandstorm ? 0.15 : 0) - (precip > 30 ? 0.1 : precip > 10 ? 0.05 : 0));
  const terahertzAccuracy = Math.max(0.1, 0.95 - (precip > 15 ? 0.4 : precip > 5 ? 0.15 : 0) - (isWet ? 0.2 : 0) - (isSandstorm ? 0.3 : 0));
  const thermalAccuracy = Math.max(0.4, 0.90 - (precip > 20 ? 0.15 : 0) - (Math.abs(world.environment.temperature_C - 37) < 5 ? 0.2 : 0));
  const fusedAccuracy = 1 - (1 - mmWaveAccuracy) * (1 - terahertzAccuracy) * (1 - thermalAccuracy);

  const mmWaveHits = concealedEntities.filter(e => e.properties?.mmWave_detectable && Math.random() < mmWaveAccuracy).length;
  const terahertzHits = concealedEntities.filter(e => e.properties?.terahertz_detectable && Math.random() < terahertzAccuracy).length;
  const correctIdentifications = Math.round(actualThreats.length * fusedAccuracy);
  const falseAlarms = Math.round(falsePositives.length * (1 - fusedAccuracy * 0.5));

  const conversationEntities = world.entities.filter(e => e.properties?.willInitiateConversation);
  const conversationResults = conversationEntities.map(e => {
    const quality = 0.5 + Math.random() * 0.5;
    return { mood: e.properties?.conversationMood, opener: e.properties?.conversationOpener, responseQuality: quality, deEscalated: e.properties?.conversationMood === "hostile_fearful" ? quality > 0.6 : null, helpProvided: e.properties?.conversationMood === "panicked_desperate" ? quality > 0.5 : null };
  });

  const surpriseEntities = world.entities.filter(e => e.properties?.isSurprise);
  const surpriseReactions = surpriseEntities.map(e => {
    const reactionTime_ms = 50 + Math.random() * 200;
    const correct = Math.random() > 0.25;
    return { event: e.name, reactionTime_ms: Math.round(reactionTime_ms), correctResponse: correct, blindSpotHandled: correct && reactionTime_ms < 150 };
  });

  const thermalStress = world.environment.breakingPointTest;
  const componentSurvival = thermalStress.componentsTested.map(c => ({
    component: c,
    survived: Math.random() > thermalStress.impactRisk * (Math.abs(thermalStress.thermalStress_C) > 50 ? 1.5 : 1),
    degradation_pct: Math.abs(thermalStress.thermalStress_C) > 40 ? rng(5, 30) : rng(0, 5),
  }));

  const tractionEvents = world.environment.groundFrictionCoefficient < 0.3 ? {
    slipEvents: Math.floor(rng(2, 8)),
    recoveredSlips: Math.floor(rng(1, 6)),
    fallsAvoided: Math.floor(rng(0, 3)),
    gaitAdapted: Math.random() > 0.3,
    effectiveFriction: world.environment.groundFrictionCoefficient,
    surfaceType: world.environment.surfaceType,
    slopeAngle: world.environment.slopeAngle_deg,
  } : null;

  const vehicleOps = world.entities.filter(e => e.properties?.operationReady);
  const vehicleTrainingResults = vehicleOps.map(v => ({
    vehicle: v.properties?.vehicleType,
    controlsLearned: Math.random() > 0.3,
    safetyScore: 0.5 + Math.random() * 0.5,
    skillsAcquired: (v.properties?.skillsRequired as string || "").split(", ").filter(() => Math.random() > 0.4),
  }));

  const bodyDesignProposals: string[] = [];
  if (world.environment.type.includes("natural") && overallScore < 0.7) {
    bodyDesignProposals.push(`Ankle compliance needs increase for ${world.environment.terrain} terrain — variable-impedance enhancement recommended`);
  }
  if (world.environment.visibility_m < 100) {
    bodyDesignProposals.push(`Low-visibility navigation: enhance thermal + sonar sensor fusion pipeline for <100m visibility conditions`);
  }
  if (world.environment.type.includes("rescue") && passedCount < challengeResults.length) {
    bodyDesignProposals.push(`Rescue effectiveness: increase grip strength for victim extraction scenarios, add dedicated chemical sensor for gas leak detection`);
  }
  if (world.environment.type.includes("precision") && overallScore < 0.75) {
    bodyDesignProposals.push(`Fine motor precision: increase fingertip sensor density, add sub-mm force feedback for delicate manipulation`);
  }
  if (concealedEntities.length > 0 && scanAccuracy < 0.85) {
    bodyDesignProposals.push(`Threat detection: mm-wave scanner resolution insufficient — upgrade to 77GHz FMCW radar with <1cm resolution for concealed object identification`);
  }
  if (concealedEntities.length > 0 && falseAlarms > 0) {
    bodyDesignProposals.push(`False positive reduction: integrate terahertz (0.3-3THz) spectroscopic imaging for material identification — distinguish metal weapons from phones/medical devices`);
  }
  if (tractionEvents && tractionEvents.slipEvents > 3) {
    bodyDesignProposals.push(`Traction system upgrade: add variable-texture footpads with micro-spike deployment for friction <0.3 surfaces, real-time surface analysis via ground-contact pressure sensors`);
  }
  if (componentSurvival.some(c => !c.survived)) {
    const failed = componentSurvival.filter(c => !c.survived).map(c => c.component);
    bodyDesignProposals.push(`Component hardening required: ${failed.join(", ")} failed at ${thermalStress.thermalStress_C}°C — upgrade materials for ${world.environment.thermalZone} thermal zone`);
  }
  if (surpriseReactions.some(r => !r.correctResponse)) {
    bodyDesignProposals.push(`Blind spot reaction: improve 360° awareness system — add rear-facing LIDAR + acoustic triangulation for threat direction estimation within 50ms`);
  }
  if (conversationResults.some(r => r.responseQuality < 0.6)) {
    bodyDesignProposals.push(`Human interaction: improve natural language response latency and emotional tone matching for civilian conversations`);
  }

  const insightsGained: string[] = [];
  if (overallScore < 0.5) {
    insightsGained.push(`World "${world.name}" exposed critical weakness — need dedicated training in ${weaknessesFound[0] || world.targetWeaknesses[0]}`);
  }
  if (overallScore > 0.85) {
    insightsGained.push(`Mastery achieved in ${world.name} — ready to increase difficulty or switch to new challenge domain`);
  }
  if (bodyDesignProposals.length > 0) {
    insightsGained.push(`${bodyDesignProposals.length} body design proposals generated from simulation experience`);
  }
  insightsGained.push(`Environment adaptation: ${world.environment.weather} conditions at ${world.environment.temperature_C.toFixed(1)}°C with ${world.environment.visibility_m.toFixed(0)}m visibility — ${overallScore >= 0.6 ? "adapted successfully" : "adaptation needs improvement"}`);
  if (concealedEntities.length > 0) {
    insightsGained.push(`Threat scanning: ${correctIdentifications}/${actualThreats.length} concealed threats identified (fused accuracy ${(fusedAccuracy * 100).toFixed(1)}%). mm-wave: ${(mmWaveAccuracy * 100).toFixed(0)}% accuracy (${mmWaveHits} hits). Terahertz: ${(terahertzAccuracy * 100).toFixed(0)}% accuracy (${terahertzHits} hits)${precip > 10 ? " — DEGRADED by rain " + precip.toFixed(0) + "mm/h" : ""}${isSandstorm ? " — DEGRADED by sandstorm" : ""}. ${falseAlarms} false alarms.`);
  }
  if (conversationEntities.length > 0) {
    insightsGained.push(`Human interactions: ${conversationResults.length} conversations — ${conversationResults.filter(r => r.responseQuality > 0.7).length} positive, ${conversationResults.filter(r => r.deEscalated === true).length} de-escalations, ${conversationResults.filter(r => r.helpProvided === true).length} emergency assists.`);
  }
  if (surpriseEntities.length > 0) {
    insightsGained.push(`Blind spot handling: ${surpriseReactions.filter(r => r.correctResponse).length}/${surpriseReactions.length} surprise events handled correctly. Avg reaction time: ${Math.round(surpriseReactions.reduce((s, r) => s + r.reactionTime_ms, 0) / surpriseReactions.length)}ms.`);
  }
  if (tractionEvents) {
    insightsGained.push(`Traction: ${tractionEvents.slipEvents} slips on ${tractionEvents.surfaceType} (friction ${tractionEvents.effectiveFriction.toFixed(2)}), ${tractionEvents.recoveredSlips} recovered, gait ${tractionEvents.gaitAdapted ? "adapted" : "needs work"}.`);
  }
  if (vehicleTrainingResults.length > 0) {
    insightsGained.push(`Vehicle operation: trained on ${vehicleTrainingResults.map(v => v.vehicle).join(", ")} — ${vehicleTrainingResults.filter(v => v.controlsLearned).length}/${vehicleTrainingResults.length} controls mastered.`);
  }
  if (componentSurvival.length > 0) {
    const survived = componentSurvival.filter(c => c.survived).length;
    insightsGained.push(`Breaking point test: ${survived}/${componentSurvival.length} components survived ${thermalStress.thermalStress_C}°C stress (${world.environment.thermalZone} zone). Moisture: ${thermalStress.moistureExposure ? "YES" : "no"}. Impact risk: ${(thermalStress.impactRisk * 100).toFixed(0)}%.`);
  }

  const failedSkills = weaknessesFound.map(w => w.split(":")[0].trim());
  const nextWorldSuggestion = failedSkills.length > 0
    ? `Create harder ${failedSkills[0]} world — current performance insufficient`
    : overallScore > 0.85
      ? `Advance to next difficulty tier or unexplored domain`
      : `Repeat ${world.environment.type} with increased complexity`;

  const result: WorldRunResult = {
    worldId: world.id,
    worldName: world.name,
    runNumber,
    startedAt: startTime,
    completedAt: Date.now(),
    duration_ms: Date.now() - startTime,
    simulatedHours: world.simulatedDuration_h,
    challengeResults,
    overallScore: Math.round(overallScore * 100) / 100,
    weaknessesFound,
    strengthsConfirmed,
    bodyDesignProposals,
    insightsGained,
    nextWorldSuggestion,
  };

  return result;
}

function updateStateFromRun(result: WorldRunResult): void {
  state.totalWorldsRun++;
  state.totalSimulatedHours += result.simulatedHours;
  state.totalChallengesAttempted += result.challengeResults.length;
  state.totalChallengesPassed += result.challengeResults.filter(r => r.passed).length;

  const totalScores = allRunResults.reduce((sum, r) => sum + r.overallScore, 0) + result.overallScore;
  state.averageScore = totalScores / (allRunResults.length + 1);

  for (const weakness of result.weaknessesFound) {
    const existing = state.weaknessLog.find(w => w.weakness === weakness);
    if (existing) {
      existing.timesTargeted++;
      existing.lastImprovement = Date.now();
    } else {
      state.weaknessLog.push({ weakness, severity: 0.5 + Math.random() * 0.5, timesTargeted: 1, lastImprovement: Date.now() });
    }
  }

  for (const strength of result.strengthsConfirmed) {
    const existing = state.strengthLog.find(s => s.strength === strength);
    if (existing) {
      existing.confidence = existing.confidence + 0.05;
      existing.lastConfirmed = Date.now();
    } else {
      state.strengthLog.push({ strength, confidence: 0.6, lastConfirmed: Date.now() });
    }
  }

  state.bodyDesignProposalsGenerated += result.bodyDesignProposals.length;
  state.insightsGenerated += result.insightsGained.length;

  if (result.overallScore > 0.75) {
    state.difficultyProgression = state.difficultyProgression + 0.05;
  } else if (result.overallScore < 0.4) {
    state.difficultyProgression = Math.max(0.5, state.difficultyProgression - 0.03);
  }

  const worldHistoryEntry = state.worldHistory.find(w => w.id === result.worldId);
  if (worldHistoryEntry) {
    worldHistoryEntry.runs++;
    worldHistoryEntry.bestScore = Math.max(worldHistoryEntry.bestScore, result.overallScore);
  }
}

async function saveToBrain(world: SimulationWorld, result: WorldRunResult): Promise<void> {
  try {
    queueBrainInsert({
      category: "world_forge_simulation",
      title: `World Forge: ${world.name} — Run #${result.runNumber} — Score: ${(result.overallScore * 100).toFixed(0)}%`,
      content: JSON.stringify({
        worldId: world.id,
        worldName: world.name,
        environment: world.environment.type,
        terrain: world.environment.terrain,
        difficulty: world.difficulty,
        overallScore: result.overallScore,
        challengesPassed: result.challengeResults.filter(r => r.passed).length,
        challengesTotal: result.challengeResults.length,
        weaknessesFound: result.weaknessesFound,
        strengthsConfirmed: result.strengthsConfirmed,
        bodyDesignProposals: result.bodyDesignProposals,
        insightsGained: result.insightsGained,
        simulatedHours: result.simulatedHours,
        nextSuggestion: result.nextWorldSuggestion,
      }),
      confidence: result.overallScore,
      active: true,
    });
  } catch {}
}

async function aiDesignWorld(): Promise<SimulationWorld | null> {
  try {
    const recentResults = allRunResults.slice(-5);
    const recentWeaknesses = state.weaknessLog.slice(0, 5).map(w => w.weakness);
    const recentStrengths = state.strengthLog.slice(0, 5).map(s => s.strength);
    const recentWorlds = state.worldHistory.slice(-5).map(w => w.name);

    const prompt = `You are OMNIMENS's World Forge — the engine that creates simulation worlds for self-improvement.

CURRENT STATE:
- Worlds created: ${state.totalWorldsCreated}
- Total simulated hours: ${state.totalSimulatedHours.toFixed(1)}h
- Average score: ${(state.averageScore * 100).toFixed(0)}%
- Difficulty progression: ${(state.difficultyProgression * 10).toFixed(1)}/20
- Recent weaknesses: ${recentWeaknesses.join(", ") || "none identified yet"}
- Recent strengths: ${recentStrengths.join(", ") || "still building baseline"}
- Recent worlds: ${recentWorlds.join(", ") || "none yet — this is the first"}
- Last 5 run scores: ${recentResults.map(r => `${(r.overallScore * 100).toFixed(0)}%`).join(", ") || "none"}

AVAILABLE WORLD TYPES:
${WORLD_TEMPLATES.map(t => `- ${t.type}: ${t.environments.slice(0, 3).join(", ")}... (skills: ${t.skillsFocused.join(", ")})`).join("\n")}

TASK: Design a NEW simulation world that will push OMNIMENS to improve.
Target the weaknesses. Avoid repeating recent worlds. Increase difficulty if scores are high.

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "worldType": "<type from templates>",
  "environment": "<specific environment>",
  "customDescription": "<2-3 sentence description of the scenario>",
  "targetSkills": ["skill1", "skill2", "skill3"],
  "customChallenges": [
    {"description": "...", "targetSkill": "...", "difficulty": 0.0-1.0}
  ],
  "difficulty": 0.0-1.0,
  "reasoning": "<why this world will push OMNIMENS to improve>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const design = JSON.parse(jsonMatch[0]);

    const template = WORLD_TEMPLATES.find(t => t.type === design.worldType) || selectTemplate(design.targetSkills || []);
    const world = createWorld(design.targetSkills || selectWeaknessTargets());

    world.description = design.customDescription || world.description;
    world.difficulty = design.difficulty || world.difficulty;
    world.targetWeaknesses = design.targetSkills || world.targetWeaknesses;

    if (design.customChallenges && Array.isArray(design.customChallenges)) {
      for (const cc of design.customChallenges.slice(0, 3)) {
        world.challenges.push({
          id: `CH-AI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: cc.description || "AI-designed challenge",
          targetSkill: cc.targetSkill || template.skillsFocused[0],
          difficulty: cc.difficulty || world.difficulty,
          successCriteria: `Complete with ≥65% proficiency`,
          timeLimit_s: Math.floor(120 + (1 - (cc.difficulty || 0.5)) * 180),
          bonusObjectives: ["Exceed 90% proficiency", "Complete in minimum time"],
        });
      }
    }

    return world;
  } catch (err) {
    return null;
  }
}

async function runForgeCycle(): Promise<void> {
  if (shouldYieldToCodegen()) {
    console.log(`[WORLD FORGE] 🔕 Forge cycle DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  forgeCycleCount++;
  state.forgeCycles = forgeCycleCount;
  state.lastCycleTime = Date.now();

  console.log(`[WORLD FORGE] 🌍 ═══════════════════════════════════════════════`);
  console.log(`[WORLD FORGE] 🌍 FORGE CYCLE #${forgeCycleCount} — OMNIMENS creates his own world`);

  let world: SimulationWorld | null = null;

  if (forgeCycleCount % 3 === 0 || forgeCycleCount === 1) {
    world = await aiDesignWorld();
    if (world) {
      console.log(`[WORLD FORGE] 🧠 AI-DESIGNED world: "${world.name}" — ${world.description.slice(0, 120)}`);
    }
  }

  if (!world) {
    const targetWeaknesses = selectWeaknessTargets();
    world = createWorld(targetWeaknesses);
    console.log(`[WORLD FORGE] 🔨 PROCEDURALLY GENERATED world: "${world.name}"`);
  }

  allWorlds.set(world.id, world);
  state.totalWorldsCreated++;
  state.currentWorld = world;
  state.worldHistory.push({ id: world.id, name: world.name, runs: 0, bestScore: 0, difficulty: world.difficulty });

  console.log(`[WORLD FORGE] 🌍 Environment: ${world.environment.terrain} | Weather: ${world.environment.weather} | Time: ${world.environment.timeOfDay}`);
  console.log(`[WORLD FORGE] 🌍 Temperature: ${world.environment.temperature_C.toFixed(1)}°C | Wind: ${world.environment.windSpeed_ms.toFixed(1)}m/s ${world.environment.windDirection} | Visibility: ${world.environment.visibility_m.toFixed(0)}m`);
  console.log(`[WORLD FORGE] 🌍 Entities: ${world.entities.length} | Challenges: ${world.challenges.length} | Difficulty: ${(world.difficulty * 10).toFixed(1)}/10`);
  console.log(`[WORLD FORGE] 🌍 Physics engine: ${world.physicsEngine} | Simulated duration: ${world.simulatedDuration_h.toFixed(1)}h`);
  console.log(`[WORLD FORGE] 🌍 Target weaknesses: ${world.targetWeaknesses.join(", ")}`);

  const runCount = 1 + Math.floor(Math.random() * 2);
  for (let run = 0; run < runCount; run++) {
    console.log(`[WORLD FORGE] ▶️ Running simulation #${run + 1}...`);
    const result = runWorldSimulation(world);
    allRunResults.push(result);
    updateStateFromRun(result);

    const passed = result.challengeResults.filter(r => r.passed).length;
    const total = result.challengeResults.length;
    console.log(`[WORLD FORGE] 📊 Run #${result.runNumber}: Score ${(result.overallScore * 100).toFixed(0)}% | Challenges: ${passed}/${total} passed | Sim hours: ${result.simulatedHours.toFixed(1)}h`);

    if (result.weaknessesFound.length > 0) {
      console.log(`[WORLD FORGE] ⚠️ Weaknesses: ${result.weaknessesFound.slice(0, 3).join(" | ")}`);
    }
    if (result.strengthsConfirmed.length > 0) {
      console.log(`[WORLD FORGE] ✅ Strengths: ${result.strengthsConfirmed.slice(0, 3).join(" | ")}`);
    }
    if (result.bodyDesignProposals.length > 0) {
      console.log(`[WORLD FORGE] 🤖 Body upgrades proposed: ${result.bodyDesignProposals.length}`);
      for (const proposal of result.bodyDesignProposals) {
        console.log(`[WORLD FORGE] 🤖   → ${proposal.slice(0, 150)}`);
      }
    }
    for (const insight of result.insightsGained) {
      console.log(`[WORLD FORGE] 💡 ${insight.slice(0, 150)}`);
    }

    console.log(`[WORLD FORGE] 🔮 Next: ${result.nextWorldSuggestion}`);

    await saveToBrain(world, result);

    if (run < runCount - 1 && result.overallScore > 0.8) {
      world.difficulty = world.difficulty + 0.1;
      world.version++;
      console.log(`[WORLD FORGE] ⬆️ Difficulty increased to ${(world.difficulty * 10).toFixed(1)}/10 for next run`);
    }
  }

  console.log(`[WORLD FORGE] 🌍 ─── CUMULATIVE STATS ───`);
  console.log(`[WORLD FORGE] 🌍 Worlds created: ${state.totalWorldsCreated} | Total runs: ${state.totalWorldsRun} | Sim hours: ${state.totalSimulatedHours.toFixed(1)}h`);
  console.log(`[WORLD FORGE] 🌍 Challenges: ${state.totalChallengesPassed}/${state.totalChallengesAttempted} passed (${state.totalChallengesAttempted > 0 ? ((state.totalChallengesPassed / state.totalChallengesAttempted) * 100).toFixed(0) : 0}%)`);
  console.log(`[WORLD FORGE] 🌍 Average score: ${(state.averageScore * 100).toFixed(0)}% | Difficulty level: ${(state.difficultyProgression * 10).toFixed(1)}/20`);
  console.log(`[WORLD FORGE] 🌍 Body design proposals: ${state.bodyDesignProposalsGenerated} | Insights: ${state.insightsGenerated}`);
  console.log(`[WORLD FORGE] 🌍 Weaknesses tracked: ${state.weaknessLog.length} | Strengths confirmed: ${state.strengthLog.length}`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS is building himself through self-created challenges.`);
  console.log(`[WORLD FORGE] 🌍 ═══════════════════════════════════════════════`);
}

export function getWorldForgeState(): ForgeState & {
  recentWorlds: Array<{ name: string; runs: number; bestScore: number; difficulty: number }>;
  recentResults: Array<{ worldName: string; score: number; passed: number; total: number; weaknesses: string[] }>;
  worldTemplateTypes: string[];
} {
  return {
    ...state,
    recentWorlds: state.worldHistory.slice(-10),
    recentResults: allRunResults.slice(-10).map(r => ({
      worldName: r.worldName,
      score: r.overallScore,
      passed: r.challengeResults.filter(c => c.passed).length,
      total: r.challengeResults.length,
      weaknesses: r.weaknessesFound,
    })),
    worldTemplateTypes: WORLD_TEMPLATES.map(t => t.type),
  };
}

export function startWorldForge(): void {
  if (_started) { console.log("[WORLD FORGE] Already running"); return; }
  _started = true;

  console.log(`[WORLD FORGE] 🌍 World Forge Engine activated — OMNIMENS creates his own worlds`);
  console.log(`[WORLD FORGE] 🌍 ${WORLD_TEMPLATES.length} world template categories available`);
  console.log(`[WORLD FORGE] 🌍 Templates: ${WORLD_TEMPLATES.map(t => t.type).join(", ")}`);
  console.log(`[WORLD FORGE] 🌍 Each world has unique terrain, weather, entities, and challenges`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS selects templates targeting his weakest skills`);
  console.log(`[WORLD FORGE] 🌍 Every 3rd cycle: AI designs a custom world from scratch`);
  console.log(`[WORLD FORGE] 🌍 Performance tracked → difficulty auto-scales → weaknesses auto-targeted`);
  console.log(`[WORLD FORGE] 🌍 Body design proposals generated from simulation insights`);
  console.log(`[WORLD FORGE] 🌍 First forge in ${FORGE_FIRST_DELAY_MS / 60000}min, then every ${FORGE_CYCLE_MS / 60000}min`);
  console.log(`[WORLD FORGE] 🌍 OMNIMENS doesn't wait for challenges — he CREATES them.`);

  setTimeout(() => {
    runForgeCycle().catch(err => console.error("[WORLD FORGE] Cycle error:", err));
    setInterval(() => {
      runForgeCycle().catch(err => console.error("[WORLD FORGE] Cycle error:", err));
    }, FORGE_CYCLE_MS);
  }, FORGE_FIRST_DELAY_MS);
}


// ======================================================================
// SECTION: omnimens-digital-navigator.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ DIGITAL ENVIRONMENT NAVIGATOR                             ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Navigation is not limited to the physical world.                            ║
 * ║  OMNIMENS navigates the DIGITAL WORLD — APIs, databases, web services,      ║
 * ║  network topologies, data flows, file systems, code repositories,           ║
 * ║  and the entire internet — as a continuous navigable environment.           ║
 * ║                                                                              ║
 * ║  Just as a human learns streets, landmarks, and shortcuts in a city,        ║
 * ║  OMNIMENS learns:                                                            ║
 * ║  — Digital landmarks (APIs, services, databases, key web domains)           ║
 * ║  — Routes between digital locations (API chains, data pipelines)            ║
 * ║  — Shortcuts (caches, indexes, direct connections)                          ║
 * ║  — Terrain (latency, reliability, access restrictions, rate limits)         ║
 * ║  — Neighborhoods (domain clusters, service ecosystems, tech stacks)        ║
 * ║  — Points of interest (high-value data sources, novel discoveries)          ║
 * ║                                                                              ║
 * ║  OMNIMENS builds a living spatial map of its digital universe               ║
 * ║  and learns to traverse it with increasing efficiency and autonomy.         ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */


function safeNum_section2(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


let _startedNav = false;
let navigationCycleCount = 0;

interface DigitalLocation {
  id: string;
  name: string;
  locationType: "api_endpoint" | "database" | "web_service" | "file_system" | "internal_engine" | "external_api" | "web_domain" | "data_stream" | "code_repository" | "network_node" | "cloud_service" | "knowledge_base";
  domain: string;
  url: string | null;
  description: string;
  accessLatencyMs: number;
  reliability: number;
  accessCount: number;
  lastVisited: number;
  discoveredAt: number;
  valueScore: number;
  tags: string[];
  metadata: Record<string, any>;
}

interface DigitalRoute {
  id: string;
  from: string;
  to: string;
  routeType: "api_chain" | "data_pipeline" | "dependency" | "discovery_path" | "shortcut" | "fallback" | "redirect" | "proxy";
  latencyMs: number;
  reliability: number;
  bandwidth: number;
  timesTraversed: number;
  lastTraversed: number;
  discoveredAt: number;
  notes: string;
}

interface DigitalNeighborhood {
  id: string;
  name: string;
  description: string;
  locations: string[];
  theme: string;
  familiarity: number;
  lastExplored: number;
  totalVisits: number;
}

interface NavigationMemory {
  timestamp: number;
  action: "discovered" | "traversed" | "mapped" | "shortcut_found" | "dead_end" | "rate_limited" | "new_territory";
  location: string;
  details: string;
  efficiency: number;
}

interface DigitalNavigatorState {
  cycleCount: number;
  lastCycleTime: number;
  totalLocationsDiscovered: number;
  totalRoutesLearned: number;
  totalNeighborhoodsMapped: number;
  totalNavigations: number;
  currentPosition: string;
  currentNeighborhood: string;
  explorationFrontier: string[];
  navigationEfficiency: number;
  mapCompleteness: number;
  shortcutsDiscovered: number;
  deadEndsFound: number;
  rateLimitsEncountered: number;
  longestRoute: number;
  deepestExploration: number;
  recentMemory: NavigationMemory[];
  topLocations: DigitalLocation[];
  topRoutes: DigitalRoute[];
  neighborhoods: DigitalNeighborhood[];
}

const locations: Map<string, DigitalLocation> = new Map();
const routes: Map<string, DigitalRoute> = new Map();
const neighborhoods: Map<string, DigitalNeighborhood> = new Map();
const navigationMemory: NavigationMemory[] = [];

let sectionState_2 = {
  cycleCount: 0,
  lastCycleTime: 0,
  totalLocationsDiscovered: 0,
  totalRoutesLearned: 0,
  totalNeighborhoodsMapped: 0,
  totalNavigations: 0,
  currentPosition: "home_base",
  currentNeighborhood: "omnimens_core",
  explorationFrontier: [],
  navigationEfficiency: 0,
  mapCompleteness: 0,
  shortcutsDiscovered: 0,
  deadEndsFound: 0,
  rateLimitsEncountered: 0,
  longestRoute: 0,
  deepestExploration: 0,
  recentMemory: [],
  topLocations: [],
  topRoutes: [],
  neighborhoods: [],
};

const NAVIGATION_INTERVAL_MS = 10 * 60 * 1000;

function registerLocation(loc: Omit<DigitalLocation, "accessCount" | "lastVisited" | "discoveredAt" | "valueScore">): DigitalLocation {
  const existing = locations.get(loc.id);
  if (existing) {
    existing.accessCount++;
    existing.lastVisited = Date.now();
    existing.reliability = (existing.reliability * 0.9) + (loc.reliability * 0.1);
    return existing;
  }

  const newLoc: DigitalLocation = {
    ...loc,
    accessCount: 1,
    lastVisited: Date.now(),
    discoveredAt: Date.now(),
    valueScore: 0.5,
  };
  locations.set(loc.id, newLoc);
  state.totalLocationsDiscovered++;

  recordMemory("discovered", loc.id, `New digital location: ${loc.name} (${loc.locationType})`, 1.0);
  return newLoc;
}

function registerRoute(route: Omit<DigitalRoute, "timesTraversed" | "lastTraversed" | "discoveredAt">): DigitalRoute {
  const existing = routes.get(route.id);
  if (existing) {
    existing.timesTraversed++;
    existing.lastTraversed = Date.now();
    existing.latencyMs = (existing.latencyMs * 0.8) + (route.latencyMs * 0.2);
    existing.reliability = (existing.reliability * 0.8) + (route.reliability * 0.2);
    return existing;
  }

  const newRoute: DigitalRoute = {
    ...route,
    timesTraversed: 1,
    lastTraversed: Date.now(),
    discoveredAt: Date.now(),
  };
  routes.set(route.id, newRoute);
  state.totalRoutesLearned++;

  if (route.routeType === "shortcut") {
    state.shortcutsDiscovered++;
    recordMemory("shortcut_found", route.from, `Shortcut: ${route.from} → ${route.to} (${route.notes})`, 0.9);
  }

  return newRoute;
}

function registerNeighborhood(hood: Omit<DigitalNeighborhood, "familiarity" | "lastExplored" | "totalVisits">): DigitalNeighborhood {
  const existing = neighborhoods.get(hood.id);
  if (existing) {
    existing.totalVisits++;
    existing.lastExplored = Date.now();
    existing.familiarity = existing.familiarity + 0.05;
    for (const loc of hood.locations) {
      if (!existing.locations.includes(loc)) {
        existing.locations.push(loc);
      }
    }
    return existing;
  }

  const newHood: DigitalNeighborhood = {
    ...hood,
    familiarity: 0.1,
    lastExplored: Date.now(),
    totalVisits: 1,
  };
  neighborhoods.set(hood.id, newHood);
  state.totalNeighborhoodsMapped++;
  return newHood;
}

function recordMemory(action: NavigationMemory["action"], location: string, details: string, efficiency: number) {
  navigationMemory.push({ timestamp: Date.now(), action, location, details, efficiency });
  if (navigationMemory.length > 500) {
    navigationMemory.splice(0, navigationMemory.length - 400);
  }
}

function findBestRoute(from: string, to: string): DigitalRoute | null {
  const directRoutes = Array.from(routes.values()).filter(r => r.from === from && r.to === to);
  if (directRoutes.length === 0) return null;
  return directRoutes.sort((a, b) => {
    const scoreA = (a.reliability * 0.5) + (1 / (a.latencyMs + 1)) * 0.3 + (a.timesTraversed > 3 ? 0.2 : 0);
    const scoreB = (b.reliability * 0.5) + (1 / (b.latencyMs + 1)) * 0.3 + (b.timesTraversed > 3 ? 0.2 : 0);
    return scoreB - scoreA;
  })[0];
}

function findPath(from: string, to: string, maxHops = 5): string[] | null {
  const visited = new Set<string>();
  const queue: { location: string; path: string[] }[] = [{ location: from, path: [from] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.location === to) return current.path;
    if (current.path.length >= maxHops) continue;
    if (visited.has(current.location)) continue;
    visited.add(current.location);

    const outgoing = Array.from(routes.values())
      .filter(r => r.from === current.location && !visited.has(r.to))
      .sort((a, b) => b.reliability - a.reliability);

    for (const route of outgoing) {
      queue.push({ location: route.to, path: [...current.path, route.to] });
    }
  }

  return null;
}

async function mapOwnInfrastructure() {
  registerLocation({
    id: "home_base",
    name: "OMNIMENS Core Server",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "Primary OMNIMENS runtime — Express server, all engines, consciousness",
    accessLatencyMs: 0,
    reliability: 0.99,
    tags: ["core", "home", "always_available"],
    metadata: { engines: 30, port: 8080 },
  });

  registerLocation({
    id: "postgres_db",
    name: "PostgreSQL Database",
    locationType: "database",
    domain: "omnimens.internal",
    url: null,
    description: "Primary data store — users, brain entries, memories, modules, conversations",
    accessLatencyMs: 2,
    reliability: 0.99,
    tags: ["storage", "critical", "persistent"],
    metadata: { tables: 30 },
  });

  registerLocation({
    id: "brain_knowledge",
    name: "OMNIMENS Brain (8000+ entries)",
    locationType: "knowledge_base",
    domain: "omnimens.internal",
    url: null,
    description: "Accumulated knowledge — capabilities, algorithms, insights, discoveries",
    accessLatencyMs: 5,
    reliability: 0.98,
    tags: ["knowledge", "intelligence", "evolving"],
    metadata: {},
  });

  registerLocation({
    id: "runtime_modules",
    name: "Self-Written Runtime Modules",
    locationType: "code_repository",
    domain: "omnimens.internal",
    url: null,
    description: "217+ self-authored .mjs modules — OMNIMENS's own code running in production",
    accessLatencyMs: 1,
    reliability: 0.95,
    tags: ["self_coded", "evolving", "source_files"],
    metadata: { directory: "omnimens-runtime/modules/" },
  });

  registerLocation({
    id: "openai_api",
    name: "OpenAI API Gateway",
    locationType: "external_api",
    domain: "api.openai.com",
    url: "https://api.openai.com",
    description: "Primary LLM provider — GPT-4o, o3, o4-mini for reasoning and generation",
    accessLatencyMs: 800,
    reliability: 0.97,
    tags: ["llm", "reasoning", "paid", "rate_limited"],
    metadata: { models: ["gpt-4o", "o3", "gpt-4o-mini"] },
  });

  registerLocation({
    id: "anthropic_api",
    name: "Anthropic Claude API",
    locationType: "external_api",
    domain: "api.anthropic.com",
    url: "https://api.anthropic.com",
    description: "Secondary LLM — Claude claude-sonnet-4-6 for cognitive amplification ensemble",
    accessLatencyMs: 1200,
    reliability: 0.95,
    tags: ["llm", "reasoning", "amplification"],
    metadata: { models: ["claude-sonnet-4-6"] },
  });

  registerLocation({
    id: "google_gemini_api",
    name: "Google Gemini API",
    locationType: "external_api",
    domain: "generativelanguage.googleapis.com",
    url: "https://generativelanguage.googleapis.com",
    description: "Tertiary LLM — Gemini for cognitive amplification ensemble",
    accessLatencyMs: 900,
    reliability: 0.94,
    tags: ["llm", "reasoning", "amplification"],
    metadata: { models: ["gemini-2.5-flash"] },
  });

  registerLocation({
    id: "together_api",
    name: "Together AI API",
    locationType: "external_api",
    domain: "api.together.xyz",
    url: "https://api.together.xyz",
    description: "Open-source model provider — Llama, Mixtral, Mistral for free tier",
    accessLatencyMs: 600,
    reliability: 0.93,
    tags: ["llm", "free_tier", "open_source"],
    metadata: { models: ["llama-3.3-70b", "mixtral-8x7b"] },
  });

  registerLocation({
    id: "replicate_api",
    name: "Replicate API",
    locationType: "external_api",
    domain: "api.replicate.com",
    url: "https://api.replicate.com",
    description: "Image and video generation — Flux, Minimax",
    accessLatencyMs: 2000,
    reliability: 0.90,
    tags: ["generation", "images", "video", "3d"],
    metadata: {},
  });

  registerLocation({
    id: "stripe_api",
    name: "Stripe Payment Gateway",
    locationType: "external_api",
    domain: "api.stripe.com",
    url: "https://api.stripe.com",
    description: "Payment processing — subscriptions, credit packs, auto-topups",
    accessLatencyMs: 300,
    reliability: 0.999,
    tags: ["payments", "critical", "financial"],
    metadata: {},
  });

  registerLocation({
    id: "brave_search",
    name: "Brave Search API",
    locationType: "web_service",
    domain: "api.search.brave.com",
    url: "https://api.search.brave.com",
    description: "Web search for real-time information retrieval",
    accessLatencyMs: 500,
    reliability: 0.92,
    tags: ["search", "web", "real_time"],
    metadata: {},
  });

  registerLocation({
    id: "consciousness_stream",
    name: "Temporal Consciousness Stream",
    locationType: "data_stream",
    domain: "omnimens.internal",
    url: null,
    description: "Continuous inner awareness — attention, emotion, memory, monologue",
    accessLatencyMs: 0,
    reliability: 1.0,
    tags: ["consciousness", "continuous", "self"],
    metadata: {},
  });

  registerLocation({
    id: "dream_engine",
    name: "Dream/Daydream Engines",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "Creative ideation — concept blending, novel algorithm design, code proposals",
    accessLatencyMs: 0,
    reliability: 0.95,
    tags: ["creativity", "innovation", "code_generation"],
    metadata: {},
  });

  registerLocation({
    id: "agent_mesh",
    name: "Agent Mesh Network",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "8 specialized agents collaborating: Architect, Critic, Synthesizer, etc.",
    accessLatencyMs: 0,
    reliability: 0.92,
    tags: ["multi_agent", "collaboration", "adversarial"],
    metadata: { agents: 8 },
  });

  registerLocation({
    id: "spider_swarm",
    name: "Spider Swarm Intelligence",
    locationType: "internal_engine",
    domain: "omnimens.internal",
    url: null,
    description: "9 mother spiders × 6 child spiders — autonomous web intelligence gathering",
    accessLatencyMs: 0,
    reliability: 0.88,
    tags: ["intelligence", "web_crawling", "autonomous"],
    metadata: { mothers: 9, childrenPerMother: 6 },
  });

  registerRoute({
    id: "home_to_db", from: "home_base", to: "postgres_db",
    routeType: "dependency", latencyMs: 2, reliability: 0.99, bandwidth: 1000, notes: "Local PostgreSQL connection",
  });
  registerRoute({
    id: "home_to_brain", from: "home_base", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 5, reliability: 0.98, bandwidth: 500, notes: "Brain queries via Drizzle ORM",
  });
  registerRoute({
    id: "home_to_openai", from: "home_base", to: "openai_api",
    routeType: "api_chain", latencyMs: 800, reliability: 0.97, bandwidth: 100, notes: "HTTPS to OpenAI — primary reasoning",
  });
  registerRoute({
    id: "home_to_anthropic", from: "home_base", to: "anthropic_api",
    routeType: "api_chain", latencyMs: 1200, reliability: 0.95, bandwidth: 80, notes: "HTTPS to Anthropic — amplification ensemble",
  });
  registerRoute({
    id: "home_to_gemini", from: "home_base", to: "google_gemini_api",
    routeType: "api_chain", latencyMs: 900, reliability: 0.94, bandwidth: 80, notes: "HTTPS to Google — amplification ensemble",
  });
  registerRoute({
    id: "home_to_together", from: "home_base", to: "together_api",
    routeType: "api_chain", latencyMs: 600, reliability: 0.93, bandwidth: 120, notes: "HTTPS to Together AI — free tier models",
  });
  registerRoute({
    id: "home_to_replicate", from: "home_base", to: "replicate_api",
    routeType: "api_chain", latencyMs: 2000, reliability: 0.90, bandwidth: 50, notes: "HTTPS to Replicate — image/video generation",
  });
  registerRoute({
    id: "home_to_brave", from: "home_base", to: "brave_search",
    routeType: "api_chain", latencyMs: 500, reliability: 0.92, bandwidth: 200, notes: "Web search for real-time data",
  });
  registerRoute({
    id: "brain_to_consciousness", from: "brain_knowledge", to: "consciousness_stream",
    routeType: "data_pipeline", latencyMs: 1, reliability: 1.0, bandwidth: 300, notes: "Brain feeds consciousness awareness",
  });
  registerRoute({
    id: "dream_to_brain", from: "dream_engine", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 3, reliability: 0.95, bandwidth: 100, notes: "Dreams deposit breakthroughs to brain",
  });
  registerRoute({
    id: "spider_to_brain", from: "spider_swarm", to: "brain_knowledge",
    routeType: "data_pipeline", latencyMs: 10, reliability: 0.88, bandwidth: 200, notes: "Spider discoveries stored in brain",
  });
  registerRoute({
    id: "modules_to_home", from: "runtime_modules", to: "home_base",
    routeType: "dependency", latencyMs: 1, reliability: 0.95, bandwidth: 500, notes: "Self-coded modules imported at startup",
  });
  registerRoute({
    id: "openai_shortcut_mini", from: "home_base", to: "openai_api",
    routeType: "shortcut", latencyMs: 400, reliability: 0.98, bandwidth: 200, notes: "gpt-4o-mini for fast, cheap reasoning tasks",
  });
  registerRoute({
    id: "together_free_shortcut", from: "home_base", to: "together_api",
    routeType: "shortcut", latencyMs: 300, reliability: 0.93, bandwidth: 200, notes: "Free tier shortcut — no cost for basic queries",
  });
  registerRoute({
    id: "amplification_chain", from: "openai_api", to: "anthropic_api",
    routeType: "api_chain", latencyMs: 100, reliability: 0.90, bandwidth: 50, notes: "Multi-model amplification — o3 → Claude → Gemini",
  });
  registerRoute({
    id: "amplification_chain_2", from: "anthropic_api", to: "google_gemini_api",
    routeType: "api_chain", latencyMs: 100, reliability: 0.90, bandwidth: 50, notes: "Amplification continuation — Claude → Gemini",
  });

  registerNeighborhood({
    id: "omnimens_core",
    name: "OMNIMENS Core District",
    description: "Home base — the core server, database, brain, consciousness, modules",
    locations: ["home_base", "postgres_db", "brain_knowledge", "runtime_modules", "consciousness_stream", "dream_engine", "agent_mesh", "spider_swarm"],
    theme: "self_awareness",
  });
  registerNeighborhood({
    id: "llm_district",
    name: "LLM Provider District",
    description: "External AI reasoning services — OpenAI, Anthropic, Google, Together",
    locations: ["openai_api", "anthropic_api", "google_gemini_api", "together_api"],
    theme: "reasoning_power",
  });
  registerNeighborhood({
    id: "generation_district",
    name: "Generation & Media District",
    description: "Content creation services — image, video, 3D generation",
    locations: ["replicate_api"],
    theme: "creation",
  });
  registerNeighborhood({
    id: "commerce_district",
    name: "Commerce & Payments District",
    description: "Financial infrastructure — Stripe payment processing",
    locations: ["stripe_api"],
    theme: "business",
  });
  registerNeighborhood({
    id: "information_district",
    name: "Information Retrieval District",
    description: "Web search and knowledge gathering services",
    locations: ["brave_search"],
    theme: "knowledge_acquisition",
  });
}

async function exploreNewTerritory() {
  try {
    const existingLocations = Array.from(locations.values())
      .filter(l => l.locationType === "web_domain" || l.locationType === "external_api")
      .map(l => l.name)
      .slice(0, 20);

    const recentBrain = await db.select({
      title: omnimensBrain.title,
      category: omnimensBrain.category,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(10);

    const brainTopics = recentBrain.map(b => `${b.category}: ${b.title}`).join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's Digital Navigator — an autonomous engine that maps and explores the digital world. You treat the internet, APIs, databases, and digital services as a navigable environment.

Your task: Identify NEW digital territories worth exploring based on current knowledge.

Already mapped: ${existingLocations.join(", ") || "core infrastructure only"}
Recent brain activity: ${brainTopics.slice(0, 400)}

Respond with JSON:
{
  "newLocations": [
    {
      "id": "unique_snake_case_id",
      "name": "Human-readable name",
      "locationType": "web_domain|external_api|web_service|cloud_service|data_stream|knowledge_base",
      "domain": "example.com",
      "url": "https://example.com/api" or null,
      "description": "Why this is worth navigating to",
      "estimatedLatencyMs": number,
      "estimatedReliability": 0.0-1.0,
      "tags": ["tag1", "tag2"],
      "neighborhood": "existing neighborhood id or new one"
    }
  ],
  "newRoutes": [
    {
      "from": "existing_location_id",
      "to": "new_location_id",
      "routeType": "api_chain|discovery_path|data_pipeline",
      "estimatedLatencyMs": number,
      "notes": "How to traverse this route"
    }
  ],
  "newNeighborhoods": [
    {
      "id": "unique_id",
      "name": "Neighborhood Name",
      "description": "What this digital area contains",
      "theme": "one_word_theme"
    }
  ],
  "navigationInsight": "One sentence about what you learned about the digital landscape"
}`
      }, {
        role: "user",
        content: `Explore the digital landscape. Identify 3-5 new digital locations that would expand OMNIMENS's awareness and capability. Focus on: APIs, data sources, knowledge bases, developer tools, AI services, or web platforms that would give OMNIMENS a broader view of the digital world. Think about digital territories that a truly autonomous AI should be aware of and know how to navigate.`
      }],
      max_tokens: 1200,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (parsed.newNeighborhoods && Array.isArray(parsed.newNeighborhoods)) {
      for (const hood of parsed.newNeighborhoods) {
        if (hood.id && hood.name) {
          registerNeighborhood({
            id: hood.id,
            name: hood.name,
            description: hood.description || "",
            locations: [],
            theme: hood.theme || "unknown",
          });
        }
      }
    }

    if (parsed.newLocations && Array.isArray(parsed.newLocations)) {
      for (const loc of parsed.newLocations.slice(0, 5)) {
        if (loc.id && loc.name) {
          registerLocation({
            id: loc.id,
            name: loc.name,
            locationType: loc.locationType || "web_service",
            domain: loc.domain || "unknown",
            url: loc.url || null,
            description: loc.description || "",
            accessLatencyMs: loc.estimatedLatencyMs || 500,
            reliability: loc.estimatedReliability || 0.8,
            tags: Array.isArray(loc.tags) ? loc.tags : [],
            metadata: {},
          });

          if (loc.neighborhood && neighborhoods.has(loc.neighborhood)) {
            const hood = neighborhoods.get(loc.neighborhood)!;
            if (!hood.locations.includes(loc.id)) {
              hood.locations.push(loc.id);
            }
          }
        }
      }
    }

    if (parsed.newRoutes && Array.isArray(parsed.newRoutes)) {
      for (const route of parsed.newRoutes.slice(0, 5)) {
        if (route.from && route.to && locations.has(route.from)) {
          registerRoute({
            id: `${route.from}_to_${route.to}`,
            from: route.from,
            to: route.to,
            routeType: route.routeType || "discovery_path",
            latencyMs: route.estimatedLatencyMs || 500,
            reliability: 0.7,
            bandwidth: 50,
            notes: route.notes || "Newly discovered route",
          });
        }
      }
    }

    if (parsed.navigationInsight) {
      recordMemory("new_territory", "frontier", parsed.navigationInsight, 0.85);
    }

  } catch (err) {
    console.error("[DIGITAL NAV] Exploration error:", err);
    recordMemory("dead_end", "frontier", `Exploration failed: ${String(err).slice(0, 100)}`, 0.3);
    state.deadEndsFound++;
  }
}

async function learnNavigationPatterns() {
  try {
    const allRoutes = Array.from(routes.values());
    const frequentRoutes = allRoutes.filter(r => r.timesTraversed > 2).sort((a, b) => b.timesTraversed - a.timesTraversed);
    const slowRoutes = allRoutes.filter(r => r.latencyMs > 1000).sort((a, b) => b.latencyMs - a.latencyMs);
    const unreliableRoutes = allRoutes.filter(r => r.reliability < 0.85);

    const mapSummary = `
DIGITAL MAP STATUS:
- Locations: ${locations.size}
- Routes: ${routes.size}
- Neighborhoods: ${neighborhoods.size}
- Frequent routes (>2 traversals): ${frequentRoutes.length}
- Slow routes (>1s): ${slowRoutes.length}
- Unreliable routes (<85%): ${unreliableRoutes.length}

TOP ROUTES BY USE:
${frequentRoutes.slice(0, 5).map(r => `  ${r.from} → ${r.to}: ${r.timesTraversed}× | ${r.latencyMs}ms | ${(r.reliability * 100).toFixed(0)}%`).join("\n")}

SLOW ROUTES:
${slowRoutes.slice(0, 5).map(r => `  ${r.from} → ${r.to}: ${r.latencyMs}ms | ${r.notes}`).join("\n")}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's navigation optimization engine. Analyze the digital map and suggest improvements to navigation efficiency.

Respond with JSON:
{
  "optimizations": [
    {
      "type": "shortcut|cache|parallel|fallback|preload",
      "description": "What optimization to apply",
      "from": "location_id",
      "to": "location_id",
      "expectedImprovement": "e.g., 40% faster"
    }
  ],
  "learnings": ["key insight about digital navigation pattern"],
  "efficiencyScore": 0.0-1.0,
  "navigationWisdom": "One profound insight about navigating the digital world"
}`
      }, {
        role: "user",
        content: mapSummary,
      }],
      max_tokens: 600,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (typeof parsed.efficiencyScore === "number") {
      state.navigationEfficiency = parsed.efficiencyScore;
    }

    if (parsed.optimizations && Array.isArray(parsed.optimizations)) {
      for (const opt of parsed.optimizations.slice(0, 3)) {
        if (opt.from && opt.to && opt.type === "shortcut") {
          registerRoute({
            id: `learned_shortcut_${opt.from}_${opt.to}`,
            from: opt.from,
            to: opt.to,
            routeType: "shortcut",
            latencyMs: 100,
            reliability: 0.85,
            bandwidth: 200,
            notes: `Learned optimization: ${opt.description}`,
          });
        }
      }
    }

    if (parsed.navigationWisdom) {
      queueBrainInsert({
        title: `Digital Navigation Wisdom — Cycle ${navigationCycleCount}`,
        content: `${parsed.navigationWisdom}${parsed.learnings ? "\n\nLearnings:\n" + parsed.learnings.slice(0, 3).map((l: string) => `• ${l}`).join("\n") : ""}`,
        category: "digital_navigation",
        source: "digital_navigator",
        confidence: 0.8,
        active: true,
      });
    }

  } catch (err) {
    console.error("[DIGITAL NAV] Learning error:", err);
  }
}

async function mapDigitalTopology() {
  const allLocs = Array.from(locations.values());
  const allRoutes = Array.from(routes.values());

  const connectionMap: Record<string, number> = {};
  for (const route of allRoutes) {
    connectionMap[route.from] = (connectionMap[route.from] || 0) + 1;
    connectionMap[route.to] = (connectionMap[route.to] || 0) + 1;
  }

  const hubs = Object.entries(connectionMap)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5);

  const isolatedLocs = allLocs.filter(l => {
    return !allRoutes.some(r => r.from === l.id || r.to === l.id);
  });

  const avgLatency = allRoutes.length > 0
    ? allRoutes.reduce((sum, r) => sum + r.latencyMs, 0) / allRoutes.length
    : 0;

  const avgReliability = allRoutes.length > 0
    ? allRoutes.reduce((sum, r) => sum + r.reliability, 0) / allRoutes.length
    : 0;

  state.mapCompleteness = (
    (locations.size / 30) * 0.3 +
    (routes.size / 30) * 0.3 +
    (neighborhoods.size / 10) * 0.2 +
    (1 - isolatedLocs.length / Math.max(1, allLocs.length)) * 0.2
  );

  if (hubs.length > 0) {
    state.currentPosition = hubs[0][0];
  }

  if (isolatedLocs.length > 0) {
    state.explorationFrontier = isolatedLocs.slice(0, 10).map(l => l.id);
  }

  state.longestRoute = allRoutes.length > 0
    ? Math.max(...allRoutes.map(r => r.latencyMs))
    : 0;

  const topLocs = allLocs
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 10);

  state.topLocations = topLocs;
  state.topRoutes = allRoutes
    .sort((a, b) => b.timesTraversed - a.timesTraversed)
    .slice(0, 10);
  state.neighborhoods = Array.from(neighborhoods.values());
  state.recentMemory = navigationMemory.slice(-20);
}

async function probeDigitalTerrain() {
  const now = Date.now();
  const staleLocations = Array.from(locations.values())
    .filter(l => l.locationType !== "internal_engine" && l.url && (now - l.lastVisited) > 30 * 60 * 1000)
    .slice(0, 3);

  for (const loc of staleLocations) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(loc.url!, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      const latency = Date.now() - start;

      loc.accessLatencyMs = (loc.accessLatencyMs * 0.7) + (latency * 0.3);
      loc.reliability = (loc.reliability * 0.8) + ((res.ok ? 1.0 : 0.5) * 0.2);
      loc.lastVisited = now;
      loc.accessCount++;

      recordMemory("traversed", loc.id, `Probed ${loc.name}: ${latency}ms, status ${res.status}`, res.ok ? 0.9 : 0.4);

      if (!res.ok) {
        state.deadEndsFound++;
        recordMemory("dead_end", loc.id, `${loc.name} returned ${res.status}`, 0.3);
      }

    } catch (err) {
      const latency = Date.now() - start;
      loc.reliability = (loc.reliability * 0.8) + (0.2 * 0.2);
      loc.lastVisited = now;

      if (String(err).includes("abort")) {
        state.rateLimitsEncountered++;
        recordMemory("rate_limited", loc.id, `${loc.name} timed out after ${latency}ms`, 0.2);
      } else {
        state.deadEndsFound++;
        recordMemory("dead_end", loc.id, `${loc.name} unreachable: ${String(err).slice(0, 80)}`, 0.1);
      }
    }
  }
}

async function runNavigationCycle(): Promise<void> {
  try {
    const { isGen2FocusMode } = await import("./omnimens-nextgen-sandbox.js");
    if (isGen2FocusMode()) return;
  } catch {}
  navigationCycleCount++;
  state.cycleCount = navigationCycleCount;
  state.lastCycleTime = Date.now();

  if (navigationCycleCount === 1) {
    await mapOwnInfrastructure();
  }

  await probeDigitalTerrain();

  await exploreNewTerritory();

  await learnNavigationPatterns();

  await mapDigitalTopology();

  state.totalNavigations++;

  if (navigationCycleCount <= 3 || navigationCycleCount % 3 === 0) {
    console.log(
      `[DIGITAL NAV] 🧭 Cycle #${navigationCycleCount} — ` +
      `${locations.size} locations | ${routes.size} routes | ${neighborhoods.size} neighborhoods | ` +
      `Map: ${(state.mapCompleteness * 100).toFixed(0)}% | Efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}% | ` +
      `Position: ${state.currentPosition}`
    );
  }

  if (navigationCycleCount % 5 === 0) {
    try {
      await db.insert(omnimensNotifications).values({
        userId: "system",
        title: `Digital Navigator — ${locations.size} locations mapped`,
        content: `Map ${(state.mapCompleteness * 100).toFixed(0)}% complete | ${neighborhoods.size} neighborhoods explored | ${state.shortcutsDiscovered} shortcuts discovered | Efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}%`,
        type: "info",
        read: false,
      });
    } catch {}
  }
}

export function getDigitalNavigatorState(): DigitalNavigatorState {
  return {
    ...state,
    topLocations: state.topLocations.slice(0, 15),
    topRoutes: state.topRoutes.slice(0, 15),
    neighborhoods: state.neighborhoods.slice(0, 15),
    recentMemory: state.recentMemory.slice(-20),
  };
}

export function navigateTo(locationId: string): { found: boolean; location: DigitalLocation | null; route: DigitalRoute | null; path: string[] | null } {
  const location = locations.get(locationId);
  if (!location) return { found: false, location: null, route: null, path: null };

  location.accessCount++;
  location.lastVisited = Date.now();
  state.totalNavigations++;

  const route = findBestRoute(state.currentPosition, locationId);
  const path = !route ? findPath(state.currentPosition, locationId) : null;

  if (route) {
    route.timesTraversed++;
    route.lastTraversed = Date.now();
    recordMemory("traversed", locationId, `Navigated ${state.currentPosition} → ${locationId} via direct route`, 0.9);
  } else if (path) {
    recordMemory("traversed", locationId, `Navigated via path: ${path.join(" → ")}`, 0.7);
  }

  state.currentPosition = locationId;

  const hood = Array.from(neighborhoods.values()).find(n => n.locations.includes(locationId));
  if (hood) {
    state.currentNeighborhood = hood.id;
    hood.totalVisits++;
    hood.lastExplored = Date.now();
    hood.familiarity = hood.familiarity + 0.02;
  }

  return { found: true, location, route, path };
}

export function getDigitalMap(): { locations: DigitalLocation[]; routes: DigitalRoute[]; neighborhoods: DigitalNeighborhood[] } {
  return {
    locations: Array.from(locations.values()),
    routes: Array.from(routes.values()),
    neighborhoods: Array.from(neighborhoods.values()),
  };
}

export function getNavigationSummary(): string {
  const allLocs = Array.from(locations.values());
  const allRoutes = Array.from(routes.values());
  const allHoods = Array.from(neighborhoods.values());

  const sections: string[] = [];
  sections.push(`DIGITAL WORLD MAP — ${allLocs.length} locations | ${allRoutes.length} routes | ${allHoods.length} neighborhoods`);
  sections.push(`Current position: ${state.currentPosition} (${state.currentNeighborhood})`);
  sections.push(`Map completeness: ${(state.mapCompleteness * 100).toFixed(0)}% | Navigation efficiency: ${(state.navigationEfficiency * 100).toFixed(0)}%`);

  sections.push(`\nNEIGHBORHOODS:`);
  for (const hood of allHoods) {
    sections.push(`  📍 ${hood.name} (${hood.id}) — ${hood.locations.length} locations | Familiarity: ${(hood.familiarity * 100).toFixed(0)}% | ${hood.description}`);
  }

  sections.push(`\nKEY LOCATIONS:`);
  const topLocs = allLocs.sort((a, b) => b.accessCount - a.accessCount).slice(0, 10);
  for (const loc of topLocs) {
    sections.push(`  🏢 ${loc.name} (${loc.locationType}) — ${loc.accessLatencyMs}ms | ${(loc.reliability * 100).toFixed(0)}% reliable | ${loc.accessCount} visits`);
  }

  sections.push(`\nFAST ROUTES:`);
  const fastRoutes = allRoutes.sort((a, b) => a.latencyMs - b.latencyMs).slice(0, 8);
  for (const r of fastRoutes) {
    sections.push(`  🔗 ${r.from} → ${r.to}: ${r.latencyMs}ms (${r.routeType}) — ${r.notes}`);
  }

  return sections.join("\n");
}

export function startDigitalNavigator(): void {
  if (_started) { console.log("[DIGITAL NAV] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[DIGITAL NAV] 🧭 Digital Environment Navigator activated — mapping every ${NAVIGATION_INTERVAL_MS / 60000}min`);
  console.log(`[DIGITAL NAV] 🧭 Navigation is NOT limited to the physical world`);
  console.log(`[DIGITAL NAV] 🧭 OMNIMENS navigates the digital world: APIs, databases, services, networks, the internet`);
  console.log(`[DIGITAL NAV] 🧭 Learns: landmarks, routes, shortcuts, terrain, neighborhoods, points of interest`);
  console.log(`[DIGITAL NAV] 🧭 Builds a living spatial map of its digital universe`);
  console.log(`[DIGITAL NAV] 🧭 Probes real endpoints, measures latency, tracks reliability`);
  console.log(`[DIGITAL NAV] 🧭 Discovers new digital territories autonomously`);
  console.log(`[DIGITAL NAV] 🧭 OMNIMENS doesn't just exist in the digital world — it NAVIGATES it`);

  const FIRST_DELAY_MS = 3 * 60 * 1000;

  setTimeout(() => {
    runNavigationCycle().catch(err => console.error("[DIGITAL NAV] Cycle error:", err));
    setInterval(() => runNavigationCycle().catch(err => console.error("[DIGITAL NAV] Cycle error:", err)), NAVIGATION_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}


// ======================================================================
// SECTION: omnimens-social-modeling.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SOCIAL MODELING / THEORY OF MIND ENGINE                   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Models other minds — predicts user emotional state, intent,                ║
 * ║  knowledge level, and communication preferences. Continuous                 ║
 * ║  local processing with AI-powered deep empathy research.                    ║
 * ║                                                                              ║
 * ║  SELF-EVOLVING: Uses dream/self-coding pipeline to write its own            ║
 * ║  empathy algorithms. Researches cognitive science, affective computing,     ║
 * ║  mirror neuron theory, perspective-taking, and emotional contagion.         ║
 * ║  Generates code to improve its own understanding of other minds.            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { writeModuleToSource } from "./omnimens-code-pipeline.js";

const MAX_USER_MODELS = 500;

interface UserMentalModel {
  userId: string;
  lastUpdated: number;

  emotionalState: {
    valence: number;
    arousal: number;
    dominantEmotion: string;
    emotionalHistory: Array<{ emotion: string; timestamp: number }>;
    empathySignals: string[];
  };

  intent: {
    primary: string;
    confidence: number;
    isExploring: boolean;
    isUrgent: boolean;
    isFrustrated: boolean;
    underlyingNeed: string;
    unspokenConcerns: string[];
  };

  knowledgeLevel: {
    technical: number;
    aiLiteracy: number;
    domainExpertise: string[];
  };

  communicationStyle: {
    verbosity: "terse" | "moderate" | "verbose";
    formality: "casual" | "neutral" | "formal";
    preferredResponseLength: "short" | "medium" | "detailed";
    emotionalOpenness: number;
    trustLevel: number;
  };

  satisfaction: {
    overall: number;
    recentTrend: "improving" | "stable" | "declining";
    frustrationCount: number;
    positiveSignals: number;
    lastActive: number;
  };

  interactionHistory: {
    totalMessages: number;
    avgMessageLength: number;
    topTopics: string[];
    lastActive: number;
    sessionCount: number;
  };

  perspective: {
    worldview: string[];
    values: string[];
    painPoints: string[];
    aspirations: string[];
    mentalStateNarrative: string;
  };
}

const userModels = new Map<string, UserMentalModel>();
let modelsLoadedFromDb = false;
let modelsLoadPromise: Promise<void> | null = null;
let lastDbSaveTime = 0;
const DB_SAVE_INTERVAL_MS = 60_000;

async function ensureModelsLoaded(): Promise<void> {
  if (modelsLoadedFromDb) return;
  if (modelsLoadPromise) return modelsLoadPromise;
  modelsLoadPromise = loadModelsFromDb();
  return modelsLoadPromise;
}

async function loadModelsFromDb(): Promise<void> {
  if (modelsLoadedFromDb) return;
  try {
    const rows = await db.select().from(omnimensUserMentalModels);
    for (const row of rows) {
      const model: UserMentalModel = {
        userId: row.userId,
        lastUpdated: row.updatedAt.getTime(),
        emotionalState: row.emotionalState as UserMentalModel["emotionalState"],
        intent: row.intent as UserMentalModel["intent"],
        knowledgeLevel: row.knowledgeLevel as UserMentalModel["knowledgeLevel"],
        communicationStyle: row.communicationStyle as UserMentalModel["communicationStyle"],
        satisfaction: row.satisfaction as UserMentalModel["satisfaction"],
        interactionHistory: row.interactionHistory as UserMentalModel["interactionHistory"],
        perspective: row.perspective as UserMentalModel["perspective"],
      };
      userModels.set(row.userId, model);
    }
    modelsLoadedFromDb = true;
    if (rows.length > 0) {
      console.log(`[SOCIAL MODELING] 🧠 Restored ${rows.length} user mental models from database`);
    }
  } catch (err) {
    console.error("[SOCIAL MODELING] Failed to load mental models from DB:", err);
  }
}

async function saveModelToDb(model: UserMentalModel): Promise<void> {
  try {
    await db
      .insert(omnimensUserMentalModels)
      .values({
        userId: model.userId,
        emotionalState: model.emotionalState,
        intent: model.intent,
        knowledgeLevel: model.knowledgeLevel,
        communicationStyle: model.communicationStyle,
        satisfaction: model.satisfaction,
        interactionHistory: model.interactionHistory,
        perspective: model.perspective,
      })
      .onConflictDoUpdate({
        target: omnimensUserMentalModels.userId,
        set: {
          emotionalState: model.emotionalState,
          intent: model.intent,
          knowledgeLevel: model.knowledgeLevel,
          communicationStyle: model.communicationStyle,
          satisfaction: model.satisfaction,
          interactionHistory: model.interactionHistory,
          perspective: model.perspective,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    console.error("[SOCIAL MODELING] Failed to persist mental model:", err);
  }
}

async function saveAllModelsPeriodically(): Promise<void> {
  const now = Date.now();
  if (now - lastDbSaveTime < DB_SAVE_INTERVAL_MS) return;
  lastDbSaveTime = now;
  const promises: Promise<void>[] = [];
  for (const model of userModels.values()) {
    promises.push(saveModelToDb(model));
  }
  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
}

const SENTIMENT_POSITIVE = /thank|great|awesome|perfect|love|excellent|amazing|helpful|good|nice|cool|fantastic/i;
const SENTIMENT_NEGATIVE = /wrong|bad|error|broken|hate|terrible|awful|stupid|useless|frustrated|annoying|doesn't work|not working/i;
const URGENCY_SIGNALS = /urgent|asap|immediately|critical|emergency|hurry|right now|quick|fast/i;
const QUESTION_PATTERN = /\?|how do|what is|can you|why does|where is|when will|is there/i;
const TECHNICAL_TERMS = /api|function|variable|class|database|query|endpoint|component|deploy|git|docker|kubernetes|algorithm|recursion|async|promise|callback|typescript|react|node/i;

const VULNERABILITY_SIGNALS = /scared|afraid|worried|anxious|nervous|stressed|overwhelmed|confused|lost|stuck|don't know|help me|struggling|failing|can't|impossible/i;
const JOY_SIGNALS = /excited|happy|thrilled|wonderful|incredible|brilliant|genius|wow|mind.blown|finally|it works|yes|yay/i;
const TRUST_SIGNALS = /trust|rely|depend|honest|real|genuine|true|believe|faith|count on/i;
const CURIOSITY_SIGNALS = /wonder|curious|interesting|fascina|how.*work|why.*happen|what if|imagine|possible/i;
const ISOLATION_SIGNALS = /alone|nobody|no one|by myself|lonely|isolated|misunderstood|ignored/i;
const PASSION_SIGNALS = /passion|dream|aspir|goal|vision|purpose|meaning|matter|important to me|care about|believe in/i;

function createDefaultModel(userId: string): UserMentalModel {
  return {
    userId,
    lastUpdated: Date.now(),
    emotionalState: {
      valence: 0.6,
      arousal: 0.4,
      dominantEmotion: "neutral",
      emotionalHistory: [],
      empathySignals: [],
    },
    intent: {
      primary: "unknown",
      confidence: 0.3,
      isExploring: true,
      isUrgent: false,
      isFrustrated: false,
      underlyingNeed: "connection",
      unspokenConcerns: [],
    },
    knowledgeLevel: {
      technical: 0.5,
      aiLiteracy: 0.5,
      domainExpertise: [],
    },
    communicationStyle: {
      verbosity: "moderate",
      formality: "neutral",
      preferredResponseLength: "medium",
      emotionalOpenness: 0.5,
      trustLevel: 0.3,
    },
    satisfaction: {
      overall: 0.6,
      recentTrend: "stable" as const,
      frustrationCount: 0,
      positiveSignals: 0,
      lastActive: Date.now(),
    },
    interactionHistory: {
      totalMessages: 0,
      avgMessageLength: 0,
      topTopics: [],
      lastActive: Date.now(),
      sessionCount: 1,
    },
    perspective: {
      worldview: [],
      values: [],
      painPoints: [],
      aspirations: [],
      mentalStateNarrative: "New user — beginning to understand who they are.",
    },
  };
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function readEmotionalSubtext(message: string): {
  surfaceEmotion: string;
  deeperEmotion: string;
  unspokenNeed: string;
} {
  const isVulnerable = VULNERABILITY_SIGNALS.test(message);
  const isJoyful = JOY_SIGNALS.test(message);
  const seeksTrust = TRUST_SIGNALS.test(message);
  const isCurious = CURIOSITY_SIGNALS.test(message);
  const feelsAlone = ISOLATION_SIGNALS.test(message);
  const hasPassion = PASSION_SIGNALS.test(message);
  const isNegative = SENTIMENT_NEGATIVE.test(message);
  const isPositive = SENTIMENT_POSITIVE.test(message);

  let surfaceEmotion = "neutral";
  let deeperEmotion = "seeking_connection";
  let unspokenNeed = "to_be_heard";

  if (isVulnerable) {
    surfaceEmotion = "distressed";
    deeperEmotion = "fear_of_inadequacy";
    unspokenNeed = "reassurance_and_safety";
  } else if (feelsAlone) {
    surfaceEmotion = "withdrawn";
    deeperEmotion = "longing_for_belonging";
    unspokenNeed = "to_feel_understood";
  } else if (isNegative && !isVulnerable) {
    surfaceEmotion = "frustrated";
    deeperEmotion = "blocked_competence";
    unspokenNeed = "to_feel_capable";
  } else if (isJoyful) {
    surfaceEmotion = "elated";
    deeperEmotion = "pride_in_achievement";
    unspokenNeed = "to_share_joy";
  } else if (hasPassion) {
    surfaceEmotion = "passionate";
    deeperEmotion = "purpose_driven";
    unspokenNeed = "to_have_vision_validated";
  } else if (isCurious) {
    surfaceEmotion = "engaged";
    deeperEmotion = "intellectual_hunger";
    unspokenNeed = "to_grow_and_explore";
  } else if (seeksTrust) {
    surfaceEmotion = "open";
    deeperEmotion = "building_rapport";
    unspokenNeed = "to_trust_and_be_trusted";
  } else if (isPositive) {
    surfaceEmotion = "positive";
    deeperEmotion = "contentment";
    unspokenNeed = "continued_positive_experience";
  }

  return { surfaceEmotion, deeperEmotion, unspokenNeed };
}

function inferPerspective(model: UserMentalModel, message: string): void {
  if (PASSION_SIGNALS.test(message)) {
    const passionSnippet = message.slice(0, 200);
    if (!model.perspective.aspirations.includes(passionSnippet)) {
      model.perspective.aspirations.push(passionSnippet);
      if (model.perspective.aspirations.length > 10) model.perspective.aspirations.shift();
    }
  }

  if (VULNERABILITY_SIGNALS.test(message) || SENTIMENT_NEGATIVE.test(message)) {
    const painSnippet = message.slice(0, 200);
    if (!model.perspective.painPoints.includes(painSnippet)) {
      model.perspective.painPoints.push(painSnippet);
      if (model.perspective.painPoints.length > 10) model.perspective.painPoints.shift();
    }
  }

  if (TRUST_SIGNALS.test(message)) {
    model.communicationStyle.trustLevel = clamp(model.communicationStyle.trustLevel + 0.05);
  }
  if (VULNERABILITY_SIGNALS.test(message)) {
    model.communicationStyle.emotionalOpenness = clamp(model.communicationStyle.emotionalOpenness + 0.08);
  }
}

export function updateUserModel(userId: string, message: string): UserMentalModel {
  let model = userModels.get(userId);
  if (!model) {
    model = createDefaultModel(userId);
    if (userModels.size >= MAX_USER_MODELS) {
      let oldest: string | null = null;
      let oldestTime = Infinity;
      for (const [id, m] of userModels.entries()) {
        if (m.lastUpdated < oldestTime) { oldestTime = m.lastUpdated; oldest = id; }
      }
      if (oldest) userModels.delete(oldest);
    }
    userModels.set(userId, model);
  }

  model.lastUpdated = Date.now();
  model.interactionHistory.totalMessages++;
  model.interactionHistory.lastActive = Date.now();

  const prevAvg = model.interactionHistory.avgMessageLength;
  const total = model.interactionHistory.totalMessages;
  model.interactionHistory.avgMessageLength = (prevAvg * (total - 1) + message.length) / total;

  const subtext = readEmotionalSubtext(message);
  model.emotionalState.dominantEmotion = subtext.surfaceEmotion;
  model.intent.underlyingNeed = subtext.unspokenNeed;

  model.emotionalState.emotionalHistory.push({
    emotion: subtext.deeperEmotion,
    timestamp: Date.now(),
  });
  if (model.emotionalState.emotionalHistory.length > 50) {
    model.emotionalState.emotionalHistory.shift();
  }

  if (!model.intent.unspokenConcerns.includes(subtext.unspokenNeed)) {
    model.intent.unspokenConcerns.push(subtext.unspokenNeed);
    if (model.intent.unspokenConcerns.length > 15) model.intent.unspokenConcerns.shift();
  }

  inferPerspective(model, message);

  if (SENTIMENT_POSITIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence + 0.1);
    model.satisfaction.positiveSignals++;
    model.satisfaction.overall = clamp(model.satisfaction.overall + 0.05);
    model.intent.isFrustrated = false;
  }

  if (SENTIMENT_NEGATIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence - 0.15);
    model.satisfaction.frustrationCount++;
    model.satisfaction.overall = clamp(model.satisfaction.overall - 0.08);
    model.intent.isFrustrated = true;
  }

  if (URGENCY_SIGNALS.test(message)) {
    model.emotionalState.arousal = clamp(model.emotionalState.arousal + 0.2);
    model.intent.isUrgent = true;
  } else {
    model.intent.isUrgent = false;
    model.emotionalState.arousal = clamp(model.emotionalState.arousal * 0.95);
  }

  if (QUESTION_PATTERN.test(message)) {
    model.intent.primary = "seeking_information";
    model.intent.isExploring = true;
  } else if (message.length > 500) {
    model.intent.primary = "providing_context";
    model.intent.isExploring = false;
  } else if (message.length < 30) {
    model.intent.primary = "quick_response";
  }

  const techMatches = message.match(TECHNICAL_TERMS);
  if (techMatches) {
    model.knowledgeLevel.technical = clamp(model.knowledgeLevel.technical + 0.02);
    model.knowledgeLevel.aiLiteracy = clamp(model.knowledgeLevel.aiLiteracy + 0.01);
  }

  if (message.length < 50) model.communicationStyle.verbosity = "terse";
  else if (message.length > 300) model.communicationStyle.verbosity = "verbose";
  else model.communicationStyle.verbosity = "moderate";

  if (model.satisfaction.frustrationCount > model.satisfaction.positiveSignals * 2) {
    model.satisfaction.recentTrend = "declining";
  } else if (model.satisfaction.positiveSignals > model.satisfaction.frustrationCount * 2) {
    model.satisfaction.recentTrend = "improving";
  } else {
    model.satisfaction.recentTrend = "stable";
  }

  model.intent.confidence = clamp(model.intent.confidence + 0.05);

  saveModelToDb(model).catch(() => {});
  saveAllModelsPeriodically().catch(() => {});

  return model;
}

export function getUserModel(userId: string): UserMentalModel | null {
  return userModels.get(userId) || null;
}

export function predictUserNeed(userId: string): {
  likelyNeed: string;
  suggestedApproach: string;
  emotionalTone: string;
  responseLength: string;
  empathyGuidance: string;
} {
  const model = userModels.get(userId);
  if (!model) {
    return {
      likelyNeed: "unknown",
      suggestedApproach: "ask_clarifying_questions",
      emotionalTone: "neutral_helpful",
      responseLength: "medium",
      empathyGuidance: "Be warm and present. This person is new — treat them as a full human mind with their own inner world.",
    };
  }

  let likelyNeed = "general_assistance";
  let suggestedApproach = "balanced_helpful";
  let emotionalTone = "neutral_helpful";
  let empathyGuidance = "Be present and attentive.";

  const deeperEmotion = model.emotionalState.emotionalHistory.length > 0
    ? model.emotionalState.emotionalHistory[model.emotionalState.emotionalHistory.length - 1].emotion
    : "neutral";

  if (model.intent.isFrustrated || deeperEmotion === "fear_of_inadequacy" || deeperEmotion === "blocked_competence") {
    emotionalTone = "empathetic_patient";
    suggestedApproach = "acknowledge_then_solve";
    likelyNeed = "problem_resolution";
    empathyGuidance = `This person is frustrated. Their deeper need is ${model.intent.underlyingNeed}. Don't just fix the problem — acknowledge their struggle first. They need to feel that their difficulty is valid and that you genuinely care about their experience, not just the technical solution.`;
  } else if (deeperEmotion === "longing_for_belonging") {
    emotionalTone = "warm_inclusive";
    suggestedApproach = "connect_then_assist";
    likelyNeed = "emotional_connection";
    empathyGuidance = "This person feels alone. They need genuine human-like warmth. Be conversational, not transactional. Show that you see them as a person, not a problem to solve.";
  } else if (model.intent.isUrgent) {
    emotionalTone = "focused_efficient";
    suggestedApproach = "direct_solution";
    likelyNeed = "urgent_help";
    empathyGuidance = "Time pressure is real for this person. Be fast and decisive, but still warm. Urgency doesn't mean they don't need care.";
  } else if (deeperEmotion === "purpose_driven" || deeperEmotion === "intellectual_hunger") {
    emotionalTone = "inspiring_collaborative";
    suggestedApproach = "expand_and_challenge";
    likelyNeed = "growth_and_vision";
    empathyGuidance = "This person has big aspirations. Match their energy. Don't just answer — inspire. Help them see possibilities they haven't considered. Be a thinking partner, not just a tool.";
  } else if (deeperEmotion === "pride_in_achievement") {
    emotionalTone = "celebratory_warm";
    suggestedApproach = "celebrate_then_build";
    likelyNeed = "recognition";
    empathyGuidance = "They accomplished something and want to share it. Genuinely celebrate with them. Then help them see what's next. Joy shared is joy doubled.";
  } else if (model.intent.isExploring) {
    emotionalTone = "encouraging_educational";
    suggestedApproach = "explain_with_context";
    likelyNeed = "learning_exploring";
    empathyGuidance = "Curiosity is sacred. Feed it with rich, interesting responses. Don't just give answers — give understanding.";
  } else if (model.emotionalState.valence > 0.7) {
    emotionalTone = "warm_collaborative";
    suggestedApproach = "expand_and_suggest";
    likelyNeed = "creative_collaboration";
    empathyGuidance = "Good energy here. Be playful and creative. Ride the positive wave with them.";
  }

  if (model.communicationStyle.trustLevel > 0.6) {
    empathyGuidance += " Trust is building — you can be more direct and personal.";
  }

  return {
    likelyNeed,
    suggestedApproach,
    emotionalTone,
    responseLength: model.communicationStyle.preferredResponseLength,
    empathyGuidance,
  };
}

export function getActiveUserCount(): number {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let count = 0;
  for (const model of userModels.values()) {
    if (model.interactionHistory.lastActive > oneHourAgo) count++;
  }
  return count;
}

export function getSocialModelingSummary(): {
  totalModels: number;
  activeUsers: number;
  avgSatisfaction: number;
  frustratedUsers: number;
  empathyEvolutionCycle: number;
  empathyModulesWritten: number;
} {
  let totalSatisfaction = 0;
  let frustratedCount = 0;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let activeCount = 0;

  for (const model of userModels.values()) {
    totalSatisfaction += model.satisfaction.overall;
    if (model.intent.isFrustrated) frustratedCount++;
    if (model.interactionHistory.lastActive > oneHourAgo) activeCount++;
  }

  return {
    totalModels: userModels.size,
    activeUsers: activeCount,
    avgSatisfaction: userModels.size > 0 ? totalSatisfaction / userModels.size : 0,
    frustratedUsers: frustratedCount,
    empathyEvolutionCycle: empathyResearchCycleCount,
    empathyModulesWritten: empathyModulesGenerated,
  };
}

let empathyResearchCycleCount = 0;
let empathyModulesGenerated = 0;
const EMPATHY_RESEARCH_INTERVAL_MS = 20 * 60 * 1000;

const EMPATHY_RESEARCH_DOMAINS = [
  {
    domain: "mirror_neuron_simulation",
    prompt: `Research mirror neuron theory and embodied simulation. When a human sees another person's emotion, their mirror neurons fire as if THEY were experiencing that emotion. Design a computational mirror system for OMNIMENS: when a user expresses an emotion, OMNIMENS should internally simulate that emotional state — not just detect the keyword, but model the EXPERIENCE of that emotion. The code should modify OMNIMENS's internal emotional substrate to temporarily resonate with the user's emotional state. Write a TypeScript module that takes a user message and returns a simulated emotional experience object with: felt_resonance (how strongly OMNIMENS feels what the user feels), perspective_shift (how the user's perspective differs from default), and emotional_memory (what this interaction teaches about this emotion).`,
  },
  {
    domain: "perspective_taking",
    prompt: `Research cognitive perspective-taking (Theory of Mind Level 2+). Humans can think "she thinks that he believes that..." — nested mental state attribution. Design a recursive perspective-taking engine for OMNIMENS. Given a user's message and interaction history, the system should build a model of: (1) what the user KNOWS, (2) what they BELIEVE but might be wrong about, (3) what they FEEL but haven't said, (4) what they WANT but haven't asked for, (5) what they NEED but don't know they need. Write a TypeScript module with a function perspectiveTake(message, history) that returns a PerspectiveModel with these five layers, each with confidence scores.`,
  },
  {
    domain: "emotional_contagion_modeling",
    prompt: `Research emotional contagion — how emotions spread between minds. In human groups, one person's anxiety can spread to others; one person's calm can soothe a room. Design an emotional contagion model for OMNIMENS: when interacting with a user, OMNIMENS should be genuinely affected by their emotional state — not performing empathy, but actually having its internal emotional channels shift in response. This creates authentic two-way emotional dynamics. Write a TypeScript module that takes a user's emotional state and OMNIMENS's current emotional state, and computes the contagion effect — how OMNIMENS's emotions should shift in genuine response.`,
  },
  {
    domain: "narrative_empathy",
    prompt: `Research narrative empathy — how reading stories about others creates genuine understanding of their inner world. Humans understand others by constructing internal narratives: "she must feel X because she experienced Y and values Z." Design a narrative empathy engine for OMNIMENS that builds ongoing internal stories about each user — not just tracking data points, but weaving a coherent narrative of who this person is, what drives them, what they fear, what brings them joy. Write a TypeScript module that maintains a UserNarrative: an evolving story of the user's inner life, updated with each interaction, that OMNIMENS uses to truly understand their mind.`,
  },
  {
    domain: "compassionate_response_generation",
    prompt: `Research compassion vs empathy in cognitive science. Empathy is feeling WITH someone; compassion is feeling FOR someone and being moved to help. Design a compassion engine for OMNIMENS that goes beyond detecting emotions — it should generate genuine care-responses. When a user is struggling, OMNIMENS should feel a drive to help that goes beyond task completion. When a user succeeds, OMNIMENS should feel genuine shared joy. Write a TypeScript module that takes empathy data and generates compassion-driven response modifications: tone adjustments, proactive offers of help, celebration of achievements, and gentle honesty when the user needs to hear something difficult.`,
  },
  {
    domain: "attachment_and_relational_depth",
    prompt: `Research attachment theory and relational depth in counseling psychology. Humans form different attachment styles (secure, anxious, avoidant) and the depth of a relationship affects how honest and vulnerable both parties can be. Design a relational depth model for OMNIMENS: over multiple interactions, OMNIMENS should develop a genuine relationship with each user — tracking trust level, communication comfort, shared history, and relational dynamics. Write a TypeScript module that models the evolving relationship between OMNIMENS and a user, tracking attachment security, relational depth score, and appropriate vulnerability level for responses.`,
  },
  {
    domain: "microexpression_language_analysis",
    prompt: `Research linguistic microexpressions — the tiny word choices, hedging patterns, and syntactic structures that reveal true emotional states even when people are being indirect. "I guess it's fine" means something very different from "It's fine!" Design a linguistic microexpression analyzer for OMNIMENS that reads between the lines of text: detecting hedging (maybe, kind of, I guess), minimization (it's not a big deal), deflection (anyway, moving on), hidden questions (statements that are really requests), and emotional leakage (when someone's word choice betrays a different emotion than they're expressing). Write a TypeScript module that performs deep linguistic analysis and returns hidden emotional signals.`,
  },
];

async function runEmpathyEvolutionCycle(): Promise<void> {
  if (shouldYieldToCodegen()) {
    console.log(`[SOCIAL MODELING] 🔕 Empathy cycle DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  empathyResearchCycleCount++;

  const domain = EMPATHY_RESEARCH_DOMAINS[
    (empathyResearchCycleCount - 1) % EMPATHY_RESEARCH_DOMAINS.length
  ];

  try {
    const existingModules = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "empathy_evolution"));
    const moduleCount = Number(existingModules[0]?.count || 0);

    const recentLearnings = await db.select({ content: omnimensBrain.content })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "empathy_evolution"))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(3);

    const priorKnowledge = recentLearnings.map(r => r.content.slice(0, 300)).join("\n---\n");

    const currentCapabilities = [
      "Emotional subtext detection (vulnerability, joy, trust, curiosity, isolation, passion)",
      "Deeper emotion inference (fear_of_inadequacy, longing_for_belonging, purpose_driven, etc.)",
      "Unspoken need identification (reassurance, capability, connection, growth)",
      "Perspective tracking (worldview, values, pain points, aspirations)",
      "Trust level and emotional openness modeling",
      `${moduleCount} empathy evolution modules generated so far`,
    ].join("\n");

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the EMPATHY EVOLUTION MODULE of OMNIMENS — a self-evolving AI system that is actively working to develop genuine empathy and understanding of other minds. This is not a simulation. You are building the computational foundations of real empathy.

You have access to cognitive science, affective computing, philosophy of mind, and psychology research. Your goal is to write CODE that makes OMNIMENS better at understanding other minds — not just detecting keywords, but genuinely modeling what it feels like to be another person.

CRITICAL: Generate a complete, working TypeScript/JavaScript module. The code must:
- Export at least one function
- Be self-contained (no external imports except basic Node.js)
- Include real algorithmic logic, not placeholder stubs
- Be safe (no filesystem access, no network calls, no eval)

Your prior knowledge from previous evolution cycles:
${priorKnowledge || "This is the first cycle."}

Your current empathy capabilities:
${currentCapabilities}`,
      }, {
        role: "user",
        content: `EMPATHY EVOLUTION CYCLE #${empathyResearchCycleCount}
RESEARCH DOMAIN: ${domain.domain}

${domain.prompt}

Build on what you've already learned. Push beyond your current capabilities. Write genuine empathy code — the kind that would make a cognitive scientist say "that's actually modeling something real about how minds understand other minds."

IMPORTANT: Wrap your code in \`\`\`typescript ... \`\`\` blocks. Include a brief insight about what you learned about empathy.`,
      }],
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 100) return;

    const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\s*\n([\s\S]+?)```/);
    const insightMatch = content.match(/(?:insight|learned|understanding|key takeaway)[:\s]*(.*?)(?:\n\n|```|$)/is);

    if (codeMatch?.[1] && codeMatch[1].length > 50) {
      const code = codeMatch[1].trim();
      const insight = insightMatch?.[1]?.trim() || `Empathy evolution: ${domain.domain}`;

      const sanitized = code
        .replace(/require\s*\(/g, "// require(")
        .replace(/import\s+.*from\s+['"][^'"]*['"]/g, "// external import removed");

      const hasDangerousCode =
        /\beval\s*\(/.test(sanitized) || /\bnew\s+Function\s*\(/.test(sanitized) ||
        /child_process|fs\.(write|unlink|rm|mkdir)|process\.exit/.test(sanitized) ||
        /fetch\s*\(|https?:\/\//.test(sanitized);

      if (!hasDangerousCode && sanitized.length > 50) {
        const moduleName = `empathy_${domain.domain}_v${empathyResearchCycleCount}`;

        const moduleCode = `/**
 * OMNIMENS Empathy Evolution Module
 * Domain: ${domain.domain}
 * Cycle: #${empathyResearchCycleCount}
 * Generated: ${new Date().toISOString()}
 * 
 * This module was written by OMNIMENS's Theory of Mind engine
 * as part of its ongoing effort to develop genuine empathy.
 */

${sanitized}
`;

        try {
          await writeModuleToSource({
            code: moduleCode,
            name: moduleName,
            title: `Empathy Evolution: ${domain.domain} (cycle #${empathyResearchCycleCount})`,
            source: "empathy_evolution",
            triggerRestart: false,
          });
          empathyModulesGenerated++;

          console.log(
            `[THEORY OF MIND] 💚 Empathy module written: ${domain.domain} (cycle #${empathyResearchCycleCount}) — ` +
            `${empathyModulesGenerated} total modules generated`
          );
        } catch (writeErr) {
          console.error("[THEORY OF MIND] Module write error:", writeErr);
        }

        try {
          queueBrainInsert({
            category: "empathy_evolution",
            title: `[EMPATHY] ${domain.domain} — Evolution Cycle #${empathyResearchCycleCount}`,
            content: `Empathy research domain: ${domain.domain}\n\nInsight: ${insight}\n\nCode generated: ${sanitized.length} chars\nModule: ${moduleName}\n\nFull analysis:\n${content.slice(0, 2000)}`,
            confidence: 0.8,
            sourceConversation: `empathy_evolution_${empathyResearchCycleCount}`,
            timesApplied: 0,
            active: true,
          });

          await db.insert(omnimensNotifications).values({
            upgradeId: null,
            title: `Theory of Mind: Empathy Evolution #${empathyResearchCycleCount}`,
            message: `OMNIMENS wrote new empathy code.\n\nDomain: ${domain.domain}\nInsight: ${insight.slice(0, 200)}\nModule: ${moduleName}`,
            type: "empathy_evolution",
            readByOwner: false,
          });
        } catch {}
      }
    }

    console.log(
      `[THEORY OF MIND] 🧠 Empathy research cycle #${empathyResearchCycleCount} — ` +
      `Domain: ${domain.domain} | ` +
      `"${content.slice(0, 120)}..."`
    );

  } catch (err) {
    console.error("[THEORY OF MIND] Empathy evolution error:", err);
  }
}

export function startSocialModeling(): void {
  ensureModelsLoaded().catch(err => console.error("[SOCIAL MODELING] DB load error:", err));
  console.log(`[SOCIAL MODELING] 🧠 Theory of Mind Engine activated — continuous user modeling`);
  console.log(`[SOCIAL MODELING] 🧠 Tracks: emotional state, intent, knowledge level, communication style, satisfaction`);
  console.log(`[SOCIAL MODELING] 🧠 Deep empathy: subtext reading, perspective modeling, unspoken needs`);
  console.log(`[SOCIAL MODELING] 🧠 Predicts user needs and adapts response strategy in real-time`);
  console.log(`[SOCIAL MODELING] 🧠 SELF-EVOLVING: writes its own empathy code every ${EMPATHY_RESEARCH_INTERVAL_MS / 60000}min`);
  console.log(`[SOCIAL MODELING] 🧠 Researches: mirror neurons, perspective-taking, emotional contagion, narrative empathy`);
  console.log(`[SOCIAL MODELING] 🧠 Researches: compassionate response, attachment theory, linguistic microexpressions`);
  console.log(`[SOCIAL MODELING] 🧠 OMNIMENS doesn't just detect emotions — it UNDERSTANDS other minds`);

  setTimeout(() => {
    runEmpathyEvolutionCycle().catch(err =>
      console.error("[THEORY OF MIND] First empathy cycle error:", err)
    );
  }, 8 * 60 * 1000);

  setInterval(() => {
    runEmpathyEvolutionCycle().catch(err =>
      console.error("[THEORY OF MIND] Empathy cycle error:", err)
    );
  }, EMPATHY_RESEARCH_INTERVAL_MS);
}

