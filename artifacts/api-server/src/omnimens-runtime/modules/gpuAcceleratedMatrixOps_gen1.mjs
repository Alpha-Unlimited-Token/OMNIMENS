// gpuAcceleratedMatrixOps.js

/**
 * @module gpuAcceleratedMatrixOps
 * @description Provides GPU-accelerated matrix operations leveraging TensorFlow.js with WebGL backend for efficient numerical computations.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Worker, isMainThread, parentPort } = require('worker_threads');

/**
 * Initializes a WebGL context and performs matrix multiplication on the GPU.
 * This function is designed to run in a dedicated worker thread.
 * @param {Float32Array} matrixA - The first matrix (flattened) in row-major order.
 * @param {Float32Array} matrixB - The second matrix (flattened) in row-major order.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float32Array>} - A promise resolving to the result matrix (flattened).
 */
export async function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (!isMainThread) {
    throw new Error('gpuMatrixMultiply must be called from the main thread.');
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(import.meta.url);

    worker.on('message', (result) => {
      resolve(result);
      worker.terminate();
    });

    worker.on('error', (err) => {
      reject(err);
      worker.terminate();
    });

    worker.postMessage({ matrixA, matrixB, rowsA, colsA, colsB });
  });
}

if (!isMainThread) {
  parentPort.on('message', ({ matrixA, matrixB, rowsA, colsA, colsB }) => {
    try {
      const result = performMatrixMultiplication(matrixA, matrixB, rowsA, colsA, colsB);
      parentPort.postMessage(result);
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
}

/**
 * Performs matrix multiplication on the GPU using WebGL.
 * @param {Float32Array} matrixA - The first matrix (flattened) in row-major order.
 * @param {Float32Array} matrixB - The second matrix (flattened) in row-major order.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The result matrix (flattened).
 */
function performMatrixMultiplication(matrixA, matrixB, rowsA, colsA, colsB) {
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
 * Validates input matrices and dimensions for matrix multiplication.
 * @param {Float32Array} matrixA - The first matrix.
 * @param {Float32Array} matrixB - The second matrix.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @throws {Error} - If dimensions are incompatible or inputs are invalid.
 */
export function validateInputs(matrixA, matrixB, rowsA, colsA, colsB) {
  if (!matrixA || !matrixB || !rowsA || !colsA || !colsB) {
    throw new Error('All input parameters must be provided.');
  }

  if (matrixA.length !== rowsA * colsA) {
    throw new Error('Matrix A dimensions do not match the provided rows and columns.');
  }

  if (matrixB.length !== colsA * colsB) {
    throw new Error('Matrix B dimensions do not match the provided rows and columns.');
  }

  if (colsA <= 0 || rowsA <= 0 || colsB <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }
}

/**
 * Example usage of the gpuMatrixMultiply function.
 */
(async () => {
  if (isMainThread) {
    const matrixA = new Float32Array([1, 2, 3, 4, 5, 6]); // 2x3 matrix
    const matrixB = new Float32Array([7, 8, 9, 10, 11, 12]); // 3x2 matrix

    const rowsA = 2;
    const colsA = 3;
    const colsB = 2;

    try {
      validateInputs(matrixA, matrixB, rowsA, colsA, colsB);
      const result = await gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
})();