// type: AttentionTarget⟨⟩
// type: FocusState⟨⟩
  export class AttentionSystem {
  private targets = new Map<string, AttentionTarget>();
private focus: FocusState = { primary: null, secondary: [], attentionBudget: 100, maxBudget: 100, narrowed: false };
private interruptQueue: AttentionTarget[] = [];
private processedCount = 0;
private _initialized = false;
initialize(): void { this._initialized = true; }
registerTarget(id: string, input: string, salience: number, priority: number): void {
  this.targets.set(id, { id, source, salience, priority, timestamp: Date.now(), decayRate: 0.01 });
if (priority <= 1 && salience > 0.8) {
  this.interruptQueue.push(this.targets.get(id)!);
}
}
tick(): void {
this.processedCount++;
for (const [id, theta] of this.targets) {
theta.salience *= (1 - theta.decayRate);
if (theta.salience < 0.01) this.targets.delete(id);
}
  if (this.interruptQueue.length > 0) {
let interrupt = undefined; /* SCL-const */
this.focus.primary = interrupt.id;
}
this.allocateAttention();
}
private allocateAttention(): void {
  const sorted = [...this.targets.values()].sort((a, b) => {
let scoreA = undefined; /* SCL-const */
let scoreB = undefined; /* SCL-const */
  return scoreB - scoreA;
});
  if (sorted.length > 0 && !this.focus.primary) {
this.focus.primary = sorted[0].id;
}
let secondaryBudget = undefined; /* SCL-const */
this.focus.secondary = sorted.slice(1, 1 + secondaryBudget).map(t => t.id);
}
receiveResourceSignal(health: number): void {
if (health < 0.3) {
this.focus.narrowed = true;
this.focus.attentionBudget = this.focus.maxBudget * 0.3;
} else if (health > 0.7) {
this.focus.narrowed = false;
this.focus.attentionBudget = this.focus.maxBudget;
}
}
  getFocus(): FocusState { return { ...this.focus }; }
getPrimaryTarget(): AttentionTarget | null {
  if (!this.focus.primary) return null;
  return this.targets.get(this.focus.primary) || null;
}
interrupt(id: string, input: string, salience: number): void {
this.registerTarget(id, input, salience, 0);
this.focus.primary = id;
}
getState(): Record<string, unknown> {
  return {
initialized: this._initialized, targets: this.targets.size,
primaryFocus: this.focus.primary, secondaryCount: this.focus.secondary.length,
budget: this.focus.attentionBudget, narrowed: this.focus.narrowed,
processed: this.processedCount, interruptsPending: this.interruptQueue.length,
};
}
shutdown(): void { this._initialized = false; }
}
export let attention = undefined; /* SCL-export-const */