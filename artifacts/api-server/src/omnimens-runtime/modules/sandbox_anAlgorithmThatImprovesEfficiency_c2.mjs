/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-24T02:58:00.003Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function createKnowledgeGraph() {
    return {
        nodes: new Map(),
        addNode: function (id, data) {
            if (!this.nodes.has(id)) {
                this.nodes.set(id, { data: data, edges: new Map() });
            }
        },
        addEdge: function (from, to, weight = 1) {
            if (this.nodes.has(from) && this.nodes.has(to)) {
                this.nodes.get(from).edges.set(to, weight);
            }
        },
        shortestPath: function (start, end) {
            if (!this.nodes.has(start) || !this.nodes.has(end)) return null;

            const distances = new Map();
            const previous = new Map();
            const unvisited = new Set(this.nodes.keys());

            this.nodes.forEach((_, node) => {
                distances.set(node, Infinity);
                previous.set(node, null);
            });
            distances.set(start, 0);

            while (unvisited.size > 0) {
                let current = null;
                unvisited.forEach((node) => {
                    if (current === null || distances.get(node) < distances.get(current)) {
                        current = node;
                    }
                });

                if (distances.get(current) === Infinity) break;
                if (current === end) break;

                unvisited.delete(current);

                const currentNode = this.nodes.get(current);
                currentNode.edges.forEach((weight, neighbor) => {
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
            let step = end;
            while (step !== null) {
                path.unshift(step);
                step = previous.get(step);
            }

            return path.length > 1 ? path : null;
        },
        findPatterns: function (patternFunc) {
            const results = [];
            this.nodes.forEach((nodeData, nodeId) => {
                if (patternFunc(nodeId, nodeData.data)) {
                    results.push({ id: nodeId, data: nodeData.data });
                }
            });
            return results;
        }
    };
}

// Test cases
function runTests() {
    const graph = createKnowledgeGraph();

    // Add nodes
    graph.addNode("A", { type: "concept", value: "Alpha" });
    graph.addNode("B", { type: "concept", value: "Beta" });
    graph.addNode("C", { type: "concept", value: "Gamma" });
    graph.addNode("D", { type: "concept", value: "Delta" });

    // Add edges
    graph.addEdge("A", "B", 1);
    graph.addEdge("B", "C", 2);
    graph.addEdge("A", "C", 2);
    graph.addEdge("C", "D", 1);

    // Test shortest path
    console.log("Shortest Path A to D:", graph.shortestPath("A", "D")); // Expected: ["A", "C", "D"]
    console.log("Shortest Path B to D:", graph.shortestPath("B", "D")); // Expected: ["B", "C", "D"]
    console.log("Shortest Path A to X:", graph.shortestPath("A", "X")); // Expected: null

    // Test pattern recognition
    const patternResults = graph.findPatterns((id, data) => data.type === "concept" && data.value.startsWith("G"));
    console.log("Pattern Recognition Results:", patternResults); // Expected: [{ id: "C", data: { type: "concept", value: "Gamma" } }]
}

runTests();