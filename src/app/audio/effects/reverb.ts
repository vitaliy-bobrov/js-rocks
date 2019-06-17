import { Effect, EffectInfo } from './effect';
import { connectNodes, clamp, mapToMinMax, expScale, toMs, equalCrossFade } from '../../utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tone } from './tone';

export interface ReverbSettings {
  level: number;
  tone: number;
  time: number;
  type: string;
  active: boolean;
}

export interface ReverbInfo extends EffectInfo {
  params: ReverbSettings;
}

export class Reverb extends Effect {
  private timeSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private levelSub$ = new BehaviorSubject<number>(0);
  private splitter: ChannelSplitterNode;
  private timeNode: DelayNode;
  private toneNode: BiquadFilterNode;
  private convolver: ConvolverNode;
  private makeUpGain: GainNode;
  private wet: GainNode;
  private dry: GainNode;
  private merger: ChannelMergerNode;

  type: string;

  time$ = this.timeSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set time(value: number) {
    const time = clamp(0, 15, value);
    this.timeSub$.next(time);

    const delay = toMs(time);
    const setTime = this.timeNode.context.currentTime;
    this.timeNode.delayTime.setTargetAtTime(delay, setTime, 0.01);
  }

  set tone(value: number) {
    const tone = clamp(0, 1, value);
    this.toneSub$.next(tone);

    const frequency = mapToMinMax(expScale(tone), 350, this.sampleRate / 2);
    const time = this.toneNode.context.currentTime;
    this.toneNode.frequency.exponentialRampToValueAtTime(frequency, time);
  }

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    const values = equalCrossFade(value);
    const time = this.wet.context.currentTime;

    this.dry.gain.setTargetAtTime(values[0], time, 0.01);
    this.wet.gain.setTargetAtTime(values[1], time, 0.01);
  }

  constructor(
    context: AudioContext,
    model: string,
    buffer$: Observable<AudioBuffer>,
    convolverMakeUp: number,
    private defaults: ReverbSettings) {
    super(context, model);

    this.splitter = new ChannelSplitterNode(context);
    this.timeNode = new DelayNode(context);
    this.toneNode = Tone(context);
    this.convolver = new ConvolverNode(context);
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.merger = new ChannelMergerNode(context);
    this.makeUpGain = new GainNode(context, {gain: convolverMakeUp});

    buffer$.subscribe((buffer) => {
      this.convolver.buffer = buffer;
    });

    this.processor = [
      this.splitter,
      this.timeNode,
      this.toneNode,
      this.convolver,
      this.wet,
      this.merger,
      this.makeUpGain
    ];

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });

    connectNodes(this.processor);

    this.splitter.connect(this.dry, 1).connect(this.merger, 0, 1);

    this.input.connect(this.output);
  }

  updateConvolver(buffer$: Observable<AudioBuffer>, makeUpGain: number, type: string) {
    this.toneNode.disconnect();
    this.convolver.disconnect();

    this.convolver.buffer = null;
    this.type = type;

    buffer$.subscribe((buffer) => {
      this.convolver.buffer = buffer;
    });

    this.toggleBypass();

    this.toneNode.connect(this.convolver);
    this.convolver.connect(this.wet);
    this.makeUpGain.gain.value = makeUpGain;

    this.toggleBypass();
  }

  dispose() {
    super.dispose();

    this.splitter.disconnect();
    this.dry.disconnect();
    this.merger.disconnect();

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
