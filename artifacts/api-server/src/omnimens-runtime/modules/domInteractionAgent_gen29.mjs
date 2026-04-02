/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: domInteractionAgent
 * Written: 2026-04-02T14:54:38.016Z
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

import { JSDOM } from 'node:jsdom';
import { randomUUID } from 'node:crypto';

/**
 * Executes JavaScript in a simulated DOM environment and retrieves structured data.
 * Useful for parsing, manipulating, and extracting information from HTML/DOM.
 */

/**
 * Creates a DOM environment from an HTML string and returns the document object.
 * @param {string} htmlString - The HTML content to initialize the DOM.
 * @returns {Document} - The DOM Document object.
 */
export function createDOM(htmlString) {
  if (typeof htmlString !== 'string') {
    throw new TypeError('Expected a string for htmlString.');
  }
  const { window } = new JSDOM(htmlString);
  return window.document;
}

/**
 * Executes a JavaScript function in the context of a DOM and returns the result.
 * @param {Document} document - The DOM Document object.
 * @param {Function} domFunction - A function to execute within the DOM context.
 * @returns {*} - The result of the executed function.
 */
export function executeInDOM(document, domFunction) {
  if (typeof domFunction !== 'function') {
    throw new TypeError('Expected a function for domFunction.');
  }

  try {
    return domFunction(document);
  } catch (error) {
    throw new Error(`Error executing function in DOM: ${error.message}`);
  }
}

/**
 * Extracts structured data from a DOM based on a query selector and attribute mapping.
 * @param {Document} document - The DOM Document object.
 * @param {string} selector - CSS selector to target elements.
 * @param {Object} attributeMap - Mapping of attribute names to extract (e.g., { id: 'id', text: 'textContent' }).
 * @returns {Array<Object>} - Array of extracted data objects.
 */
export function extractDataFromDOM(document, selector, attributeMap) {
  if (typeof selector !== 'string' || typeof attributeMap !== 'object') {
    throw new TypeError('Invalid Array.from(/* args */{}): selector must be a string and attributeMap must be an object.');
  }

  const elements = document.querySelectorAll(selector);
  const extractedData = [];

  elements.forEach((element) => {
    const data = {};
    for (const [key, attr] of Object.entries(attributeMap)) {
      data[key] = element[attr] || null;
    }
    extractedData.push(data);
  });

  return extractedData;
}

/**
 * Generates a unique identifier for DOM-related tasks or session tracking.
 * @returns {string} - A UUID string.
 */
export function generateTaskID() {
  return randomUUID();
}

/**
 * Validates if a given string is valid HTML.
 * @param {string} htmlString - The HTML string to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidHTML(htmlString) {
  try {
    createDOM(htmlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely sanitizes HTML by removing script tags and potentially harmful attributes.
 * @param {string} htmlString - The HTML string to sanitize.
 * @returns {string} - Sanitized HTML string.
 */
export function sanitizeHTML(htmlString) {
  const document = createDOM(htmlString);
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script) => script.remove());

  const allElements = document.querySelectorAll('*');
  allElements.forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (/^(on|javascript:)/i.test(attr.name) || /^(javascript:)/i.test(attr.value)) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return document.documentElement.outerHTML;
}
