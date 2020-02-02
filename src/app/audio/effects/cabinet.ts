import {
  AudioContext,
  GainNode,
  ConvolverNode,
  BiquadFilterNode
} from 'standardized-audio-context';
import { BehaviorSubject, Observable } from 'rxjs';

import { Effect, EffectInfo } from './effect';
import { clamp } from '@audio/utils';
import { Active } from '@audio/interfaces/active.interface';

export interface CabinetSettings extends Active {
  bass: number;
  mid: number;
  treble: number;
  volume?: number;
  gain: number;
}

export interface CabinetInfo extends EffectInfo {
  params: CabinetSettings;
}

export class Cabinet extends Effect<CabinetSettings> {
  private bassSub$ = new BehaviorSubject(0);
  private midSub$ = new BehaviorSubject(0);
  private trebleSub$ = new BehaviorSubject(0);
  private makeUpGainSub$ = new BehaviorSubject(1);
  private makeUpGain: GainNode<AudioContext>;
  private convolver: ConvolverNode<AudioContext> | null;
  private bassNode: BiquadFilterNode<AudioContext>;
  private midNode: BiquadFilterNode<AudioContext>;
  private trebleNode: BiquadFilterNode<AudioContext>;
  protected defaults = {
    bass: 0.5,
    mid: 0.5,
    treble: 0.5,
    gain: 1
  } as CabinetSettings;

  bass$ = this.bassSub$.asObservable();
  mid$ = this.midSub$.asObservable();
  treble$ = this.trebleSub$.asObservable();
  makeUpGain$ = this.makeUpGainSub$.asObservable();

  set bass(value: number) {
    const bass = clamp(-12, 12, value);
    this.bassSub$.next(bass);

    this.bassNode.gain.setTargetAtTime(bass, this.currentTime, 0.01);
  }

  set mid(value: number) {
    const mid = clamp(-12, 12, value);
    this.midSub$.next(mid);

    this.midNode.gain.setTargetAtTime(mid, this.currentTime, 0.01);
  }

  set treble(value: number) {
    const treble = clamp(-12, 12, value);
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
    id: string,
    buffer$: Observable<AudioBuffer>,
    gain: number,
    private maxGain: number
  ) {
    super(context, id);

    this.convolver = new ConvolverNode(context);
    this.makeUpGain = new GainNode(context, { gain });
    this.defaults.gain = gain;

    this.bassNode = new BiquadFilterNode(context, {
      type: 'lowshelf',
      frequency: 320,
      gain: 0
    });

    this.midNode = new BiquadFilterNode(context, {
      type: 'peaking',
      Q: Math.SQRT1_2,
      frequency: 1000,
      gain: 0
    });

    this.trebleNode = new BiquadFilterNode(context, {
      type: 'highshelf',
      frequency: 3200,
      gain: 0
    });

    buffer$.subscribe(buffer => {
      this.convolver.buffer = buffer;
    });

    this.processor = [
      this.convolver,
      this.makeUpGain,
      this.bassNode,
      this.midNode,
      this.trebleNode
    ];

    this.connectNodes(this.processor);
    this.applyDefaults();
  }

  updateConvolver(
    buffer$: Observable<AudioBuffer>,
    gain: number,
    maxGain: number,
    id: string
  ) {
    this.id = id;
    this.convolver.disconnect();
    this.convolver.buffer = null;
    this.maxGain = maxGain;
    this.gain = gain;

    buffer$.subscribe(buffer => {
      this.convolver.buffer = buffer;
      this.convolver.connect(this.makeUpGain);
    });
  }

  dispose() {
    super.dispose();

    this.convolver.buffer = null;
    this.bassSub$.complete();
    this.midSub$.complete();
    this.trebleSub$.complete();
    this.makeUpGainSub$.complete();
  }

  takeSnapshot() {
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
