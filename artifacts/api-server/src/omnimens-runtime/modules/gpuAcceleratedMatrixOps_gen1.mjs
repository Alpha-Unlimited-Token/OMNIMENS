// gpuAcceleratedMatrixOps.js

/**
 * @module gpuAcceleratedMatrixOps
 * @description High-performance matrix operations implemented using WebGPU for GPU acceleration.
 * This module enables matrix multiplication and vector operations leveraging GPU capabilities.
 */

/**
 * Initializes a WebGPU device and context.
 * @returns {Promise<{device: GPUDevice, context: GPUCanvasContext}>} - The GPU device and context.
 * @throws {Error} If WebGPU is not supported or fails to initialize.
 */
export async function initializeGPU() {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not supported on this platform.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get GPU adapter.");
  }

  const device = await adapter.requestDevice();
  return { device, context: null }; // Context can be used for rendering if needed.
}

/**
 * Creates a GPU buffer.
 * @param {GPUDevice} device - The GPU device.
 * @param {Float32Array} data - The data to store in the buffer.
 * @param {GPUBufferUsageFlags} usage - The intended usage of the buffer.
 * @returns {GPUBuffer} - The created GPU buffer.
 */
function createBuffer(device, data, usage) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  });

  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
}

/**
 * Performs matrix multiplication on the GPU.
 * @param {GPUDevice} device - The GPU device.
 * @param {Float32Array} matrixA - The first matrix (m x n).
 * @param {Float32Array} matrixB - The second matrix (n x p).
 * @param {number} m - Rows in matrix A.
 * @param {number} n - Columns in matrix A / Rows in matrix B.
 * @param {number} p - Columns in matrix B.
 * @returns {Promise<Float32Array>} - The resulting matrix (m x p).
 */
export async function gpuMatrixMultiply(device, matrixA, matrixB, m, n, p) {
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;

      if (row < ${m}u && col < ${p}u) {
        var sum : f32 = 0.0;
        for (var k : u32 = 0u; k < ${n}u; k++) {
          sum += matrixA[row * ${n}u + k] * matrixB[k * ${p}u + col];
        }
        result[row * ${p}u + col] = sum;
      }
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  const bufferA = createBuffer(device, matrixA, GPUBufferUsage.STORAGE);
  const bufferB = createBuffer(device, matrixB, GPUBufferUsage.STORAGE);
  const resultBuffer = device.createBuffer({
    size: Float32Array.BYTES_PER_ELEMENT * m * p,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } },
    ],
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(m / 8), Math.ceil(p / 8));
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  await device.queue.onSubmittedWorkDone();

  const resultBufferRead = device.createBuffer({
    size: resultBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, resultBufferRead, 0, resultBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await resultBufferRead.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(resultBufferRead.getMappedRange());
  resultBufferRead.unmap();

  return resultArray;
}

/**
 * Example usage of the gpuAcceleratedMatrixOps module.
 * @returns {Promise<void>} - Demonstrates matrix multiplication.
 */
export async function exampleUsage() {
  const { device } = await initializeGPU();

  const matrixA = new Float32Array([
    1, 2, 3,
    4, 5, 6,
  ]); // 2x3 matrix

  const matrixB = new Float32Array([
    7, 8,
    9, 10,
    11, 12,
  ]); // 3x2 matrix

  const result = await gpuMatrixMultiply(device, matrixA, matrixB, 2, 3, 2);
  console.log("Resulting Matrix:", result);
}

// Uncomment the following line to run the example usage.
// exampleUsage();