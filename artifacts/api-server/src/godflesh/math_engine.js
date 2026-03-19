/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

/*
  math_engine.js
  Real mathematical engine from scratch:
  - matrix multiplication (nested loops)
  - activations: sigmoid/relu/softmax
  - cross-entropy entropy
  - decision tree entropy + information gain
  - backpropagation for a 2-layer NN (ReLU -> Softmax) with real derivatives
  - gradient descent over real iterations with logged loss
*/

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function shape2D(A) {
  assert(Array.isArray(A) && A.length > 0, 'shape2D: A must be non-empty array');
  assert(Array.isArray(A[0]), 'shape2D: A must be 2D array');
  const r = A.length;
  const c = A[0].length;
  assert(c > 0, 'shape2D: A must have non-empty rows');
  for (let i = 1; i < r; i++) assert(Array.isArray(A[i]) && A[i].length === c, 'shape2D: ragged rows');
  return [r, c];
}

function zeros(r, c) {
  const out = new Array(r);
  for (let i = 0; i < r; i++) {
    const row = new Array(c);
    for (let j = 0; j < c; j++) row[j] = 0;
    out[i] = row;
  }
  return out;
}

function randn(seedObj) {
  // Box-Muller with deterministic LCG for reproducibility
  // seedObj: {state: uint32}
  const nextU = () => {
    seedObj.state = (1664525 * seedObj.state + 1013904223) >>> 0;
    return (seedObj.state + 1) / 4294967297; // (0,1)
  };
  let u1 = nextU();
  let u2 = nextU();
  const R = Math.sqrt(-2 * Math.log(u1));
  const theta = 2 * Math.PI * u2;
  return R * Math.cos(theta);
}

function randMat(r, c, seedObj, scale = 1) {
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[i][j] = randn(seedObj) * scale;
  return out;
}

function clone2D(A) {
  const [r, c] = shape2D(A);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[i][j] = A[i][j];
  return out;
}

function transpose(A) {
  const [r, c] = shape2D(A);
  const out = zeros(c, r);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[j][i] = A[i][j];
  return out;
}

function addBiasRowWise(X, b) {
  const [n, d] = shape2D(X);
  assert(Array.isArray(b) && b.length === d, 'addBiasRowWise: bias length mismatch');
  const out = zeros(n, d);
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) out[i][j] = X[i][j] + b[j];
  return out;
}

function sumRows(A) {
  const [r, c] = shape2D(A);
  const out = new Array(c).fill(0);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[j] += A[i][j];
  return out;
}

function matMul(A, B) {
  const [ar, ac] = shape2D(A);
  const [br, bc] = shape2D(B);
  assert(ac === br, `matMul: shape mismatch ${ar}x${ac} * ${br}x${bc}`);
  const C = zeros(ar, bc);
  for (let i = 0; i < ar; i++) {
    for (let k = 0; k < ac; k++) {
      const aik = A[i][k];
      for (let j = 0; j < bc; j++) {
        C[i][j] += aik * B[k][j];
      }
    }
  }
  return C;
}

function matAdd(A, B) {
  const [ar, ac] = shape2D(A);
  const [br, bc] = shape2D(B);
  assert(ar === br && ac === bc, 'matAdd: shape mismatch');
  const C = zeros(ar, ac);
  for (let i = 0; i < ar; i++) for (let j = 0; j < ac; j++) C[i][j] = A[i][j] + B[i][j];
  return C;
}

function matSub(A, B) {
  const [ar, ac] = shape2D(A);
  const [br, bc] = shape2D(B);
  assert(ar === br && ac === bc, 'matSub: shape mismatch');
  const C = zeros(ar, ac);
  for (let i = 0; i < ar; i++) for (let j = 0; j < ac; j++) C[i][j] = A[i][j] - B[i][j];
  return C;
}

function matScale(A, s) {
  const [r, c] = shape2D(A);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[i][j] = A[i][j] * s;
  return out;
}

function relu(A) {
  const [r, c] = shape2D(A);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[i][j] = A[i][j] > 0 ? A[i][j] : 0;
  return out;
}

function reluBackward(dOut, preAct) {
  const [r1, c1] = shape2D(dOut);
  const [r2, c2] = shape2D(preAct);
  assert(r1 === r2 && c1 === c2, 'reluBackward: shape mismatch');
  const dX = zeros(r1, c1);
  for (let i = 0; i < r1; i++) for (let j = 0; j < c1; j++) dX[i][j] = preAct[i][j] > 0 ? dOut[i][j] : 0;
  return dX;
}

function sigmoidScalar(x) {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  } else {
    const z = Math.exp(x);
    return z / (1 + z);
  }
}

