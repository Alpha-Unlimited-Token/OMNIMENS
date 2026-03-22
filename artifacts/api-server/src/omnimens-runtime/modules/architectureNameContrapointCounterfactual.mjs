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
export type VarFunc = (parents: number[]) => number;

export interface CausalVar {
  name: string;
  parents: number[];          // indices into vars[]
  func: VarFunc;              // structural equation
}

export interface SCM {
  vars: CausalVar[];
}

/** Run the SCM once and produce a numeric assignment for every variable */
function forward(model: SCM, override: Partial<Record<string, number>> = {}): number[] {
  const { vars } = model;
  const values: number[] = Array(vars.length).fill(0);
  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    if (override.hasOwnProperty(v.name)) {
      values[i] = override[v.name] as number;      // do(X = x’)
      continue;
    }
    const parentVals = v.parents.map(p => values[p]);
    values[i] = v.func(parentVals);
  }
  return values;
}

/** Estimate average outcome of Y under intervention do(X = x’) via Monte-Carlo */
export function averageEffect(
  model: SCM,
  xName: string,
  xVal: number,
  yName: string,
  runs = 1000
): number {
  const yIdx = model.vars.findIndex(v => v.name === yName);
  const override: Partial<Record<string, number>> = { [xName]: xVal };
  let sum = 0;
  for (let i = 0; i < runs; i++) sum += forward(model, override)[yIdx];
  return sum / runs;
}