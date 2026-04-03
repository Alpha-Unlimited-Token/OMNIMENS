/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorIndexMemory
 * Written: 2026-04-03T02:43:56.398Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorIndexMemory.mjs

import { randomUUID } from 'crypto';

// Utility function to calculate Euclidean distance between two vectors
export function calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must be of the same dimension.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

// Node structure for HNSW graph
class HNSWNode {
    constructor(id, vector, level) {
        this.id = id;
        this.vector = vector;
        this.level = level;
        this.connections = new Map(); // Level -> Array of connected nodes
    }
}

// HNSW graph implementation
export class HNSW {
    constructor(maxLevel = 5, maxConnections = 10) {
        this.maxLevel = maxLevel;
        this.maxConnections = maxConnections;
        this.nodes = new Map(); // id -> HNSWNode
        this.entryPoint = null;
    }

    // Adds a vector to the graph
    addVector(vector) {
        const id = randomUUID();
        const level = this._generateRandomLevel();
        const newNode = new HNSWNode(id, vector, level);
        this.nodes.set(id, newNode);

        if (!this.entryPoint) {
            this.entryPoint = newNode;
            return id;
        }

        let currentNode = this.entryPoint;
        for (let currentLevel = this.maxLevel; currentLevel >= 0; currentLevel--) {
            currentNode = this._searchLayer(newNode.vector, currentNode, currentLevel);
            if (currentLevel <= level) {
                this._connectNode(newNode, currentNode, currentLevel);
            }
        }

        return id;
    }

    // Searches for the nearest neighbors of a given vector
    search(vector, k = 1) {
        if (!this.entryPoint) {
            return [];
        }

        let currentNode = this.entryPoint;
        for (let currentLevel = this.maxLevel; currentLevel >= 0; currentLevel--) {
            currentNode = this._searchLayer(vector, currentNode, currentLevel);
        }

        const visited = new Set();
        const candidates = [{ node: currentNode, distance: calculateDistance(vector, currentNode.vector) }];

        while (candidates.length > 0 && visited.size < k) {
            candidates.sort((a, b) => a.distance - b.distance);
            const { node } = candidates.shift();
            visited.add(node.id);

            for (const neighbor of node.connections.get(0) || []) {
                if (!visited.has(neighbor.id)) {
                    const distance = calculateDistance(vector, neighbor.vector);
                    candidates.push({ node: neighbor, distance });
                }
            }
        }

        return Array.from(visited).map(id => this.nodes.get(id));
    }

    // Private method to connect nodes
    _connectNode(nodeA, nodeB, level) {
        if (!nodeA.connections.has(level)) {
            nodeA.connections.set(level, []);
        }
        if (!nodeB.connections.has(level)) {
            nodeB.connections.set(level, []);
        }

        nodeA.connections.get(level).push(nodeB);
        nodeB.connections.get(level).push(nodeA);

        if (nodeA.connections.get(level).length > this.maxConnections) {
            nodeA.connections.set(level, nodeA.connections.get(level).slice(0, this.maxConnections));
        }
        if (nodeB.connections.get(level).length > this.maxConnections) {
            nodeB.connections.set(level, nodeB.connections.get(level).slice(0, this.maxConnections));
        }
    }

    // Private method to search within a layer
    _searchLayer(targetVector, entryNode, level) {
        let closestNode = entryNode;
        let closestDistance = calculateDistance(targetVector, entryNode.vector);

        for (const neighbor of entryNode.connections.get(level) || []) {
            const distance = calculateDistance(targetVector, neighbor.vector);
            if (distance < closestDistance) {
                closestNode = neighbor;
                closestDistance = distance;
            }
        }

        return closestNode;
    }

    // Private method to generate random level for a node
    _generateRandomLevel() {
        let level = 0;
        while (Math.random() < 0.5 && level < this.maxLevel) {
            level++;
        }
        return level;
    }
}

// Exported utility functions
export function createHNSW(maxLevel, maxConnections) {
    return new HNSW(maxLevel, maxConnections);
}