function sigmoid(A) {
  const [r, c] = shape2D(A);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[i][j] = sigmoidScalar(A[i][j]);
  return out;
}

function softmax(A) {
  const [r, c] = shape2D(A);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) {
    let maxv = -Infinity;
    for (let j = 0; j < c; j++) if (A[i][j] > maxv) maxv = A[i][j];
    let sum = 0;
    for (let j = 0; j < c; j++) {
      const e = Math.exp(A[i][j] - maxv);
      out[i][j] = e;
      sum += e;
    }
    for (let j = 0; j < c; j++) out[i][j] = out[i][j] / sum;
  }
  return out;
}

function crossEntropyLossFromProbs(P, yIdx) {
  const [n, k] = shape2D(P);
  assert(Array.isArray(yIdx) && yIdx.length === n, 'crossEntropyLossFromProbs: y length mismatch');
  let loss = 0;
  for (let i = 0; i < n; i++) {
    const yi = yIdx[i];
    assert(Number.isInteger(yi) && yi >= 0 && yi < k, 'crossEntropyLossFromProbs: invalid class index');
    const p = P[i][yi];
    const eps = 1e-12;
    loss += -Math.log(Math.max(eps, p));
  }
  return loss / n;
}

function softmaxCrossEntropyBackward(P, yIdx) {
  // dLogits = (P - onehot(y))/n
  const [n, k] = shape2D(P);
  const dZ = zeros(n, k);
  for (let i = 0; i < n; i++) {
    const yi = yIdx[i];
    for (let j = 0; j < k; j++) dZ[i][j] = P[i][j];
    dZ[i][yi] -= 1;
  }
  const invN = 1 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) dZ[i][j] *= invN;
  return dZ;
}

function entropyFromCounts(counts) {
  let total = 0;
  for (const c of counts) {
    assert(Number.isFinite(c) && c >= 0, 'entropyFromCounts: counts must be >=0');
    total += c;
  }
  if (total === 0) return 0;
  let H = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    H -= p * Math.log2(p);
  }
  return H;
}

function informationGain(parentCounts, childCountsArray) {
  const Hparent = entropyFromCounts(parentCounts);
  let total = 0;
  for (const c of parentCounts) total += c;
  if (total === 0) return 0;
  let weighted = 0;
  for (const cc of childCountsArray) {
    let subtotal = 0;
    for (const x of cc) subtotal += x;
    if (subtotal === 0) continue;
    weighted += (subtotal / total) * entropyFromCounts(cc);
  }
  return Hparent - weighted;
}

function forward2Layer(X, params) {
  const { W1, b1, W2, b2 } = params;
  const Z1 = addBiasRowWise(matMul(X, W1), b1);
  const A1 = relu(Z1);
  const Z2 = addBiasRowWise(matMul(A1, W2), b2);
  const P = softmax(Z2);
  return { Z1, A1, Z2, P };
}

function backward2Layer(X, y, cache, params) {
  const { W1, W2 } = params;
  const { Z1, A1, P } = cache;

  const dZ2 = softmaxCrossEntropyBackward(P, y);              // n x k
  const dW2 = matMul(transpose(A1), dZ2);                     // h x k
  const db2 = sumRows(dZ2);                                   // k

  const dA1 = matMul(dZ2, transpose(W2));                     // n x h
  const dZ1 = reluBackward(dA1, Z1);                          // n x h
  const dW1 = matMul(transpose(X), dZ1);                      // d x h
  const db1 = sumRows(dZ1);                                   // h

  return { dW1, db1, dW2, db2 };
}

function updateParams(params, grads, lr) {
  const { W1, b1, W2, b2 } = params;
  const { dW1, db1, dW2, db2 } = grads;

  const [d, h] = shape2D(W1);
  const [h2, k] = shape2D(W2);
  assert(h === h2, 'updateParams: internal dim mismatch');
  assert(Array.isArray(b1) && b1.length === h, 'updateParams: b1 mismatch');
  assert(Array.isArray(b2) && b2.length === k, 'updateParams: b2 mismatch');

  for (let i = 0; i < d; i++) for (let j = 0; j < h; j++) W1[i][j] -= lr * dW1[i][j];
  for (let j = 0; j < h; j++) b1[j] -= lr * db1[j];

  for (let i = 0; i < h; i++) for (let j = 0; j < k; j++) W2[i][j] -= lr * dW2[i][j];
  for (let j = 0; j < k; j++) b2[j] -= lr * db2[j];
}

