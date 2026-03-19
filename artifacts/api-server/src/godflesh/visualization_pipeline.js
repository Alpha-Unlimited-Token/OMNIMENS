/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { stableStringify } = require('./framework.js');

/**
 * Validates the input data for spikes and weights.
 * @param {Array} spikes - Array of spike events.
 * @param {Array<Array<number>>} weights - 2D weight matrix.
 * @returns {boolean} Indicates if the input data is valid.
 * Throws errors for specific validation failures.
 */
function validateSpikeAndWeightData(spikes, weights) {
  // Validate spikes
  if (!Array.isArray(spikes)) throw new Error('Input spikes must be an array.');
  for (const spike of spikes) {
    if (typeof spike.neuronIndex !== 'number' || spike.neuronIndex < 0) {
      throw new Error(
        `Invalid spike neuronIndex: ${JSON.stringify(spike)}. Must be non-negative.`
      );
    }
    if (typeof spike.time !== 'number' || spike.time < 0) {
      throw new Error(
        `Invalid spike time: ${JSON.stringify(spike)}. Must be non-negative.`
      );
    }
  }

  // Validate weights
  if (!Array.isArray(weights) || weights.length === 0) {
    throw new Error('Input weights must be a non-empty 2D array.');
  }
  const rowLength = weights[0].length;
  for (const row of weights) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error(
        `Weights array must be rectangular. Found inconsistent row length: ${JSON.stringify(
          row
        )}`
      );
    }

    for (const weight of row) {
      if (typeof weight !== 'number' || weight < 0) {
        throw new Error(`Invalid weight value: ${weight}. Must be non-negative.`);
      }
    }
  }

  return true;
}

/**
 * Generates an interactive HTML visualization for spikes, weights, and diagnostics.
 * @param {Object} param - Data for visualization.
 * @param {Array} param.spikes - Array of spike events.
 * @param {Array<Array<number>>} param.weights - 2D array for weights.
 * @param {Object} param.metrics - Metrics like memory, runtime details, etc.
 * @param {string} outputDir - Directory where the HTML file will be saved.
 * @returns {string} The path to the generated HTML visualization file.
 */
function generateSpikeAndWeightVisualization({ spikes, weights, metrics }, outputDir) {
  validateSpikeAndWeightData(spikes, weights);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const spikesHtml = generateSpikeTimelineHTML(spikes);
  const weightsHtml = generateWeightHeatmapHTML(weights);
  const diagnosticsHtml = generateDiagnosticsHTML(metrics);

  const templateHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spike and Weight Visualization</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px auto;
            text-align: center;
            max-width: 800px;
          }
          .heatmap {
            display: grid;
            grid-template-columns: repeat(${weights[0] && weights[0].length || 1}, 30px);
            gap: 2px;
          }
          .heatmap div {
            height: 30px;
            text-align: center;
            padding: 3px;
          }
          .spike-event, .metric {
            margin: 5px 0;
          }
          .metrics {
            text-align: left;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Neural Activity and Synaptic Weight Visualization</h1>
        <h2>Spike Timeline</h2>
        ${spikesHtml}
        <h2>Weight Heatmap</h2>
        ${weightsHtml}
        <h2>System Diagnostics</h2>
        ${diagnosticsHtml}
      </body>
    </html>
  `;

  const outputPath = path.join(outputDir, 'visualization.html');
  fs.writeFileSync(outputPath, templateHtml, 'utf8');
  console.log(`[INFO] Visualization file written to: ${outputPath}`);
  return outputPath;
}

/**
 * Generates HTML for spike event visualization.
 */
function generateSpikeTimelineHTML(spikes) {
  if (!spikes.length) return '<p>No spike events to display</p>';
  return spikes
    .map(
      (s) =>
        `<p class="spike-event">Neuron ${s.neuronIndex} spiked at ${s.time}ms.</p>`
    )
    .join('');
}

/**
 * Generates HTML for weights as a heatmap visualization.
 */
function generateWeightHeatmapHTML(weights) {
  const maxWeight = Math.max(...weights.flat());
  return `
    <div class="heatmap">
      ${weights
        .map((row) =>
          row
            .map(
              (w) =>
                `<div style="background-color: rgba(0,0,200,${w / maxWeight});">${w.toFixed(
                  2
                )}</div>`
            )
            .join('')
        )
        .join('')}
    </div>
  `;
}

/**
 * Generates HTML for diagnostics and system metrics.
 */
function generateDiagnosticsHTML(metrics) {
  const memory = metrics.memoryUsage || 0;
  const runtime = metrics.runtime || 0;
  const eventCount = metrics.eventCount || 0;

  return `
    <div class="metrics">
      <p class="metric">Memory Usage: ${memory.toFixed(
        2
      )} MB</p>
      <p class="metric">Runtime: ${runtime.toFixed(2)} ms</p>
      <p class="metric">Events Processed: ${eventCount}</p>
    </div>
  `;
}

// Module export
module.exports = {
  generateSpikeAndWeightVisualization,
};

// Test Execution
if (require.main === module) {
  const spikes = [
    { neuronIndex: 0, time: 10 },
    { neuronIndex: 2, time: 50 },
  ];
  const weights = [
    [0.1, 0.5, 0.7],
    [0.2, 0.9, 0.3],
    [0.9, 0.4, 0.8],
  ];
  const metrics = {
    memoryUsage: 14.3,
    runtime: 120.5,
    eventCount: 25,
  };

  const outputPath = generateSpikeAndWeightVisualization(
    { spikes, weights, metrics },
    path.join(__dirname, 'output')
  );
  console.log(
    `[TEST] Visualization successfully created. View at: ${outputPath}`
  );
}