import { EventEmitter } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

export interface PedalComponent<T> {
  params: T;
  info: PedalDescriptor;
  remove: EventEmitter<void>;
  drag: CdkDrag;
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
