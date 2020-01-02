import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  NgModule,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

import { Compressor, CompressorSettings } from '@audio/effects/compressor';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';
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

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Compressor;

  params: CompressorSettings = {
    level: 0.6,
    attack: 0.15,
    ratio: 12,
    threshold: 0.5,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Compressor(this.manager.context, 'jcp-1', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [LemonSqueezeComponent],
  bootstrap: [LemonSqueezeComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule
  ]
})
export class LemonSqueezeModule {}
