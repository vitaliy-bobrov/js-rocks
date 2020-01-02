import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgModule,
  Output,
  ViewChild
} from '@angular/core';

import { LedModule } from '../led/led.component';

@Component({
  selector: 'jsr-small-switch',
  templateUrl: './small-switch.component.html',
  styleUrls: ['./small-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallSwitchComponent {
  @HostBinding('attr.tabindex')
  tabIndex = '0';

  @Input()
  active = false;

  @Output()
  switch = new EventEmitter<void>();

  @ViewChild('control', { static: true })
  control: ElementRef;

  @HostListener('focus')
  onFocus() {
    this.control.nativeElement.focus();
  }
}

@NgModule({
  declarations: [SmallSwitchComponent],
  imports: [LedModule],
  exports: [SmallSwitchComponent]
})
export class SmallSwitchModule {}
