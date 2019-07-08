import { Injectable } from '@angular/core';
import { Effect } from './effects/effect';
import { clamp } from '../utils';
import { BehaviorSubject } from 'rxjs';
import { Preset } from './preset-manager.service';
import { CabinetInfo } from './effects/cabinet';

@Injectable()
export class AudioContextManager {
  context: AudioContext;
  private effects: Effect[] = [];
  private lineInSource: MediaStreamAudioSourceNode;
  private masterGain: GainNode;
  private masterSub$ = new BehaviorSubject<number>(0);

  master$ = this.masterSub$.asObservable();

  set master(value: number) {
    const gain = clamp(0, 1, value);
    this.masterSub$.next(gain);
    this.masterGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.01);
  }

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterSub$.next(1);
  }

  async plugLineIn() {
    try {
      if (!this.lineInSource) {
        const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0
          } as MediaStreamConstraints['audio']
        });
        this.lineInSource = this.context.createMediaStreamSource(stream);

        this.connectInOrder();
      }
    } catch (err) {
      console.error(err);
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  async unplugLineIn() {
    if (this.context.state === 'running') {
      await this.context.suspend();
    }
  }

  addEffect(effect: Effect, post = false) {
    this.disconnectAll();

    if (post) {
      this.effects.push(effect);
    } else {
      this.effects.splice(-1, 0, effect);
    }

    this.connectInOrder();
  }

  removeEffect(effect: Effect) {
    this.disconnectAll();
    this.effects = this.effects.filter(eff => eff !== effect);
    this.connectInOrder();
  }

  connectInOrder() {
    if (this.effects.length) {
      if (this.lineInSource) {
        this.lineInSource.connect(this.effects[0].input);
      }

      Effect.connectInOrder(this.effects);

      this.effects[this.effects.length - 1].output.connect(this.masterGain);
    } else if (this.lineInSource) {
      this.lineInSource.connect(this.masterGain);
    }
  }

  disconnectAll() {
    if (this.lineInSource) {
      this.lineInSource.disconnect();
    }

    Effect.disconnectInOrder(this.effects);
  }

  takeSnapshot(): Preset {
    if (!this.effects.length) {
      return;
    }

    const cabinet = this.effects[this.effects.length - 1].takeSnapshot() as CabinetInfo;
    cabinet.params.volume = this.masterSub$.value;

    const snapshot = {
      cabinet,
      pedals: []
    };

    for (let i = 0; i < this.effects.length - 1; i++) {
      const effectParams = this.effects[i].takeSnapshot();
      snapshot.pedals.push(effectParams);
    }

    return snapshot;
  }
}
