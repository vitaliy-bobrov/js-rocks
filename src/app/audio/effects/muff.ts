import { BehaviorSubject } from 'rxjs';
import {
  AudioContext,
  GainNode,
  IIRFilterNode,
  WaveShaperNode
} from 'standardized-audio-context';

import { Effect, EffectInfo } from './effect';
import {
  clamp,
  connectNodes,
  dBToGain
} from '../../utils';
import { CurveType, makeDistortionCurve } from './distortion-curves';
import { ToneControl, MixedTone } from './tone';
import { onePoleLowpass, onePoleHighpass } from './one-pole-filters';

export interface MuffTuningOptions {
  curveType: CurveType;
  boost?: number;
  preFilterRange?: [number, number];
  toneRange?: [number, number];
  postFilterRanges?: [number, number, number, number];
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
    preFilterRange: [250, 22050],
    toneRange: [250, 22050],
    postFilterRanges: [250, 22050, 250, 22050]
  };

  private tunings: MuffTuningOptions;
  private levelSub$ = new BehaviorSubject<number>(0);
  private sustainSub$ = new BehaviorSubject<number>(0);
  private toneSub$ = new BehaviorSubject<number>(0);
  private boostNode: GainNode<AudioContext>;
  private preLowpass: IIRFilterNode<AudioContext>;
  private preHighpass: IIRFilterNode<AudioContext>;
  private waveSharper1Stage: WaveShaperNode<AudioContext>;
  private postLowpass1Stage: IIRFilterNode<AudioContext>;
  private postHighpass1Stage: IIRFilterNode<AudioContext>;
  private waveSharper2Stage: WaveShaperNode<AudioContext>;
  private postLowpass2Stage: IIRFilterNode<AudioContext>;
  private postHighpass2Stage: IIRFilterNode<AudioContext>;
  private toneNode: ToneControl;
  private levelNode: GainNode<AudioContext>;

  sustain$ = this.sustainSub$.asObservable();
  tone$ = this.toneSub$.asObservable();
  level$ = this.levelSub$.asObservable();

  set sustain(value: number) {
    const amount = clamp(0, 1, value);
    this.sustainSub$.next(amount);

    const curve1 =  makeDistortionCurve(
      amount / 4,
      this.sampleRate,
      this.tunings.curveType
    );
    const curve2 =  makeDistortionCurve(
      amount / 2,
      this.sampleRate,
      this.tunings.curveType
    );
    this.waveSharper1Stage.curve = curve1;
    this.waveSharper2Stage.curve = curve2;
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
    this.boostNode = new GainNode(context, {
      gain: dBToGain(this.tunings.boost)
    });

    const preRange = this.tunings.preFilterRange;

    this.preHighpass = new IIRFilterNode(context, {
      ...onePoleHighpass(preRange[0], context.sampleRate)
    });

    this.preLowpass = new IIRFilterNode(context, {
      ...onePoleLowpass(preRange[1], context.sampleRate)
    });

    // Double clipping stage.
    this.waveSharper1Stage = new WaveShaperNode(context, {
      oversample: '4x'
    });
    this.waveSharper2Stage = new WaveShaperNode(context, {
      oversample: '4x'
    });

    const postRange = this.tunings.postFilterRanges;
    this.postLowpass1Stage = new IIRFilterNode(context, {
      ...onePoleHighpass(postRange[0], context.sampleRate)
    });

    this.postHighpass1Stage = new IIRFilterNode(context, {
      ...onePoleLowpass(postRange[1], context.sampleRate)
    });

    this.postLowpass2Stage = new IIRFilterNode(context, {
      ...onePoleHighpass(postRange[2], context.sampleRate)
    });

    this.postHighpass2Stage = new IIRFilterNode(context, {
      ...onePoleLowpass(postRange[3], context.sampleRate)
    });

    // Equalization stage.
    this.toneNode = new MixedTone(context, this.tunings.toneRange);

    // Output stage.
    this.levelNode = context.createGain();

    this.processor = [
      this.boostNode,
      this.preLowpass,
      this.preHighpass,
      this.waveSharper1Stage,
      this.postLowpass1Stage,
      this.postHighpass1Stage,
      this.waveSharper2Stage,
      this.postLowpass2Stage,
      this.postHighpass2Stage,
      ...this.toneNode.nodes,
      this.levelNode
    ];

    connectNodes(this.processor);

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });
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
    this.postLowpass1Stage = null;
    this.postHighpass1Stage = null;
    this.postLowpass2Stage = null;
    this.postHighpass2Stage = null;

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

