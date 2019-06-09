export function LFO(
  context: AudioContext,
  type: OscillatorNode['type'] = 'sine'): OscillatorNode {
  return new OscillatorNode(context, {
    type,
    frequency: 0.5
  });
}
