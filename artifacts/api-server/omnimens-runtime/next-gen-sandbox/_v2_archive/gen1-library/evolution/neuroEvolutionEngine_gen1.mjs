/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: neuroEvolutionEngine
 * Purpose: Evolves lightweight neural networks using genetic algorithms for adaptive learning within runtime constraints.
 * Description: A JavaScript ES module implementing NEAT for evolving lightweight neural networks with mutation, crossover, and fitness evaluation.
 * Migrated: 2026-03-25T22:49:34.116Z
 */

// neuroEvolutionEngine.mjs
import { randomUUID } from 'crypto';

// Utility: Generate a random floating-point number in a range
export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Utility: Shuffle an array (Fisher-Yates algorithm)
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Utility: Sigmoid activation function
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Neural Network Node
class Node {
  constructor(id, type = 'hidden') {
    this.id = id;
    this.type = type; // 'input', 'hidden', or 'output'
    this.value = 0;
  }
}

// Neural Network Connection
class Connection {
  constructor(fromNode, toNode, weight = randomInRange(-1, 1), enabled = true) {
    this.fromNode = fromNode;
    this.toNode = toNode;
    this.weight = weight;
    this.enabled = enabled;
  }
}

// Neural Network Genome
class Genome {
  constructor() {
    this.nodes = [];
    this.connections = [];
    this.fitness = 0;
  }

  // Add a node to the genome
  addNode(node) {
    this.nodes.push(node);
  }

  // Add a connection to the genome
  addConnection(connection) {
    this.connections.push(connection);
  }

  // Forward propagate inputs through the network
  forward(inputs) {
    const inputNodes = this.nodes.filter(node => node.type === 'input');
    const outputNodes = this.nodes.filter(node => node.type === 'output');

    // Set input values
    inputNodes.forEach((node, index) => {
      node.value = inputs[index] || 0;
    });

    // Process hidden and output nodes
    this.nodes.forEach(node => {
      if (node.type !== 'input') {
        node.value = sigmoid(
          this.connections
            .filter(conn => conn.toNode === node.id && conn.enabled)
            .reduce((sum, conn) => sum + conn.weight * this.nodes.find(n => n.id === conn.fromNode).value, 0)
        );
      }
    });

    // Return output values
    return outputNodes.map(node => node.value);
  }
}

// Genetic Algorithm: Mutation
export function mutate(genome) {
  // Randomly add a new connection
  if (Math.random() < 0.1) {
    const fromNode = genome.nodes[Math.floor(Math.random() * genome.nodes.length)].id;
    const toNode = genome.nodes[Math.floor(Math.random() * genome.nodes.length)].id;
    if (fromNode !== toNode) {
      genome.addConnection(new Connection(fromNode, toNode));
    }
  }

  // Randomly modify weights
  genome.connections.forEach(conn => {
    if (Math.random() < 0.8) {
      conn.weight += randomInRange(-0.5, 0.5);
    }
  });

  return genome;
}

// Genetic Algorithm: Crossover
export function crossover(parent1, parent2) {
  const child = new Genome();

  // Combine nodes
  child.nodes = [...parent1.nodes];

  // Combine connections
  parent1.connections.forEach(conn1 => {
    const conn2 = parent2.connections.find(conn => conn.fromNode === conn1.fromNode && conn.toNode === conn1.toNode);
    child.addConnection(conn2 && Math.random() < 0.5 ? conn2 : conn1);
  });

  return child;
}

// Genetic Algorithm: Fitness Evaluation
export function evaluateFitness(genome, fitnessFunction) {
  genome.fitness = fitnessFunction(genome);
}

// Example: Initialize a population of genomes
export function initializePopulation(size, inputCount, outputCount) {
  const population = [];

  for (let i = 0; i < size; i++) {
    const genome = new Genome();

    // Add input nodes
    for (let j = 0; j < inputCount; j++) {
      genome.addNode(new Node(randomUUID(), 'input'));
    }

    // Add output nodes
    for (let k = 0; k < outputCount; k++) {
      genome.addNode(new Node(randomUUID(), 'output'));
    }

    // Randomly connect input to output nodes
    genome.nodes
      .filter(node => node.type === 'input')
      .forEach(inputNode => {
        genome.nodes
          .filter(node => node.type === 'output')
          .forEach(outputNode => {
            genome.addConnection(new Connection(inputNode.id, outputNode.id));
          });
      });

    population.push(genome);
  }

  return population;
}