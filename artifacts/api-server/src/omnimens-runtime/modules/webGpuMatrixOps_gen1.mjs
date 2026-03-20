/**
 * @module webGpuMatrixOps
 * @description Perform efficient matrix operations using WebGPU for advanced numerical computations.
 * This module leverages WebGPU for parallelized matrix multiplication and linear algebra tasks.
 */

/**
 * Checks if WebGPU is available in the current environment.
 * @returns {boolean} - True if WebGPU is supported, otherwise false.
 */
export function isWebGpuSupported() {
  return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
}

/**
 * Initializes a WebGPU device and context.
 * @returns {Promise<{device: GPUDevice, adapter: GPUAdapter}>} - A promise resolving to the WebGPU device and adapter.
 * @throws {Error} - If WebGPU is not supported or initialization fails.
 */
export async function initializeWebGpu() {
  if (!isWebGpuSupported()) {
    throw new Error('WebGPU is not supported in this environment.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Failed to get GPU adapter.');
  }

  const device = await adapter.requestDevice();
  return { device, adapter };
}

/**
 * Creates a GPU buffer for a given array of data.
 * @param {GPUDevice} device - The WebGPU device.
 * @param {Float32Array} data - The data to store in the buffer.
 * @param {GPUBufferUsageFlags} usage - The usage flags for the buffer.
 * @returns {GPUBuffer} - The created GPU buffer.
 */
export function createBuffer(device, data, usage) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true
  });

  const arrayBuffer = buffer.getMappedRange();
  new Float32Array(arrayBuffer).set(data);
  buffer.unmap();

  return buffer;
}

/**
 * Performs matrix multiplication using WebGPU.
 * @param {GPUDevice} device - The WebGPU device.
 * @param {Float32Array} matrixA - The first matrix (in row-major order).
 * @param {Float32Array} matrixB - The second matrix (in row-major order).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (and rows in matrix B).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} - A promise resolving to the resulting matrix (in row-major order).
 */
export async function matrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB) {
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.y;
      let col = global_id.x;

      if (row >= ${rowsA}u || col >= ${colsB}u) {
        return;
      }

      var sum : f32 = 0.0;
      for (var i = 0u; i < ${colsA}u; i = i + 1u) {
        sum = sum + matrixA[row * ${colsA}u + i] * matrixB[i * ${colsB}u + col];
      }

      result[row * ${colsB}u + col] = sum;
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createComputePipeline({
    compute: {
      module: shaderModule,
      entryPoint: 'main'
    }
  });

  const bufferA = createBuffer(device, matrixA, GPUBufferUsage.STORAGE);
  const bufferB = createBuffer(device, matrixB, GPUBufferUsage.STORAGE);
  const resultBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT * rowsA * colsB,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(colsB / 16), Math.ceil(rowsA / 16));
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  await device.queue.onSubmittedWorkDone();

  const readBuffer = device.createBuffer({
    size: resultBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, resultBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuffer.getMappedRange();
  const resultArray = new Float32Array(arrayBuffer.slice(0));
  readBuffer.unmap();

  return resultArray;
}
