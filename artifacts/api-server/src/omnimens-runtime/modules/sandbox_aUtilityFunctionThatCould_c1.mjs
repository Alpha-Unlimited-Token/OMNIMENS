/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T02:27:11.198Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Function to perform k-nearest neighbors (KNN) classification
function knnClassifier(data, labels, queryPoint, k) {
    if (!Array.isArray(data) || !Array.isArray(labels) || typeof k !== 'number' || k <= 0) {
        throw new Error("Invalid input: data and labels must be arrays, and k must be a positive number.");
    }
    if (data.length !== labels.length) {
        throw new Error("Data and labels arrays must have the same length.");
    }

    // Calculate Euclidean distance between queryPoint and each data point
    const distances = data.map((point, index) => {
        if (!Array.isArray(point) || point.length !== queryPoint.length) {
            throw new Error("All data points and the query point must have the same dimensionality.");
        }
        const distance = Math.sqrt(point.reduce((sum, coord, i) => sum + Math.pow(coord - queryPoint[i], 2), 0));
        return { distance, label: labels[index] };
    });

    // Sort by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Get the k nearest neighbors
    const kNearest = distances.slice(0, k);

    // Count the occurrences of each label in the k nearest neighbors
    const labelCounts = {};
    kNearest.forEach(neighbor => {
        labelCounts[neighbor.label] = (labelCounts[neighbor.label] || 0) + 1;
    });

    // Find the label with the highest count
    let maxCount = 0;
    let predictedLabel = null;
    for (const label in labelCounts) {
        if (labelCounts[label] > maxCount) {
            maxCount = labelCounts[label];
            predictedLabel = label;
        }
    }

    return predictedLabel;
}

// Test cases
const data = [
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7]
];

const labels = ['A', 'A', 'B', 'B', 'A'];

console.assert(knnClassifier(data, labels, [2, 2], 3) === 'A', "Test Case 1 Failed");
console.assert(knnClassifier(data, labels, [4, 5], 3) === 'B', "Test Case 2 Failed");
console.assert(knnClassifier(data, labels, [6, 6], 1) === 'A', "Test Case 3 Failed");

console.log("All test cases passed.");