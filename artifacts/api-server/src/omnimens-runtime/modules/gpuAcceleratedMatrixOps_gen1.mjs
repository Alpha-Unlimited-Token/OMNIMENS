/**
 * gpuAcceleratedMatrixOps - A module for GPU-accelerated matrix operations
 * leveraging WebGPU for parallel computation in Node.js.
 * This module enables efficient matrix multiplication and other linear algebra
 * operations, designed to support deep learning tasks.
 */

/**
 * Check if WebGPU is supported in the environment.
 * @returns {boolean} - True if WebGPU is supported, false otherwise.
 */
export function isWebGPUSupported() {
  return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
}

/**
 * Initialize a WebGPU device and context.
 * @returns {Promise<{ device: GPUDevice, adapter: GPUAdapter }>} - The WebGPU device and adapter.
 * @throws {Error} - If WebGPU is not supported or initialization fails.
 */
export async function initializeWebGPU() {
  if (!isWebGPUSupported()) {
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
 * Perform GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - The first matrix (flattened array).
 * @param {Float32Array} matrixB - The second matrix (flattened array).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (must equal rowsB).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} - The resulting matrix (flattened array).
 * @throws {Error} - If matrices are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const { device } = await initializeWebGPU();

  // Create GPU buffers for input and output
  const bufferA = device.createBuffer({
    size: matrixA.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(bufferA.getMappedRange()).set(matrixA);
  bufferA.unmap();

  const bufferB = device.createBuffer({
    size: matrixB.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(bufferB.getMappedRange()).set(matrixB);
  bufferB.unmap();

  const resultBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT * rowsA * colsB,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Create a compute shader
  const shaderCode = `
    [[block]] struct Matrix {
      data: array<f32>;
    };

    [[group(0), binding(0)]] var<storage, read> matrixA: Matrix;
    [[group(0), binding(1)]] var<storage, read> matrixB: Matrix;
    [[group(0), binding(2)]] var<storage, write> result: Matrix;

    [[stage(compute), workgroup_size(8, 8)]]
    fn main([[builtin(global_invocation_id)]] global_id: vec3<u32>) {
      let row = global_id.y;
      let col = global_id.x;

      if (row >= ${rowsA}u || col >= ${colsB}u) {
        return;
      }

      var sum: f32 = 0.0;
      for (var i: u32 = 0u; i < ${colsA}u; i = i + 1u) {
        sum = sum + matrixA.data[row * ${colsA}u + i] * matrixB.data[i * ${colsB}u + col];
      }

      result.data[row * ${colsB}u + col] = sum;
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  // Bind group layout and bind group
  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  // Command encoder and compute pass
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(colsB / 8), Math.ceil(rowsA / 8));
  passEncoder.end();

  // Copy result to a mapped buffer
  const readBuffer = device.createBuffer({
    size: resultBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });
  commandEncoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, resultBuffer.size);

  // Submit commands
  device.queue.submit([commandEncoder.finish()]);

  // Read the result
  await readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuffer.getMappedRange();
  const result = new Float32Array(arrayBuffer.slice(0));
  readBuffer.unmap();

  return result;
}
