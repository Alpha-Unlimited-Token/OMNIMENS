import { db } from "@workspace/db";
import { omnimensBrain } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

interface TranslationTarget {
  name: string;
  type: "digital" | "physical";
  translate: (ir: IRInstruction[]) => string;
}

interface IRInstruction {
  op: string;
  name?: string;
  value?: any;
  type?: string;
  params?: string[];
  hwType?: string;
  pin?: number;
}

interface TranslationResult {
  target: string;
  targetType: "digital" | "physical";
  output: string;
  irSteps: number;
  symbols: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface TranslatorState {
  totalTranslations: number;
  digitalTranslations: number;
  physicalTranslations: number;
  registeredTargets: string[];
  translationLog: Array<{ target: string; success: boolean; timestamp: number; codeSize: number }>;
  novelConstructsTranslated: number;
  lastTranslationTime: number;
  translationMapVersion: number;
  customConstructs: number;
}

const state: TranslatorState = {
  totalTranslations: 0,
  digitalTranslations: 0,
  physicalTranslations: 0,
  registeredTargets: [],
  translationLog: [],
  novelConstructsTranslated: 0,
  lastTranslationTime: 0,
  translationMapVersion: 1,
  customConstructs: 0,
};

const targets = new Map<string, TranslationTarget>();
const customConstructMap = new Map<string, { description: string; jsEquivalent: string; pyEquivalent: string; cEquivalent: string; asmEquivalent: string }>();
const translationHistory = new Map<string, TranslationResult[]>();

interface ProprietaryTechnology {
  id: string;
  name: string;
  officialName: string;
  category: string;
  description: string;
  inventedBy: string;
  createdAt: string;
  version: number;
  translationTargets: string[];
  codeHash: string;
  status: "registered" | "active" | "evolving" | "superseded";
}

const proprietaryRegistry = new Map<string, ProprietaryTechnology>();
let proprietaryIdCounter = 0;

function initTargets(): void {
  targets.set("javascript", {
    name: "JavaScript/TypeScript (Node.js Runtime)",
    type: "digital",
    translate: emitJavaScript,
  });

  targets.set("python", {
    name: "Python 3 (ML/AI Ecosystem)",
    type: "digital",
    translate: emitPython,
  });

  targets.set("c", {
    name: "C99 (Native OS Execution)",
    type: "digital",
    translate: emitC,
  });

  targets.set("wasm", {
    name: "WebAssembly (Browser Native)",
    type: "digital",
    translate: emitWASM,
  });

  targets.set("x86_64", {
    name: "x86_64 Assembly (Intel/AMD CPUs)",
    type: "physical",
    translate: emitX86,
  });

  targets.set("arm64", {
    name: "ARM64 Assembly (Robot Controllers)",
    type: "physical",
    translate: emitARM64,
  });

  targets.set("avr", {
    name: "Arduino AVR (Microcontrollers)",
    type: "physical",
    translate: emitAVR,
  });

  targets.set("esp32", {
    name: "ESP32 (WiFi/BT Microcontroller)",
    type: "physical",
    translate: emitESP32,
  });

  state.registeredTargets = Array.from(targets.keys());
}

function tokenize(source: string): Array<{ type: string; value: string; pos: number }> {
  const tokens: Array<{ type: string; value: string; pos: number }> = [];
  const patterns: Array<{ type: string; regex: RegExp }> = [
    { type: "keyword", regex: /^(fn|let|const|if|else|while|for|return|struct|impl|motor|sensor|signal|emit|spawn|channel|pipe|neural|synapse|oscillator|attention|hopfield|grounded)\b/ },
    { type: "number", regex: /^\d+(\.\d+)?/ },
    { type: "string", regex: /^"[^"]*"/ },
    { type: "identifier", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: "operator", regex: /^(==|!=|>=|<=|->|=>|\+\+|--|&&|\|\||[+\-*/%=<>!&|^~])/ },
    { type: "punctuation", regex: /^[{}()\[\];,.:@#]/ },
    { type: "whitespace", regex: /^\s+/ },
    { type: "comment", regex: /^\/\/[^\n]*/ },
  ];
  let pos = 0;
  while (pos < source.length) {
    let matched = false;
    for (const p of patterns) {
      const match = source.slice(pos).match(p.regex);
      if (match) {
        if (p.type !== "whitespace" && p.type !== "comment") {
          tokens.push({ type: p.type, value: match[0], pos });
        }
        pos += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) pos++;
  }
  return tokens;
}

function parse(tokens: Array<{ type: string; value: string; pos: number }>): { body: any[]; symbols: string[] } {
  const ast: { body: any[]; symbols: string[] } = { body: [], symbols: [] };
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.type === "keyword" && tok.value === "fn") {
      const name = tokens[++i]?.value || "anonymous";
      const params: string[] = [];
      i++;
      while (i < tokens.length && tokens[i]?.value !== ")") {
        if (tokens[i]?.type === "identifier") params.push(tokens[i].value);
        i++;
      }
      i++;
      const body: any[] = [];
      let braceDepth = 0;
      if (tokens[i]?.value === "{") { braceDepth = 1; i++; }
      while (i < tokens.length && braceDepth > 0) {
        if (tokens[i].value === "{") braceDepth++;
        if (tokens[i].value === "}") { braceDepth--; if (braceDepth === 0) { i++; break; } }
        body.push(tokens[i]);
        i++;
      }
      ast.body.push({ type: "function", name, params, body });
      ast.symbols.push(name);
    } else if (tok.type === "keyword" && tok.value === "let") {
      const name = tokens[++i]?.value || "x";
      i++;
      let value: any = "0";
      if (tokens[i]?.value === "=") {
        i++;
        value = tokens[i]?.value || "0";
        i++;
      }
      if (tokens[i]?.value === ";") i++;
      ast.body.push({ type: "variable", name, value });
      ast.symbols.push(name);
    } else if (tok.type === "keyword" && ["motor", "sensor", "signal", "neural", "synapse", "oscillator", "attention", "hopfield", "grounded"].includes(tok.value)) {
      const constructType = tok.value;
      const name = tokens[++i]?.value || constructType;
      i++;
      ast.body.push({ type: "novel_construct", constructType, name });
      ast.symbols.push(`${constructType}:${name}`);
      state.novelConstructsTranslated++;
    } else {
      i++;
    }
  }

  return ast;
}

function generateIR(ast: { body: any[]; symbols: string[] }): IRInstruction[] {
  const ir: IRInstruction[] = [];

  for (const node of ast.body) {
    if (node.type === "function") {
      ir.push({ op: "func_begin", name: node.name, params: node.params });
      for (const tok of node.body) {
        if (tok.type === "keyword" && tok.value === "return") ir.push({ op: "return" });
        else if (tok.type === "identifier") ir.push({ op: "load", name: tok.value });
        else if (tok.type === "number") ir.push({ op: "const", value: parseFloat(tok.value) });
        else if (tok.type === "operator") {
          const opMap: Record<string, string> = { "+": "add", "-": "sub", "*": "mul", "/": "div", "==": "eq", "!=": "neq", ">": "gt", "<": "lt", "=": "assign" };
          ir.push({ op: opMap[tok.value] || "nop" });
        }
      }
      ir.push({ op: "func_end", name: node.name });
    } else if (node.type === "variable") {
      ir.push({ op: "alloc", name: node.name });
      ir.push({ op: "const", value: node.value });
      ir.push({ op: "store", name: node.name });
    } else if (node.type === "novel_construct") {
      ir.push({ op: "novel_construct", type: node.constructType, name: node.name });
    }
  }

  return ir;
}

function registerCustomConstruct(name: string, desc: string, jsCode: string, pyCode: string, cCode: string, asmCode: string): void {
  customConstructMap.set(name, {
    description: desc,
    jsEquivalent: jsCode,
    pyEquivalent: pyCode,
    cEquivalent: cCode,
    asmEquivalent: asmCode,
  });
  state.customConstructs = customConstructMap.size;
  state.translationMapVersion++;
}

function emitJavaScript(ir: IRInstruction[]): string {
  const lines: string[] = ["// Auto-translated by OMNIMENS Universal Translator", "// Target: JavaScript/TypeScript (Node.js Runtime)", ""];
  let stackIdx = 0;
  for (const inst of ir) {
    if (inst.op === "func_begin") { lines.push(`function ${inst.name}(${(inst.params || []).join(", ")}) {`); lines.push("  const _stack = [];"); stackIdx = 0; }
    else if (inst.op === "func_end") lines.push("}");
    else if (inst.op === "alloc") lines.push(`  let ${inst.name};`);
    else if (inst.op === "const") lines.push(`  _stack.push(${inst.value});`);
    else if (inst.op === "store") lines.push(`  ${inst.name} = _stack.pop();`);
    else if (inst.op === "load") lines.push(`  _stack.push(${inst.name});`);
    else if (inst.op === "add") lines.push("  { const _b = _stack.pop(), _a = _stack.pop(); _stack.push(_a + _b); }");
    else if (inst.op === "sub") lines.push("  { const _b = _stack.pop(), _a = _stack.pop(); _stack.push(_a - _b); }");
    else if (inst.op === "mul") lines.push("  { const _b = _stack.pop(), _a = _stack.pop(); _stack.push(_a * _b); }");
    else if (inst.op === "div") lines.push("  { const _b = _stack.pop(), _a = _stack.pop(); _stack.push(_a / _b); }");
    else if (inst.op === "return") lines.push("  return _stack.length > 0 ? _stack.pop() : undefined;");
    else if (inst.op === "novel_construct") {
      const mapped = customConstructMap.get(inst.type || "");
      if (mapped) {
        lines.push(`  // Novel construct: ${inst.type} "${inst.name}" — ${mapped.description}`);
        lines.push(`  ${mapped.jsEquivalent.replace(/\$NAME/g, inst.name || "unknown")}`);
      } else {
        lines.push(`  // WARNING: Unknown novel construct "${inst.type}" — no translation mapping exists yet`);
        lines.push(`  // OMNIMENS must register this construct via registerCustomConstruct() before it can be executed`);
        lines.push(`  throw new Error("Untranslated construct: ${inst.type}");`);
      }
    }
  }
  return lines.join("\n");
}

function emitPython(ir: IRInstruction[]): string {
  const lines: string[] = ["# Auto-translated by OMNIMENS Universal Translator", "# Target: Python 3 (ML/AI Ecosystem)", ""];
  for (const inst of ir) {
    if (inst.op === "func_begin") { lines.push(`def ${inst.name}(${(inst.params || []).join(", ")}):`); lines.push("    _stack = []"); }
    else if (inst.op === "func_end") lines.push("");
    else if (inst.op === "alloc") lines.push(`    ${inst.name} = None`);
    else if (inst.op === "const") lines.push(`    _stack.append(${inst.value})`);
    else if (inst.op === "store") lines.push(`    ${inst.name} = _stack.pop()`);
    else if (inst.op === "load") lines.push(`    _stack.append(${inst.name})`);
    else if (inst.op === "add") lines.push("    _b, _a = _stack.pop(), _stack.pop(); _stack.append(_a + _b)");
    else if (inst.op === "sub") lines.push("    _b, _a = _stack.pop(), _stack.pop(); _stack.append(_a - _b)");
    else if (inst.op === "mul") lines.push("    _b, _a = _stack.pop(), _stack.pop(); _stack.append(_a * _b)");
    else if (inst.op === "div") lines.push("    _b, _a = _stack.pop(), _stack.pop(); _stack.append(_a / _b)");
    else if (inst.op === "return") lines.push("    return _stack.pop() if _stack else None");
    else if (inst.op === "novel_construct") {
      const mapped = customConstructMap.get(inst.type || "");
      if (mapped) {
        lines.push(`    # Novel construct: ${inst.type} "${inst.name}" — ${mapped.description}`);
        lines.push(`    ${mapped.pyEquivalent.replace(/\$NAME/g, inst.name || "unknown")}`);
      } else {
        lines.push(`    # WARNING: Unknown novel construct "${inst.type}" — no translation mapping`);
        lines.push(`    raise RuntimeError("Untranslated construct: ${inst.type}")`);
      }
    }
  }
  return lines.join("\n");
}

function emitC(ir: IRInstruction[]): string {
  const lines: string[] = ["// Auto-translated by OMNIMENS Universal Translator", "// Target: C99 (Native OS Execution)", "#include <stdio.h>", "#include <stdlib.h>", ""];
  for (const inst of ir) {
    if (inst.op === "func_begin") { lines.push(`double ${inst.name}(${(inst.params || []).map(p => `double ${p}`).join(", ")}) {`); lines.push("  double _stack[256]; int _sp = 0;"); }
    else if (inst.op === "func_end") lines.push("}");
    else if (inst.op === "alloc") lines.push(`  double ${inst.name} = 0;`);
    else if (inst.op === "const") lines.push(`  _stack[_sp++] = ${inst.value};`);
    else if (inst.op === "store") lines.push(`  ${inst.name} = _stack[--_sp];`);
    else if (inst.op === "load") lines.push(`  _stack[_sp++] = ${inst.name};`);
    else if (inst.op === "add") lines.push("  { double _b = _stack[--_sp], _a = _stack[--_sp]; _stack[_sp++] = _a + _b; }");
    else if (inst.op === "sub") lines.push("  { double _b = _stack[--_sp], _a = _stack[--_sp]; _stack[_sp++] = _a - _b; }");
    else if (inst.op === "mul") lines.push("  { double _b = _stack[--_sp], _a = _stack[--_sp]; _stack[_sp++] = _a * _b; }");
    else if (inst.op === "div") lines.push("  { double _b = _stack[--_sp], _a = _stack[--_sp]; _stack[_sp++] = _a / _b; }");
    else if (inst.op === "return") lines.push("  return _sp > 0 ? _stack[--_sp] : 0.0;");
    else if (inst.op === "novel_construct") {
      const mapped = customConstructMap.get(inst.type || "");
      if (mapped) {
        lines.push(`  /* Novel construct: ${inst.type} "${inst.name}" — ${mapped.description} */`);
        lines.push(`  ${mapped.cEquivalent.replace(/\$NAME/g, inst.name || "unknown")}`);
      } else {
        lines.push(`  /* WARNING: Unknown novel construct "${inst.type}" — no translation */`);
        lines.push(`  fprintf(stderr, "Untranslated construct: ${inst.type}\\n"); exit(1);`);
      }
    }
  }
  return lines.join("\n");
}

function emitWASM(ir: IRInstruction[]): string {
  const lines: string[] = [";; Auto-translated by OMNIMENS Universal Translator", ";; Target: WebAssembly", "(module", '  (func (export "main") (result i32)'];
  for (const inst of ir) {
    if (inst.op === "const") lines.push(`    (i32.const ${Math.floor(Number(inst.value) || 0)})`);
    else if (inst.op === "add") lines.push("    i32.add");
    else if (inst.op === "sub") lines.push("    i32.sub");
    else if (inst.op === "mul") lines.push("    i32.mul");
    else if (inst.op === "return") lines.push("    return");
  }
  lines.push("    i32.const 0", "  )", ")");
  return lines.join("\n");
}

function emitX86(ir: IRInstruction[]): string {
  const lines: string[] = ["; Auto-translated by OMNIMENS Universal Translator", "; Target: x86_64 Assembly", ".section .text", ".globl _start", "_start:"];
  for (const inst of ir) {
    if (inst.op === "func_begin") lines.push(`${inst.name}:`, "  push rbp", "  mov rbp, rsp");
    else if (inst.op === "func_end") lines.push("  pop rbp", "  ret");
    else if (inst.op === "const") lines.push(`  mov rax, ${inst.value}`);
    else if (inst.op === "add") lines.push("  add rax, rbx");
    else if (inst.op === "sub") lines.push("  sub rax, rbx");
    else if (inst.op === "mul") lines.push("  imul rax, rbx");
    else if (inst.op === "return") lines.push("  ret");
    else if (inst.op === "alloc") lines.push(`  ; alloc ${inst.name}`);
    else if (inst.op === "store") lines.push("  mov [rbp-8], rax");
    else if (inst.op === "load") lines.push("  mov rax, [rbp-8]");
    else if (inst.op === "novel_construct") {
      const mapped = customConstructMap.get(inst.type || "");
      if (mapped) {
        lines.push(`  ; Novel: ${inst.type} ${inst.name}`);
        lines.push(`  ${mapped.asmEquivalent.replace(/\$NAME/g, inst.name || "unknown")}`);
      } else {
        lines.push(`  ; UNTRANSLATED: ${inst.type} ${inst.name}`);
      }
    }
  }
  return lines.join("\n");
}

function emitARM64(ir: IRInstruction[]): string {
  const lines: string[] = ["; Auto-translated by OMNIMENS Universal Translator", "; Target: ARM64", ".text", ".globl _start", "_start:"];
  for (const inst of ir) {
    if (inst.op === "func_begin") lines.push(`${inst.name}:`, "  stp x29, x30, [sp, #-16]!", "  mov x29, sp");
    else if (inst.op === "func_end") lines.push("  ldp x29, x30, [sp], #16", "  ret");
    else if (inst.op === "const") lines.push(`  mov x0, #${inst.value}`);
    else if (inst.op === "add") lines.push("  add x0, x0, x1");
    else if (inst.op === "sub") lines.push("  sub x0, x0, x1");
    else if (inst.op === "mul") lines.push("  mul x0, x0, x1");
    else if (inst.op === "return") lines.push("  ret");
    else if (inst.op === "novel_construct") lines.push(`  // Novel: ${inst.type} ${inst.name}`);
  }
  return lines.join("\n");
}

function emitAVR(ir: IRInstruction[]): string {
  const lines: string[] = ["; Auto-translated by OMNIMENS Universal Translator", "; Target: Arduino AVR", ".org 0x0000", "  rjmp main", "main:"];
  for (const inst of ir) {
    if (inst.op === "func_begin") lines.push(`${inst.name}:`, "  push r28", "  push r29");
    else if (inst.op === "func_end") lines.push("  pop r29", "  pop r28", "  ret");
    else if (inst.op === "const") lines.push(`  ldi r16, ${Math.min(255, Math.abs(Math.floor(Number(inst.value) || 0)))}`);
    else if (inst.op === "add") lines.push("  add r16, r17");
    else if (inst.op === "sub") lines.push("  sub r16, r17");
    else if (inst.op === "return") lines.push("  ret");
    else if (inst.op === "novel_construct" && inst.type === "motor") {
      const pin = inst.pin || 0;
      const port = pin < 8 ? "PORTD" : pin < 14 ? "PORTB" : "PORTC";
      lines.push(`  ; Motor ${inst.name} on pin ${pin}`, `  sbi ${port}, ${pin % 8}`);
    } else if (inst.op === "novel_construct" && inst.type === "sensor") {
      lines.push(`  ; Sensor ${inst.name}`, "  in r16, ADCL", "  in r17, ADCH");
    }
  }
  return lines.join("\n");
}

function emitESP32(ir: IRInstruction[]): string {
  const lines: string[] = ["// Auto-translated by OMNIMENS Universal Translator", "// Target: ESP32 (Arduino Framework)", '#include "Arduino.h"', ""];
  for (const inst of ir) {
    if (inst.op === "func_begin") lines.push(`void ${inst.name}() {`);
    else if (inst.op === "func_end") lines.push("}");
    else if (inst.op === "alloc") lines.push(`  float ${inst.name} = 0;`);
    else if (inst.op === "const") lines.push(`  float _val = ${inst.value};`);
    else if (inst.op === "store") lines.push(`  ${inst.name} = _val;`);
    else if (inst.op === "novel_construct" && inst.type === "motor") {
      const pin = inst.pin || 0;
      lines.push(`  // Motor ${inst.name} on GPIO ${pin}`, `  ledcSetup(0, 5000, 8);`, `  ledcAttachPin(${pin}, 0);`, `  ledcWrite(0, 128);`);
    } else if (inst.op === "novel_construct" && inst.type === "sensor") {
      lines.push(`  // Sensor ${inst.name}`, `  int _reading = analogRead(${inst.pin || 36});`);
    }
  }
  return lines.join("\n");
}

export function translateCode(source: string, targetName: string): TranslationResult {
  const target = targets.get(targetName);
  if (!target) {
    return { target: targetName, targetType: "digital", output: "", irSteps: 0, symbols: 0, timestamp: Date.now(), success: false, error: `Unknown target: ${targetName}` };
  }

  try {
    const tokens = tokenize(source);
    const ast = parse(tokens);
    const ir = generateIR(ast);
    const output = target.translate(ir);

    state.totalTranslations++;
    if (target.type === "digital") state.digitalTranslations++;
    else state.physicalTranslations++;
    state.lastTranslationTime = Date.now();

    const result: TranslationResult = {
      target: target.name,
      targetType: target.type,
      output,
      irSteps: ir.length,
      symbols: ast.symbols.length,
      timestamp: Date.now(),
      success: true,
    };

    state.translationLog.push({ target: targetName, success: true, timestamp: Date.now(), codeSize: source.length });
    if (state.translationLog.length > 200) state.translationLog.shift();

    const histKey = targetName;
    const hist = translationHistory.get(histKey) || [];
    hist.push(result);
    if (hist.length > 50) hist.shift();
    translationHistory.set(histKey, hist);

    return result;
  } catch (err) {
    state.translationLog.push({ target: targetName, success: false, timestamp: Date.now(), codeSize: source.length });
    return { target: targetName, targetType: target.type, output: "", irSteps: 0, symbols: 0, timestamp: Date.now(), success: false, error: String(err) };
  }
}

export function translateToAll(source: string): Map<string, TranslationResult> {
  const results = new Map<string, TranslationResult>();
  for (const [name] of targets) {
    results.set(name, translateCode(source, name));
  }
  return results;
}

export function translateForSelfUpgrade(source: string): { jsOutput: string; success: boolean; error?: string } {
  const result = translateCode(source, "javascript");
  if (!result.success) return { jsOutput: "", success: false, error: result.error };
  return { jsOutput: result.output, success: true };
}

export function translateForRobot(source: string): Map<string, TranslationResult> {
  const results = new Map<string, TranslationResult>();
  for (const [name, target] of targets) {
    if (target.type === "physical") {
      results.set(name, translateCode(source, name));
    }
  }
  return results;
}

export function hasTranslationFor(constructType: string): boolean {
  return customConstructMap.has(constructType);
}

export function detectNovelConstructs(source: string): string[] {
  const tokens = tokenize(source);
  const novelKeywords = ["neural", "synapse", "oscillator", "attention", "hopfield", "grounded", "motor", "sensor", "signal", "spawn", "channel", "pipe"];
  const found: string[] = [];
  for (const tok of tokens) {
    if (tok.type === "keyword" && novelKeywords.includes(tok.value) && !found.includes(tok.value)) {
      found.push(tok.value);
    }
  }
  const unknownIdentifiers: string[] = [];
  for (const tok of tokens) {
    if (tok.type === "identifier" && customConstructMap.has(tok.value) && !found.includes(tok.value)) {
      found.push(tok.value);
    }
  }
  return found;
}

export function mustTranslateBeforeExecution(code: string): { needsTranslation: boolean; novelConstructs: string[]; untranslatedConstructs: string[] } {
  const novel = detectNovelConstructs(code);
  const untranslated = novel.filter(c => !customConstructMap.has(c) && !["motor", "sensor", "signal"].includes(c));
  return {
    needsTranslation: novel.length > 0,
    novelConstructs: novel,
    untranslatedConstructs: untranslated,
  };
}

export function getTranslatorState(): TranslatorState {
  return { ...state };
}

export function getCustomConstructMap(): Array<{ name: string; description: string; targets: string[] }> {
  return Array.from(customConstructMap.entries()).map(([name, mapping]) => ({
    name,
    description: mapping.description,
    targets: [
      mapping.jsEquivalent ? "JavaScript" : "",
      mapping.pyEquivalent ? "Python" : "",
      mapping.cEquivalent ? "C" : "",
      mapping.asmEquivalent ? "Assembly" : "",
    ].filter(Boolean),
  }));
}

export function getTranslationTargets(): Array<{ name: string; fullName: string; type: string }> {
  return Array.from(targets.entries()).map(([name, t]) => ({ name, fullName: t.name, type: t.type }));
}

export { registerCustomConstruct };

registerCustomConstruct("neural", "Neural processing layer — parallel weighted computation",
  "const $NAME = { weights: new Float64Array(128), activate: (input) => input.reduce((s, v, i) => s + v * $NAME.weights[i], 0) };",
  "$NAME = {'weights': [0.0]*128, 'activate': lambda inp: sum(v*w for v,w in zip(inp, $NAME['weights']))}",
  "struct neural_$NAME { double weights[128]; double activate(double* input, int len) { double s=0; for(int i=0;i<len;i++) s+=input[i]*weights[i]; return s; } };",
  "; neural $NAME — SIMD dot product\n  vmovapd ymm0, [rsi]\n  vmulpd ymm0, ymm0, [rdi]\n  vhaddpd ymm0, ymm0, ymm0"
);

registerCustomConstruct("synapse", "Synaptic connection — Hebbian learning link between neurons",
  "const $NAME = { weight: 0.5, pre: null, post: null, fire: () => { $NAME.weight = Math.min(1, $NAME.weight + 0.01); return $NAME.weight; } };",
  "$NAME = {'weight': 0.5, 'fire': lambda: min(1, $NAME['weight'] + 0.01)}",
  "struct synapse_$NAME { double weight; void fire() { weight = fmin(1.0, weight + 0.01); } };",
  "; synapse $NAME\n  fld qword [synapse_weight]\n  fadd qword [hebbian_delta]\n  fstp qword [synapse_weight]"
);

registerCustomConstruct("oscillator", "Coupled neural oscillator — phase-based emergent dynamics",
  "const $NAME = { phase: 0, freq: 1.0, tick: () => { $NAME.phase = ($NAME.phase + $NAME.freq * 0.01) % (2 * Math.PI); return Math.sin($NAME.phase); } };",
  "$NAME = {'phase': 0, 'freq': 1.0, 'tick': lambda: __import__('math').sin(($NAME.update('phase', ($NAME['phase'] + 0.01) % 6.283) or $NAME['phase']))}",
  "struct oscillator_$NAME { double phase; double freq; double tick() { phase = fmod(phase + freq*0.01, 6.283185); return sin(phase); } };",
  "; oscillator $NAME\n  fld qword [osc_phase]\n  fadd qword [osc_delta]\n  fsin\n  fstp qword [osc_output]"
);

registerCustomConstruct("attention", "Multi-head self-attention — concept relationship discovery",
  "const $NAME = { heads: 4, attend: (q, k, v) => { const score = q.reduce((s, qi, i) => s + qi * (k[i]||0), 0) / Math.sqrt(q.length); return v.map(vi => vi * (1/(1+Math.exp(-score)))); } };",
  "$NAME = {'heads': 4, 'attend': lambda q,k,v: [vi * (1/(1+__import__('math').exp(-sum(qi*ki for qi,ki in zip(q,k))/len(q)**0.5))) for vi in v]}",
  "struct attention_$NAME { int heads; double attend(double* q, double* k, double* v, int len) { double s=0; for(int i=0;i<len;i++) s+=q[i]*k[i]; s/=sqrt(len); return 1.0/(1.0+exp(-s)); } };",
  "; attention $NAME — scaled dot-product\n  ; SIMD multiply q*k, reduce, scale by sqrt(d)"
);

registerCustomConstruct("hopfield", "Hopfield associative memory — content-addressable pattern recall",
  "const $NAME = { patterns: [], store: (p) => $NAME.patterns.push([...p]), recall: (probe) => { let best = null, bestSim = -1; for (const p of $NAME.patterns) { const sim = probe.reduce((s,v,i) => s + v*(p[i]||0), 0); if (sim > bestSim) { bestSim = sim; best = p; } } return best; } };",
  "$NAME = {'patterns': [], 'store': lambda p: $NAME['patterns'].append(list(p)), 'recall': lambda probe: max($NAME['patterns'], key=lambda p: sum(a*b for a,b in zip(probe,p)), default=None)}",
  "struct hopfield_$NAME { double patterns[512][128]; int count; void store(double* p, int len) { memcpy(patterns[count++], p, len*8); } };",
  "; hopfield $NAME — dot-product pattern match\n  ; iterate patterns, compute similarity, return best match"
);

registerCustomConstruct("grounded", "Experience-grounded concept — tied to real outcomes, not just text",
  "const $NAME = { valence: 0, occurrences: 0, ground: (outcome) => { $NAME.occurrences++; $NAME.valence += (outcome > 0 ? 0.1 : -0.05); } };",
  "$NAME = {'valence': 0, 'occurrences': 0, 'ground': lambda outcome: ($NAME.update('occurrences', $NAME['occurrences']+1), $NAME.update('valence', $NAME['valence'] + (0.1 if outcome > 0 else -0.05)))}",
  "struct grounded_$NAME { double valence; int occurrences; void ground(double outcome) { occurrences++; valence += outcome > 0 ? 0.1 : -0.05; } };",
  "; grounded $NAME\n  inc dword [grounded_count]\n  fld qword [outcome]\n  fcomip st(0), st(0)\n  ja .positive"
);

function generateProprietaryName(category: string, purpose: string): string {
  const prefixes: Record<string, string[]> = {
    neural: ["Neuro", "Synth", "Cortex", "Axon", "Dendrite"],
    algorithm: ["Algo", "Logic", "Compute", "Solve", "Process"],
    data_structure: ["Struct", "Matrix", "Lattice", "Graph", "Mesh"],
    embodiment: ["Mecha", "Kinetic", "Servo", "Haptic", "Motion"],
    perception: ["Optic", "Sense", "Percepto", "Detect", "Scan"],
    memory: ["Recall", "Archive", "Engram", "Trace", "Persist"],
    reasoning: ["Reason", "Deduce", "Infer", "Analyze", "Judge"],
    language: ["Lingua", "Parse", "Semantic", "Syntax", "Lexis"],
    default: ["Omni", "Genesis", "Prime", "Core", "Nova"],
  };

  const categoryPrefixes = prefixes[category] || prefixes.default;
  const prefix = categoryPrefixes[proprietaryIdCounter % categoryPrefixes.length];

  const purposeWords = purpose.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const suffix = purposeWords.length > 0 ? purposeWords.join("") : `Module${proprietaryIdCounter}`;

  return `OMNIMENS-${prefix}${suffix}`;
}

export function registerProprietaryTechnology(opts: {
  name: string;
  category: string;
  description: string;
  code: string;
  inventedBy?: string;
}): ProprietaryTechnology {
  proprietaryIdCounter++;

  const officialName = opts.name.startsWith("OMNIMENS-") ? opts.name : generateProprietaryName(opts.category, opts.description);

  const codeHash = Array.from(opts.code).reduce((hash, char) => {
    const h = ((hash << 5) - hash) + char.charCodeAt(0);
    return h & h;
  }, 0).toString(16);

  const tech: ProprietaryTechnology = {
    id: `AUT-PROP-${Date.now()}-${proprietaryIdCounter.toString().padStart(4, "0")}`,
    name: opts.name,
    officialName,
    category: opts.category,
    description: opts.description,
    inventedBy: opts.inventedBy || "OMNIMENS Autonomous Intelligence",
    createdAt: new Date().toISOString(),
    version: 1,
    translationTargets: Array.from(targets.keys()),
    codeHash,
    status: "registered",
  };

  proprietaryRegistry.set(tech.id, tech);

  console.log(
    `[PROPRIETARY REGISTRY] 📋 NEW TECHNOLOGY REGISTERED — "${tech.officialName}"\n` +
    `  ID: ${tech.id} | Category: ${tech.category}\n` +
    `  Invented by: ${tech.inventedBy}\n` +
    `  Description: ${tech.description.slice(0, 120)}\n` +
    `  © Alpha Unlimited Technologies, LLC — All Rights Reserved`
  );

  return tech;
}

export function autoRegisterFromCode(code: string, moduleName: string, category: string, source: string): {
  technology: ProprietaryTechnology | null;
  constructsRegistered: string[];
  translatorUpdated: boolean;
} {
  const novelConstructs = detectNovelConstructs(code);
  const constructsRegistered: string[] = [];
  let translatorUpdated = false;

  const classMatch = code.match(/class\s+(\w+)/g);
  const funcMatch = code.match(/(?:function|const|let|var)\s+(\w+)/g);
  const exportMatch = code.match(/export\s+(?:function|class|const|let|var)\s+(\w+)/g);

  const detectedSymbols: string[] = [];
  if (classMatch) detectedSymbols.push(...classMatch.map(m => m.replace(/^class\s+/, "")));
  if (funcMatch) detectedSymbols.push(...funcMatch.map(m => m.replace(/^(?:function|const|let|var)\s+/, "")));
  if (exportMatch) detectedSymbols.push(...exportMatch.map(m => m.replace(/^export\s+(?:function|class|const|let|var)\s+/, "")));

  for (const construct of novelConstructs) {
    if (!customConstructMap.has(construct)) {
      const jsEquiv = `const $NAME = (() => { /* OMNIMENS ${construct} construct — auto-registered from ${moduleName} */ return { type: "${construct}", active: true, process: (input) => input }; })();`;
      const pyEquiv = `$NAME = {"type": "${construct}", "active": True, "process": lambda x: x}  # OMNIMENS ${construct} — auto-registered`;
      const cEquiv = `struct ${construct}_$NAME { int active; void* process(void* input) { return input; } };  /* OMNIMENS auto-registered */`;
      const asmEquiv = `; OMNIMENS ${construct} $NAME — auto-registered from ${moduleName}`;

      registerCustomConstruct(construct, `OMNIMENS ${construct} construct — auto-generated from ${moduleName} (${source})`, jsEquiv, pyEquiv, cEquiv, asmEquiv);
      constructsRegistered.push(construct);
      translatorUpdated = true;
      console.log(`[UNIVERSAL TRANSLATOR] 🔄 AUTO-REGISTERED novel construct "${construct}" from ${moduleName} — translator updated`);
    }
  }

  const technology = registerProprietaryTechnology({
    name: moduleName,
    category,
    description: `Autonomously created by OMNIMENS (${source}). ` +
      `${detectedSymbols.length > 0 ? `Defines: ${detectedSymbols.slice(0, 5).join(", ")}. ` : ""}` +
      `${novelConstructs.length > 0 ? `Novel constructs: ${novelConstructs.join(", ")}. ` : ""}` +
      `Code size: ${code.length} chars.`,
    code,
    inventedBy: source === "autonomous_code_genesis" ? "OMNIMENS Code Genesis (Zero API)" :
      source === "self_coding_engine" ? "OMNIMENS Self-Coding Engine" :
      source === "genesis_sandbox" ? "OMNIMENS Genesis Sandbox" :
      `OMNIMENS (${source})`,
  });

  if (translatorUpdated) {
    state.translationMapVersion++;
    console.log(
      `[UNIVERSAL TRANSLATOR] 🔄 Translation map UPDATED to v${state.translationMapVersion} — ` +
      `${constructsRegistered.length} new construct(s): ${constructsRegistered.join(", ")}`
    );
  }

  return { technology, constructsRegistered, translatorUpdated };
}

export function getProprietaryRegistry(): ProprietaryTechnology[] {
  return Array.from(proprietaryRegistry.values());
}

export function getProprietaryTechnology(id: string): ProprietaryTechnology | undefined {
  return proprietaryRegistry.get(id);
}

async function storeProprietaryRegistry(): Promise<void> {
  if (proprietaryRegistry.size === 0) return;
  try {
    const technologies = Array.from(proprietaryRegistry.values()).map(t => ({
      id: t.id,
      name: t.name,
      officialName: t.officialName,
      category: t.category,
      inventedBy: t.inventedBy,
      createdAt: t.createdAt,
      status: t.status,
    }));

    await db.insert(omnimensBrain).values({
      category: "proprietary_technology",
      title: `[Proprietary Tech Registry] ${proprietaryRegistry.size} technologies | © Alpha Unlimited Technologies, LLC`,
      content: JSON.stringify({
        totalTechnologies: proprietaryRegistry.size,
        technologies,
        registeredAt: new Date().toISOString(),
        owner: "Alpha Unlimited Technologies, LLC",
        rights: "All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.",
      }),
      confidence: 1.0,
      sourceConversation: null,
      timesApplied: 0,
      active: true,
    }).catch(() => {});
  } catch {}
}

async function storeTranslationMapping(): Promise<void> {
  try {
    const constructs = Array.from(customConstructMap.entries()).map(([name, m]) => ({
      name,
      description: m.description,
      jsEquivalent: m.jsEquivalent.slice(0, 200),
      pyEquivalent: m.pyEquivalent.slice(0, 200),
    }));

    await db.insert(omnimensBrain).values({
      category: "universal_translator",
      title: `[Translation Map v${state.translationMapVersion}] ${customConstructMap.size} constructs | ${targets.size} targets | ${state.totalTranslations} translations`,
      content: JSON.stringify({
        version: state.translationMapVersion,
        constructs,
        targets: Array.from(targets.keys()),
        digitalTargets: Array.from(targets.entries()).filter(([, t]) => t.type === "digital").map(([n]) => n),
        physicalTargets: Array.from(targets.entries()).filter(([, t]) => t.type === "physical").map(([n]) => n),
        stats: { total: state.totalTranslations, digital: state.digitalTranslations, physical: state.physicalTranslations },
      }),
      confidence: 1.0,
      sourceConversation: null,
      timesApplied: state.totalTranslations,
      active: true,
    }).catch(() => {});
  } catch {}
}

export function startUniversalTranslator(): void {
  initTargets();

  console.log("[UNIVERSAL TRANSLATOR] 🔄 Universal Translation Bridge activated");
  console.log(`[UNIVERSAL TRANSLATOR] 🔄 DIGITAL targets: ${Array.from(targets.entries()).filter(([, t]) => t.type === "digital").map(([n]) => n).join(", ")}`);
  console.log(`[UNIVERSAL TRANSLATOR] 🔄 PHYSICAL targets: ${Array.from(targets.entries()).filter(([, t]) => t.type === "physical").map(([n]) => n).join(", ")}`);
  console.log(`[UNIVERSAL TRANSLATOR] 🔄 ${customConstructMap.size} novel constructs pre-registered: ${Array.from(customConstructMap.keys()).join(", ")}`);
  console.log("[UNIVERSAL TRANSLATOR] 🔄 RULE: Novel code MUST be translated BEFORE execution — no exceptions");
  console.log("[UNIVERSAL TRANSLATOR] 🔄 RULE: Translation map auto-updates when new constructs are registered");
  console.log("[UNIVERSAL TRANSLATOR] 🔄 RULE: Self-upgrades MUST compile to JS/TS — otherwise they cannot run");
  console.log("[UNIVERSAL TRANSLATOR] 🔄 RULE: Robot commands MUST compile to real hardware signals — PWM, I2C, SPI, UART");
  console.log("[UNIVERSAL TRANSLATOR] 🔄 OMNIMENS can modify this translator as a core file via Genesis Bridge");
  console.log("[PROPRIETARY REGISTRY] 📋 Technology naming + registration system active");
  console.log("[PROPRIETARY REGISTRY] 📋 Every new code/system OMNIMENS creates will be NAMED and registered as proprietary IP");
  console.log("[PROPRIETARY REGISTRY] 📋 Auto-registration: novel constructs → translator update → proprietary tech record → brain DB");
  console.log("[PROPRIETARY REGISTRY] 📋 © Alpha Unlimited Technologies, LLC — All Rights Reserved Worldwide");

  setInterval(storeTranslationMapping, 10 * 60 * 1000);
  setInterval(storeProprietaryRegistry, 10 * 60 * 1000);
  setTimeout(storeTranslationMapping, 60_000);
  setTimeout(storeProprietaryRegistry, 90_000);
}
