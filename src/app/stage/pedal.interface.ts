import { Type } from '@angular/core';

export interface PedalComponent<T> {
  params: T;
}

export class Pedal {
  constructor(public component: Type<any>, public params?: any) {}
}
