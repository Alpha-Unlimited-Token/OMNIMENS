/**
 * @module webGpuMatrixOps
 * @description Simulates GPU-like acceleration for large matrix operations in JavaScript using WebGPU APIs for parallelized computations.
 */

/**
 * Checks if WebGPU is supported in the environment.
 * @returns {boolean} True if WebGPU is supported, false otherwise.
 */
export function isWebGpuSupported() {
  return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
}

/**
 * Initializes a WebGPU device and context.
 * @returns {Promise<{device: GPUDevice, context: GPUCanvasContext}>} The WebGPU device and context.
 * @throws {Error} If WebGPU is not supported or initialization fails.
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
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgpu');

  return { device, context };
}

/**
 * Performs matrix multiplication on the GPU.
 * @param {Float32Array} matrixA - The first matrix in row-major order.
 * @param {Float32Array} matrixB - The second matrix in row-major order.
 * @param {number} rowsA - The number of rows in matrixA.
 * @param {number} colsA - The number of columns in matrixA.
 * @param {number} colsB - The number of columns in matrixB.
 * @returns {Promise<Float32Array>} The resulting matrix in row-major order.
 * @throws {Error} If matrix dimensions are incompatible or WebGPU execution fails.
 */
export async function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the multiplication requirements.');
  }

  const { device } = await initializeWebGpu();

  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let row = global_id.y;
      let col = global_id.x;
      let widthA = ${colsA}u;
      let widthB = ${colsB}u;

      if (row < ${rowsA}u && col < widthB) {
        var sum = 0.0;
        for (var k = 0u; k < widthA; k = k + 1u) {
          sum = sum + matrixA[row * widthA + k] * matrixB[k * widthB + col];
        }
        result[row * widthB + col] = sum;
      }
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });
  const pipeline = device.createComputePipeline({
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });

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

  const resultBuffer = device.createBuffer({
    size: rowsA * colsB * Float32Array.BYTES_PER_ELEMENT,
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
  passEncoder.dispatchWorkgroups(
    Math.ceil(colsB / 16),
    Math.ceil(rowsA / 16)
  );
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  const readBuffer = device.createBuffer({
    size: rowsA * colsB * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  commandEncoder.copyBufferToBuffer(
    resultBuffer,
    0,
    readBuffer,
    0,
    rowsA * colsB * Float32Array.BYTES_PER_ELEMENT
  );
  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(readBuffer.getMappedRange().slice());
  readBuffer.unmap();

  return resultArray;
}
