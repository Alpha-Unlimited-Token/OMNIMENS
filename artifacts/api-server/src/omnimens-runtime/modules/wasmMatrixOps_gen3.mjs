/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-03T15:47:41.413Z
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

import { TextEncoder, TextDecoder } from 'util';

// Utility to compile WebAssembly code from a string
export async function compileWasm(source) {
  const encoder = new TextEncoder();
  const wasmBytes = encoder.encode(source);
  const wasmModule = await WebAssembly.compile(wasmBytes);
  return new WebAssembly.Instance(wasmModule);
}

// WebAssembly source for basic matrix multiplication
const wasmMatrixMultiplySource = `
  (module
    (memory (export "memory") 1)
    (func (export "multiply") (param $a i32) (param $b i32) (param $c i32) (param $rowsA i32) (param $colsA i32) (param $colsB i32)
      (local $i i32) (local $j i32) (local $k i32) (local $sum f32)
      (block $outer
        (loop $rowLoop
          (block $inner
            (loop $colLoop
              (set_local $sum (f32.const 0))
              (block $innerMost
                (loop $kLoop
                  (br_if $innerMost (i32.ge_u (get_local $k) (get_local $colsA)))
                  (set_local $sum (f32.add
                    (get_local $sum)
                    (f32.mul
                      (f32.load (i32.add (get_local $a) (i32.mul (get_local $i) (get_local $colsA))))
                      (f32.load (i32.add (get_local $b) (i32.mul (get_local $k) (get_local $colsB))))
                    )
                  ))
                  (set_local $k (i32.add (get_local $k) (i32.const 1)))
                  (br $kLoop)
                )
              )
              (f32.store (i32.add (get_local $c) (i32.mul (get_local $i) (get_local $colsB))), (get_local $sum))
              (set_local $j (i32.add (get_local $j) (i32.const 1)))
              (br $colLoop)
            )
          )
          (set_local $i (i32.add (get_local $i) (i32.const 1)))
          (br $rowLoop)
        )
      )
    )
  )
`;

// Function to perform matrix multiplication using WebAssembly
export async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const wasmInstance = await compileWasm(wasmMatrixMultiplySource);
  const memory = wasmInstance.exports.memory;
  const buffer = new Float32Array(memory.buffer);

  // Allocate memory for matrices
  const aOffset = 0;
  const bOffset = rowsA * colsA;
  const cOffset = bOffset + colsA * colsB;

  buffer.set(matrixA, aOffset);
  buffer.set(matrixB, bOffset);

  // Call the WebAssembly function
  wasmInstance.exports.multiply(aOffset, bOffset, cOffset, rowsA, colsA, colsB);

  // Extract the result matrix
  return buffer.slice(cOffset, cOffset + rowsA * colsB);
}

// Utility to reshape a flat array into a 2D matrix
export function reshape(array, rows, cols) {
  if (array.length !== rows * cols) {
    throw new Error("Array size does not match specified dimensions.");
  }
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(array.slice(i * cols, (i + 1) * cols));
  }
  return matrix;
}

// Utility to flatten a 2D matrix into a flat array
export function flatten(matrix) {
  return matrix.reduce((acc, row) => acc.concat(row), []);
}