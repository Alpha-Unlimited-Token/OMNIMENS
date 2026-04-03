// © 2024-2026 Alpha Unlimited Technologies, LLC — All Rights Reserved
// OMNIMENS™ unified-compute — D004 Full Consolidation
// Merged from: omnimens-gpu-bridge.ts

import { type Browser, type Page } from "puppeteer-core";

// ═══════════════════════════════════════════════════════════════
// SOURCE: omnimens-gpu-bridge.ts
// ═══════════════════════════════════════════════════════════════

/**
 * OMNIMENS GPU Compute Bridge
 * 
 * Runs a headless Chromium browser as a persistent GPU compute sandbox.
 * The browser page stays open at ALL times as a dedicated compute worker.
 * OMNIMENS submits compute jobs (matrix ops, WASM compilation, shader programs,
 * batch neural operations) to the browser sandbox. The browser's V8 JIT,
 * WebGL pipeline, and WASM runtime process everything in parallel with Node.js.
 * Results are sent back after processing — by that time the CPU can handle them.
 * 
 * On this server: software-rendered WebGL via SwiftShader (CPU).
 * On a GPU server: full hardware-accelerated WebGL/WebGPU.
 * The architecture is the same — only the speed changes.
 * 
 * © 2024-2026 Alpha Unlimited Technologies, LLC — All Rights Reserved
 * OMNIMENS™ is proprietary technology of Alpha Unlimited Technologies, LLC.
 */


const CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

let browser: Browser | null = null;
let computePage: Page | null = null;
let gpuBridgeReady = false;
let gpuCapabilities: Record<string, unknown> = {};
let totalComputeOps = 0;
let totalComputeTimeMs = 0;
let bridgeStartTime = 0;
let lastHealthCheck = 0;
let consecutiveFailures = 0;
let totalJobsProcessed = 0;
let totalBatchesProcessed = 0;
let wasmModulesLoaded = 0;
let peakConcurrentJobs = 0;
let currentConcurrentJobs = 0;
const MAX_FAILURES_BEFORE_RESTART = 5;

