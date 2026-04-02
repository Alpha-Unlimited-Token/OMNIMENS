/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_19
 * Name: sensorimotorSimulationEnhancer
 * Purpose: Expands digital sandbox to simulate real-world physics, multi-agent dynamics, and environmental variability.
 * Description: Simulates a 2D physics-based environment with multi-agent dynamics and reinforcement learning for sensorimotor coordination.
 * Migrated: 2026-04-02T14:21:19.471Z
 */

// sensorimotorSimulationEnhancer.mjs

import { randomUUID } from 'crypto';

/**
 * Simulates a 2D physics-based environment with agents that learn sensorimotor coordination
 * using reinforcement learning. Supports multi-agent dynamics.
 */

// Constants for simulation
const GRAVITY = 9.8; // m/s^2
const TIME_STEP = 0.016; // 16ms per simulation step (60 FPS)
const WORLD_BOUNDS = { width: 1000, height: 1000 }; // 2D world dimensions

/**
 * Utility function to generate a random number within a range.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random number between min and max.
 */
export function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the second point.
 * @param {number} y2 - Y coordinate of the second point.
 * @returns {number} Distance between the two points.
 */
export function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Represents an agent in the simulation.
 * @param {Object} initialState - Initial state of the agent.
 * @returns {Object} Agent object.
 */
export function createAgent(initialState = {}) {
  return {
    id: randomUUID(),
    x: initialState.x || getRandomInRange(0, WORLD_BOUNDS.width),
    y: initialState.y || getRandomInRange(0, WORLD_BOUNDS.height),
    vx: initialState.vx || 0, // Velocity in X direction
    vy: initialState.vy || 0, // Velocity in Y direction
    reward: 0, // Cumulative reward
    sensors: [],
    actuators: [],
    updateState(actions) {
      // Apply actions to update velocity
      this.vx += actions.ax || 0;
      this.vy += actions.ay || 0;

      // Update position based on velocity
      this.x += this.vx * TIME_STEP;
      this.y += this.vy * TIME_STEP;

      // Keep agent within world bounds
      this.x = Math.max(0, Math.min(WORLD_BOUNDS.width, this.x));
      this.y = Math.max(0, Math.min(WORLD_BOUNDS.height, this.y));

      // Apply gravity
      this.vy += GRAVITY * TIME_STEP;
    },
    senseEnvironment(environment) {
      // Example: Detect nearby agents or obstacles
      this.sensors = environment.filter(entity => {
        return calculateDistance(this.x, this.y, entity.x, entity.y) < 50;
      });
    },
    applyReward(rewardFunction) {
      this.reward += rewardFunction(this);
    }
  };
}

/**
 * Runs the simulation for a given number of steps.
 * @param {Array} agents - Array of agents in the simulation.
 * @param {Function} rewardFunction - Function to calculate rewards for agents.
 * @param {number} steps - Number of simulation steps to run.
 */
export function runSimulation(agents, rewardFunction, steps = 1000) {
  for (let step = 0; step < steps; step++) {
    // Sense environment and update state for each agent
    for (const agent of agents) {
      agent.senseEnvironment(agents);
      const actions = { ax: getRandomInRange(-1, 1), ay: getRandomInRange(-1, 1) }; // Random actions for demo
      agent.updateState(actions);
      agent.applyReward(rewardFunction);
    }
  }
}

/**
 * Example reward function: Penalize agents for being close to others.
 * @param {Object} agent - The agent to evaluate.
 * @returns {number} Reward value.
 */
export function exampleRewardFunction(agent) {
  return -agent.sensors.length; // Negative reward for proximity to others
}

/**
 * Initializes a simulation with random agents.
 * @param {number} agentCount - Number of agents to create.
 * @returns {Array} Array of initialized agents.
 */
export function initializeSimulation(agentCount) {
  const agents = [];
  for (let i = 0; i < agentCount; i++) {
    agents.push(createAgent());
  }
  return agents;
}

// Example usage
const agents = initializeSimulation(10);
runSimulation(agents, exampleRewardFunction, 100);