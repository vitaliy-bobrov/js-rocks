import { Injectable } from '@angular/core';
import { Effect } from './effects/effect';
import { clamp, gainFadeInConnect } from '../utils';
import { BehaviorSubject } from 'rxjs';

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
    this.masterGain.gain.setValueAtTime(gain, 0);
  }

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();

    gainFadeInConnect({
      target: this.masterGain,
      dest: this.context.destination,
      time: this.context.currentTime
    });
    this.masterSub$.next(1);
  }

  async plugLineIn() {
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 10,
            googHighpassFilter: false,
          } as MediaStreamConstraints['audio']
        });
      this.lineInSource = this.context.createMediaStreamSource(stream);
      this.connectInOrder();
    } catch (err) {
      console.error(err);
    }
  }

  unplugLineIn() {
    this.disconnectAll();
  }

  addEffect(effect: Effect) {
    this.effects.push(effect);

    if (!this.lineInSource) {
      return;
    }

    if (this.effects.length > 1) {
      const last = this.effects[this.effects.length - 1];
      last.output.disconnect();
      last.connect(effect);
    } else {
      this.lineInSource.disconnect();
      this.lineInSource.connect(effect.input);
    }

    effect.output.connect(this.masterGain);
  }

  removeEffect(effect: Effect) {
    this.disconnectAll();

    this.effects = this.effects.filter(eff => eff === effect);

    this.connectInOrder();
  }

  connectInOrder() {
    if (this.effects.length) {
      this.lineInSource.connect(this.effects[0].input);

      Effect.connectInOrder(this.effects);

      this.effects[this.effects.length - 1].output.connect(this.masterGain);
    } else {
      this.lineInSource.connect(this.masterGain);
    }
  }

  disconnectAll() {
    this.lineInSource.disconnect();

    Effect.disconnectInOrder(this.effects);
  }
}
