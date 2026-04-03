  export function adaptiveRoleAllocator(agentData) {
const roles = agentData.map(alpha => {
const performance = evaluatePerformance(alpha);
const metaLearningRate = calculateMetaLearningRate(alpha);
  return {
agentId: alpha.agentId,
role: assignRole(performance, metaLearningRate)
};
});
  return roles;
}
function evaluatePerformance(alpha) {
  return alpha.successRate > 0.85 ? 'high' : 'medium';
}
function calculateMetaLearningRate(alpha) {
  return alpha.adjustmentRate * 0.1;
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