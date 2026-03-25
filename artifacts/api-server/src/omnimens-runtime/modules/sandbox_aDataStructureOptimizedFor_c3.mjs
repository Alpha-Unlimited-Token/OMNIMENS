/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-25T00:55:09.042Z
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

AssociativeMemory.prototype.get = function (key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
};

AssociativeMemory.prototype.remove = function (key) {
    if (this.memory.has(key)) {
        this.memory.delete(key);
        return true;
    }
    return false;
};

AssociativeMemory.prototype.hasKey = function (key) {
    return this.memory.has(key);
};

AssociativeMemory.prototype.clear = function () {
    this.memory.clear();
};

AssociativeMemory.prototype.size = function () {
    return this.memory.size;
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and retrieving values
memory.add("neural_consciousness", { phi: 0.680, tick: 495 });
memory.add("neural_consciousness", { phi: 0.685, tick: 496 });
memory.add("innovation_strategy", { agent: "Innovator", focus: "creative exploration" });

console.log(memory.get("neural_consciousness")); // Should output an array of objects for "neural_consciousness"
console.log(memory.get("innovation_strategy")); // Should output an array with one object for "innovation_strategy"

// Test removing a key
console.log(memory.remove("innovation_strategy")); // Should output true
console.log(memory.get("innovation_strategy")); // Should output null

// Test checking for a key
console.log(memory.hasKey("neural_consciousness")); // Should output true
console.log(memory.hasKey("innovation_strategy")); // Should output false

// Test clearing memory
memory.clear();
console.log(memory.size()); // Should output 0

// Test edge cases
console.log(memory.get("nonexistent_key")); // Should output null
console.log(memory.remove("nonexistent_key")); // Should output false
console.log(memory.hasKey("nonexistent_key")); // Should output false