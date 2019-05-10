import { Effect, EffectInfo } from './effect';
import { connectNodes, clamp, mapToMinMax, expScale, toMs } from '../../utils';
import { BehaviorSubject } from 'rxjs';
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
    const delay = toMs(mapToMinMax(value, 0, 15));
    const setTime = this.toneNode.context.currentTime;
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

    const time = this.wet.context.currentTime;
    this.wet.gain.setTargetAtTime(gain, time, 0.01);
    this.dry.gain.setTargetAtTime(1 - gain, time, 0.01);
  }

  constructor(
    context: AudioContext,
    model: string,
    convolver: ConvolverNode,
    private defaults: ReverbSettings) {
    super(context, model);

    this.splitter = new ChannelSplitterNode(context);
    this.timeNode = new DelayNode(context);
    this.toneNode = Tone(context);
    this.convolver = convolver;
    this.wet = context.createGain();
    this.dry = context.createGain();
    this.merger = new ChannelMergerNode(context);

    this.processor = [
      this.splitter,
      this.timeNode,
      this.toneNode,
      this.convolver,
      this.wet,
      this.merger
    ];

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });

    connectNodes(this.processor);

    this.splitter.connect(this.dry).connect(this.merger);

    this.input.connect(this.output);
  }

  updateConvolver(convolver: ConvolverNode, type: string) {
    this.toneNode.disconnect();
    this.convolver.disconnect();

    this.convolver.buffer = null;
    this.convolver = null;
    this.convolver = convolver;

    this.toneNode.connect(this.convolver);
    this.convolver.connect(this.wet);
    this.type = type;
  }

  dispose() {
    super.dispose();

    this.splitter = null;
    this.timeNode = null;
    this.toneNode = null;
    this.convolver.buffer = null;
    this.convolver = null;
    this.wet = null;
    this.dry = null;
    this.merger = null;
    this.timeSub$.complete();
    this.toneSub$.complete();
    this.levelSub$.complete();
  }

  takeSnapshot(): ReverbInfo {
    const snapshot = super.takeSnapshot() as ReverbInfo;

    snapshot.params = {
      ...snapshot.params,
      tone: this.toneSub$.value,
      level: this.levelSub$.value,
      type: this.type
    };

    return snapshot;
  }
}
