import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  NgModule
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Point } from '@angular/cdk/drag-drop/drag-ref';
import {
  filter,
  switchMapTo,
  takeUntil,
  tap,
  debounceTime
} from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';

import { clamp, mapToMinMax, percentFromMinMax } from '@audio/utils';
import { ValueLabelPipe } from './value-label.pipe';

@Component({
  selector: 'jsr-knob',
  templateUrl: './knob.component.html',
  styleUrls: ['./knob.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KnobComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @HostBinding('attr.tabindex')
  tabIndex = '0';

  /**
   * Label used for the knob.
   */
  @Input()
  label = 'Knob';

  /**
   * Label position - 'top' or 'bottom'.
   */
  @Input()
  labelPosition: 'top' | 'bottom' = 'bottom';

  /**
   * Units used for value in tooltip.
   */
  @Input()
  units = '';

  /**
   * Whether tooltip should show +/- sign for value.
   */
  @Input()
  showValueSign = false;

  /**
   * Minimum value.
   */
  @Input()
  min = 0;

  /**
   * Maximum value.
   */
  @Input()
  max = 1;

  /**
   * Value change step.
   */
  @Input()
  step = 0.01;

  /**
   * Knob value.
   */
  @Input()
  value = 0;

  /**
   * Minimum value knob degree [0, 360].
   */
  @Input()
  startDegree = -135;

  /**
   * Maximum value knob degree [0, 360].
   */
  @Input()
  endDegree = 135;

  @Output()
  valueChanged = new EventEmitter<number>();

  @ViewChild('control', { static: true })
  control: ElementRef;

  @ViewChild('knob', { static: true })
  knob: ElementRef;

  private destroy$ = new Subject<void>();
  private lashUpdate = 0;
  private center: Point;

  constructor(
    private element: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.updateKnobPosition = this.updateKnobPosition.bind(this);
    this.rotateHandler = this.rotateHandler.bind(this);
  }

  ngOnInit() {
    this.updateKnobPointer(clamp(this.min, this.max, this.value));
  }

  ngAfterViewInit() {
    const mousedown$ = fromEvent<MouseEvent>(
      this.knob.nativeElement,
      'mousedown'
    );
    const mousemove$ = fromEvent<MouseEvent>(this.document, 'mousemove');
    const mouseup$ = fromEvent<MouseEvent>(this.document, 'mouseup');

    mousedown$
      .pipe(
        // Only handling clicks with the left mouse button.
        filter(event => event.button === 0),
        tap(this.updateKnobPosition),
        switchMapTo(
          mousemove$.pipe(tap(this.rotateHandler), takeUntil(mouseup$))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // Check for touch capabilities.
    if (this.document.defaultView.window.navigator.maxTouchPoints) {
      const touchstart$ = fromEvent<MouseEvent>(
        this.knob.nativeElement,
        'touchstart'
      );
      const touchmove$ = fromEvent<MouseEvent>(this.document, 'touchmove');
      const touchend$ = fromEvent<MouseEvent>(this.document, 'touchend');

      touchstart$
        .pipe(
          tap(this.updateKnobPosition),
          switchMapTo(
            touchmove$.pipe(
              debounceTime(50),
              tap(this.rotateHandler),
              takeUntil(touchend$)
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes && !changes.value.firstChange) {
      this.updateKnobPointer(clamp(this.min, this.max, this.value));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  @HostListener('focus')
  onFocus() {
    this.control.nativeElement.focus();
  }

  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    // TODO: Debounce with RxJS.
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

  updateKnobPosition(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();

    const knobRect = this.knob.nativeElement.getBoundingClientRect();

    this.center = {
      x: window.scrollX + knobRect.left + knobRect.width / 2,
      y: window.scrollY + knobRect.top + knobRect.height / 2
    };
  }

  rotateHandler(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();

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

  onValueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateValue(parseFloat(target.value));
  }

  private updateKnobPointer(value: number) {
    const percent = percentFromMinMax(value, this.min, this.max);
    const deg = Math.round(
      (this.endDegree - this.startDegree) * percent + this.startDegree
    );
    // TODO: Use angular [style.--css-var] template binding.
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

@NgModule({
  declarations: [KnobComponent, ValueLabelPipe],
  imports: [CommonModule, MatTooltipModule],
  exports: [KnobComponent, ValueLabelPipe]
})
export class KnobModule {}
