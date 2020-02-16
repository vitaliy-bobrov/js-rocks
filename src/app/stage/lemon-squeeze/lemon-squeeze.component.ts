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

import { Compressor, CompressorSettings } from '@audio/effects/compressor';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';

@Component({
  selector: 'jsr-lemon-squeeze',
  templateUrl: './lemon-squeeze.component.html',
  styleUrls: ['./lemon-squeeze.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LemonSqueezeComponent
  implements OnInit, OnDestroy, PedalComponent<CompressorSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Compressor;

  params: CompressorSettings = {
    level: 0.6,
    attack: 0.15,
    ratio: 4,
    threshold: 0.6,
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Compressor(
      this.manager.context,
      this.info.id,
      this.params
    );
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
  declarations: [LemonSqueezeComponent],
  bootstrap: [LemonSqueezeComponent],
  imports: [
    CommonModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule
  ]
})
export class LemonSqueezeModule {}
