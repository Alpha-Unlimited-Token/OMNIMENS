/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T08:28:50.286Z
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

    function addConcept(concept, relatedConcepts) {
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

    function findShortestPath(start, end) {
        if (!graph.has(start) || !graph.has(end)) {
            return null;
        }

        const visited = new Set();
        const queue = [[start, [start]]];

        while (queue.length > 0) {
            const [current, path] = queue.shift();

            if (current === end) {
                return path;
            }

            if (!visited.has(current)) {
                visited.add(current);
                graph.get(current).forEach((neighbor) => {
                    if (!visited.has(neighbor)) {
                        queue.push([neighbor, path.concat(neighbor)]);
                    }
                });
            }
        }

        return null;
    }

    function suggestRelatedConcepts(concept) {
        if (!graph.has(concept)) {
            return [];
        }

        const suggestions = new Set();
        graph.get(concept).forEach((neighbor) => {
            graph.get(neighbor).forEach((related) => {
                if (related !== concept && !graph.get(concept).has(related)) {
                    suggestions.add(related);
                }
            });
        });

        return Array.from(suggestions);
    }

    return {
        addConcept,
        findShortestPath,
        suggestRelatedConcepts,
    };
}

// Self-contained tests
const knowledgeGraph = createKnowledgeGraph();

// Adding concepts and relationships
knowledgeGraph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
knowledgeGraph.addConcept("Machine Learning", ["Deep Learning", "Data Science"]);
knowledgeGraph.addConcept("Neural Networks", ["Deep Learning", "Computer Vision"]);
knowledgeGraph.addConcept("Data Science", ["Big Data", "Statistics"]);
knowledgeGraph.addConcept("Deep Learning", ["Reinforcement Learning"]);

// Test 1: Shortest path between two concepts
console.log(
    "Test 1 - Shortest Path (AI to Statistics):",
    knowledgeGraph.findShortestPath("AI", "Statistics")
); // Expected: ["AI", "Machine Learning", "Data Science", "Statistics"]

// Test 2: Suggest related concepts for a given concept
console.log(
    "Test 2 - Related Concepts (AI):",
    knowledgeGraph.suggestRelatedConcepts("AI")
); // Expected: ["Deep Learning", "Data Science", "Computer Vision", "Big Data", "Statistics"]

// Test 3: Shortest path for non-existent concept
console.log(
    "Test 3 - Shortest Path (AI to Quantum Computing):",
    knowledgeGraph.findShortestPath("AI", "Quantum Computing")
); // Expected: null

// Test 4: Suggest related concepts for a non-existent concept
console.log(
    "Test 4 - Related Concepts (Quantum Computing):",
    knowledgeGraph.suggestRelatedConcepts("Quantum Computing")
); // Expected: []