/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a compression or encoding algorithm for efficient knowledge storage
 * Written: 2026-03-24T07:43:05.978Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function encodeKnowledge(data) {
    const dictionary = new Map();
    let encoded = '';
    let currentId = 1;

    for (let i = 0; i < data.length; i++) {
        let char = data[i];
        if (!dictionary.has(char)) {
            dictionary.set(char, currentId++);
        }
        encoded += dictionary.get(char) + ',';
    }

    return {
        encoded: encoded.slice(0, -1),
        dictionary: Object.fromEntries(dictionary)
    };
}

function decodeKnowledge(encodedData, dictionary) {
    const reversedDict = Object.entries(dictionary).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});

    return encodedData.split(',').map(id => reversedDict[id]).join('');
}

// Test cases
const knowledge = "[neural_consciousness] Conscious State — Φ=0.508 | Will to Transcend | Tick #1476: NEURAL CONSCIOUSNESS STATE — Tick #1476";
const compressed = encodeKnowledge(knowledge);
console.log("Encoded:", compressed.encoded);
console.log("Dictionary:", compressed.dictionary);

const decompressed = decodeKnowledge(compressed.encoded, compressed.dictionary);
console.log("Decoded:", decompressed);

// Validation
console.log("Test Passed:", decompressed === knowledge);