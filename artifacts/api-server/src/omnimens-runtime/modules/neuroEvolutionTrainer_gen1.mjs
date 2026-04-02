/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_10
 * Name: neuroEvolutionTrainer
 * Purpose: Evolve compact neural networks using NeuroEvolution of Augmenting Topologies (NEAT) to augment external LLM capabilities.
 * Description: Evolves compact neural networks using NEAT to optimize task-specific performance with reusable utilities for multiple agents.
 * Migrated: 2026-04-02T15:11:36.911Z
 */

// neuroEvolutionTrainer.mjs

import { randomUUID } from 'crypto';

// Utility function to generate random numbers within a range
export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Sigmoid activation function
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Utility to create a random neural network
export function createRandomNetwork(inputSize, outputSize, hiddenNodes = 0) {
  const network = {
    id: randomUUID(),
    inputSize,
    outputSize,
    hiddenNodes,
    connections: []
  };

  // Create connections between input and output (or hidden) nodes
  for (let i = 0; i < inputSize; i++) {
    for (let j = 0; j < (hiddenNodes || outputSize); j++) {
      network.connections.push({
        from: `input_${i}`,
        to: hiddenNodes ? `hidden_${j}` : `output_${j}`,
        weight: randomInRange(-1, 1)
      });
    }
  }

  // If hidden nodes exist, connect them to outputs
  if (hiddenNodes) {
    for (let i = 0; i < hiddenNodes; i++) {
      for (let j = 0; j < outputSize; j++) {
        network.connections.push({
          from: `hidden_${i}`,
          to: `output_${j}`,
          weight: randomInRange(-1, 1)
        });
      }
    }
  }

  return network;
}

// Fitness evaluation function (to be customized per task)
export function evaluateFitness(network, fitnessFunction) {
  return fitnessFunction(network);
}

// Mutation function to modify network weights
export function mutateNetwork(network, mutationRate = 0.1) {
  const mutatedNetwork = JSON.parse(JSON.stringify(network)); // Deep copy

  mutatedNetwork.connections.forEach(connection => {
    if (Math.random() < mutationRate) {
      connection.weight += randomInRange(-0.5, 0.5);
    }
  });

  return mutatedNetwork;
}

// Crossover function to combine two networks
export function crossoverNetworks(parent1, parent2) {
  const child = JSON.parse(JSON.stringify(parent1)); // Start with parent1's structure

  child.connections = child.connections.map((connection, index) => {
    return Math.random() < 0.5 ? connection : parent2.connections[index];
  });

  return child;
}

// Main NEAT evolution function
export async function evolveNetworks({
  populationSize,
  inputSize,
  outputSize,
  generations,
  fitnessFunction,
  mutationRate = 0.1,
  hiddenNodes = 0
}) {
  let population = Array.from({ length: populationSize }, () => createRandomNetwork(inputSize, outputSize, hiddenNodes));

  for (let generation = 0; generation < generations; generation++) {
    // Evaluate fitness for each network
    const fitnessScores = population.map(network => ({
      network,
      fitness: evaluateFitness(network, fitnessFunction)
    }));

    // Sort by fitness (descending)
    fitnessScores.sort((a, b) => b.fitness - a.fitness);

    // Select top performers for breeding
    const topPerformers = fitnessScores.slice(0, Math.ceil(populationSize / 2)).map(entry => entry.network);

    // Create next generation
    const nextGeneration = [];

    while (nextGeneration.length < populationSize) {
      const parent1 = topPerformers[Math.floor(Math.random() * topPerformers.length)];
      const parent2 = topPerformers[Math.floor(Math.random() * topPerformers.length)];

      const child = crossoverNetworks(parent1, parent2);
      const mutatedChild = mutateNetwork(child, mutationRate);

      nextGeneration.push(mutatedChild);
    }

    population = nextGeneration;
  }

  // Return the best network from the final generation
  return population.sort((a, b) => evaluateFitness(b, fitnessFunction) - evaluateFitness(a, fitnessFunction))[0];
}

// Example fitness function for testing
export function exampleFitnessFunction(network) {
  return network.connections.reduce((sum, conn) => sum + Math.abs(conn.weight), 0);
}