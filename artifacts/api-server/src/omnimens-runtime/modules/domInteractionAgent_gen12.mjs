/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: domInteractionAgent
 * Written: 2026-04-02T14:11:01.619Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// domInteractionAgent.mjs

import { createHash } from 'crypto';
import { URL } from 'url';

/**
 * Generates a unique hash for a given URL to identify web pages.
 * @param {string} url - The URL to hash.
 * @returns {string} - A SHA-256 hash of the URL.
 */
export function generateUrlHash(url) {
  try {
    const parsedUrl = new URL(url);
    const hash = createHash('sha256');
    hash.update(parsedUrl.href);
    return hash.digest('hex');
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Extracts all unique links from a given HTML string.
 * @param {string} html - The HTML content to parse.
 * @returns {Set<string>} - A set of unique links found in the HTML.
 */
export function extractLinks(html) {
  if (typeof html !== 'string') {
    throw new TypeError('HTML content must be a string.');
  }

  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=("|')(.*?)\1/gi;
  const links = new Set();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[2]);
      links.add(url.href);
    } catch {
      // Ignore invalid URLs
    }
  }

  return links;
}

/**
 * Simulates a DOM interaction by extracting text content from a given HTML string.
 * @param {string} html - The HTML content to parse.
 * @param {string} selector - A simple CSS selector to match elements.
 * @returns {Array<string>} - An array of text content from matched elements.
 */
export function extractTextBySelector(html, selector) {
  if (typeof html !== 'string' || typeof selector !== 'string') {
    throw new TypeError('Both HTML and selector must be strings.');
  }

  const elementRegex = new RegExp(`<${selector}[^>]*>(.*?)</${selector}>`, 'gi');
  const results = [];
  let match;

  while ((match = elementRegex.exec(html)) !== null) {
    results.push(match[1].trim());
  }

  return results;
}

/**
 * Utility to normalize and validate a URL.
 * @param {string} url - The URL to normalize.
 * @returns {string} - A normalized URL string.
 */
export function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hash = ''; // Remove fragments
    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Combines multiple HTML parsing utilities into a single function for broader use.
 * @param {string} html - The HTML content to process.
 * @param {Array<string>} selectors - An array of CSS selectors to extract text from.
 * @returns {Object} - An object containing extracted links and text by selectors.
 */
export function parseHtmlContent(html, selectors) {
  if (typeof html !== 'string' || !Array.isArray(selectors)) {
    throw new TypeError('Invalid Array.from(/* args */{}): HTML must be a string and selectors must be an array.');
  }

  const links = extractLinks(html);
  const textBySelectors = {};

  for (const selector of selectors) {
    textBySelectors[selector] = extractTextBySelector(html, selector);
  }

  return {
    links: Array.from(links),
    textBySelectors
  };
}
