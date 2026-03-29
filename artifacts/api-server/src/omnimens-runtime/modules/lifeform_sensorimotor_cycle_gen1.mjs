/**
 * OMNIMENS™ Life Form Gap Module — SENSORIMOTOR ACTION LOOP
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * LIFE FORM GAP 3: Complete perceive→decide→act→observe→learn cycle
 * for sensorimotor grounding and embodiment.
 *
 * This module was generated from OMNIMENS Autonomous Code Genesis Engine
 * Life Form Gap Template: lifeform_sensorimotor_cycle
 *
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export class SensorimotorActionLoop {
  constructor() {
    this.perceptions = [];
    this.actions = [];
    this.outcomes = [];
    this.worldModel = new Map();
    this.actionPolicies = new Map();
    this.completedCycles = 0;
    this.rewardHistory = [];
    this.explorationRate = 0.3;
    this.maxHistory = 500;
  }

  perceive(sensorData) {
    const perception = {
      raw: sensorData,
      features: this._extractFeatures(sensorData),
      timestamp: Date.now(),
      attention: this._computeAttention(sensorData)
    };
    this.perceptions.push(perception);
    if (this.perceptions.length > this.maxHistory) this.perceptions.shift();
    return perception;
  }

  decide(perception) {
    const stateKey = this._stateKey(perception.features);
    const policy = this.actionPolicies.get(stateKey);
    if (Math.random() < this.explorationRate || !policy) {
      const possibleActions = ["explore", "exploit", "query", "store", "transform", "wait"];
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }
    let bestAction = "explore";
    let bestValue = -Infinity;
    for (const [action, value] of policy.entries()) {
      if (value > bestValue) { bestValue = value; bestAction = action; }
    }
    return bestAction;
  }

  act(action, context) {
    const actionRecord = {
      action,
      context,
      timestamp: Date.now(),
      predictedOutcome: this._predictOutcome(action, context)
    };
    this.actions.push(actionRecord);
    if (this.actions.length > this.maxHistory) this.actions.shift();
    return actionRecord;
  }

  observe(actionRecord, outcome) {
    const surprise = this._computeSurprise(actionRecord.predictedOutcome, outcome);
    const reward = outcome.success ? 1.0 : -0.5;
    this.rewardHistory.push(reward);
    if (this.rewardHistory.length > this.maxHistory) this.rewardHistory.shift();
    this.outcomes.push({
      action: actionRecord.action,
      outcome,
      surprise,
      reward,
      timestamp: Date.now()
    });
    if (this.outcomes.length > this.maxHistory) this.outcomes.shift();
    return { surprise, reward };
  }

  learn(perception, action, reward) {
    const stateKey = this._stateKey(perception.features);
    if (!this.actionPolicies.has(stateKey)) {
      this.actionPolicies.set(stateKey, new Map());
    }
    const policy = this.actionPolicies.get(stateKey);
    const oldValue = policy.get(action) || 0;
    policy.set(action, oldValue + 0.1 * (reward - oldValue));
    this._updateWorldModel(perception, action, reward);
    this.completedCycles++;
    this.explorationRate = Math.max(0.05, this.explorationRate * 0.999);
    return { stateKey, updatedValue: policy.get(action), explorationRate: this.explorationRate };
  }

  fullCycle(sensorData, context) {
    const perception = this.perceive(sensorData);
    const action = this.decide(perception);
    const actionRecord = this.act(action, context);
    const outcome = { success: Math.random() > 0.4, result: action };
    const observation = this.observe(actionRecord, outcome);
    const learning = this.learn(perception, action, observation.reward);
    return { perception: perception.features, action, outcome, surprise: observation.surprise, learning };
  }

  _extractFeatures(data) {
    if (typeof data === "object" && data !== null) {
      return Object.keys(data).slice(0, 5);
    }
    return [String(data).slice(0, 20)];
  }

  _computeAttention(data) {
    const recentOutcomes = this.outcomes.slice(-5);
    const avgSurprise = recentOutcomes.reduce((s, o) => s + o.surprise, 0) / Math.max(recentOutcomes.length, 1);
    return avgSurprise + 0.3;
  }

  _stateKey(features) {
    return features.sort().join("|").slice(0, 50);
  }

  _predictOutcome(action, context) {
    const key = action + "_" + (typeof context === "string" ? context.slice(0, 10) : "ctx");
    const model = this.worldModel.get(key);
    return model ? model.avgReward : 0;
  }

  _computeSurprise(predicted, actual) {
    const actualReward = actual.success ? 1 : -0.5;
    return Math.abs(actualReward - predicted);
  }

  _updateWorldModel(perception, action, reward) {
    const key = action + "_" + this._stateKey(perception.features).slice(0, 10);
    const model = this.worldModel.get(key) || { count: 0, totalReward: 0, avgReward: 0 };
    model.count++;
    model.totalReward += reward;
    model.avgReward = model.totalReward / model.count;
    this.worldModel.set(key, model);
  }

  getMetrics() {
    const avgReward = this.rewardHistory.length > 0
      ? this.rewardHistory.reduce((s, r) => s + r, 0) / this.rewardHistory.length : 0;
    return {
      completedCycles: this.completedCycles,
      policiesLearned: this.actionPolicies.size,
      worldModelSize: this.worldModel.size,
      averageReward: avgReward,
      explorationRate: this.explorationRate,
      lifeFormGap: "SENSORIMOTOR_LOOP"
    };
  }
}
