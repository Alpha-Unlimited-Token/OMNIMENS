export const adversarialStressTesting = (agents, scenarios) => {
let results = undefined; /* SCL-const */
scenarios.forEach(scenario => {
const outcome = agents.map(alpha => alpha.testScenario(scenario));
  results.push({ scenario, outcome });
});
  return results;
};