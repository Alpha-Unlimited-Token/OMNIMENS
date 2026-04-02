/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: headlessBrowserAdapter
 * Written: 2026-04-02T14:09:58.784Z
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

/**
 * Simulates a headless browser environment for DOM manipulation and web scraping.
 * This module provides utility functions to parse, query, and manipulate HTML content in memory.
 */

/**
 * Parses raw HTML into a DOM object for manipulation.
 * @param {string} html - The raw HTML string to parse.
 * @returns {Document} - The parsed DOM Document object.
 */
export function parseHTML(html) {
  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('Invalid HTML input: must be a non-empty string.');
  }
  const { window } = new JSDOM(html);
  return window.document;
}

/**
 * Extracts text content from elements matching a CSS selector.
 * @param {Document} document - The DOM Document object to query.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {string[]} - An array of text content from the matched elements.
 */
export function extractTextBySelector(document, selector) {
  if (!(document instanceof JSDOM('').window.Document)) {
    throw new Error('Invalid document: must be a DOM Document object.');
  }
  if (typeof selector !== 'string' || !selector.trim()) {
    throw new Error('Invalid selector: must be a non-empty string.');
  }

  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(elem => elem.textContent.trim()).filter(text => text);
}

/**
 * Modifies the DOM by appending a new element with specified attributes and content.
 * @param {Document} document - The DOM Document object to modify.
 * @param {string} tagName - The tag name of the new element (e.g., 'div', 'span').
 * @param {Object} attributes - Key-value pairs of attributes to set on the element.
 * @param {string} [content] - Optional text content to set inside the element.
 * @returns {Element} - The newly created and appended element.
 */
export function appendElement(document, tagName, attributes, content = '') {
  if (!(document instanceof JSDOM('').window.Document)) {
    throw new Error('Invalid document: must be a DOM Document object.');
  }
  if (typeof tagName !== 'string' || !tagName.trim()) {
    throw new Error('Invalid tagName: must be a non-empty string.');
  }
  if (typeof attributes !== 'object' || attributes === null) {
    throw new Error('Invalid attributes: must be a non-null object.');
  }

  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  if (content) {
    element.textContent = content;
  }
  document.body.appendChild(element);
  return element;
}

/**
 * Serializes a DOM Document object back into an HTML string.
 * @param {Document} document - The DOM Document object to serialize.
 * @returns {string} - The serialized HTML string.
 */
export function serializeDOM(document) {
  if (!(document instanceof JSDOM('').window.Document)) {
    throw new Error('Invalid document: must be a DOM Document object.');
  }
  return document.documentElement.outerHTML;
}

/**
 * Utility to extract all links (anchor tags) from the given DOM document.
 * @param {Document} document - The DOM Document object to query.
 * @returns {string[]} - An array of href attribute values from anchor tags.
 */
export function extractLinks(document) {
  if (!(document instanceof JSDOM('').window.Document)) {
    throw new Error('Invalid document: must be a DOM Document object.');
  }

  const links = document.querySelectorAll('a[href]');
  return Array.from(links).map(link => link.href);
}

// Example usage (commented out for production):
// const html = '<!DOCTYPE html><html><body><div id="test">Hello</div></body></html>';
// const dom = parseHTML(html);
// console.log(extractTextBySelector(dom, '#test'));
