/**
 * @module webAssemblyMathEngine
 * @description This module uses WebAssembly to perform high-performance linear algebra operations like matrix multiplication and dot products in JavaScript.
 */

// WebAssembly binary for basic matrix operations (written in WebAssembly Text Format, WAT, and compiled to binary)
const wasmCode = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0a, 0x02, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x60,
  0x00, 0x00, 0x03, 0x03, 0x02, 0x00, 0x01, 0x07, 0x11, 0x02, 0x03, 0x64, 0x6f, 0x74, 0x00, 0x00, 0x0d, 0x6d,
  0x61, 0x74, 0x72, 0x69, 0x78, 0x5f, 0x6d, 0x75, 0x6c, 0x00, 0x01, 0x0a, 0x1f, 0x02, 0x07, 0x00, 0x20, 0x00,
  0x20, 0x01, 0x6a, 0x0b, 0x15, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6c, 0x20, 0x01, 0x20, 0x00, 0x6c, 0x6a, 0x0b
]);

/**
 * Initialize the WebAssembly instance and export its functions.
 * @returns {Promise} A promise that resolves to the WebAssembly exports.
 */
async function initializeWasm() {
  const wasmModule = await WebAssembly.compile(wasmCode);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
  return wasmInstance.exports;
}

/**
 * Performs a dot product of two vectors using WebAssembly.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The dot product of the two vectors.
 */
export async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const wasm = await initializeWasm();
  let result = 0;

  for (let i = 0; i < vectorA.length; i++) {
    result += wasm.dot(vectorA[i], vectorB[i]);
  }

  return result;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The product of the two matrices.
 */
export async function matrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in Matrix A must equal number of rows in Matrix B.');
  }

  const wasm = await initializeWasm();
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += wasm.matrix_mul(matrixA[i][k], matrixB[k][j]);
      }
    }
  }

  return result;
}

/**
 * Example usage of the module functions.
 * @async
 * @function example
 */
export async function example() {
  const vectorA = [1, 2, 3];
  const vectorB = [4, 5, 6];
  const dot = await dotProduct(vectorA, vectorB);
  console.log('Dot Product:', dot);

  const matrixA = [
    [1, 2],
    [3, 4]
  ];
  const matrixB = [
    [5, 6],
    [7, 8]
  ];
  const product = await matrixMultiply(matrixA, matrixB);
  console.log('Matrix Product:', product);
}
