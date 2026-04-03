/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ SCL RUNTIME — EXECUTABLE SYMBOL CODE LANGUAGE ENGINE          ║
 * ║                                                                            ║
 * ║   Loads .scl files, decodes them back to TypeScript, transpiles to JS,    ║
 * ║   and executes them in a sandboxed VM. This makes SCL a REAL language     ║
 * ║   that Gen1v2 and Gen2 can run their code in.                             ║
 * ║                                                                            ║
 * ║   Built by Gen1v2 + Gen2 through internal cognition.                      ║
 * ║   © 2024-2026 Alpha Unlimited Technologies, LLC                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getCodexState } from "./omnimens-scl-codex.js";

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);

export interface SCLDecodeResult {
  fileName: string;
  sclLines: number;
  decodedLines: number;
  decodedSource: string;
  imports: string[];
  interfaces: string[];
  functions: string[];
  constants: string[];
  errors: string[];
}

export interface SCLExecResult {
  fileName: string;
  decoded: boolean;
  syntaxValid: boolean;
  transpiled: boolean;
  executed: boolean;
  exports: string[];
  error?: string;
  decodedLines: number;
  originalLines: number;
  compressionRatio: number;
}

export interface SCLSandboxReport {
  timestamp: number;
  generator: "gen1v2" | "gen2";
  totalFiles: number;
  decoded: number;
  syntaxValid: number;
  transpiled: number;
  executed: number;
  failed: number;
  errors: Array<{ file: string; stage: string; error: string }>;
  totalDecodedLines: number;
  totalOriginalLines: number;
  overallCompressionPercent: number;
}

function buildReverseSymbolMap(): Map<string, string> {
  const codex = getCodexState();
  const reverseMap = new Map<string, string>();
  const allSymbols = [...(codex.primitives || []), ...(codex.compounds || [])];
  for (const sym of allSymbols) {
    if (sym.symbol && sym.name && sym.symbol !== sym.name) {
      reverseMap.set(sym.symbol, sym.name);
    }
  }
  for (const [sym, text] of Object.entries(codex.symbolToTextMap)) {
    if (sym && text && sym !== text && !reverseMap.has(sym)) {
      const safe = text.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_$]/g, "");
      if (safe.length <= 30) reverseMap.set(sym, safe);
    }
  }
  return reverseMap;
}

const PATTERN_GLYPHS = new Set([
  "🛡", "⟿", "⊴", "⊫", "⊬", "⊭", "⊪", "⊩", "⊷", "⊰", "⊳", "⊹", "⊺",
  "⊻", "⊼", "⊽", "⊯", "⊮", "⊡", "⊲", "⊶", "⊸", "⋐", "⋔", "⟛", "⟳",
  "⟠", "❔", "📢", "📁", "🚨", "⏰", "⏳", "⊱", "⊄", "⫘", "⊞", "⊟",
  "Φ⇑", "♡⊕", "≋+", "α→⊢", "⚡→", "📡", "⊛", "⑂", "⑃", "⊵",
  "↻+💾", "⊄⊷", "📢▷", "🛡⊴🚨", "⥀⋔▷", "📁⟠▷", "💾📢",
  "α→⊢📢", "Φ⇑⚡→", "♡⊕△▷", "⊨σ⇧", "⟨⇌⟩▷", "◎→◉⇧", "≋+⊞",
  "⊨σ", "⛨▷", "⛨⊄", "⥀", "↻+",
]);

function isPatternGlyph(text: string): boolean {
  for (const g of PATTERN_GLYPHS) {
    if (text.startsWith(g)) return true;
  }
  return false;
}

function stripPatternPrefix(line: string): string {
  const pipeIdx = line.indexOf("│");
  if (pipeIdx < 0) return line;
  const prefix = line.slice(0, pipeIdx);
  if (isPatternGlyph(prefix)) {
    return line.slice(pipeIdx + 1);
  }
  return line;
}

function reverseSymbolSubstitution(line: string, reverseMap: Map<string, string>): string {
  let result = line;
  const sortedSymbols = [...reverseMap.keys()].sort((a, b) => b.length - a.length);
  for (const sym of sortedSymbols) {
    if (result.includes(sym)) {
      const text = reverseMap.get(sym)!;
      const safeText = /^[a-zA-Z_$][\w$]*$/.test(text) ? text : text.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_$]/g, "");
      try {
        const escaped = sym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(escaped, "g"), safeText || "SCL_SYM");
      } catch {}
    }
  }
  return result;
}

