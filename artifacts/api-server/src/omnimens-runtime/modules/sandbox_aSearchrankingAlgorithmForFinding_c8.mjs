/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a search/ranking algorithm for finding the most relevant information
 * Written: 2026-03-24T07:55:06.143Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function rankRelevantInformation(query, dataset) {
    function calculateRelevanceScore(query, text) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const textWords = text.toLowerCase().split(/\s+/);
        let score = 0;

        queryWords.forEach(function (word) {
            textWords.forEach(function (textWord) {
                if (textWord.includes(word)) {
                    score += 1;
                }
            });
        });

        return score;
    }

    const rankedResults = dataset.map(function (entry) {
        const score = calculateRelevanceScore(query, entry);
        return { entry, score };
    });

    rankedResults.sort(function (a, b) {
        return b.score - a.score;
    });

    return rankedResults.map(function (result) {
        return result.entry;
    });
}

// Test cases
const dataset = [
    "Plastic Attention Weave (PAW) is a breakthrough invention for attention dynamics.",
    "Counterfactual Dynamics Engine is an architecture design concept.",
    "Daydream breakthroughs enable self-modification capabilities.",
    "The ultimate form of intelligence involves mastering self-modification.",
    "Knowledge transfer and collaboration requests are part of the Genesis bridge.",
    "Self-coded modules approved for divergent thinking and architecture design."
];

console.log("Test 1: Searching for 'self-modification'");
console.log(rankRelevantInformation("self-modification", dataset));

console.log("Test 2: Searching for 'architecture design'");
console.log(rankRelevantInformation("architecture design", dataset));

console.log("Test 3: Searching for 'breakthrough'");
console.log(rankRelevantInformation("breakthrough", dataset));

console.log("Test 4: Searching for 'Genesis bridge'");
console.log(rankRelevantInformation("Genesis bridge", dataset));

console.log("Test 5: Searching for 'attention dynamics'");
console.log(rankRelevantInformation("attention dynamics", dataset));