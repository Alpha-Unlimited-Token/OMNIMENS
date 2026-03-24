/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-23T02:58:21.878Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function calculateConfidenceInterval(mean, standardDeviation, sampleSize, confidenceLevel) {
    // Z-scores for common confidence levels
    const zScores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    };

    if (!zScores[confidenceLevel]) {
        throw new Error("Unsupported confidence level. Use 0.90, 0.95, or 0.99.");
    }

    const zScore = zScores[confidenceLevel];
    const marginOfError = zScore * (standardDeviation / Math.sqrt(sampleSize));
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return {
        lowerBound: lowerBound,
        upperBound: upperBound,
        marginOfError: marginOfError
    };
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Sample data
    const result1 = calculateConfidenceInterval(100, 15, 30, 0.95);
    console.log("Test 1:", result1);

    // Test 2: Edge case with small sample size
    const result2 = calculateConfidenceInterval(50, 10, 5, 0.90);
    console.log("Test 2:", result2);

    // Test 3: High confidence level
    const result3 = calculateConfidenceInterval(200, 25, 50, 0.99);
    console.log("Test 3:", result3);

    // Test 4: Unsupported confidence level
    try {
        calculateConfidenceInterval(100, 20, 40, 0.85);
    } catch (e) {
        console.log("Test 4 (expected error):", e.message);
    }

    console.log("Tests completed.");
}

runTests();