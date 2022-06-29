import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { PortalModule } from '@angular/cdk/portal';
import { NgsgModule } from 'ng-sortgrid';

import { AudioModule } from '@audio/audio.module';
import { SharedModule } from '@shared/shared.module';
import { StageRoutingModule } from './stage-routing.module';
import { AmpComponent } from './amp/amp.component';
import { KnobModule } from './knob/knob.component';
import { LedModule } from './led/led.component';
import { PageActionsComponent } from './page-actions/page-actions.component';
import { PresetNameDialogComponent } from './preset-name-dialog/preset-name-dialog.component';
import { StageComponent } from './stage/stage.component';
import { PickByPropPipe } from './stage/pick-by-prop.pipe';
import { LoadableModule } from 'ngx-loadable';
import { NavConfigurationsComponent } from './nav-configurations/nav-configurations.component';

@NgModule({
  declarations: [
    AmpComponent,
    PageActionsComponent,
    PresetNameDialogComponent,
    StageComponent,
    PickByPropPipe,
    NavConfigurationsComponent
  ],
  imports: [
    A11yModule,
    AudioModule,
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
          name: 'js-phase-pi-by-2',
          load: () =>
            import('./phase-pi-by-two/phase-pi-by-two.component').then(
              m => m.PhasePiByTwoModule
            )
        },
        {
          name: 'jdm-2',
          load: () => import('./delay/delay.component').then(m => m.DelayModule)
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
          name: 'soft-yellow-tremolo',
          load: () =>
            import('./soft-yellow-tremolo/soft-yellow-tremolo.component').then(
              m => m.SoftYellowTremoloModule
            )
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
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    NgsgModule,
    PortalModule,
    SharedModule,
    StageRoutingModule
  ]
})
export class StageModule {}
