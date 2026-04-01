/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: contextChainingEngine
 * Purpose: Dynamically stitch archived conversation states to extend the effective token window.
 * Description: Dynamically stitches past conversation fragments with current context using coherence scoring to extend the effective token window.
 * Migrated: 2026-04-01T22:23:20.247Z
 */

// contextChainingEngine.mjs

import crypto from 'crypto';

/**
 * Hashes a conversation fragment for efficient storage and retrieval.
 * @param {string} fragment - A conversation fragment.
 * @returns {string} - A unique hash of the fragment.
 */
export function hashFragment(fragment) {
  return crypto.createHash('sha256').update(fragment).digest('hex');
}

/**
 * Scores coherence between two conversation fragments using a simple word overlap metric.
 * @param {string} fragmentA - The first conversation fragment.
 * @param {string} fragmentB - The second conversation fragment.
 * @returns {number} - Coherence score (0 to 1).
 */
export function coherenceScore(fragmentA, fragmentB) {
  const wordsA = new Set(fragmentA.split(/\s+/));
  const wordsB = new Set(fragmentB.split(/\s+/));
  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

/**
 * Dynamically stitch past conversation fragments to extend the context.
 * @param {string} currentContext - The current conversation context.
 * @param {Array<{fragment: string, timestamp: number}>} archive - Archived conversation fragments.
 * @param {number} maxTokens - Maximum token limit for the extended context.
 * @returns {string} - The extended conversation context.
 */
export function stitchContext(currentContext, archive, maxTokens) {
  const tokenLimit = Math.max(1, maxTokens);
  const sortedArchive = archive
    .map(entry => ({ ...entry, score: coherenceScore(currentContext, entry.fragment) }))
    .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);

  let extendedContext = currentContext;
  for (const entry of sortedArchive) {
    const combinedLength = extendedContext.split(/\s+/).length + entry.fragment.split(/\s+/).length;
    if (combinedLength > tokenLimit) break;
    extendedContext = `${entry.fragment}\n${extendedContext}`;
  }

  return extendedContext;
}

/**
 * Filters archived fragments to remove duplicates based on hash.
 * @param {Array<{fragment: string, timestamp: number}>} archive - Archived conversation fragments.
 * @returns {Array<{fragment: string, timestamp: number}>} - Deduplicated archive.
 */
export function deduplicateArchive(archive) {
  const seenHashes = new Set();
  return archive.filter(entry => {
    const hash = hashFragment(entry.fragment);
    if (seenHashes.has(hash)) return false;
    seenHashes.add(hash);
    return true;
  });
}

/**
 * Trims the archive to maintain a maximum size.
 * @param {Array<{fragment: string, timestamp: number}>} archive - Archived conversation fragments.
 * @param {number} maxSize - Maximum number of fragments to retain.
 * @returns {Array<{fragment: string, timestamp: number}>} - Trimmed archive.
 */
export function trimArchive(archive, maxSize) {
  return archive
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, Math.max(1, maxSize));
}