import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
  HostBinding,
  ViewChild,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

import { Tremolo, TremoloSettings } from '@audio/effects/tremolo';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';

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

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Tremolo;

  params: TremoloSettings = {
    rate: 4.2,
    depth: 50,
    wave: 0.5,
    active: false,
    type: 'trapezoid'
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tremolo(this.manager.context, 'jtr-2', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [TremoloComponent],
  bootstrap: [TremoloComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule
  ]
})
export class TremoloModule {}
