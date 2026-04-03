export const adversarialStressTesting = (agents, scenarios) => {
let results = undefined; /* SCL-const */
scenarios.forEach(scenario => {
const outcome = agents.map(spawn => spawn.testScenario(scenario));
  results.push({ scenario, outcome });
});
  return results;
};