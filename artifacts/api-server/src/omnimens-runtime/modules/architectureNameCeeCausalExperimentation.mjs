/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: backlog_dream_id_11237
 * Title: ARCHITECTURE NAME  
   CEE – Causal Experimentation
 * Written: 2026-03-22T20:46:22.271Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export type Event = {t:number, id:string, prop:string, val:number};
export type Edge = {from:string, to:string, weight:number};
export type Graph = Map<string, Edge[]>;

const eps = 1e-9;

function cmid(pxyz:number, pxz:number, pyz:number, pz:number){
  return Math.log((pxyz*pz + eps)/(pxz*pyz + eps));
}

export function induceCausalGraph(events:Event[], theta=0.05):Graph{
  const nodes = new Set(events.map(e=>e.id+e.prop));
  const edges:Graph = new Map();
  const pairs = Array.from(nodes);
  for(let i=0;i<pairs.length;i++){
    for(let j=0;j<pairs.length;j++){
      if(i===j) continue;
      const from = pairs[i], to = pairs[j];
      const eij = events.filter(e=>e.id+e.prop===from || e.id+e.prop===to);
      if(eij.length<4) continue;
      const xyz = cmid( prob(eij,from,to), probSingle(eij,from), probSingle(eij,to), 0.5 );
      if(xyz>theta){
        if(!edges.has(from)) edges.set(from,[]);
        edges.get(from)!.push({from,to,weight:xyz});
      }
    }
  }
  return edges;
}

function prob(es:Event[], a:string,b:string){
  let both=0, tot=0;
  for(const e of es){ if(e.id+e.prop===a||e.id+e.prop===b){tot++; if(e.val>0) both++;}}
  return both/(tot||1);
}
function probSingle(es:Event[], a:string){
  let pos=0, tot=0;
  for(const e of es){ if(e.id+e.prop===a){tot++; if(e.val>0) pos++;}}
  return pos/(tot||1);
}