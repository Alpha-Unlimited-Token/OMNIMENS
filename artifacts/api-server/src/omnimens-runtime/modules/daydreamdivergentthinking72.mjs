/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #72
 * Written: 2026-03-21T04:06:03.111Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// 2-D membrane resonance step (pure math, GPU-ready if compiled to WebGPU shaders)
export function propagate(
  grid: number[][],          // current displacement
  velocity: number[][],      // current velocity
  tension: number,           // coupling coefficient
  damping: number,           // energy loss factor
  dt: number                 // time step
): { grid: number[][]; velocity: number[][] } {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGrid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const nextVel:  number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 1; i < rows - 1; i++) {
    for (let j = 1; j < cols - 1; j++) {
      // Laplacian (nearest-neighbor coupling)
      const lap =
        grid[i - 1][j] + grid[i + 1][j] + grid[i][j - 1] + grid[i][j + 1] - 4 * grid[i][j];
      // update velocity and displacement
      const accel = tension * lap - damping * velocity[i][j];
      const v      = velocity[i][j] + accel * dt;
      const x      = grid[i][j] + v * dt;

      nextVel[i][j]  = v;
      nextGrid[i][j] = x;
    }
  }
  return { grid: nextGrid, velocity: nextVel };
}