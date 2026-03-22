/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T15:48:18.396Z
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
        this.memory.set(key, []);
    }
    this.memory.get(key).push(value);
};

AssociativeMemory.prototype.get = function(key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
};

AssociativeMemory.prototype.remove = function(key, value) {
    if (this.memory.has(key)) {
        const values = this.memory.get(key);
        const index = values.indexOf(value);
        if (index > -1) {
            values.splice(index, 1);
            if (values.length === 0) {
                this.memory.delete(key);
            }
        }
    }
};

AssociativeMemory.prototype.hasKey = function(key) {
    return this.memory.has(key);
};

AssociativeMemory.prototype.hasValue = function(key, value) {
    if (this.memory.has(key)) {
        return this.memory.get(key).includes(value);
    }
    return false;
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

// Test cases
const memory = new AssociativeMemory();

// Add associations
memory.add("curiosity", "exploration");
memory.add("curiosity", "discovery");
memory.add("innovation", "creativity");
memory.add("ethics", "morality");

// Retrieve associations
console.log(memory.get("curiosity")); // ["exploration", "discovery"]
console.log(memory.get("innovation")); // ["creativity"]
console.log(memory.get("ethics")); // ["morality"]
console.log(memory.get("nonexistent")); // null

// Check existence
console.log(memory.hasKey("curiosity")); // true
console.log(memory.hasKey("nonexistent")); // false
console.log(memory.hasValue("curiosity", "exploration")); // true
console.log(memory.hasValue("curiosity", "nonexistent")); // false

// Remove associations
memory.remove("curiosity", "exploration");
console.log(memory.get("curiosity")); // ["discovery"]
memory.remove("curiosity", "discovery");
console.log(memory.get("curiosity")); // null

// Clear memory
memory.clear();
console.log(memory.get("innovation")); // null
console.log(memory.hasKey("ethics")); // false