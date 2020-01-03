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
import { KnobModule } from './knob/knob.component';
import { LedModule } from './led/led.component';
import { PresetNameDialogComponent } from './preset-name-dialog/preset-name-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { StageComponent } from './stage/stage.component';
import { LoadableModule } from 'ngx-loadable';

@NgModule({
  declarations: [AmpComponent, PresetNameDialogComponent, StageComponent],
  imports: [
    A11yModule,
    AudioModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    KnobModule,
    LedModule,
    LoadableModule.forRoot({
      moduleConfigs: [
        {
          name: 'jbd-2',
          load: () =>
            import('./blues-driver/blues-driver.component').then(
              m => m.BluesDriverModule
            )
        },
        {
          name: 'jch-1',
          load: () =>
            import('./cool-chorus/cool-chorus.component').then(
              m => m.CoolChorusModule
            )
        },
        {
          name: 'jds-1',
          load: () =>
            import('./ds-one/ds-one.component').then(m => m.DsOneModule)
        },
        {
          name: 'jcp-1',
          load: () =>
            import('./lemon-squeeze/lemon-squeeze.component').then(
              m => m.LemonSqueezeModule
            )
        },
        {
          name: 'js-bmf',
          load: () =>
            import('./massive-muff-pi/massive-muff-pi.component').then(
              m => m.MassiveMuffPiModule
            )
        },
        {
          name: 'jmt-2',
          load: () =>
            import('./metal-area/metal-area.component').then(
              m => m.MetalAreaModule
            )
        },
        {
          name: 'jod-3',
          load: () =>
            import('./overdrive/overdrive.component').then(
              m => m.OverdriveModule
            )
        },
        {
          name: 'jrv-6',
          load: () =>
            import('./reverb/reverb.component').then(m => m.ReverbModule)
        },
        {
          name: 'jtr-2',
          load: () =>
            import('./tremolo/tremolo.component').then(m => m.TremoloModule)
        },
        {
          name: 'jtu-3',
          load: () => import('./tuner/tuner.component').then(m => m.TunerModule)
        }
      ]
    }),
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
