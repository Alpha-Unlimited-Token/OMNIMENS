/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T07:37:58.958Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function calculateClusteringCoefficient(graph) {
    // Function to calculate the clustering coefficient for a given graph
    // Graph is represented as an adjacency list (object with nodes as keys and arrays of neighbors as values)
    function getNodeClustering(node, neighbors) {
        if (neighbors.length < 2) return 0;

        let links = 0;
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
                if (graph[neighbors[i]].includes(neighbors[j])) {
                    links++;
                }
            }
        }

        const possibleLinks = (neighbors.length * (neighbors.length - 1)) / 2;
        return links / possibleLinks;
    }

    const clusteringCoefficients = {};
    for (const node in graph) {
        clusteringCoefficients[node] = getNodeClustering(node, graph[node]);
    }

    return clusteringCoefficients;
}

// Test cases
const testGraph1 = {
    A: ['B', 'C'],
    B: ['A', 'C', 'D'],
    C: ['A', 'B'],
    D: ['B']
};

const testGraph2 = {
    X: ['Y', 'Z'],
    Y: ['X'],
    Z: ['X']
};

const testGraph3 = {
    P: [],
    Q: ['R'],
    R: ['Q']
};

console.log("Test Graph 1 Clustering Coefficients:", calculateClusteringCoefficient(testGraph1));
console.log("Test Graph 2 Clustering Coefficients:", calculateClusteringCoefficient(testGraph2));
console.log("Test Graph 3 Clustering Coefficients:", calculateClusteringCoefficient(testGraph3));