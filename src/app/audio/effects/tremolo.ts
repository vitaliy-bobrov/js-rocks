import { AudioContext, GainNode } from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Effect, EffectInfo } from './effect';
import { clamp, mapToMinMax } from '@audio/utils';
import { LFO, LFOType } from './lfo';

export interface TremoloSettings {
  rate: number;
  depth: number;
  level: number;
  active: boolean;
  wave?: number;
  type?: LFOType;
}

export interface TremoloInfo extends EffectInfo {
  params: TremoloSettings;
}

export class Tremolo extends Effect<TremoloSettings> {
  private levelSub$ = new BehaviorSubject(0);
  private rateSub$ = new BehaviorSubject(0);
  private depthSub$ = new BehaviorSubject(0);
  private waveSub$ = new BehaviorSubject(0);
  private lfo: LFO;
  private gainNode: GainNode<AudioContext>;
  private levelNode: GainNode<AudioContext>;

  level$ = this.levelSub$.asObservable();
  rate$ = this.rateSub$.asObservable();
  depth$ = this.depthSub$.asObservable();
  wave$ = this.waveSub$.asObservable();

  /**
   * Controls the output volume level.
   * Varies between [0 .. 2], where 0 means mute, 2 - 2x louder.
   */
  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    const amount = mapToMinMax(gain, 0, 2);
    this.levelNode.gain.setTargetAtTime(amount, this.currentTime, 0.01);
  }

  /**
   * Sets a rate in Hz for generating gain value.
   */
  set rate(value: number) {
    const rate = clamp(0, 10, value);
    this.rateSub$.next(rate);
    this.lfo.rate = rate;
  }

  /**
   * Sets the range for gain modulation.
   */
  set depth(value: number) {
    const depth = clamp(0, 100, value);
    this.depthSub$.next(depth);
    this.lfo.depth = depth / 100;
  }

  /**
   * Controls "trapezoid" wave transformation, varies in range [0, 1],
   * where 0 means "triangle" wave, 1 - "square".
   */
  set wave(value: number) {
    const wave = clamp(0, 1, value);
    this.waveSub$.next(wave);
    const amount = mapToMinMax(wave, 0, 0.95);
    this.lfo.wave = amount;
  }

  constructor(
    context: AudioContext,
    id: string,
    protected defaults: TremoloSettings
  ) {
    super(context, id);

    this.lfo = new LFO(context, defaults.type);
    this.gainNode = new GainNode(context, { gain: 0 });
    this.levelNode = new GainNode(context);

    this.processor = [this.gainNode, this.levelNode];

    this.connectNodes(this.processor);

    // LFO setup.
    this.lfo.connect(this.gainNode.gain);

    this.applyDefaults();
  }

  dispose() {
    super.dispose();
    this.lfo.dispose();
    this.levelSub$.complete();
    this.rateSub$.complete();
    this.depthSub$.complete();
    this.waveSub$.complete();
  }

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as TremoloInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value,
      wave: this.waveSub$.value
    };

    return snapshot;
  }
}
