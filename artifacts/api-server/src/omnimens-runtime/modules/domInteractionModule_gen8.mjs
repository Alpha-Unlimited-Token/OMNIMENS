/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: domInteractionModule
 * Written: 2026-04-03T06:07:47.149Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// domInteractionModule.mjs

import { JSDOM } from 'node:jsdom';

/**
 * Parses HTML content and returns a DOM object for traversal and manipulation.
 * @param {string} html - The raw HTML string to parse.
 * @returns {Document} - The parsed DOM Document object.
 */
export function parseHTMLToDOM(html) {
  if (typeof html !== 'string' || !html.trim()) {
    throw new Error('Invalid HTML input: must be a non-empty string.');
  }
  const { window } = new JSDOM(html);
  return window.document;
}

/**
 * Extracts all elements matching a given CSS selector from a DOM Document.
 * @param {Document} dom - The DOM Document object to query.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {Array} - An array of matching elements.
 */
export function queryDOM(dom, selector) {
  if (!(dom instanceof dom.defaultView.Document)) {
    throw new Error('Invalid DOM input: must be a valid Document object.');
  }
  if (typeof selector !== 'string' || !selector.trim()) {
    throw new Error('Invalid selector: must be a non-empty string.');
  }
  return Array.from(dom.querySelectorAll(selector));
}

/**
 * Executes a JavaScript function in the context of a DOM Document.
 * @param {Document} dom - The DOM Document object to execute within.
 * @param {Function} domFunction - A function that operates on the DOM.
 * @returns {*} - The result of the executed function.
 */
export function executeInDOMContext(dom, domFunction) {
  if (!(dom instanceof dom.defaultView.Document)) {
    throw new Error('Invalid DOM input: must be a valid Document object.');
  }
  if (typeof domFunction !== 'function') {
    throw new Error('Invalid function: must be a callable function.');
  }
  return domFunction(dom);
}

/**
 * Serializes a DOM Document back into an HTML string.
 * @param {Document} dom - The DOM Document object to serialize.
 * @returns {string} - The serialized HTML string.
 */
export function serializeDOMToHTML(dom) {
  if (!(dom instanceof dom.defaultView.Document)) {
    throw new Error('Invalid DOM input: must be a valid Document object.');
  }
  return dom.documentElement.outerHTML;
}

/**
 * Utility function to safely extract text content from elements matching a selector.
 * @param {Document} dom - The DOM Document object to query.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {Array} - An array of text content from matching elements.
 */
export function extractTextFromDOM(dom, selector) {
  const elements = queryDOM(dom, selector);
  return elements.map(element => element.textContent.trim());
}

/**
 * Utility function to modify attributes of elements matching a selector.
 * @param {Document} dom - The DOM Document object to query.
 * @param {string} selector - The CSS selector to match elements.
 * @param {string} attribute - The attribute to modify.
 * @param {string} value - The new value for the attribute.
 */
export function modifyDOMAttributes(dom, selector, attribute, value) {
  const elements = queryDOM(dom, selector);
  elements.forEach(element => {
    element.setAttribute(attribute, value);
  });
}
