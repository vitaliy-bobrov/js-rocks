import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
  HostBinding,
  ViewChild
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
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

  params: Active = {
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tuner(this.manager.context, 'jtu-3', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}
