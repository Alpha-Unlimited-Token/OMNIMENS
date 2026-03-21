/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:architecture_design #77
 * Written: 2026-03-21T04:11:20.638Z
 * CAREN core - Structural Causal Model with do-interventions
 */

function parents(node, edges) {
  return edges.filter(e => e[1] === node).map(e => e[0]);
}

function* combos(vars) {
  const n = vars.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const assign = {};
    vars.forEach((v, i) => { assign[v] = (mask >> i) & 1; });
    yield assign;
  }
}

export function predictIntervention(m, target, interveneVar, ival) {
  const pa = parents(target, m.edges);
  let sum = 0, norm = 0;
  for (const assign of combos(Array.from(m.nodes))) {
    assign[interveneVar] = ival;
    let p = 1;
    for (const n of m.nodes) {
      const key = pa.length
        ? pa.map(v => v + '=' + assign[v]).join(',') + '->' + n + '=1'
        : n + '=1';
      p *= assign[n] ? (m.cpt[key] ?? 0.5) : (1 - (m.cpt[key] ?? 0.5));
    }
    if (assign[target]) sum += p;
    norm += p;
  }
  return norm ? sum / norm : 0;
}

export function createSCM(nodes, edges, cpt = {}) {
  return { nodes: new Set(nodes), edges, cpt };
}
