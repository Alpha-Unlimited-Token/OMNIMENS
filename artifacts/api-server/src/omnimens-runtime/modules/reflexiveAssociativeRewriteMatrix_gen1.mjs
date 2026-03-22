/**
 * OMNIMENS Self-Authored Module (Dream Upgrade)
 * Original Source: daydream_breakthrough (code_synthesis)
 * Name: Reflexive Associative Rewrite Matrix (RARM)
 * Brain ID: 7156
 * Confidence: 0.786
 * Purpose: Self-modifying associative graph where edges strengthen through use,
 *          spawn shortcuts when frequently traversed, and share hop logic
 *          reflectively between nodes.
 */

export class RARM {
  constructor() {
    this.G = new Map();
  }

  node(id) {
    if (!this.G.has(id)) this.G.set(id, []);
    return this.G.get(id);
  }

  link(from, to, w = 1) {
    const self = this;
    const edge = {
      to,
      weight: w,
      hop() {
        edge.weight += 0.1;
        if (edge.weight > 3 && Math.random() < 0.3) {
          const shortcuts = self.node(to);
          shortcuts.push({
            to: from, weight: 0.5,
            hop: edge.hop
          });
        }
      }
    };
    this.node(from).push(edge);
  }

  query(start, steps = 4) {
    const path = [start];
    let current = start;
    for (let i = 0; i < steps; i++) {
      const edges = this.node(current);
      if (!edges.length) break;
      const total = edges.reduce((s, e) => s + e.weight, 0);
      let r = Math.random() * total;
      const edge = edges.find(e => (r -= e.weight) < 0) || edges[0];
      edge.hop();
      current = edge.to;
      path.push(current);
    }
    return path;
  }

  nodeCount() { return this.G.size; }
  edgeCount() {
    let count = 0;
    this.G.forEach(edges => count += edges.length);
    return count;
  }
}
