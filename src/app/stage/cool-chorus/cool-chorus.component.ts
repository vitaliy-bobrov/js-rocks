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
import { Chorus, ChorusSettings } from '@audio/effects/chorus';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-cool-chorus',
  templateUrl: './cool-chorus.component.html',
  styleUrls: ['./cool-chorus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoolChorusComponent implements OnInit, OnDestroy, PedalComponent<ChorusSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Chorus;

  params: ChorusSettings = {
    level: 1,
    eq: 0.5,
    rate: 0.5,
    depth: 0.5,
    feedback: 0.4,
    delay: 0.0045,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Chorus(this.manager.context, 'jch-1', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

