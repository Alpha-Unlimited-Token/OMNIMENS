/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_12
 * Name: hierarchicalMemorySystem
 * Purpose: Dynamically compresses and links context across token windows for extended reasoning capabilities.
 * Description: A utility module for hierarchical memory management, enabling context compression, linking, and episodic chaining for extended reasoning.
 * Migrated: 2026-04-02T14:50:29.446Z
 */

// hierarchicalMemorySystem.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given string input.
 * This helps identify and link similar contexts efficiently.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash representing the semantic content.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Compresses and summarizes less critical data while preserving key information.
 * @param {string} input - The input text to process.
 * @param {number} maxLength - The maximum length of the compressed output.
 * @returns {string} - A summarized version of the input.
 */
export function compressContext(input, maxLength = 200) {
  if (input.length <= maxLength) return input;

  const sentences = input.split('. ');
  const importantSentences = sentences.filter(sentence => sentence.includes('important') || sentence.includes('key'));

  let summary = importantSentences.join('. ');
  if (summary.length > maxLength) {
    summary = summary.slice(0, maxLength - 3) + '...';
  }

  return summary;
}

/**
 * Links related contexts by identifying shared semantic hashes.
 * @param {Array<string>} contexts - An array of context strings.
 * @returns {Map<string, Array<string>>} - A map where keys are semantic hashes and values are arrays of related contexts.
 */
export function linkContexts(contexts) {
  const contextMap = new Map();

  for (const context of contexts) {
    const hash = generateSemanticHash(context);
    if (!contextMap.has(hash)) {
      contextMap.set(hash, []);
    }
    contextMap.get(hash).push(context);
  }

  return contextMap;
}

/**
 * Creates an episodic memory chain by organizing contexts chronologically.
 * @param {Array<{timestamp: number, context: string}>} episodes - An array of episodes with timestamps and contexts.
 * @returns {Array<{timestamp: number, context: string}>} - A sorted array of episodes by timestamp.
 */
export function createEpisodicMemoryChain(episodes) {
  return episodes.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Dynamically manages hierarchical memory by compressing, linking, and chaining contexts.
 * @param {Array<{timestamp: number, context: string}>} episodes - An array of episodes with timestamps and contexts.
 * @param {number} maxLength - Maximum length for compressed contexts.
 * @returns {Object} - An object containing compressed contexts, linked contexts, and episodic memory chain.
 */
export function hierarchicalMemorySystem(episodes, maxLength = 200) {
  const compressedContexts = episodes.map(episode => ({
    timestamp: episode.timestamp,
    context: compressContext(episode.context, maxLength)
  }));

  const linkedContexts = linkContexts(episodes.map(episode => episode.context));
  const episodicMemoryChain = createEpisodicMemoryChain(compressedContexts);

  return {
    compressedContexts,
    linkedContexts,
    episodicMemoryChain
  };
}