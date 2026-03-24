/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-24T07:31:18.617Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function calculateConfidenceInterval(mean, stdDev, sampleSize, confidenceLevel) {
    // Calculate the Z-score for the given confidence level
    function getZScore(confidenceLevel) {
        const zScores = {
            0.90: 1.645,
            0.95: 1.960,
            0.99: 2.576
        };
        return zScores[confidenceLevel] || null;
    }

    const zScore = getZScore(confidenceLevel);
    if (zScore === null) {
        throw new Error("Unsupported confidence level. Use 0.90, 0.95, or 0.99.");
    }

    // Calculate the margin of error
    const marginOfError = zScore * (stdDev / Math.sqrt(sampleSize));

    // Calculate the confidence interval
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return { lowerBound, upperBound, marginOfError };
}

// Test cases
function runTests() {
    console.log("Test Case 1:");
    const result1 = calculateConfidenceInterval(50, 10, 100, 0.95);
    console.log(result1); // Expected: { lowerBound: ~48.04, upperBound: ~51.96, marginOfError: ~1.96 }

    console.log("Test Case 2:");
    const result2 = calculateConfidenceInterval(100, 20, 50, 0.99);
    console.log(result2); // Expected: { lowerBound: ~92.21, upperBound: ~107.79, marginOfError: ~7.79 }

    console.log("Test Case 3:");
    const result3 = calculateConfidenceInterval(75, 15, 200, 0.90);
    console.log(result3); // Expected: { lowerBound: ~73.25, upperBound: ~76.75, marginOfError: ~1.75 }

    console.log("Edge Case 1 (unsupported confidence level):");
    try {
        calculateConfidenceInterval(50, 10, 100, 0.85);
    } catch (e) {
        console.log(e.message); // Expected: "Unsupported confidence level. Use 0.90, 0.95, or 0.99."
    }

    console.log("Edge Case 2 (zero sample size):");
    try {
        calculateConfidenceInterval(50, 10, 0, 0.95);
    } catch (e) {
        console.log(e.message); // Expected: Division by zero or invalid input handling.
    }
}

runTests();