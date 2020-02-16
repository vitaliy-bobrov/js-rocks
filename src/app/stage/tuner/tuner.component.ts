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

import { Active } from '@audio/interfaces/active.interface';
import { Tuner } from '@audio/effects/tuner/tuner';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { SevenSegmentLcdModule } from '../seven-segment-lcd/seven-segment-lcd.component';
import { StompboxModule } from '../stompbox/stompbox.component';
import { CentsPositionPipe } from './cents-position.pipe';
import { PitchClassNamePipe } from './pitch-class-name.pipe';

@Component({
  selector: 'jsr-tuner',
  templateUrl: './tuner.component.html',
  styleUrls: ['./tuner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunerComponent
  implements OnInit, OnDestroy, PedalComponent<Active> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Tuner;

  params: Active = {
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tuner(this.manager.context, this.info.id, this.params);
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
  declarations: [CentsPositionPipe, TunerComponent, PitchClassNamePipe],
  bootstrap: [TunerComponent],
  imports: [
    CommonModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    SevenSegmentLcdModule,
    StompboxModule
  ]
})
export class TunerModule {}
