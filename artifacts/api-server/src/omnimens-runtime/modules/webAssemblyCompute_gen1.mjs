/**
 * @module webAssemblyCompute
 * @description Provides an interface to offload computationally intensive tasks to WebAssembly for efficiency, leveraging C++/Rust libraries.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Loads and initializes a WebAssembly module from a given file path.
 * @async
 * @param {string} filePath - The relative path to the WebAssembly binary (.wasm file).
 * @returns {Promise<WebAssembly.Instance>} The initialized WebAssembly instance.
 * @throws {Error} If the file cannot be read or the WebAssembly module fails to instantiate.
 */
export async function loadWasmModule(filePath) {
  try {
    const wasmPath = join(process.cwd(), filePath);
    const wasmBuffer = await readFile(wasmPath);
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const wasmInstance = await WebAssembly.instantiate(wasmModule);
    return wasmInstance;
  } catch (error) {
    throw new Error(`Failed to load WebAssembly module: ${error.message}`);
  }
}

/**
 * Executes a matrix multiplication using a WebAssembly module.
 * The WebAssembly module must export a `matrixMultiply` function.
 * @async
 * @param {string} wasmFilePath - The relative path to the WebAssembly binary (.wasm file).
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in the first matrix.
 * @param {number} colsA - Number of columns in the first matrix (must match rowsB).
 * @param {number} colsB - Number of columns in the second matrix.
 * @returns {Promise<Float32Array>} The resulting matrix (flattened, row-major order).
 * @throws {Error} If the WebAssembly module or its exports are invalid.
 */
export async function wasmMatrixMultiply(wasmFilePath, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { matrixMultiply, memory } = wasmInstance.exports;

  if (typeof matrixMultiply !== 'function' || !(memory instanceof WebAssembly.Memory)) {
    throw new Error('Invalid WebAssembly module: missing required exports.');
  }

  const memoryBuffer = new Float32Array(memory.buffer);

  // Allocate memory for input and output matrices in the WASM memory space.
  const offsetA = 0;
  const offsetB = matrixA.length;
  const offsetC = offsetB + matrixB.length;

  memoryBuffer.set(matrixA, offsetA);
  memoryBuffer.set(matrixB, offsetB);

  // Perform the matrix multiplication in WASM.
  matrixMultiply(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  // Extract the result matrix from WASM memory.
  const result = memoryBuffer.slice(offsetC, offsetC + rowsA * colsB);
  return result;
}

/**
 * Example usage of the webAssemblyCompute module.
 * Demonstrates loading a WebAssembly module and performing matrix multiplication.
 * @async
 * @example
 * const result = await wasmMatrixMultiply(
 *   './matrix_ops.wasm',
 *   new Float32Array([1, 2, 3, 4]),
 *   new Float32Array([5, 6, 7, 8]),
 *   2, 2, 2
 * );
 * console.log(result); // Float32Array([...])
 */
export async function exampleUsage() {
  try {
    const result = await wasmMatrixMultiply(
      './matrix_ops.wasm',
      new Float32Array([1, 2, 3, 4]),
      new Float32Array([5, 6, 7, 8]),
      2, 2, 2
    );
    console.log('Matrix multiplication result:', result);
  } catch (error) {
    console.error('Error during example usage:', error);
  }
}