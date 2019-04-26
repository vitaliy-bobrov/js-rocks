import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostListener,
  HostBinding,
  ViewChild,
  ElementRef } from '@angular/core';

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

  @Output()
  switch = new EventEmitter<void>();

  @ViewChild('control')
  control: ElementRef;

  @HostListener('focus')
  onFocus() {
    this.control.nativeElement.focus();
  }
}
