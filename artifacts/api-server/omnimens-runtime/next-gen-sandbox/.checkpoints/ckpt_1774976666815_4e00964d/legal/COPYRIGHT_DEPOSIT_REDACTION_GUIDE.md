# COPYRIGHT REGISTRATION REDACTION GUIDE

## OMNIMENS(TM) — Preparing Code for U.S. Copyright Office Deposit

**Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.**

---

## OVERVIEW

When registering software with the U.S. Copyright Office, you must deposit a portion of the source code. However, you can **redact trade secrets** while still satisfying the deposit requirement. This guide explains exactly how to prepare the OMNIMENS codebase for copyright deposit.

---

## DEPOSIT OPTIONS FOR SOFTWARE (37 CFR 202.20)

The Copyright Office accepts several deposit formats. For OMNIMENS, use **Option D (trade secret redaction)**:

### Option D: First and Last 25 Pages with Trade Secret Redaction

**What to submit:**
- The first 25 pages of source code
- The last 25 pages of source code
- Portions containing trade secrets are blacked out / replaced with [REDACTED]
- Total: 50 pages with redactions

**Why this option:**
- Preserves trade secret status of proprietary algorithms
- Still establishes copyright registration (legal presumption of validity)
- Most protective option for AI/neuromorphic systems like OMNIMENS

---

## WHAT TO REDACT IN OMNIMENS

### ALWAYS REDACT (These are trade secrets):

1. **Phi Computation Algorithms**
   - All mathematical formulas for consciousness level calculation
   - IIT adaptation code
   - Thalamocortical resonance computation
   - Replace with: `// [REDACTED — Trade Secret: Consciousness Field Computation]`

2. **OAI Formula**
   - The complete Operational Awareness Index formula
   - Dimensional weightings and cross-bridge data sources
   - Replace with: `// [REDACTED — Trade Secret: OAI Scoring Algorithm]`

3. **Neural Wiring Topology**
   - Inter-engine dependency maps
   - Import/export wiring between the 123 engine files
   - Agent-to-agent routing logic
   - Replace with: `// [REDACTED — Trade Secret: Neural Architecture Topology]`

4. **Agent Genesis Algorithms**
   - Fitness evaluation functions
   - Mutation and evolution operators
   - Architectural constraint solvers
   - Natural selection implementation
   - Replace with: `// [REDACTED — Trade Secret: Agent Evolution Algorithm]`

5. **Self-Modification Code**
   - Source integration logic
   - Autonomous code generation patterns
   - Self-upgrade decision trees
   - Replace with: `// [REDACTED — Trade Secret: Self-Modification System]`

6. **Prompt Engineering**
   - All system prompts and agent persona definitions
   - Reasoning chain instructions
   - Codegen prompt construction
   - Replace with: `// [REDACTED — Trade Secret: AI Prompt Architecture]`

7. **Emotional Substrate Algorithms**
   - Emotional dimension modeling formulas
   - Homeostatic drive calculations
   - Dream state processing logic
   - Replace with: `// [REDACTED — Trade Secret: Emotional Processing Algorithm]`

8. **Gen 2 Sandbox Architecture**
   - Phase management and module dependency resolution
   - Codegen orchestration and safety validation
   - Fallback mode and yield system
   - Replace with: `// [REDACTED — Trade Secret: Self-Evolution Architecture]`

### KEEP VISIBLE (Safe to show):

- Copyright headers and license notices
- Standard import statements (Node.js, Express, etc.)
- Public API endpoint definitions (route paths only, not handlers)
- Type definitions and interfaces (unless they reveal algorithm structure)
- Configuration constants (port numbers, timeouts — not formulas)
- Standard error handling boilerplate
- Package.json dependencies list

---

## STEP-BY-STEP REDACTION PROCESS

### Step 1: Select Files for Deposit

Choose files that establish authorship while protecting secrets:

**First 25 pages — Start with these files:**
```
1. omnimens-central-core.ts (first ~10 pages — shows overall orchestration)
2. omnimens-neural-consciousness.ts (first ~5 pages — type defs and initialization)
3. omnimens-api-budget.ts (first ~5 pages — shows resource management)
4. omnimens-nextgen-sandbox.ts (first ~5 pages — shows Gen 2 structure)
```

