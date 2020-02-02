import { AudioContext, GainNode, DelayNode } from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { Effect, EffectInfo } from './effect';
import { clamp, linearCrossFade } from '@audio/utils';
import { StandardTone, ToneControl } from './tone';
import { LFO, LFOType } from './lfo';

export interface ChorusSettings extends Active {
  level: number;
  eq: number;
  rate: number;
  depth: number;
  feedback: number;
  delay: number;
  type?: LFOType;
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
  private splitter: GainNode<AudioContext>;
  private eqNode: ToneControl;
  private lfo: LFO;
  private delayNode: DelayNode<AudioContext>;
  private feedbackNode: GainNode<AudioContext>;
  private wet: GainNode<AudioContext>;
  private dry: GainNode<AudioContext>;
  private merger: GainNode<AudioContext>;

  level$ = this.levelSub$.asObservable();
  eq$ = this.eqSub$.asObservable();
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
   * Set a tone for "wet" channel with simple LP filter.
   */
  set eq(value: number) {
    const tone = clamp(0, 1, value);
    this.eqSub$.next(tone);
    this.eqNode.tone = tone;
  }

  /**
   * Sets a rate in Hz for generating delay in "wet" chain.
   */
  set rate(value: number) {
    const rate = clamp(0, 20, value);
    this.rateSub$.next(rate);
    this.lfo.rate = rate;
  }

  /**
   * Sets the range for delay modulation.
   */
  set depth(value: number) {
    const depth = clamp(0, 100, value);
    this.depthSub$.next(depth);
    const gain = (depth / 100) * this.delaySub$.value;
    this.lfo.depth = gain;
  }

  /**
   * Feedback of the delay loop, level of loop repeats.
   * Could be [0 .. 0.99], where 0 means no repeats.
   * Couldn't be 1 as it will create an infinite loop.
   */
  set feedback(value: number) {
    const feedback = clamp(0, 0.99, value);
    this.feedbackSub$.next(feedback);
    this.feedbackNode.gain.setTargetAtTime(feedback, this.currentTime, 0.01);
  }

  /**
   * "Wet" chain base delay time to modulate in ms.
   */
  set delay(value: number) {
    const clamped = clamp(0, 1, value);
    const delay = 0.0002 * (Math.pow(10, clamped) * 2);
    this.delaySub$.next(delay);

    // Recalculate depth value as it is dependents on delay.
    this.depth = this.depthSub$.value;

    this.delayNode.delayTime.setTargetAtTime(delay, this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    id: string,
    protected defaults: ChorusSettings
  ) {
    super(context, id);

    // Nodes initialization.
    this.splitter = new GainNode(context);
    this.eqNode = new StandardTone(context);
    this.lfo = new LFO(context, defaults.type);
    this.delayNode = new DelayNode(context);
    this.feedbackNode = new GainNode(context);
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.merger = new GainNode(context);

    // "Wet" chain.
    this.processor = [
      this.splitter,
      ...this.eqNode.nodes,
      this.delayNode,
      this.wet,
      this.merger
    ];
    this.connectNodes(this.processor);

    // Feedback loop.
    this.delayNode.connect(this.feedbackNode).connect(this.delayNode);

    // LFO setup.
    this.lfo.connect(this.delayNode.delayTime);

    // "Dry" chain.
    this.connectNodes([this.splitter, this.dry, this.merger]);
    this.applyDefaults();
  }

  dispose() {
    super.dispose();

    this.eqNode.dispose();
    this.lfo.dispose();
    this.feedbackNode.disconnect();
    this.dry.disconnect();
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
