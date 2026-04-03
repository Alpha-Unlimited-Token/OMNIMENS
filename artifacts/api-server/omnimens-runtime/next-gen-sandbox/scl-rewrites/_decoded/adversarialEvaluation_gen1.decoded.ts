  export function adversarialEvaluation(modifications, scenarios) {
const report = scenarios.map(scenario => {
  return modifications.map(mod => {
  const simulatedOutcome = scenario.test(mod);
  return { modification: mod.id, success: simulatedOutcome.isSafe };
});
});
  return report.every(result => result.every(outcome => outcome.success));
}