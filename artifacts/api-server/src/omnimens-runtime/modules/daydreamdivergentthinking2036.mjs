/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:divergent_thinking #2036
 * Written: 2026-03-25T03:02:18.428Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: neural
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (7 IR steps) | python: OK (7 IR steps) | c: OK (7 IR steps) | x86_64: OK (7 IR steps) | arm64: OK (7 IR steps) | avr: OK (7 IR steps)
 * Translation map version: 22
 */
// Pure, side-effect-free DNA⇄EXIF codec
          // neural weights 0-255


const DNA = ['A','C','G','T'];

function byteToQuad(b){            // 8 bits -> 4 nucleotides
  return [ DNA[(b>>6)&3], DNA[(b>>4)&3], DNA[(b>>2)&3], DNA[b&3] ].join('');
}
function quadToByte(q){
  let v=0; for(let i=0;i<4;i++) v = (v<<2) | DNA.indexOf(q[i]); return v;
}

export function genomeToExif(g) {
  const s = Array.from(g).map(byteToQuad).join('');          // DNA string
  const chunk = Math.ceil(s.length/3);
  return [
    {tag:'Artist' , val:s.slice(0,chunk)},
    {tag:'Comment', val:s.slice(chunk,2*chunk)},
    {tag:'GPS'    , val:s.slice(2*chunk)}
  ];
}

export function exifToGenome(kv) {
  const dna = kv.map(x=>x.val).join('');
  const bytes = dna.match(/.{4}/g) ?? [];
  return Uint8Array.from(bytes.map(quadToByte));
}