/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T06:54:29.009Z
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
    this.nodes = new Map();
}

KnowledgeGraph.prototype.addConcept = function(concept, relatedConcepts) {
    if (!this.nodes.has(concept)) {
        this.nodes.set(concept, new Set());
    }
    for (var i = 0; i < relatedConcepts.length; i++) {
        this.nodes.get(concept).add(relatedConcepts[i]);
        if (!this.nodes.has(relatedConcepts[i])) {
            this.nodes.set(relatedConcepts[i], new Set());
        }
        this.nodes.get(relatedConcepts[i]).add(concept);
    }
};

KnowledgeGraph.prototype.findShortestPath = function(start, end) {
    if (!this.nodes.has(start) || !this.nodes.has(end)) {
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
            var neighbors = this.nodes.get(node);
            neighbors.forEach(function(neighbor) {
                var newPath = path.slice();
                newPath.push(neighbor);
                queue.push(newPath);
            });
        }
    }
    return null;
};

KnowledgeGraph.prototype.patternMatch = function(concept, pattern) {
    if (!this.nodes.has(concept)) {
        return [];
    }
    var matches = [];
    var queue = [concept];
    var visited = new Set();
    
    while (queue.length > 0) {
        var node = queue.shift();
        if (visited.has(node)) {
            continue;
        }
        visited.add(node);
        if (pattern.test(node)) {
            matches.push(node);
        }
        var neighbors = this.nodes.get(node);
        neighbors.forEach(function(neighbor) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        });
    }
    return matches;
};

// Self-contained tests
var graph = new KnowledgeGraph();
graph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
graph.addConcept("Machine Learning", ["Deep Learning", "Supervised Learning"]);
graph.addConcept("Neural Networks", ["Deep Learning", "Backpropagation"]);
graph.addConcept("Deep Learning", ["TensorFlow", "PyTorch"]);
graph.addConcept("Supervised Learning", ["Classification", "Regression"]);

console.log("Test 1 - Shortest Path:");
console.log(graph.findShortestPath("AI", "PyTorch")); // Expected: ["AI", "Machine Learning", "Deep Learning", "PyTorch"]

console.log("Test 2 - Pattern Match:");
console.log(graph.patternMatch("AI", /Learning/)); // Expected: ["Machine Learning", "Supervised Learning", "Deep Learning"]