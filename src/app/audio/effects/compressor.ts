import {
  AudioContext,
  GainNode,
  DynamicsCompressorNode
} from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax } from '../../utils';
import { Active } from '@audio/interfaces/active.interface';

export interface CompressorSettings extends Active {
  level: number;
  attack: number;
  ratio: number;
  threshold: number;
}

export interface CompressorInfo extends EffectInfo {
  params: CompressorSettings;
}

export class Compressor extends Effect<CompressorSettings> {
  private levelSub$ = new BehaviorSubject<number>(0);
  private attackSub$ = new BehaviorSubject<number>(0);
  private ratioSub$ = new BehaviorSubject<number>(0);
  private thresholdSub$ = new BehaviorSubject<number>(0);
  private compressor: DynamicsCompressorNode<AudioContext>;
  private levelNode: GainNode<AudioContext>;

  level$ = this.levelSub$.asObservable();
  attack$ = this.attackSub$.asObservable();
  ratio$ = this.ratioSub$.asObservable();
  threshold$ = this.thresholdSub$.asObservable();

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);

    this.levelNode.gain.setTargetAtTime(gain, this.currentTime, 0.01);
  }

  set attack(value: number) {
    const clamped = clamp(0, 1, value);
    this.attackSub$.next(clamped);

    const attack = mapToMinMax(clamped, 0.001, 1);
    this.compressor.attack.setValueAtTime(attack, this.currentTime);
  }

  set ratio(value: number) {
    const ratio = clamp(1, 20, value);
    this.ratioSub$.next(ratio);

    this.compressor.ratio.setValueAtTime(ratio, this.currentTime);
  }

  set threshold(value: number) {
    const clamped = clamp(0, 1, value);
    this.thresholdSub$.next(clamped);

    const threshold = mapToMinMax(clamped, -60, 0);
    this.compressor.threshold.setValueAtTime(threshold, this.currentTime);
  }

  constructor(
    context: AudioContext,
    model: string,
    protected defaults: CompressorSettings
  ) {
    super(context, model);

    this.levelNode = new GainNode(context);
    this.compressor = new DynamicsCompressorNode(context, {
      knee: 30,
      release: 0.25
    });

    this.processor = [
      this.compressor,
      this.levelNode
    ];

    connectNodes(this.processor);
    this.applyDefaults();
  }

  dispose() {
    super.dispose();

    this.levelNode = null;
    this.compressor = null;
    this.levelSub$.complete();
    this.attackSub$.complete();
    this.ratioSub$.complete();
    this.thresholdSub$.complete();
  }

  takeSnapshot(): CompressorInfo {
    const snapshot = super.takeSnapshot() as CompressorInfo;

    snapshot.params = {
      ...snapshot.params,
      level: this.levelSub$.value,
      attack: this.attackSub$.value,
      ratio: this.ratioSub$.value,
      threshold: this.thresholdSub$.value,
    };

    return snapshot;
  }
}

