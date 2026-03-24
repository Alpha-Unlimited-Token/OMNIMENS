/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-23T23:58:20.737Z
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

    function findRelatedConcepts(concept, depth = 1) {
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

        return results.filter((c) => c !== concept);
    }

    function findPatterns(concepts) {
        const patterns = [];
        concepts.forEach((concept) => {
            const related = findRelatedConcepts(concept, 1);
            patterns.push({ concept, related });
        });
        return patterns;
    }

    return { addConcept, findRelatedConcepts, findPatterns };
}

// Self-tests
const knowledgeGraph = createKnowledgeGraph();

// Add concepts and relationships
knowledgeGraph.addConcept("Intelligence", ["Learning", "Pattern Recognition"]);
knowledgeGraph.addConcept("Learning", ["Memory", "Adaptation"]);
knowledgeGraph.addConcept("Pattern Recognition", ["Neural Networks", "Data Analysis"]);
knowledgeGraph.addConcept("Memory", ["Retention", "Recall"]);
knowledgeGraph.addConcept("Adaptation", ["Flexibility"]);
knowledgeGraph.addConcept("Neural Networks", ["Artificial Intelligence"]);
knowledgeGraph.addConcept("Data Analysis", ["Statistics", "Visualization"]);

// Test related concepts retrieval
console.log("Related concepts to 'Learning' (depth=1):", knowledgeGraph.findRelatedConcepts("Learning", 1));
console.log("Related concepts to 'Learning' (depth=2):", knowledgeGraph.findRelatedConcepts("Learning", 2));

// Test pattern recognition
console.log("Patterns for concepts ['Learning', 'Pattern Recognition']:", knowledgeGraph.findPatterns(["Learning", "Pattern Recognition"]));

// Edge case: Non-existent concept
console.log("Related concepts to 'Unknown':", knowledgeGraph.findRelatedConcepts("Unknown"));