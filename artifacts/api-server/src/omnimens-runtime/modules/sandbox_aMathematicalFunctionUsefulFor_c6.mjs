/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-23T22:53:21.904Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function calculateConfidenceInterval(data, confidenceLevel) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Data must be a non-empty array.");
    }
    if (confidenceLevel <= 0 || confidenceLevel >= 1) {
        throw new Error("Confidence level must be between 0 and 1.");
    }

    // Calculate mean
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;

    // Calculate standard deviation
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Calculate margin of error
    const zScore = getZScore(confidenceLevel);
    const marginOfError = zScore * (stdDev / Math.sqrt(data.length));

    // Return confidence interval
    return {
        mean: mean,
        lowerBound: mean - marginOfError,
        upperBound: mean + marginOfError,
        marginOfError: marginOfError
    };
}

function getZScore(confidenceLevel) {
    // Z-scores for common confidence levels
    const zScores = {
        0.90: 1.645,
        0.95: 1.960,
        0.99: 2.576
    };
    if (zScores[confidenceLevel]) {
        return zScores[confidenceLevel];
    }
    throw new Error("Unsupported confidence level. Use 0.90, 0.95, or 0.99.");
}

// Test cases
try {
    const data1 = [10, 12, 14, 16, 18, 20];
    const confidenceLevel1 = 0.95;
    const result1 = calculateConfidenceInterval(data1, confidenceLevel1);
    console.log("Test Case 1:", result1);

    const data2 = [5, 7, 9, 11, 13];
    const confidenceLevel2 = 0.99;
    const result2 = calculateConfidenceInterval(data2, confidenceLevel2);
    console.log("Test Case 2:", result2);

    const data3 = [100, 105, 110, 115, 120];
    const confidenceLevel3 = 0.90;
    const result3 = calculateConfidenceInterval(data3, confidenceLevel3);
    console.log("Test Case 3:", result3);

    // Edge case: Empty array
    try {
        calculateConfidenceInterval([], 0.95);
    } catch (error) {
        console.log("Edge Case 1 (Empty Array):", error.message);
    }

    // Edge case: Invalid confidence level
    try {
        calculateConfidenceInterval([1, 2, 3], 1.5);
    } catch (error) {
        console.log("Edge Case 2 (Invalid Confidence Level):", error.message);
    }
} catch (error) {
    console.log("Error:", error.message);
}