/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_14158
 * Title: ARCHITECTURE NAME  
   C.S.W. – Causal-Simulation Wo
 * Written: 2026-03-22T22:15:50.882Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Causal-Simulation Workspace – Minimal Core

  name
  parents
  fn => number
}



export function runModel(model, exogenous: { [k]: number }): { [k]: number } {
  const memo: { [k]: number } = { ...exogenous }
  const evalNode = (n) => {
    if (memo[n] !== undefined) return memo[n]
    const node = model[n]
    const inputs = node.parents.map(p => evalNode(p))
    memo[n] = node.fn(inputs)
    return memo[n]
  }
  Object.keys(model).forEach(evalNode)
  return memo
}

export function intervene(model, intervention: { [k]: number }, exogenous: { [k]: number }) {
  // Clone model shallowly and replace functions for intervened nodes with constants
  const newModel= {}
  for (const k in model) {
    newModel[k] = { ...model[k] }
    if (intervention[k] !== undefined) {
      newModel[k].parents = []
      newModel[k].fn = () => intervention[k]
    }
  }
  return runModel(newModel, exogenous)
}