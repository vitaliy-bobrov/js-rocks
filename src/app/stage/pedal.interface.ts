import { Type, EventEmitter } from '@angular/core';

export interface PedalComponent<T> {
  params: T;
  remove: EventEmitter<void>;
}

export class Pedal {
  constructor(public component: Type<any>, public params?: any) {}
}
