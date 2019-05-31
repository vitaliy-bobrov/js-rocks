import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  HostListener,
  ViewChild,
  ElementRef,
  OnInit,
  SimpleChanges,
  OnChanges } from '@angular/core';
import { clamp } from '../../utils';

@Component({
  selector: 'jsr-knob',
  templateUrl: './knob.component.html',
  styleUrls: ['./knob.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KnobComponent implements OnInit, OnChanges {
  @HostBinding('attr.tabindex')
  tabIndex = '0';

  @Input()
  label = 'Knob';

  @Input()
  labelPosition: 'top' | 'bottom' = 'bottom';

  @Input()
  min = 0;

  @Input()
  max = 1;

  @Input()
  step = 0.01;

  @Input()
  value = 0;

  @Output()
  valueChanged = new EventEmitter<number>();

  @ViewChild('control', { static: true })
  control: ElementRef;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.updateKnobPointer(clamp(this.min, this.max, this.value));
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes && !changes.value.firstChange) {
      this.updateKnobPointer(clamp(this.min, this.max, this.value));
    }
  }

  @HostListener('focus')
  onFocus() {
    this.control.nativeElement.focus();
  }

  onValueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = clamp(this.min, this.max, parseFloat(target.value));
    this.updateKnobPointer(value);
    this.valueChanged.emit(value);
  }

  private updateKnobPointer(value: number) {
    const percent = ((value - this.min)) / (this.max - this.min);
    const deg = Math.round(270 * percent - 135);

    this.element.nativeElement.style.setProperty('--knob-angle', `${deg}deg`);
  }
}
