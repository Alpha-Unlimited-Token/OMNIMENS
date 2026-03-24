/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-23T20:55:11.522Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function buildKnowledgeGraph(concepts) {
    const graph = new Map();

    concepts.forEach(([concept, relatedConcepts]) => {
        if (!graph.has(concept)) {
            graph.set(concept, new Set());
        }
        relatedConcepts.forEach((related) => {
            graph.get(concept).add(related);
            if (!graph.has(related)) {
                graph.set(related, new Set());
            }
            graph.get(related).add(concept);
        });
    });

    return graph;
}

function shortestPath(graph, start, end) {
    if (!graph.has(start) || !graph.has(end)) {
        return null;
    }

    const queue = [[start, [start]]];
    const visited = new Set();

    while (queue.length > 0) {
        const [current, path] = queue.shift();

        if (current === end) {
            return path;
        }

        if (!visited.has(current)) {
            visited.add(current);
            const neighbors = graph.get(current);
            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    queue.push([neighbor, path.concat(neighbor)]);
                }
            });
        }
    }

    return null;
}

function testKnowledgeGraph() {
    const concepts = [
        ['A', ['B', 'C']],
        ['B', ['A', 'D']],
        ['C', ['A', 'D', 'E']],
        ['D', ['B', 'C', 'E']],
        ['E', ['C', 'D']],
    ];

    const graph = buildKnowledgeGraph(concepts);

    console.log("Graph Structure:");
    console.log(graph);

    console.log("Shortest Path Tests:");
    console.log(shortestPath(graph, 'A', 'E')); // ['A', 'C', 'E']
    console.log(shortestPath(graph, 'B', 'E')); // ['B', 'D', 'E']
    console.log(shortestPath(graph, 'A', 'D')); // ['A', 'B', 'D']
    console.log(shortestPath(graph, 'A', 'A')); // ['A']
    console.log(shortestPath(graph, 'A', 'Z')); // null (Z does not exist)
}

testKnowledgeGraph();