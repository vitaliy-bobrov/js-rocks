import { Effect, EffectInfo } from './effect';
import {
  clamp,
  connectNodes,
  dBToGain } from '../../utils';
import { CurveType, makeDistortionCurve } from './distortion-curves';
import { BehaviorSubject } from 'rxjs';
import { ToneControl, MixedTone } from './tone';
import { onePoleLowpass, onePoleHighpass } from './one-pole-filters';

export interface MuffTuningOptions {
  curveType: CurveType;
  boost?: number;
  preFilterRange?: [number, number];
  toneRange?: [number, number];
  postFilterRange?: [number, number];
}

export interface MuffSettings {
  level: number;
  sustain: number;
  tone: number;
  active: boolean;
}

export interface MuffInfo extends EffectInfo {
  params: MuffSettings;
}

export class Muff extends Effect {
  private static defaultTunings: MuffTuningOptions = {
    curveType: 'driver',
    boost: 0,
    preFilterRange: [350, 22050],
    toneRange: [350, 22050],
    postFilterRange: [350, 22050]
  };

  private tunings: MuffTuningOptions;
  private levelSub$ = new BehaviorSubject<number>(0);
  private sustainSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private boostNode: GainNode;
  private preLowpass: IIRFilterNode;
  private preHighpass: IIRFilterNode;
  private waveSharper1Stage: WaveShaperNode;
  private waveSharper2Stage: WaveShaperNode;
  private postLowpass: IIRFilterNode;
  private postHighpass: IIRFilterNode;
  private toneNode: ToneControl;
  private levelNode: GainNode;

  sustain$ = this.sustainSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set sustain(value: number) {
    const amount = clamp(0, 1, value);
    this.sustainSub$.next(amount);

    const curve =  makeDistortionCurve(
      amount,
      this.sampleRate,
      this.tunings.curveType
    );
    this.waveSharper1Stage.curve = curve;
    this.waveSharper2Stage.curve = curve;
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
    private defaults: MuffSettings,
    tunings: MuffTuningOptions,
  ) {
    super(context, model);

    this.tunings = {...Muff.defaultTunings, ...tunings};

    // Boost stage - pre-filtering + boost gain.
    this.boostNode = context.createGain();
    this.boostNode.gain.value = dBToGain(this.tunings.boost);

    const preRange = this.tunings.preFilterRange;
    const preHP = onePoleHighpass(preRange[0], context.sampleRate);
    this.preHighpass = context.createIIRFilter(preHP.feedForward, preHP.feedback);

    const preLP = onePoleLowpass(preRange[1], context.sampleRate);
    this.preLowpass = context.createIIRFilter(preLP.feedForward, preLP.feedback);

    // Double clipping stage.
    this.waveSharper1Stage = context.createWaveShaper();
    this.waveSharper2Stage = context.createWaveShaper();
    // Prevents aliasing.
    this.waveSharper1Stage.oversample = '4x';
    this.waveSharper2Stage.oversample = '4x';

    const postRange = this.tunings.postFilterRange;
    const postHP = onePoleHighpass(postRange[0], context.sampleRate);
    this.preHighpass = context.createIIRFilter(postHP.feedForward, postHP.feedback);

    const postLP = onePoleLowpass(postRange[1], context.sampleRate);
    this.preLowpass = context.createIIRFilter(postLP.feedForward, postLP.feedback);

    // Equalization stage.
    this.toneNode = new MixedTone(context, this.tunings.toneRange);

    // Output stage.
    this.levelNode = context.createGain();

    this.processor = [
      this.preLowpass,
      this.preHighpass,
      this.waveSharper1Stage,
      this.waveSharper2Stage,
      this.postLowpass,
      this.postHighpass,
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

    this.boostNode = null;
    this.preHighpass = null;
    this.preLowpass = null;
    this.waveSharper1Stage.curve = new Float32Array(2);
    this.waveSharper1Stage = null;
    this.waveSharper2Stage.curve = new Float32Array(2);
    this.waveSharper2Stage = null;
    this.postLowpass = null;
    this.postHighpass = null;

    this.toneNode.dispose();
    this.toneNode = null;
    this.levelNode = null;
    this.levelSub$.complete();
    this.sustainSub$.complete();
    this.toneSub$.complete();
  }

  takeSnapshot(): MuffInfo {
    const snapshot = super.takeSnapshot() as MuffInfo;

    snapshot.params = {
      ...snapshot.params,
      sustain: this.sustainSub$.value,
      tone: this.toneSub$.value,
      level: this.levelSub$.value
    };

    return snapshot;
  }
}

