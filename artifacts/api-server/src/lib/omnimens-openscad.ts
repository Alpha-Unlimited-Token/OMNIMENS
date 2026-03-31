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

import { openai } from "@workspace/integrations-openai-ai-server";
import { execFile, spawnSync } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

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
  <button id="spin">⟳ AUTO-ROTATE</button>
</div>
<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const W=innerWidth,H=innerHeight;
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(W,H);
renderer.shadowMap.enabled=true;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x050510);
const camera=new THREE.PerspectiveCamera(45,W/H,0.01,1000);
camera.position.set(3,2,4);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.06;
controls.autoRotate=true;
controls.autoRotateSpeed=0.9;

scene.add(new THREE.AmbientLight(0xffffff,0.4));
const d=new THREE.DirectionalLight(0xffffff,2);d.position.set(5,8,5);d.castShadow=true;scene.add(d);
scene.add(new THREE.DirectionalLight(0x4080ff,0.5)).position.set(-5,3,-5);
scene.add(new THREE.GridHelper(20,40,0x1a1a3a,0x0d0d1f));

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W,H),0.35,0.4,0.9));

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