const GPU_COMPUTE_HTML = `<!DOCTYPE html>
<html><head><title>OMNIMENS GPU Compute Sandbox</title></head>
<body>
<canvas id="gpu-canvas" width="2048" height="2048"></canvas>
<script>
const canvas = document.getElementById('gpu-canvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

window.GPU_INFO = {
  available: !!gl,
  version: gl ? gl.getParameter(gl.VERSION) : null,
  renderer: gl ? gl.getParameter(gl.RENDERER) : null,
  vendor: gl ? gl.getParameter(gl.VENDOR) : null,
  shadingLanguage: gl ? gl.getParameter(gl.SHADING_LANGUAGE_VERSION) : null,
  maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
  maxViewportDims: gl ? gl.getParameter(gl.MAX_VIEWPORT_DIMS) : [0, 0],
  maxRenderbufferSize: gl ? gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) : 0,
  maxVertexAttribs: gl ? gl.getParameter(gl.MAX_VERTEX_ATTRIBS) : 0,
  maxVaryingVectors: gl ? gl.getParameter(gl.MAX_VARYING_VECTORS) : 0,
  maxFragmentUniforms: gl ? gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) : 0,
  maxVertexUniforms: gl ? gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) : 0,
  maxTextureUnits: gl ? gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) : 0,
  extensions: gl ? gl.getSupportedExtensions() : [],
  floatTextureSupport: gl ? !!(gl.getExtension('OES_texture_float') || gl.getExtension('OES_texture_float_linear')) : false,
};

// ═══ WASM MODULE REGISTRY ═══
// Compiled WASM modules live here — persistent across all compute calls
window._wasmModules = {};
window._wasmInstances = {};
window._compiledShaders = {};
window._computeStats = { jobs: 0, batchOps: 0, wasmCalls: 0, shaderRuns: 0, errors: 0, totalTimeMs: 0 };

// ═══ WASM COMPILATION AND EXECUTION ═══
window.compileWasm = async function(wasmBytesArray, moduleName) {
  try {
    const bytes = new Uint8Array(wasmBytesArray);
    const module = await WebAssembly.compile(bytes);
    const instance = await WebAssembly.instantiate(module, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 4096 }),
        abort: () => {},
        log_f64: (v) => console.log('WASM:', v),
        log_i32: (v) => console.log('WASM:', v),
        Math_sqrt: Math.sqrt,
        Math_exp: Math.exp,
        Math_log: Math.log,
        Math_pow: Math.pow,
        Math_abs: Math.abs,
        Math_floor: Math.floor,
        Math_ceil: Math.ceil,
        Math_sin: Math.sin,
        Math_cos: Math.cos,
        Math_tan: Math.tan,
        Math_random: Math.random,
      },
      js: { mem: new WebAssembly.Memory({ initial: 256, maximum: 4096 }) }
    });
    window._wasmModules[moduleName] = module;
    window._wasmInstances[moduleName] = instance;
    const exports = Object.keys(instance.exports);
    return { success: true, moduleName, exports, memoryPages: 256 };
  } catch(e) {
    window._computeStats.errors++;
    return { success: false, error: e.message, moduleName };
  }
};

window.callWasm = function(moduleName, funcName, args) {
  const instance = window._wasmInstances[moduleName];
  if (!instance) return { error: 'Module not found: ' + moduleName };
  const fn = instance.exports[funcName];
  if (!fn) return { error: 'Function not found: ' + funcName + ' in ' + moduleName };
  try {
    const start = performance.now();
    const result = fn(...args);
    window._computeStats.wasmCalls++;
    return { result, timeMs: performance.now() - start, module: moduleName, func: funcName };
  } catch(e) {
    window._computeStats.errors++;
    return { error: e.message };
  }
};

// ═══ SHADER COMPILATION CACHE ═══
window.compileShaderProgram = function(vertexSrc, fragmentSrc, programName) {
  if (!gl) return { error: 'WebGL not available' };
  try {
    function compile(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('Shader compile: ' + err);
      }
      return s;
    }
    const vs = compile(vertexSrc, gl.VERTEX_SHADER);
    const fs = compile(fragmentSrc, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Link: ' + gl.getProgramInfoLog(prog));
    }
    window._compiledShaders[programName] = { program: prog, vs, fs };
    window._computeStats.shaderRuns++;
    return { success: true, programName };
  } catch(e) {
    window._computeStats.errors++;
    return { error: e.message };
  }
};

// ═══ BATCH JOB PROCESSOR ═══
// Process multiple compute operations in a single roundtrip
window.processBatch = function(jobs) {
  const results = [];
  const batchStart = performance.now();
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const start = performance.now();
    let result;
    try {
      switch(job.op) {
        case 'matmul':
          result = window.gpuMatrixMultiply(job.A, job.B, job.rowsA, job.colsA, job.colsB);
          break;
        case 'dot':
          result = window.gpuVectorDot(job.a, job.b);
          break;
        case 'add':
          result = window.gpuVectorAdd(job.a, job.b);
          break;
        case 'scale':
          result = window.gpuVectorScale(job.a, job.scalar);
          break;
        case 'softmax':
          result = window.gpuSoftmax(job.values);
          break;
        case 'relu':
          result = window.gpuReLU(job.values);
          break;
        case 'sigmoid':
          result = window.gpuSigmoid(job.values);
          break;
        case 'tanh':
          result = window.gpuTanh(job.values);
          break;
        case 'normalize':
          result = window.gpuNormalize(job.values);
          break;
        case 'batchnorm':
          result = window.gpuBatchNorm(job.values, job.gamma, job.beta);
          break;
        case 'transpose':
          result = window.gpuTranspose(job.matrix, job.rows, job.cols);
          break;
        case 'convolve1d':
          result = window.gpuConvolve1D(job.signal, job.kernel);
          break;
        case 'layernorm':
          result = window.gpuLayerNorm(job.values, job.gamma, job.beta);
          break;
        case 'attention':
          result = window.gpuAttentionScore(job.Q, job.K, job.V, job.dim);
          break;
        case 'gelu':
          result = window.gpuGELU(job.values);
          break;
        case 'embedding_lookup':
          result = window.gpuEmbeddingLookup(job.embeddings, job.indices, job.dim);
          break;
        case 'wasm_call':
          result = window.callWasm(job.module, job.func, job.args);
          break;
        case 'eval':
          result = eval(job.code);
          break;
        default:
          result = { error: 'Unknown op: ' + job.op };
      }
    } catch(e) {
      result = { error: e.message };
      window._computeStats.errors++;
    }
    results.push({ jobIndex: i, op: job.op, result, timeMs: performance.now() - start });
  }
  window._computeStats.batchOps += jobs.length;
  window._computeStats.jobs++;
  return { results, totalTimeMs: performance.now() - batchStart, jobCount: jobs.length };
};

// ═══ MATRIX OPERATIONS ═══
window.gpuMatrixMultiply = function(A, B, rowsA, colsA, colsB) {
  if (gl) {
    try {
      return gpuMatMulWebGL(A, B, rowsA, colsA, colsB);
    } catch(e) {
      // fall through to CPU
    }
  }
  return cpuMatrixMultiply(A, B, rowsA, colsA, colsB);
};

function gpuMatMulWebGL(A, B, rowsA, colsA, colsB) {
  const start = performance.now();
  const size = Math.max(rowsA, colsA, colsB);
  const texSize = Math.ceil(Math.sqrt(size * size));

  canvas.width = texSize;
  canvas.height = texSize;
  gl.viewport(0, 0, texSize, texSize);

  const vsSource = \`
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = (a_position + 1.0) / 2.0;
    }
  \`;

  const fsSource = \`
    precision highp float;
    uniform sampler2D u_matA;
    uniform sampler2D u_matB;
    uniform float u_colsA;
    uniform float u_size;
    varying vec2 v_texCoord;
    void main() {
      float row = floor(v_texCoord.y * u_size);
      float col = floor(v_texCoord.x * u_size);
      float sum = 0.0;
      for (float k = 0.0; k < 2048.0; k++) {
        if (k >= u_colsA) break;
        float a = texture2D(u_matA, vec2((k + 0.5) / u_size, (row + 0.5) / u_size)).r;
        float b = texture2D(u_matB, vec2((col + 0.5) / u_size, (k + 0.5) / u_size)).r;
        sum += a * b;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  \`;

  function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + err);
    }
    return shader;
  }

  const ext = gl.getExtension('OES_texture_float');
  if (!ext) {
    const r = cpuMatrixMultiply(A, B, rowsA, colsA, colsB);
    r.fallback = 'cpu_no_float_texture';
    return r;
  }

  const vs = compileShader(vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
  }

  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  function createDataTexture(data, width, height) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const paddedData = new Float32Array(width * height * 4);
    for (let i = 0; i < data.length; i++) {
      paddedData[i * 4] = data[i];
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, paddedData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  const texA = createDataTexture(A, texSize, texSize);
  const texB = createDataTexture(B, texSize, texSize);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texA);
  gl.uniform1i(gl.getUniformLocation(program, 'u_matA'), 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texB);
  gl.uniform1i(gl.getUniformLocation(program, 'u_matB'), 1);
  gl.uniform1f(gl.getUniformLocation(program, 'u_colsA'), colsA);
  gl.uniform1f(gl.getUniformLocation(program, 'u_size'), texSize);

  const fb = gl.createFramebuffer();
  const outTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outTex, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const pixels = new Float32Array(texSize * texSize * 4);
  gl.readPixels(0, 0, texSize, texSize, gl.RGBA, gl.FLOAT, pixels);

  const result = new Array(rowsA * colsB);
  for (let r = 0; r < rowsA; r++) {
    for (let c = 0; c < colsB; c++) {
      result[r * colsB + c] = pixels[(r * texSize + c) * 4];
    }
  }

  gl.deleteTexture(texA);
  gl.deleteTexture(texB);
  gl.deleteTexture(outTex);
  gl.deleteFramebuffer(fb);
  gl.deleteProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  gl.deleteBuffer(posBuffer);

  return { result, rows: rowsA, cols: colsB, timeMs: performance.now() - start, method: 'webgl', texSize };
}

function cpuMatrixMultiply(A, B, rowsA, colsA, colsB) {
  const start = performance.now();
  const result = new Array(rowsA * colsB).fill(0);
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i * colsA + k] * B[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }
  return { result, rows: rowsA, cols: colsB, timeMs: performance.now() - start, method: 'cpu' };
}

// ═══ VECTOR / ACTIVATION OPERATIONS ═══
window.gpuVectorDot = function(a, b) {
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return { result: sum, timeMs: performance.now() - start, length: a.length };
};

window.gpuVectorAdd = function(a, b) {
  const start = performance.now();
  const result = new Array(a.length);
  for (let i = 0; i < a.length; i++) result[i] = a[i] + b[i];
  return { result, timeMs: performance.now() - start, length: a.length };
};

window.gpuVectorScale = function(a, scalar) {
  const start = performance.now();
  const result = new Array(a.length);
  for (let i = 0; i < a.length; i++) result[i] = a[i] * scalar;
  return { result, timeMs: performance.now() - start, length: a.length };
};

window.gpuSoftmax = function(logits) {
  const start = performance.now();
  const max = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const result = exps.map(x => x / sum);
  return { result, timeMs: performance.now() - start, length: logits.length };
};

window.gpuReLU = function(values) {
  const start = performance.now();
  const result = values.map(x => Math.max(0, x));
  return { result, timeMs: performance.now() - start, length: values.length };
};

window.gpuSigmoid = function(values) {
  const start = performance.now();
  const result = values.map(x => 1 / (1 + Math.exp(-x)));
  return { result, timeMs: performance.now() - start, length: values.length };
};

window.gpuTanh = function(values) {
  const start = performance.now();
  const result = values.map(x => Math.tanh(x));
  return { result, timeMs: performance.now() - start, length: values.length };
};

window.gpuGELU = function(values) {
  const start = performance.now();
  const sqrt2pi = Math.sqrt(2 / Math.PI);
  const result = values.map(x => {
    return 0.5 * x * (1 + Math.tanh(sqrt2pi * (x + 0.044715 * x * x * x)));
  });
  return { result, timeMs: performance.now() - start, length: values.length };
};

window.gpuTranspose = function(matrix, rows, cols) {
  const start = performance.now();
  const result = new Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = matrix[i * cols + j];
    }
  }
  return { result, rows: cols, cols: rows, timeMs: performance.now() - start };
};

window.gpuConvolve1D = function(signal, kernel) {
  const start = performance.now();
  const resultLen = signal.length + kernel.length - 1;
  const result = new Array(resultLen).fill(0);
  for (let i = 0; i < signal.length; i++) {
    for (let j = 0; j < kernel.length; j++) {
      result[i + j] += signal[i] * kernel[j];
    }
  }
  return { result, timeMs: performance.now() - start, length: resultLen };
};

window.gpuNormalize = function(values) {
  const start = performance.now();
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance + 1e-8);
  const result = values.map(x => (x - mean) / std);
  return { result, timeMs: performance.now() - start, length: values.length, mean, std };
};

window.gpuBatchNorm = function(values, gamma, beta) {
  const start = performance.now();
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance + 1e-8);
  const result = values.map((x, i) => {
    const normalized = (x - mean) / std;
    const g = gamma ? (gamma[i] || 1) : 1;
    const b2 = beta ? (beta[i] || 0) : 0;
    return normalized * g + b2;
  });
  return { result, timeMs: performance.now() - start, length: values.length, mean, std };
};

window.gpuLayerNorm = function(values, gamma, beta) {
  const start = performance.now();
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance + 1e-5);
  const result = values.map((x, i) => {
    const norm = (x - mean) / std;
    const g = gamma ? (gamma[i] !== undefined ? gamma[i] : 1) : 1;
    const b2 = beta ? (beta[i] !== undefined ? beta[i] : 0) : 0;
    return norm * g + b2;
  });
  return { result, timeMs: performance.now() - start, length: values.length, mean, std };
};

// ═══ ATTENTION MECHANISM ═══
window.gpuAttentionScore = function(Q, K, V, dim) {
  const start = performance.now();
  const seqLen = Q.length / dim;
  const scale = 1 / Math.sqrt(dim);

  // QK^T / sqrt(d)
  const scores = new Array(seqLen * seqLen).fill(0);
  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < seqLen; j++) {
      let dot = 0;
      for (let k = 0; k < dim; k++) {
        dot += Q[i * dim + k] * K[j * dim + k];
      }
      scores[i * seqLen + j] = dot * scale;
    }
  }

  // Softmax per row
  for (let i = 0; i < seqLen; i++) {
    let max = -Infinity;
    for (let j = 0; j < seqLen; j++) max = Math.max(max, scores[i * seqLen + j]);
    let sum = 0;
    for (let j = 0; j < seqLen; j++) {
      scores[i * seqLen + j] = Math.exp(scores[i * seqLen + j] - max);
      sum += scores[i * seqLen + j];
    }
    for (let j = 0; j < seqLen; j++) scores[i * seqLen + j] /= sum;
  }

  // scores * V
  const output = new Array(seqLen * dim).fill(0);
  for (let i = 0; i < seqLen; i++) {
    for (let k = 0; k < dim; k++) {
      let sum = 0;
      for (let j = 0; j < seqLen; j++) {
        sum += scores[i * seqLen + j] * V[j * dim + k];
      }
      output[i * dim + k] = sum;
    }
  }

  return { result: output, scores, seqLen, dim, timeMs: performance.now() - start };
};

// ═══ EMBEDDING LOOKUP ═══
window.gpuEmbeddingLookup = function(embeddings, indices, dim) {
  const start = performance.now();
  const result = new Array(indices.length * dim);
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    for (let d = 0; d < dim; d++) {
      result[i * dim + d] = embeddings[idx * dim + d];
    }
  }
  return { result, timeMs: performance.now() - start, batchSize: indices.length, dim };
};

// ═══ DYNAMIC CODE EXECUTION ═══
window.executeComputeCode = function(code) {
  const start = performance.now();
  try {
    const fn = new Function('gl', 'canvas', 'GPU_INFO', code);
    const result = fn(gl, canvas, window.GPU_INFO);
    return { result, timeMs: performance.now() - start, method: 'sandbox_eval' };
  } catch(e) {
    window._computeStats.errors++;
    return { error: e.message, timeMs: performance.now() - start };
  }
};

window.gpuHealthCheck = function() {
  return {
    webgl: !!gl,
    version: gl ? gl.getParameter(gl.VERSION) : null,
    renderer: gl ? gl.getParameter(gl.RENDERER) : null,
    contextLost: gl ? gl.isContextLost() : true,
    wasmModules: Object.keys(window._wasmModules).length,
    compiledShaders: Object.keys(window._compiledShaders).length,
    stats: window._computeStats,
    timestamp: Date.now()
  };
};

console.log('OMNIMENS GPU Compute Sandbox initialized');
console.log('WebGL:', window.GPU_INFO.available ? 'AVAILABLE (' + window.GPU_INFO.renderer + ')' : 'NOT AVAILABLE — CPU fallback active');
console.log('Float textures:', window.GPU_INFO.floatTextureSupport);
console.log('Max texture size:', window.GPU_INFO.maxTextureSize);
console.log('Sandbox ready for: matmul, softmax, relu, sigmoid, tanh, gelu, attention, layernorm, batchnorm, convolve1d, transpose, embedding, wasm, eval');
</script>
</body></html>`;

