export function LFO(
  context: AudioContext,
  type: OscillatorNode['type'] = 'sine'): OscillatorNode {
  const node = context.createOscillator();
  node.type = type;
  node.frequency.value = 0.5;

  return node;
}
