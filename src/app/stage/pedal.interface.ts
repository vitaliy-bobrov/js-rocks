import { Type, EventEmitter } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

export interface PedalComponent<T> {
  params: T;
  remove: EventEmitter<void>;
  drag: CdkDrag;
}

export interface PedalDescriptor {
  id: string;
  name: string;
  model: string;
}