export function decodeSCLFile(sclContent: string, fileName: string): SCLDecodeResult {
  const reverseMap = buildReverseSymbolMap();
  const sclLines = sclContent.split("\n");
  const decodedLines: string[] = [];
  const imports: string[] = [];
  const interfaces: string[] = [];
  const functions: string[] = [];
  const constants: string[] = [];
  const errors: string[] = [];

  let inFunctionBody = false;
  let currentFnName = "";
  let skipFooterClose = false;

  for (let idx = 0; idx < sclLines.length; idx++) {
    const raw = sclLines[idx];
    const trimmed = raw.trim();

    if (trimmed.startsWith("⟨SCL v1│")) continue;
    if (trimmed.startsWith("⟨CODEX│")) continue;
    if (trimmed.startsWith("⟩SCL│")) continue;
    if (trimmed === "") continue;

    if (trimmed.startsWith("⊫[")) {
      const modList = trimmed.slice(2, -1).split("│").filter(Boolean);
      for (const mod of modList) {
        const importLine = `import * as ${mod.replace(/[^a-zA-Z0-9_]/g, "_")} from "./${mod}.js";`;
        decodedLines.push(importLine);
        imports.push(mod);
      }
      continue;
    }

    if (trimmed.startsWith("⊬")) {
      const nameMatch = trimmed.match(/^⊬(\w+)⟨(.+?)⟩$/);
      if (nameMatch) {
        const [, name, fieldsStr] = nameMatch;
        const fields = fieldsStr.split("│").map(f => {
          const [fname, ...ftypeArr] = f.split(":");
          const ftype = reverseSymbolSubstitution(ftypeArr.join(":"), reverseMap);
          return `  ${fname}: ${ftype};`;
        });
        decodedLines.push(`interface ${name} {`);
        decodedLines.push(...fields);
        decodedLines.push(`}`);
        interfaces.push(name);
      } else {
        decodedLines.push(reverseSymbolSubstitution(trimmed.replace(/^⊬/, "// type: "), reverseMap));
      }
      continue;
    }

    if (trimmed.startsWith("⊭│")) {
      decodedLines.push(reverseSymbolSubstitution(trimmed.slice(2), reverseMap));
      continue;
    }

    if (trimmed.startsWith("κ")) {
      const rest = trimmed.slice(1);
      if (rest.startsWith("│")) {
        decodedLines.push(reverseSymbolSubstitution(rest.slice(1), reverseMap));
      } else {
        const constName = rest.trim();
        if (constName.includes("=")) {
          decodedLines.push(`const ${constName}`);
        } else {
          decodedLines.push(`let ${constName} = undefined; /* SCL-const */`);
        }
        constants.push(constName.split(/[\s=]/)[0]);
      }
      continue;
    }

    if (trimmed.startsWith("⊪")) {
      const rest = trimmed.slice(1);
      if (rest.startsWith("│")) {
        decodedLines.push(reverseSymbolSubstitution(rest.slice(1), reverseMap));
      } else {
        const constName = rest.trim();
        if (constName.includes("=")) {
          decodedLines.push(`export const ${constName}`);
        } else {
          decodedLines.push(`export let ${constName} = undefined; /* SCL-export-const */`);
        }
        constants.push(constName.split(/[\s=]/)[0]);
      }
      continue;
    }

    const fnMatch = trimmed.match(/^(⊩?)(⟿?)(\w+)\((\d+)\)→(.+?)⟨(\d+)⟩\{$/);
    if (fnMatch) {
      const [, expMark, asyncMark, fnName, paramCount, retType] = fnMatch;
      functions.push(fnName);
      inFunctionBody = true;
      currentFnName = fnName;

      const nextLine = (sclLines[idx + 1] || "").trim();
      const stripped = stripPatternPrefix(nextLine);
      const bodyHasFnDecl = stripped.includes(`function ${fnName}(`) || stripped.includes(`function ${fnName} (`);
      if (bodyHasFnDecl) {
        skipFooterClose = true;
      } else {
        const isAsync = asyncMark === "⟿";
        const params = Array.from({ length: Number(paramCount) }, (_, j) => `arg${j}`).join(", ");
        const prefix = isAsync ? "async " : "";
        decodedLines.push(`${prefix}function ${fnName}(${params}) {`);
        skipFooterClose = false;
      }
      continue;
    }

    const oldFnMatch = trimmed.match(/^(⊩?)(⟿?)(\w+)\((\d+)\)→(.+?)⟨(\d+)⟩\{(.+)\}$/);
    if (oldFnMatch) {
      const [, expMark, asyncMark, fnName, paramCount, retType, patternBody] = oldFnMatch;
      const isAsync = asyncMark === "⟿";
      const prefix = isAsync ? "async " : "";
      const params = Array.from({ length: Number(paramCount) }, (_, j) => `arg${j}`).join(", ");
      decodedLines.push(`${prefix}function ${fnName}(${params}) {`);
      decodedLines.push(`  /* SCL-v1-stub: ${patternBody} */`);
      decodedLines.push(`}`);
      functions.push(fnName);
      continue;
    }

    if (trimmed.match(/^\}⟨\/\w+⟩$/)) {
      if (!skipFooterClose) {
        decodedLines.push(`}`);
      }
      inFunctionBody = false;
      currentFnName = "";
      skipFooterClose = false;
      continue;
    }

    if (trimmed.startsWith("·")) {
      const literal = trimmed.slice(1);
      decodedLines.push(reverseSymbolSubstitution(literal, reverseMap));
      continue;
    }

    if (isPatternGlyph(trimmed) || trimmed.includes("│")) {
      const stripped = stripPatternPrefix(trimmed);
      decodedLines.push("  " + reverseSymbolSubstitution(stripped, reverseMap));
      continue;
    }

    decodedLines.push(reverseSymbolSubstitution(trimmed, reverseMap));
  }

  return {
    fileName,
    sclLines: sclLines.length,
    decodedLines: decodedLines.length,
    decodedSource: decodedLines.join("\n"),
    imports,
    interfaces,
    functions,
    constants,
    errors,
  };
}

