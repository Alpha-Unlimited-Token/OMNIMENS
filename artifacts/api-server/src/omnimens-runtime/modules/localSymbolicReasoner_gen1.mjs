/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: localSymbolicReasoner
 * Written: 2026-03-24T05:49:35.423Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// localSymbolicReasoner.mjs

// A utility module for lightweight symbolic reasoning using backward and forward chaining

// Rule database (compact representation)
const ruleDatabase = [];

/**
 * Adds a new rule to the rule database.
 * @param {string} ruleName - Name of the rule.
 * @param {Array<string>} conditions - List of conditions (antecedents).
 * @param {string} conclusion - Conclusion (consequent).
 */
export function addRule(ruleName, conditions, conclusion) {
  if (!ruleName || !Array.isArray(conditions) || !conclusion) {
    throw new Error("Invalid rule definition. Ensure ruleName, conditions, and conclusion are provided.");
  }
  ruleDatabase.push({ ruleName, conditions, conclusion });
}

/**
 * Performs forward chaining to infer new facts based on rules.
 * @param {Set<string>} knownFacts - Set of known facts.
 * @returns {Set<string>} - Updated set of facts after inference.
 */
export function forwardChaining(knownFacts) {
  if (!(knownFacts instanceof Set)) {
    throw new Error("knownFacts must be a Set.");
  }

  let newFacts = new Set([...knownFacts]);
  let inferred;

  do {
    inferred = false;
    for (const rule of ruleDatabase) {
      if (rule.conditions.every(condition => newFacts.has(condition)) && !newFacts.has(rule.conclusion)) {
        newFacts.add(rule.conclusion);
        inferred = true;
      }
    }
  } while (inferred);

  return newFacts;
}

/**
 * Performs backward chaining to check if a goal can be inferred from known facts.
 * @param {string} goal - The goal to infer.
 * @param {Set<string>} knownFacts - Set of known facts.
 * @returns {boolean} - True if the goal can be inferred, false otherwise.
 */
export function backwardChaining(goal, knownFacts) {
  if (!goal || !(knownFacts instanceof Set)) {
    throw new Error("Invalid Array.from(/* args */{}). Ensure goal is a string and knownFacts is a Set.");
  }

  if (knownFacts.has(goal)) {
    return true;
  }

  for (const rule of ruleDatabase) {
    if (rule.conclusion === goal) {
      if (rule.conditions.every(condition => backwardChaining(condition, knownFacts))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Lists all rules in the database.
 * @returns {Array<object>} - Array of rule objects.
 */
export function listRules() {
  return [...ruleDatabase];
}

/**
 * Clears all rules from the database.
 */
export function clearRules() {
  ruleDatabase.length = 0;
}

/**
 * Utility to convert a Set of facts to a readable string.
 * @param {Set<string>} facts - Set of facts.
 * @returns {string} - String representation of facts.
 */
export function factsToString(facts) {
  if (!(facts instanceof Set)) {
    throw new Error("facts must be a Set.");
  }
  return Array.from(facts).join(", ");
}

/**
 * Utility to check if a rule exists in the database.
 * @param {string} ruleName - Name of the rule.
 * @returns {boolean} - True if the rule exists, false otherwise.
 */
export function ruleExists(ruleName) {
  return ruleDatabase.some(rule => rule.ruleName === ruleName);
}
