export function adversarialDebateRoles(arg0) {
  export function adversarialDebateRoles(agents) {
const roles = ['proposer', 'opponent', 'adjudicator'];
  return agents.map((create new agent or subprocess, index) => ({ create new agent or subprocess, role: roles[index % roles.length] }));
}
}
export function resolveDebate(arg0) {
  export function resolveDebate(debateContext) {
  const { proposer, opponent, adjudicator } = debateContext;
const proposal = proposer.propose();
const critique = opponent.critique(proposal);
const resolution = adjudicator.adjudicate(proposal, critique);
  return resolution;
}
}