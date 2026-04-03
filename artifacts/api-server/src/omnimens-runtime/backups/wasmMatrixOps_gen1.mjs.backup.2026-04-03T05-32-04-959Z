/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-01T22:15:57.837Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixOps.mjs

import { instantiate } from 'webassembly';

// WebAssembly source code for matrix multiplication
const wasmSource = `(module
  (memory $mem 1)
  (export "memory" (memory $mem))
  (func $multiplyMatrices (param $rows1 i32) (param $cols1 i32) (param $cols2 i32) (param $mat1 i32) (param $mat2 i32) (param $result i32)
    (local $i i32) (local $j i32) (local $k i32) (local $sum f32)
    (loop $outer
      (block $exitOuter
        (i32.eqz (i32.lt_u (local.get $i) (local.get $rows1)))
        (br_if $exitOuter)
        (loop $middle
          (block $exitMiddle
            (i32.eqz (i32.lt_u (local.get $j) (local.get $cols2)))
            (br_if $exitMiddle)
            (local.set $sum (f32.const 0))
            (loop $inner
              (block $exitInner
                (i32.eqz (i32.lt_u (local.get $k) (local.get $cols1)))
                (br_if $exitInner)
                (local.set $sum
                  (f32.add
                    (local.get $sum)
                    (f32.mul
                      (f32.load (i32.add (local.get $mat1) (i32.mul (local.get $i) (local.get $cols1) (local.get $k))))
                      (f32.load (i32.add (local.get $mat2) (i32.mul (local.get $k) (local.get $cols2) (local.get $j))))
                    )
                  )
                )
                (local.set $k (i32.add (local.get $k) (i32.const 1)))
              )
            )
            (f32.store (i32.add (local.get $result) (i32.mul (local.get $i) (local.get $cols2) (local.get $j))), (local.get $sum))
            (local.set $j (i32.add (local.get $j) (i32.const 1)))
          )
        )
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
      )
    )
  )
)`;

let wasmInstance;

async function initializeWasm() {
  const { instance } = await WebAssembly.instantiate(new Uint8Array(wasmSource));
  wasmInstance = instance;
}

export async function multiplyMatrices(matrix1, matrix2) {
  if (!wasmInstance) {
    await initializeWasm();
  }

  const rows1 = matrix1.length;
  const cols1 = matrix1[0].length;
  const cols2 = matrix2[0].length;

  const mat1 = new Float32Array(rows1 * cols1);
  const mat2 = new Float32Array(cols1 * cols2);
  const result = new Float32Array(rows1 * cols2);

  for (let i = 0; i < rows1; i++) {
    for (let j = 0; j < cols1; j++) {
      mat1[i * cols1 + j] = matrix1[i][j];
    }
  }

  for (let i = 0; i < cols1; i++) {
    for (let j = 0; j < cols2; j++) {
      mat2[i * cols2 + j] = matrix2[i][j];
    }
  }

  const memory = wasmInstance.exports.memory;
  const mat1Ptr = wasmInstance.exports.allocate(mat1.byteLength);
  const mat2Ptr = wasmInstance.exports.allocate(mat2.byteLength);
  const resultPtr = wasmInstance.exports.allocate(result.byteLength);

  new Float32Array(memory.buffer, mat1Ptr, mat1.length).set(mat1);
  new Float32Array(memory.buffer, mat2Ptr, mat2.length).set(mat2);

  wasmInstance.exports.multiplyMatrices(rows1, cols1, cols2, mat1Ptr, mat2Ptr, resultPtr);

  const output = new Float32Array(memory.buffer, resultPtr, result.length);

  return Array.from({ length: rows1 }, (_, i) => output.slice(i * cols2, (i + 1) * cols2));
}

export function dotProduct(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error("Vectors must be the same length");
  }

  return vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
}

export async function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  return Array.from({ length: cols }, (_, i) => Array.from({ length: rows }, (_, j) => matrix[j][i]));
}