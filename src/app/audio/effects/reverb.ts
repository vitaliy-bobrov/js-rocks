import { BehaviorSubject, Observable } from 'rxjs';
import {
  AudioContext,
  GainNode,
  ConvolverNode,
  DelayNode,
  ChannelSplitterNode,
  ChannelMergerNode
} from 'standardized-audio-context';

import { Effect, EffectInfo } from './effect';
import { connectNodes, clamp, toMs, equalCrossFade } from '@shared/utils';
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
  private timeSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private levelSub$ = new BehaviorSubject<number>(0);
  private splitter: ChannelSplitterNode<AudioContext>;
  private timeNode: DelayNode<AudioContext>;
  private toneNode: ToneControl;
  private convolver: ConvolverNode<AudioContext>;
  private makeUpGain: GainNode<AudioContext>;
  private wet: GainNode<AudioContext>;
  private dry: GainNode<AudioContext>;
  private merger: ChannelMergerNode<AudioContext>;

  type: string;

  time$ = this.timeSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set time(value: number) {
    const time = clamp(0, 15, value);
    this.timeSub$.next(time);

    const delay = toMs(time);
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
    const values = equalCrossFade(value);

    this.dry.gain.setTargetAtTime(values[0], this.currentTime, 0.01);
    this.wet.gain.setTargetAtTime(values[1], this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    model: string,
    buffer$: Observable<AudioBuffer>,
    convolverMakeUp: number,
    protected defaults: ReverbSettings
  ) {
    super(context, model);

    this.splitter = new ChannelSplitterNode(context);
    this.timeNode = new DelayNode(context);
    this.toneNode = new StandardTone(context);
    this.convolver = new ConvolverNode(context);
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.merger = new ChannelMergerNode(context);
    this.makeUpGain = new GainNode(context, {
      gain: convolverMakeUp
    });

    buffer$.subscribe(buffer => {
      this.convolver.buffer = buffer;
    });

    this.processor = [
      this.splitter,
      this.timeNode,
      ...this.toneNode.nodes,
      this.convolver,
      this.wet,
      this.merger,
      this.makeUpGain
    ];

    connectNodes(this.processor);
    this.splitter.connect(this.dry).connect(this.merger, 0, 1);

    this.applyDefaults();
  }

  updateConvolver(
    buffer$: Observable<AudioBuffer>,
    makeUpGain: number,
    type: string
  ) {
    const lastToneNode = this.toneNode.nodes[this.toneNode.nodes.length - 1];

    lastToneNode.disconnect();
    this.convolver.disconnect();

    this.convolver.buffer = null;
    this.type = type;

    buffer$.subscribe(buffer => {
      this.convolver.buffer = buffer;
    });

    this.toggleBypass();

    lastToneNode.connect(this.convolver);
    this.convolver.connect(this.wet);
    this.makeUpGain.gain.value = makeUpGain;

    this.toggleBypass();
  }

  dispose() {
    super.dispose();

    this.splitter.disconnect();
    this.dry.disconnect();
    this.merger.disconnect();

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

  takeSnapshot(): ReverbInfo {
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
