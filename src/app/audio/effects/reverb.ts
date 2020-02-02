import { BehaviorSubject, Observable } from 'rxjs';
import {
  AudioContext,
  GainNode,
  ConvolverNode,
  DelayNode
} from 'standardized-audio-context';

import { Effect, EffectInfo } from './effect';
import { clamp, toSeconds, linearCrossFade } from '@audio/utils';
import { ToneControl, StandardTone } from './tone';
import { Active } from '@audio/interfaces/active.interface';

export interface ReverbSettings extends Active {
  level: number;
  tone: number;
  time: number;
  type: string;
}

export interface ReverbInfo extends EffectInfo {
  params: ReverbSettings;
}

export class Reverb extends Effect<ReverbSettings> {
  private timeSub$ = new BehaviorSubject(0);
  private toneSub$ = new BehaviorSubject(0);
  private levelSub$ = new BehaviorSubject(0);
  private splitter: GainNode<AudioContext>;
  private timeNode: DelayNode<AudioContext>;
  private toneNode: ToneControl;
  private convolver: ConvolverNode<AudioContext>;
  private makeUpGain: GainNode<AudioContext>;
  private wet: GainNode<AudioContext>;
  private dry: GainNode<AudioContext>;
  private merger: GainNode<AudioContext>;

  type: string;

  time$ = this.timeSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set time(value: number) {
    const time = clamp(0, 15, value);
    this.timeSub$.next(time);

    const delay = toSeconds(time);
    this.timeNode.delayTime.setTargetAtTime(delay, this.currentTime, 0.01);
  }

  set tone(value: number) {
    const tone = clamp(0, 1, value);
    this.toneSub$.next(tone);
    this.toneNode.tone = tone;
  }

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    const values = linearCrossFade(value);

    this.dry.gain.setTargetAtTime(values[0], this.currentTime, 0.01);
    this.wet.gain.setTargetAtTime(values[1], this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    id: string,
    buffer$: Observable<AudioBuffer>,
    convolverMakeUp: number,
    protected defaults: ReverbSettings
  ) {
    super(context, id);

    this.splitter = new GainNode(context);
    this.timeNode = new DelayNode(context);
    this.toneNode = new StandardTone(context);
    this.convolver = new ConvolverNode(context);
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.merger = new GainNode(context);
    this.makeUpGain = new GainNode(context);

    // "Wet" chain.
    this.processor = [
      this.splitter,
      this.timeNode,
      ...this.toneNode.nodes,
      this.convolver,
      this.makeUpGain,
      this.wet,
      this.merger
    ];
    this.connectNodes(this.processor);

    // "Dry" chain.
    this.connectNodes([this.splitter, this.dry, this.merger]);

    this.applyDefaults();
    this.updateConvolver(buffer$, convolverMakeUp, this.type);
  }

  updateConvolver(
    buffer$: Observable<AudioBuffer>,
    makeUpGain: number,
    type: string
  ) {
    this.convolver.disconnect();
    this.convolver.buffer = null;
    this.type = type;
    this.makeUpGain.gain.value = makeUpGain;

    buffer$.subscribe(buffer => {
      this.convolver.buffer = buffer;
      this.convolver.connect(this.wet);
    });
  }

  dispose() {
    super.dispose();

    this.dry.disconnect();
    this.toneNode.dispose();
    this.splitter = null;
    this.timeNode = null;
    this.toneNode = null;
    this.convolver.buffer = null;
    this.convolver = null;
    this.wet = null;
    this.dry = null;
    this.merger = null;
    this.makeUpGain = null;
    this.timeSub$.complete();
    this.toneSub$.complete();
    this.levelSub$.complete();
  }

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as ReverbInfo;

    snapshot.params = {
      ...snapshot.params,
      tone: this.toneSub$.value,
      time: this.timeSub$.value,
      level: this.levelSub$.value,
      type: this.type
    };

    return snapshot;
  }
}
