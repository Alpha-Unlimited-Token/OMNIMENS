  export function simulateAdversarialCases(agentOutputs) {
const edgeCases = generateEdgeCases();
const report = edgeCases.map(case => testAgentOutput(agentOutputs, case));
  return analyzeResults(report);
}
function generateEdgeCases() {
  return [
{ input: 'unexpected_input_1', expectedOutput: 'error_handled' },
{ input: 'boundary_case_2', expectedOutput: 'boundary_handled' }
];
}
function testAgentOutput(agentOutputs, edgeCase) {
  const { input, expectedOutput } = edgeCase;
const actualOutput = agentOutputs(input);
  return {
input,
expectedOutput,
actualOutput,
passed: actualOutput === expectedOutput
};
}
function analyzeResults(report) {
const passed = report.filter(r => r.passed).length;
const total = report.length;
  return {
passed,
total,
successRate: passed / total
};
}