/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_21518
 * Title: ARCHITECTURE NAME  
CRYSTAL – Causal Recursive hYper
 * Written: 2026-03-23T14:10:11.577Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// CRYSTAL – minimal SCM engine (pure computation, 25 LOC)
export type Node = {
  name: string
  parents: string[]
  func: (parents: number[]) => number
}

function topological(nodes: Node[]): Node[] {
  const order: Node[] = []
  const visited = new Set<string>()
  function visit(n: Node) {
    if (visited.has(n.name)) return
    n.parents.forEach(p => visit(nodeMap.get(p)!))
    visited.add(n.name)
    order.push(n)
  }
  const nodeMap = new Map(nodes.map(n => [n.name, n]))
  nodes.forEach(visit)
  return order
}

export function simulate(
  nodes: Node[],
  evidence: Record<string, number> = {},
  intervention: Record<string, number> = {}
): Record<string, number> {
  const state: Record<string, number> = { ...evidence, ...intervention }
  for (const n of topological(nodes)) {
    if (n.name in intervention) continue // do-operator: override causal mechanism
    if (!(n.name in state)) {
      const vals = n.parents.map(p => state[p])
      state[n.name] = n.func(vals)
    }
  }
  return state
}