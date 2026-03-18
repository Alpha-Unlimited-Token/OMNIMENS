/**
 * @module webAssemblyGpuOps
 * @description A WebAssembly-backed module for performing GPU-like parallel matrix operations in JavaScript.
 *              This module enables efficient computations by leveraging WebAssembly (WASM) for parallelized
 *              matrix multiplication and vector operations.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads and compiles a WebAssembly module from a .wasm file.
 * @param {string} wasmFilePath - The file path to the WebAssembly binary.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasmModule(wasmFilePath) {
  const wasmBuffer = fs.readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Initializes the WebAssembly module for GPU-like matrix operations.
 * @returns {Promise<Object>} An object containing the WASM matrix operations.
 */
async function initializeWasmOps() {
  const wasmFilePath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmInstance = await loadWasmModule(wasmFilePath);

  const { multiplyMatrices, dotProduct } = wasmInstance.exports;

  return {
    /**
     * Multiplies two matrices using parallelized WebAssembly operations.
     * @param {Float32Array} matrixA - The first matrix (flattened array).
     * @param {Float32Array} matrixB - The second matrix (flattened array).
     * @param {number} rowsA - The number of rows in matrixA.
     * @param {number} colsA - The number of columns in matrixA.
     * @param {number} colsB - The number of columns in matrixB.
     * @returns {Float32Array} The resulting matrix (flattened array).
     */
    multiplyMatrices: (matrixA, matrixB, rowsA, colsA, colsB) => {
      const result = new Float32Array(rowsA * colsB);
      multiplyMatrices(matrixA, matrixB, result, rowsA, colsA, colsB);
      return result;
    },

    /**
     * Computes the dot product of two vectors using WebAssembly operations.
     * @param {Float32Array} vectorA - The first vector.
     * @param {Float32Array} vectorB - The second vector.
     * @returns {number} The dot product of the two vectors.
     */
    dotProduct: (vectorA, vectorB) => {
      return dotProduct(vectorA, vectorB, vectorA.length);
    }
  };
}

module.exports = {
  loadWasmModule,
  initializeWasmOps
};