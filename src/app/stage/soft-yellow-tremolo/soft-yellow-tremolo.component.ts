import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  NgModule,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Tremolo, TremoloSettings } from '@audio/effects/tremolo';
import { KnobModule } from '../knob/knob.component';
import { LedModule } from '../led/led.component';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { SmallSwitchModule } from '../small-switch/small-switch.component';
import { StompboxModule } from '../stompbox/stompbox.component';
import { ThreeKnobLayoutModule } from '../three-knob-layout/three-knob-layout.component';

@Component({
  selector: 'jsr-soft-yellow-tremolo',
  templateUrl: './soft-yellow-tremolo.component.html',
  styleUrls: ['./soft-yellow-tremolo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoftYellowTremoloComponent
  implements OnInit, OnDestroy, PedalComponent<TremoloSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Tremolo;

  params: TremoloSettings = {
    level: 0.5,
    rate: 3,
    depth: 50,
    active: false,
    type: 'sine'
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tremolo(this.manager.context, this.info.id, this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [SoftYellowTremoloComponent],
  bootstrap: [SoftYellowTremoloComponent],
  imports: [
    CommonModule,
    KnobModule,
    SmallSwitchModule,
    LedModule,
    StompboxModule,
    ThreeKnobLayoutModule
  ]
})
export class SoftYellowTremoloModule {}
