import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
import { OverdriveComponent } from './overdrive/overdrive.component';
import { PedalBoardDirective } from './pedalboard/pedalboard.directive';
import { SharedModule } from '../shared/shared.module';
import { PresetNameDialogComponent } from './preset-name-dialog/preset-name-dialog.component';
import { ReverbComponent } from './reverb/reverb.component';
import { SlideSwitchComponent } from './slide-switch/slide-switch.component';
import { LemonSqueezeComponent } from './lemon-squeeze/lemon-squeeze.component';
import { MetalAreaComponent } from './metal-area/metal-area.component';
import { CoolChorusComponent } from './cool-chorus/cool-chorus.component';

@NgModule({
  declarations: [
    StageComponent,
    StompboxComponent,
    DsOneComponent,
    LedComponent,
    KnobComponent,
    LargeSwitchComponent,
    BluesDriverComponent,
    AmpComponent,
    OverdriveComponent,
    PedalBoardDirective,
    PresetNameDialogComponent,
    ReverbComponent,
    SlideSwitchComponent,
    LemonSqueezeComponent,
    MetalAreaComponent,
    CoolChorusComponent
  ],
  entryComponents: [
    PresetNameDialogComponent,
    DsOneComponent,
    BluesDriverComponent,
    OverdriveComponent,
    ReverbComponent,
    LemonSqueezeComponent,
    MetalAreaComponent,
    CoolChorusComponent
  ],
  imports: [
    A11yModule,
    AudioModule,
    SharedModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    StageRoutingModule
  ]
})
export class StageModule {}
