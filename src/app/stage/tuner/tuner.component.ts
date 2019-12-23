import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PedalComponent } from '../pedal.interface';
import { Active } from '@audio/interfaces/active.interface';
import { Tuner } from '@audio/effects/tuner/tuner';
import { AudioContextManager } from '@audio/audio-context-manager.service';

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

  effect: Tuner;
  noteName$: Observable<string | null>;
  isSharp$: Observable<boolean>;
  isAccurate$: Observable<boolean>;
  isInaccurate$: Observable<boolean>;
  centsPosition$: Observable<string>;

  params: Active = {
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tuner(this.manager.context, 'jtu-3', this.params);
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
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}
