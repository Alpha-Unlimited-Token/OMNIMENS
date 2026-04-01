/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualFilePersistence
 * Written: 2026-04-01T22:19:53.062Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

// In-memory virtual file system
const virtualFileSystem = new Map();

/**
 * Write data to a virtual file.
 * @param {string} filePath - The virtual file path.
 * @param {string} content - The content to write.
 */
export function writeVirtualFile(filePath, content) {
  if (typeof filePath !== 'string' || typeof content !== 'string') {
    throw new Error('Invalid Array.from(/* args */{}): filePath and content must be strings.');
  }
  virtualFileSystem.set(filePath, content);
}

/**
 * Read data from a virtual file.
 * @param {string} filePath - The virtual file path.
 * @returns {string|null} - The content of the file, or null if not found.
 */
export function readVirtualFile(filePath) {
  if (typeof filePath !== 'string') {
    throw new Error('Invalid argument: filePath must be a string.');
  }
  return virtualFileSystem.get(filePath) || null;
}

/**
 * Delete a virtual file.
 * @param {string} filePath - The virtual file path.
 */
export function deleteVirtualFile(filePath) {
  if (typeof filePath !== 'string') {
    throw new Error('Invalid argument: filePath must be a string.');
  }
  virtualFileSystem.delete(filePath);
}

/**
 * List all virtual file paths.
 * @returns {string[]} - Array of file paths.
 */
export function listVirtualFiles() {
  return Array.from(virtualFileSystem.keys());
}

/**
 * Serialize the virtual file system to a string for storage.
 * @returns {string} - Serialized virtual file system.
 */
export function serializeVirtualFileSystem() {
  return JSON.stringify(Object.fromEntries(virtualFileSystem));
}

/**
 * Restore the virtual file system from a serialized string.
 * @param {string} serializedData - The serialized virtual file system.
 */
export function restoreVirtualFileSystem(serializedData) {
  if (typeof serializedData !== 'string') {
    throw new Error('Invalid argument: serializedData must be a string.');
  }
  const parsedData = JSON.parse(serializedData);
  if (typeof parsedData !== 'object' || parsedData === null) {
    throw new Error('Invalid serialized data format.');
  }
  virtualFileSystem.clear();
  for (const [key, value] of Object.entries(parsedData)) {
    virtualFileSystem.set(key, value);
  }
}

/**
 * Generate a checksum of the virtual file system for integrity verification.
 * @returns {string} - SHA-256 checksum of the virtual file system.
 */
export function generateFileSystemChecksum() {
  const serializedData = serializeVirtualFileSystem();
  return createHash('sha256').update(serializedData).digest('hex');
}

/**
 * Periodically serialize the virtual file system for backup.
 * @param {number} intervalMs - Interval in milliseconds for backups.
 * @param {function(string): void} backupCallback - Callback to handle serialized data.
 * @returns {NodeJS.Timeout} - Timer instance for stopping the periodic backup.
 */
export function startPeriodicBackup(intervalMs, backupCallback) {
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new Error('Invalid argument: intervalMs must be a positive number.');
  }
  if (typeof backupCallback !== 'function') {
    throw new Error('Invalid argument: backupCallback must be a function.');
  }
  return setInterval(() => {
    const serializedData = serializeVirtualFileSystem();
    backupCallback(serializedData);
  }, intervalMs);
}

/**
 * Stop a periodic backup process.
 * @param {NodeJS.Timeout} timer - The timer instance returned by startPeriodicBackup.
 */
export function stopPeriodicBackup(timer) {
  clearInterval(timer);
}
