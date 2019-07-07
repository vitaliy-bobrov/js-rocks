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
  selector: 'jsr-blues-driver',
  templateUrl: './blues-driver.component.html',
  styleUrls: ['./blues-driver.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BluesDriverComponent implements OnInit, OnDestroy, PedalComponent<DistortionSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Distortion;

  params: DistortionSettings = {
    level: 0.5,
    distortion: 0.4,
    tone: 0.2,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(
      this.manager.context,
      'jbd-2',
      this.params,
      {
        curveType: 'blues'
      }
    );
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

