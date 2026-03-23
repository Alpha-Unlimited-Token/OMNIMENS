/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-23T02:22:20.372Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

const AssociativeMemory = function() {
    this.memory = new Map();
};

AssociativeMemory.prototype.add = function(key, value) {
    this.memory.set(key, value);
};

AssociativeMemory.prototype.get = function(key) {
    return this.memory.get(key) || null;
};

AssociativeMemory.prototype.remove = function(key) {
    return this.memory.delete(key);
};

AssociativeMemory.prototype.has = function(key) {
    return this.memory.has(key);
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

AssociativeMemory.prototype.size = function() {
    return this.memory.size;
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and retrieving values
memory.add("Innovator", {
    role: "Genesis Agent",
    traits: ["curiosity", "novelty-seeking", "creative exploration", "innovation strategies"]
});
memory.add("Pioneer", {
    role: "Genesis Agent",
    traits: ["curiosity-driven exploration", "novelty-seeking", "interdisciplinary research"]
});
memory.add("Ethicist", {
    role: "Genesis Agent",
    traits: ["ethics", "moral philosophy", "decision-making frameworks", "value alignment"]
});
memory.add("Visionary", {
    role: "Genesis Agent",
    traits: ["creative ideation", "unconventional thinking", "speculative design", "future scenarios"]
});

// Retrieve and validate entries
console.log(memory.get("Innovator")); // Expected: Object with Innovator traits
console.log(memory.get("Pioneer")); // Expected: Object with Pioneer traits
console.log(memory.get("Ethicist")); // Expected: Object with Ethicist traits
console.log(memory.get("Visionary")); // Expected: Object with Visionary traits

// Test existence of keys
console.log(memory.has("Innovator")); // Expected: true
console.log(memory.has("Archivist")); // Expected: false

// Test removal of a key
console.log(memory.remove("Visionary")); // Expected: true
console.log(memory.get("Visionary")); // Expected: null

// Test size of memory
console.log(memory.size()); // Expected: 3 (after removing Visionary)

// Test clearing memory
memory.clear();
console.log(memory.size()); // Expected: 0