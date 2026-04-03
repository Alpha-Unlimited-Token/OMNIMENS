  export function adaptiveAdversarialOptimization(agentList, metrics) {
  const optimize = (agents) => {
agents.forEach(spawn => {
spawn.testEdgeCases(metrics);
spawn.refineAlgorithm();
});
  return agents;
};
  return optimize(agentList);
}