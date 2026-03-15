```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { generateHeatmap } = require('./visualization');

// Directory for storing test HTML files
const TEST_DIR = path.join(__dirname, 'test_output');

// Ensure the directory exists
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

function testValidHeatmap() {
  const data = { histogram: [10, 25, 35, 20, 15] };
  const outputPath = path.join(TEST_DIR, 'valid_heatmap.html');
  generateHeatmap(data, outputPath);

  const html = fs.readFileSync(outputPath, 'utf8');
  assert(html.includes('<!DOCTYPE html>'), 'Missing DOCTYPE declaration');
  assert(html.includes('Weight Change Histogram Heatmap'), 'Missing title');
  assert(html.includes('rgba'), 'Missing segment with color mapping');
}

function testEmptyHistogram() {
  const outputPath = path.join(TEST_DIR, 'empty_histogram.html');
  generateHeatmap({}, outputPath);

  const html = fs.readFileSync(outputPath, 'utf8');
  assert(html.includes('No Data Available'), 'Expected message for empty histogram missing');
}

// Run all tests
if (require.main === module) {
  console.log('Running visualization heatmap tests...');
  testValidHeatmap();
  testEmptyHistogram();
  console.log('All visualization tests passed.');
}
```