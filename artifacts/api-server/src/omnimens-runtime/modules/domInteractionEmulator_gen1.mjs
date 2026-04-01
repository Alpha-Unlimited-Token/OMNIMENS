/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_19
 * Name: domInteractionEmulator
 * Purpose: Simulates browser interactions and extracts visual or interactive data from web pages.
 * Description: Simulates browser-like DOM interactions and provides utilities for hierarchical data extraction and manipulation.
 * Migrated: 2026-04-01T22:23:20.233Z
 */

// domInteractionEmulator.mjs

import { JSDOM } from 'jsdom';

/**
 * Simulates a DOM environment and provides utilities for interaction emulation and data extraction.
 * @module domInteractionEmulator
 */

/**
 * Creates a virtual DOM from an HTML string and returns the document object.
 * @param {string} html - The HTML content to render.
 * @returns {Document} - The virtual DOM's document object.
 */
export function createVirtualDOM(html) {
  if (typeof html !== 'string' || html.trim() === '') {
    throw new Error('Invalid HTML input. Expected a non-empty string.');
  }
  const { window } = new JSDOM(html);
  return window.document;
}

/**
 * Extracts hierarchical data from a DOM element and its children.
 * @param {Element} element - The DOM element to extract data from.
 * @returns {object} - A hierarchical representation of the element and its children.
 */
export function extractDOMHierarchy(element) {
  if (!(element instanceof Object) || !element.tagName) {
    throw new Error('Invalid DOM element provided.');
  }

  const hierarchy = {
    tagName: element.tagName,
    attributes: {},
    children: []
  };

  // Extract attributes
  for (const attr of element.attributes) {
    hierarchy.attributes[attr.name] = attr.value;
  }

  // Recursively extract children
  for (const child of element.children) {
    hierarchy.children.push(extractDOMHierarchy(child));
  }

  return hierarchy;
}

/**
 * Simulates a click event on a DOM element.
 * @param {Element} element - The DOM element to simulate the click on.
 * @returns {void}
 */
export function simulateClick(element) {
  if (!(element instanceof Object) || typeof element.click !== 'function') {
    throw new Error('Invalid DOM element provided for click simulation.');
  }
  element.click();
}

/**
 * Searches the DOM for elements matching a CSS selector.
 * @param {Document|Element} root - The root document or element to search within.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {Array<Element>} - An array of matching elements.
 */
export function querySelectorAll(root, selector) {
  if (!(root instanceof Object) || typeof root.querySelectorAll !== 'function') {
    throw new Error('Invalid root element or document provided.');
  }
  if (typeof selector !== 'string' || selector.trim() === '') {
    throw new Error('Invalid CSS selector provided.');
  }
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Extracts text content from a DOM element and its children.
 * @param {Element} element - The DOM element to extract text from.
 * @returns {string} - The concatenated text content.
 */
export function extractTextContent(element) {
  if (!(element instanceof Object) || typeof element.textContent !== 'string') {
    throw new Error('Invalid DOM element provided for text extraction.');
  }
  return element.textContent.trim();
}

/**
 * Modifies an attribute of a DOM element.
 * @param {Element} element - The DOM element to modify.
 * @param {string} attributeName - The name of the attribute to modify.
 * @param {string} value - The new value for the attribute.
 * @returns {void}
 */
export function setAttribute(element, attributeName, value) {
  if (!(element instanceof Object) || typeof element.setAttribute !== 'function') {
    throw new Error('Invalid DOM element provided for attribute modification.');
  }
  if (typeof attributeName !== 'string' || typeof value !== 'string') {
    throw new Error('Invalid attribute name or value provided.');
  }
  element.setAttribute(attributeName, value);
}
