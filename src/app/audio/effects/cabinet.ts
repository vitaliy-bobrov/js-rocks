import {
  AudioContext,
  GainNode,
  ConvolverNode,
  BiquadFilterNode
} from 'standardized-audio-context';
import { BehaviorSubject, Observable } from 'rxjs';

import { Effect, EffectInfo } from './effect';
import { connectNodes, clamp } from '../../utils';

export interface CabinetInfo extends EffectInfo {
  params: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    gain: number;
    active: boolean;
  };
}

export class Cabinet extends Effect {
  private makeUpGain: GainNode<AudioContext>;
  private convolver: ConvolverNode<AudioContext>;
  private bassSub$ = new BehaviorSubject<number>(0);
  private midSub$ = new BehaviorSubject<number>(0);
  private trebleSub$ = new BehaviorSubject<number>(0);
  private makeUpGainSub$ = new BehaviorSubject<number>(1);
  private bassNode: BiquadFilterNode<AudioContext>;
  private midNode: BiquadFilterNode<AudioContext>;
  private trebleNode: BiquadFilterNode<AudioContext>;
  private defaults: Partial<CabinetInfo['params']> = {
    bass: 0.5,
    mid: 0.5,
    treble: 0.5,
    gain: 1
  };

  bass$ = this.bassSub$.asObservable();
  mid$ = this.midSub$.asObservable();
  treble$ = this.trebleSub$.asObservable();
  makeUpGain$ = this.makeUpGainSub$.asObservable();

  set bass(value: number) {
    const bass = clamp(-24, 24, value);
    this.bassSub$.next(bass);

    this.bassNode.gain.setTargetAtTime(bass, this.currentTime, 0.01);
  }

  set mid(value: number) {
    const mid = clamp(-24, 24, value);
    this.midSub$.next(mid);

    this.midNode.gain.setTargetAtTime(mid, this.currentTime, 0.01);
  }

  set treble(value: number) {
    const treble = clamp(-24, 24, value);
    this.trebleSub$.next(treble);

    this.trebleNode.gain.setTargetAtTime(treble, this.currentTime, 0.01);
  }

  set gain(value: number) {
    const gain = clamp(1, this.maxGain, value);
    this.makeUpGainSub$.next(gain);

    this.makeUpGain.gain.setTargetAtTime(gain, this.currentTime, 0.01);
  }

  constructor(
    context: AudioContext,
    model: string,
    buffer$: Observable<AudioBuffer>,
    gain: number,
    private maxGain: number
  ) {
    super(context, model);

    this.convolver = new ConvolverNode(context);
    this.makeUpGain = new GainNode(context, {gain});
    this.defaults.gain = gain;

    this.bassNode = new BiquadFilterNode(context, {
      type: 'lowshelf',
      frequency: 320,
      gain: 0
    });

    this.midNode = new BiquadFilterNode(context, {
      type: 'peaking',
      Q: 0.5,
      frequency: 1000,
      gain: 0
    });

    this.trebleNode = new BiquadFilterNode(context, {
      type: 'highshelf',
      frequency: 3200,
      gain: 0
    });

    buffer$.subscribe((buffer) => {
      this.convolver.buffer = buffer;
    });

    this.processor = [
      this.convolver,
      this.makeUpGain,
      this.bassNode,
      this.midNode,
      this.trebleNode
    ];

    connectNodes(this.processor);

    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });
  }

  updateConvolver(buffer$: Observable<AudioBuffer>, gain: number, maxGain: number, model: string) {
    this.model = model;
    this.convolver.disconnect();
    this.convolver.buffer = null;
    this.maxGain = maxGain;
    this.gain = gain;

    buffer$.subscribe((buffer) => {
      this.convolver.buffer = buffer;
    });

    this.toggleBypass();

    this.convolver.connect(this.makeUpGain);

    this.toggleBypass();
  }

  dispose() {
    super.dispose();

    this.convolver.buffer = null;
    this.convolver = null;
    this.makeUpGain = null;
    this.bassNode = null;
    this.midNode = null;
    this.trebleNode = null;
    this.bassSub$.complete();
    this.midSub$.complete();
    this.trebleSub$.complete();
    this.makeUpGainSub$.complete();
  }

  takeSnapshot(): CabinetInfo {
    const snapshot = super.takeSnapshot() as CabinetInfo;

    snapshot.params = {
      ...snapshot.params,
      bass: this.bassSub$.value,
      mid: this.midSub$.value,
      treble: this.trebleSub$.value,
      gain: this.makeUpGainSub$.value
    };

    return snapshot;
  }
}
