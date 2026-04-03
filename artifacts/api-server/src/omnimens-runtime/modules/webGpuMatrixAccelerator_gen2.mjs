/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixAccelerator
 * Written: 2026-04-03T02:22:30.764Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixAccelerator.mjs

import { randomUUID } from 'crypto';

// Utility to create a WebGPU-compatible buffer
export function createBuffer(device, data, usage) {
  const arrayBuffer = new Float32Array(data);
  const buffer = device.createBuffer({
    size: arrayBuffer.byteLength,
    usage,
    mappedAtCreation: true
  });
  const mappedBuffer = new Float32Array(buffer.getMappedRange());
  mappedBuffer.set(arrayBuffer);
  buffer.unmap();
  return buffer;
}

// Utility to compile a WebGPU shader
export async function compileShader(device, shaderCode) {
  return device.createShaderModule({
    code: shaderCode
  });
}

// Perform matrix multiplication using WebGPU
export async function gpuMatrixMultiply(device, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const resultMatrix = new Float32Array(rowsA * colsB);

  // WebGPU shader code for matrix multiplication
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> matrixA: array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB: array<f32>;
    @group(0) @binding(2) var<storage, write> resultMatrix: array<f32>;

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      let rowsA = ${rowsA}u;
      let colsA = ${colsA}u;
      let colsB = ${colsB}u;

      if (row < rowsA && col < colsB) {
        var sum: f32 = 0.0;
        for (var k: u32 = 0u; k < colsA; k = k + 1u) {
          sum = sum + matrixA[row * colsA + k] * matrixB[k * colsB + col];
        }
        resultMatrix[row * colsB + col] = sum;
      }
    }
  `;

  const shaderModule = await compileShader(device, shaderCode);

  // Create buffers for matrices
  const bufferA = createBuffer(device, matrixA, GPUBufferUsage.STORAGE);
  const bufferB = createBuffer(device, matrixB, GPUBufferUsage.STORAGE);
  const bufferResult = device.createBuffer({
    size: resultMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Create bind group layout and bind group
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
      { binding: 0, resource: { buffer: bufferA } },
      { binding: 1, resource: { buffer: bufferB } },
      { binding: 2, resource: { buffer: bufferResult } }
    ]
  });

  // Create compute pipeline
  const pipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  // Create command encoder and dispatch compute shader
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(rowsA / 16), Math.ceil(colsB / 16));
  passEncoder.end();

  // Copy result to a mapped buffer
  const readBuffer = device.createBuffer({
    size: resultMatrix.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });
  commandEncoder.copyBufferToBuffer(bufferResult, 0, readBuffer, 0, resultMatrix.byteLength);

  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const mappedResult = new Float32Array(readBuffer.getMappedRange());
  resultMatrix.set(mappedResult);
  readBuffer.unmap();

  return resultMatrix;
}

// Generate a random matrix of given dimensions
export function generateRandomMatrix(rows, cols) {
  const matrix = new Float32Array(rows * cols);
  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = Math.random();
  }
  return matrix;
}