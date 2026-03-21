/**
 * @module matrixOpsEngine
 * @description This module provides efficient matrix operations using WebAssembly for high-performance local computation of embeddings and neural network layers.
 */

import { readFile } from "fs/promises";
import path from "path";

let wasmInstance;

/**
 * Initializes the WebAssembly module for matrix operations.
 * Loads and compiles the WebAssembly binary.
 * @returns {Promise<void>} Resolves when the WebAssembly module is ready.
 */
export async function initializeWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmEnv = {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
      abort: () => { throw new Error('WASM aborted'); }
    }
  };
  wasmInstance = await WebAssembly.instantiate(wasmModule, wasmEnv);
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initializeWasm() first.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Array(rowsA * colsB).fill(0);

  const { multiply_matrices } = wasmInstance.exports;

  const ptrA = wasmInstance.exports.malloc(flatA.length * 4);
  const ptrB = wasmInstance.exports.malloc(flatB.length * 4);
  const ptrResult = wasmInstance.exports.malloc(result.length * 4);

  const memory = new Uint32Array(wasmInstance.exports.memory.buffer);
  memory.set(flatA, ptrA / 4);
  memory.set(flatB, ptrB / 4);

  multiply_matrices(ptrA, rowsA, colsA, ptrB, rowsB, colsB, ptrResult);

  const resultView = new Float32Array(wasmInstance.exports.memory.buffer, ptrResult, result.length);
  const finalResult = [];
  for (let i = 0; i < rowsA; i++) {
    finalResult.push(Array.from(resultView.slice(i * colsB, (i + 1) * colsB)));
  }

  wasmInstance.exports.free(ptrA);
  wasmInstance.exports.free(ptrB);
  wasmInstance.exports.free(ptrResult);

  return finalResult;
}

/**
 * Multiplies a matrix and a vector using WebAssembly.
 * @param {number[][]} matrix - The matrix.
 * @param {number[]} vector - The vector.
 * @returns {number[]} The resulting vector after multiplication.
 * @throws {Error} If the matrix and vector dimensions do not align.
 */
export function multiplyMatrixVector(matrix, vector) {
  const vectorAsMatrix = vector.map(v => [v]);
  const resultMatrix = multiplyMatrices(matrix, vectorAsMatrix);
  return resultMatrix.map(row => row[0]);
}

/**
 * Adds two vectors element-wise.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number[]} The resulting vector after addition.
 * @throws {Error} If the vectors are not of the same length.
 */
export function addVectors(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for addition.');
  }
  return vectorA.map((val, idx) => val + vectorB[idx]);
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for dot product.');
  }
  return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
}