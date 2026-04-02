/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: domInteractionBridge
 * Written: 2026-04-02T14:12:11.893Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// domInteractionBridge.mjs

import { JSDOM } from 'jsdom';

/**
 * Parses HTML content and returns a virtual DOM object for further manipulation.
 * @param {string} html - The raw HTML string to parse.
 * @returns {Document} - A JSDOM Document object representing the parsed DOM.
 */
export function parseHTMLToDOM(html) {
    if (typeof html !== 'string' || html.trim() === '') {
        throw new Error('Invalid HTML input: must be a non-empty string.');
    }
    const dom = new JSDOM(html);
    return dom.window.document;
}

/**
 * Extracts all elements matching a given CSS selector from a DOM object.
 * @param {Document} dom - The DOM object to search within.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {Array} - An array of matching elements.
 */
export function extractElementsBySelector(dom, selector) {
    if (!dom || typeof selector !== 'string' || selector.trim() === '') {
        throw new Error('Invalid Array.from(/* args */{}): DOM and non-empty selector are required.');
    }
    return Array.from(dom.querySelectorAll(selector));
}

/**
 * Modifies the attributes of elements matching a given CSS selector.
 * @param {Document} dom - The DOM object to manipulate.
 * @param {string} selector - The CSS selector to match elements.
 * @param {Object} attributes - An object where keys are attribute names and values are the new values.
 */
export function modifyAttributes(dom, selector, attributes) {
    if (!dom || typeof selector !== 'string' || typeof attributes !== 'object') {
        throw new Error('Invalid Array.from(/* args */{}): DOM, selector, and attributes object are required.');
    }
    const elements = dom.querySelectorAll(selector);
    elements.forEach(element => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    });
}

/**
 * Serializes a DOM object back into an HTML string.
 * @param {Document} dom - The DOM object to serialize.
 * @returns {string} - The serialized HTML string.
 */
export function serializeDOMToHTML(dom) {
    if (!dom) {
        throw new Error('Invalid DOM input: DOM object is required.');
    }
    return dom.documentElement.outerHTML;
}

/**
 * Utility function to extract text content from elements matching a CSS selector.
 * @param {Document} dom - The DOM object to search within.
 * @param {string} selector - The CSS selector to match elements.
 * @returns {Array} - An array of text content from matching elements.
 */
export function extractTextContent(dom, selector) {
    if (!dom || typeof selector !== 'string' || selector.trim() === '') {
        throw new Error('Invalid Array.from(/* args */{}): DOM and non-empty selector are required.');
    }
    return Array.from(dom.querySelectorAll(selector)).map(element => element.textContent.trim());
}

/**
 * Utility to remove elements matching a given CSS selector from the DOM.
 * @param {Document} dom - The DOM object to manipulate.
 * @param {string} selector - The CSS selector to match elements to remove.
 */
export function removeElementsBySelector(dom, selector) {
    if (!dom || typeof selector !== 'string' || selector.trim() === '') {
        throw new Error('Invalid Array.from(/* args */{}): DOM and non-empty selector are required.');
    }
    const elements = dom.querySelectorAll(selector);
    elements.forEach(element => element.remove());
}
