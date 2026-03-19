/**
 * @module wasmAcceleratedMath
 * @description This module provides high-speed matrix operations and embedding computations using WebAssembly for efficient numerical computation.
 */

const { readFile } = require('fs/promises');
const { join } = require('path');

/**
 * Loads and initializes a WebAssembly module for high-performance matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The WebAssembly instance ready for computations.
 */
async function initializeWasm() {
  const wasmPath = join(__dirname, 'matrix_operations.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using WebAssembly for high-performance computation.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimension mismatch: cannot multiply these matrices.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const inputSizeA = rowsA * colsA;
  const inputSizeB = colsA * colsB;
  const outputSize = rowsA * colsB;

  const totalSize = inputSizeA + inputSizeB + outputSize;

  const memoryBuffer = new Float64Array(memory.buffer, 0, totalSize);

  let offset = 0;

  // Copy matrixA into memory
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      memoryBuffer[offset++] = matrixA[i][j];
    }
  }

  // Copy matrixB into memory
  for (let i = 0; i < colsA; i++) {
    for (let j = 0; j < colsB; j++) {
      memoryBuffer[offset++] = matrixB[i][j];
    }
  }

  // Perform the multiplication
  multiply_matrices(rowsA, colsA, colsB);

  // Extract the result from memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(memoryBuffer[offset++]);
    }
    result.push(row);
  }

  return result;
}

/**
 * Computes the embedding of a vector using a predefined transformation matrix.
 * @async
 * @param {number[]} vector - The input vector.
 * @param {number[][]} embeddingMatrix - The transformation matrix.
 * @returns {Promise<number[]>} The resulting embedded vector.
 * @throws {Error} If the vector and matrix dimensions do not align.
 */
async function computeEmbedding(vector, embeddingMatrix) {
  const vectorAsMatrix = vector.map(v => [v]);
  const resultMatrix = await multiplyMatrices(embeddingMatrix, vectorAsMatrix);
  return resultMatrix.flat();
}

module.exports = {
  initializeWasm,
  multiplyMatrices,
  computeEmbedding
};