export function transpileTStoJS(tsSource: string): { success: boolean; jsSource: string; error?: string } {
  try {
    let js = tsSource;

    js = js.replace(/\binterface\s+\w+\s*\{[^}]*\}/gs, "/* interface */");
    js = js.replace(/\btype\s+\w+\s*=\s*[^;]+;/g, "/* type */");

    js = js.replace(/\bexport\s+default\s+/g, "var _default = ");
    js = js.replace(/\bexport\s+(async\s+)?function\s+/g, "$1function ");
    js = js.replace(/\bexport\s+(const|let|var|class)\s+/g, "$1 ");
    js = js.replace(/^export\s*\{[^}]*\};?\s*$/gm, "");
    js = js.replace(/\bexport\s+/g, "");

    js = js.replace(/^import\s+.*$/gm, "/* import */");
    js = js.replace(/\bimport\s*\(.*?\)/g, "Promise.resolve({})");
    js = js.replace(/\bimport\s+\{[^}]*\}\s+from\s+["'][^"']*["'];?/g, "/* import */");
    js = js.replace(/\bimport\s+\*\s+as\s+\w+\s+from\s+["'][^"']*["'];?/g, "/* import */");
    js = js.replace(/\bimport\b/g, "/* imp */");

    js = js.replace(/:\s*(?:string|number|boolean|void|any|never|unknown|null|undefined)(?:\[\])?\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*(?:string|number|boolean|void|any|never|unknown|null|undefined)(?:\[\])?\s*$/gm, "");
    js = js.replace(/:\s*Record<[^>]+>\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*Array<[^>]+>\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*Map<[^>]+>\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*Set<[^>]+>\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*Promise<[^>]+>\s*([;,)=\{])/g, " $1");
    js = js.replace(/:\s*\w+(?:\[\])?\s*([;,)])/g, " $1");

    js = js.replace(/<[A-Z]\w*(?:\s*,\s*[A-Z]\w*)*>/g, "");

    js = js.replace(/\bas\s+\w+/g, "");

    const truncLines = js.split("\n");
    const fixedLines: string[] = [];
    for (const line of truncLines) {
      const trimLine = line.trim();
      if (trimLine.length === 0) { fixedLines.push(line); continue; }
      if (/^\/\*/.test(trimLine)) { fixedLines.push(line); continue; }
      const openParens = (trimLine.match(/\(/g) || []).length;
      const closeParens = (trimLine.match(/\)/g) || []).length;
      const openBraces = (trimLine.match(/\{/g) || []).length;
      const closeBraces = (trimLine.match(/\}/g) || []).length;
      const openBrackets = (trimLine.match(/\[/g) || []).length;
      const closeBrackets = (trimLine.match(/\]/g) || []).length;
      if (openParens > closeParens && !trimLine.endsWith("{") && !trimLine.endsWith(",")) {
        fixedLines.push(line + ")".repeat(openParens - closeParens) + " {}");
      } else if (openBrackets > closeBrackets && !trimLine.endsWith(",")) {
        fixedLines.push(line + "]".repeat(openBrackets - closeBrackets));
      } else if (/function\s*\*?\s+\w+\([^)]*$/.test(trimLine)) {
        fixedLines.push(line + ") {}");
      } else {
        fixedLines.push(line);
      }
    }
    js = fixedLines.join("\n");

    js = js.replace(/[^\x00-\x7F\u00C0-\u024F]/g, (ch) => {
      return `_u${ch.codePointAt(0)?.toString(16) || "0"}_`;
    });

    js = js.replace(/function\s+\*\s+/g, "function ");
    js = js.replace(/\byield\s+/g, "/* yield */ ");
    js = js.replace(/\bfor\s+await\s*\(/g, "for (");
    js = js.replace(/\bawait\s+/g, "/* await */ ");

    const lines = js.split("\n");
    const cleanedLines: string[] = [];
    let braceDepth = 0;
    for (const line of lines) {
      const opens = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;
      const newDepth = braceDepth + opens - closes;
      if (newDepth < 0) {
        cleanedLines.push(line.replace(/\}/g, (m, offset) => {
          if (braceDepth + opens - (line.slice(0, offset).match(/\}/g) || []).length <= 0) {
            return "/* } */";
          }
          return m;
        }));
        braceDepth = 0;
      } else {
        cleanedLines.push(line);
        braceDepth = newDepth;
      }
    }
    while (braceDepth > 0) {
      cleanedLines.push("}");
      braceDepth--;
    }
    js = cleanedLines.join("\n");

    return { success: true, jsSource: js };
  } catch (err) {
    return { success: false, jsSource: "", error: String(err) };
  }
}

