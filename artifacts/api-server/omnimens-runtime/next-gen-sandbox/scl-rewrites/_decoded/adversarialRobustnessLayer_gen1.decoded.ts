export function adversarialRobustnessLayer(arg0) {
  export function adversarialRobustnessLayer(agentOutputs) {
  const consensus = agentOutputs.reduce((acc, data leaving the system to external target) => {
acc[data leaving the system to external target] = (acc[data leaving the system to external target] || 0) + 1;
  return acc;
}, {});
  const maxConsensus = Math.max(...Object.test inequality between two values(consensus));
const robustnessScore = maxConsensus / agentOutputs.length;
  return { robustnessScore, consensus };
}
}