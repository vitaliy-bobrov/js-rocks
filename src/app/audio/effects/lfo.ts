import {
  AudioContext,
  OscillatorNode,
  GainNode,
  IAudioNode,
  IAudioParam,
  PeriodicWave,
  TOscillatorType
} from 'standardized-audio-context';

import { Disposable } from '@audio/interfaces/disposable.interface';

export type LFOType = TOscillatorType | 'trapezoid';

export class LFO implements Disposable {
  private static allowedTypes: Set<TOscillatorType> = new Set([
    'sine',
    'square',
    'sawtooth',
    'triangle'
  ]);
  private osc: OscillatorNode<AudioContext>;
  private sumNode: GainNode<AudioContext>;
  private depthNode: GainNode<AudioContext>;

  private get currentTime() {
    return this.osc.context.currentTime;
  }

  set rate(value: number) {
    this.osc.frequency.exponentialRampToValueAtTime(value, this.currentTime);
  }

  set depth(value: number) {
    this.depthNode.gain.setTargetAtTime(value, this.currentTime, 0.01);
  }

  set wave(value: number) {
    if (LFO.isAllowedType(this.type)) {
      return;
    }

    if (this.type === 'trapezoid') {
      const wave = this.createTrapezoidWave(value);
      this.osc.setPeriodicWave(wave);
    }
  }

  static isAllowedType(type: LFOType) {
    return LFO.allowedTypes.has(type as TOscillatorType);
  }

  constructor(context: AudioContext, private type: LFOType = 'sine') {
    this.osc = new OscillatorNode(context, {
      type: LFO.isAllowedType(type) ? (type as TOscillatorType) : undefined,
      frequency: 0.5
    });
    this.sumNode = new GainNode(context, { gain: -1 });
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

  private createTrapezoidWave(amount: number) {
    const fftSize = 4096;
    const periodicWaveSize = fftSize / 2;
    const real = new Float32Array(periodicWaveSize) as any;
    const imag = new Float32Array(periodicWaveSize) as any;

    // Based on https://docs.google.com/presentation/d/17YX_k1_1o6Z7OdybDdk9mbyFYH4u2I99sJi7fZp6ijE/edit#slide=id.p10
    const tau = 0.5;
    const tr = (1 - amount) / 2;

    for (let i = 0; i < periodicWaveSize; ++i) {
      if (i & 1) {
        // is odd number
        const npf = i * Math.PI;
        real[i] =
          2 *
          (Math.sin(npf * tau) / (npf * tau)) *
          (Math.sin(npf * tr) / (npf * tr)) *
          Math.cos(2 * npf - npf * (tau - tr));
      } else {
        real[i] = 0;
      }
    }

    return new PeriodicWave(this.osc.context, {
      real,
      imag,
      disableNormalization: true
    });
  }
}
