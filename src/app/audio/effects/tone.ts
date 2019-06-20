export function ToneNode(context: AudioContext): BiquadFilterNode {
  const node = context.createBiquadFilter();
  node.type = 'lowpass';
  node.Q.value = Math.SQRT1_2;
  node.frequency.value = 350;

  return node;
}
