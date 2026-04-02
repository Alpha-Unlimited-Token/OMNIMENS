/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: puppeteerWebExtractor
 * Purpose: Simulates browser interaction to extract live web data and DOM content.
 * Description: Simulates browser interaction using DOM parsing and JavaScript execution to extract and analyze live web data.
 * Migrated: 2026-04-02T15:11:36.908Z
 */

// puppeteerWebExtractor.mjs

import { JSDOM } from 'node:jsdom';
import { createHash } from 'node:crypto';

/**
 * Extracts DOM content from a given HTML string and returns queried data.
 * @param {string} html - The raw HTML string.
 * @param {string} querySelector - CSS selector to extract specific elements.
 * @returns {Array<string>} - Array of text content from matched elements.
 */
export function extractDOMContent(html, querySelector) {
  if (typeof html !== 'string' || typeof querySelector !== 'string') {
    throw new TypeError('Both html and querySelector must be strings.');
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const elements = document.querySelectorAll(querySelector);
  return Array.from(elements).map(el => el.textContent.trim());
}

/**
 * Executes JavaScript code within a simulated DOM environment.
 * @param {string} html - The raw HTML string.
 * @param {Function} jsFunction - A function to execute within the DOM context.
 * @returns {any} - Result of the executed function.
 */
export function executeInDOM(html, jsFunction) {
  if (typeof html !== 'string' || typeof jsFunction !== 'function') {
    throw new TypeError('Invalid arguments: html must be a string and jsFunction must be a function.');
  }

  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const { window } = dom;

  return jsFunction(window.document, window);
}

/**
 * Generates a unique hash for a given HTML string to detect changes.
 * @param {string} html - The raw HTML string.
 * @returns {string} - A SHA-256 hash of the HTML content.
 */
export function generateHTMLHash(html) {
  if (typeof html !== 'string') {
    throw new TypeError('HTML must be a string.');
  }

  const hash = createHash('sha256');
  hash.update(html);
  return hash.digest('hex');
}

/**
 * Utility to safely parse and validate URLs.
 * @param {string} urlString - The URL string to validate.
 * @returns {URL} - A valid URL object.
 */
export function validateURL(urlString) {
  try {
    return new URL(urlString);
  } catch (error) {
    throw new Error('Invalid URL provided.');
  }
}

/**
 * Extracts metadata (e.g., title, description) from an HTML string.
 * @param {string} html - The raw HTML string.
 * @returns {Object} - Metadata object containing title and description.
 */
export function extractMetadata(html) {
  if (typeof html !== 'string') {
    throw new TypeError('HTML must be a string.');
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.querySelector('title')?.textContent?.trim() || '';
  const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';

  return { title, description };
}

/**
 * Checks if a given HTML string contains specific keywords.
 * @param {string} html - The raw HTML string.
 * @param {Array<string>} keywords - Array of keywords to search for.
 * @returns {boolean} - True if any keyword is found, otherwise false.
 */
export function containsKeywords(html, keywords) {
  if (typeof html !== 'string' || !Array.isArray(keywords)) {
    throw new TypeError('HTML must be a string and keywords must be an array of strings.');
  }

  const lowerHTML = html.toLowerCase();
  return keywords.some(keyword => lowerHTML.includes(keyword.toLowerCase()));
}
