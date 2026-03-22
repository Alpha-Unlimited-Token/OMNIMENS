/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-21T20:22:45.461Z
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
            visited.add(current);

            graph.get(current).forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    queue.push([neighbor, path.concat(neighbor)]);
                }
            });
        }
        return null;
    }

    function findMostConnectedConcept() {
        let maxConnections = 0;
        let mostConnected = null;

        graph.forEach((connections, concept) => {
            if (connections.size > maxConnections) {
                maxConnections = connections.size;
                mostConnected = concept;
            }
        });

        return mostConnected;
    }

    return { addConcept, findShortestPath, findMostConnectedConcept };
}

// Test cases
const knowledgeGraph = createKnowledgeGraph();

// Adding concepts and relationships
knowledgeGraph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
knowledgeGraph.addConcept("Machine Learning", ["Deep Learning", "Data Science"]);
knowledgeGraph.addConcept("Neural Networks", ["Deep Learning", "Cognitive Science"]);
knowledgeGraph.addConcept("Deep Learning", ["Computer Vision", "Natural Language Processing"]);
knowledgeGraph.addConcept("Data Science", ["Statistics", "Big Data"]);
knowledgeGraph.addConcept("Cognitive Science", ["Psychology", "Philosophy"]);

// Test: Find shortest path
console.log("Shortest Path (AI -> Big Data):", knowledgeGraph.findShortestPath("AI", "Big Data")); // Expected: ["AI", "Machine Learning", "Data Science", "Big Data"]

// Test: Find most connected concept
console.log("Most Connected Concept:", knowledgeGraph.findMostConnectedConcept()); // Expected: "Deep Learning" or another concept with max connections

// Edge case: Non-existent concepts
console.log("Shortest Path (AI -> Quantum Computing):", knowledgeGraph.findShortestPath("AI", "Quantum Computing")); // Expected: null