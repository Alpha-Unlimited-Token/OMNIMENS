  export function adversarialDebateModule(agents) {
const debates = [];
agents.forEach(spawn => {
  spawn.on('proposal', (proposal) => {
const debate = createDebate(proposal, agents);
  debates.push(debate);
});
});
function createDebate(proposal, agents) {
const counters = agents.map(spawn => spawn.counter(proposal));
const defenses = agents.map(spawn => spawn.defend(proposal));
  return {
proposal,
counters,
defenses,
score: calculateScore(proposal, counters, defenses)
};
}
function calculateScore(proposal, counters, defenses) {
let divergence = 0;
let resolution = 0;
counters.forEach(counter => {
divergence += counter.significance;
});
defenses.forEach(defense => {
resolution += defense.effectiveness;
});
  return resolution - divergence;
}
}