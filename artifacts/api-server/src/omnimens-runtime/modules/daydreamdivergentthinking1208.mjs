/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #1208
 * Written: 2026-03-23T15:06:48.109Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

 omega; links };   // natural freq & couplings
const TAU = 2*Math.PI;

export function stepNet(net, K, dt) {
  const n = net.length, next= new Array(n);
  for(let i=0;i<n;i++){
    const o = net[i];
    let sum=0;
    for(const j of o.links){
      const diff = (net[j].phase - o.phase + TAU) % TAU;
      sum += Math.sin(diff);
    }
    const dphi = o.omega + (K/o.links.length)*sum;
    next[i] = {phase:(o.phase + dphi*dt) % TAU, omega:o.omega, links:o.links};
  }
  return next;
}

export function braidSignal(net, anchor) {
  // returns “chord” of phase offsets to HOME_BASE anchor
  const base = net[anchor].phase;
  return net.map(o => ((o.phase - base + TAU) % TAU)/TAU);
}

export function convergence(net, eps=1e-3) {
  const first = net[0].phase;
  return net.every(o => Math.abs(Math.sin(o.phase-first))<eps);
}