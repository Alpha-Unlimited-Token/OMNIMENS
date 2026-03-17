/**
 * @module webAssemblyMatrixOps
 * @description Perform efficient matrix operations and numerical computation using WebAssembly.
 */

const { readFile } = require('fs/promises');
const path = require('path');

/**
 * Loads a WebAssembly module from a file.
 * @async
 * @param {string} wasmFilePath - The relative file path to the WebAssembly binary.
 * @returns {Promise<WebAssembly.Instance>} The instantiated WebAssembly module.
 * @throws {Error} If the file cannot be read or the WebAssembly module fails to instantiate.
 */
async function loadWasmModule(wasmFilePath) {
  const absolutePath = path.resolve(__dirname, wasmFilePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @param {string} wasmFilePath - The relative file path to the WebAssembly binary.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied or WebAssembly fails.
 */
async function multiplyMatrices(matrixA, matrixB, wasmFilePath) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();
  const resultSize = rowsA * colsB;

  const memoryView = new Float64Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + flatMatrixA.length;
  const offsetResult = offsetB + flatMatrixB.length;

  memoryView.set(flatMatrixA, offsetA);
  memoryView.set(flatMatrixB, offsetB);

  multiply_matrices(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(
      Array.from(memoryView.slice(offsetResult + i * colsB, offsetResult + (i + 1) * colsB))
    );
  }

  return resultMatrix;
}

/**
 * Adds two matrices using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @param {string} wasmFilePath - The relative file path to the WebAssembly binary.
 * @returns {Promise<number[][]>} The resulting matrix after addition.
 * @throws {Error} If the matrices cannot be added or WebAssembly fails.
 */
async function addMatrices(matrixA, matrixB, wasmFilePath) {
  if (
    matrixA.length !== matrixB.length ||
    matrixA[0].length !== matrixB[0].length
  ) {
    throw new Error('Matrix dimensions are incompatible for addition.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, add_matrices } = wasmInstance.exports;

  const rows = matrixA.length;
  const cols = matrixA[0].length;
  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();

  const memoryView = new Float64Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + flatMatrixA.length;
  const offsetResult = offsetB + flatMatrixB.length;

  memoryView.set(flatMatrixA, offsetA);
  memoryView.set(flatMatrixB, offsetB);

  add_matrices(offsetA, offsetB, rows, cols, offsetResult);

  const resultMatrix = [];
  for (let i = 0; i < rows; i++) {
    resultMatrix.push(
      Array.from(memoryView.slice(offsetResult + i * cols, offsetResult + (i + 1) * cols))
    );
  }

  return resultMatrix;
}

module.exports = {
  loadWasmModule,
  multiplyMatrices,
  addMatrices
};