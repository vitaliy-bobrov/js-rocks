import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

export interface PedalComponent<T> {
  destroy$: Subject<void>;
  params: T;
  info: PedalDescriptor;
  remove: EventEmitter<void>;
}

export type EffectType =
  | 'Tuner'
  | 'Compressor'
  | 'Overdrive'
  | 'Distortion'
  | 'Fuzz'
  | 'Chorus'
  | 'Phaser'
  | 'Tremolo'
  | 'Delay'
  | 'Reverb';

export interface PedalDescriptor {
  id: string;
  brand: string;
  name: string;
  type: EffectType;
  model?: string;
}
