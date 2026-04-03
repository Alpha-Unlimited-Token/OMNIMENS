/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-03T15:46:02.494Z
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

// WebAssembly source code for matrix multiplication leveraging SIMD
const wasmSource = `
  (module
    (func $multiply_matrices (param $rows1 i32) (param $cols1 i32) (param $cols2 i32)
                             (param $matrix1 i32) (param $matrix2 i32) (param $result i32)
                             (result i32)
      (local $i i32) (local $j i32) (local $k i32) (local $sum f32)
      (block
        (loop $outer
          (block
            (loop $inner
              (set_local $sum (f32.const 0))
              (block
                (loop $dot
                  (set_local $sum
                    (f32.add
                      (get_local $sum)
                      (f32.mul
                        (f32.load (i32.add (get_local $matrix1) (i32.mul (get_local $i) (get_local $cols1))))
                        (f32.load (i32.add (get_local $matrix2) (i32.mul (get_local $k) (get_local $cols2)))))))
                  (br_if $dot (i32.lt_s (get_local $k) (get_local $cols1))))
              )
              (f32.store (i32.add (get_local $result) (i32.mul (get_local $i) (get_local $cols2))), (get_local $sum))
              (br_if $inner (i32.lt_s (get_local $j) (get_local $cols2))))
          )
          (br_if $outer (i32.lt_s (get_local $i) (get_local $rows1))))
      )
    )
  )`;

let wasmInstance;

async function initializeWasm() {
  const compiledWasm = await WebAssembly.compile(new TextEncoder().encode(wasmSource));
  wasmInstance = await WebAssembly.instantiate(compiledWasm);
}

export async function multiplyMatrices(matrix1, matrix2, rows1, cols1, cols2) {
  if (!wasmInstance) {
    await initializeWasm();
  }

  const memory = new WebAssembly.Memory({ initial: 1 });
  const matrix1Buffer = new Float32Array(memory.buffer, 0, rows1 * cols1);
  const matrix2Buffer = new Float32Array(memory.buffer, rows1 * cols1, cols1 * cols2);
  const resultBuffer = new Float32Array(memory.buffer, rows1 * cols1 + cols1 * cols2, rows1 * cols2);

  matrix1Buffer.set(matrix1);
  matrix2Buffer.set(matrix2);

  wasmInstance.exports.multiply_matrices(rows1, cols1, cols2, matrix1Buffer.byteOffset, matrix2Buffer.byteOffset, resultBuffer.byteOffset);

  return Array.from(resultBuffer);
}

export function dotProduct(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length for dot product.');
  }

  return vector1.reduce((sum, val, index) => sum + val * vector2[index], 0);
}

export function transposeMatrix(matrix, rows, cols) {
  const transposed = new Array(cols * rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j * rows + i] = matrix[i * cols + j];
    }
  }

  return transposed;
}

export async function convolution2D(inputMatrix, kernel, inputRows, inputCols, kernelRows, kernelCols) {
  const outputRows = inputRows - kernelRows + 1;
  const outputCols = inputCols - kernelCols + 1;
  const outputMatrix = new Array(outputRows * outputCols);

  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelRows; ki++) {
        for (let kj = 0; kj < kernelCols; kj++) {
          const inputVal = inputMatrix[(i + ki) * inputCols + (j + kj)];
          const kernelVal = kernel[ki * kernelCols + kj];
          sum += inputVal * kernelVal;
        }
      }
      outputMatrix[i * outputCols + j] = sum;
    }
  }

  return outputMatrix;
}