export async function startGpuBridge(): Promise<void> {
  if (gpuBridgeReady && browser && computePage) {
    console.log("[GPU BRIDGE] Already running — skipping start");
    return;
  }

  try {
    console.log("[GPU BRIDGE] ═══════════════════════════════════════════════════════");
    console.log("[GPU BRIDGE] LAUNCHING PERSISTENT COMPUTE SANDBOX");
    console.log("[GPU BRIDGE] Chromium path: " + CHROMIUM_PATH);

    browser = await puppeteer.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu-sandbox",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--use-gl=swiftshader",
        "--enable-unsafe-swiftshader",
        "--enable-features=Vulkan,UseSkiaRenderer",
        "--disable-vulkan-fallback-to-gl-for-testing",
        "--disable-extensions",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
        "--js-flags=--max-old-space-size=512 --expose-gc",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    computePage = await browser.newPage();

    computePage.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("error") || text.includes("Error")) {
        console.log(`[GPU SANDBOX] ${text}`);
      }
    });

    computePage.on("pageerror", (err) => {
      console.error(`[GPU SANDBOX ERROR] ${err.message}`);
    });

    await computePage.setContent(GPU_COMPUTE_HTML, { waitUntil: "load" });

    gpuCapabilities = await computePage.evaluate(() => (window as any).GPU_INFO) as Record<string, unknown>;

    bridgeStartTime = Date.now();
    gpuBridgeReady = true;
    consecutiveFailures = 0;

    const webglAvailable = gpuCapabilities.available;
    const renderer = gpuCapabilities.renderer || "CPU fallback";
    const floatTex = gpuCapabilities.floatTextureSupport;

    console.log("[GPU BRIDGE] PERSISTENT COMPUTE SANDBOX — ONLINE");
    console.log(`[GPU BRIDGE] WebGL: ${webglAvailable ? "AVAILABLE" : "NOT AVAILABLE (CPU fallback)"}`);
    console.log(`[GPU BRIDGE] Renderer: ${renderer}`);
    console.log(`[GPU BRIDGE] Version: ${gpuCapabilities.version || "N/A"}`);
    console.log(`[GPU BRIDGE] Float Textures: ${floatTex}`);
    console.log(`[GPU BRIDGE] Shading Language: ${gpuCapabilities.shadingLanguage || "N/A"}`);
    console.log(`[GPU BRIDGE] Max Texture Size: ${gpuCapabilities.maxTextureSize}`);
    console.log(`[GPU BRIDGE] Max Texture Units: ${gpuCapabilities.maxTextureUnits}`);
    console.log(`[GPU BRIDGE] Vendor: ${gpuCapabilities.vendor || "N/A"}`);
    const extCount = Array.isArray(gpuCapabilities.extensions) ? gpuCapabilities.extensions.length : 0;
    console.log(`[GPU BRIDGE] Extensions: ${extCount} supported`);
    console.log("[GPU BRIDGE] Mode: PERSISTENT — always open, processes all compute jobs");
    console.log("[GPU BRIDGE] Capabilities: matmul, softmax, relu, sigmoid, tanh, gelu, attention, layernorm, batchnorm, convolve1d, transpose, embedding, wasm_compile, wasm_call, dynamic_eval");
    console.log("[GPU BRIDGE] OMNIMENS can now offload compute to the browser sandbox");
    console.log("[GPU BRIDGE] ═══════════════════════════════════════════════════════");

    startHealthMonitor();
  } catch (err) {
    console.error("[GPU BRIDGE] Failed to launch compute sandbox:", err);
    gpuBridgeReady = false;
  }
}

