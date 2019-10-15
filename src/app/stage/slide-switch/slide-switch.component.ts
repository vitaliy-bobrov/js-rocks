import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  Output,
  EventEmitter,
  ViewChildren,
  ElementRef,
  HostListener,
  QueryList } from '@angular/core';

export interface SwitchOption {
  label: string;
  value: string;
}

@Component({
  selector: 'jsr-slide-switch',
  templateUrl: './slide-switch.component.html',
  styleUrls: ['./slide-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideSwitchComponent {
  @HostBinding('attr.tabindex')
  tabIndex = '0';

  @Input()
  options: SwitchOption[];

  @Input()
  group: string;

  @Input()
  value: string;

  @Output()
  valueChanged = new EventEmitter<string>();

  @ViewChildren('control')
  controls: QueryList<ElementRef>;

  @HostListener('focus')
  onFocus() {
    if (!this.controls.length) {
      return;
    }

    const index = this.selectedIndex();
    this.controls.toArray()[index].nativeElement.focus();
  }

  @HostListener('keyup.arrowup')
  selectPrev() {
    const currentIndex = this.selectedIndex();

    if (currentIndex > 0) {
      const value = this.options[currentIndex - 1].value;
      this.valueChanged.emit(value);
    }
  }

  @HostListener('keyup.arrowdown')
  selectNext() {
    const currentIndex = this.selectedIndex();

    if (currentIndex < this.options.length - 1) {
      const value = this.options[currentIndex + 1].value;
      this.valueChanged.emit(value);
    }
  }

  private selectedIndex(): number {
    return this.value ? this.options
      .findIndex((option) => option.value === this.value) : 0;
  }
}
