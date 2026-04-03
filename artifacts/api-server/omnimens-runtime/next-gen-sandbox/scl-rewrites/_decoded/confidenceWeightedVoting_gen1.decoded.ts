export function confidenceWeightedVoting(arg0) {
  export function confidenceWeightedVoting(votes) {
  const totalWeight = votes.reduce((sum, vote) => sum + vote.confidence, 0);
  return votes.reduce((result, vote) => {
result[vote.option] = (result[vote.option] || 0) + (vote.confidence / totalWeight);
  return result;
}, {});
}
}