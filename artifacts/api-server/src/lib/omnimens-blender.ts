/**
 * OMNIMENS BLENDER PIPELINE
 * ─────────────────────────────────────────────────────────────────────────────
 * GPT-4o writes a fully autonomous Blender Python (bpy) script based on the
 * user's prompt → Blender 4.4 runs headlessly (--background) → exports .glb
 * → we return the raw GLB bytes + a Three.js PBR viewer HTML.
 *
 * Blender's full toolkit is available:
 *   • Mesh primitives + modifiers (Subdivision, Solidify, Array, Boolean, Bevel…)
 *   • Curves and NURBS
 *   • Particle systems (fur, hair, scatter)
 *   • Geometry Nodes (procedural)
 *   • PBR materials (Principled BSDF) with procedural textures (Noise, Wave,
 *     Voronoi, Brick, Musgrave, ColorRamp, Mix Shader, Emission…)
 *   • Armatures / rigging
 *   • glTF 2.0 export with full PBR, morph targets, and animations
 */

import { openai } from "@workspace/integrations-openai-ai-server";
import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

// ─── Three.js PBR viewer (identical to the trimesh viewer) ───────────────────

function buildThreejsViewer(glbBase64: string, prompt: string, vertexCount: number, faceCount: number): string {
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
  <button id="spin" class="active">⟳ AUTO-ROTATE</button>
</div>

<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const W = window.innerWidth, H = window.innerHeight;
const renderer = new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(W,H);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.035);

const camera = new THREE.PerspectiveCamera(45,W/H,0.01,1000);
camera.position.set(3,2,4);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.06;
controls.autoRotate=true;
controls.autoRotateSpeed=1.2;

// Lights
const amb = new THREE.AmbientLight(0xffffff,0.3); scene.add(amb);
const dir = new THREE.DirectionalLight(0xffffff,2.2);
dir.position.set(5,8,5);
dir.castShadow=true;
dir.shadow.mapSize.set(2048,2048);
scene.add(dir);
const fill = new THREE.DirectionalLight(0x4080ff,0.6);
fill.position.set(-5,3,-5); scene.add(fill);
const rim = new THREE.DirectionalLight(0x00e5ff,0.4);
rim.position.set(0,5,-8); scene.add(rim);

// Grid
const grid = new THREE.GridHelper(20,40,0x1a1a3a,0x0d0d1f);
grid.position.y=-0.01; scene.add(grid);

// Bloom post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W,H),0.4,0.4,0.85);
composer.addPass(bloom);

// Load GLB from base64
const b64 = "${glbBase64}";
const raw = atob(b64);
const bytes = new Uint8Array(raw.length);
for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
const blob = new Blob([bytes],{type:'model/gltf-binary'});
const url  = URL.createObjectURL(blob);

new GLTFLoader().load(url, gltf => {
  const model = gltf.scene;
  // Center + normalize
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const scale = 3/size;
  model.position.sub(center.multiplyScalar(scale));
  model.scale.setScalar(scale);
  model.traverse(n => {
    if(n.isMesh){
      n.castShadow=true;
      n.receiveShadow=true;
      if(!n.material) n.material = new THREE.MeshStandardMaterial({color:0x8888aa});
    }
  });
  // Shadow plane
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20,20),
    new THREE.ShadowMaterial({opacity:0.35})
  );
  plane.rotation.x=-Math.PI/2;
  plane.position.y = box.min.y*scale - center.y*scale - 0.01;
  plane.receiveShadow=true;
  scene.add(plane);
  scene.add(model);
  camera.position.setLength(size*scale*1.8+2);
  controls.target.set(0,0,0);
  controls.update();
  URL.revokeObjectURL(url);
});

// Buttons
let wireframe=false;
document.getElementById('wire').addEventListener('click',()=>{
  wireframe=!wireframe;
  scene.traverse(n=>{if(n.isMesh&&n.material) n.material.wireframe=wireframe;});
});
document.getElementById('spin').addEventListener('click',e=>{
  controls.autoRotate=!controls.autoRotate;
  e.target.style.color=controls.autoRotate?'#7be0ff':'#555';
});
document.getElementById('dl').addEventListener('click',()=>{
  const a=document.createElement('a');
  a.href='data:model/gltf-binary;base64,${glbBase64}';
  a.download='omnimens-3d.glb';
  a.click();
});

window.addEventListener('resize',()=>{
  const w=innerWidth,h=innerHeight;
  camera.aspect=w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h); composer.setSize(w,h);
});

