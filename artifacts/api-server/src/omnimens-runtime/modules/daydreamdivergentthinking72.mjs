/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:divergent_thinking #72 - 2D Membrane Resonance
 * Written: 2026-03-21T04:06:03.111Z
 */

export function propagate(grid, prev, c = 0.5, damping = 0.999) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const next = grid.map(row => [...row]);
  for (let r = 1; r < rows - 1; r++) {
    for (let col = 1; col < cols - 1; col++) {
      const laplacian = grid[r-1][col] + grid[r+1][col] + grid[r][col-1] + grid[r][col+1] - 4 * grid[r][col];
      next[r][col] = 2 * grid[r][col] - prev[r][col] + c * c * laplacian;
      next[r][col] *= damping;
    }
  }
  return next;
}

export function simulateMembrane(size = 16, steps = 50) {
  let current = Array.from({ length: size }, () => new Array(size).fill(0));
  let previous = current.map(r => [...r]);
  current[Math.floor(size/2)][Math.floor(size/2)] = 1;
  const snapshots = [];
  for (let t = 0; t < steps; t++) {
    const next = propagate(current, previous);
    previous = current;
    current = next;
    if (t % 10 === 0) snapshots.push(current.map(r => [...r]));
  }
  return { finalGrid: current, snapshots };
}
