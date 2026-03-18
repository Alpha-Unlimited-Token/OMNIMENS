/**
 * @module webAssemblyMatrixOps
 * @description This module enables GPU-like matrix operations using WebAssembly for faster ML computations in Node.js.
 */

const fs = require('fs');
const path = require('path');

/**
 * Compiles the WebAssembly module from a binary file.
 * @param {Buffer} wasmBuffer - The buffer containing the WebAssembly binary.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function compileWasm(wasmBuffer) {
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Initializes the WebAssembly module for matrix operations.
 * @returns {Promise<Object>} - A promise that resolves to an object with matrix operation functions.
 */
async function initMatrixOps() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmInstance = await compileWasm(wasmBuffer);

  const { memory, multiply_matrices, add_vectors } = wasmInstance.exports;

  return {
    /**
     * Multiplies two matrices.
     * @param {Float32Array} matrixA - The first matrix in row-major order.
     * @param {Float32Array} matrixB - The second matrix in row-major order.
     * @param {number} rowsA - The number of rows in matrix A.
     * @param {number} colsA - The number of columns in matrix A.
     * @param {number} colsB - The number of columns in matrix B.
     * @returns {Float32Array} - The resulting matrix in row-major order.
     */
    multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
      const result = new Float32Array(rowsA * colsB);
      const offsetA = 0;
      const offsetB = matrixA.length * Float32Array.BYTES_PER_ELEMENT;
      const offsetResult = offsetB + matrixB.length * Float32Array.BYTES_PER_ELEMENT;

      const wasmMemory = new Float32Array(memory.buffer);
      wasmMemory.set(matrixA, offsetA / Float32Array.BYTES_PER_ELEMENT);
      wasmMemory.set(matrixB, offsetB / Float32Array.BYTES_PER_ELEMENT);

      multiply_matrices(offsetA, offsetB, offsetResult, rowsA, colsA, colsB);

      result.set(
        wasmMemory.subarray(
          offsetResult / Float32Array.BYTES_PER_ELEMENT,
          (offsetResult / Float32Array.BYTES_PER_ELEMENT) + result.length
        )
      );

      return result;
    },

    /**
     * Adds two vectors.
     * @param {Float32Array} vectorA - The first vector.
     * @param {Float32Array} vectorB - The second vector.
     * @returns {Float32Array} - The resulting vector.
     */
    addVectors(vectorA, vectorB) {
      if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must be of the same length');
      }

      const result = new Float32Array(vectorA.length);
      const offsetA = 0;
      const offsetB = vectorA.length * Float32Array.BYTES_PER_ELEMENT;
      const offsetResult = offsetB + vectorB.length * Float32Array.BYTES_PER_ELEMENT;

      const wasmMemory = new Float32Array(memory.buffer);
      wasmMemory.set(vectorA, offsetA / Float32Array.BYTES_PER_ELEMENT);
      wasmMemory.set(vectorB, offsetB / Float32Array.BYTES_PER_ELEMENT);

      add_vectors(offsetA, offsetB, offsetResult, vectorA.length);

      result.set(
        wasmMemory.subarray(
          offsetResult / Float32Array.BYTES_PER_ELEMENT,
          (offsetResult / Float32Array.BYTES_PER_ELEMENT) + result.length
        )
      );

      return result;
    }
  };
}

module.exports = { initMatrixOps };