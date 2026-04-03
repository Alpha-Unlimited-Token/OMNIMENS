  export function simulateCounterfactuals(agentState, scenarios) {
  return scenarios.map(scenario => {
const modifiedState = { ...agentState, ...scenario.modifications };
const result = agentState.evaluate(modifiedState);
  return { scenario, result, isRobust: result.successRate > 0.8 };
});
}
  export function testCooperativeStrategies(agents, scenarios) {
  return agents.map(spawn => simulateCounterfactuals(spawn.state, scenarios));
}