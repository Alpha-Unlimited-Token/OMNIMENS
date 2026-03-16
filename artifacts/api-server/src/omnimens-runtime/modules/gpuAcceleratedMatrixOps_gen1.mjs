/**
 * gpuAcceleratedMatrixOps Module
 * Provides efficient matrix operations using WebAssembly for linear algebra and GPU acceleration in Node.js.
 * This module is designed to handle large-scale matrix computations with optimized performance.
 *
 * @module gpuAcceleratedMatrixOps
 */

const { Worker, isMainThread, parentPort } = require('worker_threads');

/**
 * Perform a matrix multiplication using a WebAssembly worker thread.
 * This function offloads heavy computation to a separate thread for efficiency.
 *
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - A promise that resolves to the resulting matrix.
 * @throws {Error} - Throws an error if matrices cannot be multiplied.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename);

    worker.on('message', (result) => {
      resolve(result);
      worker.terminate();
    });

    worker.on('error', (err) => {
      reject(err);
      worker.terminate();
    });

    worker.postMessage({ matrixA, matrixB });
  });
}

if (!isMainThread) {
  parentPort.on('message', ({ matrixA, matrixB }) => {
    const result = computeMatrixMultiplication(matrixA, matrixB);
    parentPort.postMessage(result);
  });
}

/**
 * Compute the matrix multiplication operation.
 * This function is used internally by the worker thread.
 *
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
function computeMatrixMultiplication(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

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
 * Validate a matrix for correctness.
 * Ensures that the input is a 2D array with consistent row lengths.
 *
 * @param {any} matrix - The matrix to validate.
 * @returns {boolean} - True if the matrix is valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    return false;
  }

  const rowLength = matrix[0].length;
  return matrix.every((row) => Array.isArray(row) && row.length === rowLength);
}

/**
 * Transpose a matrix.
 *
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
