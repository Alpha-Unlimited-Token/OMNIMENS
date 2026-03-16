/**
 * gpuAcceleratedMatrixOps.js
 * 
 * This module provides GPU-accelerated matrix operations using WebGPU via the GPU API in modern browsers or Node.js environments.
 * It performs matrix multiplications and other tensor computations efficiently using GPU resources.
 * 
 * @module gpuAcceleratedMatrixOps
 */

/**
 * Checks if the environment supports WebGPU and initializes the GPU device.
 * 
 * @returns {Promise<GPUDevice>} A promise that resolves to a GPU device if available.
 * @throws {Error} If WebGPU is not supported in the environment.
 */
export async function initializeGPU() {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not supported in this environment.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get GPU adapter.");
  }

  const device = await adapter.requestDevice();
  return device;
}

/**
 * Creates a GPU buffer to store data on the GPU.
 * 
 * @param {GPUDevice} device - The GPU device.
 * @param {Float32Array} data - The data to store in the buffer.
 * @param {GPUBufferUsage} usage - The usage flag for the buffer (e.g., GPUBufferUsage.STORAGE).
 * @returns {GPUBuffer} The created GPU buffer.
 */
export function createGPUBuffer(device, data, usage) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true
  });

  const writeArray = new Float32Array(buffer.getMappedRange());
  writeArray.set(data);
  buffer.unmap();

  return buffer;
}

/**
 * Performs matrix multiplication on the GPU.
 * 
 * @param {GPUDevice} device - The GPU device.
 * @param {Float32Array} matrixA - The first matrix (flattened).
 * @param {Float32Array} matrixB - The second matrix (flattened).
 * @param {number} rowsA - The number of rows in matrix A.
 * @param {number} colsA - The number of columns in matrix A (and rows in matrix B).
 * @param {number} colsB - The number of columns in matrix B.
 * @returns {Promise<Float32Array>} A promise that resolves to the resulting matrix (flattened).
 */
export async function gpuMatrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error("Matrix dimensions do not match the provided sizes.");
  }

  // Define shader code for matrix multiplication
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.y;
      let col = global_id.x;

      if (row >= ${rowsA}u || col >= ${colsB}u) {
        return;
      }

      var sum : f32 = 0.0;
      for (var k = 0u; k < ${colsA}u; k = k + 1u) {
        sum = sum + matrixA[row * ${colsA}u + k] * matrixB[k * ${colsB}u + col];
      }

      result[row * ${colsB}u + col] = sum;
    }
  `;

  // Create shader module
  const shaderModule = device.createShaderModule({ code: shaderCode });

  // Create buffers
  const bufferA = createGPUBuffer(device, matrixA, GPUBufferUsage.STORAGE);
  const bufferB = createGPUBuffer(device, matrixB, GPUBufferUsage.STORAGE);
  const resultBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT * rowsA * colsB,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Create pipeline
  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shaderModule,
      entryPoint: "main"
    }
  });

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  // Create command encoder and dispatch compute pass
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(
    Math.ceil(colsB / 8),
    Math.ceil(rowsA / 8)
  );
  passEncoder.end();

  // Submit commands
  device.queue.submit([commandEncoder.finish()]);

  // Read back result
  const readBuffer = device.createBuffer({
    size: resultBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(
    resultBuffer,
    0,
    readBuffer,
    0,
    resultBuffer.size
  );

  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(readBuffer.getMappedRange());
  const result = new Float32Array(resultArray);
  readBuffer.unmap();

  return result;
}
