```javascript
'use strict';

const { BenchmarkSuite, ACP } = require('./framework.js');
const { buildSystemPipeline } = require('./system.js');

async function main() {
  const suite = new BenchmarkSuite();

  suite.add('pipeline_baseline', async () => {
    const pipeline = buildSystemPipeline();
    const input = ACP.serialize({
      from: 'benchmark',
      to: 'system',
      type: 'test_run',
      payload: { runID: 1, timestamp: Date.now() },
    });

    const pipelineResult = await pipeline.run(input, {});
    const decodedResult = ACP.deserialize(pipelineResult);

    // Extract score (plasticity metrics)
    const deltaWeight = decodedResult.payload.plasticityMetrics.totalWeightChange || 0;
    return deltaWeight * 100; // Scale score
  }, { iters: 5 }); // Five iterations for robustness

  const summary = await suite.run({});
  console.log('[BENCHMARK SUMMARY]', summary.summary);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('BENCHMARK ERROR', err.message);
    process.exitCode = 1;
  });
}
```