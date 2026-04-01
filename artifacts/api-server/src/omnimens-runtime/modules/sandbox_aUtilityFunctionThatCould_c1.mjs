/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T12:18:18.999Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Text Pattern Matching and Frequency Analysis
function analyzeTextPatterns(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new TypeError("Invalid input: text must be a string and patterns must be an array of strings.");
    }

    const results = patterns.map(pattern => {
        if (typeof pattern !== 'string') {
            throw new TypeError("Invalid pattern: all patterns must be strings.");
        }

        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        return {
            pattern: pattern,
            count: matches ? matches.length : 0,
            matches: matches || []
        };
    });

    return results;
}

// Test cases
const sampleText = "Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines. AI is widely used in various applications, including natural language processing, robotics, and machine learning. AI safety is a critical area of research.";

const patternsToMatch = ["AI", "intelligence", "machine", "safety", "data", "processing"];

const analysisResults = analyzeTextPatterns(sampleText, patternsToMatch);
console.log("Analysis Results:", analysisResults);

// Assertions for validation
console.assert(analysisResults.length === patternsToMatch.length, "Test Failed: Number of results does not match number of patterns.");
console.assert(analysisResults.find(r => r.pattern === "AI").count === 3, "Test Failed: 'AI' pattern count is incorrect.");
console.assert(analysisResults.find(r => r.pattern === "intelligence").count === 1, "Test Failed: 'intelligence' pattern count is incorrect.");
console.assert(analysisResults.find(r => r.pattern === "data").count === 0, "Test Failed: 'data' pattern count is incorrect.");
console.log("All tests passed!");