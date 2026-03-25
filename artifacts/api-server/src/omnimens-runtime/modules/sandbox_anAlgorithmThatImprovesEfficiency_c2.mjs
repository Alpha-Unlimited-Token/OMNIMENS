/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-25T00:43:05.238Z
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
    this.edges = new Map();
}

KnowledgeGraph.prototype.addNode = function (id, data) {
    if (!this.nodes.has(id)) {
        this.nodes.set(id, data);
        this.edges.set(id, new Map());
    }
};

KnowledgeGraph.prototype.addEdge = function (from, to, weight) {
    if (this.nodes.has(from) && this.nodes.has(to)) {
        this.edges.get(from).set(to, weight);
    }
};

KnowledgeGraph.prototype.retrieve = function (query, similarityFn) {
    const results = [];
    this.nodes.forEach((data, id) => {
        const similarity = similarityFn(query, data);
        if (similarity > 0) {
            results.push({ id, data, similarity });
        }
    });
    results.sort((a, b) => b.similarity - a.similarity);
    return results;
};

KnowledgeGraph.prototype.shortestPath = function (start, end) {
    if (!this.nodes.has(start) || !this.nodes.has(end)) return null;

    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(this.nodes.keys());

    this.nodes.forEach((_, id) => {
        distances.set(id, Infinity);
    });
    distances.set(start, 0);

    while (unvisited.size > 0) {
        let current = null;
        unvisited.forEach((id) => {
            if (current === null || distances.get(id) < distances.get(current)) {
                current = id;
            }
        });

        if (current === end) break;

        unvisited.delete(current);

        this.edges.get(current).forEach((weight, neighbor) => {
            if (unvisited.has(neighbor)) {
                const alt = distances.get(current) + weight;
                if (alt < distances.get(neighbor)) {
                    distances.set(neighbor, alt);
                    previous.set(neighbor, current);
                }
            }
        });
    }

    const path = [];
    let current = end;
    while (previous.has(current)) {
        path.unshift(current);
        current = previous.get(current);
    }
    if (path.length > 0 && current === start) path.unshift(start);
    return path.length > 0 ? path : null;
};

// Test cases
const graph = new KnowledgeGraph();

// Adding nodes
graph.addNode("A", "Artificial Intelligence");
graph.addNode("B", "Machine Learning");
graph.addNode("C", "Deep Learning");
graph.addNode("D", "Neural Networks");

// Adding edges
graph.addEdge("A", "B", 1);
graph.addEdge("B", "C", 2);
graph.addEdge("C", "D", 3);
graph.addEdge("A", "D", 10);

// Similarity function
function similarity(query, data) {
    const queryWords = query.toLowerCase().split(" ");
    const dataWords = data.toLowerCase().split(" ");
    const matches = queryWords.filter((word) => dataWords.includes(word));
    return matches.length / queryWords.length;
}

// Test retrieval
console.log("Retrieval Test:");
console.log(graph.retrieve("Deep Learning", similarity));

// Test shortest path
console.log("Shortest Path Test:");
console.log(graph.shortestPath("A", "D"));