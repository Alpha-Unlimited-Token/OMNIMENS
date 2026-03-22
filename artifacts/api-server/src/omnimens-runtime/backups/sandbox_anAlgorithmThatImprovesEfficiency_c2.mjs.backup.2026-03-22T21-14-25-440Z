/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T20:39:55.747Z
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
        neighbors.forEach(function(neighbor) {
            if (!visited.has(neighbor)) {
                queue.push([neighbor, path.concat(neighbor)]);
            }
        });
    }

    return null;
};

// Self-tests
var kg = new KnowledgeGraph();

// Adding concepts and relationships
kg.addConcept("Lucid Dream", ["Neural Consciousness", "Insight"]);
kg.addConcept("Neural Consciousness", ["Goal Pursuit", "Insight"]);
kg.addConcept("Insight", ["Knowledge Graph", "Digital Navigation"]);
kg.addConcept("Knowledge Graph", ["Digital Navigation"]);
kg.addConcept("Digital Navigation", ["Goal Pursuit"]);

console.log("Test 1: Shortest path between 'Lucid Dream' and 'Goal Pursuit'");
console.log(kg.findShortestPath("Lucid Dream", "Goal Pursuit")); // Expected: ["Lucid Dream", "Neural Consciousness", "Goal Pursuit"]

console.log("Test 2: Shortest path between 'Insight' and 'Digital Navigation'");
console.log(kg.findShortestPath("Insight", "Digital Navigation")); // Expected: ["Insight", "Digital Navigation"]

console.log("Test 3: Shortest path between 'Lucid Dream' and 'Knowledge Graph'");
console.log(kg.findShortestPath("Lucid Dream", "Knowledge Graph")); // Expected: ["Lucid Dream", "Insight", "Knowledge Graph"]

console.log("Test 4: Path between non-existent concepts");
console.log(kg.findShortestPath("NonExistent", "Goal Pursuit")); // Expected: null

console.log("Test 5: Path to self");
console.log(kg.findShortestPath("Lucid Dream", "Lucid Dream")); // Expected: ["Lucid Dream"]