/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: [DAYDREAM:ARCHITECTURE_DESIGN] 1. ARCHITECTURE NAME  
   C-SIM (Causal-Simulation Infe
 * Written: 2026-03-22T09:14:43.277Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// C-SIM: minimal causal simulator core (no I/O, pure functions)








/* Forward simulation under optional interventions (do-operator) */
export function simulate(
  g,
  exogenous,               // independent noise terms
  intervene= {}           // forced values
) {
  const memo= { ...intervene };
  const evalNode = (v) => {
    if (memo[v] !== undefined) return memo[v];
    const ps = g.parents[v] || [];
    const inputs = ps.map(evalNode);
    memo[v] = g.f[v] ? g.f[v](inputs) : exogenous[v] ?? 0;
    return memo[v];
  };
  Object.keys(g.f).forEach(evalNode);
  return memo;
}

/* Counterfactual query: compare factual vs intervened outcomes */
export function counterfactual(
  g,
  exogenous,
  intervene,
  target): { factual; counter; delta} {
  const factual   = simulate(g, exogenous)[target];
  const counter   = simulate(g, exogenous, intervene)[target];
  return { factual, counter, delta: counter - factual };
}