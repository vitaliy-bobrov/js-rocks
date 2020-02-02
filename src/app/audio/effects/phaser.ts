import {
  AudioContext,
  BiquadFilterNode,
  GainNode,
  IBiquadFilterOptions
} from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { Effect, EffectInfo } from './effect';
import { clamp, linearCrossFade } from '@audio/utils';
import { LFO, LFOType } from './lfo';

export interface PhaserSettings extends Active {
  level: number;
  rate: number;
  depth: number;
  stages?: 2 | 4 | 6 | 8 | 10 | 12;
  minFrequency?: number;
  maxFrequency?: number;
  type?: LFOType;
}

export interface PhaserInfo extends EffectInfo {
  params: PhaserSettings;
}

export class Phaser extends Effect<PhaserSettings> {
  private levelSub$ = new BehaviorSubject(0);
  private rateSub$ = new BehaviorSubject(0);
  private depthSub$ = new BehaviorSubject(0);
  private splitter: GainNode<AudioContext>;
  private filters: BiquadFilterNode<AudioContext>[] = [];
  private lfo: LFO;
  private wet: GainNode<AudioContext>;
  private dry: GainNode<AudioContext>;
  private merger: GainNode<AudioContext>;

  level$ = this.levelSub$.asObservable();
  rate$ = this.rateSub$.asObservable();
  depth$ = this.depthSub$.asObservable();

  /**
   * Controls the volume balance between "dry" and "wet" chains.
   * Varies between [0 .. 1], where 0 means full "dry", 1 - full "wet".
   */
  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    const values = linearCrossFade(value);

    this.dry.gain.setTargetAtTime(values[0], this.currentTime, 0.01);
    this.wet.gain.setTargetAtTime(values[1], this.currentTime, 0.01);
  }

  /**
   * Sets a rate in Hz for generating filers frequency shift in "wet" chain.
   */
  set rate(value: number) {
    const rate = clamp(0, 20, value);
    this.rateSub$.next(rate);
    this.lfo.rate = rate;
  }

  /**
   * Sets the range for frequency modulation.
   */
  set depth(value: number) {
    const depth = clamp(0, 1, value);
    this.depthSub$.next(depth);
    this.lfo.depth = depth;
  }

  constructor(
    context: AudioContext,
    id: string,
    protected defaults: PhaserSettings
  ) {
    super(context, id);

    // Nodes initialization.
    this.splitter = new GainNode(context);
    this.lfo = new LFO(
      context,
      defaults.type,
      defaults.minFrequency,
      defaults.maxFrequency
    );
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.merger = new GainNode(context);

    const filterParams: Partial<IBiquadFilterOptions> = {
      type: 'allpass',
      frequency: 0,
      Q: Math.SQRT1_2
    };
    for (let i = 0; i < defaults.stages; i++) {
      const filter = new BiquadFilterNode(context, filterParams);

      this.lfo.connect(filter.frequency as any);
      this.filters.push(filter);
    }

    // "Wet" chain.
    this.processor = [this.splitter, ...this.filters, this.wet, this.merger];
    this.connectNodes(this.processor);

    // "Dry" chain.
    this.connectNodes([this.splitter, this.dry, this.merger]);
    this.applyDefaults();
  }

  dispose() {
    super.dispose();

    this.lfo.dispose();
    this.dry.disconnect();
    this.levelSub$.complete();
    this.rateSub$.complete();
    this.depthSub$.complete();
  }

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as PhaserInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value
    };

    return snapshot;
  }
}
