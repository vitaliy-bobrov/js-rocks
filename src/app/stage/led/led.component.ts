import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  NgModule
} from '@angular/core';

@Component({
  selector: 'jsr-led',
  template: '',
  styleUrls: ['./led.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LedComponent {
  @Input()
  @HostBinding('class.active')
  active = false;
}

@NgModule({
  declarations: [LedComponent],
  exports: [LedComponent]
})
export class LedModule {}
