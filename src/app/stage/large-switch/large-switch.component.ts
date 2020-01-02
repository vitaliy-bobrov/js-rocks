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
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'jsr-large-switch',
  templateUrl: './large-switch.component.html',
  styleUrls: ['./large-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LargeSwitchComponent {
  @HostBinding('attr.tabindex')
  tabIndex = '0';

  @Input()
  name = 'Effect';

  @Input()
  model = 'JE-0';

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
  declarations: [LargeSwitchComponent],
  imports: [MatIconModule],
  exports: [LargeSwitchComponent]
})
export class LargeSwitchModule {}
