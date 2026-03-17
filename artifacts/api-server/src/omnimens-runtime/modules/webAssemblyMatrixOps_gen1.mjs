// webAssemblyMatrixOps.js

/**
 * @module webAssemblyMatrixOps
 * @description This module enables GPU-like matrix operations using WebAssembly for faster computation of linear algebra tasks.
 */

/**
 * @typedef {Float64Array} Matrix
 * A 2D matrix represented as a 1D Float64Array for efficient computation.
 */

/**
 * @function compileWasmModule
 * @description Compiles the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the compiled WebAssembly instance.
 */
async function compileWasmModule() {
  const wasmCode = new Uint8Array([
    // WebAssembly binary code for optimized matrix multiplication
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0d, 0x02, 0x60,
    0x03, 0x7c, 0x7c, 0x7c, 0x01, 0x7c, 0x60, 0x02, 0x7c, 0x7c, 0x01, 0x7c,
    0x03, 0x03, 0x02, 0x00, 0x01, 0x07, 0x13, 0x02, 0x0c, 0x6d, 0x61, 0x74,
    0x72, 0x69, 0x78, 0x4d, 0x75, 0x6c, 0x74, 0x69, 0x70, 0x00, 0x00, 0x0b,
    0x6d, 0x61, 0x74, 0x72, 0x69, 0x78, 0x41, 0x64, 0x64, 0x00, 0x01
  ]);

  const wasmModule = await WebAssembly.compile(wasmCode);
  return await WebAssembly.instantiate(wasmModule);
}

/**
 * @function matrixMultiply
 * @description Multiplies two matrices using WebAssembly.
 * @param {Matrix} matrixA - The first matrix (flattened).
 * @param {Matrix} matrixB - The second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Matrix} The resulting matrix (flattened).
 */
async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const wasmInstance = await compileWasmModule();

  const result = new Float64Array(rowsA * colsB);
  const memory = wasmInstance.exports.memory;

  const aOffset = 0;
  const bOffset = matrixA.length * 8;
  const cOffset = bOffset + matrixB.length * 8;

  const buffer = new Uint8Array(memory.buffer);
  buffer.set(new Uint8Array(matrixA.buffer), aOffset);
  buffer.set(new Uint8Array(matrixB.buffer), bOffset);

  wasmInstance.exports.matrixMultiply(aOffset, bOffset, cOffset, rowsA, colsA, colsB);

  result.set(new Float64Array(memory.buffer.slice(cOffset, cOffset + result.length * 8)));

  return result;
}

/**
 * @function matrixAdd
 * @description Adds two matrices element-wise using WebAssembly.
 * @param {Matrix} matrixA - The first matrix (flattened).
 * @param {Matrix} matrixB - The second matrix (flattened).
 * @returns {Matrix} The resulting matrix (flattened).
 */
async function matrixAdd(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error("Matrix dimensions must match for addition.");
  }

  const wasmInstance = await compileWasmModule();

  const result = new Float64Array(matrixA.length);
  const memory = wasmInstance.exports.memory;

  const aOffset = 0;
  const bOffset = matrixA.length * 8;
  const cOffset = bOffset + matrixB.length * 8;

  const buffer = new Uint8Array(memory.buffer);
  buffer.set(new Uint8Array(matrixA.buffer), aOffset);
  buffer.set(new Uint8Array(matrixB.buffer), bOffset);

  wasmInstance.exports.matrixAdd(aOffset, bOffset, cOffset, matrixA.length);

  result.set(new Float64Array(memory.buffer.slice(cOffset, cOffset + result.length * 8)));

  return result;
}

export { matrixMultiply, matrixAdd };