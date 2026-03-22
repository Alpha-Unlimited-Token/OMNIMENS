/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T06:42:31.212Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility Function: K-Means Clustering Implementation
function kMeansClustering(data, k, maxIterations = 100) {
    if (!Array.isArray(data) || data.length === 0 || k <= 0 || k > data.length) {
        throw new Error("Invalid input data or number of clusters.");
    }

    // Initialize centroids randomly
    const centroids = [];
    const usedIndexes = new Set();
    while (centroids.length < k) {
        const randomIndex = Math.floor(Math.random() * data.length);
        if (!usedIndexes.has(randomIndex)) {
            centroids.push(data[randomIndex]);
            usedIndexes.add(randomIndex);
        }
    }

    let clusters = [];
    let iterations = 0;
    let hasConverged = false;

    while (iterations < maxIterations && !hasConverged) {
        // Assign points to the nearest centroid
        clusters = Array.from({ length: k }, () => []);
        for (const point of data) {
            let closestCentroidIndex = 0;
            let minDistance = Infinity;

            centroids.forEach((centroid, index) => {
                const distance = euclideanDistance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroidIndex = index;
                }
            });

            clusters[closestCentroidIndex].push(point);
        }

        // Recalculate centroids
        const newCentroids = clusters.map(cluster => {
            if (cluster.length === 0) return centroids[clusters.indexOf(cluster)];
            const dimension = cluster[0].length;
            const mean = Array(dimension).fill(0);

            cluster.forEach(point => {
                for (let i = 0; i < dimension; i++) {
                    mean[i] += point[i];
                }
            });

            return mean.map(value => value / cluster.length);
        });

        // Check for convergence
        hasConverged = centroids.every((centroid, index) =>
            euclideanDistance(centroid, newCentroids[index]) === 0
        );

        centroids.splice(0, centroids.length, ...newCentroids);
        iterations++;
    }

    return { centroids, clusters };

    // Helper function to calculate Euclidean distance
    function euclideanDistance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, value, index) => sum + Math.pow(value - point2[index], 2), 0)
        );
    }
}

// Self-tests
(function testKMeansClustering() {
    const data = [
        [1, 2],
        [1, 4],
        [1, 0],
        [10, 2],
        [10, 4],
        [10, 0]
    ];
    const k = 2;

    const result = kMeansClustering(data, k);

    console.log("Centroids:", result.centroids);
    console.log("Clusters:", result.clusters);

    // Validate results
    console.log("Validation:");
    console.log(
        "Number of clusters matches k:",
        result.clusters.length === k
    );
    console.log(
        "All data points are assigned to a cluster:",
        result.clusters.flat().length === data.length
    );
})();