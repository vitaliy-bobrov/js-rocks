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

import { Chorus, ChorusSettings } from '@audio/effects/chorus';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';

@Component({
  selector: 'jsr-cool-chorus',
  templateUrl: './cool-chorus.component.html',
  styleUrls: ['./cool-chorus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoolChorusComponent
  implements OnInit, OnDestroy, PedalComponent<ChorusSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Chorus;

  params: ChorusSettings = {
    level: 0.5,
    eq: 0.5,
    rate: 4,
    depth: 60,
    feedback: 0.4,
    delay: 0.0045,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Chorus(this.manager.context, 'jch-1', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [CoolChorusComponent],
  bootstrap: [CoolChorusComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule
  ]
})
export class CoolChorusModule {}