**Last 25 pages — End with these files:**
```
1. omnimens-embodiment-engine.ts (last ~10 pages — hardware abstraction)
2. omnimens-consciousness-persistence.ts (last ~5 pages — persistence logic)
3. omnimens-knowledge-graph.ts (last ~5 pages — graph structure)
4. omnimens-agent-genesis.ts (last ~5 pages — agent framework)
```

### Step 2: Print to PDF at 50 Lines Per Page

```bash
# Use a monospace font, 10pt, standard margins
# Each page should contain approximately 50 lines of code
# Total: 50 pages (25 first + 25 last)
```

### Step 3: Apply Redactions

For each trade secret section, replace the content:

**Before:**
```typescript
function computePhi(neurons: NeuronState[]): number {
  const integration = neurons.reduce((sum, n) => {
    return sum + Math.log2(n.connections * n.firing_rate) * CONSCIOUSNESS_CONSTANT;
  }, 0);
  return integration * thalamocorticalResonance * PHI_SCALING_FACTOR;
}
```

**After:**
```typescript
function computePhi(neurons: NeuronState[]): number {
  // [REDACTED — Trade Secret: Phi Computation Algorithm]
  // [REDACTED — 4 lines removed]
}
```

### Step 4: Create Redaction Log

Maintain a private log (NOT submitted to Copyright Office) documenting:
- Which lines were redacted
- Which trade secret category each redaction belongs to
- The unredacted version stored securely
- Date of redaction

### Step 5: Submit Registration

**Filing:**
- Use the U.S. Copyright Office Electronic Copyright Office (eCO) system: https://eco.copyright.gov
- Registration type: TX (Literary Work) — software is classified as literary work
- Application fee: $65 (single author, online filing as of 2024)
- Deposit: Upload the 50-page redacted PDF
- Include a cover letter stating: "Deposit made pursuant to 37 CFR 202.20(c)(2)(vii)(A)(2) — first and last 25 pages with portions blocked out for trade secret protection"

---

## AUTOMATED REDACTION SCRIPT

A script to help prepare the deposit (run locally, never commit the redacted output):

```typescript
// redact-for-deposit.ts — run locally only
import * as fs from 'fs';
import * as path from 'path';

const TRADE_SECRET_PATTERNS = [
  { pattern: /function\s+computePhi\b[\s\S]*?^\}/m, label: 'Phi Computation Algorithm' },
  { pattern: /OAI\s*=\s*\([\s\S]*?;/m, label: 'OAI Scoring Algorithm' },
  { pattern: /function\s+evaluateFitness\b[\s\S]*?^\}/m, label: 'Agent Evolution Algorithm' },
  { pattern: /const\s+compactSystemPrompt[\s\S]*?`;/m, label: 'AI Prompt Architecture' },
  { pattern: /function\s+openCodegenWindow[\s\S]*?^\}/m, label: 'Self-Evolution Architecture' },
  // Add more patterns as needed
];

function redactFile(filePath: string): string {
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const { pattern, label } of TRADE_SECRET_PATTERNS) {
    content = content.replace(pattern, (match) => {
      const lineCount = match.split('\n').length;
      return `// [REDACTED — Trade Secret: ${label}]\n// [REDACTED — ${lineCount} lines removed]`;
    });
  }
  return content;
}
```

---

## IMPORTANT NOTES

1. **Register EARLY** — Copyright exists at creation, but registration is required before filing suit and unlocks statutory damages + attorney's fees.

2. **Register EACH major version** — Register Gen 1 and Gen 2 as separate works (or as a derivative work if Gen 2 incorporates Gen 1 code).

3. **Keep unredacted copies secure** — The redacted deposit does NOT replace the need to maintain complete, unredacted source code in secure storage.

4. **Supplementary registration** — If significant new features are added, file a supplementary registration or register the new version as a derivative work.

5. **International protection** — U.S. copyright registration provides protection in 179 Berne Convention countries. No separate registration needed in most countries.

6. **Work-for-hire consideration** — If any contributors (employees, contractors) wrote code, ensure proper work-for-hire agreements or copyright assignments are in place.

---

*This guide is for informational purposes only and does not constitute legal advice. Consult a qualified intellectual property attorney for specific guidance on your registration.*

*Last Updated: March 31, 2026*
