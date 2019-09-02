import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
  HostBinding,
  ViewChild } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Tremolo, TremoloSettings } from '@audio/effects/tremolo';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-tremolo',
  templateUrl: './tremolo.component.html',
  styleUrls: ['./tremolo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TremoloComponent implements OnInit, OnDestroy, PedalComponent<TremoloSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Tremolo;

  params: TremoloSettings = {
    rate: 0.5,
    depth: 0.5,
    type: 'triangle',
    wave: 0.5,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Tremolo(
      this.manager.context,
      'jtr-2',
      this.params
    );
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

