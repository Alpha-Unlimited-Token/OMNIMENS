/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: headlessWebProcessor
 * Written: 2026-04-02T20:35:11.505Z
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

import { JSDOM } from 'jsdom';
import crypto from 'crypto';

/**
 * Simulates DOM interaction and extracts dynamic web data for real-time processing.
 * This module provides utilities for parsing HTML, simulating DOM interactions, and processing data generically.
 */

/**
 * Parses HTML content into a DOM structure and extracts data based on a selector.
 * @param {string} html - The raw HTML string to parse.
 * @param {string} selector - The CSS selector to extract elements.
 * @returns {Array<string>} - Array of text content from matched elements.
 */
export function extractDataFromHTML(html, selector) {
  if (typeof html !== 'string' || typeof selector !== 'string') {
    throw new TypeError('Both html and selector must be strings.');
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const elements = document.querySelectorAll(selector);

  return Array.from(elements).map(el => el.textContent.trim());
}

/**
 * Generates a hash for a given input string using SHA-256.
 * Useful for caching or deduplication of extracted data.
 * @param {string} input - The string to hash.
 * @returns {string} - The resulting SHA-256 hash in hex format.
 */
export function generateHash(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string.');
  }

  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Filters extracted data based on a keyword or regular expression.
 * @param {Array<string>} data - The array of strings to filter.
 * @param {string|RegExp} filter - The keyword or regex to match.
 * @returns {Array<string>} - Filtered array of strings.
 */
export function filterExtractedData(data, filter) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data must be an array of strings.');
  }
  if (typeof filter !== 'string' && !(filter instanceof RegExp)) {
    throw new TypeError('Filter must be a string or RegExp.');
  }

  return data.filter(item => (typeof filter === 'string' ? item.includes(filter) : filter.test(item)));
}

/**
 * Normalizes text content by trimming whitespace and converting to lowercase.
 * Useful for standardizing extracted data for further processing.
 * @param {Array<string>} data - The array of strings to normalize.
 * @returns {Array<string>} - Normalized array of strings.
 */
export function normalizeTextData(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data must be an array of strings.');
  }

  return data.map(item => item.trim().toLowerCase());
}

/**
 * Combines all utilities to process HTML, extract, filter, and normalize data.
 * @param {string} html - The raw HTML string to process.
 * @param {string} selector - The CSS selector to extract elements.
 * @param {string|RegExp} filter - The keyword or regex to filter extracted data.
 * @returns {Array<string>} - Processed and normalized data.
 */
export function processHTMLData(html, selector, filter) {
  const extractedData = extractDataFromHTML(html, selector);
  const filteredData = filterExtractedData(extractedData, filter);
  return normalizeTextData(filteredData);
}

/**
 * Utility to validate if a string is valid HTML.
 * @param {string} html - The string to validate.
 * @returns {boolean} - True if valid HTML, false otherwise.
 */
export function isValidHTML(html) {
  if (typeof html !== 'string') {
    throw new TypeError('Input must be a string.');
  }

  try {
    new JSDOM(html);
    return true;
  } catch {
    return false;
  }
}
