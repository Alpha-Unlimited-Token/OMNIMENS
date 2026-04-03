/**
 * @module webAssemblyMatrixOps
 * @description A WebAssembly-powered module for efficient matrix operations, enabling high-performance linear algebra for simulation and reasoning tasks.
 */

import fs from "fs";
import path from "path";

/**
 * Load and compile the WebAssembly module.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
export async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices and allocate memory in WebAssembly
  const flatA = new Float64Array(matrixA.flat());
  const flatB = new Float64Array(matrixB.flat());
  const flatResult = new Float64Array(rowsA * colsB);

  const memoryOffset = wasmInstance.exports.allocate_memory(flatA.length + flatB.length + flatResult.length);

  const aOffset = memoryOffset;
  const bOffset = aOffset + flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = bOffset + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);

  wasmMemory.set(flatA, aOffset / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, bOffset / Float64Array.BYTES_PER_ELEMENT);

  multiply_matrices(aOffset, bOffset, resultOffset, rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(
      Array.from(
        wasmMemory.slice(
          resultOffset / Float64Array.BYTES_PER_ELEMENT + i * colsB,
          resultOffset / Float64Array.BYTES_PER_ELEMENT + (i + 1) * colsB
        )
      )
    );
  }

  return result;
}

/**
 * Validate if a matrix is well-formed.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if the matrix is valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

