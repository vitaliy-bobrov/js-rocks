import { Injectable } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';
import {
  AudioContext,
  GainNode,
  MediaStreamAudioSourceNode
} from 'standardized-audio-context';

import { Effect } from './effects/effect';
import { clamp } from '@audio/utils';
import { Preset } from './preset-manager.service';
import { CabinetInfo } from './effects/cabinet';

@Injectable()
export class AudioContextManager {
  context: AudioContext;
  private effects: Effect<any>[] = [];
  private lineInSource: MediaStreamAudioSourceNode<AudioContext>;
  private masterGain: GainNode<AudioContext>;
  private masterSub$ = new BehaviorSubject(0);

  master$ = this.masterSub$.asObservable();

  set master(value: number) {
    const gain = clamp(0, 1, value);
    this.masterSub$.next(gain);
    this.masterGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.01);
  }

  constructor() {
    this.context = new AudioContext({
      latencyHint: 'interactive'
    });
    this.masterGain = new GainNode(this.context);
    this.masterGain.connect(this.context.destination);
    this.masterSub$.next(1);
  }

  async plugLineIn() {
    try {
      if (!this.lineInSource) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0
          }
        });
        this.lineInSource = new MediaStreamAudioSourceNode(this.context, {
          mediaStream
        });

        this.connectAll();
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

  addEffect(effect: Effect<any>, post = false) {
    this.disconnectAll();

    if (post) {
      this.effects.push(effect);
    } else {
      this.effects.splice(-1, 0, effect);
    }

    this.connectAll();
  }

  removeEffect(effect: Effect<any>) {
    this.disconnectAll();
    this.effects = this.effects.filter(eff => eff !== effect);
    this.connectAll();
  }

  moveEffect(previousIndex: number, currentIndex: number) {
    this.disconnectAll();
    moveItemInArray(this.effects, previousIndex, currentIndex);
    this.connectAll();
  }

  connectAll() {
    if (this.effects.length) {
      if (this.lineInSource) {
        this.lineInSource.connect(this.effects[0].input);
      }

      for (let i = this.effects.length - 1; i > 0; --i) {
        this.effects[i - 1].connect(this.effects[i]);
      }

      this.effects[this.effects.length - 1].output.connect(this.masterGain);
    } else if (this.lineInSource) {
      this.lineInSource.connect(this.masterGain);
    }
  }

  disconnectAll() {
    if (this.lineInSource) {
      this.lineInSource.disconnect();
    }

    for (const effect of this.effects) {
      effect.disconnect();
    }
  }

  takeSnapshot() {
    if (!this.effects.length) {
      return;
    }

    const cabinet = this.effects[
      this.effects.length - 1
    ].takeSnapshot() as CabinetInfo;
    cabinet.params.volume = this.masterSub$.value;

    const snapshot: Preset = {
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
