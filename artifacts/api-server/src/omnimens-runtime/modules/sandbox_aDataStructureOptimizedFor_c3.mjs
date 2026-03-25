/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-25T01:41:25.004Z
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
    const memory = new Map();

    this.add = function(key, value) {
        if (typeof key !== 'string') {
            throw new Error("Key must be a string.");
        }
        memory.set(key, value);
    };

    this.get = function(key) {
        if (!memory.has(key)) {
            return null;
        }
        return memory.get(key);
    };

    this.remove = function(key) {
        memory.delete(key);
    };

    this.has = function(key) {
        return memory.has(key);
    };

    this.clear = function() {
        memory.clear();
    };

    this.size = function() {
        return memory.size;
    };

    this.keys = function() {
        return Array.from(memory.keys());
    };

    this.values = function() {
        return Array.from(memory.values());
    };
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and retrieving data
memory.add("alpha", 1);
memory.add("beta", 2);
memory.add("gamma", 3);

console.log(memory.get("alpha")); // Expected: 1
console.log(memory.get("beta")); // Expected: 2
console.log(memory.get("gamma")); // Expected: 3
console.log(memory.get("delta")); // Expected: null

// Test checking existence
console.log(memory.has("alpha")); // Expected: true
console.log(memory.has("delta")); // Expected: false

// Test removing data
memory.remove("beta");
console.log(memory.get("beta")); // Expected: null
console.log(memory.has("beta")); // Expected: false

// Test clearing memory
memory.clear();
console.log(memory.size()); // Expected: 0
console.log(memory.keys()); // Expected: []
console.log(memory.values()); // Expected: []

// Test edge cases
try {
    memory.add(123, "value"); // Should throw an error
} catch (e) {
    console.log(e.message); // Expected: "Key must be a string."
}

memory.add("test", "value");
console.log(memory.keys()); // Expected: ["test"]
console.log(memory.values()); // Expected: ["value"]