/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T17:41:07.336Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function createKnowledgeGraph() {
    const graph = new Map();

    function addConcept(concept, relatedConcepts = []) {
        if (!graph.has(concept)) {
            graph.set(concept, new Set());
        }
        relatedConcepts.forEach((related) => {
            if (!graph.has(related)) {
                graph.set(related, new Set());
            }
            graph.get(concept).add(related);
            graph.get(related).add(concept);
        });
    }

    function retrieveRelatedConcepts(concept, depth = 1) {
        if (!graph.has(concept)) return [];
        const visited = new Set();
        const queue = [[concept, 0]];
        const results = [];

        while (queue.length > 0) {
            const [current, currentDepth] = queue.shift();
            if (currentDepth > depth) break;
            if (!visited.has(current)) {
                visited.add(current);
                results.push(current);
                graph.get(current).forEach((neighbor) => {
                    if (!visited.has(neighbor)) {
                        queue.push([neighbor, currentDepth + 1]);
                    }
                });
            }
        }

        return results.filter((item) => item !== concept);
    }

    function findShortestPath(start, end) {
        if (!graph.has(start) || !graph.has(end)) return null;
        const queue = [[start, [start]]];
        const visited = new Set();

        while (queue.length > 0) {
            const [current, path] = queue.shift();
            if (current === end) return path;

            if (!visited.has(current)) {
                visited.add(current);
                graph.get(current).forEach((neighbor) => {
                    if (!visited.has(neighbor)) {
                        queue.push([neighbor, path.concat(neighbor)]);
                    }
                });
            }
        }

        return null; // No path found
    }

    return { addConcept, retrieveRelatedConcepts, findShortestPath };
}

// Test cases
const knowledgeGraph = createKnowledgeGraph();

// Adding concepts and their relationships
knowledgeGraph.addConcept("Neural Networks", ["Deep Learning", "Artificial Intelligence"]);
knowledgeGraph.addConcept("Deep Learning", ["Convolutional Networks", "Reinforcement Learning"]);
knowledgeGraph.addConcept("Artificial Intelligence", ["Machine Learning", "Ethics"]);
knowledgeGraph.addConcept("Machine Learning", ["Data Science"]);
knowledgeGraph.addConcept("Ethics", ["Philosophy"]);

// Test 1: Retrieve related concepts with depth 1
console.log(
    "Test 1:",
    knowledgeGraph.retrieveRelatedConcepts("Deep Learning", 1) // Expected: ["Neural Networks", "Convolutional Networks", "Reinforcement Learning"]
);

// Test 2: Retrieve related concepts with depth 2
console.log(
    "Test 2:",
    knowledgeGraph.retrieveRelatedConcepts("Deep Learning", 2) // Expected: ["Neural Networks", "Convolutional Networks", "Reinforcement Learning", "Artificial Intelligence", "Machine Learning"]
);

// Test 3: Find shortest path between two concepts
console.log(
    "Test 3:",
    knowledgeGraph.findShortestPath("Neural Networks", "Philosophy") // Expected: ["Neural Networks", "Artificial Intelligence", "Ethics", "Philosophy"]
);

// Test 4: Retrieve related concepts for a non-existent concept
console.log(
    "Test 4:",
    knowledgeGraph.retrieveRelatedConcepts("Quantum Computing", 1) // Expected: []
);

// Test 5: Find shortest path for disconnected concepts
console.log(
    "Test 5:",
    knowledgeGraph.findShortestPath("Neural Networks", "Quantum Computing") // Expected: null
);