import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax } from '../../utils';
import { LFO } from './lfo';

import {
  AudioContext,
  GainNode,
  IOscillatorNode
} from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

export interface TremoloSettings {
  rate: number;
  depth: number;
  type: IOscillatorNode<AudioContext>['type'];
  wave?: number;
  active: boolean;
}

export interface TremoloInfo extends EffectInfo {
  params: TremoloSettings;
}

export class Tremolo extends Effect {
  private rateSub$ = new BehaviorSubject<number>(0);
  private depthSub$ = new BehaviorSubject<number>(0);
  private waveSub$ = new BehaviorSubject<number>(0);
  private lfo: LFO;
  private gainNode: GainNode<AudioContext>;

  rate$ = this.rateSub$.asObservable();
  depth$ = this.depthSub$.asObservable();
  wave$ = this.waveSub$.asObservable();

  set rate(value: number) {
    const rate = clamp(0, 1, value);
    this.rateSub$.next(rate);

    const frequency = mapToMinMax(rate, 1, 11);
    this.lfo.rate = frequency;
  }

  set depth(value: number) {
    const depth = clamp(0, 1, value);
    this.depthSub$.next(depth);
    this.lfo.depth = depth;
  }

  set wave(value: number) {
    const wave = clamp(0, 1, value);
    this.waveSub$.next(wave);
    this.lfo.wave = wave;
  }

  constructor(
    context: AudioContext,
    model: string,
    private defaults: TremoloSettings
  ) {
    super(context, model);
    this.lfo = new LFO(context, 'triangle');
    this.gainNode = new GainNode(context);

    this.processor = [
      this.gainNode
    ];

    connectNodes(this.processor);

    // LFO setup.
    this.lfo.connect(this.gainNode.gain);

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });
  }

  dispose() {
    super.dispose();

    this.lfo.dispose();

    this.lfo = null;
    this.gainNode = null;
    this.rateSub$.complete();
    this.depthSub$.complete();
    this.waveSub$.complete();
  }

  takeSnapshot(): TremoloInfo {
    const snapshot = super.takeSnapshot() as TremoloInfo;

    snapshot.params = {
      ...snapshot.params,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value,
      wave: this.waveSub$.value,
    };

    return snapshot;
  }
}

