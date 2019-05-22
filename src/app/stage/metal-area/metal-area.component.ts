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
import { Distortion, DistortionSettings } from '@audio/effects/distortion';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-metal-area',
  templateUrl: './metal-area.component.html',
  styleUrls: ['./metal-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetalAreaComponent implements OnInit, OnDestroy, PedalComponent<DistortionSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag)
  drag: CdkDrag;

  effect: Distortion;

  params: DistortionSettings = {
    level: 0.5,
    distortion: 0.7,
    tone: 0.55,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(this.manager.context, 'jmt-2', this.params, 'sustained')
      .withPreFilter(this.manager.context);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

