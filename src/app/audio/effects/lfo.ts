import {
  AudioContext,
  OscillatorNode,
  GainNode,
  IOscillatorNode,
  IAudioNode,
  IAudioParam
} from 'standardized-audio-context';

import { Disposable } from '../disposable.interface';

export class LFO implements Disposable {
  private osc: OscillatorNode<AudioContext>;
  private depthNode: GainNode<AudioContext>;

  private get currentTime(): number {
    return this.osc.context.currentTime;
  }

  get nodes(): IAudioNode<AudioContext>[] {
    return [this.osc];
  }

  set rate(value: number) {
    this.osc.frequency.exponentialRampToValueAtTime(value, this.currentTime);
  }

  set depth(value: number) {
    this.depthNode.gain.setTargetAtTime(value, this.currentTime, 0.01);
  }

  set wave(value: number) {
    if (this.osc.type !== 'custom') {
      return;
    }


  }

  constructor(
    context: AudioContext,
    type: IOscillatorNode<AudioContext>['type'] = 'sine'
  ) {
    this.osc = new OscillatorNode(context, {
      type,
      frequency: 0.5
    });
    this.depthNode = new GainNode(context);

    this.osc.connect(this.depthNode);
  }

  connect(node: IAudioNode<AudioContext> | IAudioParam) {
    this.depthNode.connect(node as any);
    this.osc.start();
  }

  dispose() {
    this.osc.stop();
    this.osc.disconnect();
    this.depthNode.disconnect();

    this.osc = null;
    this.depthNode = null;
  }
}
