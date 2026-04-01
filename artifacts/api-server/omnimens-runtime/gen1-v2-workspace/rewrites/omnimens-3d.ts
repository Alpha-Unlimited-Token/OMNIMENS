/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. 
 * CONFIDENTIAL AND PROPRIETARY. All rights reserved.
 */

/*──────────────────────────────────────────────────────────────────────────────
  OMNIMENS 3D Generation Engine (v2.0) — Event-Driven, Unified Runtime
──────────────────────────────────────────────────────────────────────────────*/

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { generateWithBlender } from "./omnimens-blender.js";
import { generateWithOpenSCAD } from "./omnimens-openscad.js";

const execFileAsync = promisify(execFile);

/*──────────────────────────── Runtime Registration ───────────────────────────*/

engineRegistry.registerEngine("3d", "NORMAL", { dbQuota: 10 });

spikeBus.on("3d:cycle", async () => {
  /* placeholder for future periodic work (cache cleanup, health ping, etc.) */
  spikeBus.scheduleSpike("3d:cycle", {}, 5_000);
});
spikeBus.scheduleSpike("3d:cycle", {}, 5_000); // kick-off

cognitionBus.onInsight((src, insight) => {
  if (src !== "3d" && insight?.type === "discovery") {
    console.log("[OMNIMENS-3D] Learned from", src, insight);
  }
});

/*──────────────────────────── Types & Utilities ──────────────────────────────*/

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

const TRIMESH_SYS_PROMPT = `You are OMNIMENS 3D — a world-class procedural sculptor.
Write a COMPLETE Python script that uses only trimesh/numpy/scipy/pillow.
Export a watertight, manifold .glb to os.environ['OUTPUT_PATH'] with artistic depth.`;

const execPy = async (
  script: string
): Promise<{ buf: Buffer; v: number; f: number }> => {
  const dir = join(tmpdir(), `omni3d-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  const py = join(dir, "g.py");
  const out = join(dir, "m.glb");
  const stats = join(dir, "s.json");

  const full = `${script}
import json, trimesh, os, sys
m=trimesh.load('${out.replace(/\\/g, "/")}')
d={'vertices':len(getattr(m,'vertices',[])), 'faces':len(getattr(m,'faces',[]))}
open('${stats.replace(/\\/g, "/")}',"w").write(json.dumps(d))`;
  await writeFile(py, full, "utf8");

  await execFileAsync("python3", [py], {
    timeout: 120_000,
    env: { ...process.env, OUTPUT_PATH: out },
    maxBuffer: 10 * 1024 * 1024,
  }).catch((e) => {
    console.error("[OMNIMENS-3D] Python error:", e.message);
    throw e;
  });

  const [buf, raw] = await Promise.all([
    readFile(out),
    readFile(stats, "utf8").catch(() => '{"vertices":0,"faces":0}'),
  ]);

  let s = { vertices: 0, faces: 0 };
  try {
    s = JSON.parse(raw);
  } catch {}
  // cleanup (fire & forget)
  Promise.all([unlink(py), unlink(out), unlink(stats)]).catch(() => {});

  return { buf, v: s.vertices, f: s.faces };
};

const minViewer = (b64: string, title: string) => `<!DOCTYPE html><html><head><meta charset=utf-8><title>${title}</title><style>*{margin:0}canvas{width:100vw;height:100vh;display:block;background:#000}</style><script type=importmap>{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script></head><body><script type=module>
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const r=new T.WebGLRenderer({antialias:true});document.body.appendChild(r.domElement);
const s=new T.Scene();const c=new T.PerspectiveCamera(45,innerWidth/innerHeight,.1,1e3);c.position.set(3,2,4);
const o=new OrbitControls(c,r.domElement);o.enableDamping=true;
const l=new T.DirectionalLight(0xffffff,2);l.position.set(5,5,5);s.add(l);
const bytes=Uint8Array.from(atob("${b64}"),c=>c.charCodeAt(0));
new GLTFLoader().parse(bytes.buffer,"",g=>{
  s.add(g.scene);const box=new T.Box3().setFromObject(g.scene);
  const d=box.getSize(new T.Vector3()).length();c.position.set(d*1.5,d*1.2,d*1.7);o.update();
});
window.addEventListener('resize',()=>{c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();r.setSize(innerWidth,innerHeight);});
r.setSize(innerWidth,innerHeight);
const loop=()=>{requestAnimationFrame(loop);o.update();r.render(s,c)};loop();
</script></body></html>`;

/*──────────────────────────── OpenAI via API Manager ─────────────────────────*/

const ai = (payload: unknown) =>
  apiManager.call("3d", "openai", payload) as Promise<any>;

const classifyPromptFor3DTool = async (
  prompt: string
): Promise<"blender" | "openscad" | "trimesh"> => {
  // TODO: use cross-engine insights for smarter classification
  return "trimesh";
};

const genTrimeshScript = async (prompt: string): Promise<string> => {
  const res = await ai({
    model: "gpt-4o",
    messages: [
      { role: "system", content: TRIMESH_SYS_PROMPT },
      {
        role: "user",
        content: `Create an impressive 3D model of: ${prompt}.
Return ONLY runnable Python code.`,
      },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  });

  let script = res.choices?.[0]?.message?.content || "";
  const m = script.match(/