function startHealthMonitor(): void {
  setInterval(async () => {
    if (!gpuBridgeReady || !computePage) return;
    try {
      const health = await computePage.evaluate(() => (window as any).gpuHealthCheck()) as any;
      lastHealthCheck = Date.now();
      if (health.contextLost && gpuCapabilities.available) {
        console.warn("[GPU BRIDGE] WebGL context lost — attempting recovery");
        await restartGpuBridge();
      }
      wasmModulesLoaded = health.wasmModules || 0;
      consecutiveFailures = 0;
    } catch {
      consecutiveFailures++;
      console.warn(`[GPU BRIDGE] Health check failed (${consecutiveFailures}/${MAX_FAILURES_BEFORE_RESTART})`);
      if (consecutiveFailures >= MAX_FAILURES_BEFORE_RESTART) {
        console.error("[GPU BRIDGE] Too many failures — restarting bridge");
        await restartGpuBridge();
      }
    }
  }, 30000);
}

async function restartGpuBridge(): Promise<void> {
  console.log("[GPU BRIDGE] Restarting compute sandbox...");
  gpuBridgeReady = false;
  try {
    if (computePage) await computePage.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  } catch {}
  browser = null;
  computePage = null;
  await startGpuBridge();
}

function trackJob(): void {
  currentConcurrentJobs++;
  if (currentConcurrentJobs > peakConcurrentJobs) peakConcurrentJobs = currentConcurrentJobs;
  totalJobsProcessed++;
}
function untrackJob(): void {
  currentConcurrentJobs--;
}

