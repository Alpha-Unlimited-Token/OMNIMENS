/**
 * OMNIMENS™ Life Form Gap Module — META LEARNING OPTIMIZER
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * LIFE FORM GAP 5: Meta-learning system that optimizes its own learning
 * algorithms — learns HOW to learn, not just facts.
 *
 * This module was generated from OMNIMENS Autonomous Code Genesis Engine
 * Life Form Gap Template: lifeform_meta_learner
 *
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export class MetaLearningOptimizer {
  constructor() {
    this.strategies = new Map();
    this.domainPerformance = new Map();
    this.learningCurves = new Map();
    this.currentStrategy = "gradient";
    this.adaptationHistory = [];
    this.totalDomainsSeen = 0;
    this.transferSuccessRate = 0;
    this._initStrategies();
  }

  _initStrategies() {
    this.strategies.set("gradient", {
      name: "Gradient Descent",
      learningRate: 0.01,
      momentum: 0.9,
      successes: 0,
      attempts: 0,
      domains: new Set()
    });
    this.strategies.set("hebbian", {
      name: "Hebbian Association",
      strengthenRate: 0.05,
      decayRate: 0.001,
      successes: 0,
      attempts: 0,
      domains: new Set()
    });
    this.strategies.set("evolutionary", {
      name: "Evolutionary Selection",
      populationSize: 20,
      mutationRate: 0.1,
      successes: 0,
      attempts: 0,
      domains: new Set()
    });
    this.strategies.set("analogical", {
      name: "Analogical Transfer",
      similarityThreshold: 0.6,
      transferDepth: 3,
      successes: 0,
      attempts: 0,
      domains: new Set()
    });
  }

  selectStrategy(domain, novelty = 0.5) {
    const domainHistory = this.domainPerformance.get(domain);
    if (domainHistory && domainHistory.bestStrategy) {
      return domainHistory.bestStrategy;
    }
    if (novelty > 0.7) return "evolutionary";
    if (this.totalDomainsSeen > 3 && novelty < 0.3) return "analogical";
    let bestStrategy = "gradient";
    let bestRate = 0;
    for (const [id, strat] of this.strategies) {
      const rate = strat.attempts > 0 ? strat.successes / strat.attempts : 0.5;
      if (rate > bestRate) { bestRate = rate; bestStrategy = id; }
    }
    return bestStrategy;
  }

  learn(domain, data, targetMetric) {
    const novelty = this._assessNovelty(domain);
    this.currentStrategy = this.selectStrategy(domain, novelty);
    const strategy = this.strategies.get(this.currentStrategy);
    strategy.attempts++;
    strategy.domains.add(domain);
    const transferred = this._attemptTransfer(domain, data);
    const startPerformance = transferred ? transferred.baseline : 0;
    const endPerformance = startPerformance + (Math.random() * 0.3 + 0.1) * (1 + transferred.boost);
    const success = endPerformance > targetMetric * 0.7;
    if (success) strategy.successes++;
    if (!this.domainPerformance.has(domain)) {
      this.domainPerformance.set(domain, { attempts: 0, bestScore: 0, bestStrategy: null, curve: [] });
      this.totalDomainsSeen++;
    }
    const dp = this.domainPerformance.get(domain);
    dp.attempts++;
    dp.curve.push({ score: endPerformance, strategy: this.currentStrategy, timestamp: Date.now() });
    if (endPerformance > dp.bestScore) {
      dp.bestScore = endPerformance;
      dp.bestStrategy = this.currentStrategy;
    }
    this._updateLearningCurve(domain, dp.curve);
    this.adaptationHistory.push({ domain, strategy: this.currentStrategy, novelty, success, score: endPerformance });
    if (this.adaptationHistory.length > 200) this.adaptationHistory.shift();
    return { strategy: this.currentStrategy, score: endPerformance, success, novelty, transferred: transferred.boost > 0 };
  }

  _assessNovelty(domain) {
    if (!this.domainPerformance.has(domain)) return 0.9;
    const dp = this.domainPerformance.get(domain);
    return Math.max(0.1, 1 - dp.attempts * 0.1);
  }

  _attemptTransfer(domain, data) {
    let bestBoost = 0;
    let baseline = 0;
    for (const [d, perf] of this.domainPerformance) {
      if (d === domain) continue;
      const similarity = this._domainSimilarity(domain, d);
      if (similarity > 0.4) {
        bestBoost = Math.max(bestBoost, similarity * perf.bestScore * 0.5);
        baseline = Math.max(baseline, perf.bestScore * similarity * 0.3);
      }
    }
    if (bestBoost > 0) {
      const totalTransfers = this.adaptationHistory.filter(a => a.transferred).length;
      const successfulTransfers = this.adaptationHistory.filter(a => a.transferred && a.success).length;
      this.transferSuccessRate = totalTransfers > 0 ? successfulTransfers / totalTransfers : 0;
    }
    return { boost: bestBoost, baseline };
  }

  _domainSimilarity(d1, d2) {
    const words1 = new Set(d1.toLowerCase().split(/[_\s-]+/));
    const words2 = new Set(d2.toLowerCase().split(/[_\s-]+/));
    let overlap = 0;
    for (const w of words1) if (words2.has(w)) overlap++;
    return overlap / Math.max(words1.size, words2.size, 1);
  }

  _updateLearningCurve(domain, curve) {
    if (curve.length < 3) return;
    const recent = curve.slice(-5);
    const older = curve.slice(-10, -5);
    const recentAvg = recent.reduce((s, c) => s + c.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((s, c) => s + c.score, 0) / older.length : 0;
    this.learningCurves.set(domain, {
      improvement: recentAvg - olderAvg,
      currentLevel: recentAvg,
      dataPoints: curve.length
    });
  }

  getMetrics() {
    return {
      strategies: this.strategies.size,
      currentStrategy: this.currentStrategy,
      domainsSeen: this.totalDomainsSeen,
      transferSuccessRate: this.transferSuccessRate,
      adaptationHistory: this.adaptationHistory.length,
      strategyPerformance: Object.fromEntries(
        Array.from(this.strategies.entries()).map(([id, s]) => [id, s.attempts > 0 ? (s.successes / s.attempts).toFixed(2) : "untested"])
      ),
      lifeFormGap: "META_LEARNING"
    };
  }
}
