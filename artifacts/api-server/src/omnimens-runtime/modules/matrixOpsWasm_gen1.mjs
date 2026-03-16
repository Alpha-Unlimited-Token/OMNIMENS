/**
 * @module matrixOpsWasm
 * @description A utility module for performing efficient matrix operations using WebAssembly.
 * This module compiles a subset of BLAS (Basic Linear Algebra Subprograms) to WebAssembly and exposes
 * JavaScript bindings for high-performance matrix computations.
 *
 * @example
 * import { initialize, multiplyMatrices } from './matrixOpsWasm.js';
 * await initialize();
 * const result = multiplyMatrices([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
 * console.log(result); // [[19, 22], [43, 50]]
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Internal variables to hold the WebAssembly instance and memory
let wasmInstance = null;
let wasmMemory = null;

/**
 * Initializes the WebAssembly module by loading and compiling the BLAS implementation.
 * This function must be called before using any other functions in this module.
 * @async
 * @returns {Promise<void>}
 */
export async function initialize() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const wasmFilePath = path.join(__dirname, 'blas.wasm');

  // Load the WebAssembly binary
  const wasmBuffer = await readFile(wasmFilePath);

  // Instantiate the WebAssembly module
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
      abort: () => {
        throw new Error('WebAssembly aborted execution');
      }
    }
  });

  wasmInstance = wasmModule.instance;
  wasmMemory = wasmInstance.exports.memory;
}

/**
 * Multiplies two matrices using the WebAssembly-compiled BLAS library.
 * @param {number[][]} matrixA - The first matrix (2D array of numbers).
 * @param {number[][]} matrixB - The second matrix (2D array of numbers).
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If the matrices are not compatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error('WebAssembly module not initialized. Call initialize() first.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  // Flatten the matrices into 1D arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  // Allocate memory for the matrices and the result
  const aPtr = wasmInstance.exports.malloc(flatA.length * 4);
  const bPtr = wasmInstance.exports.malloc(flatB.length * 4);
  const resultPtr = wasmInstance.exports.malloc(rowsA * colsB * 4);

  const memoryView = new Float32Array(wasmMemory.buffer);

  // Copy the matrices into WebAssembly memory
  memoryView.set(flatA, aPtr / 4);
  memoryView.set(flatB, bPtr / 4);

  // Perform the matrix multiplication
  wasmInstance.exports.matrixMultiply(aPtr, bPtr, resultPtr, rowsA, colsA, colsB);

  // Retrieve the result from WebAssembly memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(memoryView.slice(resultPtr / 4 + i * colsB, resultPtr / 4 + (i + 1) * colsB)));
  }

  // Free the allocated memory
  wasmInstance.exports.free(aPtr);
  wasmInstance.exports.free(bPtr);
  wasmInstance.exports.free(resultPtr);

  return result;
}

/**
 * Frees all resources allocated by the WebAssembly module.
 * Should be called when the module is no longer needed.
 * @returns {void}
 */
export function cleanup() {
  if (wasmInstance && wasmInstance.exports.freeMemory) {
    wasmInstance.exports.freeMemory();
  }
  wasmInstance = null;
  wasmMemory = null;
}