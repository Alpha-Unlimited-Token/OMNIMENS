/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_16607
 * Title: ARCHITECTURE NAME  
   Counterfactual Causal Reasoni
 * Written: 2026-03-23T01:30:51.765Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// counterfactual.ts
// Pure TS implementation – no IO, no eval, no external deps.





function topoOrder(model) {
  const visited = new Set(), order= [];
  function visit(n) {
    if (!visited.has(n)) {
      visited.add(n);
      model[n]?.parents.forEach(visit);
      order.push(n);
    }
  }
  Object.keys(model).forEach(visit);
  return order;
}

export function evaluateModel(model,
                              intervention> = {}) {
  const values = {};
  const order = topoOrder(model);
  for (const n of order) {
    if (n in intervention) { values[n] = intervention[n]!; continue; }
    const parents = {};
    model[n].parents.forEach(p => parents[p] = values[p]);
    values[n] = model[n].eq(parents);
  }
  return values;
}

// Convenience helper for counterfactual queries
export function counterfactual(model,
                               intervention>,
                               queryVar) {
  const factual = evaluateModel(model);
  const cf = evaluateModel(model, intervention);
  return { factual: factual[queryVar], counterfactual: cf[queryVar] };
}