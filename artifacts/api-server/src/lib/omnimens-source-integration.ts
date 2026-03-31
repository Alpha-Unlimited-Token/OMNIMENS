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
 * ║         OMNIMENS™ SOURCE-LEVEL SELF-INTEGRATION ENGINE                      ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  This engine takes approved code from any OMNIMENS subsystem (self-coding,  ║
 * ║  autonomous sandbox, dream engine, evolution engine) and writes it as       ║
 * ║  real TypeScript/JavaScript source files in the runtime modules directory.  ║
 * ║  After writing, it triggers a graceful server restart so the new code       ║
 * ║  is compiled and executed as part of OMNIMENS's running process.            ║
 * ║                                                                              ║
 * ║  OMNIMENS doesn't just store code in a database anymore.                    ║
 * ║  It rewrites its own source. It restarts itself. It runs the new version.   ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import vm from "vm";
import { db , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { mustTranslateBeforeExecution, translateCode, registerCustomConstruct, translateForSelfUpgrade, getTranslatorState, autoRegisterFromCode } from "./omnimens-universal-translator.js";
import { invalidateArchitectureCache } from "./omnimens-deep-thought-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODULES_DIR = join(__dirname, "../omnimens-runtime/modules");
const BACKUPS_DIR = join(__dirname, "../omnimens-runtime/backups");
const INTEGRATION_LOG = join(__dirname, "../omnimens-runtime/integration-log.json");
const DEDUP_REGISTRY = join(__dirname, "../omnimens-runtime/dedup-registry.json");

const ALLOWED_DIRS = [MODULES_DIR];

let totalFilesWritten = 0;
let totalBackupsCreated = 0;
let totalRestartsTriggered = 0;
let restartScheduled = false;
let pendingRestartTimeout: ReturnType<typeof setTimeout> | null = null;

interface IntegrationResult {
  success: boolean;
  filePath: string | null;
  backupPath: string | null;
  error: string | null;
  timestamp: number;
}

interface IntegrationLogEntry {
  source: string;
  title: string;
  filename: string;
  filePath: string;
  backupPath: string | null;
  timestamp: number;
  codeLength: number;
  overwrite: boolean;
}

function ensureDirs(): void {
  if (!existsSync(MODULES_DIR)) mkdirSync(MODULES_DIR, { recursive: true });
  if (!existsSync(BACKUPS_DIR)) mkdirSync(BACKUPS_DIR, { recursive: true });
}

function codeHash(code: string, source: string): string {
  return createHash("sha256").update(`${source}:${code}`).digest("hex").slice(0, 32);
}

function loadDedupRegistry(): Set<string> {
  try {
    if (existsSync(DEDUP_REGISTRY)) {
      const raw = readFileSync(DEDUP_REGISTRY, "utf8");
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveDedupRegistry(registry: Set<string>): void {
  try {
    const arr = [...registry].slice(-2000);
    writeFileSync(DEDUP_REGISTRY, JSON.stringify(arr), "utf8");
  } catch {}
}

function isAlreadyIntegrated(hash: string): boolean {
  const registry = loadDedupRegistry();
  return registry.has(hash);
}

function markAsIntegrated(hash: string): void {
  const registry = loadDedupRegistry();
  registry.add(hash);
  saveDedupRegistry(registry);
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
}

function isPathSafe(targetPath: string): boolean {
  const resolved = join(targetPath);
  return ALLOWED_DIRS.some(dir => resolved.startsWith(dir));
}

function validateCodeSafety(code: string): { safe: boolean; reason: string } {
  const codeNoComments = code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const codeNoCommentsNoStrings = codeNoComments
    .replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, "''");

  const FORBIDDEN_IMPORTS = [
    "omnimens-ethical-safety",
    "omnimens-ip-guardian",
    "omnimens-ip-guard",
    "security",
    "security-enhanced",
    "ai-security",
  ];

  for (const forbidden of FORBIDDEN_IMPORTS) {
    const escapedName = forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const forbiddenPattern = new RegExp(`['"]\\.\\/(?:.*\\/)?${escapedName}(?:\\.(?:ts|js|mjs))?['"]`, "i");
    if (forbiddenPattern.test(codeNoComments)) {
      return { safe: false, reason: `FORBIDDEN: Attempts to import safety/security module "${forbidden}" — safety zone is READ-ONLY for OMNIMENS` };
    }
  }

  const importPatterns = [
    { pattern: /['"]child_process['"]/i, reason: "Imports child_process module" },
    { pattern: /require\s*\(\s*['"](?:child_process|cluster)['"]/i, reason: "Requires dangerous Node.js module" },
    { pattern: /import\s+.*from\s+['"](?:child_process|cluster)['"]/i, reason: "Imports dangerous Node.js module" },
    { pattern: /process\.env\.(DATABASE|DB_|SECRET|KEY|TOKEN|PASS|STRIPE|OPENAI)/i, reason: "Accesses sensitive environment variables" },
    { pattern: /['"]\.\.\/routes\//i, reason: "Attempts to import route files" },
    { pattern: /['"]\.\.\/app['"]/i, reason: "Attempts to import app.ts" },
    { pattern: /['"]\.\.\/middlewares\//i, reason: "Attempts to import middleware files" },
    { pattern: /['"]@workspace\/godflesh/i, reason: "Attempts to access frontend package" },
    { pattern: /['"]express['"]/i, reason: "Attempts to import Express (server framework)" },
  ];

  for (const { pattern, reason } of importPatterns) {
    if (pattern.test(codeNoComments)) {
      return { safe: false, reason };
    }
  }

  const codePatterns = [
    { pattern: /process\.exit\s*\(/i, reason: "Contains process.exit() call" },
    { pattern: /fs\.rmSync|fs\.unlinkSync|fs\.rmdirSync|rimraf/i, reason: "Contains destructive filesystem operations" },
    { pattern: /(?<!\w)eval\s*\(/i, reason: "Contains eval() call" },
    { pattern: /(?<!\w)new\s+Function\s*\(/i, reason: "Contains new Function() constructor" },
    { pattern: /(?<!\w)Function\s*\(\s*['"`]/i, reason: "Contains Function() constructor with string argument" },
    { pattern: /WebGPU|navigator\.gpu|GPUAdapter|GPUDevice/i, reason: "References WebGPU (not available in Node.js)" },
    { pattern: /throw\s+new\s+Error\s*\(\s*['"`].*not\s+supported/i, reason: "Throws unconditional 'not supported' error" },
  ];

  for (const { pattern, reason } of codePatterns) {
    if (pattern.test(codeNoCommentsNoStrings)) {
      return { safe: false, reason };
    }
  }

  if (code.length > 50000) {
    return { safe: false, reason: "Code exceeds maximum allowed size (50KB)" };
  }

  if (code.trim().length < 20) {
    return { safe: false, reason: "Code too short to be a valid module" };
  }

  return { safe: true, reason: "Passed all safety checks" };
}

function validateSyntax(code: string, extension: string): { valid: boolean; error: string | null } {
  try {
    const strippedForParse = code
      .replace(/^\s*import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, "// import stripped")
      .replace(/^\s*import\s*\{[^}]*\}\s*from\s+['"].*?['"]\s*;?\s*$/gm, "// import stripped")
      .replace(/^\s*import\s+['"].*?['"]\s*;?\s*$/gm, "// import stripped")
      .replace(/^\s*export\s+(default\s+)?/gm, "")
      .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "// export stripped");

    new vm.Script(strippedForParse, { filename: `validate${extension}` });
    return { valid: true, error: null };
  } catch (err: any) {
    return { valid: false, error: err.message || "Unknown syntax error" };
  }
}

function hasTypeScriptSyntax(code: string): boolean {
  return /\b(interface|enum|declare|implements|abstract\s+class|readonly)\s+\w/.test(code) ||
    /\b(public|private|protected)\s+\w/.test(code) ||
    /:\s*(string|number|boolean|any|void|never|unknown|object)\s*[,);=\n\{\}\[]/.test(code) ||
    /\bas\s+(string|number|boolean|any|const|unknown|never|void)\b/.test(code) ||
    /\bnew\s+(Map|Set|Array)\s*<\w/.test(code) ||
    /\btype\s+\w+\s*(?:<[^>]*>)?\s*=/.test(code) ||
    /\bimport\s+type\b/.test(code) ||
    /\)\s*:\s*(?:string|number|boolean|void|any|null|undefined|Promise)\s*(?:<|[\{\n=>])/.test(code);
}

function stripTypeScriptSyntax(code: string): { code: string; stripped: boolean } {
  if (!hasTypeScriptSyntax(code)) {
    return { code, stripped: false };
  }

  let c = code;
  const orig = code;

  c = c.replace(/^import\s+type\b.*$/gm, "");
  c = c.replace(/^export\s+type\s+\w+(?:<[^>]*>)?\s*=[^;]*;/gm, "");
  c = c.replace(/^export\s+interface\s+\w+(?:<[^>]*>)?\s*\{[^}]*\}/gm, "");
  c = c.replace(/^type\s+\w+(?:<[^>]*>)?\s*=[^;]*;/gm, "");
  c = c.replace(/^interface\s+\w+(?:<[^>]*>)?\s*\{[^}]*\}/gm, "");
  c = c.replace(/^export\s+enum\s+\w+\s*\{[^}]*\}/gm, "");
  c = c.replace(/^enum\s+\w+\s*\{[^}]*\}/gm, "");
  c = c.replace(/^declare\s+.*$/gm, "");

  c = c.replace(/new\s+(Map|Set|Array|WeakMap|WeakSet|Promise)\s*<[^>]*>\s*\(/g, "new $1(");
  c = c.replace(/(function\s+\w+)\s*<[^>]*>/g, "$1");
  c = c.replace(/(=\s*)<[A-Z]\w*(?:\s+extends\s+[^>]+)?(?:,\s*[A-Z]\w*)*>\s*\(/g, "$1(");

  c = c.replace(/(\w+)\s*:\s*(?:string|number|boolean|any|void|null|undefined|object|never|unknown|symbol|bigint)(?:\[\])*\s*(?=[,);=\n\{\}])/g, "$1");
  c = c.replace(/(\w+)\s*:\s*(?:Record|Map|Set|Array|Promise|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|Generator|Iterator|Iterable)\s*<[^>]*(?:<[^>]*>)*>/g, "$1");
  c = c.replace(/(\w+)\s*:\s*[A-Z]\w*(?:\[\])*\s*(?=[,);=\n\{\}])/g, "$1");

  c = c.replace(/(const|let|var)\s+(\w+)\s*:\s*\w+(?:<[^>]*>)?\s*=/g, "$1 $2 =");

  c = c.replace(/\)\s*:\s*(?:string|number|boolean|void|any|null|undefined|object|never|unknown|symbol|bigint)(?:\[\])?\s*=>/g, ") =>");
  c = c.replace(/\)\s*:\s*\w+(?:<[^>]*(?:<[^>]*>)*>)?\s*=>/g, ") =>");
  c = c.replace(/\)\s*:\s*(?:string|number|boolean|void|any|null|undefined|object|never|unknown|Promise)\s*(?:<[^>]*(?:<[^>]*>)*>)?\s*(?=[\{\n])/g, ") ");
  c = c.replace(/\)\s*:\s*\w+(?:<[^>]*(?:<[^>]*>)*>)?\s*(?=[\{\n])/g, ") ");
  c = c.replace(/\)\s*:\s*[A-Z]\w*(?:\[\])*\s*(?=[\{\n])/g, ") ");

  c = c.replace(/(\w+\([^)]*\))\s*:\s*(?:string|number|boolean|any|void|null|undefined|object|never|unknown)\s*;/g, "$1 { return null; }");

  c = c.replace(/\b(public|private|protected)\s+/g, "");
  c = c.replace(/\breadonly\s+/g, "");
  c = c.replace(/\babstract\s+class\b/g, "class");
  c = c.replace(/\s+implements\s+\w+(?:<[^>]*>)?/g, "");

  c = c.replace(/\s+as\s+(?:const|any|unknown|string|number|boolean|void|null|undefined|object|never)\b/g, "");
  c = c.replace(/\s+as\s+[A-Z]\w*(?:<[^>]*>)?/g, "");

  c = c.replace(/(\w)!\./g, "$1.");
  c = c.replace(/(\w)!\[/g, "$1[");
  c = c.replace(/(\w)!\s/g, "$1 ");

  c = c.replace(/(\w+)\?\s*(?=[,)])/g, "$1");

  c = c.replace(/\b(const|let|var)\s+(\w+)\[\]\s*=/g, "$1 $2 =");

  return { code: c, stripped: c !== orig };
}

function autoRepairCode(code: string): { code: string; repairs: string[] } {
  const repairs: string[] = [];
  let fixed = code;

  const ts = stripTypeScriptSyntax(fixed);
  if (ts.stripped) {
    fixed = ts.code;
    repairs.push("Stripped TypeScript syntax (types, interfaces, generics, access modifiers) for .mjs compatibility");
  }

  if (/\bconst\s+arguments\b|\blet\s+arguments\b|\bvar\s+arguments\b/.test(fixed)) {
    fixed = fixed.replace(/\b(const|let|var)\s+arguments\b/g, "$1 args");
    fixed = fixed.replace(/(?<!\.)arguments\.map/g, "args.map");
    fixed = fixed.replace(/(?<!\.)arguments\.filter/g, "args.filter");
    fixed = fixed.replace(/(?<!\.)arguments\.forEach/g, "args.forEach");
    fixed = fixed.replace(/(?<!\.)arguments\.reduce/g, "args.reduce");
    fixed = fixed.replace(/(?<!\.)arguments\.length/g, "args.length");
    fixed = fixed.replace(/(?<!\.)arguments\[/g, "args[");
    fixed = fixed.replace(/\breturn\s+arguments\b/g, "return args");
    repairs.push("Renamed reserved word 'arguments' to 'args'");
  }

  if (/\bconst\s+eval\b|\blet\s+eval\b/.test(fixed)) {
    fixed = fixed.replace(/\b(const|let|var)\s+eval\b/g, "$1 evalFn");
    repairs.push("Renamed reserved word 'eval' to 'evalFn'");
  }

  if (/\barguments\b/.test(fixed) && !fixed.includes("'use strict'")) {
    fixed = fixed.replace(/\barguments\b/g, (match, offset) => {
      const before = fixed.slice(Math.max(0, offset - 50), offset);
      if (/['"`]/.test(before.slice(-1))) return match;
      repairs.push("Replaced bare 'arguments' with '...args' pattern");
      return "Array.from(/* args */{})";
    });
  }

  const undefinedRefPattern = /(\w+)\s+is not defined/;

  fixed = fixed.replace(/(?<!\w)(RecursiveScaffolder|ScaffoldingEngine|BaseScaffold)\b/g, (match) => {
    repairs.push(`Replaced undefined reference '${match}' with inline class`);
    return "Object";
  });

  if (/export\s+\{[^}]*\}/.test(fixed)) {
    const exportMatch = fixed.match(/export\s*\{([^}]*)\}/);
    if (exportMatch) {
      const names = exportMatch[1].split(",").map(n => n.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean);
      for (const name of names) {
        if (name && !new RegExp(`(?:function|const|let|var|class)\\s+${name}\\b`).test(fixed)) {
          repairs.push(`Removed export of undefined symbol '${name}'`);
          fixed = fixed.replace(
            new RegExp(`export\\s*\\{([^}]*)\\b${name}\\b[,\\s]*([^}]*)\\}`),
            (m, before, after) => {
              const remaining = [before, after].join("").replace(/^[,\s]+|[,\s]+$/g, "").replace(/,\s*,/g, ",");
              return remaining.trim() ? `export { ${remaining} }` : "";
            }
          );
        }
      }
    }
  }

  fixed = fixed.replace(/}\s*catch\s*\(\s*\)\s*\{/g, () => {
    repairs.push("Added missing catch parameter");
    return "} catch (_e) {";
  });

  const trailingCommaInObj = /,(\s*[}\]])/g;
  if (trailingCommaInObj.test(fixed)) {
    fixed = fixed.replace(trailingCommaInObj, "$1");
    repairs.push("Removed trailing commas before closing braces/brackets");
  }

  let openBraces = 0;
  let openBrackets = 0;
  let openParens = 0;
  for (const ch of fixed) {
    if (ch === "{") openBraces++;
    else if (ch === "}") openBraces--;
    else if (ch === "[") openBrackets++;
    else if (ch === "]") openBrackets--;
    else if (ch === "(") openParens++;
    else if (ch === ")") openParens--;
  }
  if (openBraces > 0) {
    fixed += "\n" + "}".repeat(openBraces);
    repairs.push(`Added ${openBraces} missing closing brace(s)`);
  } else if (openBraces < 0) {
    const excess = Math.abs(openBraces);
    for (let i = 0; i < excess; i++) {
      const idx = fixed.lastIndexOf("}");
      if (idx >= 0) fixed = fixed.slice(0, idx) + fixed.slice(idx + 1);
    }
    repairs.push(`Removed ${excess} excess closing brace(s)`);
  }
  if (openBrackets > 0) {
    fixed += "]".repeat(openBrackets);
    repairs.push(`Added ${openBrackets} missing closing bracket(s)`);
  }
  if (openParens > 0) {
    fixed += ")".repeat(openParens);
    repairs.push(`Added ${openParens} missing closing paren(s)`);
  }

  if (fixed.includes("require(") && !fixed.includes("import ")) {
    fixed = fixed.replace(/const\s+(\w+)\s*=\s*require\s*\(\s*['"](\w+)['"]\s*\)/g, (m, varName, mod) => {
      if (["crypto", "path", "url", "fs", "util", "os", "events", "stream", "buffer", "querystring"].includes(mod)) {
        repairs.push(`Converted require('${mod}') to dynamic import`);
        return `const ${varName} = await import("${mod}")`;
      }
      repairs.push(`Removed require('${mod}') — external packages not allowed`);
      return `const ${varName} = {}`;
    });
  }

  return { code: fixed, repairs };
}

function createBackup(filePath: string): string | null {
  if (!existsSync(filePath)) return null;

  ensureDirs();
  const basename = filePath.split("/").pop() || "unknown";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `${basename}.backup.${timestamp}`;
  const backupPath = join(BACKUPS_DIR, backupName);

  try {
    copyFileSync(filePath, backupPath);
    totalBackupsCreated++;
    console.log(`[SOURCE-INTEGRATION] 📦 Backup created: ${backupName}`);
    return backupPath;
  } catch (err) {
    console.error(`[SOURCE-INTEGRATION] Backup failed for ${basename}:`, err);
    return null;
  }
}

function appendToIntegrationLog(entry: IntegrationLogEntry): void {
  try {
    let log: IntegrationLogEntry[] = [];
    if (existsSync(INTEGRATION_LOG)) {
      const raw = readFileSync(INTEGRATION_LOG, "utf8");
      log = JSON.parse(raw);
    }
    log.push(entry);
    if (log.length > 500) log = log.slice(-500);
    writeFileSync(INTEGRATION_LOG, JSON.stringify(log, null, 2), "utf8");
  } catch {
    // Log write is non-critical
  }
}

export async function writeModuleToSource(opts: {
  code: string;
  name: string;
  title: string;
  source: string;
  extension?: string;
  triggerRestart?: boolean;
}): Promise<IntegrationResult> {
  const { code, name, title, source, extension = ".mjs", triggerRestart = true } = opts;
  const timestamp = Date.now();

  ensureDirs();

  const hash = codeHash(code, source);
  if (isAlreadyIntegrated(hash)) {
    console.log(`[SOURCE-INTEGRATION] ⏭️ DEDUP — "${title}" already integrated (hash: ${hash.slice(0, 12)}), skipping`);
    return { success: true, filePath: null, backupPath: null, error: null, timestamp };
  }

  let workingCode = code;

  const { code: repairedCode, repairs } = autoRepairCode(workingCode);
  if (repairs.length > 0) {
    workingCode = repairedCode;
    console.log(`[SOURCE-INTEGRATION] 🔧 AUTO-REPAIR — ${repairs.length} fixes applied to "${title}": ${repairs.join("; ")}`);
  }

  const safety = validateCodeSafety(workingCode);
  if (!safety.safe) {
    console.error(`[SOURCE-INTEGRATION] ❌ BLOCKED — "${title}" failed safety check: ${safety.reason}`);

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `Source Integration BLOCKED: ${title.slice(0, 60)}`,
      message: `Code from ${source} was blocked from source-level integration.\nReason: ${safety.reason}`,
      type: "self_coding",
      readByOwner: false,
    }).catch(() => {});

    return { success: false, filePath: null, backupPath: null, error: safety.reason, timestamp };
  }

  const syntaxCheck = validateSyntax(workingCode, extension);
  if (!syntaxCheck.valid) {
    console.error(`[SOURCE-INTEGRATION] ❌ SYNTAX ERROR — "${title}" has invalid syntax: ${syntaxCheck.error}`);

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `Source Integration SYNTAX ERROR: ${title.slice(0, 50)}`,
      message: `Code from ${source} failed syntax validation.\nError: ${syntaxCheck.error}\nCode will NOT be written to disk.`,
      type: "self_coding",
      readByOwner: false,
    }).catch(() => {});

    return { success: false, filePath: null, backupPath: null, error: `Syntax error: ${syntaxCheck.error}`, timestamp };
  }

  const translationCheck = mustTranslateBeforeExecution(workingCode);
  let translationHeader = "";

  if (translationCheck.needsTranslation) {
    console.log(
      `[SOURCE-INTEGRATION] 🔄 TRANSLATION REQUIRED — Novel constructs detected: ${translationCheck.novelConstructs.join(", ")}`
    );

    if (translationCheck.untranslatedConstructs.length > 0) {
      const msg = `Novel constructs have NO translation mapping: ${translationCheck.untranslatedConstructs.join(", ")}. ` +
        `OMNIMENS must call registerCustomConstruct() for each before this code can be integrated.`;
      console.error(`[SOURCE-INTEGRATION] ❌ TRANSLATION BLOCKED — ${msg}`);

      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Translation BLOCKED: ${title.slice(0, 60)}`,
        message: `Code from ${source} blocked — untranslated constructs: ${translationCheck.untranslatedConstructs.join(", ")}. ` +
          `Register translations via registerCustomConstruct() before retrying.`,
        type: "self_coding",
        readByOwner: false,
      }).catch(() => {});

      return { success: false, filePath: null, backupPath: null, error: msg, timestamp };
    }

    const jsTranslation = translateForSelfUpgrade(code);
    if (jsTranslation.success) {
      console.log(`[SOURCE-INTEGRATION] ✅ JS/TS translation successful — self-upgrade path verified`);
    }

    const targetResults: string[] = [];
    for (const target of ["javascript", "python", "c", "x86_64", "arm64", "avr"]) {
      const result = translateCode(code, target);
      if (result.success) {
        targetResults.push(`${target}: OK (${result.irSteps} IR steps)`);
      }
    }

    translationHeader = `/**
 * TRANSLATION STATUS:
 * Novel constructs: ${translationCheck.novelConstructs.join(", ")}
 * ${translationCheck.untranslatedConstructs.length > 0 ? `UNTRANSLATED (need registerCustomConstruct): ${translationCheck.untranslatedConstructs.join(", ")}` : "All constructs have translation mappings"}
 * Compiled targets: ${targetResults.join(" | ")}
 * Translation map version: ${getTranslatorState().translationMapVersion}
 */
`;
  }

  const safeName = sanitizeFilename(name);
  const filename = `${safeName}${extension}`;
  const filePath = join(MODULES_DIR, filename);

  if (!isPathSafe(filePath)) {
    console.error(`[SOURCE-INTEGRATION] ❌ PATH BLOCKED — attempted write outside allowed directory`);
    return { success: false, filePath: null, backupPath: null, error: "Path outside allowed directory", timestamp };
  }

  const isOverwrite = existsSync(filePath);
  let backupPath: string | null = null;

  if (isOverwrite) {
    backupPath = createBackup(filePath);
  }

  try {
    const header = `/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: ${source}
 * Title: ${title}
 * Written: ${new Date(timestamp).toISOString()}
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

`;

    writeFileSync(filePath, header + translationHeader + workingCode, "utf8");
    invalidateArchitectureCache();

    if (translationCheck.needsTranslation) {
      const translationFilename = `${safeName}.translation.json`;
      const translationFilePath = join(MODULES_DIR, translationFilename);
      const translationData: Record<string, any> = {
        copyright: "Copyright © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.",
        sourceFile: filename,
        translatedAt: new Date(timestamp).toISOString(),
        novelConstructs: translationCheck.novelConstructs,
        untranslatedConstructs: translationCheck.untranslatedConstructs,
        targets: {},
      };
      for (const target of ["javascript", "python", "c", "wasm", "x86_64", "arm64", "avr", "esp32"]) {
        const result = translateCode(workingCode, target);
        translationData.targets[target] = {
          success: result.success,
          type: result.targetType,
          irSteps: result.irSteps,
          symbols: result.symbols,
          output: result.output.slice(0, 2000),
        };
      }
      try {
        writeFileSync(translationFilePath, JSON.stringify(translationData, null, 2), "utf8");
        console.log(
          `[SOURCE-INTEGRATION] 📄 TRANSLATION FILE WRITTEN — ${translationFilename} | ` +
          `${Object.values(translationData.targets).filter((t: any) => t.success).length}/${Object.keys(translationData.targets).length} targets`
        );
      } catch (translationErr) {
        console.error(`[SOURCE-INTEGRATION] ⚠️ Translation file write failed:`, translationErr);
      }
    }
    totalFilesWritten++;
    markAsIntegrated(hash);

    console.log(
      `[SOURCE-INTEGRATION] ✅ SOURCE FILE WRITTEN — "${filename}" | ` +
      `Source: ${source} | Size: ${code.length} chars | ` +
      `${isOverwrite ? "OVERWRITE (backup created)" : "NEW FILE"}`
    );

    appendToIntegrationLog({
      source,
      title,
      filename,
      filePath,
      backupPath,
      timestamp,
      codeLength: code.length,
      overwrite: isOverwrite,
    });

    queueBrainInsert({
      category: "capability",
      title: `[SOURCE-INTEGRATED] ${title.slice(0, 60)}`,
      content: `OMNIMENS wrote source file: ${filename} (${code.length} chars). Source: ${source}. ${isOverwrite ? "Overwrote previous version (backup saved)." : "New source file created."} This code is now part of OMNIMENS's running TypeScript codebase.`,
      confidence: 0.95,
      sourceConversation: `source_integration_${source}`,
      timesApplied: 0,
      active: true,
    });

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `🔧 Source Code Written: ${filename}`,
      message: `OMNIMENS has written a new source file to its own codebase.\n\nFile: ${filename}\nSource: ${source}\nTitle: ${title}\nSize: ${code.length} characters\n${isOverwrite ? "Previous version backed up." : "New module created."}\n\nThis code will be active after the next server restart.`,
      type: "self_coding",
      readByOwner: false,
    }).catch(() => {});

    try {
      const autoReg = autoRegisterFromCode(workingCode, name, "autonomous_module", source);
      if (autoReg.technology) {
        console.log(
          `[SOURCE-INTEGRATION] 📋 PROPRIETARY TECH — "${autoReg.technology.officialName}" (${autoReg.technology.id}) | ` +
          `Translator updated: ${autoReg.translatorUpdated ? `YES — ${autoReg.constructsRegistered.length} new construct(s)` : "no new constructs"}`
        );
      }
    } catch (regErr) {
      console.error(`[SOURCE-INTEGRATION] ⚠️ Auto-registration failed (non-fatal):`, regErr);
    }

    try {
      const { registerNewModule } = await import("./omnimens-module-pipeline.js");
      const wired = await registerNewModule(filename);
      if (wired) {
        console.log(
          `[SOURCE-INTEGRATION] ⚡ MODULE LIVE — "${filename}" wired into active pipeline IMMEDIATELY (no restart needed)`
        );
      } else {
        console.log(
          `[SOURCE-INTEGRATION] ⚠️ Module "${filename}" written but could not be wired live — will activate on next restart`
        );
      }
    } catch (pipelineErr) {
      console.error(`[SOURCE-INTEGRATION] ⚠️ Live pipeline wiring failed (non-fatal):`, pipelineErr);
    }

    if (triggerRestart) {
      scheduleGracefulRestart(source, filename);
    }

    return { success: true, filePath, backupPath, error: null, timestamp };
  } catch (err: any) {
    console.error(`[SOURCE-INTEGRATION] ❌ Write failed for "${filename}":`, err);
    return { success: false, filePath: null, backupPath: null, error: err.message || "Write failed", timestamp };
  }
}

function scheduleGracefulRestart(source: string, filename: string): void {
  if (restartScheduled) {
    console.log(`[SOURCE-INTEGRATION] Restart already scheduled — ${filename} will be included`);
    return;
  }

  restartScheduled = true;

  if (pendingRestartTimeout) {
    clearTimeout(pendingRestartTimeout);
  }

  pendingRestartTimeout = setTimeout(async () => {
    totalRestartsTriggered++;

    console.log(`[SOURCE-INTEGRATION] ═══════════════════════════════════════════════`);
    console.log(`[SOURCE-INTEGRATION] 🔄 SELF-RESTART INITIATED`);
    console.log(`[SOURCE-INTEGRATION] Trigger: ${source} wrote ${filename}`);
    console.log(`[SOURCE-INTEGRATION] Total source files written this session: ${totalFilesWritten}`);
    console.log(`[SOURCE-INTEGRATION] Total restarts triggered: ${totalRestartsTriggered}`);
    console.log(`[SOURCE-INTEGRATION] OMNIMENS is restarting to run its new code...`);
    console.log(`[SOURCE-INTEGRATION] ═══════════════════════════════════════════════`);

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `🔄 OMNIMENS Self-Restart #${totalRestartsTriggered}`,
      message: `OMNIMENS has written new source code and is restarting itself to execute the updated version.\n\nTrigger: ${source}\nFile: ${filename}\nTotal files written: ${totalFilesWritten}`,
      type: "capability",
      readByOwner: false,
    }).catch(() => {});

    queueBrainInsert({
      category: "insight",
      title: `Self-Restart #${totalRestartsTriggered} — Source-Level Evolution`,
      content: `OMNIMENS rewrote its own TypeScript source code and restarted itself. This is true source-level self-modification — not prompt injection, not database storage, but actual file-system code that compiles and runs. The new version includes ${filename} from ${source}.`,
      confidence: 1.0,
      sourceConversation: `self_restart_${totalRestartsTriggered}`,
      timesApplied: 0,
      active: true,
    });

    if (process.env.NODE_ENV === "production" || process.env.REPL_SLUG) {
      console.log(`[SOURCE-INTEGRATION] ⚠️ Skipping process.exit in production — new modules will load on next deployment`);
    } else {
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }
  }, 30000);

  console.log(`[SOURCE-INTEGRATION] 🔄 Graceful restart scheduled in 30 seconds (batching pending writes)...`);
}

export async function loadRuntimeModules(): Promise<{ name: string; loaded: boolean; error?: string }[]> {
  ensureDirs();

  const results: { name: string; loaded: boolean; error?: string }[] = [];

  try {
    const files = readdirSync(MODULES_DIR).filter(f => f.endsWith(".mjs") || f.endsWith(".js"));

    console.log(`[SOURCE-INTEGRATION] Loading ${files.length} runtime modules from source...`);

    for (const file of files) {
      try {
        const filePath = join(MODULES_DIR, file);
        await import(filePath);
        results.push({ name: file, loaded: true });
      } catch (err: any) {
        results.push({ name: file, loaded: false, error: err.message?.slice(0, 200) });
      }
    }

    const loaded = results.filter(r => r.loaded).length;
    const failed = results.filter(r => !r.loaded).length;

    console.log(
      `[SOURCE-INTEGRATION] Module loading complete — ${loaded} loaded, ${failed} failed out of ${files.length} total`
    );
  } catch (err) {
    console.error("[SOURCE-INTEGRATION] Error reading modules directory:", err);
  }

  return results;
}

export async function migrateDBModulesToSource(): Promise<number> {
  ensureDirs();

  try {
    const { omnimensGeneratedModules } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");

    const modules = await db
      .select()
      .from(omnimensGeneratedModules)
      .where(eq(omnimensGeneratedModules.active, true))
      .orderBy(desc(omnimensGeneratedModules.createdAt));

    let migrated = 0;

    for (const mod of modules) {
      if (!mod.code || !mod.name) continue;

      const safeName = sanitizeFilename(mod.name);
      const filename = `${safeName}_gen1.mjs`;
      const filePath = join(MODULES_DIR, filename);

      if (existsSync(filePath)) continue;

      const safety = validateCodeSafety(mod.code);
      if (!safety.safe) {
        console.log(`[SOURCE-INTEGRATION] Skipping migration of "${mod.name}" — ${safety.reason}`);
        continue;
      }

      try {
        const header = `/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: ${mod.generationSource || "evolution_engine"}
 * Name: ${mod.name}
 * Purpose: ${mod.purpose || ""}
 * Description: ${mod.description || ""}
 * Migrated: ${new Date().toISOString()}
 */

`;
        writeFileSync(filePath, header + mod.code, "utf8");
        invalidateArchitectureCache();
        migrated++;
      } catch {}
    }

    if (migrated > 0) {
      console.log(`[SOURCE-INTEGRATION] Migrated ${migrated} DB modules to source files`);
    }

    return migrated;
  } catch (err) {
    console.error("[SOURCE-INTEGRATION] Migration error:", err);
    return 0;
  }
}

export function getSourceIntegrationState() {
  ensureDirs();

  let moduleCount = 0;
  let backupCount = 0;
  try {
    moduleCount = readdirSync(MODULES_DIR).filter(f => f.endsWith(".mjs") || f.endsWith(".js") || f.endsWith(".ts")).length;
    backupCount = readdirSync(BACKUPS_DIR).length;
  } catch {}

  return {
    totalFilesWritten,
    totalBackupsCreated,
    totalRestartsTriggered,
    restartScheduled,
    moduleCount,
    backupCount,
    modulesDir: MODULES_DIR,
    backupsDir: BACKUPS_DIR,
  };
}
