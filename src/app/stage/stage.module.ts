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
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AudioModule } from '@audio/audio.module';
import { StageRoutingModule } from './stage-routing.module';
import { AmpComponent } from './amp/amp.component';
import { BluesDriverComponent } from './blues-driver/blues-driver.component';
import { CoolChorusComponent } from './cool-chorus/cool-chorus.component';
import { DsOneComponent } from './ds-one/ds-one.component';
import { KnobComponent } from './knob/knob.component';
import { LargeSwitchComponent } from './large-switch/large-switch.component';
import { LedComponent } from './led/led.component';
import { LemonSqueezeComponent } from './lemon-squeeze/lemon-squeeze.component';
import { MassiveMuffPiComponent } from './massive-muff-pi/massive-muff-pi.component';
import { MetalAreaComponent } from './metal-area/metal-area.component';
import { OverdriveComponent } from './overdrive/overdrive.component';
import { PedalBoardDirective } from './pedalboard/pedalboard.directive';
import { PresetNameDialogComponent } from './preset-name-dialog/preset-name-dialog.component';
import { ReverbComponent } from './reverb/reverb.component';
import { SevenSegmentLcdComponent } from './seven-segment-lcd/seven-segment-lcd.component';
import { SharedModule } from '@shared/shared.module';
import { SlideSwitchComponent } from './slide-switch/slide-switch.component';
import { SmallSwitchComponent } from './small-switch/small-switch.component';
import { StageComponent } from './stage/stage.component';
import { StompboxComponent } from './stompbox/stompbox.component';
import { TremoloComponent } from './tremolo/tremolo.component';
import { TunerComponent } from './tuner/tuner.component';

@NgModule({
  declarations: [
    AmpComponent,
    BluesDriverComponent,
    CoolChorusComponent,
    DsOneComponent,
    KnobComponent,
    LargeSwitchComponent,
    LedComponent,
    LemonSqueezeComponent,
    MassiveMuffPiComponent,
    MetalAreaComponent,
    OverdriveComponent,
    PedalBoardDirective,
    PresetNameDialogComponent,
    ReverbComponent,
    SevenSegmentLcdComponent,
    SlideSwitchComponent,
    SmallSwitchComponent,
    StageComponent,
    StompboxComponent,
    TremoloComponent,
    TunerComponent
  ],
  imports: [
    A11yModule,
    AudioModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    SharedModule,
    StageRoutingModule
  ]
})
export class StageModule {}
