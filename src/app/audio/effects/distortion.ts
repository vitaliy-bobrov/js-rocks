import { BehaviorSubject } from 'rxjs';
import {
  AudioContext,
  GainNode,
  BiquadFilterNode,
  WaveShaperNode
} from 'standardized-audio-context';

import { Effect, EffectInfo } from './effect';
import {
  clamp,
  connectNodes,
  calculateBandpass
} from '../../utils';
import { CurveType, makeDistortionCurve } from './distortion-curves';
import { ToneControl, StandardTone, MixedTone } from './tone';
import { Active } from '@audio/interfaces/active.interface';

export interface DistortionTuningOptions {
  curveType: CurveType;
  preFilterRange?: [number, number];
  toneControlType?: 'standard' | 'mixed';
  toneRange?: [number, number];
  postFilter?: number;
}

export interface DistortionSettings extends Active {
  level: number;
  distortion: number;
  tone: number;
}

export interface DistortionInfo extends EffectInfo {
  params: DistortionSettings;
}

export class Distortion extends Effect<DistortionSettings> {
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
  private preFilter: BiquadFilterNode<AudioContext>;
  private waveSharper: WaveShaperNode<AudioContext>;
  private postFilter: BiquadFilterNode<AudioContext>;
  private toneNode: ToneControl;
  private levelNode: GainNode<AudioContext>;

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
    protected defaults: DistortionSettings,
    tunings: DistortionTuningOptions,
  ) {
    super(context, model);

    this.tunings = {...Distortion.defaultTunings, ...tunings};

    // Boost stage - pre-filtering + boost gain.

    const bandpassParams = calculateBandpass(this.tunings.preFilterRange);
    this.preFilter = new BiquadFilterNode(context, {
      type: 'bandpass',
      Q: bandpassParams.q,
      frequency: bandpassParams.fc
    });

    // Clipping stage.
    this.waveSharper = new WaveShaperNode(context, {
      oversample: '4x'
    });

    this.postFilter = new BiquadFilterNode(context, {
      type: 'lowpass',
      Q: Math.SQRT1_2,
      frequency: this.tunings.postFilter
    });

    // Equalization stage.
    if (this.tunings.toneControlType === 'standard') {
      this.toneNode = new StandardTone(context, this.tunings.toneRange);
    }

    if (this.tunings.toneControlType === 'mixed') {
      this.toneNode = new MixedTone(context, this.tunings.toneRange);
    }

    // Output stage.
    this.levelNode = new GainNode(context);

    this.processor = [
      this.preFilter,
      this.waveSharper,
      this.postFilter,
      ...this.toneNode.nodes,
      this.levelNode
    ];

    connectNodes(this.processor);
    this.applyDefaults();
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