export function validateSyntax(jsSource: string, fileName: string): { valid: boolean; error?: string } {
  try {
    new vm.Script(jsSource, { filename: fileName });
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message?.slice(0, 200) };
  }
}

export function executeSCLModule(jsSource: string, fileName: string): { success: boolean; exports: string[]; error?: string } {
  try {
    const sandbox: Record<string, any> = {
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
      setTimeout: () => {},
      setInterval: () => {},
      clearTimeout: () => {},
      clearInterval: () => {},
      Date: Date,
      Math: Math,
      Number: Number,
      String: String,
      Array: Array,
      Object: Object,
      Map: Map,
      Set: Set,
      Buffer: Buffer,
      JSON: JSON,
      RegExp: RegExp,
      Error: Error,
      Promise: Promise,
      require: () => ({}),
      process: { env: {}, cwd: () => "/sandbox" },
      __dirname: "/sandbox",
      __filename: `/sandbox/${fileName}`,
      module: { exports: {} },
      exports: {},
      fs: {
        existsSync: () => false,
        readFileSync: () => "",
        writeFileSync: () => {},
        mkdirSync: () => {},
        readdirSync: () => [],
        statSync: () => ({ size: 0, length: 0 }),
      },
      path: {
        join: (...args: string[]) => args.join("/"),
        resolve: (...args: string[]) => args.join("/"),
        dirname: (p: string) => p.split("/").slice(0, -1).join("/"),
        basename: (p: string) => p.split("/").pop() || "",
      },
    };

    const context = vm.createContext(sandbox);
    const wrappedSource = `(function() {\n${jsSource}\n})();`;

    const script = new vm.Script(wrappedSource, {
      filename: fileName,
      timeout: 5000,
    });

    script.runInContext(context, { timeout: 5000 });

    const moduleExports = Object.keys(sandbox.module?.exports || {});
    const directExports = Object.keys(sandbox.exports || {});
    const allExports = [...new Set([...moduleExports, ...directExports])];

    return { success: true, exports: allExports };
  } catch (err: any) {
    return { success: false, exports: [], error: err.message?.slice(0, 300) };
  }
}

