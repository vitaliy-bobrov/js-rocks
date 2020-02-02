import {
  AudioContext,
  BiquadFilterNode,
  GainNode,
  DelayNode
} from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { Effect, EffectInfo } from './effect';
import { clamp, linearCrossFade, toSeconds } from '@audio/utils';

export interface DelaySettings extends Active {
  level: number;
  time: number;
  feedback: number;
  feedbackCutoff?: number;
}

export interface DelayInfo extends EffectInfo {
  params: DelaySettings;
}

export class Delay extends Effect<DelaySettings> {
  private levelSub$ = new BehaviorSubject(0);
  private timeSub$ = new BehaviorSubject(0);
  private feedbackSub$ = new BehaviorSubject(0);
  private splitNode: GainNode<AudioContext>;
  private preDelayLP: BiquadFilterNode<AudioContext>;
  private delayNode: DelayNode<AudioContext>;
  private feedbackNode: GainNode<AudioContext>;
  private wet: GainNode<AudioContext>;
  private dry: GainNode<AudioContext>;
  private mergeNode: GainNode<AudioContext>;

  level$ = this.levelSub$.asObservable();
  time$ = this.timeSub$.asObservable();
  feedback$ = this.feedbackSub$.asObservable();

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
   * "Wet" chain delay time in ms.
   */
  set time(value: number) {
    const time = clamp(0, 1000, value);
    this.timeSub$.next(time);
    this.delayNode.delayTime.setTargetAtTime(
      toSeconds(time),
      this.currentTime,
      0.01
    );
  }

  /**
   * Feedback percentage of the delay loop, level of loop repeats.
   * Could be [0 .. 99], where 0 means no repeats.
   * Couldn't be 1 as it will create an infinite loop.
   */
  set feedback(value: number) {
    const feedback = clamp(0, 99, value);
    this.feedbackSub$.next(feedback);
    this.feedbackNode.gain.setTargetAtTime(
      feedback / 100,
      this.currentTime,
      0.01
    );
  }

  constructor(
    context: AudioContext,
    id: string,
    protected defaults: DelaySettings
  ) {
    super(context, id);

    // Nodes initialization.
    this.splitNode = new GainNode(context);
    this.preDelayLP = new BiquadFilterNode(context, {
      type: 'lowpass',
      Q: Math.SQRT2,
      frequency: defaults.feedbackCutoff || 10000
    });
    this.delayNode = new DelayNode(context);
    this.feedbackNode = new GainNode(context);
    this.wet = new GainNode(context);
    this.dry = new GainNode(context);
    this.mergeNode = new GainNode(context);

    // "Wet" chain.
    this.processor = [
      this.splitNode,
      this.preDelayLP,
      this.delayNode,
      this.wet,
      this.mergeNode
    ];
    this.connectNodes(this.processor);

    // Feedback loop.
    this.delayNode.connect(this.feedbackNode).connect(this.delayNode);

    // "Dry" chain.
    this.connectNodes([this.splitNode, this.dry, this.mergeNode]);
    this.applyDefaults();
  }

  dispose() {
    super.dispose();

    this.feedbackNode.disconnect();
    this.dry.disconnect();
    this.levelSub$.complete();
    this.timeSub$.complete();
    this.feedbackSub$.complete();
  }

  takeSnapshot() {
    const snapshot = super.takeSnapshot() as DelayInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      time: this.timeSub$.value,
      feedback: this.feedbackSub$.value
    };

    return snapshot;
  }
}
