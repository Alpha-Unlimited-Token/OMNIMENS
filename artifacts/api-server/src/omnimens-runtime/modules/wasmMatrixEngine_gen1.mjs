/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-01T21:57:17.676Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixEngine.mjs
import { instantiate } from 'webassembly';

const wasmSource = `
(module
  (memory $mem 1)
  (export "memory" (memory $mem))
  (func $multiplyMatrices (param $rows i32) (param $cols i32) (param $common i32) (param $aOffset i32) (param $bOffset i32) (param $resultOffset i32)
    (local $i i32) (local $j i32) (local $k i32) (local $sum f32)
    (local.set $i (i32.const 0))
    (loop $outer
      (local.set $j (i32.const 0))
      (loop $inner
        (local.set $sum (f32.const 0))
        (local.set $k (i32.const 0))
        (loop $multiply
          (local.set $sum (f32.add (local.get $sum) (f32.mul
            (f32.load (i32.add (local.get $aOffset) (i32.mul (local.get $i) (local.get $common)) (local.get $k)))
            (f32.load (i32.add (local.get $bOffset) (i32.mul (local.get $k) (local.get $cols)) (local.get $j)))))))
          (local.set $k (i32.add (local.get $k) (i32.const 1)))
          (br_if $multiply (i32.lt_s (local.get $k) (local.get $common))))
        (f32.store (i32.add (local.get $resultOffset) (i32.mul (local.get $i) (local.get $cols)) (local.get $j)) (local.get $sum))
        (local.set $j (i32.add (local.get $j) (i32.const 1)))
        (br_if $inner (i32.lt_s (local.get $j) (local.get $cols))))
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $outer (i32.lt_s (local.get $i) (local.get $rows))))))
  (export "multiplyMatrices" (func $multiplyMatrices))
)`;

let wasmInstance;

async function initializeWasm() {
  const wasmModule = await WebAssembly.compile(new TextEncoder().encode(wasmSource));
  wasmInstance = await WebAssembly.instantiate(wasmModule);
}

function multiplyMatrices(rows, cols, common, matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error("WASM module not initialized. Call initializeWasm() first.");
  }

  const memory = new Float32Array(wasmInstance.exports.memory.buffer);
  const aOffset = 0;
  const bOffset = rows * common;
  const resultOffset = rows * common + common * cols;

  // Copy matrices into WASM memory
  matrixA.flat().forEach((val, index) => memory[aOffset + index] = val);
  matrixB.flat().forEach((val, index) => memory[bOffset + index] = val);

  wasmInstance.exports.multiplyMatrices(rows, cols, common, aOffset, bOffset, resultOffset);

  // Retrieve result matrix
  const result = [];
  for (let i = 0; i < rows; i++) {
    result.push(memory.slice(resultOffset + i * cols, resultOffset + (i + 1) * cols));
  }

  return result;
}

export async function initialize() {
  await initializeWasm();
}

export function matrixMultiply(rows, cols, common, matrixA, matrixB) {
  return multiplyMatrices(rows, cols, common, matrixA, matrixB);
}

export const wasmMatrixEngine = {
  initialize,
  matrixMultiply
};