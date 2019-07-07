import { Effect, EffectInfo } from './effect';
import {
  clamp,
  connectNodes,
  calculateBandpass } from '../../utils';
import { CurveType, makeDistortionCurve } from './distortion-curves';
import { BehaviorSubject } from 'rxjs';
import { ToneControl, StandardTone, MixedTone } from './tone';

export interface DistortionTuningOptions {
  curveType: CurveType;
  preFilterRange?: [number, number];
  toneControlType?: 'standard' | 'mixed';
  toneRange?: [number, number];
  postFilter?: number;
}

export interface DistortionSettings {
  level: number;
  distortion: number;
  tone: number;
  active: boolean;
}

export interface DistortionInfo extends EffectInfo {
  params: DistortionSettings;
}

export class Distortion extends Effect {
  private static defaultTunings: DistortionTuningOptions = {
    curveType: 'driver',
    preFilterRange: [350, 12000],
    toneControlType: 'standard',
    toneRange: [350, 12000],
    postFilter: 12000,
  };

  private tunings: DistortionTuningOptions;
  private levelSub$ = new BehaviorSubject<number>(0);
  private distortionSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private preFilter: BiquadFilterNode;
  private waveSharper: WaveShaperNode;
  private postFilter: BiquadFilterNode;
  private toneNode: ToneControl;
  private levelNode: GainNode;

  distortion$ = this.distortionSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set distortion(value: number) {
    const amount = clamp(0, 1, value);
    this.distortionSub$.next(amount);
    this.waveSharper.curve = makeDistortionCurve(
      amount,
      this.sampleRate,
      this.tunings.curveType
    );
  }

  set tone(value: number) {
    const tone = clamp(0, 1, value);
    this.toneSub$.next(tone);
    this.toneNode.tone = tone;
  }

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    this.levelNode.gain.setTargetAtTime(gain, this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    model: string,
    private defaults: DistortionSettings,
    tunings: DistortionTuningOptions,
  ) {
    super(context, model);

    this.tunings = {...Distortion.defaultTunings, ...tunings};

    // Boost stage - pre-filtering + boost gain.
    this.preFilter = context.createBiquadFilter();
    const bandpassParams = calculateBandpass(this.tunings.preFilterRange);
    this.preFilter.type = 'bandpass';
    this.preFilter.Q.value = bandpassParams.q;
    this.preFilter.frequency.value = bandpassParams.fc;

    // Clipping stage.
    this.waveSharper = context.createWaveShaper();
    // Prevents aliasing.
    this.waveSharper.oversample = '4x';

    this.postFilter = context.createBiquadFilter();
    this.postFilter.type = 'lowpass';
    this.postFilter.Q.value = Math.SQRT1_2;
    this.postFilter.frequency.value = this.tunings.postFilter;

    // Equalization stage.
    if (this.tunings.toneControlType === 'standard') {
      this.toneNode = new StandardTone(context, this.tunings.toneRange);
    }

    if (this.tunings.toneControlType === 'mixed') {
      this.toneNode = new MixedTone(context, this.tunings.toneRange);
    }

    // Output stage.
    this.levelNode = context.createGain();

    this.processor = [
      this.preFilter,
      this.waveSharper,
      this.postFilter,
      ...this.toneNode.nodes,
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

    this.preFilter = null;
    this.waveSharper.curve = new Float32Array(2);
    this.waveSharper = null;
    this.postFilter = null;

    this.toneNode.dispose();
    this.toneNode = null;
    this.levelNode = null;
    this.levelSub$.complete();
    this.distortionSub$.complete();
    this.toneSub$.complete();
  }

  takeSnapshot(): DistortionInfo {
    const snapshot = super.takeSnapshot() as DistortionInfo;

    snapshot.params = {
      ...snapshot.params,
      distortion: this.distortionSub$.value,
      tone: this.toneSub$.value,
      level: this.levelSub$.value
    };

    return snapshot;
  }
}

