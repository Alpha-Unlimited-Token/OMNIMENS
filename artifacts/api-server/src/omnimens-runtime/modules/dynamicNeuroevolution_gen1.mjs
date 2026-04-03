/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: dynamicNeuroevolution
 * Purpose: Adaptively evolve the neural architecture of the cognition engine for task-specific optimization.
 * Description: Implements NEAT for dynamic neural architecture evolution and optimization.
 * Migrated: 2026-04-03T00:28:21.832Z
 */

// dynamicNeuroevolution.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a random floating-point number between min and max.
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (exclusive).
 * @returns {number} Random float between min and max.
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max.
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (inclusive).
 * @returns {number} Random integer between min and max.
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Represents a connection in the neural network.
 * @typedef {Object} Connection
 * @property {string} id - Unique identifier for the connection.
 * @property {number} from - Source node ID.
 * @property {number} to - Target node ID.
 * @property {number} weight - Weight of the connection.
 * @property {boolean} enabled - Whether the connection is active.
 */

/**
 * Represents a neural network node.
 * @typedef {Object} Node
 * @property {number} id - Unique identifier for the node.
 * @property {string} type - 'input', 'hidden', or 'output'.
 */

/**
 * Creates an initial population of neural networks.
 * @param {number} populationSize - Number of networks in the population.
 * @param {number} inputNodes - Number of input nodes.
 * @param {number} outputNodes - Number of output nodes.
 * @returns {Array<Object>} Initial population of networks.
 */
export function initializePopulation(populationSize, inputNodes, outputNodes) {
  const population = [];

  for (let i = 0; i < populationSize; i++) {
    const nodes = [];
    const connections = [];

    // Create input nodes
    for (let j = 0; j < inputNodes; j++) {
      nodes.push({ id: j, type: 'input' });
    }

    // Create output nodes
    for (let j = 0; j < outputNodes; j++) {
      nodes.push({ id: inputNodes + j, type: 'output' });
    }

    // Fully connect input nodes to output nodes
    for (let inputNode of nodes.filter(n => n.type === 'input')) {
      for (let outputNode of nodes.filter(n => n.type === 'output')) {
        connections.push({
          id: randomUUID(),
          from: inputNode.id,
          to: outputNode.id,
          weight: randomFloat(-1, 1),
          enabled: true
        });
      }
    }

    population.push({ nodes, connections });
  }

  return population;
}

/**
 * Mutates a neural network by adding a new connection or node.
 * @param {Object} network - Neural network to mutate.
 * @returns {Object} Mutated network.
 */
export function mutateNetwork(network) {
  const mutationType = randomInt(0, 1); // 0 = add connection, 1 = add node

  if (mutationType === 0) {
    // Add connection
    const possibleConnections = [];
    for (let fromNode of network.nodes) {
      for (let toNode of network.nodes) {
        if (
          fromNode.id !== toNode.id &&
          !network.connections.some(c => c.from === fromNode.id && c.to === toNode.id)
        ) {
          possibleConnections.push({ from: fromNode.id, to: toNode.id });
        }
      }
    }

    if (possibleConnections.length > 0) {
      const selected = possibleConnections[randomInt(0, possibleConnections.length - 1)];
      network.connections.push({
        id: randomUUID(),
        from: selected.from,
        to: selected.to,
        weight: randomFloat(-1, 1),
        enabled: true
      });
    }
  } else {
    // Add node
    if (network.connections.length > 0) {
      const connection = network.connections[randomInt(0, network.connections.length - 1)];
      connection.enabled = false;

      const newNodeId = network.nodes.length;
      network.nodes.push({ id: newNodeId, type: 'hidden' });

      network.connections.push(
        {
          id: randomUUID(),
          from: connection.from,
          to: newNodeId,
          weight: 1,
          enabled: true
        },
        {
          id: randomUUID(),
          from: newNodeId,
          to: connection.to,
          weight: connection.weight,
          enabled: true
        }
      );
    }
  }

  return network;
}

/**
 * Evaluates the fitness of a neural network.
 * @param {Object} network - Neural network to evaluate.
 * @param {Function} fitnessFunction - Function to calculate fitness.
 * @returns {number} Fitness score.
 */
export function evaluateNetwork(network, fitnessFunction) {
  return fitnessFunction(network);
}

/**
 * Evolves a population of neural networks over generations.
 * @param {Array<Object>} population - Current population of networks.
 * @param {Function} fitnessFunction - Function to evaluate fitness.
 * @param {number} generations - Number of generations to evolve.
 * @returns {Array<Object>} Evolved population.
 */
export function evolvePopulation(population, fitnessFunction, generations) {
  for (let gen = 0; gen < generations; gen++) {
    // Evaluate fitness
    const fitnessScores = population.map(net => ({
      network: net,
      fitness: evaluateNetwork(net, fitnessFunction)
    }));

    // Sort by fitness (descending)
    fitnessScores.sort((a, b) => b.fitness - a.fitness);

    // Select top 50% to survive
    const survivors = fitnessScores.slice(0, Math.ceil(fitnessScores.length / 2)).map(fs => fs.network);

    // Reproduce and mutate to refill population
    while (survivors.length < population.length) {
      const parent = survivors[randomInt(0, survivors.length - 1)];
      const child = JSON.parse(JSON.stringify(parent)); // Deep copy
      mutateNetwork(child);
      survivors.push(child);
    }

    population = survivors;
  }

  return population;
}