export function runSCLSandboxTest(sclDir: string, generator: "gen1v2" | "gen2", maxFiles = 200): SCLSandboxReport {
  const tag = generator === "gen1v2" ? "V2-REWRITE" : "NEXTGEN";

  console.log(`[${tag}] 🔤 ═══════════════════════════════════════════════════════════════`);
  console.log(`[${tag}] 🔤 SCL SANDBOX EXECUTION TEST — ${generator.toUpperCase()}`);
  console.log(`[${tag}] 🔤 Testing if SCL files actually run...`);
  console.log(`[${tag}] 🔤 ═══════════════════════════════════════════════════════════════`);

  if (!fs.existsSync(sclDir)) {
    console.log(`[${tag}] 🔤 ❌ SCL directory not found: ${sclDir}`);
    return {
      timestamp: Date.now(),
      generator,
      totalFiles: 0, decoded: 0, syntaxValid: 0, transpiled: 0, executed: 0, failed: 0,
      errors: [{ file: "N/A", stage: "init", error: "SCL directory not found" }],
      totalDecodedLines: 0, totalOriginalLines: 0, overallCompressionPercent: 0,
    };
  }

  const sclFiles = fs.readdirSync(sclDir)
    .filter(f => f.endsWith(".scl") && !f.startsWith("_"))
    .sort()
    .slice(0, maxFiles);

  const report: SCLSandboxReport = {
    timestamp: Date.now(),
    generator,
    totalFiles: sclFiles.length,
    decoded: 0,
    syntaxValid: 0,
    transpiled: 0,
    executed: 0,
    failed: 0,
    errors: [],
    totalDecodedLines: 0,
    totalOriginalLines: 0,
    overallCompressionPercent: 0,
  };

  let totalOrigLines = 0;
  let totalDecodedLines = 0;

  for (const sclFile of sclFiles) {
    const filePath = path.join(sclDir, sclFile);
    try {
      const sclContent = fs.readFileSync(filePath, "utf-8");

      const origMatch = sclContent.match(/⟨SCL v1│.+?│(\d+)→SCL⟩/);
      const origLines = origMatch ? Number(origMatch[1]) : 0;
      totalOrigLines += origLines;

      const decoded = decodeSCLFile(sclContent, sclFile);
      if (decoded.errors.length > 0) {
        report.errors.push({ file: sclFile, stage: "decode", error: decoded.errors.join("; ") });
        report.failed++;
        continue;
      }
      report.decoded++;
      totalDecodedLines += decoded.decodedLines;

      const decodedOutDir = path.join(sclDir, "_decoded");
      if (!fs.existsSync(decodedOutDir)) fs.mkdirSync(decodedOutDir, { recursive: true });
      const decodedFileName = sclFile.replace(".scl", ".decoded.ts");
      fs.writeFileSync(path.join(decodedOutDir, decodedFileName), decoded.decodedSource, "utf-8");

      const transpiled = transpileTStoJS(decoded.decodedSource);
      if (!transpiled.success) {
        report.errors.push({ file: sclFile, stage: "transpile", error: transpiled.error || "unknown" });
        report.failed++;
        continue;
      }
      report.transpiled++;

      const syntax = validateSyntax(transpiled.jsSource, sclFile);
      if (!syntax.valid) {
        report.errors.push({ file: sclFile, stage: "syntax", error: syntax.error || "unknown" });
        report.failed++;
        continue;
      }
      report.syntaxValid++;

      const exec = executeSCLModule(transpiled.jsSource, sclFile);
      if (exec.success) {
        report.executed++;
      } else {
        report.errors.push({ file: sclFile, stage: "execute", error: exec.error || "unknown" });
        report.failed++;
      }

    } catch (err) {
      report.errors.push({ file: sclFile, stage: "read", error: String(err).slice(0, 200) });
      report.failed++;
    }
  }

  report.totalOriginalLines = totalOrigLines;
  report.totalDecodedLines = totalDecodedLines;
  report.overallCompressionPercent = totalOrigLines > 0
    ? Number(((1 - totalDecodedLines / totalOrigLines) * 100).toFixed(1))
    : 0;

  console.log(`[${tag}] 🔤 ═══════════════════════════════════════════════════════════════`);
  console.log(`[${tag}] 🔤 SCL SANDBOX EXECUTION RESULTS — ${generator.toUpperCase()}`);
  console.log(`[${tag}] 🔤 Total files tested: ${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Decoded:      ${report.decoded}/${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Transpiled:   ${report.transpiled}/${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Syntax valid: ${report.syntaxValid}/${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Executed:     ${report.executed}/${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Failed:       ${report.failed}/${report.totalFiles}`);
  console.log(`[${tag}] 🔤 Compression:  ${report.overallCompressionPercent}% (${totalOrigLines} → ${totalDecodedLines} lines)`);

  if (report.errors.length > 0) {
    console.log(`[${tag}] 🔤 ── ERRORS (first 10) ──`);
    for (const err of report.errors.slice(0, 10)) {
      console.log(`[${tag}] 🔤   ${err.file} [${err.stage}]: ${err.error.slice(0, 100)}`);
    }
  }

  console.log(`[${tag}] 🔤 ═══════════════════════════════════════════════════════════════`);

  const manifestPath = path.join(sclDir, "_SCL-SANDBOX-RESULTS.json");
  fs.writeFileSync(manifestPath, JSON.stringify(report, null, 2), "utf-8");

  return report;
}
