/**
 * @module webGpuMatrixOps
 * @description This module provides GPU-accelerated matrix operations using the WebGPU API for efficient linear algebra computations.
 */

/**
 * Initialize a WebGPU device and context.
 * @returns {Promise<{device: GPUDevice, adapter: GPUAdapter}>} A promise resolving to the WebGPU device and adapter.
 * @throws {Error} If WebGPU is not supported or initialization fails.
 */
export async function initializeWebGPU() {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported on this platform.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Failed to get GPU adapter.');
  }

  const device = await adapter.requestDevice();
  return { device, adapter };
}

/**
 * Create a GPU buffer.
 * @param {GPUDevice} device - The WebGPU device.
 * @param {Float32Array} data - The data to store in the buffer.
 * @param {GPUBufferUsageFlags} usage - The usage flags for the buffer.
 * @returns {GPUBuffer} The created GPU buffer.
 */
export function createBuffer(device, data, usage) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true
  });

  const mappedBuffer = new Float32Array(buffer.getMappedRange());
  mappedBuffer.set(data);
  buffer.unmap();
  return buffer;
}

/**
 * Perform matrix multiplication on the GPU.
 * @param {GPUDevice} device - The WebGPU device.
 * @param {Float32Array} matrixA - The first matrix (MxN).
 * @param {Float32Array} matrixB - The second matrix (NxP).
 * @param {number} M - Number of rows in matrixA.
 * @param {number} N - Number of columns in matrixA and rows in matrixB.
 * @param {number} P - Number of columns in matrixB.
 * @returns {Promise<Float32Array>} The result matrix (MxP) as a Float32Array.
 */
export async function gpuMatrixMultiply(device, matrixA, matrixB, M, N, P) {
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;

      if (row < ${M}u && col < ${P}u) {
        var sum : f32 = 0.0;
        for (var k : u32 = 0u; k < ${N}u; k = k + 1u) {
          sum = sum + matrixA[row * ${N}u + k] * matrixB[k * ${P}u + col];
        }
        result[row * ${P}u + col] = sum;
      }
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  const bufferA = createBuffer(device, matrixA, GPUBufferUsage.STORAGE);
  const bufferB = createBuffer(device, matrixB, GPUBufferUsage.STORAGE);
  const resultBuffer = device.createBuffer({
    size: M * P * Float32Array.BYTES_PER_ELEMENT,
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
  passEncoder.dispatchWorkgroups(Math.ceil(M / 8), Math.ceil(P / 8));
  passEncoder.end();

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, resultBuffer, 0, M * P * Float32Array.BYTES_PER_ELEMENT);
  device.queue.submit([commandEncoder.finish()]);

  await device.queue.onSubmittedWorkDone();

  const resultArrayBuffer = await resultBuffer.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(resultArrayBuffer);
  resultBuffer.unmap();

  return resultArray;
}
