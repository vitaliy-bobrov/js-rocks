import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax } from '../../utils';
import { BehaviorSubject } from 'rxjs';

export interface CompressorSettings {
  level: number;
  attack: number;
  ratio: number;
  threshold: number;
  active: boolean;
}

export interface CompressorInfo extends EffectInfo {
  params: CompressorSettings;
}

export class Compressor extends Effect {
  private levelSub$ = new BehaviorSubject<number>(0);
  private attackSub$ = new BehaviorSubject<number>(0);
  private ratioSub$ = new BehaviorSubject<number>(0);
  private thresholdSub$ = new BehaviorSubject<number>(0);
  private compressor: DynamicsCompressorNode;
  private levelNode: GainNode;

  level$ = this.levelSub$.asObservable();
  attack$ = this.attackSub$.asObservable();
  ratio$ = this.ratioSub$.asObservable();
  threshold$ = this.thresholdSub$.asObservable();

  set level(value: number) {
    const gain = clamp(0, 10, value);
    this.levelSub$.next(gain);

    const time = this.levelNode.context.currentTime;
    this.levelNode.gain.setTargetAtTime(gain, time, 0.01);
  }

  set attack(value: number) {
    const clamped = clamp(0, 1, value);
    this.attackSub$.next(clamped);

    const attack = mapToMinMax(clamped, 0.001, 1);
    const time = this.compressor.context.currentTime;
    this.compressor.attack.exponentialRampToValueAtTime(attack, time);
  }

  set ratio(value: number) {
    const ratio = clamp(1, 20, value);
    this.ratioSub$.next(ratio);

    const time = this.compressor.context.currentTime;
    this.compressor.ratio.exponentialRampToValueAtTime(ratio, time);
  }

  set threshold(value: number) {
    const clamped = clamp(0, 1, value);
    this.thresholdSub$.next(clamped);

    const threshold = mapToMinMax(clamped, -100, 0);
    const time = this.compressor.context.currentTime;
    this.compressor.threshold.exponentialRampToValueAtTime(threshold, time);
  }

  constructor(
    context: AudioContext,
    model: string,
    private defaults: CompressorSettings
  ) {
    super(context, model);

    this.levelNode = new GainNode(context);
    this.compressor = new DynamicsCompressorNode(context, {
      knee: 5,
      release: 0.25
    });

    this.processor = [
      this.compressor,
      this.levelNode
    ];

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });

    connectNodes(this.processor);

    this.input.connect(this.output);
  }

  dispose() {
    super.dispose();

    this.levelNode = null;
    this.compressor = null;
    this.levelSub$.complete();
    this.attackSub$.complete();
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

