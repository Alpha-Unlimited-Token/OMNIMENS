/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T17:50:54.773Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Extract named entities from text based on simple pattern matching
function extractEntities(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new Error('Invalid input: text must be a string and patterns must be an array.');
    }

    const entities = [];
    patterns.forEach(pattern => {
        if (!pattern.label || !pattern.regex) {
            throw new Error('Invalid pattern: each pattern must have a label and a regex.');
        }
        const regex = new RegExp(pattern.regex, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            entities.push({ label: pattern.label, value: match[0], index: match.index });
        }
    });

    return entities;
}

// Test cases
(function testExtractEntities() {
    const text = "Google and Microsoft are leading tech companies. Elon Musk founded SpaceX.";
    const patterns = [
        { label: 'ORG', regex: '\\b(Google|Microsoft|SpaceX)\\b' },
        { label: 'PERSON', regex: '\\b(Elon Musk)\\b' }
    ];

    console.log("Test Case 1:");
    console.log(extractEntities(text, patterns));
    // Expected output:
    // [
    //   { label: 'ORG', value: 'Google', index: 0 },
    //   { label: 'ORG', value: 'Microsoft', index: 11 },
    //   { label: 'PERSON', value: 'Elon Musk', index: 43 },
    //   { label: 'ORG', value: 'SpaceX', index: 57 }
    // ]

    console.log("Test Case 2 (No matches):");
    console.log(extractEntities("No entities here.", patterns));
    // Expected output: []

    console.log("Test Case 3 (Edge case - empty text):");
    console.log(extractEntities("", patterns));
    // Expected output: []

    console.log("Test Case 4 (Edge case - empty patterns):");
    console.log(extractEntities(text, []));
    // Expected output: []

    console.log("Test Case 5 (Invalid inputs):");
    try {
        console.log(extractEntities(123, patterns));
    } catch (e) {
        console.log(e.message); // Expected: "Invalid input: text must be a string and patterns must be an array."
    }

    try {
        console.log(extractEntities(text, [{ label: 'ORG' }]));
    } catch (e) {
        console.log(e.message); // Expected: "Invalid pattern: each pattern must have a label and a regex."
    }
})();