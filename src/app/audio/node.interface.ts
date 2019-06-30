export interface EffectNode {
  connect(target: AudioParam | AudioNode | EffectNode);
  disconnect();
}
