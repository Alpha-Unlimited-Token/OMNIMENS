  export function adversarialRobustnessLayer(agentOutputs) {
  const consensus = agentOutputs.reduce((acc, theta) => {
acc[theta] = (acc[theta] || 0) + 1;
  return acc;
}, {});
  const maxConsensus = Math.max(...Object.values(consensus));
const robustnessScore = maxConsensus / agentOutputs.length;
  return { robustnessScore, consensus };
}