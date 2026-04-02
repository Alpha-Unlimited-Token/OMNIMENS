/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_5
 * Name: dynamicPromptMiddleware
 * Purpose: Aligns external LLM outputs with OMNIMENS’s internal reasoning goals.
 * Description: Generates dynamic prompts and processes LLM outputs to align external responses with internal reasoning goals.
 * Migrated: 2026-04-02T21:43:58.502Z
 */

// dynamicPromptMiddleware.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash from the internal reasoning state to ensure unique prompt contexts.
 * Useful for aligning external LLM outputs with internal goals.
 * @param {string} reasoningState - The current internal reasoning state.
 * @returns {string} - A unique hash representing the reasoning state.
 */
export function generateReasoningHash(reasoningState) {
  const hash = createHash('sha256');
  hash.update(reasoningState);
  return hash.digest('hex');
}

/**
 * Dynamically generates a prompt by analyzing the reasoning state and injecting context.
 * @param {string} reasoningState - The current internal reasoning state.
 * @param {string} externalQuery - The query intended for the external LLM.
 * @param {Object} context - Additional context to align the prompt.
 * @returns {string} - A dynamically adjusted prompt for external LLM alignment.
 */
export function generateDynamicPrompt(reasoningState, externalQuery, context = {}) {
  const reasoningHash = generateReasoningHash(reasoningState);
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `ReasoningHash: ${reasoningHash}\nContext: ${contextString}\nQuery: ${externalQuery}`;
}

/**
 * Validates the dynamic prompt to ensure it meets structural and contextual requirements.
 * @param {string} prompt - The dynamically generated prompt.
 * @returns {boolean} - True if the prompt is valid, false otherwise.
 */
export function validatePrompt(prompt) {
  const requiredFields = ['ReasoningHash', 'Context', 'Query'];
  return requiredFields.every(field => prompt.includes(field));
}

/**
 * Middleware function to process external LLM outputs and align them with internal reasoning goals.
 * @param {string} llmOutput - The raw output from the external LLM.
 * @param {string} reasoningState - The current internal reasoning state.
 * @returns {Object} - Processed output aligned with internal goals.
 */
export function processLLMOutput(llmOutput, reasoningState) {
  const reasoningHash = generateReasoningHash(reasoningState);

  return {
    alignedOutput: `Aligned with ReasoningHash: ${reasoningHash}\n${llmOutput}`,
    originalOutput: llmOutput,
    reasoningHash
  };
}

/**
 * Utility to merge multiple reasoning states into a single coherent state.
 * @param {Array<string>} reasoningStates - Array of reasoning states.
 * @returns {string} - Merged reasoning state.
 */
export function mergeReasoningStates(reasoningStates) {
  return reasoningStates.join(' | ');
}

/**
 * Utility to extract key-value pairs from reasoning states for further analysis.
 * @param {string} reasoningState - The reasoning state to analyze.
 * @returns {Object} - Extracted key-value pairs from the reasoning state.
 */
export function extractReasoningContext(reasoningState) {
  const pairs = reasoningState.split(';').map(pair => pair.split(':').map(str => str.trim()));
  return Object.fromEntries(pairs);
}