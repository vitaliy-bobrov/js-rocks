import {
  AudioContext,
  OscillatorNode,
  IOscillatorNode,
  IAudioNode
} from 'standardized-audio-context';

export function LFO(
  context: AudioContext,
  type: IOscillatorNode<AudioContext>['type'] = 'sine'): OscillatorNode<AudioContext> {
  return new OscillatorNode(context, {
    type,
    frequency: 0.5
  });
}
