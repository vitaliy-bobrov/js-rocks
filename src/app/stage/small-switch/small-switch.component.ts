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

