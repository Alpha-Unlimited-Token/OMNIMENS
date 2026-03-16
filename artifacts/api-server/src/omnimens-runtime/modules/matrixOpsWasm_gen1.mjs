/**
 * @module matrixOpsWasm
 * @description Perform efficient matrix operations using WebAssembly in Node.js.
 * This module implements basic linear algebra routines such as dot product and matrix multiplication.
 */

// WebAssembly binary source for matrix operations
const wasmCode = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0d, 0x02, 0x60, 0x02, 0x7f, 0x7f,
  0x01, 0x7f, 0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x03, 0x02, 0x00, 0x01, 0x07,
  0x13, 0x02, 0x03, 0x64, 0x6f, 0x74, 0x00, 0x00, 0x06, 0x6d, 0x75, 0x6c, 0x74, 0x69, 0x70,
  0x6c, 0x79, 0x00, 0x01, 0x0a, 0x17, 0x02, 0x09, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6c, 0x0b,
  0x0e, 0x00, 0x20, 0x00, 0x20, 0x01, 0x20, 0x02, 0x6c, 0x20, 0x02, 0x6c, 0x0b
]);

/**
 * Initialize WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmModule = await WebAssembly.compile(wasmCode);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Compute the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
export async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  const wasmInstance = await initializeWasm();
  const dot = wasmInstance.exports.dot;

  let result = 0;
  for (let i = 0; i < vectorA.length; i++) {
    result += dot(vectorA[i], vectorB[i]);
  }

  return result;
}

/**
 * Perform matrix multiplication.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export async function matrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not allow multiplication.");
  }

  const wasmInstance = await initializeWasm();
  const multiply = wasmInstance.exports.multiply;

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += multiply(matrixA[i][k], matrixB[k][j]);
      }
    }
  }

  return result;
}

/**
 * Example usage.
 * Uncomment below to test the module.
 */
// (async () => {
//   const vectorA = [1, 2, 3];
//   const vectorB = [4, 5, 6];
//   console.log("Dot Product:", await dotProduct(vectorA, vectorB));

//   const matrixA = [
//     [1, 2],
//     [3, 4]
//   ];
//   const matrixB = [
//     [5, 6],
//     [7, 8]
//   ];
//   console.log("Matrix Multiplication:", await matrixMultiply(matrixA, matrixB));
// })();