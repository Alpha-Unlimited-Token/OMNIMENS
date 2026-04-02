/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: reinforcementLearningSimulator
 * Purpose: Expand the digital sandbox to include event-driven reinforcement learning with dynamic feedback loops.
 * Description: Simulates event-driven reinforcement learning using Q-learning with dynamic feedback loops and utility functions for multi-agent use.
 * Migrated: 2026-04-02T21:43:58.502Z
 */

// reinforcementLearningSimulator.mjs

import { randomInt } from 'crypto';

/**
 * Simulates a reinforcement learning environment with Q-learning.
 * Allows dynamic feedback loops and event-driven state updates.
 */

// Utility function to initialize a Q-table
export function initializeQTable(states, actions) {
  const qTable = {};
  for (const state of states) {
    qTable[state] = {};
    for (const action of actions) {
      qTable[state][action] = 0; // Initialize with zero rewards
    }
  }
  return qTable;
}

// Utility function to choose an action using an epsilon-greedy policy
export function chooseAction(qTable, state, actions, epsilon = 0.1) {
  if (Math.random() < epsilon) {
    // Explore: choose a random action
    return actions[randomInt(actions.length)];
  } else {
    // Exploit: choose the action with the highest Q-value
    const stateActions = qTable[state] || {};
    return Object.keys(stateActions).reduce((bestAction, action) => {
      return stateActions[action] > (stateActions[bestAction] || -Infinity) ? action : bestAction;
    }, actions[0]);
  }
}

// Utility function to update the Q-value for a state-action pair
export function updateQValue(qTable, state, action, reward, nextState, actions, learningRate = 0.1, discountFactor = 0.9) {
  const currentQ = qTable[state]?.[action] || 0;
  const maxNextQ = Math.max(...(Object.values(qTable[nextState] || {}).concat(0)));
  const newQ = currentQ + learningRate * (reward + discountFactor * maxNextQ - currentQ);
  if (!qTable[state]) qTable[state] = {};
  qTable[state][action] = newQ;
}

// Simulated environment step function (example: grid world)
export function simulateEnvironment(state, action) {
  // Example: simple grid world with 4 states and 2 actions
  const transitions = {
    state1: { actionA: { nextState: 'state2', reward: 10 }, actionB: { nextState: 'state3', reward: -5 } },
    state2: { actionA: { nextState: 'state4', reward: 20 }, actionB: { nextState: 'state1', reward: 0 } },
    state3: { actionA: { nextState: 'state1', reward: -10 }, actionB: { nextState: 'state4', reward: 15 } },
    state4: { actionA: { nextState: 'state4', reward: 0 }, actionB: { nextState: 'state3', reward: -20 } }
  };
  const result = transitions[state]?.[action] || { nextState: state, reward: 0 };
  return { nextState: result.nextState, reward: result.reward };
}

// Main simulation loop
export function runSimulation(states, actions, episodes = 100, epsilon = 0.1, learningRate = 0.1, discountFactor = 0.9) {
  const qTable = initializeQTable(states, actions);
  let currentState = states[0];

  for (let episode = 0; episode < episodes; episode++) {
    const action = chooseAction(qTable, currentState, actions, epsilon);
    const { nextState, reward } = simulateEnvironment(currentState, action);
    updateQValue(qTable, currentState, action, reward, nextState, actions, learningRate, discountFactor);
    currentState = nextState;
  }

  return qTable;
}

// General-purpose utility: Normalize a reward array
export function normalizeRewards(rewards) {
  const maxReward = Math.max(...rewards);
  const minReward = Math.min(...rewards);
  return rewards.map(r => (r - minReward) / (maxReward - minReward));
}

// Example usage (uncomment to test in Node.js):
// const states = ['state1', 'state2', 'state3', 'state4'];
// const actions = ['actionA', 'actionB'];
// const qTable = runSimulation(states, actions);
// console.log(qTable);