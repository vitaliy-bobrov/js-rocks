import { Effect, EffectInfo } from './effect';
import { clamp, connectNodes, mapToMinMax, expScale } from '../../utils';
import { curves, CurveType } from './distortion-curves';
import { BehaviorSubject } from 'rxjs';
import { ToneNode } from './tone';

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
  private levelSub$ = new BehaviorSubject<number>(0);
  private distortionSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private preFilterLow: BiquadFilterNode;
  private preFilterHigh: BiquadFilterNode;
  private waveSharper: WaveShaperNode;
  private toneNode: BiquadFilterNode;
  private levelNode: GainNode;

  distortion$ = this.distortionSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set distortion(value: number) {
    const amount = clamp(0, 1, value);
    this.distortionSub$.next(amount);

    this.waveSharper.curve = this._makeDistortionCurve(amount);
  }

  set tone(value: number) {
    const tone = clamp(0, 1, value);
    this.toneSub$.next(tone);

    const frequency = mapToMinMax(expScale(tone), 350, this.sampleRate / 2);
    this.toneNode.frequency.exponentialRampToValueAtTime(frequency, this.currentTime);
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
    private curveType: CurveType,
    lowPreFilter = 350
  ) {
    super(context, model);

    this.preFilterLow = context.createBiquadFilter();
    this.preFilterLow.type = 'highpass';
    this.preFilterLow.Q.value = Math.SQRT1_2;
    this.preFilterLow.frequency.value = lowPreFilter;

    this.preFilterHigh = context.createBiquadFilter();
    this.preFilterHigh.type = 'lowpass';
    this.preFilterHigh.Q.value = Math.SQRT1_2;
    this.preFilterHigh.frequency.value = this.sampleRate / 2;

    this.waveSharper = context.createWaveShaper();
    // Prevents aliasing.
    this.waveSharper.oversample = '4x';
    this.toneNode = ToneNode(context);
    this.levelNode = context.createGain();

    this.processor = [
      this.preFilterLow,
      this.preFilterHigh,
      this.waveSharper,
      this.toneNode,
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

    this.preFilterLow = null;
    this.preFilterHigh = null;
    this.waveSharper.curve = new Float32Array(2);
    this.waveSharper = null;
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

  private _makeDistortionCurve(amount: number): Float32Array {
    const n = this.sampleRate;
    const curve = new Float32Array(n + 1);

    curves[this.curveType](amount, curve, n);

    return curve;
  }
}

