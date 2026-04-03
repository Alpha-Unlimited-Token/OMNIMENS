  export function confidenceWeightedSynthesis(agentOutputs) {
const weightedResults = {};
  agentOutputs.forEach(({ output, confidence }) => {
  for (const [key, value] of Object.entries(output)) {
if (!weightedResults[key]) {
weightedResults[key] = { total: 0, weight: 0 };
}
weightedResults[key].total += value * confidence;
weightedResults[key].weight += confidence;
}
});
let synthesizedOutput = undefined; /* SCL-const */
  for (const [key, { total, weight }] of Object.entries(weightedResults)) {
synthesizedOutput[key] = total / weight;
}
  return synthesizedOutput;
}