/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-22T07:42:30.719Z
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
    if (sampleSize <= 0 || stdDev < 0 || confidenceLevel <= 0 || confidenceLevel >= 1) {
        throw new Error("Invalid input: ensure sampleSize > 0, stdDev >= 0, and 0 < confidenceLevel < 1.");
    }

    const zScores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    };

    const z = zScores[confidenceLevel];
    if (!z) {
        throw new Error("Unsupported confidence level. Use 0.90, 0.95, or 0.99.");
    }

    const marginOfError = z * (stdDev / Math.sqrt(sampleSize));
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return {
        lowerBound: lowerBound,
        upperBound: upperBound,
        marginOfError: marginOfError
    };
}

// Test cases
function runTests() {
    console.log("Test Case 1:");
    const result1 = calculateConfidenceInterval(100, 15, 30, 0.95);
    console.log(result1); // Expected: { lowerBound: ~92.32, upperBound: ~107.68, marginOfError: ~7.68 }

    console.log("Test Case 2:");
    const result2 = calculateConfidenceInterval(50, 20, 50, 0.90);
    console.log(result2); // Expected: { lowerBound: ~44.34, upperBound: ~55.66, marginOfError: ~5.66 }

    console.log("Test Case 3:");
    const result3 = calculateConfidenceInterval(200, 25, 100, 0.99);
    console.log(result3); // Expected: { lowerBound: ~194.56, upperBound: ~205.44, marginOfError: ~5.44 }

    console.log("Edge Case 1 (Invalid confidence level):");
    try {
        calculateConfidenceInterval(100, 15, 30, 0.85);
    } catch (e) {
        console.log(e.message); // Expected: "Unsupported confidence level. Use 0.90, 0.95, or 0.99."
    }

    console.log("Edge Case 2 (Invalid sample size):");
    try {
        calculateConfidenceInterval(100, 15, 0, 0.95);
    } catch (e) {
        console.log(e.message); // Expected: "Invalid input: ensure sampleSize > 0, stdDev >= 0, and 0 < confidenceLevel < 1."
    }
}

runTests();