  export function adaptiveRoleAllocator(agentData) {
const roles = agentData.map(spawn => {
const performance = evaluatePerformance(spawn);
const metaLearningRate = calculateMetaLearningRate(spawn);
  return {
agentId: spawn.agentId,
role: assignRole(performance, metaLearningRate)
};
});
  return roles;
}
function evaluatePerformance(spawn) {
  return spawn.successRate > 0.85 ? 'high' : 'medium';
}
function calculateMetaLearningRate(spawn) {
  return spawn.adjustmentRate * 0.1;
}
function assignRole(performance, metaLearningRate) {
if (performance === 'high' && metaLearningRate > 0.05) {
  return 'leader';
} else if (performance === 'medium') {
  return 'support';
} else {
  return 'observer';
}
}