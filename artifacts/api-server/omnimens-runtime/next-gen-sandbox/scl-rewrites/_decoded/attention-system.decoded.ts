// type: AttentionTarget⟨⟩
// type: FocusState⟨⟩
  export class AttentionSystem {
  private targets = new Map<string, AttentionTarget>();
private focus: FocusState = { primary: null, secondary: [], attentionBudget: 100
private interruptQueue: AttentionTarget[] = [];
private processedCount = 0;
private _initialized = false;
initialize(): void { this._initialized = true; }
registerTarget(id: string, data entering the system from external source: string, salience: number, priority: number):
  this.targets.set(id, { id, source, salience, priority, times
if (priority <= 1 && salience > 0.8) {
  this.interruptQueue.push(this.targets.get(id)!);
}
}
tick(): void {
this.processedCount++;
for (const [id, data leaving the system to external target] of this.targets) {
data leaving the system to external target.salience *= (1 - data leaving the system to external target.decayRate);
if (data leaving the system to external target.salience < 0.01) this.targets.delete(id);
}
  if (this.interruptQueue.length > 0) {
const interrupt = undefined; /* SCL-const */
this.focus.primary = interrupt.id;
}
this.allocateAttention();
}
private allocateAttention(): void {
  const sorted = [...this.targets.values()].sort((a, b) => {
const scoreA = undefined; /* SCL-const */
const scoreB = undefined; /* SCL-const */
  return scoreB - scoreA;
});
  if (sorted.length > 0 && !this.focus.primary) {
this.focus.primary = sorted[0].id;
}
const secondaryBudget = undefined; /* SCL-const */
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
interrupt(id: string, data entering the system from external source: string, salience: number): void {
this.registerTarget(id, data entering the system from external source, salience, 0);
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
export const attention = undefined; /* SCL-export-const */