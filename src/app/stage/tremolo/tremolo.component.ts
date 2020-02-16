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

import { Tremolo, TremoloSettings } from '@audio/effects/tremolo';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';
import { ThreeKnobLayoutModule } from '../three-knob-layout/three-knob-layout.component';

@Component({
  selector: 'jsr-tremolo',
  templateUrl: './tremolo.component.html',
  styleUrls: ['./tremolo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TremoloComponent
  implements OnInit, OnDestroy, PedalComponent<TremoloSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Tremolo;

  params: TremoloSettings = {
    rate: 4.2,
    depth: 50,
    level: 0.5,
    wave: 0.5,
    active: false,
    type: 'trapezoid'
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
  declarations: [TremoloComponent],
  bootstrap: [TremoloComponent],
  imports: [
    CommonModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule,
    ThreeKnobLayoutModule
  ]
})
export class TremoloModule {}