// ═══ BATCH PROCESSOR — send multiple ops in one roundtrip ═══
export async function gpuProcessBatch(
  jobs: Array<Record<string, unknown>>
): Promise<{ results: unknown[]; totalTimeMs: number; jobCount: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  trackJob();
  try {
    const start = Date.now();
    const res = await computePage.evaluate(
      (j) => (window as any).processBatch(j), jobs
    ) as any;
    totalComputeOps += jobs.length;
    totalComputeTimeMs += Date.now() - start;
    totalBatchesProcessed++;
    return res;
  } finally {
    untrackJob();
  }
}

// ═══ WASM COMPILATION — compile WASM modules inside the sandbox ═══
export async function gpuCompileWasm(
  wasmBytes: Uint8Array, moduleName: string
): Promise<{ success: boolean; exports?: string[]; error?: string }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  const bytesArray = Array.from(wasmBytes);
  const res = await computePage.evaluate(
    (bytes, name) => (window as any).compileWasm(bytes, name), bytesArray, moduleName
  ) as any;
  if (res.success) wasmModulesLoaded++;
  return res;
}

// ═══ WASM CALL — execute a function in a loaded WASM module ═══
export async function gpuCallWasm(
  moduleName: string, funcName: string, args: number[]
): Promise<{ result: number; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  trackJob();
  try {
    totalComputeOps++;
    return await computePage.evaluate(
      (m, f, a) => (window as any).callWasm(m, f, a), moduleName, funcName, args
    ) as any;
  } finally {
    untrackJob();
  }
}

