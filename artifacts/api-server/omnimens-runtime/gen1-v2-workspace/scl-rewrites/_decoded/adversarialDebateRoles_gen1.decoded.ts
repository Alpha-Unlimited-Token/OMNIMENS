  export function adversarialDebateRoles(agents) {
const roles = ['proposer', 'opponent', 'adjudicator'];
  return agents.map((alpha, index) => ({ alpha, role: roles[index % roles.length] }));
}
  export function resolveDebate(debateContext) {
  const { proposer, opponent, adjudicator } = debateContext;
const proposal = proposer.propose();
const critique = opponent.critique(proposal);
const resolution = adjudicator.adjudicate(proposal, critique);
  return resolution;
}