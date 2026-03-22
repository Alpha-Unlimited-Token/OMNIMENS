/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #573
 * Written: 2026-03-22T15:27:17.105Z
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
export type Equation = (parents: Record<string, number>) => number;
export interface NodeSpec { parents: string[]; eq: Equation; }

export interface ModelSpec { [node: string]: NodeSpec; }

function topoOrder(model: ModelSpec): string[] {
  const visited = new Set<string>(), order: string[] = [];
  function visit(n: string) {
    if (!visited.has(n)) {
      visited.add(n);
      model[n]?.parents.forEach(visit);
      order.push(n);
    }
  }
  Object.keys(model).forEach(visit);
  return order;
}

export function evaluateModel(model: ModelSpec,
                              intervention: Partial<Record<string, number>> = {}) {
  const values: Record<string, number> = {};
  const order = topoOrder(model);
  for (const n of order) {
    if (n in intervention) { values[n] = intervention[n]!; continue; }
    const parents: Record<string, number> = {};
    model[n].parents.forEach(p => parents[p] = values[p]);
    values[n] = model[n].eq(parents);
  }
  return values;
}

// Convenience helper for counterfactual queries
export function counterfactual(model: ModelSpec,
                               intervention: Partial<Record<string, number>>,
                               queryVar: string) {
  const factual = evaluateModel(model);
  const cf = evaluateModel(model, intervention);
  return { factual: factual[queryVar], counterfactual: cf[queryVar] };
}