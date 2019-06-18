export function ToneNode(context: AudioContext): BiquadFilterNode {
  return new BiquadFilterNode(context, {
    type: 'lowpass',
    Q: Math.SQRT1_2,
    frequency: 350
  });
}
