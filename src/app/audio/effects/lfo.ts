import {
  AudioContext,
  ConstantSourceNode,
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
  private offsetNode: ConstantSourceNode<AudioContext>;
  private rangeNode: GainNode<AudioContext>;
  private osc: OscillatorNode<AudioContext>;
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

    // Add one to the output signals, making the range [0, 2].
    this.offsetNode = new ConstantSourceNode(context, { offset: 1 });

    // Divide the result by 2, making the range [0, 1].
    this.rangeNode = new GainNode(context, { gain: 0.5 });
    this.depthNode = new GainNode(context);

    // Map the oscillator's output range from [-1, 1] to [0, 1].
    this.osc.connect(this.offsetNode.offset as any);
    this.offsetNode.connect(this.rangeNode).connect(this.depthNode);
  }

  connect(node: IAudioNode<AudioContext> | IAudioParam) {
    this.depthNode.connect(node as any);
    this.osc.start();
  }

  dispose() {
    this.osc.stop();
    this.osc.disconnect();
    this.rangeNode.disconnect();
    this.offsetNode.disconnect();
    this.depthNode.disconnect();

    this.osc = null;
    this.rangeNode = null;
    this.offsetNode = null;
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
