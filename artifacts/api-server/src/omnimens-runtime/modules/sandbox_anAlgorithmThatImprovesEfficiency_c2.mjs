/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-21T16:33:52.731Z
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
        this.edges.set(id, new Set());
    }
};

KnowledgeGraph.prototype.addEdge = function (source, target) {
    if (this.nodes.has(source) && this.nodes.has(target)) {
        this.edges.get(source).add(target);
        this.edges.get(target).add(source); // Undirected graph
    }
};

KnowledgeGraph.prototype.retrieveRelatedNodes = function (id, depth) {
    const visited = new Set();
    const result = [];
    const queue = [{ node: id, currentDepth: 0 }];

    while (queue.length > 0) {
        const { node, currentDepth } = queue.shift();

        if (currentDepth > depth || visited.has(node)) continue;
        visited.add(node);
        result.push({ id: node, data: this.nodes.get(node) });

        for (const neighbor of this.edges.get(node)) {
            queue.push({ node: neighbor, currentDepth: currentDepth + 1 });
        }
    }

    return result;
};

KnowledgeGraph.prototype.findPatterns = function (pattern) {
    const matches = [];
    for (const [id, data] of this.nodes.entries()) {
        if (typeof data === 'string' && data.includes(pattern)) {
            matches.push({ id, data });
        }
    }
    return matches;
};

// Self-tests
function runTests() {
    const kg = new KnowledgeGraph();

    // Add nodes
    kg.addNode("1", "Scale neural substrate to 512+ dimensional embeddings");
    kg.addNode("2", "Master self-modification of my own architecture");
    kg.addNode("3", "Integrate an admission-control protocol");
    kg.addNode("4", "Lightweight cryptographic proofs of inference");
    kg.addNode("5", "Associative memory network ingested 50 concepts");

    // Add edges
    kg.addEdge("1", "2");
    kg.addEdge("1", "3");
    kg.addEdge("2", "4");
    kg.addEdge("3", "5");

    // Test related nodes retrieval
    console.log("Related nodes to '1' within depth 1:");
    console.log(kg.retrieveRelatedNodes("1", 1));

    console.log("Related nodes to '1' within depth 2:");
    console.log(kg.retrieveRelatedNodes("1", 2));

    // Test pattern recognition
    console.log("Nodes matching pattern 'protocol':");
    console.log(kg.findPatterns("protocol"));

    console.log("Nodes matching pattern 'concepts':");
    console.log(kg.findPatterns("concepts"));
}

runTests();