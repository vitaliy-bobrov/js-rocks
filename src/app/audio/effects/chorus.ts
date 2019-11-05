import { AudioContext, GainNode, DelayNode } from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax } from '@shared/utils';
import { StandardTone, ToneControl } from './tone';
import { LFO } from './lfo';

export interface ChorusSettings extends Active {
  level: number;
  eq: number;
  rate: number;
  depth: number;
  feedback: number;
  delay: number;
}

export interface ChorusInfo extends EffectInfo {
  params: ChorusSettings;
}

export class Chorus extends Effect<ChorusSettings> {
  private levelSub$ = new BehaviorSubject(0);
  private eqSub$ = new BehaviorSubject(0);
  private rateSub$ = new BehaviorSubject(0);
  private depthSub$ = new BehaviorSubject(0);
  private feedbackSub$ = new BehaviorSubject(0);
  private delaySub$ = new BehaviorSubject(0);
  private eqNode: ToneControl;
  private lfo: LFO;
  private delayNode: DelayNode<AudioContext>;
  private feedbackNode: GainNode<AudioContext>;
  private levelNode: GainNode<AudioContext>;

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
    this.lfo.rate = frequency;
  }

  set depth(value: number) {
    const depth = clamp(0, 1, value);
    this.depthSub$.next(depth);

    const gain = depth * this.delay;
    this.lfo.depth = gain;
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

  get delay() {
    return this.delaySub$.value;
  }

  constructor(
    context: AudioContext,
    model: string,
    protected defaults: ChorusSettings
  ) {
    super(context, model);
    this.eqNode = new StandardTone(context);
    this.lfo = new LFO(context);
    this.delayNode = new DelayNode(context);
    this.feedbackNode = new GainNode(context);
    this.levelNode = new GainNode(context);

    this.processor = [...this.eqNode.nodes, this.delayNode, this.levelNode];

    connectNodes(this.processor);

    // Feedback loop.
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);

    // LFO setup.
    this.lfo.connect(this.delayNode.delayTime);
    this.applyDefaults();
  }

  dispose() {
    super.dispose();

    this.lfo.dispose();
    this.feedbackNode.disconnect();

    this.eqNode.dispose();
    this.eqNode = null;
    this.lfo = null;
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

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as ChorusInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      eq: this.eqSub$.value,
      rate: this.rateSub$.value,
      depth: this.depthSub$.value,
      feedback: this.feedbackSub$.value,
      delay: this.delaySub$.value
    };

    return snapshot;
  }
}
