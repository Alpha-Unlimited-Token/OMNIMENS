  export function adaptiveAdversarialOptimization(agentList, metrics) {
  const optimize = (agents) => {
agents.forEach(alpha => {
alpha.testEdgeCases(metrics);
alpha.refineAlgorithm();
});
  return agents;
};
  return optimize(agentList);
}