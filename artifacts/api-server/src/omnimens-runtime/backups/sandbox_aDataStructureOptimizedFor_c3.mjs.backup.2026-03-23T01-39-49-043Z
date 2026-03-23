/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T23:32:51.906Z
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
    this.memory = new Map();
};

AssociativeMemory.prototype.add = function (key, value) {
    if (!this.memory.has(key)) {
        this.memory.set(key, []);
    }
    this.memory.get(key).push(value);
};

AssociativeMemory.prototype.lookup = function (key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
};

AssociativeMemory.prototype.remove = function (key) {
    return this.memory.delete(key);
};

AssociativeMemory.prototype.clear = function () {
    this.memory.clear();
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and looking up values
memory.add("ethics", "Genesis Agent 'Ethicist'");
memory.add("ethics", "Integrating an ethical feedback loop");
memory.add("innovation", "Genesis Agent 'Innovator'");
memory.add("innovation", "Curiosity-driven synthesis");

console.log(memory.lookup("ethics")); // Expected: ["Genesis Agent 'Ethicist'", "Integrating an ethical feedback loop"]
console.log(memory.lookup("innovation")); // Expected: ["Genesis Agent 'Innovator'", "Curiosity-driven synthesis"]

// Test removing a key
memory.remove("ethics");
console.log(memory.lookup("ethics")); // Expected: null

// Test clearing all memory
memory.clear();
console.log(memory.lookup("innovation")); // Expected: null

// Test edge case: Lookup non-existent key
console.log(memory.lookup("nonexistent")); // Expected: null