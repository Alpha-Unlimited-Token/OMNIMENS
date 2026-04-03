/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: headlessDomProcessor
 * Written: 2026-04-03T12:25:49.112Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// headlessDomProcessor.mjs

import { URL } from 'url';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given DOM string.
 * Useful for identifying distinct visual states.
 * @param {string} domString - The string representation of the DOM.
 * @returns {string} - A SHA-256 hash of the DOM string.
 */
export function generateDomHash(domString) {
  if (typeof domString !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return createHash('sha256').update(domString).digest('hex');
}

/**
 * Simulates DOM rendering by processing a raw HTML string.
 * Extracts visual and structural data for downstream reasoning.
 * @param {string} rawHtml - The raw HTML string to process.
 * @returns {object} - An object containing visual metadata and DOM hash.
 */
export function simulateDomRendering(rawHtml) {
  if (typeof rawHtml !== 'string') {
    throw new TypeError('Input must be a string');
  }

  // Simulate rendering by parsing basic structure
  const domMetadata = {
    tagCount: 0,
    uniqueTags: new Set(),
    textContentLength: 0
  };

  const tagRegex = /<([a-zA-Z0-9-]+)(\s|>)/g;
  let match;
  while ((match = tagRegex.exec(rawHtml)) !== null) {
    domMetadata.tagCount++;
    domMetadata.uniqueTags.add(match[1].toLowerCase());
  }

  const textContent = rawHtml.replace(/<[^>]*>/g, '').trim();
  domMetadata.textContentLength = textContent.length;

  return {
    domHash: generateDomHash(rawHtml),
    visualMetadata: {
      tagCount: domMetadata.tagCount,
      uniqueTags: Array.from(domMetadata.uniqueTags),
      textContentLength: domMetadata.textContentLength
    }
  };
}

/**
 * Validates a URL string and extracts its hostname.
 * Useful for identifying web-based interaction contexts.
 * @param {string} urlString - The URL string to validate and process.
 * @returns {string} - The hostname of the URL.
 */
export function extractHostname(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

/**
 * Utility to analyze HTML and associate it with a URL context.
 * @param {string} rawHtml - Raw HTML string.
 * @param {string} urlString - URL string for context.
 * @returns {object} - Combined analysis of HTML and URL.
 */
export function analyzeDomWithUrl(rawHtml, urlString) {
  const hostname = extractHostname(urlString);
  const domAnalysis = simulateDomRendering(rawHtml);
  return {
    hostname,
    domAnalysis
  };
}
