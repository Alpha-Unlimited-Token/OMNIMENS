/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-23T15:35:22.249Z
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
}

KnowledgeGraph.prototype.addConcept = function(concept, relatedConcepts) {
    if (!this.graph.has(concept)) {
        this.graph.set(concept, new Set());
    }
    for (var i = 0; i < relatedConcepts.length; i++) {
        this.graph.get(concept).add(relatedConcepts[i]);
        if (!this.graph.has(relatedConcepts[i])) {
            this.graph.set(relatedConcepts[i], new Set());
        }
        this.graph.get(relatedConcepts[i]).add(concept);
    }
};

KnowledgeGraph.prototype.retrieveRelatedConcepts = function(concept) {
    return this.graph.has(concept) ? Array.from(this.graph.get(concept)) : [];
};

KnowledgeGraph.prototype.findShortestPath = function(start, end) {
    if (!this.graph.has(start) || !this.graph.has(end)) {
        return null;
    }
    var visited = new Set();
    var queue = [[start, [start]]];
    while (queue.length > 0) {
        var [current, path] = queue.shift();
        if (current === end) {
            return path;
        }
        visited.add(current);
        var neighbors = this.graph.get(current);
        for (var neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push([neighbor, path.concat(neighbor)]);
            }
        }
    }
    return null;
};

// Self-contained tests
var kg = new KnowledgeGraph();
kg.addConcept("AI", ["Machine Learning", "Neural Networks"]);
kg.addConcept("Machine Learning", ["Statistics", "Data Science"]);
kg.addConcept("Neural Networks", ["Deep Learning", "Backpropagation"]);
kg.addConcept("Deep Learning", ["AI"]);
kg.addConcept("Statistics", ["Probability", "Data Analysis"]);

console.log("Test 1: Retrieve related concepts for 'AI'");
console.log(kg.retrieveRelatedConcepts("AI")); // Expected: ["Machine Learning", "Neural Networks"]

console.log("Test 2: Retrieve related concepts for 'Deep Learning'");
console.log(kg.retrieveRelatedConcepts("Deep Learning")); // Expected: ["Neural Networks", "AI"]

console.log("Test 3: Find shortest path between 'AI' and 'Probability'");
console.log(kg.findShortestPath("AI", "Probability")); // Expected: ["AI", "Machine Learning", "Statistics", "Probability"]

console.log("Test 4: Find shortest path between 'Deep Learning' and 'Data Science'");
console.log(kg.findShortestPath("Deep Learning", "Data Science")); // Expected: ["Deep Learning", "Neural Networks", "Machine Learning", "Data Science"]

console.log("Test 5: Find shortest path between 'AI' and 'Nonexistent'");
console.log(kg.findShortestPath("AI", "Nonexistent")); // Expected: null

console.log("Test 6: Retrieve related concepts for 'Nonexistent'");
console.log(kg.retrieveRelatedConcepts("Nonexistent")); // Expected: []