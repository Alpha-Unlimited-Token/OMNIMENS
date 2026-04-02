/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: headlessBrowserAgent
 * Written: 2026-04-02T14:12:20.048Z
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

import { URL } from 'url';

/**
 * Parses a URL and extracts its components.
 * @param {string} urlString - The URL string to parse.
 * @returns {Object} An object containing protocol, hostname, path, and query parameters.
 */
export function parseUrl(urlString) {
  try {
    const url = new URL(urlString);
    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return {
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      queryParams: queryParams
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${urlString}`);
  }
}

/**
 * Generates a random string for use as unique identifiers.
 * @param {number} length - The desired length of the random string.
 * @returns {string} A random alphanumeric string of the specified length.
 */
export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Debounces a function, ensuring it is only executed after a specified delay.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} A debounced version of the input function.
 */
export function debounceFunction(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Useful for text similarity comparisons.
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {number} The Levenshtein distance between the two strings.
 */
export function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[len1][len2];
}

/**
 * Validates if a string is a valid JSON.
 * @param {string} jsonString - The string to validate.
 * @returns {boolean} True if valid JSON, otherwise false.
 */
export function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}
