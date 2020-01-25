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
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';
import { ThreeKnobLayoutModule } from '../three-knob-layout/three-knob-layout.component';

@Component({
  selector: 'jsr-metal-area',
  templateUrl: './metal-area.component.html',
  styleUrls: ['./metal-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetalAreaComponent
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

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(
      this.manager.context,
      this.info.id,
      this.params,
      {
        curveType: 'sustained',
        preFilterRange: [250, 7000],
        postFilter: 5000
      }
    );
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [MetalAreaComponent],
  bootstrap: [MetalAreaComponent],
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
export class MetalAreaModule {}
