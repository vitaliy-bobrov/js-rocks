import {
  AudioContext,
  IAudioNode
} from 'standardized-audio-context';

export interface EffectNode {
  connect(target: IAudioNode<AudioContext> | EffectNode): any;
  disconnect(): void;
}
