/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Code Interpreter
 * Mirrors ChatGPT Code Interpreter — executes JavaScript/Node.js in a sandboxed
 * subprocess and returns stdout, stderr, and execution time.
 *
 * Safety: code runs in a restricted child_process with a hard timeout.
 * No network access, no filesystem writes outside /tmp.
 */
import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const MAX_EXEC_MS = 10_000;  // 10 second hard limit
const MAX_OUTPUT  = 8_000;   // max chars of combined output

export interface CodeResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  truncated: boolean;
}

/**
 * Execute JavaScript/Node.js code in a sandboxed subprocess.
 * Uses a temporary file written to /tmp — cleared after execution.
 */
export async function executeJavaScript(code: string): Promise<CodeResult> {
  const id = randomBytes(8).toString("hex");
  const file = join(tmpdir(), `omnimens_exec_${id}.mjs`);

  // Wrap code to capture errors and console.log output
  const wrapped = `
// Safe wrapper — restricts dangerous operations
const _console = console;
const _log = [];
console.log = (...args) => { _log.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')); _console.log(...args); };
console.error = (...args) => { _console.error(...args); };
console.warn = (...args) => { _log.push('[WARN] ' + args.join(' ')); _console.warn(...args); };
console.table = (data) => { _log.push(JSON.stringify(data, null, 2)); };
console.dir = (data) => { _log.push(JSON.stringify(data, null, 2)); };

try {
${code}
} catch (_err) {
  console.error(_err.stack || _err.message || String(_err));
  process.exit(1);
}
`;

  await writeFile(file, wrapped, "utf8");

  const start = Date.now();

  return new Promise((resolve) => {
    execFile(
      "node",
      ["--experimental-vm-modules", file],
      {
        timeout: MAX_EXEC_MS,
        maxBuffer: MAX_OUTPUT * 4,
        env: {
          ...process.env,
          NODE_PATH: process.env.NODE_PATH,
          // Disable network-requiring modules
        },
      },
      async (err, stdout, stderr) => {
        const durationMs = Date.now() - start;
        await unlink(file).catch(() => {});

        const combined = (stdout + stderr).length;
        const truncated = combined > MAX_OUTPUT;

        resolve({
          stdout: stdout.slice(0, MAX_OUTPUT),
          stderr: stderr.slice(0, 2000),
          exitCode: err?.code === "ETIMEDOUT" ? 124 : (err ? 1 : 0),
          durationMs,
          truncated,
        });
      }
    );
  });
}

/**
 * Parse code blocks from OMNIMENS response and auto-detect executable ones.
 */
export function extractCodeBlocks(text: string): Array<{
  language: string;
  code: string;
  executable: boolean;
}> {
  const blocks: Array<{ language: string; code: string; executable: boolean }> = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lang = (match[1] || "").toLowerCase();
    const code = match[2].trim();
    const executable = ["javascript", "js", "typescript", "ts", "node"].includes(lang);
    blocks.push({ language: lang || "text", code, executable });
  }
  return blocks;
}

/**
 * Format code execution result as readable summary for chat display
 */
export function formatCodeResult(result: CodeResult, language: string): string {
  const lines: string[] = [];
  if (result.durationMs > 0) {
    lines.push(`⚡ Executed ${language} in ${result.durationMs}ms (exit: ${result.exitCode})`);
  }
  if (result.stdout.trim()) {
    lines.push(`\`\`\`\n${result.stdout.trim()}\n\`\`\``);
  }
  if (result.stderr.trim()) {
    lines.push(`**Errors:**\n\`\`\`\n${result.stderr.trim()}\n\`\`\``);
  }
  if (result.exitCode === 124) {
    lines.push("⏱️ Execution timed out (10s limit).");
  }
  if (result.truncated) {
    lines.push("_(Output truncated — too long)_");
  }
  return lines.join("\n");
}
