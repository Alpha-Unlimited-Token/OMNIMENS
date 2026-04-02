/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T14:25:02.616Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixEngine.mjs

import { GPUBufferUsage, GPUShaderStage } from 'gpu-web';

export function createMatrixMultiplicationShader(device) {
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA: array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB: array<f32>;
    @group(0) @binding(2) var<storage, write> result: array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row = global_id.y;
      let col = global_id.x;
      let size = u32(sqrt(f32(matrixA.length)));

      var sum: f32 = 0.0;
      for (var k: u32 = 0; k < size; k++) {
        sum += matrixA[row * size + k] * matrixB[k * size + col];
      }

      result[row * size + col] = sum;
    }
  `;

  return device.createShaderModule({ code: shaderCode });
}

export async function gpuMatrixMultiply(device, matrixA, matrixB) {
  const size = Math.sqrt(matrixA.length);
  if (size * size !== matrixA.length || size * size !== matrixB.length) {
    throw new Error('Matrices must be square and of equal dimensions.');
  }

  const matrixBufferA = device.createBuffer({
    size: matrixA.length * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(matrixBufferA.getMappedRange()).set(matrixA);
  matrixBufferA.unmap();

  const matrixBufferB = device.createBuffer({
    size: matrixB.length * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(matrixBufferB.getMappedRange()).set(matrixB);
  matrixBufferB.unmap();

  const resultBuffer = device.createBuffer({
    size: matrixA.length * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: matrixBufferA } },
      { binding: 1, resource: { buffer: matrixBufferB } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  const pipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    compute: { module: createMatrixMultiplicationShader(device), entryPoint: 'main' }
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(size / 8, size / 8);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  const resultBufferRead = device.createBuffer({
    size: resultBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(resultBuffer, 0, resultBufferRead, 0, resultBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await resultBufferRead.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(resultBufferRead.getMappedRange());
  resultBufferRead.unmap();

  return Array.from(resultArray);
}

export async function gpuActivationFunction(device, inputArray, activationType) {
  const activationShaderCode = `
    @group(0) @binding(0) var<storage, read> input: array<f32>;
    @group(0) @binding(1) var<storage, write> output: array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let index = global_id.x;
      if (index < input.length) {
        output[index] = ${activationType === 'relu' ? 'max(input[index], 0.0)' : '1.0 / (1.0 + exp(-input[index]))'};
      }
    }
  `;

  const shaderModule = device.createShaderModule({ code: activationShaderCode });

  const inputBuffer = device.createBuffer({
    size: inputArray.length * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  new Float32Array(inputBuffer.getMappedRange()).set(inputArray);
  inputBuffer.unmap();

  const outputBuffer = device.createBuffer({
    size: inputArray.length * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: outputBuffer } }
    ]
  });

  const pipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(inputArray.length / 64));
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  const outputBufferRead = device.createBuffer({
    size: outputBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(outputBuffer, 0, outputBufferRead, 0, outputBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await outputBufferRead.mapAsync(GPUMapMode.READ);
  const outputArray = new Float32Array(outputBufferRead.getMappedRange());
  outputBufferRead.unmap();

  return Array.from(outputArray);
}