(function animate(){
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
})();
</script>
</body>
</html>`;
}

// ─── Blender pipeline ─────────────────────────────────────────────────────────

export interface Blender3DResult {
  glbBase64: string;
  glbSizeBytes: number;
  threejsHtml: string;
  vertexCount: number;
  faceCount: number;
  blenderScript: string;
  tool: "blender";
}

export async function generateWithBlender(prompt: string): Promise<Blender3DResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnimens-blender-"));
  const scriptPath  = path.join(tmpDir, "scene.py");
  const outputPath  = path.join(tmpDir, "output.glb");

  try {
    // ── Step 1: Ask GPT-4o to write the Blender Python script ─────────────
    const scriptResp = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are OMNIMENS's Blender Python expert. Write a complete, runnable Blender 4.4 Python script (bpy) that creates a detailed 3D model based on the user's prompt.

CRITICAL RULES:
1. The script MUST start with: import bpy, math, random
2. ALWAYS start by clearing the scene: bpy.ops.wm.read_factory_settings(use_empty=True)
3. Do NOT create or enable any render engine (Cycles/EEVEE) — geometry export only
4. Build complex, detailed geometry — use modifiers liberally:
   - Subdivision Surface (levels 2-3 for smoothness)
   - Solidify (for thickness)
   - Boolean (union, difference, intersect)
   - Array (for repeated elements)
   - Bevel (for clean edges)
   - Screw (for lathe objects)
   - Mirror (for symmetry)
5. Apply PBR materials using Principled BSDF nodes — set base_color, metallic, roughness, emission
6. Use procedural textures (Noise, Wave, Voronoi, Musgrave) for surface detail
7. The script MUST end with this EXACT export block (fill in OUTPUT_PATH):
   bpy.ops.export_scene.gltf(
       filepath="${outputPath}",
       export_format='GLB',
       export_apply=True,
       export_materials='EXPORT',
       export_normals=True,
       export_texcoords=True,
       export_vertex_colors='SRGB',
   )
   print(f"BLENDER_EXPORT_SUCCESS: {bpy.context.scene.statistics(bpy.context.view_layer)}")
8. NEVER use external file paths, images, or textures — ALL procedural
9. Output ONLY the Python code — no markdown, no explanation

The output .glb file path is: ${outputPath}

Build something impressive, detailed, and visually rich.`
        },
        {
          role: "user",
          content: `Create a detailed 3D model of: ${prompt}

Use Blender's full toolkit. Make it complex and visually impressive with proper PBR materials and procedural textures.`
        }
      ]
    });

    let blenderScript = scriptResp.choices[0].message.content?.trim() || "";

    // Strip markdown code fences if present
    blenderScript = blenderScript.replace(/^```python\n?/i, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

    // Safety: ensure the export call has the correct path
    if (!blenderScript.includes(outputPath)) {
      blenderScript += `\n\nbpy.ops.export_scene.gltf(
    filepath="${outputPath}",
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_normals=True,
    export_texcoords=True,
)
print(f"BLENDER_EXPORT_SUCCESS")
`;
    }

    fs.writeFileSync(scriptPath, blenderScript, "utf8");

    // ── Step 2: Run Blender headlessly ────────────────────────────────────
    let stdout = "";
    let stderr = "";
    try {
      const result = await execFileAsync("blender", [
        "--background",
        "--python", scriptPath,
        "--",
      ], {
        timeout: 120_000,     // 2 minutes max
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          DISPLAY: "",
          BLENDER_USER_RESOURCES: tmpDir,
        }
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execErr: any) {
      stdout = execErr.stdout || "";
      stderr = execErr.stderr || "";
      // Blender often exits with code 1 even on success — check if file exists
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Blender execution failed.\nStdout: ${stdout.slice(-1000)}\nStderr: ${stderr.slice(-1000)}`);
      }
    }

    // ── Step 3: Read and validate the .glb output ─────────────────────────
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Blender did not produce output file.\nLog: ${(stdout + stderr).slice(-2000)}`);
    }

    const glbBuffer = fs.readFileSync(outputPath);
    if (glbBuffer.length < 100) {
      throw new Error("Blender output GLB is too small — model generation failed");
    }
    const glbBase64 = glbBuffer.toString("base64");

    // ── Step 4: Count vertices + faces from Blender stdout ────────────────
    let vertexCount = 0;
    let faceCount   = 0;
    const statsMatch = stdout.match(/Verts:(\d+)\s*\|?\s*Faces:(\d+)/i);
    if (statsMatch) {
      vertexCount = parseInt(statsMatch[1], 10);
      faceCount   = parseInt(statsMatch[2], 10);
    } else {
      // Estimate from file size
      vertexCount = Math.floor(glbBuffer.length / 32);
      faceCount   = Math.floor(glbBuffer.length / 48);
    }

    // ── Step 5: Build the Three.js viewer ─────────────────────────────────
    const threejsHtml = buildThreejsViewer(glbBase64, prompt, vertexCount, faceCount);

    return {
      glbBase64,
      glbSizeBytes: glbBuffer.length,
      threejsHtml,
      vertexCount,
      faceCount,
      blenderScript,
      tool: "blender",
    };

  } finally {
    // Cleanup temp files
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
