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
  OnChanges
} from '@angular/core';
import { clamp, mapToMinMax, percentFromMinMax } from '@shared/utils';
import { Point } from '@angular/cdk/drag-drop/typings/drag-ref';

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
  units = '';

  @Input()
  showValueSign = false;

  @Input()
  min = 0;

  @Input()
  max = 1;

  @Input()
  step = 0.01;

  @Input()
  value = 0;

  @Input()
  startDegree = -135;

  @Input()
  endDegree = 135;

  @Output()
  valueChanged = new EventEmitter<number>();

  @ViewChild('control', { static: true })
  control: ElementRef;

  @ViewChild('knob', { static: true })
  knob: ElementRef;

  private lashUpdate = 0;
  private center: Point;

  constructor(private element: ElementRef) {
    this.rotateHandler = this.rotateHandler.bind(this);
    this.removeRotateListener = this.removeRotateListener.bind(this);
  }

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
    if (currentTime - this.lashUpdate < 100) {
      return;
    }

    this.lashUpdate = currentTime;
    const currentValue = parseFloat(this.control.nativeElement.value);
    const direction = event.deltaY < 0 ? -1 : 1;
    const updatedValue = parseFloat(
      (currentValue + direction * this.step).toFixed(2)
    );

    this.updateValue(updatedValue);
  }

  addRotateListener(event: MouseEvent | TouchEvent) {
    // Only handling clicks with the left mouse button.
    if (event.type === 'mousedown' && (event as MouseEvent).button !== 0) {
      return;
    }

    const isTouch = event.type === 'touchstart';
    const updateEvent = isTouch ? 'touchmove' : 'mousemove';
    const endEvent = isTouch ? 'touchend' : 'mouseup';

    event.stopPropagation();
    event.preventDefault();

    const knobRect = this.knob.nativeElement.getBoundingClientRect();

    this.center = {
      x: window.scrollX + knobRect.left + knobRect.width / 2,
      y: window.scrollY + knobRect.top + knobRect.height / 2
    };

    this.knob.nativeElement.addEventListener(updateEvent, this.rotateHandler);
    document.addEventListener(endEvent, this.removeRotateListener);
  }

  rotateHandler(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();

    const currentTime = performance.now();
    // Limit updates to 100ms.
    if (currentTime - this.lashUpdate < 100) {
      return;
    }

    this.lashUpdate = currentTime;

    const isTouch = event.type === 'touchmove';
    const pageX = isTouch
      ? (event as TouchEvent).touches[0].pageX
      : (event as MouseEvent).pageX;
    const pageY = isTouch
      ? (event as TouchEvent).touches[0].pageY
      : (event as MouseEvent).pageY;
    const x = this.center.x - pageX;
    const y = this.center.y - pageY;
    let deg = Math.round((Math.atan2(y, x) * 180) / Math.PI);

    if (deg < 0) {
      deg += 360;
    }

    deg -= 90;

    if (x > 0 && y <= 0) {
      deg -= 360;
    }

    deg = clamp(this.startDegree, this.endDegree, deg);
    const percent = percentFromMinMax(deg, this.startDegree, this.endDegree);
    const value = mapToMinMax(percent, this.min, this.max);

    this.updateValue(value);
  }

  removeRotateListener(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();

    const isTouch = event.type === 'touchend';
    const updateEvent = isTouch ? 'touchmove' : 'mousemove';
    const endEvent = isTouch ? 'touchend' : 'mouseup';

    this.knob.nativeElement.removeEventListener(
      updateEvent,
      this.rotateHandler
    );
    document.removeEventListener(endEvent, this.removeRotateListener);
  }

  onValueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateValue(parseFloat(target.value));
  }

  private updateKnobPointer(value: number) {
    const percent = percentFromMinMax(value, this.min, this.max);
    const deg = Math.round(
      (this.endDegree - this.startDegree) * percent + this.startDegree
    );

    this.element.nativeElement.style.setProperty('--knob-angle', `${deg}deg`);
  }

  private updateValue(value: number) {
    const clamped = clamp(this.min, this.max, value);
    const updated = Math.round(clamped / this.step) * this.step;
    const rounded = Math.round(updated * 100) / 100;
    this.updateKnobPointer(rounded);
    this.valueChanged.emit(rounded);
  }
}
