/**
 * gpuAcceleratedMatrixOps Module
 * This module provides GPU-accelerated matrix operations using WebGPU for high-performance linear algebra computations.
 * It is designed to enhance OMNIMENS's neural computations and embeddings processing capabilities.
 */

/**
 * Initialize a WebGPU context.
 * @returns {Promise<GPUDevice>} A promise that resolves to the GPUDevice instance.
 * @throws {Error} If WebGPU is not supported or initialization fails.
 */
export async function initializeGPU() {
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
 * Perform a GPU-accelerated matrix multiplication.
 * @param {GPUDevice} device - The GPU device obtained from initializeGPU().
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float32Array>} A promise that resolves to the resulting matrix (flattened, row-major order).
 * @throws {Error} If the dimensions are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const resultSize = rowsA * colsB;
  const resultBuffer = new Float32Array(resultSize);

  // Create GPU buffers
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

  const bufferResult = device.createBuffer({
    size: resultBuffer.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Create a compute shader
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      let widthA = ${colsA};
      let widthB = ${colsB};

      var sum = 0.0;
      for (var i = 0u; i < widthA; i = i + 1u) {
        sum = sum + matrixA[row * widthA + i] * matrixB[i * widthB + col];
      }

      result[row * widthB + col] = sum;
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  // Create pipeline
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: bufferResult } },
    ],
  });

  // Encode commands
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();

  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(rowsA / 8), Math.ceil(colsB / 8));
  passEncoder.end();

  commandEncoder.copyBufferToBuffer(bufferResult, 0, bufferResult, 0, resultBuffer.byteLength);

  // Submit commands
  device.queue.submit([commandEncoder.finish()]);

  // Read back the result
  await bufferResult.mapAsync(GPUMapMode.READ);
  const arrayBuffer = bufferResult.getMappedRange();
  resultBuffer.set(new Float32Array(arrayBuffer));
  bufferResult.unmap();

  return resultBuffer;
}

/**
 * Example usage of the gpuAcceleratedMatrixOps module.
 * Demonstrates initialization and matrix multiplication.
 * @returns {Promise<void>} A promise that resolves when the example completes.
 */
export async function exampleUsage() {
  const device = await initializeGPU();

  const matrixA = new Float32Array([
    1, 2, 3,
    4, 5, 6,
  ]);
  const matrixB = new Float32Array([
    7, 8,
    9, 10,
    11, 12,
  ]);

  const rowsA = 2;
  const colsA = 3;
  const colsB = 2;

  const result = await gpuMatrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB);
  console.log('Result:', result);
}