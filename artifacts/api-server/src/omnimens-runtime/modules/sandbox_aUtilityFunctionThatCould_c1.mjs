/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T06:10:24.845Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findPatternsInText(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new Error('Invalid input: text must be a string and patterns must be an array of strings.');
    }

    const results = patterns.map(pattern => {
        const regex = new RegExp(pattern, 'g');
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push({ match: match[0], index: match.index });
        }
        return { pattern, matches };
    });

    return results;
}

// Self-tests
(function testFindPatternsInText() {
    const text = "The quick brown fox jumps over the lazy dog. The fox is clever and quick.";
    const patterns = ["quick", "fox", "dog", "clever"];
    
    console.log("Test Case 1:");
    const result1 = findPatternsInText(text, patterns);
    console.log(result1);

    console.log("Test Case 2: Edge case with no matches");
    const result2 = findPatternsInText(text, ["cat", "mouse"]);
    console.log(result2);

    console.log("Test Case 3: Edge case with empty text");
    const result3 = findPatternsInText("", ["quick", "fox"]);
    console.log(result3);

    console.log("Test Case 4: Edge case with empty patterns");
    const result4 = findPatternsInText(text, []);
    console.log(result4);

    console.log("Test Case 5: Invalid inputs");
    try {
        findPatternsInText(123, ["quick"]);
    } catch (e) {
        console.log(e.message);
    }
    try {
        findPatternsInText(text, "quick");
    } catch (e) {
        console.log(e.message);
    }
})();