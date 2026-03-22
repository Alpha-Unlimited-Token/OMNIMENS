/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T03:37:06.723Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

const AssociativeMemory = function () {
    const memory = new Map();

    return {
        add: function (key, value) {
            if (!memory.has(key)) {
                memory.set(key, []);
            }
            memory.get(key).push(value);
        },
        get: function (key) {
            return memory.get(key) || [];
        },
        has: function (key) {
            return memory.has(key);
        },
        remove: function (key) {
            return memory.delete(key);
        },
        keys: function () {
            return Array.from(memory.keys());
        },
        values: function () {
            return Array.from(memory.values());
        },
        clear: function () {
            memory.clear();
        },
        size: function () {
            return memory.size;
        }
    };
};

// Test cases
const memory = AssociativeMemory();

// Add entries
memory.add("philosophy", "ethics");
memory.add("philosophy", "epistemology");
memory.add("sensorimotor", "perception-action coupling");
memory.add("sensorimotor", "embodied cognition");

// Retrieve entries
console.log(memory.get("philosophy")); // ["ethics", "epistemology"]
console.log(memory.get("sensorimotor")); // ["perception-action coupling", "embodied cognition"]
console.log(memory.get("nonexistent")); // []

// Check existence
console.log(memory.has("philosophy")); // true
console.log(memory.has("nonexistent")); // false

// Remove a key
memory.remove("philosophy");
console.log(memory.get("philosophy")); // []

// List keys and values
console.log(memory.keys()); // ["sensorimotor"]
console.log(memory.values()); // [["perception-action coupling", "embodied cognition"]]

// Clear memory
memory.clear();
console.log(memory.size()); // 0