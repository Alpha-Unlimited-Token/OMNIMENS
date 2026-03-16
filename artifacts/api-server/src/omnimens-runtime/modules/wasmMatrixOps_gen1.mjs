/**
 * wasmMatrixOps - A module for efficient matrix operations using WebAssembly.
 * This module implements basic BLAS-like operations (e.g., matrix multiplication) in WebAssembly
 * and exposes them to JavaScript for high-performance numerical computations.
 */

// WebAssembly binary for matrix operations (compiled from a minimal C program)
const wasmCode = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0a, 0x02, 0x60, 0x03, 0x7f, 0x7f, 0x7f,
  0x01, 0x7f, 0x60, 0x00, 0x00, 0x03, 0x03, 0x02, 0x00, 0x01, 0x07, 0x11, 0x02, 0x0a, 0x6d, 0x61,
  0x74, 0x72, 0x69, 0x78, 0x5f, 0x6d, 0x75, 0x6c, 0x00, 0x00, 0x0a, 0x69, 0x6e, 0x69, 0x74, 0x00,
  0x01, 0x0a, 0x1d, 0x01, 0x1b, 0x01, 0x7f, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x6a, 0x20, 0x03,
  0x6b, 0x36, 0x02, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x20, 0x02, 0x6c, 0x20, 0x03, 0x6a, 0x6b,
  0x0b
]);

let wasmInstance;

/**
 * Initialize the WebAssembly module.
 * @returns {Promise<void>} Resolves when the WebAssembly module is ready.
 */
export async function init() {
  const wasmModule = await WebAssembly.compile(wasmCode);
  wasmInstance = await WebAssembly.instantiate(wasmModule, {});
}

/**
 * Perform matrix multiplication (C = A * B).
 * @param {number[]} A - Flat array representing matrix A (row-major order).
 * @param {number[]} B - Flat array representing matrix B (row-major order).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {number[]} Flat array representing the resulting matrix C (row-major order).
 * @throws {Error} Throws if dimensions are incompatible or if wasmInstance is not initialized.
 */
export function matrixMultiply(A, B, rowsA, colsA, colsB) {
  if (!wasmInstance) {
    throw new Error("WebAssembly module not initialized. Call init() first.");
  }

  if (A.length !== rowsA * colsA || B.length !== colsA * colsB) {
    throw new Error("Matrix dimensions do not match input arrays.");
  }

  const C = new Float32Array(rowsA * colsB);

  const memory = new WebAssembly.Memory({ initial: 1 });
  const memoryBuffer = new Float32Array(memory.buffer);

  // Copy A and B into the WebAssembly memory buffer
  memoryBuffer.set(A, 0);
  memoryBuffer.set(B, A.length);

  // Call the WebAssembly function
  wasmInstance.exports.matrix_mul(
    0, // Offset of A in memory
    A.length, // Offset of B in memory
    A.length + B.length, // Offset of C in memory
    rowsA,
    colsA,
    colsB
  );

  // Copy the result back from WebAssembly memory to JavaScript
  C.set(memoryBuffer.subarray(A.length + B.length, A.length + B.length + C.length));

  return Array.from(C);
}

/**
 * Example usage of the wasmMatrixOps module.
 * Demonstrates matrix multiplication.
 */
(async () => {
  await init();

  const A = [1, 2, 3, 4, 5, 6]; // 2x3 matrix
  const B = [7, 8, 9, 10, 11, 12]; // 3x2 matrix

  const C = matrixMultiply(A, B, 2, 3, 2); // 2x2 result

  console.log("Matrix C:", C);
})();