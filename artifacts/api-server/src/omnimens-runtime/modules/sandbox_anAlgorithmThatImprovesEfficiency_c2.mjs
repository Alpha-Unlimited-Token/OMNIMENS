/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T12:29:04.427Z
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
    this.graph = {};
}

KnowledgeGraph.prototype.addConcept = function(concept, relatedConcepts) {
    if (!this.graph[concept]) {
        this.graph[concept] = new Set();
    }
    for (var i = 0; i < relatedConcepts.length; i++) {
        this.graph[concept].add(relatedConcepts[i]);
        if (!this.graph[relatedConcepts[i]]) {
            this.graph[relatedConcepts[i]] = new Set();
        }
        this.graph[relatedConcepts[i]].add(concept);
    }
};

KnowledgeGraph.prototype.findRelatedConcepts = function(concept, depth) {
    var visited = new Set();
    var queue = [{ concept: concept, level: 0 }];
    var results = new Set();

    while (queue.length > 0) {
        var current = queue.shift();
        if (current.level > depth) {
            continue;
        }
        if (!visited.has(current.concept)) {
            visited.add(current.concept);
            results.add(current.concept);
            var neighbors = this.graph[current.concept] || new Set();
            neighbors.forEach(function(neighbor) {
                queue.push({ concept: neighbor, level: current.level + 1 });
            });
        }
    }
    results.delete(concept);
    return Array.from(results);
};

// Self-tests
var kg = new KnowledgeGraph();

// Test case 1: Adding concepts and retrieving related concepts
kg.addConcept("AI", ["Machine Learning", "Neural Networks"]);
kg.addConcept("Machine Learning", ["Deep Learning", "Supervised Learning"]);
kg.addConcept("Neural Networks", ["Deep Learning", "Backpropagation"]);

console.log("Test case 1:");
console.log(kg.findRelatedConcepts("AI", 1)); // Expected: ["Machine Learning", "Neural Networks"]
console.log(kg.findRelatedConcepts("AI", 2)); // Expected: ["Machine Learning", "Neural Networks", "Deep Learning", "Supervised Learning", "Backpropagation"]

// Test case 2: Adding unrelated concepts
kg.addConcept("Physics", ["Quantum Mechanics", "Relativity"]);
kg.addConcept("Quantum Mechanics", ["Entanglement"]);

console.log("Test case 2:");
console.log(kg.findRelatedConcepts("Physics", 1)); // Expected: ["Quantum Mechanics", "Relativity"]
console.log(kg.findRelatedConcepts("Quantum Mechanics", 2)); // Expected: ["Physics", "Relativity", "Entanglement"]

// Test case 3: Edge case with no related concepts
console.log("Test case 3:");
console.log(kg.findRelatedConcepts("Unknown", 1)); // Expected: []

// Test case 4: Edge case with depth 0
console.log("Test case 4:");
console.log(kg.findRelatedConcepts("AI", 0)); // Expected: []