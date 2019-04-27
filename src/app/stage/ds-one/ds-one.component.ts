import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostBinding } from '@angular/core';
import { Distortion, DistortionSettings } from '@audio/effects/distortion';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-ds-one',
  templateUrl: './ds-one.component.html',
  styleUrls: ['./ds-one.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DsOneComponent implements OnInit, OnDestroy, PedalComponent<DistortionSettings> {
  @HostBinding('class.pedal')
  pedalClass = true;

  effect: Distortion;

  params: DistortionSettings = {
    level: 0.5,
    distortion: 0.6,
    tone: 0.4,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(this.manager.context, this.params, 'sunshine', 'jds-1')
      .withPreFilter(this.manager.context);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}
