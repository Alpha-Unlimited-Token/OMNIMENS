/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-24T11:03:48.554Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function KnowledgeGraph() {
    this.graph = new Map();

    // Add a concept and its associations
    this.addConcept = function (concept, associations) {
        if (!this.graph.has(concept)) {
            this.graph.set(concept, new Set());
        }
        const conceptSet = this.graph.get(concept);
        for (let assoc of associations) {
            conceptSet.add(assoc);
            if (!this.graph.has(assoc)) {
                this.graph.set(assoc, new Set());
            }
            this.graph.get(assoc).add(concept); // Ensure bidirectional linking
        }
    };

    // Retrieve related concepts with a depth limit
    this.retrieveRelated = function (concept, depth) {
        if (!this.graph.has(concept)) return [];
        const visited = new Set();
        const queue = [{ node: concept, level: 0 }];
        const results = [];

        while (queue.length > 0) {
            const { node, level } = queue.shift();
            if (visited.has(node) || level > depth) continue;
            visited.add(node);
            results.push(node);
            for (let neighbor of this.graph.get(node)) {
                if (!visited.has(neighbor)) {
                    queue.push({ node: neighbor, level: level + 1 });
                }
            }
        }
        return results;
    };

    // Pattern recognition: Find the shortest path between two concepts
    this.findShortestPath = function (start, end) {
        if (!this.graph.has(start) || !this.graph.has(end)) return null;
        const queue = [{ node: start, path: [start] }];
        const visited = new Set();

        while (queue.length > 0) {
            const { node, path } = queue.shift();
            if (node === end) return path;
            if (visited.has(node)) continue;
            visited.add(node);
            for (let neighbor of this.graph.get(node)) {
                if (!visited.has(neighbor)) {
                    queue.push({ node: neighbor, path: [...path, neighbor] });
                }
            }
        }
        return null; // No path found
    };
}

// Test cases
const kg = new KnowledgeGraph();

// Add concepts and their associations
kg.addConcept("Fractals", ["Mathematics", "Nature"]);
kg.addConcept("Mathematics", ["Geometry", "Algebra"]);
kg.addConcept("Nature", ["Ecology", "Physics"]);
kg.addConcept("Physics", ["Quantum Mechanics", "Relativity"]);
kg.addConcept("Ecology", ["Environment", "Sustainability"]);

// Test retrieval with depth
console.log("Related to 'Mathematics' (depth 1):", kg.retrieveRelated("Mathematics", 1));
console.log("Related to 'Mathematics' (depth 2):", kg.retrieveRelated("Mathematics", 2));
console.log("Related to 'Fractals' (depth 3):", kg.retrieveRelated("Fractals", 3));

// Test shortest path
console.log("Shortest path between 'Fractals' and 'Relativity':", kg.findShortestPath("Fractals", "Relativity"));
console.log("Shortest path between 'Nature' and 'Environment':", kg.findShortestPath("Nature", "Environment"));
console.log("Shortest path between 'Fractals' and 'Nonexistent':", kg.findShortestPath("Fractals", "Nonexistent"));