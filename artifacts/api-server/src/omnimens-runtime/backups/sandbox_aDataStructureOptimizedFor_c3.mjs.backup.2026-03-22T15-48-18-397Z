/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T12:40:57.303Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function AssociativeMemory() {
    this.memory = new Map();
}

AssociativeMemory.prototype.add = function(key, value) {
    if (!this.memory.has(key)) {
        this.memory.set(key, new Set());
    }
    this.memory.get(key).add(value);
};

AssociativeMemory.prototype.get = function(key) {
    return this.memory.has(key) ? Array.from(this.memory.get(key)) : null;
};

AssociativeMemory.prototype.remove = function(key, value) {
    if (this.memory.has(key)) {
        const values = this.memory.get(key);
        values.delete(value);
        if (values.size === 0) {
            this.memory.delete(key);
        }
    }
};

AssociativeMemory.prototype.hasKey = function(key) {
    return this.memory.has(key);
};

AssociativeMemory.prototype.hasValue = function(key, value) {
    return this.memory.has(key) && this.memory.get(key).has(value);
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and retrieving values
memory.add("color", "blue");
memory.add("color", "red");
memory.add("shape", "circle");
console.log(memory.get("color")); // Expected: ["blue", "red"]
console.log(memory.get("shape")); // Expected: ["circle"]
console.log(memory.get("nonexistent")); // Expected: null

// Test removing values
memory.remove("color", "blue");
console.log(memory.get("color")); // Expected: ["red"]
memory.remove("color", "red");
console.log(memory.get("color")); // Expected: null

// Test checking keys and values
memory.add("animal", "cat");
console.log(memory.hasKey("animal")); // Expected: true
console.log(memory.hasKey("nonexistent")); // Expected: false
console.log(memory.hasValue("animal", "cat")); // Expected: true
console.log(memory.hasValue("animal", "dog")); // Expected: false

// Edge cases
memory.add("key", "value");
memory.add("key", "value"); // Duplicate value
console.log(memory.get("key")); // Expected: ["value"] (no duplicates)

memory.remove("key", "value");
console.log(memory.get("key")); // Expected: null (key removed after last value deletion)