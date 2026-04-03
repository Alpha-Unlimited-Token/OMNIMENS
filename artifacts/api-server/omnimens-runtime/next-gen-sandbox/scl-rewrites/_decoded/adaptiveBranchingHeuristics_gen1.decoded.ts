export function adaptiveHeuristics(arg0, arg1) {
  export function adaptiveHeuristics(branches, heuristicFunction) {
  return branches.filter(branch => heuristicFunction(branch) > 0.5);
}
}