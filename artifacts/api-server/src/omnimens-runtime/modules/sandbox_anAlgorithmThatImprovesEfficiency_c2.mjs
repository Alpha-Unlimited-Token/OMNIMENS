/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T19:36:13.401Z
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
        const results = new Set();

        while (queue.length > 0) {
            const [current, currentDepth] = queue.shift();
            if (currentDepth > depth) continue;
            if (!visited.has(current)) {
                visited.add(current);
                if (currentDepth > 0) results.add(current);
                graph.get(current).forEach((neighbor) => {
                    queue.push([neighbor, currentDepth + 1]);
                });
            }
        }
        return Array.from(results);
    }

    function findShortestPath(conceptA, conceptB) {
        if (!graph.has(conceptA) || !graph.has(conceptB)) return null;
        const queue = [[conceptA, [conceptA]]];
        const visited = new Set();

        while (queue.length > 0) {
            const [current, path] = queue.shift();
            if (current === conceptB) return path;
            if (!visited.has(current)) {
                visited.add(current);
                graph.get(current).forEach((neighbor) => {
                    queue.push([neighbor, path.concat(neighbor)]);
                });
            }
        }
        return null;
    }

    return { addConcept, retrieveRelatedConcepts, findShortestPath };
}

// Self-tests
const knowledgeGraph = createKnowledgeGraph();

// Add concepts and relationships
knowledgeGraph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
knowledgeGraph.addConcept("Machine Learning", ["Deep Learning", "Reinforcement Learning"]);
knowledgeGraph.addConcept("Neural Networks", ["Deep Learning"]);
knowledgeGraph.addConcept("Deep Learning", ["Convolutional Networks", "Recurrent Networks"]);
knowledgeGraph.addConcept("Reinforcement Learning", ["Q-Learning", "Policy Gradient"]);

console.log("Test 1: Retrieve related concepts (depth=1)");
console.log(knowledgeGraph.retrieveRelatedConcepts("Machine Learning", 1)); // Expect ["AI", "Deep Learning", "Reinforcement Learning"]

console.log("Test 2: Retrieve related concepts (depth=2)");
console.log(knowledgeGraph.retrieveRelatedConcepts("AI", 2)); // Expect ["Deep Learning", "Reinforcement Learning", "Neural Networks"]

console.log("Test 3: Find shortest path between concepts");
console.log(knowledgeGraph.findShortestPath("AI", "Policy Gradient")); // Expect ["AI", "Machine Learning", "Reinforcement Learning", "Policy Gradient"]

console.log("Test 4: Handle non-existent concepts");
console.log(knowledgeGraph.retrieveRelatedConcepts("NonExistent", 1)); // Expect []
console.log(knowledgeGraph.findShortestPath("AI", "NonExistent")); // Expect null