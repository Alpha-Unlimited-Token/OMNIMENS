/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_12780
 * Title: ARCHITECTURE NAME  
Causal Autopoietic Reasoning & E
 * Written: 2026-03-22T17:44:08.030Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CAREN core – tiny pure-JS SCM with do-intervention
export type Edge = [string, string];          // [parent, child]
export type CPT  = Record<string, number>;    // "parentValues->child=1": P
export interface SCM { nodes: Set<string>; edges: Edge[]; cpt: CPT; }

function parents(node: string, edges: Edge[]): string[] {
  return edges.filter(e => e[1] === node).map(e => e[0]);
}

// Enumerate all parent value assignments (binary vars assumed)
function* combos(vars: string[]): Generator<Record<string, number>> {
  const n = vars.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const assign: Record<string, number> = {};
    vars.forEach((v, i) => assign[v] = (mask >> i) & 1);
    yield assign;
  }
}

// P(target=1 | do(interveneVar=ival))
export function predictIntervention(
  m: SCM, target: string, interveneVar: string, ival: 0 | 1
): number {
  const pa = parents(target, m.edges);
  let sum = 0, norm = 0;
  for (const assign of combos(Array.from(m.nodes))) {
    assign[interveneVar] = ival;                 // apply do()
    // compute joint prob under model
    let p = 1;
    for (const n of m.nodes) {
      const key = pa.length
        ? pa.map(v => `${v}=${assign[v]}`).join(',') + `->${n}=1`
        : `${n}=1`;
      p *= assign[n] ? (m.cpt[key] ?? 0.5) : (1 - (m.cpt[key] ?? 0.5));
    }
    if (assign[target]) sum += p;
    norm += p;
  }
  return norm ? sum / norm : 0;
}