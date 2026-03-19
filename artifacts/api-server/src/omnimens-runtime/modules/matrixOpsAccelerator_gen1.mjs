// matrixOpsAccelerator.js

/**
 * @module matrixOpsAccelerator
 * @description Perform efficient matrix operations using WebAssembly in Node.js.
 * This module leverages WebAssembly for high-performance linear algebra computations.
 */

/**
 * Initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 */
async function initializeWasmModule() {
  const wasmCode = new Uint8Array([
    // WebAssembly binary for basic matrix operations (i32 add function)
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60,
    0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01,
    0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20,
    0x00, 0x20, 0x01, 0x6a, 0x0b
  ]);

  const wasmModule = await WebAssembly.compile(wasmCode);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Adds two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
async function addMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrices must have the same dimensions.");
  }

  const wasmInstance = await initializeWasmModule();
  const addFunction = wasmInstance.exports.add;

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsA; j++) {
      row.push(addFunction(matrixA[i][j], matrixB[i][j]));
    }
    result.push(row);
  }

  return result;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If matrices are not compatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (colsA !== rowsB) {
    throw new Error("Number of columns in matrix A must equal number of rows in matrix B.");
  }

  const wasmInstance = await initializeWasmModule();
  const multiplyFunction = wasmInstance.exports.multiply;

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += multiplyFunction(matrixA[i][k], matrixB[k][j]);
      }
      row.push(sum);
    }
    result.push(row);
  }

  return result;
}

export { addMatrices, multiplyMatrices };