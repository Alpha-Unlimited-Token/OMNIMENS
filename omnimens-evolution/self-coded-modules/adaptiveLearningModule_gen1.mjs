/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveLearningModule
 * Written: 2026-03-24T09:21:18.251Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveLearningModule.mjs

import { randomInt } from 'crypto';

/**
 * Initialize a Q-learning agent with default parameters.
 * @param {number} stateCount - Total number of states.
 * @param {number} actionCount - Total number of actions.
 * @param {number} learningRate - Learning rate for Q-value updates.
 * @param {number} discountFactor - Discount factor for future rewards.
 * @returns {object} - Q-learning agent with methods for learning and decision-making.
 */
export function initializeQLearningAgent(stateCount, actionCount, learningRate = 0.1, discountFactor = 0.9) {
  const qTable = Array.from({ length: stateCount }, () => Array(actionCount).fill(0));

  /**
   * Choose an action using epsilon-greedy strategy.
   * @param {number} state - Current state index.
   * @param {number} epsilon - Exploration rate (0 to 1).
   * @returns {number} - Chosen action index.
   */
  function chooseAction(state, epsilon = 0.1) {
    if (Math.random() < epsilon) {
      return randomInt(actionCount); // Explore: random action
    }
    return qTable[state].indexOf(Math.max(...qTable[state])); // Exploit: best action
  }

  /**
   * Update Q-values based on observed reward and next state.
   * @param {number} state - Current state index.
   * @param {number} action - Action taken.
   * @param {number} reward - Reward received.
   * @param {number} nextState - Next state index.
   */
  function updateQValues(state, action, reward, nextState) {
    const maxNextQ = Math.max(...qTable[nextState]);
    qTable[state][action] += learningRate * (reward + discountFactor * maxNextQ - qTable[state][action]);
  }

  /**
   * Get the Q-table for inspection or debugging.
   * @returns {Array<Array<number>>} - Current Q-table.
   */
  function getQTable() {
    return qTable;
  }

  return { chooseAction, updateQValues, getQTable };
}

/**
 * Simulate a reinforcement learning environment for testing.
 * @param {function} agent - Q-learning agent.
 * @param {number} episodes - Number of episodes to simulate.
 * @param {function} rewardFunction - Function to calculate reward based on state and action.
 * @param {function} transitionFunction - Function to calculate next state based on current state and action.
 * @returns {Array<number>} - Cumulative rewards per episode.
 */
export function simulateEnvironment(agent, episodes, rewardFunction, transitionFunction) {
  const cumulativeRewards = [];

  for (let episode = 0; episode < episodes; episode++) {
    let state = 0; // Assume initial state is always 0
    let totalReward = 0;

    while (true) {
      const action = agent.chooseAction(state);
      const reward = rewardFunction(state, action);
      const nextState = transitionFunction(state, action);

      agent.updateQValues(state, action, reward, nextState);
      totalReward += reward;

      if (nextState === null) break; // End of episode condition

      state = nextState;
    }

    cumulativeRewards.push(totalReward);
  }

  return cumulativeRewards;
}

/**
 * Generic reward function example.
 * @param {number} state - Current state.
 * @param {number} action - Action taken.
 * @returns {number} - Reward value.
 */
export function exampleRewardFunction(state, action) {
  return state === action ? 10 : -1; // Reward for matching state and action
}

/**
 * Generic transition function example.
 * @param {number} state - Current state.
 * @param {number} action - Action taken.
 * @returns {number|null} - Next state index or null if episode ends.
 */
export function exampleTransitionFunction(state, action) {
  return state + action < 5 ? state + action : null; // Transition logic
}

/**
 * Utility function to normalize a numeric array.
 * @param {Array<number>} array - Array of numbers.
 * @returns {Array<number>} - Normalized array (values between 0 and 1).
 */
export function normalizeArray(array) {
  const max = Math.max(...array);
  const min = Math.min(...array);
  return array.map(value => (value - min) / (max - min));
}

/**
 * Utility function to calculate the mean of a numeric array.
 * @param {Array<number>} array - Array of numbers.
 * @returns {number} - Mean value.
 */
export function calculateMean(array) {
  return array.reduce((sum, value) => sum + value, 0) / array.length;
}
