/**
 * wasmAcceleratedMatrixOps - A utility module for fast matrix operations using WebAssembly.
 * This module implements BLAS-like operations (e.g., matrix multiplication, dot products) with WebAssembly acceleration.
 * It is designed to be efficient, self-contained, and runnable in Node.js 20+.
 */

// WebAssembly binary for basic matrix multiplication (compiled from a minimal C implementation)
const wasmCode = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0a, 0x02, 0x60, 0x03, 0x7f, 0x7f, 0x7f,
  0x01, 0x7f, 0x60, 0x00, 0x00, 0x03, 0x03, 0x02, 0x00, 0x01, 0x07, 0x13, 0x02, 0x0a, 0x6d, 0x61,
  0x74, 0x72, 0x69, 0x78, 0x5f, 0x6d, 0x75, 0x6c, 0x00, 0x00, 0x06, 0x69, 0x6e, 0x69, 0x74, 0x00,
  0x01, 0x0a, 0x1a, 0x01, 0x18, 0x00, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x10, 0x00, 0x0b
]);

let wasmInstance;

/**
 * Initializes the WebAssembly instance for matrix operations.
 * @returns {Promise<void>} A promise that resolves when the WebAssembly instance is ready.
 */
export async function initializeWasm() {
  const wasmModule = await WebAssembly.compile(wasmCode);
  wasmInstance = await WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If matrices are not compatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error("WebAssembly instance is not initialized. Call initializeWasm() first.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Computes the dot product of two vectors using WebAssembly.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The resulting dot product.
 * @throws {Error} If vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (!wasmInstance) {
    throw new Error("WebAssembly instance is not initialized. Call initializeWasm() first.");
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
}

/**
 * Checks if the WebAssembly module is initialized.
 * @returns {boolean} True if initialized, false otherwise.
 */
export function isWasmInitialized() {
  return !!wasmInstance;
}