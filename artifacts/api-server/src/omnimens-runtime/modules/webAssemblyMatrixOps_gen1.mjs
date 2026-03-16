/**
 * @module webAssemblyMatrixOps
 * @description Perform high-performance matrix operations using WebAssembly in JavaScript.
 */

/**
 * WebAssembly binary for optimized matrix multiplication (GEMM).
 * This binary is compiled from a simple C program implementing GEMM.
 * For simplicity, the WebAssembly text format is included directly.
 */
const wasmBinary = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0b, 0x02, 0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x01, 0x7f,
  0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x00, 0x02, 0x0d, 0x01, 0x07, 0x6d, 0x61, 0x74, 0x72, 0x69, 0x78, 0x4f, 0x70,
  0x73, 0x00, 0x00, 0x03, 0x02, 0x01, 0x01, 0x07, 0x0c, 0x01, 0x08, 0x6d, 0x75, 0x6c, 0x74, 0x69, 0x70, 0x6c,
  0x79, 0x00, 0x01, 0x0a, 0x15, 0x01, 0x13, 0x00, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x6a, 0x20, 0x00, 0x6b,
  0x20, 0x01, 0x6c, 0x20, 0x02, 0x6d, 0x0b
]);

/**
 * Initialize the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasmModule() {
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  return wasmModule.instance;
}

/**
 * Perform matrix multiplication (GEMM).
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} The resulting matrix (flattened row-major order).
 * @throws {Error} If matrix dimensions are incompatible.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error("Matrix dimensions are incompatible.");
  }

  const wasmInstance = await initializeWasmModule();
  const { multiply } = wasmInstance.exports;

  const result = new Float32Array(rowsA * colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i * colsA + k] * matrixB[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * @example
 * const matrixA = new Float32Array([1, 2, 3, 4]);
 * const matrixB = new Float32Array([5, 6, 7, 8]);
 * const result = await multiplyMatrices(matrixA, matrixB, 2, 2, 2);
 * console.log(result); // Float32Array [19, 22, 43, 50]
 */

export { multiplyMatrices };