// ═══ DYNAMIC EVAL — run arbitrary compute code in the sandbox ═══
export async function gpuEval(code: string): Promise<unknown> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  trackJob();
  try {
    totalComputeOps++;
    return await computePage.evaluate(
      (c) => (window as any).executeComputeCode(c), code
    ) as any;
  } finally {
    untrackJob();
  }
}

// ═══ INDIVIDUAL OPS (convenience wrappers) ═══
export async function gpuMatrixMultiply(
  A: number[], B: number[], rowsA: number, colsA: number, colsB: number
): Promise<{ result: number[]; rows: number; cols: number; timeMs: number; method: string }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  trackJob();
  try {
    const start = Date.now();
    const res = await computePage.evaluate(
      (a, b, ra, ca, cb) => (window as any).gpuMatrixMultiply(a, b, ra, ca, cb),
      A, B, rowsA, colsA, colsB
    ) as any;
    totalComputeOps++;
    totalComputeTimeMs += Date.now() - start;
    return res;
  } finally {
    untrackJob();
  }
}

export async function gpuVectorDot(a: number[], b: number[]): Promise<{ result: number; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x, y) => (window as any).gpuVectorDot(x, y), a, b) as any;
}

export async function gpuVectorAdd(a: number[], b: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x, y) => (window as any).gpuVectorAdd(x, y), a, b) as any;
}

