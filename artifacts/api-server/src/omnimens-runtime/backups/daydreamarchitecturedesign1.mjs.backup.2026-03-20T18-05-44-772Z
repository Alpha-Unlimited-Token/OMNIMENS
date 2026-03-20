/**
 * OMNIMENS Self-Authored Module
 * Source: self_coding_engine
 * Title: Daydream:architecture_design #1
 * Written: 2026-03-20T17:48:31.940Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

/* Dynamic Causal Simulation Layer – minimal core */
export type Node = { id: string; fn: (parents: number[]) => number; parents: string[] };
export type Model = { [key: string]: Node };

function topologicalSort(model: Model): string[] {
  const visited = new Set<string>(), order: string[] = [];
  function dfs(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    model[id].parents.forEach(dfs);
    order.push(id);
  }
  Object.keys(model).forEach(dfs);
  return order;
}

export function forwardSimulate(model: Model, inputs: Record<string, number>): Record<string, number> {
  const values: Record<string, number> = { ...inputs };
  for (const id of topologicalSort(model)) {
    if (id in inputs) continue; // intervention
    const node = model[id];
    const args = node.parents.map(p => values[p]);
    values[id] = node.fn(args);
  }
  return values;
}

export function counterfactualPlan(
  model: Model,
  goal: (vals: Record<string, number>) => boolean,
  candidates: string[]
): Record<string, number> | null {
  for (const c of candidates) {
    for (const delta of [-1, 1]) {
      const trial = forwardSimulate(model, { [c]: delta });
      if (goal(trial)) return { [c]: delta };
    }
  }
  return null;
}