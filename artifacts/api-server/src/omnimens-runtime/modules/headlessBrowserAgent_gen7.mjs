/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: headlessBrowserAgent
 * Written: 2026-04-02T14:10:33.824Z
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

import { JSDOM } from 'node:jsdom';

/**
 * Parses HTML content and returns a DOM object for further manipulation.
 * @param {string} htmlContent - The raw HTML string to parse.
 * @returns {Document} - The DOM Document object.
 */
export function parseHTMLToDOM(htmlContent) {
  if (typeof htmlContent !== 'string' || !htmlContent.trim()) {
    throw new Error('Invalid HTML content provided.');
  }
  const dom = new JSDOM(htmlContent);
  return dom.window.document;
}

/**
 * Executes a JavaScript function within a simulated DOM environment.
 * @param {string} htmlContent - The raw HTML string to create the DOM.
 * @param {Function} jsFunction - The JavaScript function to execute within the DOM.
 * @returns {any} - The result of the executed JavaScript function.
 */
export function executeInDOM(htmlContent, jsFunction) {
  if (typeof jsFunction !== 'function') {
    throw new Error('Provided argument is not a valid function.');
  }
  const document = parseHTMLToDOM(htmlContent);
  return jsFunction(document);
}

/**
 * Extracts all text content from a given HTML string.
 * @param {string} htmlContent - The raw HTML string to parse.
 * @returns {string} - The concatenated text content from the DOM.
 */
export function extractTextFromHTML(htmlContent) {
  const document = parseHTMLToDOM(htmlContent);
  return document.body ? document.body.textContent.trim() : '';
}

/**
 * Finds elements in the DOM based on a CSS selector.
 * @param {string} htmlContent - The raw HTML string to parse.
 * @param {string} selector - The CSS selector to query elements.
 * @returns {Array} - An array of matching elements.
 */
export function findElementsBySelector(htmlContent, selector) {
  if (typeof selector !== 'string' || !selector.trim()) {
    throw new Error('Invalid CSS selector provided.');
  }
  const document = parseHTMLToDOM(htmlContent);
  return Array.from(document.querySelectorAll(selector));
}

/**
 * Serializes a DOM element back to an HTML string.
 * @param {Element} element - The DOM element to serialize.
 * @returns {string} - The serialized HTML string.
 */
export function serializeElementToHTML(element) {
  if (!(element instanceof JSDOM('').window.Element)) {
    throw new Error('Provided argument is not a valid DOM element.');
  }
  return element.outerHTML;
}

/**
 * Counts the occurrences of a specific tag in the provided HTML content.
 * @param {string} htmlContent - The raw HTML string to parse.
 * @param {string} tagName - The tag name to count (e.g., 'div', 'p').
 * @returns {number} - The count of matching tags.
 */
export function countTagsInHTML(htmlContent, tagName) {
  if (typeof tagName !== 'string' || !tagName.trim()) {
    throw new Error('Invalid tag name provided.');
  }
  const document = parseHTMLToDOM(htmlContent);
  return document.getElementsByTagName(tagName).length;
}

/**
 * Extracts all hyperlinks (anchor tags) from the provided HTML content.
 * @param {string} htmlContent - The raw HTML string to parse.
 * @returns {Array} - An array of hyperlink URLs.
 */
export function extractHyperlinks(htmlContent) {
  const document = parseHTMLToDOM(htmlContent);
  const anchors = document.getElementsByTagName('a');
  return Array.from(anchors).map(anchor => anchor.href).filter(href => href);
}