/**
 * @module matrixOps_wasm
 * @description Provides optimized matrix operations leveraging WebAssembly (WASM) for computationally expensive tasks in Node.js.
 * @exports loadWasmModule, multiplyMatrices
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
export async function loadWasmModule() {
  const wasmFilePath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmFilePath);

  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Multiplies two matrices using the WebAssembly module.
 * @async
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @param {WebAssembly.Instance} wasmInstance - The loaded WebAssembly instance.
 * @returns {Promise<number[][]>} A promise that resolves to the resulting matrix.
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB, wasmInstance) {
  // Validate input matrices
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication: colsA must equal rowsB.');
  }

  // Flatten matrices into 1D arrays for WASM
  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();

  // Allocate memory in WASM for matrices
  const { memory, multiply_matrices } = wasmInstance.exports;
  const wasmMemory = new Float64Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + flatMatrixA.length;
  const offsetC = offsetB + flatMatrixB.length;

  wasmMemory.set(flatMatrixA, offsetA);
  wasmMemory.set(flatMatrixB, offsetB);

  // Perform matrix multiplication in WASM
  multiply_matrices(offsetA, rowsA, colsA, offsetB, rowsB, colsB, offsetC);

  // Extract result matrix from WASM memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(wasmMemory.slice(offsetC + i * colsB, offsetC + (i + 1) * colsB)));
  }

  return result;
}

/**
 * Example WebAssembly code (matrix_ops.wasm) to be compiled separately:
 * 
 * (module
 *   (memory (export "memory") 1)
 *   (func (export "multiply_matrices")
 *     (param $aStart i32) (param $aRows i32) (param $aCols i32)
 *     (param $bStart i32) (param $bRows i32) (param $bCols i32)
 *     (param $cStart i32)
 *     ... // WASM matrix multiplication logic here
 *   )
 * )
 */