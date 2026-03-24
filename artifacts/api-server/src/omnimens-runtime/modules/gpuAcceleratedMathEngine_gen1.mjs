/**
 * gpuAcceleratedMathEngine - A WebAssembly-powered module for efficient matrix operations and numerical computations.
 *
 * This module leverages WebAssembly (WASM) to perform BLAS-like operations such multiplication, vector addition,
 * and dot products. It is designed to run efficiently in Node.js environments, utilizing the power of WASM for near-native performance.
 *
 * @module gpuAcceleratedMathEngine
 */

import fs from "fs";
import path from "path";

/**
 * Load and compile the WebAssembly binary.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'gpu_math_engine.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WASM.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
export async function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const bufferA = new Float64Array(memory.buffer, 0, flatA.length);
  const bufferB = new Float64Array(memory.buffer, flatA.length * 8, flatB.length);
  const bufferC = new Float64Array(memory.buffer, (flatA.length + flatB.length) * 8, rowsA * colsB);

  bufferA.set(flatA);
  bufferB.set(flatB);

  multiply_matrices(rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(bufferC.slice(i * colsB, (i + 1) * colsB)));
  }

  return result;
}

/**
 * Perform a dot product of two vectors using WASM.
 * @async
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
export async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const wasmInstance = await loadWasm();
  const { memory, dot_product } = wasmInstance.exports;

  const bufferA = new Float64Array(memory.buffer, 0, vectorA.length);
  const bufferB = new Float64Array(memory.buffer, vectorA.length * 8, vectorB.length);

  bufferA.set(vectorA);
  bufferB.set(vectorB);

  return dot_product(vectorA.length);
}

/**
 * Perform vector addition using WASM.
 * @async
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number[]>} The resulting vector after addition.
 * @throws {Error} If the vectors are not of the same length.
 */
export async function vectorAdd(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const wasmInstance = await loadWasm();
  const { memory, add_vectors } = wasmInstance.exports;

  const bufferA = new Float64Array(memory.buffer, 0, vectorA.length);
  const bufferB = new Float64Array(memory.buffer, vectorA.length * 8, vectorB.length);
  const bufferC = new Float64Array(memory.buffer, vectorA.length * 16, vectorA.length);

  bufferA.set(vectorA);
  bufferB.set(vectorB);

  add_vectors(vectorA.length);

  return Array.from(bufferC);
}

