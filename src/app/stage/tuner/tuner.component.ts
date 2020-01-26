import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { Tuner } from '@audio/effects/tuner/tuner';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { SevenSegmentLcdModule } from '../seven-segment-lcd/seven-segment-lcd.component';
import { StompboxModule } from '../stompbox/stompbox.component';

@Component({
  selector: 'jsr-tuner',
  templateUrl: './tuner.component.html',
  styleUrls: ['./tuner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunerComponent
  implements OnInit, OnDestroy, PedalComponent<Active> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  destroy$ = new Subject<void>();

  effect: Tuner;
  noteName$: Observable<string | null>;
  isSharp$: Observable<boolean>;
  isAccurate$: Observable<boolean>;
  isInaccurate$: Observable<boolean>;
  centsPosition$: Observable<string>;

  params: Active = {
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tuner(this.manager.context, this.info.id, this.params);
    this.manager.addEffect(this.effect);

    this.noteName$ = this.effect.note$.pipe(
      map(note => (note === null ? null : note.symbol[0]))
    );
    this.isSharp$ = this.effect.note$.pipe(
      map(note => (note === null ? false : note.symbol.length > 1))
    );
    this.isAccurate$ = this.effect.note$.pipe(
      map(note => (note === null ? false : Math.abs(note.cents) - 5 < 0))
    );
    this.isInaccurate$ = this.effect.note$.pipe(
      map(note => (note === null ? false : Math.abs(note.cents) - 5 >= 0))
    );
    this.centsPosition$ = this.effect.note$.pipe(
      map(note => {
        if (note === null || note.cents === 0 || Math.abs(note.cents) < 4) {
          return '0';
        }

        return `${Math.round(note.cents / 5) * 8}px`;
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [TunerComponent],
  bootstrap: [TunerComponent],
  imports: [
    CommonModule,
    DragDropModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    SevenSegmentLcdModule,
    StompboxModule
  ]
})
export class TunerModule {}
