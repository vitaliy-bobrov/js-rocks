import { AudioContext, GainNode } from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax } from '@shared/utils';
import { LFO, LFOType } from './lfo';

export interface TremoloSettings {
  rate: number;
  depth: number;
  wave: number;
  active: boolean;
  type?: LFOType;
}

export interface TremoloInfo extends EffectInfo {
  params: TremoloSettings;
}

export class Tremolo extends Effect<TremoloSettings> {
  private rateSub$ = new BehaviorSubject(0);
  private depthSub$ = new BehaviorSubject(0);
  private waveSub$ = new BehaviorSubject(0);
  private lfo: LFO;
  private gainNode: GainNode<AudioContext>;

  rate$ = this.rateSub$.asObservable();
  depth$ = this.depthSub$.asObservable();
  wave$ = this.waveSub$.asObservable();

  set rate(value: number) {
    const rate = clamp(0, 10, value);
    this.rateSub$.next(rate);
    this.lfo.rate = rate;
  }

  set depth(value: number) {
    const depth = clamp(0, 100, value);
    this.depthSub$.next(depth);
    this.lfo.depth = depth / 100;
  }

  set wave(value: number) {
    const wave = clamp(0, 1, value);
    this.waveSub$.next(wave);
    const amount = mapToMinMax(wave, 0, 0.95);
    this.lfo.wave = amount;
  }

  constructor(
    context: AudioContext,
    model: string,
    protected defaults: TremoloSettings
  ) {
    super(context, model);

    this.lfo = new LFO(context, defaults.type);
    this.gainNode = new GainNode(context, { gain: 0 });

    this.processor = [this.gainNode];

    connectNodes(this.processor);

    // LFO setup.
    this.lfo.connect(this.gainNode.gain);

    this.applyDefaults();
  }

  dispose() {
    super.dispose();
    this.lfo.dispose();
    this.gainNode.disconnect();
    this.rateSub$.complete();
    this.depthSub$.complete();
    this.waveSub$.complete();
  }

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as TremoloInfo;

    snapshot.params = {
      ...snapshot.params,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value,
      wave: this.waveSub$.value
    };

    return snapshot;
  }
}
