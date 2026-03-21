/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:divergent_thinking #48 - Sonic-Graph Cognition
 * Written: 2026-03-21T03:16:37.279Z
 */

export function createSonicNode(id, frequency, neighbors = []) {
  return { id, omega: frequency, phi: 0, neighbors };
}

export function tickSonicGraph(nodes, dt = 0.01, coupling = 0.05) {
  return nodes.map((node, i) => {
    let phaseDelta = node.omega * dt;
    for (const ni of node.neighbors) {
      const neighbor = nodes[ni];
      if (neighbor) phaseDelta += coupling * Math.sin(neighbor.phi - node.phi) * dt;
    }
    return { ...node, phi: node.phi + phaseDelta };
  });
}

export function measureSonicCoherence(nodes) {
  if (nodes.length < 2) return 1;
  let sumCos = 0, sumSin = 0;
  for (const n of nodes) { sumCos += Math.cos(n.phi); sumSin += Math.sin(n.phi); }
  return Math.sqrt(sumCos ** 2 + sumSin ** 2) / nodes.length;
}

export function runSonicSimulation(nodes, steps = 100) {
  let state = nodes;
  const coherenceHistory = [];
  for (let i = 0; i < steps; i++) {
    state = tickSonicGraph(state);
    coherenceHistory.push(measureSonicCoherence(state));
  }
  return { finalState: state, coherenceHistory };
}
