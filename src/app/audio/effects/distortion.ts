import { Effect } from './effect';
import { clamp, connectNodes } from '../../utils';
import { curves, CurveType } from './distortion-curves';
import { BehaviorSubject } from 'rxjs';

export interface DistortionSettings {
  level: number;
  distortion: number;
  tone: number;
  oversample: OverSampleType;
}

export class Distortion extends Effect {
  private levelSub$ = new BehaviorSubject<number>(0);
  private distortionSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private preFilter: BiquadFilterNode;
  private waveSharper: WaveShaperNode;
  private toneNode: BiquadFilterNode;
  private levelNode: GainNode;

  distortion$ = this.distortionSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  constructor(
    context: AudioContext,
    private defaults: DistortionSettings,
    private curveType: CurveType = 'classic'
  ) {
    super(context);

    this.waveSharper = context.createWaveShaper();
    this.toneNode = context.createBiquadFilter();
    this.toneNode.type = 'lowpass';
    this.levelNode = context.createGain();

    this.processor = [
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

  withPreFilter(context: AudioContext) {
    this.preFilter = context.createBiquadFilter();
    this.preFilter.type = 'highpass';
    this.preFilter.frequency.value = 280;

    this.toggleBypass();

    this.processor = [
      this.preFilter,
      ...this.processor
    ];

    this.preFilter.connect(this.processor[1]);

    this.toggleBypass();

    return this;
  }

  set oversample(value: OverSampleType) {
    this.waveSharper.oversample = value;
  }

  set distortion(value: number) {
    const amount = clamp(0, 1, value);
    this.distortionSub$.next(amount);
    this.waveSharper.curve = this._makeDistortionCurve(amount);
  }

  set tone(value: number) {
    const tone = clamp(0, 1, value);
    this.toneSub$.next(tone);
    this.toneNode.frequency.setValueAtTime(tone * (22050 - 200) + 200, 0);
  }

  set level(value: number) {
    const gain = clamp(0, 1, value);
    this.levelSub$.next(gain);
    this.levelNode.gain.setValueAtTime(gain, 0);
  }

  dispose() {
    super.dispose();

    this.levelSub$.complete();
    this.distortionSub$.complete();
    this.toneSub$.complete();
  }

  private _makeDistortionCurve(amount: number): Float32Array {
    if (amount === 0) {
      return null;
    }

    const n = 8192;
    const curve = new Float32Array(n + 1);

    curves[this.curveType](amount, curve, n);

    return curve;
  }
}

