import {
  AudioContext,
  IIRFilterNode,
  GainNode,
  BiquadFilterNode,
  ChannelSplitterNode,
  ChannelMergerNode
} from 'standardized-audio-context';

import { expScale, mapToMinMax } from '@audio/utils';
import { Disposable } from '@audio/interfaces/disposable.interface';
import { onePoleLowpass, onePoleHighpass } from './one-pole-filters';

export class StandardTone implements Disposable {
  private filter: BiquadFilterNode<AudioContext>;

  private get currentTime() {
    return this.filter.context.currentTime;
  }

  get nodes() {
    return [this.filter];
  }

  set tone(value: number) {
    const frequency = mapToMinMax(
      expScale(value),
      this.range[0],
      this.range[1]
    );
    this.filter.frequency.exponentialRampToValueAtTime(
      frequency,
      this.currentTime
    );
  }

  constructor(
    context: AudioContext,
    private range: [number, number] = [350, 10000]
  ) {
    this.filter = new BiquadFilterNode(context, {
      type: 'lowpass',
      Q: Math.SQRT1_2
    });
  }

  dispose() {
    this.filter.disconnect();
    this.filter = null;
  }
}

export class MixedTone implements Disposable {
  private splitter: ChannelSplitterNode<AudioContext>;
  private lowpassFilter: IIRFilterNode<AudioContext>;
  private highpassFilter: IIRFilterNode<AudioContext>;
  private toneHighGain: GainNode<AudioContext>;
  private toneLowGain: GainNode<AudioContext>;
  private merger: ChannelMergerNode<AudioContext>;

  private get currentTime() {
    return this.toneLowGain.context.currentTime;
  }

  get nodes() {
    return [this.splitter, this.lowpassFilter, this.toneLowGain, this.merger];
  }

  set tone(value: number) {
    this.toneHighGain.gain.setTargetAtTime(value, this.currentTime, 0.01);
    this.toneLowGain.gain.setTargetAtTime(1 - value, this.currentTime, 0.01);
  }

  constructor(context: AudioContext, range: [number, number] = [550, 1000]) {
    this.splitter = new ChannelSplitterNode(context);

    this.lowpassFilter = new IIRFilterNode(context, {
      ...onePoleLowpass(range[0], context.sampleRate)
    });

    this.toneLowGain = new GainNode(context);

    this.highpassFilter = new IIRFilterNode(context, {
      ...onePoleHighpass(range[1], context.sampleRate)
    });

    this.toneHighGain = new GainNode(context);
    this.merger = new ChannelMergerNode(context);

    this.splitter
      .connect(this.highpassFilter)
      .connect(this.toneHighGain)
      .connect(this.merger, 0, 1);
  }

  dispose() {
    this.highpassFilter.disconnect();
    this.toneHighGain.disconnect();

    this.splitter = null;
    this.lowpassFilter = null;
    this.toneLowGain = null;
    this.highpassFilter = null;
    this.toneHighGain = null;
    this.merger = null;
  }
}

export type ToneControl = StandardTone | MixedTone;
