/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T18:43:04.707Z
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

KnowledgeGraph.prototype.addNode = function (id, data) {
    if (!this.nodes.has(id)) {
        this.nodes.set(id, { id: id, data: data, edges: new Set() });
    }
};

KnowledgeGraph.prototype.addEdge = function (id1, id2) {
    if (this.nodes.has(id1) && this.nodes.has(id2)) {
        this.nodes.get(id1).edges.add(id2);
        this.nodes.get(id2).edges.add(id1);
    }
};

KnowledgeGraph.prototype.retrieveRelatedNodes = function (id, depth) {
    if (!this.nodes.has(id)) {
        return [];
    }

    let visited = new Set();
    let queue = [{ node: id, level: 0 }];
    let result = [];

    while (queue.length > 0) {
        let current = queue.shift();
        if (current.level > depth) {
            break;
        }

        if (!visited.has(current.node)) {
            visited.add(current.node);
            result.push(this.nodes.get(current.node).data);

            this.nodes.get(current.node).edges.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    queue.push({ node: neighbor, level: current.level + 1 });
                }
            });
        }
    }

    return result;
};

// Self-tests
function runTests() {
    let graph = new KnowledgeGraph();

    // Add nodes
    graph.addNode("A", "Alpha");
    graph.addNode("B", "Beta");
    graph.addNode("C", "Gamma");
    graph.addNode("D", "Delta");
    graph.addNode("E", "Epsilon");

    // Add edges
    graph.addEdge("A", "B");
    graph.addEdge("A", "C");
    graph.addEdge("B", "D");
    graph.addEdge("C", "E");

    // Test retrieval
    console.log(graph.retrieveRelatedNodes("A", 1)); // Should return ["Alpha", "Beta", "Gamma"]
    console.log(graph.retrieveRelatedNodes("A", 2)); // Should return ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
    console.log(graph.retrieveRelatedNodes("B", 1)); // Should return ["Beta", "Alpha", "Delta"]
    console.log(graph.retrieveRelatedNodes("Z", 2)); // Should return [] (non-existent node)
}

runTests();