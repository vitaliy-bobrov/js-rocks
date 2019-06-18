export type Placable = AudioParam | EffectNode;

export interface EffectNode {
  connect(target: Placable);
  disconnect();
}
