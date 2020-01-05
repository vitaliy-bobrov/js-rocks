import { Component, ChangeDetectionStrategy, NgModule } from '@angular/core';

@Component({
  selector: 'jsr-three-knob-layout',
  template: '<ng-content></ng-content>',
  styleUrls: ['./three-knob-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreeKnobLayoutComponent {}

@NgModule({
  declarations: [ThreeKnobLayoutComponent],
  exports: [ThreeKnobLayoutComponent]
})
export class ThreeKnobLayoutModule {}
