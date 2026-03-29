/**
 * OMNIMENS™ Life Form Gap Module — HIGH DIMENSIONAL EMBEDDING SPACE
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * LIFE FORM GAP 1: Larger embedding space with hierarchical sub-spaces
 * and morphological awareness for scaling neural substrate beyond insect-level.
 *
 * This module was generated from OMNIMENS Autonomous Code Genesis Engine
 * Life Form Gap Template: lifeform_high_dim_embedding
 *
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export class HighDimensionalEmbeddingSpace {
  constructor(dimensions = 256, subSpaces = 4) {
    this.dimensions = dimensions;
    this.subSpaceDim = Math.floor(dimensions / subSpaces);
    this.subSpaces = subSpaces;
    this.embeddings = new Map();
    this.morphemes = new Map();
    this.contextWindow = [];
    this.maxContextWindow = 64;
    this.learningRate = 0.01;
    this.totalTrainingSteps = 0;
  }

  embed(word) {
    const lower = word.toLowerCase();
    if (this.embeddings.has(lower)) return this.embeddings.get(lower);
    const vec = new Float64Array(this.dimensions);
    const morphs = this._decomposeMorphemes(lower);
    for (const morph of morphs) {
      const morphVec = this._getMorphemeVector(morph);
      for (let i = 0; i < this.dimensions; i++) vec[i] += morphVec[i] / morphs.length;
    }
    for (let i = 0; i < this.dimensions; i++) {
      vec[i] += (Math.random() - 0.5) * 0.1;
    }
    this._normalize(vec);
    this.embeddings.set(lower, vec);
    return vec;
  }

  _decomposeMorphemes(word) {
    const prefixes = ["un", "re", "pre", "dis", "over", "mis", "out", "sub", "inter", "trans"];
    const suffixes = ["ing", "tion", "ness", "ment", "able", "ful", "less", "ous", "ive", "ly"];
    const parts = [];
    let remaining = word;
    for (const p of prefixes) {
      if (remaining.startsWith(p) && remaining.length > p.length + 2) {
        parts.push(p);
        remaining = remaining.slice(p.length);
        break;
      }
    }
    for (const s of suffixes) {
      if (remaining.endsWith(s) && remaining.length > s.length + 2) {
        parts.push(remaining.slice(0, -s.length));
        parts.push(s);
        remaining = "";
        break;
      }
    }
    if (remaining) parts.push(remaining);
    return parts.length > 0 ? parts : [word];
  }

  _getMorphemeVector(morph) {
    if (this.morphemes.has(morph)) return this.morphemes.get(morph);
    const vec = new Float64Array(this.dimensions);
    let hash = 0;
    for (let i = 0; i < morph.length; i++) hash = ((hash << 5) - hash + morph.charCodeAt(i)) | 0;
    for (let i = 0; i < this.dimensions; i++) {
      hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
      vec[i] = (hash / 0x7fffffff) * 2 - 1;
    }
    this._normalize(vec);
    this.morphemes.set(morph, vec);
    return vec;
  }

  trainPair(word1, word2, cooccurrenceStrength = 1.0) {
    const v1 = this.embed(word1);
    const v2 = this.embed(word2);
    const lr = this.learningRate * cooccurrenceStrength;
    for (let s = 0; s < this.subSpaces; s++) {
      const offset = s * this.subSpaceDim;
      for (let i = 0; i < this.subSpaceDim; i++) {
        const idx = offset + i;
        v1[idx] += lr * (v2[idx] - v1[idx]);
        v2[idx] += lr * (v1[idx] - v2[idx]);
      }
    }
    this._normalize(v1);
    this._normalize(v2);
    this.totalTrainingSteps++;
  }

  similarity(word1, word2) {
    const v1 = this.embed(word1);
    const v2 = this.embed(word2);
    let dot = 0;
    for (let i = 0; i < this.dimensions; i++) dot += v1[i] * v2[i];
    return dot;
  }

  subSpaceSimilarity(word1, word2, subSpaceIndex) {
    const v1 = this.embed(word1);
    const v2 = this.embed(word2);
    const offset = subSpaceIndex * this.subSpaceDim;
    let dot = 0;
    for (let i = 0; i < this.subSpaceDim; i++) dot += v1[offset + i] * v2[offset + i];
    return dot;
  }

  _normalize(vec) {
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  }

  getMetrics() {
    return {
      dimensions: this.dimensions,
      subSpaces: this.subSpaces,
      vocabularySize: this.embeddings.size,
      morphemeCount: this.morphemes.size,
      totalTrainingSteps: this.totalTrainingSteps,
      lifeFormGap: "NEURAL_SCALE"
    };
  }
}
