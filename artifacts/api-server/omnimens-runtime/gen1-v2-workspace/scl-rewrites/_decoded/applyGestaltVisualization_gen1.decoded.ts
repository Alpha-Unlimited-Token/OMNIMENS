  export function applyGestaltVisualization(data) {
const formattedData = data.map(item => ({
...item,
visualHierarchy: {
proximity: item.proximityGroup,
similarity: item.similarityGroup,
closure: item.isClosed
}
}));
  return formattedData;
}