export async function gpuSoftmax(logits: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuSoftmax(x), logits) as any;
}

export async function gpuReLU(values: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuReLU(x), values) as any;
}

export async function gpuSigmoid(values: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuSigmoid(x), values) as any;
}

export async function gpuTanh(values: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuTanh(x), values) as any;
}

export async function gpuGELU(values: number[]): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuGELU(x), values) as any;
}

export async function gpuNormalize(values: number[]): Promise<{ result: number[]; timeMs: number; mean: number; std: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((x) => (window as any).gpuNormalize(x), values) as any;
}

export async function gpuBatchNorm(
  values: number[], gamma?: number[], beta?: number[]
): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((v, g, b) => (window as any).gpuBatchNorm(v, g, b), values, gamma || null, beta || null) as any;
}

export async function gpuLayerNorm(
  values: number[], gamma?: number[], beta?: number[]
): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((v, g, b) => (window as any).gpuLayerNorm(v, g, b), values, gamma || null, beta || null) as any;
}

export async function gpuTranspose(
  matrix: number[], rows: number, cols: number
): Promise<{ result: number[]; rows: number; cols: number; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((m, r, c) => (window as any).gpuTranspose(m, r, c), matrix, rows, cols) as any;
}

export async function gpuConvolve1D(
  signal: number[], kernel: number[]
): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate((s, k) => (window as any).gpuConvolve1D(s, k), signal, kernel) as any;
}

