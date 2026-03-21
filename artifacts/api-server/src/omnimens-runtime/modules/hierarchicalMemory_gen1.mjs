/**
 * @module hierarchicalMemory
 * @description A utility module for hierarchical summarization and chunking of context to retain conversation coherence dynamically.
 */

/**
 * Summarizes a given text by extracting key sentences based on topic relevance.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - The maximum number of sentences to include in the summary.
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, maxSentences = 3) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }

  const sentences = text.split('.').map(s => s.trim()).filter(Boolean);
  if (sentences.length <= maxSentences) {
    return text;
  }

  const step = Math.ceil(sentences.length / maxSentences);
  const summary = sentences.filter((_, index) => index % step === 0).slice(0, maxSentences);

  return summary.join('. ') + '.';
}

/**
 * Segments text into topics by splitting based on keywords or paragraph breaks.
 * @param {string} text - The input text to segment.
 * @param {Array<string>} keywords - Keywords to identify topic boundaries.
 * @returns {Array<string>} - An array of segmented topics.
 */
export function segmentTopics(text, keywords = []) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }

  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');
  const segments = text.split(/\n|\r\n/).reduce((acc, paragraph) => {
    if (keywords.length > 0 && regex.test(paragraph)) {
      acc.push(paragraph);
    } else if (acc.length > 0) {
      acc[acc.length - 1] += ' ' + paragraph;
    } else {
      acc.push(paragraph);
    }
    return acc;
  }, []);

  return segments.map(segment => segment.trim()).filter(Boolean);
}

/**
 * Recursively summarizes and segments text into a hierarchical structure.
 * @param {string} text - The input text to process.
 * @param {number} levels - The number of hierarchical levels to create.
 * @param {Array<string>} keywords - Keywords to aid in topic segmentation.
 * @returns {Object} - A hierarchical representation of the text.
 */
export function hierarchicalSummarization(text, levels = 2, keywords = []) {
  if (levels < 1) {
    throw new Error('Levels must be a positive integer.');
  }

  const segments = segmentTopics(text, keywords);
  const hierarchy = segments.map(segment => {
    const summary = summarizeText(segment);
    return levels > 1
      ? {
          summary,
          details: hierarchicalSummarization(segment, levels - 1, keywords)
        }
      : { summary };
  });

  return hierarchy;
}

/**
 * Dynamically compresses context by summarizing and chunking it hierarchically.
 * @param {string} context - The input context to compress.
 * @param {number} levels - The number of hierarchical levels to create.
 * @param {Array<string>} keywords - Keywords to aid in topic segmentation.
 * @returns {Object} - A compressed representation of the context.
 */
export function compressContext(context, levels = 2, keywords = []) {
  return hierarchicalSummarization(context, levels, keywords);
}

/**
 * Example usage of the hierarchicalMemory module.
 */
if (false) {
  const testText = `Artificial Intelligence is evolving rapidly. Machine learning and deep learning are key areas. 
  Transformers have revolutionized natural language processing. Efficient attention mechanisms are critical. 
  Cognitive architectures are emerging to enhance memory and reasoning.`;

  const compressed = compressContext(testText, 2, ['Transformers', 'cognitive']);
  console.log(JSON.stringify(compressed, null, 2));
}