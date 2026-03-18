/**
 * @module wasmMatrixOps
 * @description Perform lightweight matrix operations and parallel computations using WebAssembly.
 * This module compiles a simple WebAssembly module for matrix multiplication and exposes it to Node.js.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Compiles and initializes a WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using the WebAssembly module.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const offsetA = 0;
  const offsetB = flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetResult = offsetB + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(flatA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  memoryView.set(flatB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  multiply(offsetA, offsetB, offsetResult, rowsA, colsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    result.set(
      memoryView.slice(
        offsetResult / Float64Array.BYTES_PER_ELEMENT + i * colsB,
        offsetResult / Float64Array.BYTES_PER_ELEMENT + (i + 1) * colsB
      ),
      i * colsB
    );
  }

  return Array.from({ length: rowsA }, (_, i) => result.slice(i * colsB, (i + 1) * colsB));
}

module.exports = {
  initializeWasm,
  multiplyMatrices
};