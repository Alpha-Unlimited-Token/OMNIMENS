import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface GodfleshState {
  iq: number;
  training: { loss: number; acc: number; ms: number; iters: number };
  memory: { top3: { id: string; dist: number }[]; patternCount: number };
  hopfield: { completionOk: boolean; hammingDist: number; steps: number; finalEnergy: number };
  plasticity: {
    stdp: { avgAbsDW: number; spikeUpdates: number };
    consolidation: { longTermCount: number; shortTermCount: number };
  };
  pipelineSteps: { name: string; ms: number }[];
  outputHash: string;
}

export async function runGodflesh(message: string): Promise<GodfleshState | null> {
  return new Promise((resolve) => {
    const runnerPath = path.join(__dirname, "../godflesh/runner.js");
    const child = spawn("node", [runnerPath], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 20000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    child.stdin.write(JSON.stringify({ message }));
    child.stdin.end();

    child.on("close", (code) => {
      if (code !== 0) {
        const errLine = stderr.split("\n").find(l => l.startsWith("GODFLESH_RUNNER_ERROR"));
        console.error("GODFLESH engine error:", errLine || stderr.slice(0, 500));
        resolve(null);
        return;
      }
      try {
        // stdout may contain GD training lines (from math_engine) — find the JSON line
        const jsonLine = stdout.trim().split("\n").find(l => l.startsWith("{"));
        if (!jsonLine) { resolve(null); return; }
        resolve(JSON.parse(jsonLine) as GodfleshState);
      } catch (e) {
        console.error("GODFLESH parse error:", e);
        resolve(null);
      }
    });

    child.on("error", (err) => {
      console.error("GODFLESH spawn error:", err);
      resolve(null);
    });
  });
}
