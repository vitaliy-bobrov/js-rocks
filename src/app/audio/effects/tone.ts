export function Tone(context: AudioContext): BiquadFilterNode {
  const toneNode = context.createBiquadFilter();
  toneNode.type = 'lowpass';
  toneNode.frequency.value = 350;
  toneNode.Q.value = Math.SQRT1_2;

  return toneNode;
}
