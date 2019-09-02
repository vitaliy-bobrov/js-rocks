import {
  AudioContext,
  OscillatorNode,
  GainNode,
  IOscillatorNode,
  IAudioNode,
  IAudioParam,
  PeriodicWave
} from 'standardized-audio-context';

import { Disposable } from '../disposable.interface';

export class LFO implements Disposable {
  private osc: OscillatorNode<AudioContext>;
  private sumNode: GainNode<AudioContext>;
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
    const wave = this._createTrapezoidWave(value);
    this.osc.setPeriodicWave(wave);
  }

  constructor(
    context: AudioContext,
    type: IOscillatorNode<AudioContext>['type'] = 'sine'
  ) {
    this.osc = new OscillatorNode(context, {
      type,
      frequency: 0.5
    });
    this.sumNode = new GainNode(context, {gain: -1});
    this.depthNode = new GainNode(context);

    this.osc.connect(this.sumNode).connect(this.depthNode);
  }

  connect(node: IAudioNode<AudioContext> | IAudioParam) {
    this.depthNode.connect(node as any);
    this.osc.start();
  }

  dispose() {
    this.osc.stop();
    this.osc.disconnect();
    this.sumNode.disconnect();
    this.depthNode.disconnect();

    this.osc = null;
    this.sumNode = null;
    this.depthNode = null;
  }

  _createTrapezoidWave(value: number): PeriodicWave {
    const samples = 2048;
    const real = [0];
    const imag = new Array(samples).fill(0);

    for (let i = 1; i < samples; i++) {
      if (i % 2 === 0) {
        real[i] = 0;
      } else {

      }
    }

    return new PeriodicWave(this.osc.context, {real, imag, disableNormalization: true});
  }
}
