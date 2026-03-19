/**
 * gpuMatrixOps - GPU-accelerated matrix operations using WebGPU via TensorFlow.js
 * This module provides utility functions for performing matrix operations on the GPU,
 * leveraging WebGPU for high-performance computation in Node.js.
 *
 * Note: This module assumes WebGPU is supported in the runtime environment.
 */

/**
 * Perform matrix multiplication using GPU acceleration.
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsB - Number of rows in matrixB.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float32Array>} - A promise resolving to the resulting matrix (flattened row-major order).
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(matrixA, rowsA, colsA, matrixB, rowsB, colsB) {
  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  // Initialize WebGPU context
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("WebGPU is not supported in this environment.");
  }

  const device = await adapter.requestDevice();

  // Create GPU buffers for input and output
  const bufferA = device.createBuffer({
    size: matrixA.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(bufferA.getMappedRange()).set(matrixA);
  bufferA.unmap();

  const bufferB = device.createBuffer({
    size: matrixB.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(bufferB.getMappedRange()).set(matrixB);
  bufferB.unmap();

  const resultSize = rowsA * colsB * Float32Array.BYTES_PER_ELEMENT;
  const resultBuffer = device.createBuffer({
    size: resultSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Define GPU shader for matrix multiplication
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;

      if (row < ${rowsA}u && col < ${colsB}u) {
        var sum : f32 = 0.0;
        for (var k : u32 = 0u; k < ${colsA}u; k = k + 1u) {
          sum = sum + matrixA[row * ${colsA}u + k] * matrixB[k * ${colsB}u + col];
        }
        result[row * ${colsB}u + col] = sum;
      }
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // Create pipeline and bind groups
  const pipeline = device.createComputePipeline({
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } },
    ],
  });

  // Execute the computation
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(rowsA / 8), Math.ceil(colsB / 8));
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  // Read back the result
  const readBuffer = device.createBuffer({
    size: resultSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, resultSize);
  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(readBuffer.getMappedRange());
  const result = new Float32Array(resultArray);
  readBuffer.unmap();

  return result;
}

/**
 * Utility function to create a matrix as a Float32Array.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {Function} fillFn - Function to generate values (row, col) => value.
 * @returns {Float32Array} - The generated matrix (flattened row-major order).
 */
export function createMatrix(rows, cols, fillFn) {
  const matrix = new Float32Array(rows * cols);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      matrix[row * cols + col] = fillFn(row, col);
    }
  }
  return matrix;
}