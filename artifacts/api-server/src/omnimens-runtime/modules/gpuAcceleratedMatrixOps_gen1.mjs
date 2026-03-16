/**
 * gpuAcceleratedMatrixOps.js
 * 
 * This module provides GPU-accelerated matrix operations using WebGPU for efficient AI computations.
 * It is designed to run in Node.js 20+ environments and leverages WebGPU APIs via experimental support.
 * The module includes functions for matrix multiplication and element-wise operations.
 */

/**
 * Checks if WebGPU is supported in the current environment.
 * @returns {boolean} - True if WebGPU is supported, false otherwise.
 */
export function isWebGPUSupported() {
  return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
}

/**
 * Initializes a GPU device and context for computation.
 * @returns {Promise<GPUDevice>} - Resolves with the GPU device instance.
 * @throws {Error} - If WebGPU is not supported.
 */
export async function initializeGPU() {
  if (!isWebGPUSupported()) {
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
 * Performs matrix multiplication on the GPU.
 * @param {GPUDevice} device - The GPU device instance.
 * @param {Float32Array} matrixA - The first matrix as a flat Float32Array.
 * @param {Float32Array} matrixB - The second matrix as a flat Float32Array.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} - Resolves with the resulting matrix as a flat Float32Array.
 * @throws {Error} - If dimensions are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error("Matrix dimensions do not match the provided sizes.");
  }

  const resultBufferSize = rowsA * colsB * Float32Array.BYTES_PER_ELEMENT;

  // Create GPU buffers
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
    size: resultBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Define compute shader
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;

      var sum : f32 = 0.0;
      for (var i = 0u; i < ${colsA}u; i = i + 1u) {
        sum = sum + matrixA[row * ${colsA}u + i] * matrixB[i * ${colsB}u + col];
      }

      result[row * ${colsB}u + col] = sum;
    }
  `;

  const shaderModule = device.createShaderModule({
    code: shaderCode
  });

  const pipeline = device.createComputePipeline({
    compute: {
      module: shaderModule,
      entryPoint: "main"
    }
  });

  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  // Execute compute pass
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(rowsA / 8), Math.ceil(colsB / 8));
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  // Read back results
  const readBuffer = device.createBuffer({
    size: resultBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, resultBufferSize);
  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuffer.getMappedRange();
  const resultArray = new Float32Array(arrayBuffer.slice());
  readBuffer.unmap();

  return resultArray;
}

/**
 * Example usage of the module.
 * Uncomment the following lines to test the module in a Node.js environment with WebGPU support.
 */
// (async () => {
//   const device = await initializeGPU();
//   const matrixA = new Float32Array([1, 2, 3, 4]); // 2x2 matrix
//   const matrixB = new Float32Array([5, 6, 7, 8]); // 2x2 matrix
//   const result = await gpuMatrixMultiply(device, matrixA, matrixB, 2, 2, 2);
//   console.log(result); // Output: Float32Array [19, 22, 43, 50]
// })();