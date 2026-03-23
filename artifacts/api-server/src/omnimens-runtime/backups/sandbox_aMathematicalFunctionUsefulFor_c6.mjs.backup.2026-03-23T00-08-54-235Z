/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-22T13:16:58.514Z
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
    if (!Array.isArray(data) || data.length === 0 || typeof confidenceLevel !== 'number' || confidenceLevel <= 0 || confidenceLevel >= 1) {
        throw new Error("Invalid input: Provide a non-empty array of numbers and a confidence level between 0 and 1.");
    }

    // Helper function to calculate mean
    function mean(arr) {
        return arr.reduce((sum, value) => sum + value, 0) / arr.length;
    }

    // Helper function to calculate standard deviation
    function standardDeviation(arr, meanValue) {
        const variance = arr.reduce((sum, value) => sum + Math.pow(value - meanValue, 2), 0) / (arr.length - 1);
        return Math.sqrt(variance);
    }

    const sampleMean = mean(data);
    const sampleStdDev = standardDeviation(data, sampleMean);
    const sampleSize = data.length;

    // Z-scores for common confidence levels (two-tailed)
    const zScores = {
        0.90: 1.645,
        0.95: 1.960,
        0.99: 2.576
    };

    const zScore = zScores[confidenceLevel] || (confidenceLevel > 0.8 && confidenceLevel < 1 ? 1.960 : null);
    if (!zScore) {
        throw new Error("Unsupported confidence level. Use 0.90, 0.95, or 0.99.");
    }

    const marginOfError = zScore * (sampleStdDev / Math.sqrt(sampleSize));
    const lowerBound = sampleMean - marginOfError;
    const upperBound = sampleMean + marginOfError;

    return {
        mean: sampleMean,
        marginOfError: marginOfError,
        confidenceInterval: [lowerBound, upperBound],
        confidenceLevel: confidenceLevel
    };
}

// Self-tests
const testData1 = [12, 15, 14, 10, 13, 14, 15, 16];
const testData2 = [100, 102, 98, 105, 99, 101, 103, 100, 99, 98];
const confidenceLevel = 0.95;

console.log(JSON.stringify(calculateConfidenceInterval(testData1, confidenceLevel), null, 2));
console.log(JSON.stringify(calculateConfidenceInterval(testData2, confidenceLevel), null, 2));

// Edge case: single data point
try {
    console.log(calculateConfidenceInterval([42], confidenceLevel));
} catch (error) {
    console.log(error.message);
}

// Edge case: invalid confidence level
try {
    console.log(calculateConfidenceInterval(testData1, 0.5));
} catch (error) {
    console.log(error.message);
}

// Edge case: empty array
try {
    console.log(calculateConfidenceInterval([], confidenceLevel));
} catch (error) {
    console.log(error.message);
}