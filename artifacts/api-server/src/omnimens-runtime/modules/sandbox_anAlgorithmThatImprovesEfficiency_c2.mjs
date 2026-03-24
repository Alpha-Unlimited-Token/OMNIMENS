/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-24T12:57:20.576Z
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
            graph.get(concept).add(related);
            if (!graph.has(related)) {
                graph.set(related, new Set());
            }
            graph.get(related).add(concept);
        });
    }

    function findRelatedConcepts(concept) {
        return graph.has(concept) ? Array.from(graph.get(concept)) : [];
    }

    function findShortestPath(start, end, visited = new Set()) {
        if (start === end) return [start];
        if (!graph.has(start) || !graph.has(end)) return null;

        visited.add(start);
        const queue = [[start]];

        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];

            if (node === end) return path;

            graph.get(node).forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            });
        }
        return null;
    }

    return { addConcept, findRelatedConcepts, findShortestPath };
}

// Test cases
const knowledgeGraph = createKnowledgeGraph();

// Adding concepts and relationships
knowledgeGraph.addConcept("Artificial Intelligence", ["Machine Learning", "Deep Learning"]);
knowledgeGraph.addConcept("Machine Learning", ["Neural Networks", "Data Science"]);
knowledgeGraph.addConcept("Deep Learning", ["Neural Networks", "Computer Vision"]);
knowledgeGraph.addConcept("Computer Vision", ["Image Processing", "Pattern Recognition"]);
knowledgeGraph.addConcept("Pattern Recognition", ["Data Science"]);

// Test 1: Find related concepts
console.log("Related to 'Machine Learning':", knowledgeGraph.findRelatedConcepts("Machine Learning")); 
// Expected: ["Artificial Intelligence", "Neural Networks", "Data Science"]

// Test 2: Find shortest path between concepts
console.log("Shortest path from 'Artificial Intelligence' to 'Pattern Recognition':", knowledgeGraph.findShortestPath("Artificial Intelligence", "Pattern Recognition")); 
// Expected: ["Artificial Intelligence", "Machine Learning", "Data Science", "Pattern Recognition"]

// Test 3: Edge case - Concept not in graph
console.log("Related to 'Quantum Computing':", knowledgeGraph.findRelatedConcepts("Quantum Computing")); 
// Expected: []

// Test 4: Edge case - Path between unrelated concepts
console.log("Shortest path from 'Artificial Intelligence' to 'Quantum Computing':", knowledgeGraph.findShortestPath("Artificial Intelligence", "Quantum Computing")); 
// Expected: null