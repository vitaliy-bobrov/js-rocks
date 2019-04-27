import { Type } from '@angular/core';

export interface PedalComponent {
}

export class Pedal {
  constructor(public component: Type<any>) {}
}
