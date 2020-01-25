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

import { Phaser, PhaserSettings } from '@audio/effects/phaser';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { SmallSwitchModule } from '../small-switch/small-switch.component';
import { StompboxModule } from '../stompbox/stompbox.component';

@Component({
  selector: 'jsr-phase-pi-by-two',
  templateUrl: './phase-pi-by-two.component.html',
  styleUrls: ['./phase-pi-by-two.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhasePiByTwoComponent
  implements OnInit, OnDestroy, PedalComponent<PhaserSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Phaser;

  params: PhaserSettings = {
    level: 0.5,
    depth: 1,
    rate: 1.9,
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Phaser(this.manager.context, this.info.id, {
      ...this.params,
      stages: 4,
      minFrequency: 340.8,
      maxFrequency: 1160.2,
      type: 'triangle'
    });
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [PhasePiByTwoComponent],
  bootstrap: [PhasePiByTwoComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    SmallSwitchModule,
    StompboxModule
  ]
})
export class PhasePiByTwoModule {}
