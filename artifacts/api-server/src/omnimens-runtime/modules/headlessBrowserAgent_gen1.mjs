/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_32
 * Name: headlessBrowserAgent
 * Purpose: Enable real-time interaction with web-based environments and dynamic content.
 * Description: A utility module providing web parsing, text processing, and data analysis tools for cross-agent use.
 * Migrated: 2026-04-01T22:23:20.243Z
 */

// Complete ES module code here

import { URL } from 'url';

/**
 * Parses a given URL and extracts domain, path, and query parameters.
 * Useful for agents needing structured web data.
 */
export function parseUrl(inputUrl) {
  try {
    const urlObj = new URL(inputUrl);
    return {
      domain: urlObj.hostname,
      path: urlObj.pathname,
      queryParams: Object.fromEntries(urlObj.searchParams.entries())
    };
  } catch (error) {
    return { error: 'Invalid URL format' };
  }
}

/**
 * Simulates a simple DOM traversal to extract specific tags and their content.
 * Input: HTML string, tag name.
 * Output: Array of tag content.
 */
export function extractTagContent(htmlString, tagName) {
  try {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'g');
    const matches = [];
    let match;
    while ((match = regex.exec(htmlString)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  } catch (error) {
    return { error: 'Error extracting tag content' };
  }
}

/**
 * Generates a unique identifier (UUID v4) for session tracking or unique entity identification.
 */
export function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.randomUUID().charCodeAt(Math.random() * 16) & 15).toString(16)
  );
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Useful for text similarity, search ranking, or error correction.
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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[len1][len2];
}

/**
 * Encodes a given string into Base64 format.
 * Useful for data serialization or secure transmission.
 */
export function encodeBase64(inputString) {
  return Buffer.from(inputString).toString('base64');
}

/**
 * Decodes a Base64-encoded string back to its original format.
 */
export function decodeBase64(base64String) {
  try {
    return Buffer.from(base64String, 'base64').toString('utf-8');
  } catch (error) {
    return { error: 'Invalid Base64 format' };
  }
}

/**
 * Sanitizes an HTML string by removing potentially harmful tags.
 * Useful for preventing XSS attacks or cleaning user input.
 */
export function sanitizeHtml(htmlString) {
  const allowedTags = ['b', 'i', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'a'];
  const regex = /<\/?.*?>/g;
  return htmlString.replace(regex, (tag) => {
    const tagName = tag.match(/<\/?(\w+)/)?.[1];
    return allowedTags.includes(tagName) ? tag : '';
  });
}

/**
 * Extracts all unique words from a given text, ignoring case and punctuation.
 * Useful for text analysis or keyword extraction.
 */
export function extractUniqueWords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g);
  return Array.from(new Set(words));
}
