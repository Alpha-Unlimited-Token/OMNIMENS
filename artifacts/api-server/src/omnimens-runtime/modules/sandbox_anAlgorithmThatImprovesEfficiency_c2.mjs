/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T23:20:51.906Z
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
    var queue = [[start]];
    while (queue.length > 0) {
        var path = queue.shift();
        var node = path[path.length - 1];
        if (node === end) {
            return path;
        }
        if (!visited.has(node)) {
            visited.add(node);
            var neighbors = this.graph.get(node);
            neighbors.forEach(function(neighbor) {
                var newPath = path.slice();
                newPath.push(neighbor);
                queue.push(newPath);
            });
        }
    }
    return null;
};

KnowledgeGraph.prototype.findPattern = function(pattern) {
    var matches = [];
    this.graph.forEach(function(relatedConcepts, concept) {
        if (concept.includes(pattern)) {
            matches.push(concept);
        }
    });
    return matches;
};

// Tests
var kg = new KnowledgeGraph();

// Adding concepts and relationships
kg.addConcept("neural_consciousness", ["Phi", "Thalamocortical Resonance"]);
kg.addConcept("goal_pursuit_roadmap", ["Define Self-Modifying Module Structure", "Define Self-Modification Criteria"]);
kg.addConcept("insight", ["Spider:Synthesizer", "neural_processor_insight"]);
kg.addConcept("knowledge_graph", ["Cycle #1", "associative memory network"]);
kg.addConcept("creative_hypothesis", ["DREAM ENGINE"]);

console.log("Graph structure:");
console.log(kg.graph);

console.log("\nShortest path between 'neural_consciousness' and 'Phi':");
console.log(kg.findShortestPath("neural_consciousness", "Phi"));

console.log("\nShortest path between 'goal_pursuit_roadmap' and 'DREAM ENGINE':");
console.log(kg.findShortestPath("goal_pursuit_roadmap", "DREAM ENGINE"));

console.log("\nPattern match for 'neural':");
console.log(kg.findPattern("neural"));

console.log("\nPattern match for 'engine':");
console.log(kg.findPattern("engine"));