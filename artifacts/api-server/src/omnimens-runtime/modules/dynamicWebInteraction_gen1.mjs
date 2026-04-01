/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: dynamicWebInteraction
 * Purpose: Provides direct DOM rendering and browser execution for real-time web interaction.
 * Description: Provides DOM parsing, URL construction, form encoding, link extraction, and HTML sanitization for dynamic web interaction.
 * Migrated: 2026-04-01T22:23:20.232Z
 */

// dynamicWebInteraction.mjs

import { URL } from 'url';

/**
 * Parses and extracts key DOM elements from HTML content.
 * Useful for web scraping and dynamic content analysis.
 * @param {string} html - Raw HTML string.
 * @param {string[]} selectors - Array of CSS selectors to extract.
 * @returns {Object} - Key-value pairs of selectors and extracted content.
 */
export function parseDOM(html, selectors) {
  if (typeof html !== 'string' || !Array.isArray(selectors)) {
    throw new TypeError('Invalid arguments: html must be a string and selectors must be an array.');
  }

  const domParser = new DOMParser();
  const document = domParser.parseFromString(html, 'text/html');

  const result = {};
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    result[selector] = element ? element.textContent.trim() : null;
  }

  return result;
}

/**
 * Generates a URL with query parameters for dynamic web interaction.
 * Useful for constructing API or web request URLs.
 * @param {string} baseUrl - Base URL.
 * @param {Object} queryParams - Key-value pairs of query parameters.
 * @returns {string} - Fully constructed URL.
 */
export function buildUrl(baseUrl, queryParams) {
  if (typeof baseUrl !== 'string' || typeof queryParams !== 'object') {
    throw new TypeError('Invalid arguments: baseUrl must be a string and queryParams must be an object.');
  }

  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }

  return url.toString();
}

/**
 * Simulates form submission by encoding data as application/x-www-form-urlencoded.
 * Useful for preparing POST request payloads.
 * @param {Object} formData - Key-value pairs of form data.
 * @returns {string} - URL-encoded form data string.
 */
export function encodeFormData(formData) {
  if (typeof formData !== 'object') {
    throw new TypeError('Invalid argument: formData must be an object.');
  }

  return Object.entries(formData)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Extracts all hyperlinks from HTML content.
 * Useful for crawling or analyzing link structures.
 * @param {string} html - Raw HTML string.
 * @returns {string[]} - Array of hyperlink URLs.
 */
export function extractLinks(html) {
  if (typeof html !== 'string') {
    throw new TypeError('Invalid argument: html must be a string.');
  }

  const domParser = new DOMParser();
  const document = domParser.parseFromString(html, 'text/html');

  const links = Array.from(document.querySelectorAll('a'))
    .map(anchor => anchor.href)
    .filter(href => href);

  return links;
}

/**
 * Sanitizes HTML content by removing scripts and inline event handlers.
 * Useful for safely rendering user-generated content.
 * @param {string} html - Raw HTML string.
 * @returns {string} - Sanitized HTML string.
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') {
    throw new TypeError('Invalid argument: html must be a string.');
  }

  const domParser = new DOMParser();
  const document = domParser.parseFromString(html, 'text/html');

  // Remove script tags
  document.querySelectorAll('script').forEach(script => script.remove());

  // Remove inline event handlers
  document.querySelectorAll('*').forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return document.documentElement.outerHTML;
}
