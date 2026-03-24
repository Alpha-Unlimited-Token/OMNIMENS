/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_11693
 * Title: ARCHITECTURE NAME  
   CONTRAPOINT – Counterfactual-
 * Written: 2026-03-22T19:46:54.891Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CONTRAPOINT – minimal causal simulator






/** Run the SCM once and produce a numeric assignment for every variable */
function forward(model, override> = {}) {
  const { vars } = model;
  const values= Array(vars.length).fill(0);
  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    if (override.hasOwnProperty(v.name)) {
      values[i] = override[v.name];      // do(X = x’)
      continue;
    }
    const parentVals = v.parents.map(p => values[p]);
    values[i] = v.func(parentVals);
  }
  return values;
}

/** Estimate average outcome of Y under intervention do(X = x’) via Monte-Carlo */
export function averageEffect(
  model,
  xName,
  xVal,
  yName,
  runs = 1000
) {
  const yIdx = model.vars.findIndex(v => v.name === yName);
  const override> = { [xName]: xVal };
  let sum = 0;
  for (let i = 0; i < runs; i++) sum += forward(model, override)[yIdx];
  return sum / runs;
}