/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T05:28:17.975Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractEntities(text, patterns) {
    /**
     * Extracts entities from a given text based on provided patterns.
     * @param {string} text - The input text to analyze.
     * @param {Array} patterns - Array of objects with `label` and `pattern` keys.
     * @returns {Array} - Array of extracted entities with their labels and positions.
     */
    const entities = [];
    patterns.forEach(({ label, pattern }) => {
        const regex = new RegExp(pattern, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
            entities.push({
                label: label,
                entity: match[0],
                start: match.index,
                end: match.index + match[0].length
            });
        }
    });
    return entities;
}

// Test cases
function runTests() {
    console.log("Running Tests...");

    // Test 1: Simple entity extraction
    const text1 = "John Doe lives in New York.";
    const patterns1 = [
        { label: "PERSON", pattern: "\\bJohn Doe\\b" },
        { label: "LOCATION", pattern: "\\bNew York\\b" }
    ];
    const result1 = extractEntities(text1, patterns1);
    console.log("Test 1 Result:", result1);

    // Test 2: Multiple matches
    const text2 = "Alice and Bob went to Paris. Alice loves Paris.";
    const patterns2 = [
        { label: "PERSON", pattern: "\\bAlice\\b" },
        { label: "PERSON", pattern: "\\bBob\\b" },
        { label: "LOCATION", pattern: "\\bParis\\b" }
    ];
    const result2 = extractEntities(text2, patterns2);
    console.log("Test 2 Result:", result2);

    // Test 3: Edge case - no matches
    const text3 = "No entities here.";
    const patterns3 = [
        { label: "PERSON", pattern: "\\bJohn\\b" },
        { label: "LOCATION", pattern: "\\bLondon\\b" }
    ];
    const result3 = extractEntities(text3, patterns3);
    console.log("Test 3 Result:", result3);

    // Test 4: Overlapping patterns
    const text4 = "The quick brown fox jumps over the lazy dog.";
    const patterns4 = [
        { label: "ANIMAL", pattern: "\\bfox\\b" },
        { label: "ANIMAL", pattern: "\\bdog\\b" },
        { label: "PHRASE", pattern: "quick brown fox" }
    ];
    const result4 = extractEntities(text4, patterns4);
    console.log("Test 4 Result:", result4);

    console.log("Tests Completed.");
}

runTests();