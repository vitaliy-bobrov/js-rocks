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

import { Distortion, DistortionSettings } from '@audio/effects/distortion';
import { AudioContextManager } from '@audio/audio-context-manager.service';

import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { PedalComponent } from '../pedal.interface';
import { StompboxModule } from '../stompbox/stompbox.component';
import { ThreeKnobLayoutModule } from '../three-knob-layout/three-knob-layout.component';

@Component({
  selector: 'jsr-blues-driver',
  templateUrl: './blues-driver.component.html',
  styleUrls: ['./blues-driver.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BluesDriverComponent
  implements OnInit, OnDestroy, PedalComponent<DistortionSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Distortion;

  params: DistortionSettings = {
    level: 0.5,
    distortion: 0.5,
    tone: 0.5,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(this.manager.context, 'jbd-2', this.params, {
      curveType: 'blues'
    });
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [BluesDriverComponent],
  bootstrap: [BluesDriverComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    StompboxModule,
    ThreeKnobLayoutModule
  ]
})
export class BluesDriverModule {}
