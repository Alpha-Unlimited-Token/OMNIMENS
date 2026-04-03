  export function adversarialEvaluation(modifications, scenarios) {
const results = scenarios.map(scenario => {
  return modifications.map(mod => {
  const simulatedOutcome = scenario.test(mod);
  return { modification: mod.id, success: simulatedOutcome.isSafe };
});
});
  return results.every(result => result.every(outcome => outcome.success));
}