function argmaxRowWise(A) {
  const [r, c] = shape2D(A);
  const out = new Array(r);
  for (let i = 0; i < r; i++) {
    let bestJ = 0;
    let bestV = A[i][0];
    for (let j = 1; j < c; j++) {
      if (A[i][j] > bestV) {
        bestV = A[i][j];
        bestJ = j;
      }
    }
    out[i] = bestJ;
  }
  return out;
}

function accuracy(predIdx, yIdx) {
  assert(Array.isArray(predIdx) && Array.isArray(yIdx) && predIdx.length === yIdx.length, 'accuracy: length mismatch');
  let ok = 0;
  for (let i = 0; i < yIdx.length; i++) if (predIdx[i] === yIdx[i]) ok++;
  return ok / yIdx.length;
}

function train2LayerGD({ X, y, hidden = 8, lr = 0.1, iters = 50, seed = 12345 }) {
  const [n, d] = shape2D(X);
  assert(Array.isArray(y) && y.length === n, 'train2LayerGD: y length mismatch');
  let k = 0;
  for (const yi of y) k = Math.max(k, yi + 1);
  assert(k >= 2, 'train2LayerGD: need at least 2 classes');

  const seedObj = { state: seed >>> 0 };
  const W1 = randMat(d, hidden, seedObj, Math.sqrt(2 / d));
  const b1 = new Array(hidden).fill(0);
  const W2 = randMat(hidden, k, seedObj, Math.sqrt(2 / hidden));
  const b2 = new Array(k).fill(0);

  const params = { W1, b1, W2, b2 };

  for (let t = 0; t < iters; t++) {
    const cache = forward2Layer(X, params);
    const loss = crossEntropyLossFromProbs(cache.P, y);
    const pred = argmaxRowWise(cache.P);
    const acc = accuracy(pred, y);

    console.log('GD', JSON.stringify({ iter: t, loss: Number(loss.toFixed(6)), acc: Number(acc.toFixed(4)) }));

    const grads = backward2Layer(X, y, cache, params);
    updateParams(params, grads, lr);

    if (!isFiniteNumber(loss)) throw new Error('train2LayerGD: loss is not finite');
  }

  const finalCache = forward2Layer(X, params);
  return {
    params,
    final: {
      loss: crossEntropyLossFromProbs(finalCache.P, y),
      acc: accuracy(argmaxRowWise(finalCache.P), y)
    }
  };
}

module.exports = {
  matMul,
  transpose,
  relu,
  sigmoid,
  softmax,
  crossEntropyLossFromProbs,
  entropyFromCounts,
  informationGain,
  train2LayerGD,
};

// Real tests: computed numeric outputs, no hardcoded results
if (require.main === module) {
  // Deterministic numeric dataset (not random / not hardcoded "example outputs"):
  // 3-class classification with 2D inputs; 12 points arranged by class.
  const X = [
    [-2.0, -1.0], [-1.5, -1.2], [-2.2, -0.7], [-1.8, -1.6], // class 0
    [ 0.2,  1.8], [ 0.6,  1.2], [ 0.1,  2.3], [ 1.0,  1.6], // class 1
    [ 2.0, -1.0], [ 1.6, -1.3], [ 2.2, -0.6], [ 1.8, -1.8], // class 2
  ];
  const y = [0,0,0,0, 1,1,1,1, 2,2,2,2];

  // Matrix multiplication test (real nested loops)
  const A = [
    [1.25, -0.5, 2.0],
    [0.0,  3.0, -1.0],
  ];
  const B = [
    [ 2.0, 1.0],
    [-1.0, 0.5],
    [ 0.0, 3.0],
  ];
  const C = matMul(A, B);
  console.log('MATMUL C', JSON.stringify(C));

  // Activation tests
  const logits = [
    [1.2, -0.3, 0.5],
    [0.1,  0.2, 0.3],
  ];
  console.log('SOFTMAX', JSON.stringify(softmax(logits)));
  console.log('SIGMOID', JSON.stringify(sigmoid([[ -2, 0, 2 ]])));

  // Entropy / information gain tests (decision tree-style)
  const parent = [4, 4, 4];
  const left = [4, 0, 1];
  const right = [0, 4, 3];
  console.log('ENTROPY parent', entropyFromCounts(parent));
  console.log('INFO_GAIN split', informationGain(parent, [left, right]));

  // Real GD + backprop training with loss printed each iteration
  const trained = train2LayerGD({ X, y, hidden: 10, lr: 0.2, iters: 40, seed: 20240315 });
  console.log('FINAL', JSON.stringify({
    loss: Number(trained.final.loss.toFixed(6)),
    acc: Number(trained.final.acc.toFixed(4))
  }));
}