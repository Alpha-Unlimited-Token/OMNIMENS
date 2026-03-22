/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T21:14:25.438Z
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

KnowledgeGraph.prototype.addNode = function (node) {
    if (!this.nodes.has(node)) {
        this.nodes.set(node, []);
    }
};

KnowledgeGraph.prototype.addEdge = function (node1, node2, weight) {
    this.addNode(node1);
    this.addNode(node2);

    this.edges.set(node1 + "_" + node2, weight);
    this.nodes.get(node1).push({ node: node2, weight: weight });
    this.nodes.get(node2).push({ node: node1, weight: weight });
};

KnowledgeGraph.prototype.retrieveMostRelevant = function (startNode, relevanceThreshold) {
    let visited = new Set();
    let results = [];
    let queue = [{ node: startNode, relevance: 1 }];

    while (queue.length > 0) {
        let current = queue.shift();
        let node = current.node;
        let relevance = current.relevance;

        if (visited.has(node)) continue;
        visited.add(node);

        if (relevance >= relevanceThreshold) {
            results.push(node);
        }

        let neighbors = this.nodes.get(node) || [];
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor.node)) {
                queue.push({
                    node: neighbor.node,
                    relevance: relevance * neighbor.weight,
                });
            }
        }
    }

    return results;
};

// Self-tests
function runTests() {
    let graph = new KnowledgeGraph();

    // Adding nodes and edges
    graph.addEdge("A", "B", 0.8);
    graph.addEdge("A", "C", 0.6);
    graph.addEdge("B", "D", 0.9);
    graph.addEdge("C", "E", 0.7);
    graph.addEdge("D", "F", 0.5);
    graph.addEdge("E", "F", 0.4);

    console.log("Graph nodes:", Array.from(graph.nodes.keys()));
    console.log("Graph edges:", Array.from(graph.edges.entries()));

    // Test 1: Retrieve nodes with relevance threshold 0.5 starting from A
    let result1 = graph.retrieveMostRelevant("A", 0.5);
    console.log("Test 1 - Relevant nodes from A (threshold 0.5):", result1);

    // Test 2: Retrieve nodes with relevance threshold 0.7 starting from A
    let result2 = graph.retrieveMostRelevant("A", 0.7);
    console.log("Test 2 - Relevant nodes from A (threshold 0.7):", result2);

    // Test 3: Retrieve nodes with relevance threshold 0.9 starting from B
    let result3 = graph.retrieveMostRelevant("B", 0.9);
    console.log("Test 3 - Relevant nodes from B (threshold 0.9):", result3);

    // Edge case: Node not in graph
    let result4 = graph.retrieveMostRelevant("Z", 0.5);
    console.log("Test 4 - Relevant nodes from Z (threshold 0.5):", result4);

    // Edge case: Threshold too high
    let result5 = graph.retrieveMostRelevant("A", 1.5);
    console.log("Test 5 - Relevant nodes from A (threshold 1.5):", result5);
}

runTests();