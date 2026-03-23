/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-23T18:31:01.388Z
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

    this.add = function(key, value) {
        if (!this.memory.has(key)) {
            this.memory.set(key, new Set());
        }
        this.memory.get(key).add(value);
    };

    this.lookup = function(key) {
        return this.memory.has(key) ? Array.from(this.memory.get(key)) : [];
    };

    this.remove = function(key, value) {
        if (this.memory.has(key)) {
            const values = this.memory.get(key);
            values.delete(value);
            if (values.size === 0) {
                this.memory.delete(key);
            }
        }
    };

    this.clear = function() {
        this.memory.clear();
    };

    this.keys = function() {
        return Array.from(this.memory.keys());
    };

    this.values = function() {
        let allValues = [];
        this.memory.forEach((values) => {
            allValues = allValues.concat(Array.from(values));
        });
        return allValues;
    };

    this.size = function() {
        return this.memory.size;
    };
};

// Test cases
const memory = new AssociativeMemory();

// Add key-value pairs
memory.add("fruit", "apple");
memory.add("fruit", "banana");
memory.add("fruit", "orange");
memory.add("color", "red");
memory.add("color", "blue");

// Lookup values
console.log(memory.lookup("fruit")); // ["apple", "banana", "orange"]
console.log(memory.lookup("color")); // ["red", "blue"]
console.log(memory.lookup("unknown")); // []

// Remove a value
memory.remove("fruit", "banana");
console.log(memory.lookup("fruit")); // ["apple", "orange"]

// Remove all values for a key
memory.remove("color", "red");
memory.remove("color", "blue");
console.log(memory.lookup("color")); // []

// Check keys and values
console.log(memory.keys()); // ["fruit"]
console.log(memory.values()); // ["apple", "orange"]

// Clear memory
memory.clear();
console.log(memory.keys()); // []
console.log(memory.values()); // []
console.log(memory.size()); // 0