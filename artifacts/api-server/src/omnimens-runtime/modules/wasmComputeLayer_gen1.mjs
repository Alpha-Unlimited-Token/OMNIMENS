/**
 * @module wasmComputeLayer
 * @description Perform high-performance matrix operations and numerical computations using WebAssembly.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Compiles and initializes a WebAssembly module from a given .wasm file.
 * @async
 * @param {string} wasmFilePath - Path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
export async function initializeWasmModule(wasmFilePath) {
  try {
    const wasmBuffer = await readFile(wasmFilePath);
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const wasmInstance = await WebAssembly.instantiate(wasmModule);
    return wasmInstance;
  } catch (error) {
    throw new Error(`Failed to initialize WebAssembly module: ${error.message}`);
  }
}

/**
 * Performs matrix multiplication using a WebAssembly-compiled BLAS library.
 * @async
 * @param {Array<Array<number>>} matrixA - The first matrix (2D array) to multiply.
 * @param {Array<Array<number>>} matrixB - The second matrix (2D array) to multiply.
 * @param {string} wasmFilePath - Path to the WebAssembly binary file containing BLAS implementation.
 * @returns {Promise<Array<Array<number>>>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices are incompatible for multiplication or if WebAssembly fails.
 */
export async function multiplyMatrices(matrixA, matrixB, wasmFilePath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await initializeWasmModule(wasmFilePath);

  if (!wasmInstance.exports || typeof wasmInstance.exports.multiply !== 'function') {
    throw new Error('The WebAssembly module does not export a valid multiply function.');
  }

  // Flatten matrices into 1D arrays for WebAssembly compatibility
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultArray = new Float64Array(rowsA * colsB);

  // Call the WebAssembly multiply function
  wasmInstance.exports.multiply(
    flatA, flatB, resultArray,
    rowsA, colsA, colsB
  );

  // Convert the 1D result array back to a 2D matrix
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultArray.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Example utility to generate a random matrix of given dimensions.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Array<Array<number>>} A 2D array filled with random numbers.
 */
export function generateRandomMatrix(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random())
  );
}

/**
 * Example utility to pretty-print a matrix.
 * @param {Array<Array<number>>} matrix - The matrix to print.
 */
export function printMatrix(matrix) {
  console.log(matrix.map(row => row.join('\t')).join('\n'));
}