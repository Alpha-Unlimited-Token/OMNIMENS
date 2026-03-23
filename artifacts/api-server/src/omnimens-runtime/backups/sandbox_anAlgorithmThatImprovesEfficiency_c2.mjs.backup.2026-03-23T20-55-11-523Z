/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-23T16:06:58.514Z
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

KnowledgeGraph.prototype.addNode = function (key, data) {
    if (!this.nodes.has(key)) {
        this.nodes.set(key, { data: data, edges: new Map() });
    }
};

KnowledgeGraph.prototype.addEdge = function (fromKey, toKey, weight) {
    if (this.nodes.has(fromKey) && this.nodes.has(toKey)) {
        this.nodes.get(fromKey).edges.set(toKey, weight || 1);
    }
};

KnowledgeGraph.prototype.retrieveRelatedNodes = function (key, threshold) {
    if (!this.nodes.has(key)) return [];
    const results = [];
    const visited = new Set();
    const queue = [{ node: key, score: 1 }];

    while (queue.length > 0) {
        const { node, score } = queue.shift();
        if (visited.has(node)) continue;
        visited.add(node);

        if (node !== key && score >= threshold) {
            results.push({ node, score });
        }

        const edges = this.nodes.get(node).edges;
        for (const [neighbor, weight] of edges) {
            if (!visited.has(neighbor)) {
                queue.push({ node: neighbor, score: score * weight });
            }
        }
    }

    return results.sort((a, b) => b.score - a.score);
};

KnowledgeGraph.prototype.patternMatch = function (pattern) {
    const regex = new RegExp(pattern, "i");
    const matches = [];
    for (const [key, value] of this.nodes) {
        if (regex.test(key) || regex.test(JSON.stringify(value.data))) {
            matches.push({ key, data: value.data });
        }
    }
    return matches;
};

// Self-tests
const graph = new KnowledgeGraph();

// Add nodes
graph.addNode("AI", { description: "Artificial Intelligence" });
graph.addNode("ML", { description: "Machine Learning" });
graph.addNode("DL", { description: "Deep Learning" });
graph.addNode("NLP", { description: "Natural Language Processing" });
graph.addNode("CV", { description: "Computer Vision" });

// Add edges with weights
graph.addEdge("AI", "ML", 0.9);
graph.addEdge("ML", "DL", 0.8);
graph.addEdge("DL", "CV", 0.7);
graph.addEdge("AI", "NLP", 0.85);

// Test retrieveRelatedNodes
console.log("Related to 'AI' with threshold 0.5:");
console.log(graph.retrieveRelatedNodes("AI", 0.5));

// Test patternMatch
console.log("Nodes matching 'Learning':");
console.log(graph.patternMatch("Learning"));

// Test edge case: No related nodes
console.log("Related to 'CV' with threshold 0.9:");
console.log(graph.retrieveRelatedNodes("CV", 0.9));

// Test edge case: No pattern match
console.log("Nodes matching 'Quantum':");
console.log(graph.patternMatch("Quantum"));