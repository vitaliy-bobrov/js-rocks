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
    private defaults: CompressorSettings
  ) {
    super(context, model);

    this.levelNode = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    this.compressor.knee.value = 30;
    this.compressor.release.value = 0.25;

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

