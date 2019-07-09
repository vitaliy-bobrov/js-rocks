import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax, expScale } from '../../utils';
import { BehaviorSubject } from 'rxjs';
import { StandardTone, ToneControl } from './tone';
import { LFO } from './lfo';

export interface ChorusSettings {
  level: number;
  eq: number;
  rate: number;
  depth: number;
  feedback: number;
  delay: number;
  active: boolean;
}

export interface ChorusInfo extends EffectInfo {
  params: ChorusSettings;
}

export class Chorus extends Effect {
  private levelSub$ = new BehaviorSubject<number>(0);
  private eqSub$ = new BehaviorSubject<number>(0);
  private rateSub$ = new BehaviorSubject<number>(0);
  private depthSub$ = new BehaviorSubject<number>(0);
  private feedbackSub$ = new BehaviorSubject<number>(0);
  private delaySub$ = new BehaviorSubject<number>(0);
  private eqNode: ToneControl;
  private lfo: OscillatorNode;
  private depthNode: GainNode;
  private delayNode: DelayNode;
  private feedbackNode: GainNode;
  private levelNode: GainNode;

  level$ = this.levelSub$.asObservable();
  eq$ = this.eqSub$.asObservable();
  rate$ = this.rateSub$.asObservable();
  depth$ = this.depthSub$.asObservable();

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);

    this.levelNode.gain.setTargetAtTime(gain, this.currentTime, 0.01);
  }

  set eq(value: number) {
    const tone = clamp(0, 1, value);
    this.eqSub$.next(tone);
    this.eqNode.tone = tone;
  }

  set rate(value: number) {
    const rate = clamp(0, 1, value);
    this.rateSub$.next(rate);

    const frequency = mapToMinMax(rate, 0.1, 8);
    this.lfo.frequency.exponentialRampToValueAtTime(frequency, this.currentTime);
  }

  set depth(value: number) {
    const depth = clamp(0, 1, value);
    this.depthSub$.next(depth);

    const gain = depth * this.delay;
    this.depthNode.gain.setTargetAtTime(gain, this.currentTime, 0.01);
  }

  set feedback(value: number) {
    const feedback = clamp(0, 1, value);
    this.feedbackSub$.next(feedback);

    this.feedbackNode.gain.setTargetAtTime(feedback, this.currentTime, 0.01);
  }

  set delay(value: number) {
    const clamped = clamp(0, 1, value);
    const delay = 0.0002 * (Math.pow(10, clamped) * 2);
    this.delaySub$.next(delay);

    // Recalculate depth value as it is dependents on delay.
    this.depth = this.depthSub$.value;

    this.delayNode.delayTime.setTargetAtTime(delay, this.currentTime, 0.01);
  }

  get delay(): number {
    return this.delaySub$.value;
  }

  constructor(
    context: AudioContext,
    model: string,
    private defaults: ChorusSettings
  ) {
    super(context, model);
    this.eqNode = new StandardTone(context);
    this.lfo = LFO(context);
    this.depthNode = context.createGain();
    this.delayNode = context.createDelay();
    this.feedbackNode = context.createGain();
    this.levelNode = context.createGain();

    this.processor = [
      ...this.eqNode.nodes,
      this.delayNode,
      this.levelNode,
    ];

    connectNodes(this.processor);

    // Feedback loop.
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);

    // LFO setup.
    this.lfo.start();
    this.lfo.connect(this.depthNode).connect(this.delayNode.delayTime);

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });
  }

  dispose() {
    super.dispose();

    this.lfo.stop();
    this.lfo.disconnect();
    this.feedbackNode.disconnect();
    this.depthNode.disconnect();

    this.eqNode.dispose();
    this.eqNode = null;
    this.lfo = null;
    this.depthNode = null;
    this.delayNode = null;
    this.feedbackNode = null;
    this.levelNode = null;
    this.levelSub$.complete();
    this.eqSub$.complete();
    this.rateSub$.complete();
    this.depthSub$.complete();
    this.feedbackSub$.complete();
    this.delaySub$.complete();
  }

  takeSnapshot(): ChorusInfo {
    const snapshot = super.takeSnapshot() as ChorusInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      eq: this.eqSub$.value,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value,
      feedback: this.feedbackSub$.value,
      delay: this.delaySub$.value,
    };

    return snapshot;
  }
}

