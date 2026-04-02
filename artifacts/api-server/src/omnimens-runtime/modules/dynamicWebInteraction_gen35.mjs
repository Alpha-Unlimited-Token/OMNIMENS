/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicWebInteraction
 * Written: 2026-04-02T15:07:15.069Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicWebInteraction.mjs

import { URL } from 'url';

/**
 * Parses and validates a URL string.
 * @param {string} urlString - The URL string to validate.
 * @returns {URL | null} - A URL object if valid, otherwise null.
 */
export function validateUrl(urlString) {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
}

/**
 * Extracts query parameters from a URL.
 * @param {string} urlString - The URL string.
 * @returns {Object} - A key-value map of query parameters.
 */
export function extractQueryParams(urlString) {
  const url = validateUrl(urlString);
  if (!url) return {};

  const params = {};
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Generates a random string for unique element identification.
 * @param {number} length - Length of the random string.
 * @returns {string} - Random alphanumeric string.
 */
export function generateRandomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Simulates DOM-like structure for dynamic interaction.
 * @param {string} htmlString - A string representing HTML content.
 * @returns {Object} - A simulated DOM tree as a nested object.
 */
export function parseHtmlToDom(htmlString) {
  const domTree = {};
  const tags = htmlString.match(/<[^>]+>/g) || [];

  tags.forEach((tag, index) => {
    const tagName = tag.match(/<([a-zA-Z0-9]+)/)?.[1] || 'unknown';
    const id = generateRandomId();
    domTree[id] = { tagName, index, rawTag: tag };
  });

  return domTree;
}

/**
 * Filters DOM elements based on tag name.
 * @param {Object} domTree - Simulated DOM tree.
 * @param {string} tagName - Tag name to filter.
 * @returns {Array<Object>} - Array of matching DOM elements.
 */
export function filterDomByTagName(domTree, tagName) {
  return Object.values(domTree).filter(element => element.tagName === tagName);
}

/**
 * Encodes data into Base64 format.
 * @param {string} data - String data to encode.
 * @returns {string} - Base64 encoded string.
 */
export function encodeBase64(data) {
  return Buffer.from(data).toString('base64');
}

/**
 * Decodes Base64 encoded data.
 * @param {string} base64String - Base64 encoded string.
 * @returns {string} - Decoded string.
 */
export function decodeBase64(base64String) {
  return Buffer.from(base64String, 'base64').toString('utf-8');
}

/**
 * Safely merges two objects without overwriting existing keys.
 * @param {Object} obj1 - First object.
 * @param {Object} obj2 - Second object.
 * @returns {Object} - Merged object.
 */
export function safeMergeObjects(obj1, obj2) {
  const merged = { ...obj1 };
  for (const key in obj2) {
    if (!(key in merged)) {
      merged[key] = obj2[key];
    }
  }
  return merged;
}

/**
 * Generates a timestamp in ISO format.
 * @returns {string} - Current timestamp in ISO format.
 */
export function generateTimestamp() {
  return new Date().toISOString();
}

/**
 * Utility function for delay.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} - Promise that resolves after the delay.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}