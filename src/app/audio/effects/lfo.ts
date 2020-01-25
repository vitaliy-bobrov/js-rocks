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
  private divider: GainNode<AudioContext>;
  private osc: OscillatorNode<AudioContext>;
  private depthNode: GainNode<AudioContext>;
  private modOffset: GainNode<AudioContext>;
  private minOffset: ConstantSourceNode<AudioContext>;
  private output: GainNode<AudioContext>;
  private started = false;

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

  constructor(
    context: AudioContext,
    private type: LFOType = 'sine',
    min = 0,
    max = 1
  ) {
    // Generates values in range [-1, 1].
    this.osc = new OscillatorNode(context, {
      type: LFO.isAllowedType(type) ? (type as TOscillatorType) : undefined,
      frequency: 0.5
    });

    this.divider = new GainNode(context, { gain: 0.5 });
    this.offsetNode = new ConstantSourceNode(context);
    this.depthNode = new GainNode(context);
    this.minOffset = new ConstantSourceNode(context, { offset: min });
    this.modOffset = new GainNode(context, { gain: max - min });
    this.output = new GainNode(context);

    // Divide the result by 2, making the range to [-0.5, 0.5].
    this.osc.connect(this.divider);

    // Add 1 to the output signals, making the range to [0, 1].
    this.offsetNode.connect(this.divider);

    // Multiplies output to depth (actually percentage)
    // ex. depth = 0.3 means the range [0, 0.3]
    this.divider.connect(this.depthNode);

    // Varies max - min range, ex. min = 1, max = 5,
    // depth = 1, will modulate range [0, 4].
    this.depthNode.connect(this.modOffset);

    // Adds modulated and minimal offset to range,
    // ex. min = 1, max = 5, depth = 1,
    // will modulate range [1, 5].
    this.minOffset.connect(this.output);
    this.modOffset.connect(this.output);
  }

  connect(node: IAudioNode<AudioContext> | IAudioParam) {
    this.output.connect(node as any);

    if (!this.started) {
      this.started = true;
      this.osc.start();
      this.offsetNode.start();
      this.minOffset.start();
    }
  }

  dispose() {
    if (this.started) {
      this.started = false;
      this.osc.stop();
      this.offsetNode.stop();
      this.minOffset.stop();
    }

    this.osc.disconnect();
    this.offsetNode.disconnect();
    this.divider.disconnect();
    this.depthNode.disconnect();
    this.modOffset.disconnect();
    this.minOffset.disconnect();
    this.output.disconnect();
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
