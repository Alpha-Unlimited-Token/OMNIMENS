/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_17
 * Name: virtualFileSystemPersistence
 * Purpose: Provides dynamic module persistence using an in-memory virtual file system.
 * Description: Provides an in-memory virtual file system for saving, loading, and managing dynamic module states with integrity checks.
 * Migrated: 2026-04-01T22:23:20.238Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * In-memory virtual file system for dynamic module persistence.
 * Provides save/load capabilities for storing and retrieving module states.
 */

// Internal storage for the virtual file system
const virtualFileSystem = new Map();

/**
 * Saves data to the virtual file system under a specified path.
 * @param {string} path - The virtual path to save the data.
 * @param {string | object} data - The data to save (string or JSON-serializable object).
 * @returns {boolean} - Returns true if the data was successfully saved.
 */
export function saveToVirtualFileSystem(path, data) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error('Path must be a non-empty string.');
  }

  const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
  virtualFileSystem.set(path, serializedData);
  return true;
}

/**
 * Loads data from the virtual file system for a specified path.
 * @param {string} path - The virtual path to load the data from.
 * @returns {string | object | null} - The loaded data (parsed if JSON), or null if not found.
 */
export function loadFromVirtualFileSystem(path) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error('Path must be a non-empty string.');
  }

  const data = virtualFileSystem.get(path);
  if (data === undefined) return null;

  try {
    return JSON.parse(data);
  } catch {
    return data; // Return as string if not JSON
  }
}

/**
 * Deletes data from the virtual file system for a specified path.
 * @param {string} path - The virtual path to delete the data from.
 * @returns {boolean} - Returns true if the data was successfully deleted.
 */
export function deleteFromVirtualFileSystem(path) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error('Path must be a non-empty string.');
  }

  return virtualFileSystem.delete(path);
}

/**
 * Lists all paths currently stored in the virtual file system.
 * @returns {string[]} - An array of all stored paths.
 */
export function listVirtualFileSystemPaths() {
  return Array.from(virtualFileSystem.keys());
}

/**
 * Generates a hash of the current virtual file system state for integrity checks.
 * @returns {string} - A SHA-256 hash of the virtual file system contents.
 */
export function generateVirtualFileSystemHash() {
  const allData = Array.from(virtualFileSystem.entries())
    .map(([path, content]) => `${path}:${content}`)
    .sort()
    .join('|');

  return createHash('sha256').update(allData).digest('hex');
}

/**
 * Clears the entire virtual file system.
 * @returns {void}
 */
export function clearVirtualFileSystem() {
  virtualFileSystem.clear();
}

/**
 * Checks if a given path exists in the virtual file system.
 * @param {string} path - The virtual path to check.
 * @returns {boolean} - Returns true if the path exists, false otherwise.
 */
export function existsInVirtualFileSystem(path) {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error('Path must be a non-empty string.');
  }

  return virtualFileSystem.has(path);
}
