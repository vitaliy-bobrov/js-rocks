import { expScale, mapToMinMax } from 'src/app/utils';
import { Disposable } from '@audio/disposable.interface';
import { onePoleLowpass, onePoleHighpass } from './one-pole-filters';

export class StandardTone implements Disposable {
  private filter: BiquadFilterNode;

  private get currentTime(): number {
    return this.filter.context.currentTime;
  }

  get nodes(): AudioNode[] {
    return [this.filter];
  }

  set tone(value: number) {
    const frequency = mapToMinMax(expScale(value), this.range[0], this.range[1]);
    this.filter.frequency.exponentialRampToValueAtTime(frequency, this.currentTime);
  }

  constructor(
    context: AudioContext,
    private range: [number, number] = [350, 12000]
  ) {
    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = Math.SQRT1_2;
  }

  dispose() {
    this.filter.disconnect();
    this.filter = null;
  }
}

export class MixedTone implements Disposable {
  private splitter: ChannelSplitterNode;
  private lowpassFilter: IIRFilterNode;
  private highpassFilter: IIRFilterNode;
  private toneHighGain: GainNode;
  private toneLowGain: GainNode;
  private merger: ChannelMergerNode;

  private get currentTime(): number {
    return this.toneLowGain.context.currentTime;
  }

  get nodes(): AudioNode[] {
    return [
      this.splitter,
      this.lowpassFilter,
      this.toneLowGain,
      this.merger
    ];
  }

  set tone(value: number) {
    this.toneHighGain.gain.setTargetAtTime(value, this.currentTime, 0.01);
    this.toneLowGain.gain.setTargetAtTime(1 - value, this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    range: [number, number] = [550, 1000]
  ) {
    this.splitter = context.createChannelSplitter();

    const lp = onePoleLowpass(range[0], context.sampleRate);
    this.lowpassFilter = context.createIIRFilter(lp.feedForward, lp.feedback);

    this.toneLowGain = context.createGain();

    const hp = onePoleHighpass(range[1], context.sampleRate);
    this.highpassFilter = context.createIIRFilter(hp.feedForward, hp.feedback);

    this.toneHighGain = context.createGain();
    this.merger = context.createChannelMerger();

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
