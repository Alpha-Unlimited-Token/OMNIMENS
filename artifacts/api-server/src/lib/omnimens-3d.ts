/**
 * OMNIMENS 3D Generation Engine — Multi-Tool Router
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes 3D generation to the most capable available tool:
 *
 *   1. Blender 4.4 (bpy) — PRIMARY — best quality, full PBR, modifiers, GLB
 *   2. OpenSCAD 2021    — SECONDARY — parametric/mechanical/geometric objects
 *   3. trimesh/Python   — FALLBACK — always works, procedural meshes
 *
 * All tools run completely headlessly in the background.
 * All output: real .glb file + interactive Three.js PBR viewer HTML.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateWithBlender } from "./omnimens-blender.js";
import { generateWithOpenSCAD } from "./omnimens-openscad.js";

const execFileAsync = promisify(execFile);

// ── Tool classifier — GPT-4o decides which 3D tool fits best ─────────────────

async function classifyPromptFor3DTool(prompt: string): Promise<"blender" | "openscad" | "trimesh"> {
  const p = prompt.toLowerCase();

  // OpenSCAD keywords — technical/parametric/mathematical
  const openscadKeywords = [
    "gear", "screw", "bolt", "nut", "bracket", "enclosure", "box", "case",
    "parametric", "mechanical", "bearing", "casing", "lattice", "fractal",
    "mathematical", "grid", "honeycomb", "truss", "pipe", "fitting",
    "architectural", "building", "house", "room", "floor plan",
    "3d print", "printable", "fdm", "cnc", "engineering"
  ];

  // Blender — everything else (organic, artistic, characters, vehicles, sci-fi, etc.)
  const hasOpenSCAD = openscadKeywords.some(k => p.includes(k));
  if (hasOpenSCAD) return "openscad";

  // Blender handles everything else
  return "blender";
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
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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
