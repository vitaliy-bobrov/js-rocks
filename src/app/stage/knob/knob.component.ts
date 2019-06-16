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

  private lashWheelUpdate = 0;

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

  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    event.stopPropagation();
    event.preventDefault();

    const currentTime = performance.now();
    // Limit updates to 100ms.
    if (currentTime - this.lashWheelUpdate < 100) {
      return;
    }

    this.lashWheelUpdate = currentTime;
    const currentValue = parseFloat(this.control.nativeElement.value);
    const direction = event.deltaY < 0 ? -1 : 1;
    const updatedValue = parseFloat((currentValue + direction * this.step).toFixed(2));

    this.updateValue(updatedValue);
  }

  onValueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateValue(parseFloat(target.value));
  }

  private updateKnobPointer(value: number) {
    const percent = ((value - this.min)) / (this.max - this.min);
    const deg = Math.round(270 * percent - 135);

    this.element.nativeElement.style.setProperty('--knob-angle', `${deg}deg`);
  }

  private updateValue(value: number) {
    const clamped = clamp(this.min, this.max, value);
    this.updateKnobPointer(clamped);
    this.valueChanged.emit(clamped);
  }
}
