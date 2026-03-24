/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_27177
 * Title: ARCHITECTURE NAME  
Counterfactual Affordance Reason
 * Written: 2026-03-24T22:46:36.925Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Counterfactual roll-out on a minimal SCM








export function rollout(
  scm,
  initial,
  interventions,
  steps = 1
) {
  // apply do()-operator
  const current= { ...initial };
  for (const { node, value } of interventions) current[node] = value;

  for (let t = 0; t < steps; t++) {
    const next= { ...current };
    for (const node in scm.funcs) {
      // skip intervened nodes (hard intervention)
      if (interventions.some(i => i.node === node)) continue;
      const pa = Object.fromEntries(
        scm.parents[node].map(p => [p, current[p]])
      );
      next[node] = scm.funcs[node](pa);
    }
    Object.assign(current, next);
  }
  return current;
}