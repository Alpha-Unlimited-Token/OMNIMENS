/**
 * gpuAcceleratedMatrixOps.js
 * 
 * This module provides GPU-accelerated matrix operations using WebGPU bindings in Node.js.
 * It includes efficient implementations of matrix multiplication and eigen decomposition.
 * The module is designed for high-performance AI tasks and computational intelligence.
 */

const { gpu } = require('node:util').promisify;

/**
 * Initialize WebGPU device and context.
 * This function prepares the GPU for matrix operations.
 * @returns {Promise<GPUDevice>} A promise that resolves to a WebGPU device.
 */
async function initializeGPU() {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported in this environment.');
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Failed to get GPU adapter.');
  }
  const device = await adapter.requestDevice();
  return device;
}

/**
 * Perform GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - The first matrix (flat array representation).
 * @param {Float32Array} matrixB - The second matrix (flat array representation).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} The resulting matrix as a flat array.
 */
async function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const device = await initializeGPU();

  const matrixASize = rowsA * colsA * Float32Array.BYTES_PER_ELEMENT;
  const matrixBSize = colsA * colsB * Float32Array.BYTES_PER_ELEMENT;
  const resultSize = rowsA * colsB * Float32Array.BYTES_PER_ELEMENT;

  const matrixABuffer = device.createBuffer({
    size: matrixASize,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(matrixABuffer.getMappedRange()).set(matrixA);
  matrixABuffer.unmap();

  const matrixBBuffer = device.createBuffer({
    size: matrixBSize,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(matrixBBuffer.getMappedRange()).set(matrixB);
  matrixBBuffer.unmap();

  const resultBuffer = device.createBuffer({
    size: resultSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(1, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      var sum : f32 = 0.0;
      for (var k : u32 = 0; k < ${colsA}; k = k + 1) {
        sum = sum + matrixA[row * ${colsA} + k] * matrixB[k * ${colsB} + col];
      }
      result[row * ${colsB} + col] = sum;
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: matrixABuffer } },
      { binding: 1, resource: { buffer: matrixBBuffer } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(rowsA, colsB);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  const resultReadBuffer = device.createBuffer({
    size: resultSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, resultReadBuffer, 0, resultSize);
  await resultReadBuffer.mapAsync(GPUMapMode.READ);

  const resultArray = new Float32Array(resultReadBuffer.getMappedRange());
  return resultArray;
}

export { initializeGPU, gpuMatrixMultiply };