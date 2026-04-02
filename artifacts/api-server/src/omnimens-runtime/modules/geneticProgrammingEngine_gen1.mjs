/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: geneticProgrammingEngine
 * Purpose: Optimizes neural network architectures using genetic programming techniques.
 * Description: Implements NEAT (NeuroEvolution of Augmenting Topologies) for optimizing neural network architectures using genetic programming in JavaScript.
 * Migrated: 2026-04-02T15:11:36.913Z
 */

// geneticProgrammingEngine.mjs

import { randomUUID } from 'crypto';

// Utility: Generate a random floating-point number between min and max
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Utility: Generate a random integer between min and max (inclusive)
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility: Shuffle an array (Fisher-Yates algorithm)
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// NEAT: Node structure
export function createNode(id, type) {
    return { id, type, bias: randomFloat(-1, 1), activation: 'sigmoid' };
}

// NEAT: Connection structure
export function createConnection(inputNode, outputNode, weight = randomFloat(-1, 1), enabled = true) {
    return { inputNode, outputNode, weight, enabled, innovation: randomUUID() };
}

// NEAT: Genome structure
export function createGenome(inputCount, outputCount) {
    const nodes = [];
    const connections = [];

    // Create input nodes
    for (let i = 0; i < inputCount; i++) {
        nodes.push(createNode(`input-${i}`, 'input'));
    }

    // Create output nodes
    for (let i = 0; i < outputCount; i++) {
        nodes.push(createNode(`output-${i}`, 'output'));
    }

    // Fully connect input nodes to output nodes
    for (const inputNode of nodes.filter(node => node.type === 'input')) {
        for (const outputNode of nodes.filter(node => node.type === 'output')) {
            connections.push(createConnection(inputNode.id, outputNode.id));
        }
    }

    return { nodes, connections };
}

// NEAT: Mutation - Add a new node
export function mutateAddNode(genome) {
    const enabledConnections = genome.connections.filter(conn => conn.enabled);
    if (enabledConnections.length === 0) return genome;

    const connectionToSplit = enabledConnections[randomInt(0, enabledConnections.length - 1)];
    connectionToSplit.enabled = false;

    const newNode = createNode(`hidden-${genome.nodes.length}`, 'hidden');
    genome.nodes.push(newNode);

    genome.connections.push(createConnection(connectionToSplit.inputNode, newNode.id, 1));
    genome.connections.push(createConnection(newNode.id, connectionToSplit.outputNode, connectionToSplit.weight));

    return genome;
}

// NEAT: Mutation - Add a new connection
export function mutateAddConnection(genome) {
    const potentialPairs = [];
    for (const nodeA of genome.nodes) {
        for (const nodeB of genome.nodes) {
            if (nodeA.id !== nodeB.id && !genome.connections.some(conn => conn.inputNode === nodeA.id && conn.outputNode === nodeB.id)) {
                potentialPairs.push([nodeA, nodeB]);
            }
        }
    }

    if (potentialPairs.length === 0) return genome;

    const [nodeA, nodeB] = potentialPairs[randomInt(0, potentialPairs.length - 1)];
    genome.connections.push(createConnection(nodeA.id, nodeB.id));

    return genome;
}

// Fitness evaluation placeholder
export function evaluateFitness(genome, fitnessFunction) {
    return fitnessFunction(genome);
}

// Genetic algorithm: Evolve a population
export function evolvePopulation(population, fitnessFunction, mutationRate = 0.1) {
    const fitnessScores = population.map(genome => ({
        genome,
        fitness: evaluateFitness(genome, fitnessFunction)
    }));

    fitnessScores.sort((a, b) => b.fitness - a.fitness);

    const topPerformers = fitnessScores.slice(0, Math.ceil(population.length / 2)).map(entry => entry.genome);

    const newPopulation = [...topPerformers];

    while (newPopulation.length < population.length) {
        const parent = topPerformers[randomInt(0, topPerformers.length - 1)];
        let offspring = JSON.parse(JSON.stringify(parent));

        if (Math.random() < mutationRate) {
            offspring = mutateAddNode(offspring);
        }

        if (Math.random() < mutationRate) {
            offspring = mutateAddConnection(offspring);
        }

        newPopulation.push(offspring);
    }

    return newPopulation;
}

// Example: Initialize population
export function initializePopulation(size, inputCount, outputCount) {
    return Array.from({ length: size }, () => createGenome(inputCount, outputCount));
}