import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostBinding } from '@angular/core';
import { Distortion, DistortionSettings } from '@audio/effects/distortion';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-overdrive',
  templateUrl: './overdrive.component.html',
  styleUrls: ['./overdrive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverdriveComponent implements OnInit, OnDestroy, PedalComponent {
  @HostBinding('class.pedal')
  pedalClass = true;

  effect: Distortion;

  defaults: DistortionSettings = {
    level: 0.75,
    distortion: 0.85,
    tone: 0.35,
    oversample: '2x'
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(this.manager.context, this.defaults, 'driver');
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.effect.dispose();
  }
}
