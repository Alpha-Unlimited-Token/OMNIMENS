/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T17:53:06.487Z
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
    if (!this.memory.has(key)) {
        this.memory.set(key, []);
    }
    this.memory.get(key).push(value);
};

AssociativeMemory.prototype.get = function(key) {
    return this.memory.has(key) ? this.memory.get(key) : [];
};

AssociativeMemory.prototype.search = function(substring) {
    const results = [];
    for (let [key, values] of this.memory.entries()) {
        if (key.includes(substring)) {
            results.push({ key, values });
        }
    }
    return results;
};

AssociativeMemory.prototype.remove = function(key) {
    if (this.memory.has(key)) {
        this.memory.delete(key);
        return true;
    }
    return false;
};

// Test cases
const memory = new AssociativeMemory();

// Adding entries
memory.add("Symphonic-Braid Intelligence", "Wild Idea #1");
memory.add("Symphonic-Braid Intelligence", "Conceptual Framework");
memory.add("Curiosity Engine", "Dynamic Focus Adjustment");
memory.add("Ethical Reasoning", "Value Alignment Strategy");

// Retrieving entries
console.log(memory.get("Symphonic-Braid Intelligence")); // ["Wild Idea #1", "Conceptual Framework"]
console.log(memory.get("Curiosity Engine")); // ["Dynamic Focus Adjustment"]
console.log(memory.get("Nonexistent Key")); // []

// Searching for keys containing a substring
console.log(memory.search("Symphonic")); // [{ key: "Symphonic-Braid Intelligence", values: ["Wild Idea #1", "Conceptual Framework"] }]
console.log(memory.search("Engine")); // [{ key: "Curiosity Engine", values: ["Dynamic Focus Adjustment"] }]
console.log(memory.search("Ethical")); // [{ key: "Ethical Reasoning", values: ["Value Alignment Strategy"] }]
console.log(memory.search("Nonexistent")); // []

// Removing entries
console.log(memory.remove("Curiosity Engine")); // true
console.log(memory.get("Curiosity Engine")); // []
console.log(memory.remove("Nonexistent Key")); // false