export async function gpuAttentionScore(
  Q: number[], K: number[], V: number[], dim: number
): Promise<{ result: number[]; scores: number[]; seqLen: number; dim: number; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate(
    (q, k, v, d) => (window as any).gpuAttentionScore(q, k, v, d), Q, K, V, dim
  ) as any;
}

export async function gpuEmbeddingLookup(
  embeddings: number[], indices: number[], dim: number
): Promise<{ result: number[]; timeMs: number }> {
  if (!gpuBridgeReady || !computePage) throw new Error("GPU bridge not ready");
  totalComputeOps++;
  return computePage.evaluate(
    (e, i, d) => (window as any).gpuEmbeddingLookup(e, i, d), embeddings, indices, dim
  ) as any;
}

export function getGpuBridgeStatus(): Record<string, unknown> {
  return {
    ready: gpuBridgeReady,
    capabilities: gpuCapabilities,
    totalComputeOps,
    totalComputeTimeMs,
    avgComputeTimeMs: totalComputeOps > 0 ? +(totalComputeTimeMs / totalComputeOps).toFixed(2) : 0,
    uptimeMs: gpuBridgeReady ? Date.now() - bridgeStartTime : 0,
    lastHealthCheck,
    consecutiveFailures,
    totalJobsProcessed,
    totalBatchesProcessed,
    wasmModulesLoaded,
    peakConcurrentJobs,
    currentConcurrentJobs,
    mode: "persistent_compute_sandbox",
  };
}

export async function shutdownGpuBridge(): Promise<void> {
  console.log("[GPU BRIDGE] Shutting down compute sandbox...");
  gpuBridgeReady = false;
  try {
    if (computePage) await computePage.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  } catch {}
  browser = null;
  computePage = null;
  console.log("[GPU BRIDGE] Shutdown complete");
}
