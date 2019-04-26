import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StageRoutingModule } from './stage-routing.module';
import { StageComponent } from './stage/stage.component';
import { AudioModule } from '@audio/audio.module';
import { StompboxComponent } from './stompbox/stompbox.component';
import { DsOneComponent } from './ds-one/ds-one.component';
import { LedComponent } from './led/led.component';
import { KnobComponent } from './knob/knob.component';
import { LargeSwitchComponent } from './large-switch/large-switch.component';
import { BluesDriverComponent } from './blues-driver/blues-driver.component';
import { AmpComponent } from './amp/amp.component';

@NgModule({
  declarations: [
    StageComponent,
    StompboxComponent,
    DsOneComponent,
    LedComponent,
    KnobComponent,
    LargeSwitchComponent,
    BluesDriverComponent,
    AmpComponent
  ],
  imports: [
    AudioModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    StageRoutingModule
  ]
})
export class StageModule {}
